export interface LoginIn {
  email: string;
  password: string;
}

export interface MeOut {
  id: string;
  email: string;
  role: string;
  org_id: string | null;
  facility_id: string | null;
}


export interface TokenOut {
  access_token: string;
  refresh_token: string;
  token_type: string;
}