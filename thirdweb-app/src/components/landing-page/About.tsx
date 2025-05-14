import { Reveal } from "@/components/reveal";
import Image from "next/image";

export default function About() {
  // Hard-coded about data
  const aboutData = {
    title: "Dive Into the Mystic Kaizer Universe",
    content: [
      "In a time not far from now, the world stands on the edge of chaos. Human greed and technological overreach have disrupted the Elemental Veil—a hidden force that binds reality together. As the Veil weakens, ancient powers once thought to be myths begin to awaken… and so do The Beasts.",
      "The Beasts are mystical beings forged from the core elements of existence—Fire, Water, Earth, and Air—each representing a fragment of reality's balance. Long ago, they guarded the Veil in secret, ensuring harmony between the physical and spiritual realms. But with the rise of corporate empires exploiting nature and data, the Veil is now tearing apart, releasing anomalies—glitches in reality that threaten both worlds.",
      "In this new age, the Mystic Kaizer NFTs represent more than collectibles—they are the key to restoring balance. Each NFT is a unique Beast, shaped by elemental forces and random anomalies, reflecting the unpredictability of both nature and technology. By minting a Beast, holders become Guardians—protectors of the Veil—and their actions in both the digital and physical realms determine the future."
    ],
    signature: "Mystic Kaizer"
  };

  return (
    <section className="py-12 md:py-20 px-6 bg-[url('/landing-page/about.png')] bg-cover bg-center text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 font-dark-mystic">
        <Reveal direction="left">
          <div className="text-4xl md:text-6xl leading-tight md:leading-16 text-left w-full ">
            {aboutData.title}
          </div>
        </Reveal>
        <Reveal direction="left">
            <hr className="w-[100px] sm:w-[200px] lg:w-[200px] xl:w-[500px] h-[1.5px] bg-white" />
        </Reveal>
        <div className="text-base md:text-2xl text-justify font-inter">
          {aboutData.content.map((paragraph: string, index: number) => (
            <p key={index} className="mb-4 md:mb-6">
              {paragraph}
            </p>
          ))}
        </div>
        <Reveal direction="right" width="100%">
          <div className="flex flex-row items-center w-full justify-end">
            <hr className="w-[100px] sm:w-[200px] lg:w-[200px] xl:w-[300px] h-[1.5px] bg-white" />
            <div className="text-xl md:text-2xl ml-4">{aboutData.signature}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}