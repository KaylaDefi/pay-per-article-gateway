import { ContentRepository } from "../interfaces/ContentRepository";
import { ContentItem } from "../models/ContentItem";
import { WorldNewsArticle } from "../models/WorldNewsArticle";
import { BusinessArticle } from "../models/BusinessArticle";
import { LifestyleArticle } from "../models/LifestyleArticle";

const articles: ContentItem[] = [
  new WorldNewsArticle(
    "wn-001",
    "Coastal Cities Weigh the Cost of Rising Seawalls",
    "Maya Okafor",
    "0.25",
    "Port authorities in three coastal cities are debating whether to fund new seawall projects or relocate critical infrastructure inland, a decision that will shape regional budgets for decades.",
    "West Africa"
  ),
  new WorldNewsArticle(
    "wn-002",
    "Mountain Villages Turn to Microgrids",
    "Lukas Brenner",
    "0.25",
    "Remote communities long left off national power grids are installing small solar and battery systems, and local cooperatives are learning to manage them without outside help.",
    "Central Europe"
  ),
  new BusinessArticle(
    "bz-001",
    "Why Small Retailers Are Rethinking Card Fees",
    "Priya Raman",
    "0.50",
    "Independent shop owners say processing fees now rival their rent, and a growing number are testing alternative payment options to protect already thin margins.",
    "Main Street Retail Co."
  ),
  new BusinessArticle(
    "bz-002",
    "Interest Rates and the Four-Day Workweek",
    "Daniel Ortiz",
    "0.50",
    "As borrowing costs shift, some mid-sized firms are pairing hiring freezes with shorter workweeks, betting that retention will matter more than headcount over the next year."
  ),
  new LifestyleArticle(
    "ls-001",
    "Weeknight Green Chile Stew",
    "Hannah Wells",
    "0.15",
    "A hearty stew built on roasted green chiles, potatoes, and pork shoulder, simmered until tender and ready for a cold evening.",
    "recipe",
    ["6 ingredients", "45 minutes", "One pot"]
  ),
  new LifestyleArticle(
    "ls-002",
    "Three Days in the Beartooth Mountains",
    "Sam Whitaker",
    "0.15",
    "A route through alpine lakes, high meadows, and quiet trailheads, with tips on where to camp and when the passes open each season.",
    "travel",
    ["Trail map", "Camping spots", "Best season"]
  ),
];

export async function seedArticles(repository: ContentRepository): Promise<void> {
  for (const article of articles) {
    await repository.save(article);
  }
}