export const landingAssetPaths = {
  topBar: {
    logo: "/landing/logo-retrograde.png",
  },
  stickers: {
    hero: "/landing/sticker-purple-barista.png",
    menuCards: "/landing/sticker-mug-steam.png",
    locationStory: "/landing/sticker-greenhair-mug.png",
  },
} as const;

export type LandingAssetSection = keyof typeof landingAssetPaths;
