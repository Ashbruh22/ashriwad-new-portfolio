# The 3D centerpiece character

The centerpiece is a **hand-built stylised low-poly character** — a developer in
a hoodie, cap and glasses holding a laptop — assembled from Three.js primitives
in **`components/three/PrimitiveCharacter.tsx`**. No GLB, no skeleton; it's
animated procedurally.

Since the minimal / Vercel-like restyle it is **hero-only and near-monochrome**:
graphite hoodie, near-black cap/jeans, kept skin tone, and a single blue laptop
screen (`#3291ff`) as the only point of colour. It no longer repositions per
section — it just sits calmly typing in the hero and fades out on scroll (with a
faint reappearance behind Contact).

## How it works

- `PrimitiveCharacter.tsx` builds the figure as a hierarchy of `<group>` joints
  (spine, head, upper/lower arms, legs, laptop). A `useLayoutEffect` measures the
  primitive `Box3` (reliable, unlike a skinned rig) and scales it to a fixed
  world height with the feet near the origin.
- Poses live in the `POSES` map — a target euler rotation per joint per semantic
  `RobotPose`. In practice only `idle` is used now (typing jitter + breathing +
  cursor head-track). The other poses are kept for a possible future.
- Choreography (`lib/sceneSections.ts` + `useChoreography.ts`) is minimal: a
  single `HERO_KEYFRAME` for framing, and one whole-page ScrollTrigger that
  writes `sceneState.target.robotOpacity` from scroll depth. The R3F loop damps
  to it.
- Lighting (`SceneLights.tsx`) is neutral: one white key + soft ambient + a
  faint fill. No coloured accents.
- Palette: `PrimitiveCharacter`'s `C` object (mirrors `lib/palette.ts`
  `char*`). Materials are collected and registered so `RobotCenterpiece` can
  fade them with scroll.

## Tuning knobs

| What | Where |
|---|---|
| Character colours | `C` object at the top of `PrimitiveCharacter.tsx` (and `lib/palette.ts`) |
| Overall size / feet height | the `useLayoutEffect` fit (`2.35` target height, `-1.18` offset) |
| Per-pose arm / head / spine angles | the `POSES` map |
| Which poses hold the laptop | `HOLDS_LAPTOP` set |
| Hero framing (position, scale, camera) | `HERO_KEYFRAME` in `lib/sceneSections.ts` |
| Scroll fade curve + Contact bookend | `useChoreography.ts` |

## Swapping in a modelled GLB later

The integration point is `RobotCenterpiece.tsx` — replace `<PrimitiveCharacter />`
with a GLB loader (`useGLTF` + `SkeletonUtils.clone` + `useAnimations`) and map
the clip names to `RobotPose`. The outer/swivel rig, `GroundShadow`,
choreography, poster fallback and quality gating all stay. Budget ~half a day
plus visual tuning.
