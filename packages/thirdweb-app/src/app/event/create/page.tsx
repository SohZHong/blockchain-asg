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
import { generateCardAttributes } from "@/lib/rarityUtils";

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
    baseUri: z.string(),
    images: z
      .array(
        z.object({
          file: z.instanceof(File),
        })
      )
      .nonempty("At least one image is required"),
  });

  const { account } = useThirdWeb();
  const [imagesPreview, setImagesPreview] = useState<string[]>([]); // Preview array
  const [imagesFiles, setImagesFiles] = useState<File[]>([]); // File array
  const [ipfsImageUris, setIpfsImageUris] = useState<string[]>([]); // Store CIDs of images

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

  const onDrop = (acceptedFiles: File[]) => {
    const currentImages = form.getValues("images") || [];
    const newImages = acceptedFiles.map((file) => ({ file }));
    form.setValue("images", [...currentImages, ...newImages], {
      shouldValidate: true,
    });

    // Generate previews
    const previewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImagesPreview((prev) => [...prev, ...previewUrls]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDrop,
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      toast("Uploading images to IPFS...");

      // Upload images to Pinata
      const imageUris: string[] = [];

      for (const imageObj of data.images) {
        const formData = new FormData();
        formData.append("files", imageObj.file);

        const response = await fetch("/api/pinata/upload", {
          method: "POST",
          body: formData,
        });
        const res = await response.json();
        toast(`Uploaded ${res.Name}`);
        imageUris.push(res.IpfsHash);
      }
      // Generate metadata for each image
      const metadataList = imageUris.map((uri, index) => {
        const { rarity, health, minAttack, maxAttack } =
          generateCardAttributes();
        return {
          name: `${data.name} - Image ${index + 1}`,
          description: `Card Created for Event ${data.name}`,
          image: `ipfs://${uri}`,
          attributes: [
            { trait_type: "Rarity", value: rarity },
            { trait_type: "Health", value: health },
            { trait_type: "Minimum Attack", value: minAttack },
            { trait_type: "Maximum Attack", value: maxAttack },
          ],
        };
      });
      // Generate metadata json files
      const metadataFormData = new FormData();
      metadataList.forEach((metadata, index) => {
        const metadataJson = new Blob([JSON.stringify(metadata)], {
          type: "application/json",
        });

        metadataFormData.append(`files`, metadataJson, `${index}.json`); // Assign unique names
      });

      // Upload metadata files to Pinata
      const metadataUploadResponse = await fetch("/api/pinata/upload", {
        method: "POST",
        body: metadataFormData,
      });
      const metadataRes = await metadataUploadResponse.json();
      const baseUri = `ipfs://${metadataRes.IpfsHash}/`;

      // Automatically update the baseUri field
      form.setValue("baseUri", baseUri);

      // Prepare parameters for event creation through contract
      const startDateTimestamp = Math.floor(
        new Date(data.startDate).getTime() / 1000
      );
      const response = await fetch("/api/event/create", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          name: data.name,
          description: data.name,
          location: data.location,
          participantLimit: data.participantLimit,
          startDate: startDateTimestamp,
          rewardCount: metadataList.length,
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
              <FormField
                control={form.control}
                name="baseUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Reward's Base URI</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="Base URI" {...field} />
                    </FormControl>
                    <FormDescription>
                      Base URI link for the Event's Rewards
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Multiple File Upload */}
              <FormField
                control={form.control}
                name="images"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Event Images</FormLabel>
                    <FormControl>
                      {/* Dropzone UI */}
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed p-4 text-center cursor-pointer"
                      >
                        <Input {...getInputProps()} />
                        <p>Drag & drop images here, or click to select files</p>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imagesPreview.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-auto rounded-lg"
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
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
