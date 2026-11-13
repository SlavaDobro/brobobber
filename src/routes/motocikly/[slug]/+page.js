import { error } from '@sveltejs/kit'
import { styles, styleBySlug, projects } from '$lib/site/data.js'

export const entries = () => styles.map(s => ({ slug: s.slug }))

export function load({ params }) {
  const style = styleBySlug(params.slug)
  if (!style) error(404, 'Такого стиля нет')
  return { style, own: projects.filter(p => p.style === style.slug), topic: 'Кастомизация', requestTitle: `Хотите ${style.name.toLowerCase()}? Обсудим` }
}
