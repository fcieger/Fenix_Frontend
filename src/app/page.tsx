import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import Pricing from "@/components/pricing"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  )
}