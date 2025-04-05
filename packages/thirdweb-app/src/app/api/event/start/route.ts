import { chain } from "@/common/constants";
import { NextResponse } from "next/server";

const {
  ENGINE_URL,
  NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS,
  THIRDWEB_SECRET_KEY,
} = process.env;

export const POST = async (request: Request) => {
  const { eventAddress, address } = await request.json();

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
    functionName: "function startEvent()",
    args: [],
    txOverrides: {
      gas: "530000",
      gasPrice: "50000000000",
      maxFeePerGas: "50000000000",
      maxPriorityFeePerGas: "50000000000",
      timeoutSeconds: 7200,
    },
    abi: [
      {
        inputs: [],
        name: "startEvent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  });
  const response = await fetch(
    `${ENGINE_URL}/contract/${chain.id}/${eventAddress}/write`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${THIRDWEB_SECRET_KEY}`,
        chain: chain.id.toString(),
        contractAddress: eventAddress,
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
