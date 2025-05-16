export type RarityType = "Common" | "Rare" | "Epic" | "Legendary";

export interface CardAttributes {
  rarity: RarityType;
  health: number;
  minAttack: number;
  maxAttack: number;
}

/**
 * Probability distribution for rarity:
 * - Common: 50%
 * - Rare: 30%
 * - Epic: 15%
 * - Legendary: 5%
 */
const rarityProbabilities: { rarity: RarityType; chance: number }[] = [
  { rarity: "Common", chance: 60 },
  { rarity: "Rare", chance: 30 },
  { rarity: "Epic", chance: 8.5 },
  { rarity: "Legendary", chance: 1.5 },
];

/**
 * Attack ranges based on rarity
 */
const attackRanges: Record<RarityType, { min: number; max: number }> = {
  Common: { min: 1, max: 4 },
  Rare: { min: 3, max: 7 },
  Epic: { min: 6, max: 12 },
  Legendary: { min: 10, max: 20 },
};

/**
 * Generates a random rarity based on weighted probabilities
 */
export const getRandomRarity = (): RarityType => {
  const randomNum = Math.random() * 100; // Get a value between 0 and 100
  let cumulativeChance = 0;

  for (const { rarity, chance } of rarityProbabilities) {
    cumulativeChance += chance;
    if (randomNum <= cumulativeChance) return rarity;
  }
  return "Common";
};

/**
 * Generates attributes for a card based on its rarity
 */
export const generateCardAttributes = (): CardAttributes => {
  const rarity = getRandomRarity();
  const { min, max } = attackRanges[rarity];

  return {
    rarity,
    health: 100, // Default health
    minAttack: min,
    maxAttack: max,
  };
};
