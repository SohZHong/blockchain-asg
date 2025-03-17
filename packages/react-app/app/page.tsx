'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import type { SendTransactionParameters } from '@wagmi/core';
import { useAAProvider } from '@/hooks/useAAProvider';
import useMultiBaas from '@/hooks/useMultiBaas';
import { Button, Description, Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';
import { utils } from 'ethers';
import { Paymaster } from '@/lib/Paymaster';
interface PlayerStats {
  address: `0x${string}`;
  hp: number;
  minDmg: number;
  maxDmg: number;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();
  const [opponent, setOpponent] = useState<PlayerStats>({
    address: '0x',
    hp: 100,
    minDmg: 0,
    maxDmg: 0,
  });
  const { address, isConnected } = useAccount();
  const { aaWallet } = useAAProvider();
  const {
    getBattleCounter,
    attack,
    startBattle,
    getHp,
    getBattle,
    getAttackEvents,
    getBattleStartedEvents,
    getBattleEndedEvents,
  } = useMultiBaas();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  console.log(aaWallet);
  const sendUserOp = async (tx: SendTransactionParameters) => {
    if (!aaWallet) throw new Error('AA Wallet not initialized');
    // const payMaster = new Paymaster([aaWallet.accountAddress!]);

    // const txValue = tx.value ? BigInt(tx.value.toString()) : BigInt(0);

    // Construct the UserOperation
    const userOp = await aaWallet.createSignedUserOp({
      target: tx.to!,
      // value: tx.value!.toString(),
      data: tx.data!, // Encoded function call
    });

    console.log('Unsigned UserOperation:', userOp);

    // Get Paymaster signature & attach paymasterAndData
    // userOp.paymasterAndData = await payMaster.getPaymasterAndData(userOp);

    // Send the UserOperation to the bundler
    const userOpHash = await aaWallet.signUserOp(userOp);

    console.log('UserOperation Hash:', userOpHash);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOpponent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGameStart = async () => {
    const { address, hp, minDmg, maxDmg } = opponent;
    if (!utils.isAddress(address)) {
      alert('Invalid Ethereum address!');
      return;
    }

    const minDamage = Number(minDmg);
    const maxDamage = Number(maxDmg);

    if (minDamage > maxDamage) {
      alert('Invalid maximum damage values');
      return;
    }

    if (minDamage <= 0 || maxDamage <= 0) {
      alert('Damage values must be greater than zero.');
      return;
    }

    // Create unsigned transaction for this function
    const res = await startBattle(
      address,
      1,
      10,
      Number(minDmg),
      Number(maxDmg)
    );
    sendUserOp(res);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h1">
        There you go... a canvas for your next Celo project!
      </div>
      {isConnected ? (
        <React.Fragment>
          <div className="h2 text-center">Your address: {address}</div>
          <div className="flex flex-col">
            <Field>
              <Label className="text-sm/6 font-medium text-black">
                Opponent
              </Label>
              <Description className="text-sm/6 text-black/50">
                Your opponent's wallet address
              </Description>
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25'
                )}
                autoComplete="true"
                name="address"
                type="text"
                value={opponent.address}
                onChange={handleInputChange}
              />
            </Field>
            <Field>
              <Label className="text-sm/6 font-medium text-black">
                Minimum Damage
              </Label>
              <Description className="text-sm/6 text-black/50">
                Your opponent's minimum damage
              </Description>
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25'
                )}
                name="minDmg"
                type="number"
                value={opponent.minDmg}
                onChange={handleInputChange}
              />
            </Field>
            <Field>
              <Label className="text-sm/6 font-medium text-black">
                Maximum Damage
              </Label>
              <Description className="text-sm/6 text-black/50">
                Your opponent's maximum damage
              </Description>
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25'
                )}
                name="maxDmg"
                type="number"
                value={opponent.maxDmg}
                onChange={handleInputChange}
              />
            </Field>
            <Button onClick={handleGameStart}>Start Game</Button>
          </div>
        </React.Fragment>
      ) : (
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
