import type { NextConfig } from 'next'

// Host/IP selain localhost yang boleh memuat resource dev (HMR, /_next/*) saat `pnpm dev`,
// mis. akses lewat LAN: APP_ALLOWED_DEV_ORIGINS=192.168.101.39
const allowedDevOrigins = (process.env.APP_ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'most1058fm.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'minio-api-pusbahasa.10.70.0.45.nip.io',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
