"use client";

import ThirdWebConnectButton from "@/components/ThirdWebConnectButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  addSessionKey,
  getAllActiveSigners,
} from "thirdweb/extensions/erc4337";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { TransactionButton } from "thirdweb/react";
import Link from "next/link";

export default function Home() {
  const FormSchema = z
    .object({
      opponent: z
        .string()
        .startsWith("0x", { message: "Address must start with 0x" })
        .regex(/^0x[a-fA-F0-9]{40}$/, {
          message: "Invalid Ethereum address",
        }),

      minDmg: z.coerce
        .number()
        .min(1, { message: "Minimum Damage cannot be negative" }),
      maxDmg: z.coerce
        .number()
        .min(1, { message: "Maximum Damage cannot be negative" }),
    })
    .refine((data) => data.minDmg <= data.maxDmg, {
      message: "minDmg should not be greater than maxDmg",
      path: ["minDmg"], // This will attach the error to the minDmg field
    });

  // const { attack, startBattle } = useMultiBaasWithThirdweb();
  const { account, smartWallet, sessionKeyOptions } = useThirdWeb();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      opponent: "0x",
      minDmg: 0,
      maxDmg: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // const unsignedTx = await startBattle(
    //   data.opponent as `0x${string}`,
    //   1,
    //   5,
    //   data.minDmg,
    //   data.maxDmg
    // );
    // const tx = prepareContractCall({
    //   contract: managerContract,
    //   method: "startBattle",
    //   params: [data.opponent, 1n, 5n, BigInt(data.minDmg), BigInt(data.maxDmg)],
    // });
    try {
      const response = await fetch("/api/start-battle", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          opponent: data.opponent,
          player1MinDmg: 1,
          player1MaxDmg: 3,
          player2MinDmg: data.minDmg,
          player2MaxDmg: data.maxDmg,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast("Battle Started", {
          description: JSON.stringify(res, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          ),
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      } else {
        toast("Error Starting Battle", {
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getSigners = async () => {
    if (!smartWallet) return;
    const res = await getAllActiveSigners({
      contract: smartWallet,
    });
    console.log(res);
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex flex-col items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <div className="flex justify-center mb-20">
          <ThirdWebConnectButton />
          {account && <Button onClick={() => getSigners()}>Signers</Button>}
          {sessionKeyOptions ? (
            <TransactionButton
              transaction={() => addSessionKey(sessionKeyOptions)}
              onTransactionConfirmed={(tx) => {
                toast("Session Key Added", {
                  description: JSON.stringify(tx, (key, value) =>
                    typeof value === "bigint" ? value.toString() : value
                  ),
                  action: {
                    label: "Close",
                    onClick: () => console.log("Closed"),
                  },
                });
              }}
              onError={(err) => {
                toast("Error adding session key", {
                  description: err.message,
                  action: {
                    label: "Close",
                    onClick: () => console.log("Closed"),
                  },
                });
              }}
            >
              Add Session Key
            </TransactionButton>
          ) : (
            <p className="text-gray-500">
              Waiting for session key configuration...
            </p>
          )}
        </div>
        {account && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="opponent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opponent</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Opponent"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your opponent's wallet address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minDmg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Damage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Minimum Damage"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your opponent's minimum damage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxDmg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Damage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Maximum Damage"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your opponent's maximum damage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        )}
      </div>
      <nav>
        <Link href={"organiser"}>Go to Organiser Page</Link>
      </nav>
    </main>
  );
}
