/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
}

module.exports = nextConfig
