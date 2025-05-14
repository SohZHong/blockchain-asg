import { chain, managerAddress } from "@/common/constants";
import { NextResponse } from "next/server";

const {
  ENGINE_URL,
  NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS,
  THIRDWEB_SECRET_KEY,
} = process.env;

export const POST = async (request: Request) => {
  const {
    address,
    opponent,
    player1MinDmg,
    player1MaxDmg,
    player2MinDmg,
    player2MaxDmg,
  } = await request.json();

  if (
    !ENGINE_URL ||
    !NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS ||
    !THIRDWEB_SECRET_KEY
  )
    return NextResponse.json(
      { message: "Missing Environment variables" },
      { status: 500 }
    );
  const body = JSON.stringify({
    functionName:
      "function startBattle(address _opponent, uint256 _player1MinDmg, uint256 _player1MaxDmg, uint256 _player2MinDmg, uint256 _player2MaxDmg)",
    args: [
      opponent,
      player1MinDmg,
      player1MaxDmg,
      player2MinDmg,
      player2MaxDmg,
    ],
    txOverrides: {
      gas: "530000",
      gasPrice: "50000000000",
      maxFeePerGas: "50000000000",
      maxPriorityFeePerGas: "50000000000",
      timeoutSeconds: 7200,
    },
    abi: [
      {
        inputs: [
          { internalType: "address", name: "_opponent", type: "address" },
          {
            internalType: "uint256",
            name: "_player1MinDmg",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_player1MaxDmg",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_player2MinDmg",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_player2MaxDmg",
            type: "uint256",
          },
        ],
        name: "startBattle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  });
  const response = await fetch(
    `${ENGINE_URL}/contract/${chain.id}/${managerAddress}/write`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${THIRDWEB_SECRET_KEY}`,
        chain: chain.id.toString(),
        contractAddress: managerAddress,
        "x-account-address": address,
        "x-backend-wallet-address": NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS,
      },
      body,
    }
  );
  if (response.ok) {
    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: JSON.stringify(data, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
    });
  } else {
    return NextResponse.json({
      success: false,
      data: null,
    });
  }
};
