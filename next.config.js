/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Configurações para resolver problemas de hidratação
  reactStrictMode: true,
  // Configurações de compilação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuração para Docker (remover standalone temporariamente)
  // output: 'standalone',
  // Configurações de experimental
  experimental: {
    // Otimizações para produção
    optimizeCss: true,
  },
  // Desabilitar TypeScript durante build
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
}

module.exports = nextConfig
