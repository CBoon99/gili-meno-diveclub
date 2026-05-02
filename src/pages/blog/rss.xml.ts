/**
 * Blog RSS feed at /blog/rss.xml.
 *
 * Generated at build time. Lives under /blog/ so the slug doesn't clash
 * with the rest of the site, and is auto-discoverable from the BaseLayout
 * <link rel="alternate" type="application/rss+xml"> tag added in Phase 1.
 */
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE_CONFIG } from '@/consts'
import { cleanSlug } from '@/lib/slug'

export const prerender = true

export async function GET(context: { site: URL | undefined }) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )

  return rss({
    title: 'Bubble Diaries — Meno Dive Club',
    description:
      'Diving guides, conservation news, and stories from Meno Dive Club, Gili Meno, Indonesia.',
    site: context.site ?? SITE_CONFIG.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/blog/${cleanSlug(post.id)}/`,
      categories: post.data.tags,
      author: `${SITE_CONFIG.contact.email} (${post.data.author})`,
    })),
    customData: `<language>en-au</language>
    <copyright>© ${new Date().getFullYear()} ${SITE_CONFIG.name}</copyright>`,
    stylesheet: '/rss-style.xsl',
  })
}
