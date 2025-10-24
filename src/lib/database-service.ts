import { query, transaction } from './database';

// Interfaces para tipagem (adaptadas para a estrutura existente do banco)
export interface User {
  id?: string; // UUID
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Company {
  id?: string; // UUID
  name: string;
  cnpj: string;
  token?: string;
  isActive: boolean;
  founded?: string;
  nature?: string;
  size?: string;
  status?: string;
  mainActivity?: string;
  address?: any; // JSON no banco
  phones?: any; // JSON no banco
  emails?: any; // JSON no banco
  members?: any; // JSON no banco
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyAddress {
  id?: number;
  companyId?: number;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface CompanyPhone {
  id?: number;
  companyId?: number;
  type?: string;
  area?: string;
  number?: string;
}

export interface CompanyEmail {
  id?: number;
  companyId?: number;
  ownership?: string;
  address?: string;
}

export interface CompanyMember {
  id?: number;
  companyId?: number;
  name?: string;
  role?: string;
  type?: string;
}

// Serviços de usuários
export class UserService {
  static async create(user: User): Promise<User> {
    const result = await query(`
      INSERT INTO users (name, email, phone, password, "isActive")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user.name, user.email, user.phone, user.password, user.isActive]);
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, user: Partial<User>): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`"${key}" = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);
    const result = await query(`
      UPDATE users 
      SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }

  static async getAll(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY "createdAt" DESC');
    return result.rows;
  }
}

// Serviços de empresas
export class CompanyService {
  static async create(company: Company): Promise<Company> {
    const result = await query(`
      INSERT INTO companies (name, cnpj, token, "isActive", founded, nature, size, status, "mainActivity", address, phones, emails, members)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      company.name, company.cnpj, company.token, company.isActive,
      company.founded, company.nature, company.size, company.status,
      company.mainActivity, JSON.stringify(company.address || {}),
      JSON.stringify(company.phones || []), JSON.stringify(company.emails || []),
      JSON.stringify(company.members || [])
    ]);

    return result.rows[0];
  }

  static async findById(id: string): Promise<Company | null> {
    const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUuid(uuid: string): Promise<Company | null> {
    const result = await query('SELECT * FROM companies WHERE id = $1', [uuid]);
    return result.rows[0] || null;
  }

  static async findByCnpj(cnpj: string): Promise<Company | null> {
    const result = await query('SELECT * FROM companies WHERE cnpj = $1', [cnpj]);
    return result.rows[0] || null;
  }

  static async update(id: string, company: Partial<Company>): Promise<Company> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(company).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        if (['address', 'phones', 'emails', 'members'].includes(key)) {
          fields.push(`"${key}" = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`"${key}" = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);
    const result = await query(`
      UPDATE companies 
      SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM companies WHERE id = $1', [id]);
  }

  static async getAll(): Promise<Company[]> {
    const result = await query('SELECT * FROM companies ORDER BY "createdAt" DESC');
    return result.rows;
  }
}

// Serviços de relacionamento usuário-empresa
export class UserCompanyService {
  static async addUserToCompany(userId: string, companyId: string): Promise<void> {
    await query(`
      INSERT INTO user_companies ("userId", "companyId")
      VALUES ($1, $2)
      ON CONFLICT ("userId", "companyId") DO NOTHING
    `, [userId, companyId]);
  }

  static async getUserCompanies(userId: string): Promise<Company[]> {
    const result = await query(`
      SELECT c.*
      FROM companies c
      JOIN user_companies uc ON c.id = uc."companyId"
      WHERE uc."userId" = $1
    `, [userId]);

    return result.rows;
  }

  static async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    await query(`
      DELETE FROM user_companies 
      WHERE "userId" = $1 AND "companyId" = $2
    `, [userId, companyId]);
  }
}
