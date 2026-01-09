import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

const robots: MetadataRoute.Robots = () => {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/documentation/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

export default robots
