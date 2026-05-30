"use client";

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** { light: [bg, primary, accent], dark: [bg, primary, accent] } */
const schemePreviewColors = {
  "amber-minimal": {
    light: [
      "oklch(1 0 0)",
      "oklch(0.7686 0.1647 70.0804)",
      "oklch(0.9869 0.0214 95.2774)",
    ],
    dark: [
      "oklch(0.2046 0 0)",
      "oklch(0.7686 0.1647 70.0804)",
      "oklch(0.4732 0.1247 46.2007)",
    ],
  },
  "amethyst-haze": {
    light: [
      "oklch(0.9777 0.0041 301.4256)",
      "oklch(0.6104 0.0767 299.7335)",
      "oklch(0.7889 0.0802 359.9375)",
    ],
    dark: [
      "oklch(0.2166 0.0215 292.8474)",
      "oklch(0.7058 0.0777 302.0489)",
      "oklch(0.3181 0.0321 308.6149)",
    ],
  },
  "bold-tech": {
    light: [
      "oklch(1 0 0)",
      "oklch(0.6056 0.2189 292.7172)",
      "oklch(0.9319 0.0316 255.5855)",
    ],
    dark: [
      "oklch(0.2077 0.0398 265.7549)",
      "oklch(0.6056 0.2189 292.7172)",
      "oklch(0.4568 0.2146 277.0229)",
    ],
  },
  bubblegum: {
    light: [
      "oklch(0.9399 0.0203 345.6985)",
      "oklch(0.6209 0.1801 348.1385)",
      "oklch(0.9195 0.0801 87.667)",
    ],
    dark: [
      "oklch(0.2497 0.0305 234.1628)",
      "oklch(0.9195 0.0801 87.667)",
      "oklch(0.6699 0.0988 356.9762)",
    ],
  },
  caffeine: {
    light: [
      "oklch(0.9821 0 0)",
      "oklch(0.4341 0.0392 41.9938)",
      "oklch(0.931 0 0)",
    ],
    dark: [
      "oklch(0.1776 0 0)",
      "oklch(0.9247 0.0524 66.1732)",
      "oklch(0.285 0 0)",
    ],
  },
  candyland: {
    light: [
      "oklch(0.9809 0.0025 228.7836)",
      "oklch(0.8677 0.0735 7.0855)",
      "oklch(0.968 0.211 109.7692)",
    ],
    dark: [
      "oklch(0.2303 0.0125 264.2926)",
      "oklch(0.8027 0.1355 349.2347)",
      "oklch(0.8148 0.0819 225.7537)",
    ],
  },
  catppuccin: {
    light: [
      "oklch(0.9578 0.0058 264.5321)",
      "oklch(0.5547 0.2503 297.0156)",
      "oklch(0.682 0.1448 235.3822)",
    ],
    dark: [
      "oklch(0.2155 0.0254 284.0647)",
      "oklch(0.7871 0.1187 304.7693)",
      "oklch(0.8467 0.0833 210.2545)",
    ],
  },
  claude: {
    light: [
      "oklch(0.9818 0.0054 95.0986)",
      "oklch(0.6171 0.1375 39.0427)",
      "oklch(0.9245 0.0138 92.9892)",
    ],
    dark: [
      "oklch(0.2679 0.0036 106.6427)",
      "oklch(0.6724 0.1308 38.7559)",
      "oklch(0.213 0.0078 95.4245)",
    ],
  },
  claymorphism: {
    light: [
      "oklch(0.9232 0.0026 48.7171)",
      "oklch(0.5854 0.2041 277.1173)",
      "oklch(0.9376 0.026 321.9388)",
    ],
    dark: [
      "oklch(0.2244 0.0074 67.437)",
      "oklch(0.6801 0.1583 276.9349)",
      "oklch(0.3896 0.0074 59.4734)",
    ],
  },
  "clean-slate": {
    light: [
      "oklch(0.9842 0.0034 247.8575)",
      "oklch(0.5854 0.2041 277.1173)",
      "oklch(0.9299 0.0334 272.7879)",
    ],
    dark: [
      "oklch(0.2077 0.0398 265.7549)",
      "oklch(0.6801 0.1583 276.9349)",
      "oklch(0.3729 0.0306 259.7328)",
    ],
  },
  "cosmic-night": {
    light: [
      "oklch(0.973 0.0133 286.1503)",
      "oklch(0.5417 0.179 288.0332)",
      "oklch(0.9221 0.0373 262.141)",
    ],
    dark: [
      "oklch(0.1743 0.0227 283.7998)",
      "oklch(0.7162 0.1597 290.3962)",
      "oklch(0.3354 0.0828 280.9705)",
    ],
  },
  cyberpunk: {
    light: [
      "oklch(0.9816 0.0017 247.839)",
      "oklch(0.6726 0.2904 341.4084)",
      "oklch(0.8903 0.1739 171.269)",
    ],
    dark: [
      "oklch(0.1649 0.0352 281.8285)",
      "oklch(0.6726 0.2904 341.4084)",
      "oklch(0.8903 0.1739 171.269)",
    ],
  },
  darkmatter: {
    light: ["oklch(1 0 0)", "oklch(0.6716 0.1368 48.513)", "oklch(0.9491 0 0)"],
    dark: [
      "oklch(0.1797 0.0043 308.1928)",
      "oklch(0.7214 0.1337 49.9802)",
      "oklch(0.3211 0 0)",
    ],
  },
  "doom-64": {
    light: [
      "oklch(0.8452 0 0)",
      "oklch(0.5016 0.1887 27.4816)",
      "oklch(0.588 0.0993 245.7394)",
    ],
    dark: [
      "oklch(0.2178 0 0)",
      "oklch(0.6083 0.209 27.0276)",
      "oklch(0.7482 0.1235 244.7492)",
    ],
  },
  "elegant-luxury": {
    light: [
      "oklch(0.9779 0.0042 56.3756)",
      "oklch(0.465 0.147 24.9381)",
      "oklch(0.9619 0.058 95.6174)",
    ],
    dark: [
      "oklch(0.2161 0.0061 56.0434)",
      "oklch(0.5054 0.1905 27.5181)",
      "oklch(0.5553 0.1455 48.9975)",
    ],
  },
  graphite: {
    light: ["oklch(0.9551 0 0)", "oklch(0.4891 0 0)", "oklch(0.8078 0 0)"],
    dark: ["oklch(0.2178 0 0)", "oklch(0.7058 0 0)", "oklch(0.3715 0 0)"],
  },
  "kodama-grove": {
    light: [
      "oklch(0.8798 0.0534 91.7893)",
      "oklch(0.6657 0.105 118.9078)",
      "oklch(0.8361 0.0713 90.3269)",
    ],
    dark: [
      "oklch(0.3303 0.0214 88.0737)",
      "oklch(0.6762 0.0567 132.4479)",
      "oklch(0.654 0.0723 90.7629)",
    ],
  },
  "midnight-bloom": {
    light: [
      "oklch(0.9821 0 0)",
      "oklch(0.5676 0.2021 283.0838)",
      "oklch(0.6475 0.0642 117.426)",
    ],
    dark: [
      "oklch(0.2303 0.0125 264.2926)",
      "oklch(0.5676 0.2021 283.0838)",
      "oklch(0.6746 0.1414 261.338)",
    ],
  },
  "mocha-mousse": {
    light: [
      "oklch(0.9529 0.0146 102.4597)",
      "oklch(0.6083 0.0623 44.3588)",
      "oklch(0.8502 0.0389 49.0874)",
    ],
    dark: [
      "oklch(0.2721 0.0141 48.1783)",
      "oklch(0.7272 0.0539 52.332)",
      "oklch(0.7473 0.0387 80.5476)",
    ],
  },
  "modern-minimal": {
    light: [
      "oklch(1 0 0)",
      "oklch(0.6231 0.188 259.8145)",
      "oklch(0.9514 0.025 236.8242)",
    ],
    dark: [
      "oklch(0.2046 0 0)",
      "oklch(0.6231 0.188 259.8145)",
      "oklch(0.3791 0.1378 265.5222)",
    ],
  },
  mono: {
    light: ["oklch(1 0 0)", "oklch(0.5555 0 0)", "oklch(0.9702 0 0)"],
    dark: ["oklch(0.1448 0 0)", "oklch(0.5555 0 0)", "oklch(0.3715 0 0)"],
  },
  nature: {
    light: [
      "oklch(0.9711 0.0074 80.7211)",
      "oklch(0.5234 0.1347 144.1672)",
      "oklch(0.8952 0.0504 146.0366)",
    ],
    dark: [
      "oklch(0.2683 0.0279 150.7681)",
      "oklch(0.6731 0.1624 144.2083)",
      "oklch(0.5752 0.1446 144.1813)",
    ],
  },
  "neo-brutalism": {
    light: [
      "oklch(1 0 0)",
      "oklch(0.6489 0.237 26.9728)",
      "oklch(0.5635 0.2408 260.8178)",
    ],
    dark: [
      "oklch(0 0 0)",
      "oklch(0.7044 0.1872 23.1858)",
      "oklch(0.6755 0.1765 252.2592)",
    ],
  },
  "northern-lights": {
    light: [
      "oklch(0.9824 0.0013 286.3757)",
      "oklch(0.6487 0.1538 150.3071)",
      "oklch(0.8269 0.108 211.9627)",
    ],
    dark: [
      "oklch(0.2303 0.0125 264.2926)",
      "oklch(0.6487 0.1538 150.3071)",
      "oklch(0.6746 0.1414 261.338)",
    ],
  },
  notebook: {
    light: [
      "oklch(0.9821 0 0)",
      "oklch(0.4891 0 0)",
      "oklch(0.9354 0.0456 94.8549)",
    ],
    dark: ["oklch(0.2891 0 0)", "oklch(0.7572 0 0)", "oklch(0.9067 0 0)"],
  },
  "ocean-breeze": {
    light: [
      "oklch(0.9751 0.0127 244.2507)",
      "oklch(0.7227 0.192 149.5793)",
      "oklch(0.9505 0.0507 163.0508)",
    ],
    dark: [
      "oklch(0.2077 0.0398 265.7549)",
      "oklch(0.7729 0.1535 163.2231)",
      "oklch(0.3729 0.0306 259.7328)",
    ],
  },
  "pastel-dreams": {
    light: [
      "oklch(0.9689 0.009 314.7819)",
      "oklch(0.709 0.1592 293.5412)",
      "oklch(0.9376 0.026 321.9388)",
    ],
    dark: [
      "oklch(0.2161 0.0061 56.0434)",
      "oklch(0.7874 0.1179 295.7538)",
      "oklch(0.3858 0.0509 304.6383)",
    ],
  },
  perpetuity: {
    light: [
      "oklch(0.9491 0.0085 197.0126)",
      "oklch(0.5624 0.0947 203.2755)",
      "oklch(0.9021 0.0297 201.8915)",
    ],
    dark: [
      "oklch(0.2068 0.0247 224.4533)",
      "oklch(0.852 0.1269 195.0354)",
      "oklch(0.3775 0.0564 216.501)",
    ],
  },
  "quantum-rose": {
    light: [
      "oklch(0.9692 0.0192 343.9344)",
      "oklch(0.6002 0.2414 0.1348)",
      "oklch(0.8766 0.0828 344.8849)",
    ],
    dark: [
      "oklch(0.1808 0.0535 313.7159)",
      "oklch(0.7543 0.2319 332.0212)",
      "oklch(0.3558 0.1201 325.7655)",
    ],
  },
  "retro-arcade": {
    light: [
      "oklch(0.9735 0.0261 90.0953)",
      "oklch(0.5924 0.2025 355.8943)",
      "oklch(0.5808 0.1732 39.5003)",
    ],
    dark: [
      "oklch(0.2673 0.0486 219.8169)",
      "oklch(0.5924 0.2025 355.8943)",
      "oklch(0.5808 0.1732 39.5003)",
    ],
  },
  "sage-garden": {
    light: [
      "oklch(0.9761 0.0041 91.4461)",
      "oklch(0.6333 0.0309 154.9039)",
      "oklch(0.8242 0.0221 136.6092)",
    ],
    dark: [
      "oklch(0.1448 0 0)",
      "oklch(0.6333 0.0309 154.9039)",
      "oklch(0.3709 0.0248 153.9823)",
    ],
  },
  "soft-pop": {
    light: [
      "oklch(0.9789 0.0082 121.6272)",
      "oklch(0.5106 0.2301 276.9656)",
      "oklch(0.7686 0.1647 70.0804)",
    ],
    dark: [
      "oklch(0 0 0)",
      "oklch(0.6801 0.1583 276.9349)",
      "oklch(0.879 0.1534 91.6054)",
    ],
  },
  "solar-dusk": {
    light: [
      "oklch(0.9885 0.0057 84.5659)",
      "oklch(0.5553 0.1455 48.9975)",
      "oklch(0.9 0.05 74.9889)",
    ],
    dark: [
      "oklch(0.2161 0.0061 56.0434)",
      "oklch(0.7049 0.1867 47.6044)",
      "oklch(0.3598 0.0497 229.3202)",
    ],
  },
  "starry-night": {
    light: [
      "oklch(0.9755 0.0045 258.3245)",
      "oklch(0.4815 0.1178 263.3758)",
      "oklch(0.6896 0.0714 234.0387)",
    ],
    dark: [
      "oklch(0.2204 0.0198 275.8439)",
      "oklch(0.4815 0.1178 263.3758)",
      "oklch(0.8469 0.0524 264.7751)",
    ],
  },
  "sunset-horizon": {
    light: [
      "oklch(0.9856 0.0084 56.3169)",
      "oklch(0.7357 0.1641 34.7091)",
      "oklch(0.8278 0.1131 57.9984)",
    ],
    dark: [
      "oklch(0.2569 0.0169 352.4042)",
      "oklch(0.7357 0.1641 34.7091)",
      "oklch(0.8278 0.1131 57.9984)",
    ],
  },
  supabase: {
    light: [
      "oklch(0.9911 0 0)",
      "oklch(0.8348 0.1302 160.908)",
      "oklch(0.9461 0 0)",
    ],
    dark: [
      "oklch(0.1822 0 0)",
      "oklch(0.4365 0.1044 156.7556)",
      "oklch(0.3132 0 0)",
    ],
  },
  "t3-chat": {
    light: [
      "oklch(0.9754 0.0084 325.6414)",
      "oklch(0.5316 0.1409 355.1999)",
      "oklch(0.8696 0.0675 334.8991)",
    ],
    dark: [
      "oklch(0.2409 0.0201 307.5346)",
      "oklch(0.4607 0.1853 4.0994)",
      "oklch(0.3649 0.0508 308.4911)",
    ],
  },
  tangerine: {
    light: [
      "oklch(0.9383 0.0042 236.4993)",
      "oklch(0.6397 0.172 36.4421)",
      "oklch(0.9119 0.0222 243.8174)",
    ],
    dark: [
      "oklch(0.2598 0.0306 262.6666)",
      "oklch(0.6397 0.172 36.4421)",
      "oklch(0.338 0.0589 267.5867)",
    ],
  },
  twitter: {
    light: [
      "oklch(1 0 0)",
      "oklch(0.6723 0.1606 244.9955)",
      "oklch(0.9392 0.0166 250.8453)",
    ],
    dark: [
      "oklch(0 0 0)",
      "oklch(0.6692 0.1607 245.011)",
      "oklch(0.1928 0.0331 242.5459)",
    ],
  },
  vercel: {
    light: ["oklch(0.99 0 0)", "oklch(0 0 0)", "oklch(0.94 0 0)"],
    dark: ["oklch(0 0 0)", "oklch(1 0 0)", "oklch(0.32 0 0)"],
  },
  "vintage-paper": {
    light: [
      "oklch(0.9582 0.0152 90.2357)",
      "oklch(0.618 0.0778 65.5444)",
      "oklch(0.8348 0.0426 88.8064)",
    ],
    dark: [
      "oklch(0.2747 0.0139 57.6523)",
      "oklch(0.7264 0.0581 66.6967)",
      "oklch(0.4186 0.0281 56.3404)",
    ],
  },
  "violet-bloom": {
    light: [
      "oklch(0.994 0 0)",
      "oklch(0.5393 0.2713 286.7462)",
      "oklch(0.9393 0.0288 266.368)",
    ],
    dark: [
      "oklch(0.2223 0.006 271.1393)",
      "oklch(0.6132 0.2294 291.7437)",
      "oklch(0.2795 0.0368 260.031)",
    ],
  },
} as const satisfies Record<
  string,
  { light: [string, string, string]; dark: [string, string, string] }
>;

const colorShemeNames = Object.keys(
  schemePreviewColors,
) as (keyof typeof schemePreviewColors)[];

export type ColorSchemeName = (typeof colorShemeNames)[number];

function setColorSchemeCookie(scheme: ColorSchemeName) {
  document.cookie = `colorScheme=${scheme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

function formatSchemeName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getActiveColorScheme(): ColorSchemeName {
  if (typeof document === "undefined") return "graphite";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("colorScheme="));
  return (match?.split("=")[1] as ColorSchemeName) || "graphite";
}

export function ColorSchemeSelectorModal({
  className,
  label = "Choose color scheme",
}: {
  className?: string;
  label?: string;
}) {
  const [activeScheme, setActiveScheme] = useState<ColorSchemeName>("graphite");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveScheme(getActiveColorScheme());
  }, []);

  const selectScheme = (scheme: ColorSchemeName) => {
    setColorSchemeCookie(scheme);
    setActiveScheme(scheme);
    setOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
            className,
          )}
          aria-label={label}
        >
          <Palette className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto -mx-6 px-6 pb-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {colorShemeNames.map((scheme) => (
              <button
                key={scheme}
                onClick={() => selectScheme(scheme)}
                className={cn(
                  "relative flex flex-col gap-1.5 rounded-md border px-3 py-2.5 text-start text-sm font-medium transition-colors cursor-pointer",
                  activeScheme === scheme
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <span className="flex items-center w-full">
                  <span className="truncate">{formatSchemeName(scheme)}</span>
                  {activeScheme === scheme && (
                    <Check className="size-3.5 shrink-0 text-primary ms-auto" />
                  )}
                </span>
                <span className="flex gap-0.5">
                  {schemePreviewColors[scheme].light.map((color, i) => (
                    <span
                      key={`l${i}`}
                      className="size-5 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="flex gap-0.5">
                  {schemePreviewColors[scheme].dark.map((color, i) => (
                    <span
                      key={`d${i}`}
                      className="size-5 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
