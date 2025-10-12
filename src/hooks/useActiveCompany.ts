import { useAuth } from '@/contexts/auth-context'

export function useActiveCompany() {
  const { user, activeCompanyId, setActiveCompany } = useAuth()

  const activeCompany = user?.companies?.find(company => company.id === activeCompanyId) || null
  
  const hasCompanies = user?.companies && user.companies.length > 0
  const canSwitchCompany = hasCompanies && user.companies.length > 1

  return {
    activeCompany,
    activeCompanyId,
    setActiveCompany,
    hasCompanies,
    canSwitchCompany,
    companies: user?.companies || []
  }
}
