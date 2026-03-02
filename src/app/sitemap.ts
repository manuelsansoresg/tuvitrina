import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obtener todas las tarjetas activas
  const cards = await prisma.businessCard.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  })

  const baseUrl = 'https://tuvitrina.xyz'

  const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${baseUrl}/${card.slug}`,
    lastModified: card.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...cardEntries,
  ]
}
