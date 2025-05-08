import { Reveal } from "../reveal";
import Image from "next/image";

interface RoadmapItem {
  text: string;
  status: "completed" | "in-progress" | "pending" | "locked";
}

interface RoadmapPhase {
  number: number;
  title: string;
  status: "current" | "locked";
  items: RoadmapItem[];
}

interface RoadmapData {
  phases: RoadmapPhase[];
  quote: string;
}

const roadmapData: RoadmapData = {
  phases: [
    {
      number: 1,
      title: "Awakening the Beasts",
      status: "current",
      items: [
        {
          text: "Project Reveal - Introduce the Mystic Kaizer universe and its rarity system",
          status: "completed"
        },
        {
          text: "Website Launch - Release an interactive landing page with lore and minting details",
          status: "completed"
        },
        {
          text: "NFT Minting Event - Open the Mystic Kaizer Genesis mint (limited supply)",
          status: "in-progress"
        },
        {
          text: "Beast Explorer - Launch a rarity explorer for holders",
          status: "pending"
        }
      ]
    },
    {
      number: 2,
      title: "Rise of the Anomalies",
      status: "locked",
      items: [
        {
          text: "Anomaly Reveal Event - Epic+ Beasts unlock exclusive traits",
          status: "locked"
        },
        {
          text: "Evolution Mechanism - NFT upgrades through quests or burn mechanics",
          status: "locked"
        },
        {
          text: "Beast Council (DAO) - Legendary/Mythic holders vote on future initiatives",
          status: "locked"
        }
      ]
    },
    {
      number: 3,
      title: "The Forgotten Realms",
      status: "locked",
      items: [
        {
          text: "Realm Unlocks - Interactive lore-based quest with new NFT classes",
          status: "locked"
        },
        {
          text: "Airdrop & Rewards - Mystic artifacts for holders",
          status: "locked"
        },
        {
          text: "Hidden Beasts - Secret 1/1 NFTs hidden within the realms",
          status: "locked"
        }
      ]
    },
    {
      number: 4,
      title: "Beyond the Veil",
      status: "locked",
      items: [
        {
          text: "IRL Utility - Exclusive merchandise and event passes",
          status: "locked"
        },
        {
          text: "Mystic Kaizer Mini-Games - Interactive PvE quests",
          status: "locked"
        },
        {
          text: "Multichain Expansion - Integration with other chains/metaverse",
          status: "locked"
        }
      ]
    }
  ],
  quote: "The journey is just beginning—will you shape the fate of the Mystic Kaizer?"
};

export default function Roadmap() {
  return (
    <section className="bg-white py-20 px-6" id="roadmap">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 justify-center items-center relative font-dark-mystic text-white">
        <Reveal width="100%">
          <div className="text-6xl text-black w-full text-center mt-8">
            RoadMap
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-black">
          {roadmapData.phases.map((phase: RoadmapPhase, index: number) => (
            <Reveal
              key={phase.number}
              direction="bottom"
              width="100%"
              delay={1.2 + (index % 2) * 0.2}
            >
              <div
                className={`bg-white/80 backdrop-blur-sm p-8 rounded-2xl ${
                  phase.status === "current"
                    ? "border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "border border-black/10 opacity-75"
                } relative`}
              >
                <div className="absolute -top-4 left-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  {phase.status === "current" ? "CURRENT PHASE" : `PHASE ${phase.number}`}
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Phase {phase.number}: {phase.title}
                </h3>
                <ul className="space-y-3 font-inter">
                  {phase.items.map((item: RoadmapItem, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span
                        className={
                          item.status === "completed"
                            ? "text-green-500"
                            : item.status === "in-progress"
                            ? "text-blue-500 animate-pulse"
                            : "text-black/50"
                        }
                      >
                        {item.status === "completed"
                          ? "✅"
                          : item.status === "in-progress"
                          ? "⏳"
                          : "🔒"}
                      </span>
                      <span
                        className={
                          item.status === "completed"
                            ? "text-black/90"
                            : item.status === "in-progress"
                            ? "text-blue-500"
                            : "text-black/50"
                        }
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-2xl text-black/80 text-center italic mt-8">
          &ldquo;{roadmapData.quote}&rdquo;
        </div>
      </div>
    </section>
  );
} 