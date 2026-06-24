const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const BY_MODEL_CART: Record<string, string> = {
  "Zueco Chicago":    "/resources/img/1 - Zueco Chicago cart.png",
  "Zapatilla Tempo":  "/resources/img/2 - Zapatilla Tempo cart.png",
  "Zapato Doha":      "/resources/img/3 - Zapato Doha Acordonado cart.png",
  "Mocasin Doha":     "/resources/img/4 - Mocasin Doha cart.png",
  "Bota Dust":        "/resources/img/5 - Bota Dust 1.png",
  "Bota Murat":       "/resources/img/6 - Bota Murat 1.png",
  "Mocasin Wales":    "/resources/img/7 - Mocasin Wales 1.png",
  "Zapato Alamo":     "/resources/img/8 - Zapato Alamo 1.png",
  "Zapato Pamplona":  "/resources/img/9 - Zapato Pamplona 1.png",
  "Zapato Palermo":   "/resources/img/10 - Zapato Palermo 1.png",
  "Zapato Paris":     "/resources/img/11 - Zapato Paris 1.png",
  "Bota Yale":        "/resources/img/12 - Bota Yale 1.png",
  "Zapatilla Kripton":"/resources/img/13 - Zapatilla Kripton 1.png",
  "Zapatilla Neon":   "/resources/img/14 - Zapatilla Neon 1.png",
  "Zapatilla Samario":"/resources/img/15 - Zapatilla Zamario 1.png",
};

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
  // Local asset served from frontend/public (e.g. "/resources/Men.jpg").
  if (imageUrl && imageUrl.startsWith("/")) {
    return imageUrl;
  }
  if (imageUrl && imageUrl.startsWith("https://images.unsplash.com")) {
    return imageUrl;
  }
  if (model && BY_MODEL_CART[model]) return BY_MODEL_CART[model];
  if (model && BY_MODEL[model]) return UNSPLASH(BY_MODEL[model], width);
  if (category && BY_CATEGORY[category])
    return UNSPLASH(BY_CATEGORY[category], width);
  return UNSPLASH(FALLBACK, width);
}

export const HERO_IMAGE = UNSPLASH("1520975916090-3105956dac38", 1800);
