let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      // Add your image domains here if needed
      "res.cloudinary.com", 
      "localhost"
    ]
  },
  generateEtags: false,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  
  output: 'standalone',
  
  async headers() {
    return [
      {

        source: '/api/:path*',
        headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }, // 🔧 Clave para permitir postMessage
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' }, // ⚠️ Mejor especificar el dominio en producción
        { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    authInterrupts: true,
    isrMemoryCacheSize: 0, 
    instrumentationHook: true,
  },
}

if (userConfig) {

  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig