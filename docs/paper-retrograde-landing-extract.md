# Retrograde Landing - Paper Extract

Design source: Paper file `Retrograde`, artboard `Retrograde Landing` (1440x2200).

## 1) Page structure (top to bottom)

- `Background FX`
  - Decorative top-right blocks (magenta filled square + outlined square)
- `Top Bar`
  - Logo image + bilingual brand text
  - 3 nav chips: MENU, LOCATIONS, ORDER
- `Hero`
  - Left: eyebrow, oversized headline, lead paragraph, 2 CTAs
  - Right: tilted "NOW BREWING" product card
- `Manga Strip`
  - Single yellow promo band with POW!, copy, and UNLOCK button
- `Menu Cards`
  - 3 equal cards: CRT MOCHA / MANGA FIZZ / BYTE WAFFLE
- `Stats Marquee`
  - Dark strip with 4 metric tiles (DAILY CUPS, VINYL SPINS, ARCADE TOKENS, COMBO RATE)
- `Location + Story`
  - Left: large red event block
  - Right: location details with directions button
- `Footer CTA`
  - Dark footer with RETROGRADE logotype and 3 social/action chips
- `8bit Stickers`
  - 3 absolutely-positioned decorative pixel stickers layered over sections

## 2) Core style primitives extracted

### Colors

- `#F7F1E3` page background / light surfaces
- `#1A1718` main ink/border/dark background
- `#C90746` brand magenta/red accent
- `#52E0D1` cyan accent
- `#FFC83D` yellow accent
- `#FFFFFF` white surface for contrast chips/cards

### Typography

- Display: `Bangers`
  - Hero H1: `152px / 132px`, slight tracking (`0.01em`)
  - Section displays: 52-96px range depending on block
- UI label: `Press Start 2P`
  - Chips/buttons/meta labels mostly 10-14px
  - Frequent tracking around `0.04em` to `0.08em`
- Body copy: `Noto Sans JP`
  - Lead copy: `24px / 36px`
  - Secondary body: 15-18px, line-height 22-28px

### Borders, shadows, and motif

- Heavy outlines: 4-6px solid `#1A1718`
- Pixel/neo-brutalist shadow offsets:
  - `8px 8px 0 #1A1718`
  - `10px 10px 0 #1A1718`
  - Hero product card: `16px 16px 0 #1A1718`
- Angled accent: hero product card uses slight rotation (`-2deg`)

### Spacing rhythm (desktop)

- Global horizontal gutters: `60px` (most sections)
- Top bar horizontal padding: `48px`
- Section vertical cadence: 24px -> 40px -> 36px -> 48px
- Inter-section gaps mostly 18-28px; card internal gaps 8-14px

## 3) Section container measurements (desktop)

- Artboard: `1440x2200`
- Top bar: `padding-block 32px`, `padding-inline 48px`, bottom border `6px`
- Hero: `padding-top 72px`, `padding-inline 60px`, `padding-bottom 40px`, `gap 28px`
  - Left content column width: `860px`
  - Right product card width: `420px`
- Manga strip: `padding-top 24px`, `padding-inline 60px`
- Menu cards: `padding-top 40px`, `padding-inline 60px`, card gap `20px`
- Stats marquee: `padding-top 36px`, `padding-inline 60px`
- Location/story: `padding-top 48px`, `padding-inline 60px`, `gap 24px`
- Footer: `padding-top 48px`, `padding-inline 60px`, `padding-bottom 60px`, top border `6px`

## 4) Assets extracted from image fills

These assets are now imported into `public/landing/` and tracked here with Paper source provenance.

| Section mapping | Usage | Local file path (imported) | Paper source URL |
|---|---|---|---|
| `topBar.logo` | Header logo mark | `public/landing/logo-retrograde.png` | `https://workers.paper.design/file-assets/01KM3X6V19BZMQMSS9G2B9M7KH/2PPCRAAJP7RH4NXPRRNPSAY35H.png` |
| `stickers.hero` | Sticker: purple character | `public/landing/sticker-purple-barista.png` | `https://workers.paper.design/file-assets/01KM3X6V19BZMQMSS9G2B9M7KH/03BS4G9XTJHMC2QSGH5KFXMX80.png` |
| `stickers.menuCards` | Sticker: mug steam | `public/landing/sticker-mug-steam.png` | `https://workers.paper.design/file-assets/01KM3X6V19BZMQMSS9G2B9M7KH/34R4VFQR6XGAKKSPCEEDW3BPMZ.png` |
| `stickers.locationStory` | Sticker: green hair mug | `public/landing/sticker-greenhair-mug.png` | `https://workers.paper.design/file-assets/01KM3X6V19BZMQMSS9G2B9M7KH/1VZBCKHZVYZP607RQ1003PD9EM.png` |

Notes:
- Sticker containers include their own framed treatment in design (6px border + dark drop shadow).
- The source URLs are direct Paper file assets and are kept here for provenance/backfills.

## 5) Implementation notes for next phase

- Use semantic tokens for colors and spacing in `src/app/globals.css`.
- Build buttons/chips as reusable variants (white/cyan/yellow/magenta with 4-5px borders).
- Keep heavy border + hard shadow language consistent across cards, stickers, and promo bands.
- Preserve headline scale contrast (very large display with small pixel-label UI text).
