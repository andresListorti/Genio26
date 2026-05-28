const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const BY_MODEL: Record<string, string> = {
  "Clasico Cuero": "1543163521-1bf539c55dd2",
  "Urbano Sport": "1542291026-7eec264c27ff",
  "Trail Runner X": "1539185441755-769473a23570",
  "Mocasin Premium": "1614253429340-98120bd6d753",
  "Botin Andes": "1549298916-b41d501d3772",
};

const BY_CATEGORY: Record<string, string> = {
  formal: "1543163521-1bf539c55dd2",
  sport: "1542291026-7eec264c27ff",
  boots: "1549298916-b41d501d3772",
};

const FALLBACK = "1460353581641-37baddab0fa2";

export function shoeImage(opts: {
  imageUrl?: string;
  model?: string;
  category?: string;
  width?: number;
}): string {
  const { imageUrl, model, category, width } = opts;
  if (imageUrl && imageUrl.startsWith("https://images.unsplash.com")) {
    return imageUrl;
  }
  if (model && BY_MODEL[model]) return UNSPLASH(BY_MODEL[model], width);
  if (category && BY_CATEGORY[category])
    return UNSPLASH(BY_CATEGORY[category], width);
  return UNSPLASH(FALLBACK, width);
}

export const HERO_IMAGE = UNSPLASH("1520975916090-3105956dac38", 1800);
