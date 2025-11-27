"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Bot,
  Users,
  Package,
  CheckCircle,
  Brain,
  MessageSquare,
  Wand2,
  Lightbulb,
  Rocket,
  Zap,
  Shield,
  Target,
  FileText,
  Camera,
  Sparkles,
} from "lucide-react";

export default function AssistentesPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando assistentes...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const assistentes = [
    {
      id: "cadastros-ai",
      title: "Assistente de Cadastros",
      description:
        "Criação inteligente de cadastros de clientes, fornecedores, transportadoras e outros tipos de pessoas/companiess. Extrai automaticamente dados de CNPJ, CPF, endereços e identifica tipos de cadastro.",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      href: "/partners",
      features: [
        "Detecção automática de CNPJ e CPF",
        "Consulta à API CNPJA para dados completos",
        "Identificação inteligente de tipos de cadastro",
        "Extração de endereços via CEP",
        "Limpeza automática de verbos e artigos",
      ],
      status: "Ativo",
    },
    {
      id: "produtos-ai",
      title: "Assistente de Produtos",
      description:
        "Criação inteligente de produtos com extração automática de especificações técnicas, preços, categorias e características. Reconhece marcas, unidades de medida e categoriza produtos automaticamente.",
      icon: Package,
      color: "from-purple-500 to-pink-500",
      href: "/products",
      features: [
        "Categorização automática de produtos",
        "Detecção de marcas conhecidas",
        "Extração de preços e especificações",
        "Reconhecimento de unidades de medida",
        "Classificação tributária inteligente",
      ],
      status: "Ativo",
    },
    {
      id: "ia-compras",
      title: "IA: Lançar Nota Fiscal",
      description:
        "Tire uma foto da nota fiscal de compra e deixe a IA processar tudo automaticamente. Extrai dados completos da nota, identifica produtos, valores e cria o pedido de compra em segundos.",
      icon: Camera,
      color: "from-orange-500 to-red-500",
      href: "/purchases/ia-lancar",
      features: [
        "OCR avançado para leitura de notas fiscais",
        "Extração automática de fornecedor e produtos",
        "Detecção de valores, quantidades e impostos",
        "Criação automática de pedido de compra",
        "Processamento em ~1 minuto",
      ],
      status: "Ativo",
      badge: "NOVO",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Assistentes de IA
            </h1>
            <p className="text-gray-600 mt-1">
              Inteligência artificial para automatizar suas tarefas
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Potencialize sua produtividade com IA
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossos assistentes de inteligência artificial automatizam tarefas
            complexas, extraem dados automaticamente e criam registros completos
            em segundos.
          </p>
        </div>

        {/* Assistents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {assistentes.map((assistente, index) => {
            const Icon = assistente.icon;
            return (
              <motion.div
                key={assistente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div
                    className={`h-2 bg-gradient-to-r ${assistente.color}`}
                  ></div>

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${assistente.color} rounded-xl flex items-center justify-center mr-4`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {assistente.title}
                            </h3>
                            {assistente.badge && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                                {assistente.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-green-600 font-medium">
                              {assistente.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(assistente.href)}
                        className={`px-4 py-2 bg-gradient-to-r ${assistente.color} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2 group-hover:scale-105`}
                      >
                        <Rocket className="w-4 h-4" />
                        <span>Acessar</span>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {assistente.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Wand2 className="w-4 h-4 mr-2 text-purple-600" />
                        Principais Recursos
                      </h4>
                      <ul className="space-y-2">
                        {assistente.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        <span>Powered by Jall.ai</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Por que usar nossos Assistentes de IA?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa tecnologia de inteligência artificial foi desenvolvida
              especificamente para o seu negócio, oferecendo precisão e
              eficiência incomparáveis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Velocidade
              </h4>
              <p className="text-gray-600 text-sm">
                Crie registros completos em segundos, não minutos. Nossa IA
                processa informações instantaneamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Precisão
              </h4>
              <p className="text-gray-600 text-sm">
                Extração automática e precisa de dados de documentos, CNPJ, CEP
                e outras fontes confiáveis.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Confiabilidade
              </h4>
              <p className="text-gray-600 text-sm">
                Dados sempre atualizados e verificados através de APIs oficiais
                e fontes confiáveis.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Escolha um dos assistentes acima e experimente o poder da
              inteligência artificial em suas tarefas diárias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/partners")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Assistente de Cadastros</span>
              </button>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>Assistente de Produtos</span>
              </button>
              <button
                onClick={() => router.push("/purchases/ia-lancar")}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>IA: Lançar NF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
