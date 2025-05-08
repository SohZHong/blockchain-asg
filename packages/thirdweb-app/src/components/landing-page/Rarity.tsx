import { Reveal } from "../reveal";
import Image from "next/image";

interface RarityTier {
  tier: string;
  traits: string;
  rate: string;
}

interface RarityData {
  title: string;
  tiers: RarityTier[];
}

const rarityData: RarityData = {
  title: "NFT Rarity Breakdown",
  tiers: [
    {
      tier: "Common",
      traits: "Species",
      rate: "60%"
    },
    {
      tier: "Rare",
      traits: "Species + Element",
      rate: "30%"
    },
    {
      tier: "Epic",
      traits: "Species + Element + 1 Anomaly",
      rate: "8.5%"
    },
    {
      tier: "Mythic",
      traits: "Species + Element + 2 Anomalies",
      rate: "1.5%"
    }
  ]
};

export default function Rarity() {
  return (
    <section className="bg-[url('/landing-page/rarity-bg.png')] bg-cover bg-center md:bg-[#0E0E0C] font-dark-mystic text-white" id="rarity" >
      <div className="flex flex-col lg:flex-row max-w-[1920px] mx-auto">
        <div className="hidden lg:block relative w-full lg:w-[550px] flex-shrink-0">
          <Image
            src="/landing-page/nft-rarity.png"
            alt="NFT Rarity"
            width={550}
            height={789}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col gap-6 py-12 lg:py-20 px-6 w-full">
          <div className="block md:hidden">
            <div className="text-4xl md:text-6xl text-white">{rarityData.title}</div>
          </div>
          <Reveal width="100%" direction="right" className="hidden md:block text-right">
            <div className="text-4xl md:text-6xl text-white">{rarityData.title}</div>
          </Reveal>


          {/* Rarity Table */}
          <div className="mt-8 w-full font-inter overflow-x-auto">
            <div className="rounded-lg overflow-hidden border border-white/20 min-w-[600px]">
              {/* Table Header */}
              <div className="grid grid-cols-3 text-lg md:text-2xl font-bold bg-white/5">
                <div className="p-4 md:p-6 border-r border-white/20">Rarity Tier</div>
                <div className="p-4 md:p-6 border-r border-white/20">Trait Included</div>
                <div className="p-4 md:p-6">Drop Rate</div>
              </div>

              {/* Table Rows */}
              {rarityData.tiers.map((row: RarityTier, index: number) => (
                <div
                  key={row.tier}
                  className={`grid grid-cols-3 text-base md:text-xl ${
                    index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  }`}
                >
                  <div className="p-4 md:p-6 border-r border-white/20">{row.tier}</div>
                  <div className="p-4 md:p-6 border-r border-white/20">{row.traits}</div>
                  <div className="p-4 md:p-6">{row.rate}</div>
                </div>
              ))}
            </div>

            {/* Table Caption */}
            <div className="mt-4 text-white/80 text-base md:text-lg">
              From Common to Mythic—discover the traits that define your Beasts.{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center"
              >
                Learn more about rarity
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 