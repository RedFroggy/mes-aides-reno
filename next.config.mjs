/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return process.env.NEXT_PUBLIC_COMMIT_ID
  },
  /* not sure if needed
		experimental: {
		serverComponentsExternalPackages: ['publicodes'],
		*/
  compiler: {
    styledComponents: true,
  },
  typescript: { ignoreBuildErrors: true },

  turbopack: {
    rules: {
      '*.yaml': { loaders: ['yaml-loader'], as: '*.js' },
      '*.yml': { loaders: ['yaml-loader'], as: '*.js' },
      '*.publicodes': { loaders: ['yaml-loader'], as: '*.js' },
      '*.csv': {
        loaders: [
          {
            loader: 'csv-loader',
            options: {
              dynamicTyping: true,
              header: true,
              skipEmptyLines: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },

  // Kept for `next build --webpack` fallback
  webpack: (config) => {
    config.module.rules.push({
      test: /(\.ya?ml$)|\.publicodes/,
      use: 'yaml-loader',
    })

    config.module.rules.push({
      test: /\.csv$/,
      loader: 'csv-loader',
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
      },
    })

    config.module.rules.push({
      test: /\.woff2$/,
      type: 'asset/resource',
    })

    return config
  },

  async headers() {
    return [
      // Security headers (RGS compliance)
      // {
      //   source: '/:path*',
      //   headers: [
      //     { key: 'X-Frame-Options', value: 'DENY' },
      //     { key: 'X-Content-Type-Options', value: 'nosniff' },
      //     { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      //     { key: 'X-XSS-Protection', value: '1; mode=block' },
      //     { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      //   ],
      // },
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'DELETE, GET, PATCH, POST, PUT, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization, X-Api-Version',
          },
        ],
      },
    ]
  },

  async rewrites() {
    return [{ source: '/feed.xml', destination: '/_next/static/feed.xml' }]
  },

  async redirects() {
    return [{ source: '/guide', destination: '/guide.html', permanent: false }]
  },
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'commons.wikimedia.org' }],
  },
}

export default nextConfig
