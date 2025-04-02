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
import ThirdWebConnectButton from "@/components/ThirdWebConnectButton";

export default function EventCreationPage() {
  // Form validation logic
  const FormSchema = z.object({
    name: z.string().nonempty("Name cannot be empty"),
    description: z.string().nonempty("Description cannot be empty"),
    location: z.string().nonempty("Location cannot be empty"),
    participantLimit: z.coerce
      .number()
      .min(0, { message: "Participant limit cannot be negative" }),
    startDate: z
      .string()
      .nonempty("Start date is required")
      .refine(
        (val) => {
          const selectedDate = new Date(val).getTime(); // Convert to timestamp (ms)
          const currentTimestamp = new Date().setHours(0, 0, 0, 0); // Today's start of day (midnight)
          return selectedDate > currentTimestamp;
        },
        {
          message: "Start date must be in the future",
        }
      ),
    baseUri: z
      .string()
      .refine((val) => /^ipfs:\/\/.+/.test(val) || /^https?:\/\/.+/.test(val), {
        message: "baseUri must be a valid URL or an IPFS link (ipfs://)",
      }),
  });

  const { account } = useThirdWeb();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      participantLimit: 0,
      startDate: new Date().toISOString().split("T")[0], // Format to "YYYY-MM-DD"
      baseUri: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const startDateTimestamp = Math.floor(
        new Date(data.startDate).getTime() / 1000
      );
      console.log(startDateTimestamp);
      const response = await fetch("/api/event/create", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          name: data.name,
          description: data.name,
          location: data.location,
          participantLimit: data.participantLimit,
          startDate: startDateTimestamp,
          baseUri: data.baseUri,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast("Created Event", {
          description: JSON.stringify(res, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          ),
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      } else {
        toast("Error Creating Event", {
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

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <ThirdWebConnectButton />
        {account && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Event's Name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormDescription>Event's Description</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Location the Event is held at
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participantLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Participant Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Participant Limit"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Participant Limit for the Event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Start Date" {...field} />
                    </FormControl>
                    <FormDescription>Event's Start Date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Reward's Base URI</FormLabel>
                    <FormControl>
                      <Input placeholder="Base URI" {...field} />
                    </FormControl>
                    <FormDescription>
                      Base URI link for the Event's Rewards
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
    </main>
  );
}
