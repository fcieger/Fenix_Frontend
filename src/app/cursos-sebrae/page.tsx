'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { 
  ExternalLink, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  TrendingUp,
  DollarSign,
  Users,
  Lightbulb,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function CursosSebraePage() {
  const [countdown, setCountdown] = useState(3);
  const [autoRedirect, setAutoRedirect] = useState(false);

  const sebraeUrl = 'https://sebrae.com.br/sites/PortalSebrae/cursosonline';

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      window.open(sebraeUrl, '_blank', 'noopener,noreferrer');
      setAutoRedirect(false);
      setCountdown(3);
    }
  }, [countdown, autoRedirect]);

  const cursosDestaque = [
    {
      titulo: 'Marketing Digital',
      descricao: 'Primeiros passos, redes sociais e estratégias para vender mais online',
      duracao: '7-10h',
      qtdCursos: '15+ cursos',
      icon: TrendingUp,
      cor: 'from-purple-500 to-pink-500'
    },
    {
      titulo: 'Gestão Financeira',
      descricao: 'Controle de fluxo de caixa, formação de preços e gestão eficiente',
      duracao: '6-10h',
      qtdCursos: '12+ cursos',
      icon: DollarSign,
      cor: 'from-green-500 to-emerald-500'
    },
    {
      titulo: 'Como Vender Mais',
      descricao: 'Técnicas de vendas, atendimento ao cliente e fidelização',
      duracao: '6-8h',
      qtdCursos: '10+ cursos',
      icon: Users,
      cor: 'from-blue-500 to-cyan-500'
    },
    {
      titulo: 'Inovação',
      descricao: 'Pré-aceleração de startups e novos modelos de negócio',
      duracao: '12-85h',
      qtdCursos: '20+ cursos',
      icon: Lightbulb,
      cor: 'from-orange-500 to-yellow-500'
    }
  ];

  const handleAcessar = () => {
    window.open(sebraeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30"></div>
              <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Cursos Sebrae
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                Capacitação 100% gratuita para empreendedores
              </p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Acesse Agora o Portal Sebrae</h2>
                <p className="text-green-50 mb-4">
                  Mais de 100 cursos online gratuitos com certificado. Aprenda no seu ritmo e 
                  transforme seu negócio!
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>100% Gratuito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Certificado Digital</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>Estude no seu ritmo</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAcessar}
                  className="px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all hover:scale-105 shadow-xl flex items-center gap-3 whitespace-nowrap"
                >
                  <ExternalLink className="h-6 w-6" />
                  Acessar Portal Sebrae
                </button>
                <p className="text-xs text-green-100 text-center">
                  Abre em uma nova janela
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cursos em Destaque */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              Categorias de Cursos
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              + de 100 cursos disponíveis
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cursosDestaque.map((curso, index) => {
              const Icon = curso.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                  onClick={handleAcessar}
                >
                  <div className={`h-2 bg-gradient-to-r ${curso.cor}`}></div>
                  <div className="p-6">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${curso.cor} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{curso.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3">{curso.descricao}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {curso.duracao}
                      </span>
                      <span className="text-green-600 font-semibold">Gratuito</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-purple-600 font-semibold">
                        {curso.qtdCursos} nesta categoria
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>💡 Atenção:</strong> Estes são apenas exemplos de categorias. 
              O portal completo tem <strong>mais de 100 cursos atualizados</strong> em diversas áreas!
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Por que fazer cursos do Sebrae?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Totalmente Gratuito</h4>
              <p className="text-gray-600">Todos os cursos são 100% gratuitos, sem taxas ou mensalidades</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Certificado Digital</h4>
              <p className="text-gray-600">Receba certificado reconhecido ao concluir cada curso</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">No Seu Ritmo</h4>
              <p className="text-gray-600">Estude quando e onde quiser, no seu próprio tempo</p>
            </div>
          </div>
        </div>

        {/* Atualização Constante */}
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Sparkles className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                🔄 Sempre Atualizado!
              </h3>
              <p className="text-gray-700 mb-3">
                O Sebrae atualiza constantemente seu catálogo de cursos. Esta página mostra apenas 
                algumas categorias, mas ao clicar no botão você terá acesso a <strong>todos os cursos 
                disponíveis</strong>, incluindo os lançamentos mais recentes!
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✨ Novos cursos adicionados regularmente</li>
                <li>📱 Cursos por WhatsApp e cursos ao vivo</li>
                <li>🎮 Jogos educativos interativos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
          <GraduationCap className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pronto para começar?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Invista em você e no seu negócio. Milhares de empreendedores já se capacitaram com o Sebrae.
          </p>
          <button
            onClick={handleAcessar}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all hover:scale-105 inline-flex items-center gap-3"
          >
            <ExternalLink className="h-6 w-6" />
            Acessar Cursos Agora
          </button>
        </div>
      </div>
    </Layout>
  );
}

