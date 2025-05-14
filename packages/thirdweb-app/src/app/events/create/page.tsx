"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Accept, useDropzone } from "react-dropzone";
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
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 1000000;
const ACCEPTED_IMAGE_TYPES: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpeg"],
  "image/jpg": [".jpg"],
};

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
    prompt: z.string().nonempty("Prompt cannot be empty"),
  });

  const [metadataCid, setMetadataCid] = useState<string>("");
  const [imageCidList, setImageCidList] = useState<string[]>([]);
  console.log("imageCidList", imageCidList);
  const { account } = useThirdWeb();
  const [imagesPreview, setImagesPreview] = useState<string[]>([]); // Preview array

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      participantLimit: 0,
      startDate: new Date().toISOString().split("T")[0], // Format to "YYYY-MM-DD"
      prompt: "",
    },
  });

  // Add this state near other state declarations
  const [isGenerating, setIsGenerating] = useState(false);

  // Update the promptImage function
  const promptImage = async (prompt: string) => {
    try {
      setIsGenerating(true);
      const generateImage = await fetch("/api/generate-creature", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt,
        }),
      });
      const generateImageJson = await generateImage.json();

      if (!generateImageJson.success) {
        throw new Error(
          generateImageJson.error || "Failed to generate creature"
        );
      }

      setMetadataCid(generateImageJson.data.metadataCid);
      setImageCidList(generateImageJson.data.imageCidList);
    } catch (error) {
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log("Form data:", data);
    try {
      if (!metadataCid || imageCidList.length === 0) {
        toast.error("Please generate images first");
        return;
      }

      toast("Creating event...");
      console.log("Metadata CID:", metadataCid);
      console.log("Image CID List:", imageCidList);
      const baseUri = `ipfs://${metadataCid}/`;

      // Prepare parameters for event creation through contract
      const startDateTimestamp = Math.floor(
        new Date(data.startDate).getTime() / 1000
      );
      const response = await fetch("/api/event/create", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          name: data.name,
          description: data.description,
          location: data.location,
          participantLimit: data.participantLimit,
          startDate: startDateTimestamp,
          rewardCount: 2,
          baseUri,
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
    <main className="p-6 min-h-[100vh] container max-w-screen-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Event Creation</h1>
          <ThirdWebConnectButton />
        </div>

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
              <div className="flex min-w-full items-center gap-x-4">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Input placeholder="Prompt" {...field} />
                      </FormControl>
                      <FormDescription>Prompt for the Event</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={() => promptImage(form.getValues("prompt"))}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Prompt Your Image"}
                </Button>
              </div>
              {imageCidList && imageCidList.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Generated Images:
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {imageCidList.map((imagecid) => (
                      <div key={imagecid} className="relative aspect-square">
                        <Image
                          src={`https://ipfs.io/ipfs/${imagecid}`}
                          alt={`Generated image ${imagecid}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        )}

        <nav className="flex flex-col items-center justify-center">
          <Link href={"/"}>Home Page</Link>
          <Link href={"/organiser"}>Organiser Page</Link>
          <Link href={"/event"}>Event Listings Page</Link>
        </nav>
      </div>
    </main>
  );
}
