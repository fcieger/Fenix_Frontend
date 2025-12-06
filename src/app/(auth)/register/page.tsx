"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import {
  makeCnpjRequest,
  extractCompanyData,
  CnpjResponse,
} from "@/lib/cnpj-api";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Building2,
  Search,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  cpf: string;
  password: string;
  userType: "pessoa-fisica" | "pessoa-juridica";
}

interface CompanyData {
  name: string;
  cnpj: string;
  founded: string;
  nature: string;
  size: string;
  status: string;
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };
  mainActivity: string;
  phones: Array<{ type: string; area: string; number: string }>;
  emails: Array<{ ownership: string; address: string }>;
  members: Array<{ name: string; role: string; type: string }>;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    cpf: "",
    password: "",
    userType: "pessoa-juridica",
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Busca automática do CNPJ com debounce
  useEffect(() => {
    if (data.userType === "pessoa-fisica" || !data.cnpj) {
      setCompanyData(null);
      return;
    }

    // Verifica se o CNPJ está completo (14 dígitos)
    const cnpjNumbers = data.cnpj.replace(/\D/g, "");
    if (cnpjNumbers.length !== 14) {
      setCompanyData(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchingCnpj(true);
      try {
        const response = await makeCnpjRequest<CnpjResponse>(data.cnpj);
        if (response) {
          const companyInfo = extractCompanyData(response);
          setCompanyData(companyInfo);
          console.log("✅ Dados da API CNPJA carregados:", companyInfo);
        } else {
          // API não retornou dados - criar empresa apenas com CNPJ
          setCompanyData({
            name: "",
            cnpj: data.cnpj,
            founded: "",
            nature: "",
            size: "",
            status: "",
            address: {
              street: "",
              number: "",
              district: "",
              city: "",
              state: "",
              zip: "",
            },
            mainActivity: "",
            phones: [],
            emails: [],
            members: [],
          });
          console.log(
            "⚠️ API não retornou dados - empresa será criada apenas com CNPJ"
          );
        }
      } catch (error) {
        console.error("❌ Erro ao consultar API CNPJA:", error);
        // Em caso de erro - criar empresa apenas com CNPJ
        setCompanyData({
          name: "",
          cnpj: data.cnpj,
          founded: "",
          nature: "",
          size: "",
          status: "",
          address: {
            street: "",
            number: "",
            district: "",
            city: "",
            state: "",
            zip: "",
          },
          mainActivity: "",
          phones: [],
          emails: [],
          members: [],
        });
        console.log("⚠️ Erro na API - empresa será criada apenas com CNPJ");
      } finally {
        setSearchingCnpj(false);
      }
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [data.cnpj, data.userType]);

  const validateStep1 = () => {
    return (
      data.name.trim() !== "" &&
      data.email.trim() !== "" &&
      data.phone.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    );
  };

  const validateStep2 = () => {
    if (data.userType === "pessoa-fisica") {
      return (
        data.cpf.trim() !== "" &&
        data.password.trim() !== "" &&
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf)
      );
    } else {
      return (
        data.cnpj.trim() !== "" &&
        data.password.trim() !== "" &&
        /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };

      // Mapear endereço para o formato esperado pelo SDK
      // O SDK requer neighborhood e zipCode como strings (não undefined)
      const mapAddress = (addr: any) => {
        return {
          street: addr?.street || "",
          number: addr?.number || "",
          complement: addr?.complement || "",
          neighborhood: addr?.district || addr?.neighborhood || "",
          city: addr?.city || "",
          state: addr?.state || "",
          zipCode: addr?.zip || addr?.zipCode || "",
        };
      };

      const companyDataToSubmit = {
        name:
          data.userType === "pessoa-fisica"
            ? data.name
            : companyData?.name || "",
        cnpj: data.userType === "pessoa-fisica" ? data.cpf : data.cnpj,
        // Sempre incluir address mesmo que vazio, pois o SDK pode requerer
        address: mapAddress(companyData?.address),
        ...(data.userType === "pessoa-juridica" && companyData
          ? {
              founded: companyData.founded,
              nature: companyData.nature,
              size: companyData.size,
              status: companyData.status,
              mainActivity: companyData.mainActivity,
              phones: companyData.phones,
              emails: companyData.emails,
              members: companyData.members,
            }
          : {}),
      };

      console.log("Dados sendo enviados:", {
        userData,
        companyData: companyDataToSubmit,
      });
      await register(userData, companyDataToSubmit);
      console.log("Registro realizado com sucesso!");

      toast.success("Cadastro realizado com sucesso!", {
        description: "Redirecionando para o dashboard...",
      });

      // Redirecionar para o dashboard após registro bem-sucedido
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro no cadastro:", error);

      const errorInfo = SdkErrorHandler.handleError(error);

      // Se for erro de validação, mostrar detalhes
      if (SdkErrorHandler.isValidationError(error) && errorInfo.errors) {
        const validationMessages = SdkErrorHandler.formatValidationErrors(
          errorInfo.errors
        );
        toast.error("Erro de Validação", {
          description:
            validationMessages.length > 0
              ? validationMessages.join("\n")
              : errorInfo.message,
          duration: 10000,
        });
      } else {
        // Erro genérico
        toast.error("Erro no cadastro", {
          description:
            errorInfo.message ||
            "Ocorreu um erro ao realizar o cadastro. Tente novamente.",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 shadow-2xl border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? "Criar sua conta" : "Finalizar cadastro"}
            </h1>
            <p className="text-gray-600">
              {step === 1
                ? "Preencha seus dados pessoais para começar"
                : "Complete as informações da sua empresa"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div
                className={`w-16 h-1 ${
                  step >= 2
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
            </div>
          </div>

          {/* Step 1: Personal Data */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <Input
                  type="tel"
                  value={data.phone}
                  onChange={(e) =>
                    setData({ ...data, phone: formatPhone(e.target.value) })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full"
                />
              </div>

              <Button
                onClick={nextStep}
                disabled={!validateStep1()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg"
              >
                Avançar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Company Data */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Tipo de Cadastro
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={
                      data.userType === "pessoa-juridica"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setData({ ...data, userType: "pessoa-juridica" })
                    }
                    className={`h-12 ${
                      data.userType === "pessoa-juridica"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Pessoa Jurídica
                  </Button>
                  <Button
                    type="button"
                    variant={
                      data.userType === "pessoa-fisica" ? "default" : "outline"
                    }
                    onClick={() =>
                      setData({ ...data, userType: "pessoa-fisica" })
                    }
                    className={`h-12 ${
                      data.userType === "pessoa-fisica"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Pessoa Física
                  </Button>
                </div>
              </div>

              {/* CNPJ/CPF Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {data.userType === "pessoa-juridica"
                    ? "CNPJ da Empresa *"
                    : "CPF *"}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={
                      data.userType === "pessoa-juridica" ? data.cnpj : data.cpf
                    }
                    onChange={(e) => {
                      if (data.userType === "pessoa-juridica") {
                        setData({ ...data, cnpj: formatCNPJ(e.target.value) });
                      } else {
                        setData({ ...data, cpf: formatCPF(e.target.value) });
                      }
                    }}
                    placeholder={
                      data.userType === "pessoa-juridica"
                        ? "00.000.000/0000-00"
                        : "000.000.000-00"
                    }
                    className="w-full pr-10"
                  />
                  {data.userType === "pessoa-juridica" && searchingCnpj && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                  )}
                  {data.userType === "pessoa-juridica" &&
                    !searchingCnpj &&
                    data.cnpj && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                </div>
                {data.userType === "pessoa-juridica" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Digite o CNPJ completo para buscar automaticamente os dados
                    da empresa
                  </p>
                )}
              </div>

              {/* Company Data Display */}
              {data.userType === "pessoa-juridica" && companyData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-lg p-4 ${
                    companyData.name
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <h4
                    className={`font-semibold mb-3 flex items-center ${
                      companyData.name ? "text-green-800" : "text-yellow-800"
                    }`}
                  >
                    {companyData.name ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    {companyData.name
                      ? "Dados da Empresa Encontrados"
                      : "Empresa Não Encontrada na API"}
                  </h4>

                  {companyData.name ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
                      <div>
                        <p>
                          <strong>Nome:</strong> {companyData.name}
                        </p>
                        <p>
                          <strong>Natureza:</strong>{" "}
                          {companyData.nature || "Não informado"}
                        </p>
                        <p>
                          <strong>Porte:</strong>{" "}
                          {companyData.size || "Não informado"}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {companyData.status || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Endereço:</strong>
                        </p>
                        <p className="ml-2">
                          {companyData.address.street || "Não informado"},{" "}
                          {companyData.address.number || "S/N"}
                        </p>
                        <p className="ml-2">
                          {companyData.address.district || "Não informado"}
                        </p>
                        <p className="ml-2">
                          {companyData.address.city || "Não informado"}/
                          {companyData.address.state || "N/A"} - CEP:{" "}
                          {companyData.address.zip || "Não informado"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-700">
                      <p>A empresa será criada apenas com o CNPJ informado.</p>
                      <p>
                        Você poderá preencher os demais dados posteriormente na
                        área de configurações.
                      </p>
                    </div>
                  )}

                  {companyData.name && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p>
                        <strong>Atividade Principal:</strong>{" "}
                        {companyData.mainActivity || "Não informado"}
                      </p>
                      {companyData.phones && companyData.phones.length > 0 && (
                        <p>
                          <strong>Telefones:</strong>{" "}
                          {companyData.phones
                            .map((phone) => `(${phone.area}) ${phone.number}`)
                            .join(", ")}
                        </p>
                      )}
                      {companyData.emails && companyData.emails.length > 0 && (
                        <p>
                          <strong>Emails:</strong>{" "}
                          {companyData.emails
                            .map((email) => email.address)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha (máximo 6 caracteres) *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    placeholder="Digite sua senha"
                    maxLength={6}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep2() || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Já tem uma conta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Faça login
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao início
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
