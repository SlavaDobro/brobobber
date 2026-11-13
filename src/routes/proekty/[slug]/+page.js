import { error } from '@sveltejs/kit'
import { projects, projectBySlug } from '$lib/site/data.js'

export const entries = () => projects.map(p => ({ slug: p.slug }))

export function load({ params }) {
  const project = projectBySlug(params.slug)
  if (!project) error(404, 'Такого проекта нет')
  const index = projects.indexOf(project)
  const next = projects[(index + 1) % projects.length]
  const more = projects.filter(p => p.slug !== project.slug && (p.brand === project.brand || p.style === project.style)).slice(0, 3)
  return { project, next, more: more.length ? more : projects.filter(p => p !== project).slice(0, 3), topic: 'Кастомизация', requestTitle: 'Хотите похожий проект?' }
}
