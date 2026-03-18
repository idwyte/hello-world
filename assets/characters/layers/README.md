# Character Layer Components

Each file in this directory is a single SVG layer component for the character system.
Replace placeholder shapes with AI-generated SVG paths (via Recraft.ai → Claude conversion).

## Layer Stack

| Layer | File | Fill prop |
|-------|------|-----------|
| 0. Body base | `body/BodyBaseA.tsx` – `BodyBaseD.tsx` | `skinTone` hex |
| 1. Clothing bottom | `clothing/ClothingBottom01.tsx` – `10.tsx` | clothing color |
| 2. Clothing top | `clothing/ClothingTop01.tsx` – `12.tsx` | clothing color |
| 3. Face base | (part of BodyBase) | `skinTone` hex |
| 4. Face features | `FaceFeatures.tsx` | fixed paths, expression prop |
| 5. Hair back | `hair/HairStyle01.tsx` (back export) | hair color |
| 6. Hair front | `hair/HairStyle01.tsx` (front export) | hair color |
| 7. Accessories | `Accessories.tsx` | fixed |
| 8. Nails | (part of BodyBase, override fill) | nail polish hex |

## Adding a New Layer

1. Generate SVG in Recraft.ai with `front-facing, flat 2D, transparent bg, stroke-width: 2px`
2. Vectorize if needed (Vectorizer.ai)
3. Paste SVG code + prompt Claude: "Convert this SVG to a react-native-svg component with a `fill` prop"
4. Place the .tsx file in this directory
5. Import in `CharacterAvatar.tsx`
