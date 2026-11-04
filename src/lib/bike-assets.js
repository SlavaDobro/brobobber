// One immutable photograph per camera. Configuration never selects a different bike.
// Coordinates use the original 1536 × 1024 image; the canvas adds space for the floor.
export const frameSize = { width: 1536, height: 1100 }

export const bikeAssets = [
  { id: 'right', seatRegions: [[210, 310, 640, 475]], contacts: [[265, 879, 125], [1290, 882, 100]],
    overlay: 'right-twin', placement: [.9, .9, 0, 37], exhaustRegions: [[270, 590, 730, 775]] },
  { id: 'front-quarter', seatRegions: [[220, 285, 610, 470]], contacts: [[240, 938, 140], [1285, 971, 115]],
    overlay: 'front-quarter-twin', placement: [.9, .9, -6, 39], exhaustRegions: [[190, 600, 635, 815]] },
  { id: 'front', seatRegions: [[530, 275, 610, 375], [930, 275, 1010, 375]], contacts: [[770, 1016, 115]],
    overlay: null, exhaustRegions: [[482, 590, 562, 762]] },
  { id: 'left', seatRegions: [[900, 310, 1325, 475]], contacts: [[255, 879, 105], [1280, 885, 125]],
    overlay: null, exhaustRegions: [] },
  { id: 'rear', seatRegions: [[580, 185, 950, 298], [580, 298, 655, 370], [880, 298, 950, 370]], contacts: [[770, 1015, 170]],
    overlay: null, exhaustRegions: [[950, 648, 1050, 841]] },
  { id: 'rear-quarter', seatRegions: [[270, 235, 800, 425]], contacts: [[340, 1010, 180], [1360, 884, 90]],
    overlay: 'rear-quarter-twin', placement: [.88, .83, 50, 80], exhaustRegions: [[490, 575, 950, 805]] },
]

/** @param {string} id */
export const assetPath = id => `/images/vrod/${id}.png`

// Future parts must supply a registered transparent overlay (or a clean base +
// replacement + foreground occluder). Never swap the complete photograph for a part.
export const layerOrder = ['floor', 'base', 'exhaust', 'foreground']
