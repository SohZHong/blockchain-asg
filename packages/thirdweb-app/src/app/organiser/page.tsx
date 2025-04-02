"use client";

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
import { useThirdWeb } from "@/hooks/useThirdWeb";
import useMultiBaasWithThirdweb, { NFTMetadata } from "@/hooks/useMultiBaas";
import { useEffect, useState } from "react";
import ThirdWebConnectButton from "@/components/ThirdWebConnectButton";
import Link from "next/link";

export default function OrganiserPage() {
  const [organiserMetadata, setOrganiserMetadata] = useState<NFTMetadata>();

  const FormSchema = z.object({
    receiver: z
      .string()
      .startsWith("0x", { message: "Address must start with 0x" })
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address",
      }),
  });

  const { account } = useThirdWeb();
  const { getOrganiserEvent, getOrganiserMetadata } =
    useMultiBaasWithThirdweb();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      receiver: "0x",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const response = await fetch("/api/mint-organiser-pass", {
        method: "POST",
        body: JSON.stringify({
          to: data.receiver,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast("Minted Organiser Pass", {
          description: JSON.stringify(res, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          ),
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      } else {
        toast("Error Minting Organiser Pass", {
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
  useEffect(() => {
    const getOrganiserDetails = async () => {
      if (!account) return;
      const event = await getOrganiserEvent(account.address as `0x${string}`);
      if (!event) return;

      const tokenId = event.event.inputs.find(
        (input) => input.name === "tokenId"
      )?.value;

      if (tokenId) {
        const metadata = await getOrganiserMetadata(tokenId);

        if (metadata) {
          setOrganiserMetadata(metadata);
        }
      }
    };
    getOrganiserDetails();
  }, [account?.address]);

  return (
    <main className="p-6 min-h-[100vh] container max-w-screen-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Organiser</h1>
          <ThirdWebConnectButton />
        </div>
        {account && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="receiver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organiser Pass Receiver</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Receiver"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Organiser's Wallet Address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        )}
        <div>
          {organiserMetadata && JSON.stringify(organiserMetadata, null, 2)}
        </div>
        <nav className="flex flex-col items-center justify-center">
          <Link href={"/"}>Home Page</Link>
          <Link href={"/event/create"}>Event Creation Page</Link>
          <Link href={"/event"}>Event Listings Page</Link>
        </nav>
      </div>
    </main>
  );
}
