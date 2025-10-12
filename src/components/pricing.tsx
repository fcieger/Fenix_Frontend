"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, Zap } from "lucide-react"

const plans = [
  {
    name: "Básico",
    price: "29",
    period: "/mês",
    description: "Perfeito para pequenas empresas",
    features: [
      "Até 5 usuários",
      "1 empresa",
      "Gestão de produtos",
      "Controle de vendas",
      "Relatórios básicos",
      "Suporte por email",
      "2GB de armazenamento"
    ],
    popular: false,
    color: "from-gray-500 to-gray-600"
  },
  {
    name: "Profissional",
    price: "79",
    period: "/mês",
    description: "Ideal para empresas em crescimento",
    features: [
      "Até 20 usuários",
      "Até 3 empresas",
      "IA integrada",
      "Relatórios avançados",
      "API completa",
      "Integrações",
      "Suporte prioritário",
      "10GB de armazenamento",
      "Backup automático"
    ],
    popular: true,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Empresarial",
    price: "149",
    period: "/mês",
    description: "Para grandes operações",
    features: [
      "Usuários ilimitados",
      "Empresas ilimitadas",
      "IA avançada",
      "Integrações customizadas",
      "Suporte dedicado",
      "Treinamento incluído",
      "Armazenamento ilimitado",
      "SLA 99.9%",
      "Consultoria especializada"
    ],
    popular: false,
    color: "from-blue-500 to-cyan-500"
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
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
            Planos que cabem no seu{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              bolso
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para sua empresa e comece a transformar sua gestão hoje mesmo.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <Card className={`h-full relative overflow-hidden ${
                plan.popular 
                  ? 'border-2 border-purple-200 shadow-2xl scale-105' 
                  : 'shadow-lg hover:shadow-xl'
              } transition-all duration-300`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600" />
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">R$</span>
                    <span className={`text-6xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-xl ml-2">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full text-lg py-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    size="lg"
                  >
                    {plan.popular ? (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Começar Grátis
                      </div>
                    ) : (
                      "Escolher Plano"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Todos os planos incluem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Teste Grátis</h4>
                <p className="text-gray-600">14 dias sem compromisso</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Suporte 24/7</h4>
                <p className="text-gray-600">Sempre aqui para ajudar</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Atualizações</h4>
                <p className="text-gray-600">Novos recursos constantemente</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
