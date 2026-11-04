// Astra edit jobs for the V-Rod configurator. Each job edits one frozen base view.
// Raw edits land in .local/astra/ (git-ignored); scripts/layers/build.mjs turns them into layers.

export const views = ['right', 'front-quarter', 'front', 'left', 'rear', 'rear-quarter']

const keep = 'Keep identical canvas size 1536x1024, identical framing, camera, position and scale of the motorcycle, and keep the transparent background including the transparent gaps between wheel spokes.'

const maskPrompt = view =>
  'Precise segmentation-style recolor EDIT of the attached motorcycle photo (1536x1024, transparent background). ' +
  'Change ONLY the colors of three material groups, as perfectly FLAT solid fills with no shading, no highlights, no texture, no gradients: ' +
  '(1) every PAINTED TEAL BODY PANEL - fuel tank, side panels, rear fender under the seat, front fender - becomes flat pure magenta #FF00FF; ' +
  '(2) the LEATHER SADDLE (all visible leather) becomes flat pure green #00FF00; ' +
  '(3) the BLACK ALLOY WHEEL RIMS and their spokes, where visible (NOT the tires, NOT the brake discs, NOT hubs or calipers) become flat pure blue #0000FF. ' +
  'If a group is not visible from this camera, do not invent it. Every other pixel - tires, engine, frame, forks, exhaust, chrome, brake discs, handlebars, headlight - stays exactly as in the source. ' +
  keep + ` (view: ${view})`

const exhaustSide = {
  right: 'right side profile: the exhaust is on the near side, below the engine',
  'front-quarter': 'front-right three-quarter view: the exhaust is on the near (right) side',
  front: 'straight front view: the exhaust is visible on the VIEWER LEFT (motorcycle right) beside the front tire',
  rear: 'straight rear view: the tips are visible on the VIEWER RIGHT (motorcycle right) beside the rear tire, seen end-on',
  'rear-quarter': 'rear-right three-quarter view: the exhaust is on the near (right) side, tips pointing toward the camera-left rear',
}

const exhausts = {
  drag: 'a 2-into-2 drag-style exhaust in SATIN BLACK ceramic coating: two long parallel straight black pipes running from the front cylinder ports back along the lower right side, ending with angled slash-cut tips just past the rear axle, with two small black heat shields with three slots each. Headers are black too.',
  shotgun: 'a 2-into-2 shotgun exhaust in POLISHED CHROME: two long parallel straight mirror-chrome pipes from the front cylinder ports back along the lower right side, ending with straight-cut tips just past the rear axle, with chrome headers and two thin chrome mounting straps.',
}

const exhaustPrompt = (view, kind, withReference) =>
  `Precise localized product-photo EDIT of the attached custom Harley-Davidson V-Rod, ${exhaustSide[view]}. ` +
  'Replace ONLY the exhaust: remove the two short brushed-stainless silencers and their curved stainless headers, and install ' + exhausts[kind] + ' ' +
  (withReference ? 'The SECOND attached image shows exactly this exhaust installed on the same motorcycle from the right side: reproduce the same pipes, tips, shields and finish, seen from this camera. ' : '') +
  'Realistic studio lighting matching the photo. Restore any engine, frame or wheel surfaces the old pipes covered, consistent with the rest of the bike. ' +
  'Everything else stays pixel-identical: wheels, tires, brake discs, engine, frame, swingarm, rear shock, footpegs, tank, saddle, colors. ' + keep

const cowlSide = {
  right: 'right side profile',
  'front-quarter': 'front-right three-quarter view. The smoked tinted VISOR must be clearly visible rising ABOVE the headlight, its top edge reaching about the height of the handlebar clamp, exactly as in the second image',
  front: 'straight front view. The smoked tinted VISOR must be clearly visible as a trapezoid rising ABOVE the headlight between the fork legs, its top edge reaching about the height of the handlebar clamp, exactly as in the second image',
  left: 'left side profile', 'rear-quarter': 'rear-right three-quarter view (the headlight is mostly hidden, only the cowl top edge may show)',
}

const cowlPrompt = (view, withReference) =>
  `Precise localized product-photo EDIT of the attached custom Harley-Davidson V-Rod, ${cowlSide[view]}. ` +
  'Add ONLY a small CARBON FIBER headlight cowl (short flyscreen) mounted on the round headlight: a compact smoked-black carbon shell wrapping the top and sides of the headlight, ' +
  'with a short tinted visor rising about 8 cm above the headlight, visible 2x2 carbon weave with clear-coat reflections, attached with two small black bolts. ' +
  (withReference ? 'The SECOND attached image shows exactly this cowl on the same motorcycle: reproduce the same part from this camera. ' : '') +
  'Do not change the headlight lens, handlebars, mirrors, forks, gauges or anything else. Everything else stays pixel-identical. ' + keep

// Backdrops for the configurator stage: the motorcycle is composited on top.
const environments = {
  workshop: 'an empty custom motorcycle workshop at night: dark moody industrial interior, smooth dark polished concrete floor with soft reflections, old brick wall with a pegboard of hand tools and a closed steel roller door far behind, softly out of focus, warm tungsten work lamps hanging from the ceiling, a little haze in the light beams',
  night: 'an empty wide city street at night after rain: wet dark asphalt with long reflections of warm street lamps and a few distant red and teal signs, brick warehouse facades softly out of focus, light mist, cinematic but calm',
}

const environmentPrompt = scene =>
  `Photorealistic wide landscape photograph used as a BACKDROP for a motorcycle configurator: ${scene}. ` +
  'Camera at about 1 metre height looking straight ahead with a natural 50 mm lens, level horizon. The FLOOR occupies the lower 35% of the frame, the horizon line sits at about 62% from the top. ' +
  'The middle of the frame is completely EMPTY open floor space where a motorcycle will be composited later: no motorcycles, no vehicles, no people, no furniture in the middle. ' +
  'Background slightly defocused so a sharp product in front stands out. No text, no logos, no watermarks. Landscape 1536x1024.'

const raw = (name) => `.local/astra/${name}.png`
const base = view => `public/images/vrod/${view}.png`

export function jobs() {
  const list = []
  for (const view of views) list.push({ name: `${view}-mask`, prompt: maskPrompt(view), refs: [base(view)] })
  for (const kind of Object.keys(exhausts)) {
    // The right view defines the part; the other cameras copy it.
    list.push({ name: `right-exhaust-${kind}`, prompt: exhaustPrompt('right', kind, false), refs: [base('right')] })
    for (const view of ['front-quarter', 'rear-quarter', 'front', 'rear']) {
      list.push({ name: `${view}-exhaust-${kind}`, prompt: exhaustPrompt(view, kind, true), refs: [base(view), raw(`right-exhaust-${kind}`)], after: `right-exhaust-${kind}` })
    }
  }
  // Material masks of the exhaust edits: new pipes over a wheel must not take the wheel colour.
  for (const kind of Object.keys(exhausts)) {
    for (const view of ['right', 'front-quarter', 'rear-quarter', 'front', 'rear']) {
      const name = `${view}-exhaust-${kind}`
      list.push({ name: `${name}-mask`, prompt: maskPrompt(view), refs: [raw(name)], after: name })
    }
  }
  list.push({ name: 'right-cowl', prompt: cowlPrompt('right', false), refs: [base('right')] })
  for (const view of ['front-quarter', 'front', 'left', 'rear-quarter']) {
    list.push({ name: `${view}-cowl`, prompt: cowlPrompt(view, true), refs: [base(view), raw('right-cowl')], after: 'right-cowl' })
  }
  for (const [id, scene] of Object.entries(environments)) list.push({ name: `env-${id}`, prompt: environmentPrompt(scene), refs: [] })
  return list.map(job => ({ ...job, output: raw(job.name) }))
}
