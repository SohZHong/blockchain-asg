export interface BattleNFT {
  id: string;
  name: string;
  image: string;
  health: number;
  atkMin: number;
  atkMax: number;
  description: string;
  dodge?: number;
}

export const dummyNFTs: BattleNFT[] = [
  {
    id: "1",
    name: "Lumina",
    image: "/landing-page/common-2.png",
    health: 1000,
    atkMin: 20,
    atkMax: 80,
    description: "A mystical white stag with ethereal powers."
  },
  {
    id: "2",
    name: "Solara",
    image: "/landing-page/rare-2.png",
    health: 1900,
    atkMin: 30,
    atkMax: 160,
    description: "A majestic winged lion with solar energy."
  },
  {
    id: "3",
    name: "Dragon",
    image: "/landing-page/epic.png",
    health: 3600,
    atkMin: 60,
    atkMax: 190,
    description: "An ancient dragon with devastating power."
  }
]; 