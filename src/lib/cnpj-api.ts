export interface CnpjResponse {
  updated: string;
  taxId: string;
  alias: string;
  founded: string;
  head: boolean;
  company: {
    id: number;
    name: string;
    equity: number;
    nature: {
      id: number;
      text: string;
    };
    size: {
      id: number;
      acronym: string;
      text: string;
    };
    simples: {
      optant: boolean;
      since: string;
    };
    simei: {
      optant: boolean;
      since: string | null;
    };
    members: {
      since: string;
      person: {
        id: string;
        type: "NATURAL" | "LEGAL";
        name: string;
        taxId: string;
        age: string;
      };
      role: {
        id: number;
        text: string;
      };
    }[];
  };
  statusDate: string;
  status: {
    id: number;
    text: string;
  };
  address: {
    municipality: number;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    details: string;
    zip: string;
    country: {
      id: number;
      name: string;
    };
  };
  mainActivity: {
    id: number;
    text: string;
  };
  phones: {
    type: "MOBILE" | "LANDLINE";
    area: string;
    number: string;
  }[];
  emails: {
    ownership: "CORPORATE" | "PERSONAL";
    address: string;
    domain: string;
  }[];
  sideActivities: {
    id: number;
    text: string;
  }[];
}

export async function makeCnpjRequest<T>(cnpj: string): Promise<T | null> {
  const headers = {
    "Content-Type": "application/json",
  };

  // Remove formatação do CNPJ (pontos, traços, barras)
  const cleanCnpj = cnpj.replace(/\D/g, '');

  try {
    const response = await fetch(`https://open.cnpja.com/office/${cleanCnpj}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
}

export function formatCnpj(response: CnpjResponse): string {
  return JSON.stringify(response, null, 2);
}

export function extractCompanyData(cnpjResponse: CnpjResponse) {
  return {
    name: cnpjResponse.company.name,
    cnpj: cnpjResponse.taxId,
    founded: cnpjResponse.founded,
    nature: cnpjResponse.company.nature.text,
    size: cnpjResponse.company.size.text,
    status: cnpjResponse.status.text,
    address: {
      street: cnpjResponse.address.street,
      number: cnpjResponse.address.number,
      district: cnpjResponse.address.district,
      city: cnpjResponse.address.city,
      state: cnpjResponse.address.state,
      zip: cnpjResponse.address.zip,
    },
    mainActivity: cnpjResponse.mainActivity.text,
    phones: cnpjResponse.phones.map(phone => ({
      type: phone.type,
      area: phone.area,
      number: phone.number,
    })),
    emails: cnpjResponse.emails.map(email => ({
      ownership: email.ownership,
      address: email.address,
    })),
    members: cnpjResponse.company.members.map(member => ({
      name: member.person.name,
      role: member.role.text,
      type: member.person.type,
    })),
  };
}
