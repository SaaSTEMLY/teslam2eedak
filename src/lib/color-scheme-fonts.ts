/**
 * Maps each color scheme to the Google Fonts it requires.
 * System fonts (Georgia, Menlo, Courier New, etc.) are excluded.
 *
 * Fonts marked as variable support the wght axis range syntax.
 * Static fonts (e.g. Antic, Architects Daughter) only offer fixed weights.
 */

import { ColorSchemeName } from "@/components/ui/color-scheme-selector-modal";

type FontEntry = { name: string; weights: string };

/** Variable font axis range for most fonts */
const V = "wght@300..900";
/** Common static weight set for non-variable fonts */
const S = "wght@400;700";

const FONT_CATALOG: Record<string, FontEntry> = {
  Inter: { name: "Inter", weights: V },
  Montserrat: { name: "Montserrat", weights: V },
  Outfit: { name: "Outfit", weights: V },
  Poppins: { name: "Poppins", weights: "wght@300;400;500;600;700" },
  "Plus Jakarta Sans": { name: "Plus Jakarta Sans", weights: V },
  "DM Sans": { name: "DM Sans", weights: V },
  Roboto: { name: "Roboto", weights: V },
  "Open Sans": { name: "Open Sans", weights: V },
  Merriweather: { name: "Merriweather", weights: V },
  "Libre Baskerville": { name: "Libre Baskerville", weights: S },
  Oxanium: { name: "Oxanium", weights: V },
  "Architects Daughter": { name: "Architects Daughter", weights: "wght@400" },
  Antic: { name: "Antic", weights: "wght@400" },
  Quicksand: { name: "Quicksand", weights: V },
  "Source Code Pro": { name: "Source Code Pro", weights: V },
  "Source Serif 4": { name: "Source Serif 4", weights: V },
  Lora: { name: "Lora", weights: V },
  "Playfair Display": { name: "Playfair Display", weights: V },
  "Fira Code": { name: "Fira Code", weights: V },
  "JetBrains Mono": { name: "JetBrains Mono", weights: V },
  "Space Mono": { name: "Space Mono", weights: S },
  "IBM Plex Mono": { name: "IBM Plex Mono", weights: V },
  "Roboto Mono": { name: "Roboto Mono", weights: V },
  "Ubuntu Mono": { name: "Ubuntu Mono", weights: S },
  Geist: { name: "Geist", weights: V },
  "Geist Mono": { name: "Geist Mono", weights: V },
};

const colorSchemeFonts: Record<ColorSchemeName, string[]> = {
  "amber-minimal": ["Inter", "Source Serif 4", "JetBrains Mono"],
  "amethyst-haze": ["Geist", "Lora", "Fira Code"],
  "bold-tech": ["Roboto", "Playfair Display", "Fira Code"],
  bubblegum: ["Poppins", "Lora", "Fira Code"],
  caffeine: [],
  candyland: ["Poppins", "Roboto Mono"],
  catppuccin: ["Montserrat", "Fira Code"],
  claude: [],
  claymorphism: ["Plus Jakarta Sans", "Lora", "Roboto Mono"],
  "clean-slate": ["Inter", "Merriweather", "JetBrains Mono"],
  "cosmic-night": ["Inter", "JetBrains Mono"],
  cyberpunk: ["Outfit", "Fira Code"],
  darkmatter: ["Geist Mono", "JetBrains Mono"],
  "doom-64": ["Oxanium", "Source Code Pro"],
  "elegant-luxury": ["Poppins", "Libre Baskerville", "IBM Plex Mono"],
  graphite: ["Montserrat", "Inter", "Fira Code"],
  "kodama-grove": ["Merriweather", "Source Serif 4", "JetBrains Mono"],
  "midnight-bloom": ["Montserrat", "Playfair Display", "Source Code Pro"],
  "mocha-mousse": ["DM Sans"],
  "modern-minimal": ["Inter", "Source Serif 4", "JetBrains Mono"],
  mono: ["Geist Mono"],
  nature: ["Montserrat", "Merriweather", "Source Code Pro"],
  "neo-brutalism": ["DM Sans", "Space Mono"],
  "northern-lights": ["Plus Jakarta Sans", "Source Serif 4", "JetBrains Mono"],
  notebook: ["Architects Daughter", "Fira Code"],
  "ocean-breeze": ["DM Sans", "Lora", "IBM Plex Mono"],
  "pastel-dreams": ["Open Sans", "Source Serif 4", "IBM Plex Mono"],
  perpetuity: ["Source Code Pro"],
  "quantum-rose": ["Poppins", "Quicksand", "Playfair Display", "Space Mono"],
  "retro-arcade": ["Outfit", "Space Mono"],
  "sage-garden": ["Antic", "JetBrains Mono"],
  "soft-pop": ["DM Sans", "Space Mono"],
  "solar-dusk": ["Oxanium", "Merriweather", "Fira Code"],
  "starry-night": ["Libre Baskerville"],
  "sunset-horizon": ["Montserrat", "Merriweather", "Ubuntu Mono"],
  supabase: ["Outfit"],
  "t3-chat": [],
  tangerine: ["Inter", "Source Serif 4", "JetBrains Mono"],
  twitter: ["Open Sans"],
  vercel: ["Geist", "Geist Mono"],
  "vintage-paper": ["Libre Baskerville", "Lora", "IBM Plex Mono"],
  "violet-bloom": ["Plus Jakarta Sans", "Lora", "IBM Plex Mono"],
};

export function getGoogleFontsUrl(schemeName: ColorSchemeName): string | null {
  const fontNames = colorSchemeFonts[schemeName];
  if (!fontNames || fontNames.length === 0) return null;

  const families = fontNames
    .map((name) => {
      const entry = FONT_CATALOG[name];
      const encoded = name.replace(/ /g, "+");
      return entry ? `family=${encoded}:${entry.weights}` : `family=${encoded}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
