// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/* solhint-disable reason-string */
/* solhint-disable no-inline-assembly */

import '@account-abstraction/contracts/core/BasePaymaster.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol';

/**
 * A sample paymaster that uses external service to decide whether to pay for the UserOp.
 * The paymaster trusts an external signer to sign the transaction.
 * The calling user must pass the UserOp to that external signer first, which performs
 * whatever off-chain verification before signing the UserOp.
 * Note that this signature is NOT a replacement for the account-specific signature:
 * - the paymaster checks a signature to agree to PAY for GAS.
 * - the account checks a signature to prove identity and account ownership.
 */
contract CeloPaymaster is BasePaymaster {
  using ECDSA for bytes32;
  using UserOperationLib for PackedUserOperation;

  address public verifyingSigner;

  uint256 private constant VALID_TIMESTAMP_OFFSET = 20;

  uint256 private constant SIGNATURE_OFFSET = 84;

  bytes32 private constant TYPE_HASH =
    keccak256(
      'UserOp(bytes userOp,uint256 chainId,address paymaster,uint256 nonce,uint48 validUntil,uint48 validAfter)'
    );

  event VerifyingSignerUpdated(address newSigner);

  constructor(
    IEntryPoint _entryPoint,
    address _verifyingSigner
  ) BasePaymaster(_entryPoint) {
    verifyingSigner = _verifyingSigner;
  }

  mapping(address => uint256) public senderNonce;

  function setVerifyingSigner(address _newSigner) external onlyOwner {
    require(_newSigner != address(0), 'Invalid signer');
    verifyingSigner = _newSigner;
    emit VerifyingSignerUpdated(_newSigner);
  }

  function pack(
    PackedUserOperation calldata userOp
  ) public pure returns (bytes memory ret) {
    // lighter signature scheme. must match UserOp.ts#packUserOp
    bytes calldata pnd = userOp.paymasterAndData;
    // copy directly the userOp from calldata up to (but not including) the paymasterAndData.
    // this encoding depends on the ABI encoding of calldata, but is much lighter to copy
    // than referencing each field separately.
    assembly {
      let ofs := userOp
      let len := sub(sub(pnd.offset, ofs), 32)
      ret := mload(0x40)
      mstore(0x40, add(ret, add(len, 32)))
      mstore(ret, len)
      calldatacopy(add(ret, 32), ofs, len)
    }
  }

  function packValidationData(
    bool sigFailed,
    uint48 validUntil,
    uint48 validAfter
  ) internal pure returns (uint256) {
    return (uint256(sigFailed ? 1 : 0) |
      (uint256(validUntil) << 160) |
      (uint256(validAfter) << 208));
  }

  /**
   * return the hash we're going to sign off-chain (and validate on-chain)
   * this method is called by the off-chain service, to sign the request.
   * it is called on-chain from the validatePaymasterUserOp, to validate the signature.
   * note that this signature covers all fields of the PackedUserOperation, except the "paymasterAndData",
   * which will carry the signature itself.
   */
  function getTypedDataHash(
    PackedUserOperation calldata userOp,
    uint48 validUntil,
    uint48 validAfter
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encode(
          TYPE_HASH,
          keccak256(pack(userOp)),
          block.chainid,
          address(this),
          senderNonce[userOp.getSender()],
          validUntil,
          validAfter
        )
      );
  }

  /**
   * verify our external signer signed this request.
   * the "paymasterAndData" is expected to be the paymaster and a signature over the entire request params
   * paymasterAndData[:20] : address(this)
   * paymasterAndData[20:84] : abi.encode(validUntil, validAfter)
   * paymasterAndData[84:] : signature
   */
  function _validatePaymasterUserOp(
    PackedUserOperation calldata userOp,
    bytes32 /*userOpHash*/,
    uint256 requiredPreFund
  ) internal override returns (bytes memory context, uint256 validationData) {
    (requiredPreFund);

    (
      uint48 validUntil,
      uint48 validAfter,
      bytes calldata signature
    ) = parsePaymasterAndData(userOp.paymasterAndData);
    //ECDSA library supports both 64 and 65-byte long signatures.
    // we only "require" it here so that the revert reason on invalid signature will be of "VerifyingPaymaster", and not "ECDSA"
    require(
      signature.length == 64 || signature.length == 65,
      'VerifyingPaymaster: invalid signature length in paymasterAndData'
    );
    bytes32 hash = MessageHashUtils.toEthSignedMessageHash(
      getTypedDataHash(userOp, validUntil, validAfter)
    );
    require(
      userOp.nonce == senderNonce[userOp.getSender()] + 1,
      'Invalid nonce'
    );
    senderNonce[userOp.getSender()] = userOp.nonce;

    //don't revert on signature failure: return SIG_VALIDATION_FAILED
    if (verifyingSigner != ECDSA.recover(hash, signature)) {
      return ('', packValidationData(true, validUntil, validAfter));
    }

    //no need for other on-chain validation: entire UserOp should have been checked
    // by the external service prior to signing it.
    return ('', packValidationData(false, validUntil, validAfter));
  }

  function parsePaymasterAndData(
    bytes calldata paymasterAndData
  )
    public
    pure
    returns (uint48 validUntil, uint48 validAfter, bytes calldata signature)
  {
    (validUntil, validAfter) = abi.decode(
      paymasterAndData[VALID_TIMESTAMP_OFFSET:SIGNATURE_OFFSET],
      (uint48, uint48)
    );
    signature = paymasterAndData[SIGNATURE_OFFSET:];
  }
}
