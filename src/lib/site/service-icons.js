// One tool per service, used instead of "01, 02, 03" wherever services are listed:
// the tool chest on /uslugi, the services index, the motorcycle poster.
import { PencilRuler, Gauge, Wrench, Cpu, Armchair, Fuel, Lightbulb, Type, Sparkles, MessagesSquare, GraduationCap, PackagePlus, Truck } from '@lucide/svelte'

/** @type {Record<string, typeof Wrench>} */
export const serviceIcons = {
  kastomizaciya: PencilRuler,
  tyuning: Gauge,
  obsluzhivanie: Wrench,
  'proshivka-ebu': Cpu,
  sideniya: Armchair,
  'nakladki-na-bak': Fuel,
  elektronika: Lightbulb,
  'nadpisi-na-shinah': Type,
  deteyling: Sparkles,
  konsultacii: MessagesSquare,
  kursy: GraduationCap,
  dopolnitelnye: PackagePlus,
  motoevakuator: Truck,
}

/** @param {string} slug */
export const serviceIcon = slug => serviceIcons[slug] ?? Wrench

// The logo's hex nut, as an SVG polygon in a -12…12 box.
export const hexPoints = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
