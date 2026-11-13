import { error } from '@sveltejs/kit'
import { services, serviceBySlug, projects } from '$lib/site/data.js'

export const entries = () => services.map(s => ({ slug: s.slug }))

export function load({ params }) {
  const service = serviceBySlug(params.slug)
  if (!service) error(404, 'Такой услуги нет')
  const related = (service.projects ?? []).map(slug => projects.find(p => p.slug === slug)).filter(Boolean)
  return { service, related, topic: service.name, requestTitle: `Обсудим: ${service.name.toLowerCase()}` }
}
