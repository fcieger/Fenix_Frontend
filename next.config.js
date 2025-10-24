/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
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
  // Desabilitar ESLint durante build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desabilitar TypeScript durante build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
