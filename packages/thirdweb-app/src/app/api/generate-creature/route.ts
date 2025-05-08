import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import fs from "fs/promises";
import path from "path";
import pinata from "@/common/pinata";
import FormData from "form-data";

// Metadata definitions
const species = [
  "Lion",
  "Tiger",
  "Eagle",
  "Dragon",
  "Wolf",
  "Serpent",
  "Phoenix",
  "Fox",
  "Panther",
  "Griffin",
  "Stag",
  "Kirin",
  "Owlbear",
  "Basilisk",
  "Chimera",
  "Direwolf",
];

const elements = ["Fire", "Water", "Earth", "Lightning", "Nature"];

const forms = [
  "Armored",
  "Winged",
  "Celestial",
  "Ethereal",
  "Mechanical",
  "Spirit",
  "Mystic",
  "Ancient",
];

const anomalies = [
  "Golden Halo",
  "Shiny Aura",
  "Demon Horns",
  "Celestial Crest",
  "Ethereal Scar",
  "Spirit Flames",
  "Cosmic Eyes",
  "Starborn Markings",
  "Chrono Tail",
  "Ghostly Wisp",
  "Dragon Horns",
  "Radiant (Light) Alignment",
  "Umbral (Shadow) Alignment",
  "Primordial (Neutral) Alignment",
  "Abyssal (Chaos) Alignment",
  "Celestial (Balance) Alignment",
  "Crystal Armor",
  "Bone Spikes",
  "Spirit Cloak",
  "Energy Gauntlets",
  "Void Chains",
  "Dragon Plate",
  "War Banner",
  "Phoenix Plume",
  "Cosmic Glow",
  "Ember Eyes",
  "Frost Gaze",
  "Void Eyes",
  "Radiant Sight",
  "Storm Vision",
  "Serpent Stare",
  "Celestial Glow",
  "Abyssal Shadow",
  "Prismatic Pulse",
  "Ethereal Mist",
  "Starlight Veil",
  "Infernal Blaze",
  "Rune Etchings",
  "Sacred Tattoos",
  "War Scars",
  "Star Maps",
  "Mystic Glyphs",
  "Chaos Fractures",
];

const rarities = ["Common", "Rare", "Epic", "Mythic"];
const rarityWeights = [0.6, 0.3, 0.085, 0.015];

interface PromptComponents {
  species: string;
  element?: string;
  form?: string;
  anomalies?: string[];
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  const random = Math.random() * totalWeight;
  let current = 0;

  for (let i = 0; i < items.length; i++) {
    current += weights[i];
    if (random <= current) return items[i];
  }
  return items[0];
}

async function generatePrompt(
  userPrompt: string
): Promise<[string, string, PromptComponents]> {
  const rarity = weightedRandom(rarities, rarityWeights);

  const components: PromptComponents = {
    species: species[Math.floor(Math.random() * species.length)],
  };

  // Trait composition based on rarity
  switch (rarity) {
    case "Common":
      break; // Only species
    case "Rare":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      break;
    case "Epic":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [
        anomalies[Math.floor(Math.random() * anomalies.length)],
      ];
      break;
    case "Mythic":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [
        anomalies[Math.floor(Math.random() * anomalies.length)],
        anomalies[Math.floor(Math.random() * anomalies.length)],
      ];
      break;
  }

  const style =
    userPrompt +
    "The style of the animal ancient creature warrior style with dramatic lighting, fantasy art style, detailed armor, and mystical aura";

  const parts = [
    components.species,
    components.element ? `${components.element} element` : undefined,
    components.form ? `${components.form} form` : undefined,
    components.anomalies?.join(", "),
    style,
  ].filter(Boolean) as string[];
  console.log("test", parts.join(" "));
  return [`A ${parts.join(" ")}`, rarity, components];
}

function generateBattleStats(rarity: string): {
  health: number;
  minAttack: number;
  maxAttack: number;
} {
  let health, minAttack, maxAttack;

  // Base stats by rarity
  switch (rarity) {
    case "Common":
      health = Math.floor(Math.random() * 26) + 75; // 75-100
      minAttack = Math.floor(Math.random() * 11) + 10; // 10-20
      maxAttack = Math.floor(Math.random() * 11) + 20; // 20-30
      break;
    case "Rare":
      health = Math.floor(Math.random() * 51) + 100; // 100-150
      minAttack = Math.floor(Math.random() * 11) + 20; // 20-30
      maxAttack = Math.floor(Math.random() * 11) + 30; // 30-40
      break;
    case "Epic":
      health = Math.floor(Math.random() * 51) + 150; // 150-200
      minAttack = Math.floor(Math.random() * 11) + 27; // 27-37
      maxAttack = Math.floor(Math.random() * 13) + 37; // 37-49
      break;
    case "Mythic":
      health = Math.floor(Math.random() * 101) + 200; // 200-300
      minAttack = Math.floor(Math.random() * 16) + 35; // 35-50
      maxAttack = Math.floor(Math.random() * 21) + 50; // 50-70
      break;
    default:
      health = 100;
      minAttack = 15;
      maxAttack = 25;
  }

  // Ensure max attack is at least 5 higher than min attack
  maxAttack = Math.max(maxAttack, minAttack + 5);

  return { health, minAttack, maxAttack };
}

export async function POST(request: NextRequest) {
  console.log("Generating creatures...");
  try {
    const req = await request.json();
    const numCreatures = 2;
    console.log(`Generating ${numCreatures} creatures`);

    const animalImageFile: File[] = [];
    const imageCidList: string[] = [];
    const apiKey = process.env.NEXT_PUBLIC_FLUX_AI;
    const jwt = process.env.PINATA_JWT;

    if (!apiKey) {
      throw new Error("API key not configured");
    }
    if (!jwt) {
      throw new Error("Pinata JWT not configured in environment variables");
    }

    for (let i = 0; i < numCreatures; i++) {
      console.log(`\n🌟 Generating Creature ${i + 1}/${numCreatures} 🌟`);

      const [fullPrompt, rarity, components] = await generatePrompt(req.prompt);
      let timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      let filename = `${rarity}_${timestamp}_${i}.jpg`;

      // Generate image with Hugging Face API
      console.log("Generating image with Hugging Face API...");
      const client = new InferenceClient(apiKey);
      const response = await client.textToImage({
        inputs: fullPrompt,
        model: "black-forest-labs/FLUX.1-dev",
        parameters: {
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Save image locally
      const outputDir = path.join(process.cwd(), "public", "generated_images");
      await fs.mkdir(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, filename);
      await fs.writeFile(outputPath, imageBuffer);
      console.log(`Image saved to ${outputPath}`);

      // Upload to IPFS
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const boundary = `----FormBoundary${Math.random().toString(16).substring(2)}`;
      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
        Buffer.from(`Content-Type: image/jpeg\r\n\r\n`),
        imageBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);

      const imageUploadResponse = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
        body,
      });

      if (!imageUploadResponse.ok) {
        throw new Error(`IPFS upload failed: ${imageUploadResponse.status}`);
      }

      const imageResult = await imageUploadResponse.json();
      const imageCid = imageResult.IpfsHash;
      console.log(`Image uploaded successfully to IPFS with CID: ${imageCid}`);
      imageCidList.push(imageCid);

      // Generate battle stats
      const battleStats = generateBattleStats(rarity);

      // Create metadata
      const metadataContent = {
        name: `${rarity} ${components.species}`,
        description: `A ${rarity.toLowerCase()} ${components.species.toLowerCase()} fantasy creature`,
        image: `ipfs://${imageCid}`,
        attributes: [
          { trait_type: "Rarity", value: rarity },
          { trait_type: "Species", value: components.species },
          { trait_type: "Health", value: battleStats.health },
          { trait_type: "Min Attack", value: battleStats.minAttack },
          { trait_type: "Max Attack", value: battleStats.maxAttack },
          ...(components.element ? [{ trait_type: "Element", value: components.element }] : []),
          ...(components.form ? [{ trait_type: "Form", value: components.form }] : []),
          ...(components.anomalies ? components.anomalies.map((anomaly) => ({
            trait_type: "Anomaly",
            value: anomaly,
          })) : []),
        ],
      };

      const metadataString = JSON.stringify(metadataContent);
      const metadataFileName = `metadata_${timestamp}_${i}.json`;
      const metadataFile = new File([metadataString], metadataFileName, {
        type: "application/json",
        lastModified: Date.now(),
      });

      animalImageFile.push(metadataFile);

      // Clean up the temp file
      await fs.unlink(outputPath).catch(() => {
        console.warn("Failed to clean up temporary file");
      });

      // Add a small delay between generations to avoid rate limiting
      if (i < numCreatures - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Upload metadata files
    const metadataUpload = await pinata.upload.fileArray([
      animalImageFile[0],
      animalImageFile[1],
    ]);

    const metadataCid = metadataUpload.IpfsHash;
    const metadataUrl = `https://ipfs.io/ipfs/${metadataCid}`;
    console.log(`Metadata uploaded successfully to IPFS with CID: ${metadataUrl}`);

    return NextResponse.json({
      success: true,
      data: {
        metadataUrl,
        metadataCid,
        imageCidList,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
