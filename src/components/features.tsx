"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  BarChart3, 
  Shield, 
  Brain, 
  Users, 
  Zap, 
  Lock,
  TrendingUp,
  Globe
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Gestão Completa",
    description: "Gerencie produtos, clientes, vendas e muito mais em uma única plataforma integrada.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados protegidos com criptografia de ponta e backup automático na nuvem.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Brain,
    title: "IA Integrada",
    description: "Inteligência artificial para automatizar processos e gerar insights valiosos.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Multi-usuário",
    description: "Trabalhe em equipe com controle de acesso e permissões personalizáveis.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Interface rápida e responsiva, otimizada para máxima produtividade.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Lock,
    title: "Privacidade",
    description: "Conformidade total com LGPD e proteção avançada de dados empresariais.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Relatórios detalhados e dashboards em tempo real para tomada de decisões.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Globe,
    title: "Multi-empresa",
    description: "Gerencie múltiplas empresas com um único login e interface unificada.",
    color: "from-cyan-500 to-blue-500"
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Por que escolher o{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FENIX?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma completa que combina simplicidade com poder para transformar sua gestão empresarial.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para transformar sua gestão?
            </h3>
            <p className="text-gray-600 mb-6">
              Junte-se a mais de 1000 empresas que já confiam no FENIX para suas operações.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Começar Teste Grátis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-300"
              >
                Agendar Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
