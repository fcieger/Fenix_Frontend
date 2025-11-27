/**
 * Authentication types
 * Re-exports from SDK where possible, with frontend-specific additions
 */

/**
 * User data structure
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  companies: Company[];
}

/**
 * Company data structure
 */
export interface Company {
  id: string;
  cnpj: string;
  name: string;
  token: string;
  simplesNacional?: boolean;
}

/**
 * Authentication response from login/register
 */
export interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Login request data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register request data
 */
export interface RegisterData {
  user: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  company: {
    name: string;
    cnpj: string;
    founded?: string;
    nature?: string;
    size?: string;
    status?: string;
    address?: any;
    mainActivity?: string;
    phones?: any[];
    emails?: any[];
    members?: any[];
  };
}
