"use client";

import ThirdWebConnectButton from "@/components/ThirdWebConnectButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";
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

export default function Home() {
  const FormSchema = z
    .object({
      opponent: z
        .string()
        .startsWith("0x", { message: "Address must start with 0x" })
        .regex(/^0x[a-fA-F0-9]{40}$/, {
          message: "Invalid Ethereum address",
        }),

      minDmg: z
        .number()
        .min(0, { message: "Minimum Damage cannot be negative" }),
      maxDmg: z
        .number()
        .min(0, { message: "Maximum Damage cannot be negative" }),
    })
    .refine((data) => data.minDmg <= data.maxDmg, {
      message: "minDmg should not be greater than maxDmg",
      path: ["minDmg"], // This will attach the error to the minDmg field
    });

  const { attack } = useMultiBaasWithThirdweb();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      opponent: "0x",
      minDmg: 0,
      maxDmg: 0,
    },
  });

  const onSubmit = async () => {};

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <div className="flex justify-center mb-20">
          <ThirdWebConnectButton />
        </div>
        <Form {...form}>
          <FormField
            control={form.control}
            name="opponent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opponent</FormLabel>
                <FormControl>
                  <Input placeholder="Opponent" {...field} />
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
                  <Input placeholder="Minimum Damage" {...field} />
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
                  <Input placeholder="Maximum Damage" {...field} />
                </FormControl>
                <FormDescription>
                  This is your opponent's maximum damage.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button onClick={onSubmit}>Submit</Button>
        </Form>
      </div>
    </main>
  );
}
