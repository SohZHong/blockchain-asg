import { celoPaymaster } from '@/common/abi/CeloPaymaster';
import { PAYMASTER_ADDRESS, PAYMASTER_OWNER_KEY } from '@/common/constants';
import { wagmiConfig } from '@/services/wagmi/wagmiConfig';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { readContract } from '@wagmi/core';
import {
  Address,
  encodeAbiParameters,
  keccak256,
  concatHex,
  WalletClient,
} from 'viem';
import { signMessage } from 'viem/accounts';

export class Paymaster extends PaymasterAPI {
  private allowlist: string[];
  private walletClient: WalletClient | null = null;

  private paymasterContract = {
    address: PAYMASTER_ADDRESS,
    abi: celoPaymaster,
  } as const;

  constructor(allowlist: string[]) {
    super();
    this.allowlist = allowlist;
  }

  /**
   * Get the nonce for the UserOperation from Paymaster
   */
  async getSenderNonce(address: string): Promise<bigint> {
    const nonce = await readContract(wagmiConfig, {
      ...this.paymasterContract,
      functionName: 'senderNonce',
      args: [address as Address],
    });

    return nonce;
  }

  /**
   * Get the paymasterAndData for a UserOperation
   */
  async getPaymasterAndData(userOp: UserOperationStruct): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call init() first.');
    }

    if (!this.allowlist.includes(userOp.sender as Address)) {
      throw new Error('Sender not allowlisted');
    }
    // Initialize signer from private key
    const privateKey = PAYMASTER_OWNER_KEY as `0x${string}`;

    if (!privateKey) throw new Error('PAYMASTER_SIGNER_KEY not provided');

    // Set validity time (10 minutes from now)
    const validUntil = BigInt(Math.floor(Date.now() / 1000) + 10 * 60);
    const validAfter = BigInt(0);

    // Generate the hash for signing
    const nonce = await this.getSenderNonce(userOp.sender as Address);
    const userOpHash = keccak256(
      encodeAbiParameters(
        [
          { name: 'w', type: 'address' },
          { name: 'x', type: 'uint' },
          { name: 'y', type: 'uint' },
          { name: 'z', type: 'uint256' },
        ],
        [PAYMASTER_ADDRESS as Address, validUntil, validAfter, nonce]
      )
    );

    // Sign the message
    const signature = await signMessage({ message: userOpHash, privateKey });

    // Encode paymasterAndData
    const paymasterAndData = concatHex([
      PAYMASTER_ADDRESS as Address,
      encodeAbiParameters(
        [
          { name: 'x', type: 'uint' },
          { name: 'y', type: 'uint' },
        ],
        [validUntil, validAfter]
      ),
      signature,
    ]);

    return paymasterAndData;
  }
}
