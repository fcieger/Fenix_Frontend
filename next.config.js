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
}

module.exports = nextConfig
