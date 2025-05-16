"use client";

import Navigation from "@/components/landing-page/Navigation";
import Hero from "@/components/landing-page/Hero";
import About from "@/components/landing-page/About";
import Story from "@/components/landing-page/Story";
import Roadmap from "@/components/landing-page/Roadmap";
import Rarity from "@/components/landing-page/Rarity";
import Collection from "@/components/landing-page/Collection";
import Footer from "@/components/landing-page/Footer";
export default function Home() {

  return (
    <div>
        <Navigation />
        <Hero />
        <About />
        <Story />
        <Collection />
        <Rarity />
        <Roadmap />
        <Footer />
    </div>
  );
}
