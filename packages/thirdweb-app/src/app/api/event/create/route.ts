import {
  chain,
  eventFactoryAddress,
  organiserAddress,
} from "@/common/constants";
import { NextResponse } from "next/server";

const {
  ENGINE_URL,
  NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS,
  THIRDWEB_SECRET_KEY,
} = process.env;

export const POST = async (request: Request) => {
  const {
    address,
    name,
    description,
    location,
    participantLimit,
    startDate,
    rewardCount,
    baseUri,
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
      "function createEvent(string _name, string _description, string _location, uint256 _participantLimit, uint256 _startDate, uint256 _rewardCount, string _baseUri)",
    args: [
      name,
      description,
      location,
      participantLimit,
      startDate,
      rewardCount,
      baseUri,
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
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_description",
            type: "string",
          },
          {
            internalType: "string",
            name: "_location",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_participantLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_startDate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_rewardCount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_baseUri",
            type: "string",
          },
        ],
        name: "createEvent",
        outputs: [
          {
            internalType: "address",
            name: "eventContract",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  });
  const response = await fetch(
    `${ENGINE_URL}/contract/${chain.id}/${eventFactoryAddress}/write`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${THIRDWEB_SECRET_KEY}`,
        chain: chain.id.toString(),
        contractAddress: eventFactoryAddress,
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
