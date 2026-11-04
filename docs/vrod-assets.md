# V-Rod: frozen camera photos, edit-derived layers and material masks

## How the configurator images work (2026-11-04)

Every camera has one frozen 1536×1024 RGBA photograph in `public/images/vrod/` (`right`, `front-quarter`, `front`, `left`, `rear`, `rear-quarter`). These are generated concept photographs, not a calibrated 3D model or a verified catalogue of real parts. An option never swaps the photograph and never pastes a part drawn on an empty canvas: models cannot hit pixel coordinates that way, which was the cause of the earlier misaligned exhausts.

Instead, every option is an **edit of the frozen photograph itself**:

1. GPT-6 Astra (through `scripts/codex-mcp`, see `scripts/layers/jobs.mjs` for every prompt) receives the base photo and changes only the part, e.g. "replace the exhaust with drag pipes". For cameras other than the right profile the right-profile edit is attached as a second reference, so the part looks the same from every side.
2. `scripts/layers/build.mjs` registers the edit to the base (scale + shift search; Astra occasionally shifts the frame by ~30 px), finds the changed pixels inside the part's allowed region, closes them into one solid part and writes a cropped layer: `layers/<view>-<part>.png` (new pixels, edge band pre-blended with the base) and `layers/<view>-<part>-meta.png` (alpha = hard cut, RGB = material weights inside the cut).
3. At runtime (`src/lib/bike-renderer.js`) the base is drawn, every selected layer replaces the pixels inside its cut, then materials are recoloured.

Because the cut is hard and the soft edge is baked into the layer, a layer reproduces the base exactly at its border: no halos, no seams, no partial transparency.

**Materials** (paint, leather, wheel rims) are recoloured, not regenerated. Astra repaints the base with flat key colours (#FF00FF paint, #00FF00 leather, #0000FF rims); the build keeps a key pixel only where the base agrees (teal, warm, dark neutral), giving `<view>-materials.png`. Each exhaust edit gets its own mask too, so new pipes passing over a wheel never take the wheel colour. The recolour keeps the photo's light: target colour × relative shading + the original highlights, with finish presets (gloss, metallic, matte, satin, polished) and softer shadows for light colours.

**Stacking parts** (wheels + exhaust). Layers are drawn in a fixed order: wheels, exhaust, accessories. Wheel layers are solid and are aligned per wheel (Astra moves each wheel slightly differently from the rest of the frame; the tyre outline is the reference), with boxes that hold a whole wheel so no cut crosses a tyre. Exhaust layers are "tight" and drawn over what is already there (`over: true` in the manifest): they keep only the pipes, never a rim or empty space seen through them, so the chosen wheel design shows behind the pipes. To find the pipes where a black pipe crosses a black rim, the build uses the exhaust edit's own mask, aligned locally to the edit (the mask pass may redraw the part ~10 px off), plus a closing step for black-on-black areas.

`src/lib/vrod-layers.json` (generated) holds crop boxes and the mean luminance of each material per camera. `src/lib/cameras.js` holds tyre contacts for the floor shadow, which the canvas draws below the photo (1536×1100).

## Regenerating or adding an option

1. Add a job in `scripts/layers/jobs.mjs` (prompt + base reference, plus the right-view edit as second reference for other cameras) and an allowed region per camera in `scripts/layers/build.mjs`.
2. `node scripts/layers/generate.mjs <name-filter>` — raw edits go to `.local/astra/` (git-ignored). Delete a raw file to regenerate it; rejected attempts are kept in `.local/astra/rejected/`.
3. `node scripts/layers/build.mjs` — writes masks, layers, backdrops and the manifest; QA pairs go to `.local/qa/`.
4. Review every QA image: part identical across cameras, no stray marks, correct side (exhaust on the motorcycle's right only), wheel openings transparent on a light background. `node scripts/layers/render.mjs` renders any combination with the site's renderer.
5. Add the option to `src/lib/configurator.js`.

A part that is narrower than the one it replaces works too: the edit restores what was behind the old part, and that restoration is part of the layer.

## Verification

`npm test` renders the real assets: every layer may change pixels only inside its own cut, every recolour only pixels its mask assigns, all sources are 1536×1024, each option exists for at least four cameras, the exhaust never appears on the left profile, and tyres get contact shadows. Set `BIKE_QA_OUTPUT` to a directory to save stock-vs-build sheets for review.

## Base photograph prompts

The six frozen bases were generated earlier with the prompts below (kept for reference; regenerating a base invalidates every mask and layer of that camera).

### right.png

Create one high-resolution MASTER product photograph from ONLY the TOP LEFT cell of this reference atlas: exact RIGHT SIDE PROFILE of the teal custom V-Rod facing RIGHT with SHORT stainless twin exhausts. This will be the immutable base of a configurator. Output a SINGLE motorcycle on a 1536x1024 transparent canvas, NOT an atlas. Reproduce the reference bike identity faithfully: same blade-spoke black alloy wheels with transparent openings, angular teal tank, cognac quilt saddle, engine, radiator, low handlebars, headlamp, fat rear tire, short silver pipes, NO license plate bracket. Preserve exact relative camera framing of the source cell scaled 2x: rear tire contact about (300,860), front tire contact about (1300,860), bike spans x55..1500. Tires rest on the same ground line. Improve real mechanical detail and optical clarity with crisp realistic metal, tread, stitching and clean edges, no painterly softness or oversharpening halos. Do not redesign wheels, handlebars or body. Soft studio lighting. Genuine transparent alpha including open wheel spokes, no baked background or ground shadow, no text. The renderer will add a separate contact shadow.

### front-quarter.png

Single immutable MASTER motorcycle image for a visual configurator. Image 1 is authoritative bike identity: same teal custom V-Rod, black curved blade-spoke wheels, cognac quilt saddle, angular tank, SHORT stainless twin exhausts on motorcycle RIGHT only, no plate bracket. Image 2 is CAMERA AND FRAMING reference: use ONLY its TOP RIGHT cell, front-right three-quarter view, facing right. Render that same bike at this camera angle as one single very detailed 1536x1024 transparent image, not a sheet. Match the reference cell framing scaled exactly 2x, full vehicle inside canvas with contact points near y900 (side/quarter views) or y950 (axial views). Keep reference1 wheel spoke style, tank, radiator, handlebars, tire proportions and mechanical identity. Front tire visibly narrower than 300mm rear; do not redesign components. High-resolution crisp studio photography, accurate clean contours and visible stitching/metal/tread, no painterly smearing or artifacts. Genuine alpha transparency in background AND all open wheel-spoke gaps. No shadow or floor baked in; renderer adds shadow separately. No extra pipes, no plate, no text, no added accessories.

### rear-quarter.png

Single immutable MASTER motorcycle image for a visual configurator. Image 1 is authoritative bike identity: same teal custom V-Rod, black curved blade-spoke wheels, cognac quilt saddle, angular tank, SHORT stainless twin exhausts on motorcycle RIGHT only, no plate bracket. Image 2 is CAMERA AND FRAMING reference: use ONLY its BOTTOM LEFT cell, rear-right three-quarter view, rear wheel nearest left foreground. Render that same bike at this camera angle as one single very detailed 1536x1024 transparent image, not a sheet. Match the reference cell framing scaled exactly 2x, full vehicle inside canvas with contact points near y900 (side/quarter views) or y950 (axial views). Keep reference1 wheel spoke style, tank, radiator, handlebars, tire proportions and mechanical identity. Front tire visibly narrower than 300mm rear; do not redesign components. High-resolution crisp studio photography, accurate clean contours and visible stitching/metal/tread, no painterly smearing or artifacts. Genuine alpha transparency in background AND all open wheel-spoke gaps. No shadow or floor baked in; renderer adds shadow separately. No extra pipes, no plate, no text, no added accessories.

### left.png

Single immutable MASTER motorcycle image for a visual configurator. Image 1 is authoritative bike identity: same teal custom V-Rod, black curved blade-spoke wheels, cognac quilt saddle, angular tank, SHORT stainless twin exhausts on motorcycle RIGHT only, no plate bracket. Image 2 is CAMERA AND FRAMING reference: use ONLY its BOTTOM RIGHT cell, exact left profile facing left, belt drive visible and right-side exhaust hidden. Render that same bike at this camera angle as one single very detailed 1536x1024 transparent image, not a sheet. Match the reference cell framing scaled exactly 2x, full vehicle inside canvas with contact points near y900 (side/quarter views) or y950 (axial views). Keep reference1 wheel spoke style, tank, radiator, handlebars, tire proportions and mechanical identity. Front tire visibly narrower than 300mm rear; do not redesign components. High-resolution crisp studio photography, accurate clean contours and visible stitching/metal/tread, no painterly smearing or artifacts. Genuine alpha transparency in background AND all open wheel-spoke gaps. No shadow or floor baked in; renderer adds shadow separately. No extra pipes, no plate, no text, no added accessories.

### front.png

Single immutable MASTER motorcycle image for a visual configurator. Image 1 is authoritative bike identity: same teal custom V-Rod, black curved blade-spoke wheels, cognac quilt saddle, angular tank, SHORT stainless twin exhausts on motorcycle RIGHT only, no plate bracket. Image 2 is CAMERA AND FRAMING reference: use ONLY its BOTTOM LEFT cell, exact straight FRONT-ON view, front wheel centered, pipes on viewer LEFT only. Render that same bike at this camera angle as one single very detailed 1536x1024 transparent image, not a sheet. Match the reference cell framing scaled exactly 2x, full vehicle inside canvas with contact points near y900 (side/quarter views) or y950 (axial views). Keep reference1 wheel spoke style, tank, radiator, handlebars, tire proportions and mechanical identity. Front tire visibly narrower than 300mm rear; do not redesign components. High-resolution crisp studio photography, accurate clean contours and visible stitching/metal/tread, no painterly smearing or artifacts. Genuine alpha transparency in background AND all open wheel-spoke gaps. No shadow or floor baked in; renderer adds shadow separately. No extra pipes, no plate, no text, no added accessories.

### rear.png

Single immutable MASTER motorcycle image for a visual configurator. Image 1 is authoritative bike identity: same teal custom V-Rod, black curved blade-spoke wheels, cognac quilt saddle, angular tank, SHORT stainless twin exhausts on motorcycle RIGHT only, no plate bracket. Image 2 is CAMERA AND FRAMING reference: use ONLY its BOTTOM RIGHT cell, exact straight REAR-ON view, broad rear wheel centered, pipes on viewer RIGHT only. Render that same bike at this camera angle as one single very detailed 1536x1024 transparent image, not a sheet. Match the reference cell framing scaled exactly 2x, full vehicle inside canvas with contact points near y900 (side/quarter views) or y950 (axial views). Keep reference1 wheel spoke style, tank, radiator, handlebars, tire proportions and mechanical identity. Front tire visibly narrower than 300mm rear; do not redesign components. High-resolution crisp studio photography, accurate clean contours and visible stitching/metal/tread, no painterly smearing or artifacts. Genuine alpha transparency in background AND all open wheel-spoke gaps. No shadow or floor baked in; renderer adds shadow separately. No extra pipes, no plate, no text, no added accessories.
