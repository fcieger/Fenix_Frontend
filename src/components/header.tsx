"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, Zap, User, LogOut } from "lucide-react"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FENIX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Recursos
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Preços
            </Link>
            <Link
              href="#contact"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Contato
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>Olá, {user?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => router.push('/register')}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link
                href="#features"
                className="block text-gray-600 hover:text-purple-600 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link
                href="#pricing"
                className="block text-gray-600 hover:text-purple-600 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Preços
              </Link>
              <Link
                href="#contact"
                className="block text-gray-600 hover:text-purple-600 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-700 px-3 py-2">
                      <User className="w-4 h-4" />
                      <span>Olá, {user?.name}</span>
                    </div>
                    <Button variant="ghost" className="w-full" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
                      Entrar
                    </Button>
                    <Button className="w-full" onClick={() => router.push('/register')}>
                      Cadastrar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  )
}
