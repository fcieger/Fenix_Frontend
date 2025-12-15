"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  createPartner,
  updatePartner,
  getPartner,
} from "@/services/partners-service";
import {
  makeCnpjRequest,
  extractCompanyData,
  CnpjResponse,
} from "@/lib/cnpj-api";
import { consultarCep, formatCep, ViaCepResponse } from "@/lib/viacep-api";

import type { ContactDto, Partner, CreatePartnerDto } from "@/types/sdk";
import {
  updatePartnerSchema,
  createPartnerSchema,
  RegistrationType,
  PersonType,
  AddressType,
} from "@/types/sdk";
import { validateAndNotify } from "@/lib/utils/validation";
import {
  User,
  ChevronDown,
  MessageSquare,
  MapPin,
  FileText,
  Check,
  Info,
  Plus,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Save,
  Loader2,
  X,
} from "lucide-react";
import CadastrosAIAssistant from "@/components/CadastrosAIAssistant";
import { useFeedback } from "@/contexts/feedback-context";
import { toast } from "sonner";
import { handleValidationError } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { AddressDto, EntityStatus, UpdatePartnerDto } from "@fenix/api-sdk";
import { PartnerFormHeader } from "./PartnerFormHeader";
import { GeneralDataSection } from "./GeneralDataSection";
import { ContactsSection } from "./ContactsSection";
import { TaxInfoSection } from "./TaxInfoSection";
import { AddressesSection } from "./AddressesSection";
import { NotesSection } from "./NotesSection";

interface PartnerFormPageProps {
  partnerId?: string;
}

export function PartnerFormPage({ partnerId }: PartnerFormPageProps) {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading: authLoading,
    activeCompanyId,
  } = useAuth();
  const { openSuccess } = useFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [searchingCep, setSearchingCep] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [cepError, setCepError] = useState<{ [key: number]: string }>({});
  const [contactCount, setContactCount] = useState(1);
  const isEditMode = !!partnerId;

  const partnerTypes = {
    [RegistrationType.CUSTOMER]: false,
    [RegistrationType.SELLER]: false,
    [RegistrationType.SUPPLIER]: false,
    [RegistrationType.EMPLOYEE]: false,
    [RegistrationType.CARRIER]: false,
    [RegistrationType.SERVICE_PROVIDER]: false,
  } as Record<RegistrationType, boolean>;

  const [formData, setFormData] = useState<CreatePartnerDto>({
    // Dados Gerais
    status: EntityStatus.ACTIVE,
    legalName: "",
    personType: PersonType.INDIVIDUAL,
    taxId: "",
    tradeName: "",
    types: [],
    // Contato
    contacts: [
      {
        email: "",
        name: "",
        phone: "",
        mobilePhone: "",
        role: "",
        mobileRole: "",
        isPrimary: true,
      },
    ] as Array<ContactDto>,
    // Tributário
    simplifiedTaxSystem: false,
    // publicOrganization: false,
    stateRegistration: "",
    municipalRegistration: "",
    // suframaRegistration: "",
    // Endereço
    addresses: [
      {
        type: AddressType.COMMERCIAL,
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        country: "BR",
        isPrimary: true,
      },
    ] as Array<AddressDto>,
    // Observações
    notes: "",
  });

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Carregar partner no modo edição
  useEffect(() => {
    if (isEditMode && partnerId && isAuthenticated) {
      const loadPartnerData = async () => {
        try {
          setIsLoadingPartner(true);
          const partner = await getPartner(partnerId);

          setFormData(partner as CreatePartnerDto);
        } catch (error) {
          console.error("Erro ao carregar dados do parceiro:", error);
          setError("Erro ao carregar dados para edição");
        } finally {
          setIsLoadingPartner(false);
        }
      };

      loadPartnerData();
    }
  }, [isEditMode, partnerId, isAuthenticated]);

  // Buscar CNPJ automaticamente quando o usuário digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.taxId && formData.personType === PersonType.LEGAL_ENTITY) {
        searchCnpj(formData.taxId);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.taxId, formData.personType]);

  const searchCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "");

    if (cleanCnpj.length !== 14) {
      setCnpjData(null);
      setCnpjError(null);
      return;
    }

    try {
      setSearchingCnpj(true);
      setCnpjError(null);

      const response = await makeCnpjRequest<CnpjResponse>(cnpj);

      if (response) {
        const companyData = extractCompanyData(response);
        setCnpjData(companyData);

        setFormData((prev) => ({
          ...prev,
          legalName: companyData.name,
          tradeName: companyData.name,
          taxId: cnpj,
          email: companyData.emails[0]?.address || "",
          contacts: [
            {
              email: companyData.emails[0]?.address || "",
              name: companyData.name,
              phone:
                companyData.phones.find((p) => p.type === "LANDLINE")?.number ||
                "",
              mobilePhone:
                companyData.phones.find((p) => p.type === "MOBILE")?.number ||
                "",
              role: "Comercial",
              mobileRole: "Comercial",
              isPrimary: true,
            },
          ],
        }));
      } else {
        setCnpjError("CNPJ não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjError("Erro ao consultar CNPJ");
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleCnpjSearch = () => {
    if (formData.taxId && formData.personType === PersonType.LEGAL_ENTITY) {
      searchCnpj(formData.taxId);
    }
  };

  // RETURNS CONDICIONAIS DEVEM VIR DEPOIS DE TODOS OS HOOKS
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Loading state (apenas no modo edição)
  if (isEditMode && isLoadingPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando partner...
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (type: RegistrationType, checked: boolean) => {
    setFormData((prev: CreatePartnerDto) => ({
      ...prev,
      types: {
        ...(prev.types || []),
        [type]: checked,
      },
    }));
  };

  const formatTAXtaxId = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  const formatIE = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1.$2.$3.$4");
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const handleAIGenerateData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      tradeName: data.tradeName || prev.tradeName,
      legalName: data.legalName || prev.legalName,
      contacts: [
        {
          name: data.contactName || "",
          email: data.email || "",
          phone: data.phone || "",
          mobile: data.mobile || "",
          position: data.position || "",
          isPrimary: true,
        },
      ],
      customerTypes: {
        ...prev.types,
        ...data.customerTypes,
      },
    }));
  };

  const addContact = () => {
    const newContact = {
      email: "",
      name: "",
      phone: "",
      mobilePhone: "",
      role: "",
      mobileRole: "",
      isPrimary: false,
    };
    setFormData((prev) => ({
      ...prev,
      contacts: [...(prev?.contacts || []), newContact],
    }));
    setContactCount((prev) => prev + 1);
  };

  const addEndereco = () => {
    const novoEndereco: AddressDto = {
      type: AddressType.COMMERCIAL,
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      country: "BR",
      isPrimary: (formData?.addresses?.length || 0) === 0,
    };

    setFormData((prev) => ({
      ...prev,
      addresses: [...(prev?.addresses || []), novoEndereco],
    }));
  };

  const removeEndereco = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev?.addresses?.filter((_, i) => i !== index),
    }));
  };

  const updateEndereco = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      addresses: (prev?.addresses || []).map((endereco, i) => {
        if (i === index) {
          // Map Portuguese field names to SDK field names
          const fieldMap: { [key: string]: string } = {
            logradouro: "street",
            numero: "number",
            bairro: "neighborhood",
            cidade: "city",
            estado: "state",
            cep: "zipCode",
            principal: "isPrimary",
          };
          const mappedField = fieldMap[field] || field;
          return { ...endereco, [mappedField]: value };
        }
        return endereco;
      }),
    }));
  };

  const removeContato = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).filter((_, i) => i !== index),
    }));
    setContactCount((prev) => Math.max(1, prev - 1));
  };

  const updateContato = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).map((contato, i) =>
        i === index ? { ...contato, [field]: value } : contato
      ),
    }));
  };

  const searchCep = async (index: number, cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setCepError((prev) => ({ ...prev, [index]: "" }));
      return;
    }

    try {
      setSearchingCep((prev) => ({ ...prev, [index]: true }));
      setCepError((prev) => ({ ...prev, [index]: "" }));

      const cepData = await consultarCep(cleanCep);

      if (cepData) {
        updateEndereco(index, "street", cepData.logradouro);
        updateEndereco(index, "neighborhood", cepData.bairro);
        updateEndereco(index, "city", cepData.localidade);
        updateEndereco(index, "state", cepData.uf);
        updateEndereco(index, "zipCode", formatCep(cepData.cep));
      } else {
        setCepError((prev) => ({
          ...prev,
          [index]: "CEP não encontrado",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError((prev) => ({
        ...prev,
        [index]: "Erro ao consultar CEP",
      }));
    } finally {
      setSearchingCep((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleUpdate = async () => {
    if (!partnerId || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      if (!(formData.legalName || "").trim()) {
        toast.error("Nome/Razão Social é obrigatório");
        return;
      }

      if (
        formData.personType === PersonType.INDIVIDUAL &&
        !(formData.taxId || "").replace(/\D/g, "")
      ) {
        toast.error("TAXtaxId é obrigatório para Pessoa Física");
        return;
      }

      if (
        formData.personType === PersonType.LEGAL_ENTITY &&
        !(formData.taxId || "").replace(/\D/g, "")
      ) {
        toast.error("CNPJ é obrigatório para Pessoa Jurídica");
        return;
      }

      if (!formData?.addresses || formData?.addresses?.length === 0) {
        toast.error("Pelo menos um endereço é obrigatório");
        return;
      }

      if (!formData.contacts || formData.contacts.length === 0) {
        toast.error("Pelo menos um contato é obrigatório");
        return;
      }

      const updateData = {
        ...formData,
        personType: formData.personType as PersonType,
      };

      const validation = validateAndNotify(
        updatePartnerSchema,
        updateData,
        setFieldErrors
      );
      if (!validation.isValid) {
        return;
      }

      await updatePartner(partnerId, updateData as UpdatePartnerDto);
      openSuccess({
        title: "Atualizado com sucesso",
        message: "Cadastro atualizado.",
        onClose: () => router.push("/partners"),
      });
    } catch (error: any) {
      const fieldErrors = handleValidationError(error, setFieldErrors);
      setError(error.message || "Erro ao atualizar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isAuthenticated || !token) {
      setError("Usuário não autenticado");
      return;
    }

    if (isEditMode && partnerId) {
      await handleUpdate();
      return;
    }

    if (!user || !user.companies || user.companies.length === 0) {
      setError("Usuário não possui empresa associada");
      return;
    }

    if (!activeCompanyId) {
      setError("Nenhuma empresa ativa selecionada");
      return;
    }

    const errors: string[] = [];

    if (!(formData.legalName ?? "").trim()) {
      errors.push("Nome/Razão Social é obrigatório");
    }

    if (
      formData.personType === PersonType.INDIVIDUAL &&
      !(formData.taxId || "").trim()
    ) {
      errors.push("CPF é obrigatório para Pessoa Física");
    }

    if (
      formData.personType === PersonType.LEGAL_ENTITY &&
      !(formData.taxId || "").trim()
    ) {
      errors.push("CNPJ é obrigatório para Pessoa Jurídica");
    }

    const hasSelectedType = Array.isArray(formData.types)
      ? formData.types.length > 0
      : false;
    if (!hasSelectedType) {
      errors.push(
        "Selecione pelo menos um type de cliente (Cliente, Fornecedor, etc.)"
      );
    }

    if (errors.length > 0) {
      setError(errors.join(". "));

      const newFieldErrors: { [key: string]: boolean } = {};
      if (!(formData.legalName ?? "").trim()) {
        newFieldErrors.legalName = true;
      }
      if (
        formData.personType === PersonType.INDIVIDUAL &&
        !(formData.taxId || "").trim()
      ) {
        newFieldErrors.taxId = true;
      }
      if (
        formData.personType === PersonType.LEGAL_ENTITY &&
        !(formData.taxId || "").trim()
      ) {
        newFieldErrors.taxId = true;
      }
      if (!hasSelectedType) {
        newFieldErrors.types = true;
      }

      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setError(null);

    try {
      if (!(formData.legalName ?? "").trim()) {
        toast.error("Nome/Razão Social é obrigatório");
        return;
      }

      if (
        formData.personType === PersonType.INDIVIDUAL &&
        !(formData.taxId || "").replace(/\D/g, "")
      ) {
        toast.error("TAXtaxId é obrigatório para Pessoa Física");
        return;
      }

      if (
        formData.personType === PersonType.LEGAL_ENTITY &&
        !(formData.taxId || "").replace(/\D/g, "")
      ) {
        toast.error("CNPJ é obrigatório para Pessoa Jurídica");
        return;
      }

      const hasSelectedType = Array.isArray(formData.types)
        ? formData.types.length > 0
        : false;
      if (!hasSelectedType) {
        toast.error(
          "Selecione pelo menos um type de cliente (Cliente, Fornecedor, etc.)"
        );
        return;
      }

      if (!formData?.addresses || formData?.addresses?.length === 0) {
        toast.error("Pelo menos um endereço é obrigatório");
        return;
      }

      // Validar endereços obrigatórios
      const invalidAddresses = formData.addresses
        .map((addr, idx) => ({
          addr,
          index: idx,
        }))
        .filter(({ addr }) => !addr.number || !addr.number.trim());
      if (invalidAddresses.length > 0) {
        toast.error("O número do endereço é obrigatório");
        const newErrors: { [key: string]: boolean } = { addresses: true };
        invalidAddresses.forEach(({ index }) => {
          newErrors[`addresses.${index}.number`] = true;
        });
        setFieldErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }

      if (!formData.contacts || formData.contacts.length === 0) {
        toast.error("Pelo menos um contato é obrigatório");
        return;
      }

      // Validar contatos obrigatórios
      const invalidContacts = formData.contacts
        .map((contact, idx) => ({
          contact,
          index: idx,
        }))
        .filter(({ contact }) => !contact.name || !contact.name.trim());
      if (invalidContacts.length > 0) {
        toast.error("O nome do contato é obrigatório");
        const newErrors: { [key: string]: boolean } = { contacts: true };
        invalidContacts.forEach(({ index }) => {
          newErrors[`contacts.${index}.name`] = true;
        });
        setFieldErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }

      // Convert formData to CreatePartnerDto format
      // Filtrar campos vazios e garantir que campos obrigatórios tenham valores
      const createData: CreatePartnerDto = {
        legalName: formData.legalName || "",
        personType: formData.personType || PersonType.INDIVIDUAL,
        taxId: formData.taxId || "",
        tradeName: formData.tradeName || undefined,
        types: formData.types || [],
        contacts: formData.contacts.map((contact) => ({
          ...contact,
          name: contact.name?.trim() || "",
          email: contact.email?.trim() || undefined,
          phone: contact.phone?.trim() || undefined,
          mobilePhone: contact.mobilePhone?.trim() || undefined,
        })),
        addresses: formData.addresses.map((addr) => ({
          ...addr,
          number: addr.number?.trim() || "",
          street: addr.street?.trim() || "",
          neighborhood: addr.neighborhood?.trim() || "",
          city: addr.city?.trim() || "",
          state: addr.state?.trim() || "",
          zipCode: addr.zipCode?.trim() || "",
        })),
        simplifiedTaxSystem: formData.simplifiedTaxSystem || false,
        stateRegistration: formData.stateRegistration || undefined,
        municipalRegistration: formData.municipalRegistration || undefined,
        notes: formData.notes || undefined,
      };

      await createPartner(createData);
      openSuccess({
        title: "Salvo com sucesso",
        message: "Cadastro criado.",
        onClose: () => router.push("/partners"),
      });
    } catch (error: any) {
      const fieldErrors = handleValidationError(error, setFieldErrors);
      setError(
        error instanceof Error ? error.message : "Erro ao salvar cadastro"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <PartnerFormHeader
          isEditMode={isEditMode}
          isLoading={isLoading}
          onSave={handleSubmit}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form
            id="novo-cadastro-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <GeneralDataSection
              formData={formData}
              fieldErrors={fieldErrors}
              onInputChange={handleInputChange}
              onCnpjSearch={handleCnpjSearch}
              searchingCnpj={searchingCnpj}
              cnpjData={cnpjData}
              cnpjError={cnpjError}
            />

            <ContactsSection
              formData={formData}
              fieldErrors={fieldErrors}
              onAddContact={addContact}
              onUpdateContact={updateContato}
              onRemoveContact={removeContato}
            />

            <TaxInfoSection
              formData={formData}
              onInputChange={handleInputChange}
            />

            <AddressesSection
              formData={formData}
              fieldErrors={fieldErrors}
              onAddAddress={addEndereco}
              onUpdateAddress={updateEndereco}
              onRemoveAddress={removeEndereco}
              onCepSearch={searchCep}
              searchingCep={searchingCep}
              cepError={cepError}
            />

            <NotesSection
              formData={formData}
              onInputChange={handleInputChange}
            />
          </form>
        </div>
      </div>

      {/* Assistente de IA de Cadastros */}
      <CadastrosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </>
  );
}
