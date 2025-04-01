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
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";
import { NFTDescription, NFTMedia, NFTProvider } from "thirdweb/react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/Spinner";

export default function OrganiserPage() {
  const [organiserPassId, setOrganiserPassId] = useState<bigint>();

  const FormSchema = z.object({
    receiver: z
      .string()
      .startsWith("0x", { message: "Address must start with 0x" })
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address",
      }),
  });

  const { account, organiserContract } = useThirdWeb();
  const { getOrganiserEvent } = useMultiBaasWithThirdweb();

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
        setOrganiserPassId(BigInt(tokenId)); // Store tokenId in state if needed
      }
    };
    getOrganiserDetails();
  }, [account?.address]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
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
      </div>
      <div>
        {organiserContract && organiserPassId !== undefined && (
          <NFTProvider contract={organiserContract} tokenId={organiserPassId}>
            <NFTMedia
              fallbackComponent={<span>Failed to load media</span>}
              queryOptions={{ retry: 3, enabled: false }}
              loadingComponent={<Spinner size={"medium"} />}
            />
            <NFTDescription
              fallbackComponent={<span>Failed to load description</span>}
            />
          </NFTProvider>
        )}
      </div>
    </main>
  );
}
