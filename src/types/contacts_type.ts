export interface ContactsData {
  id: number;
  country: string;
  city: string;
  tag: string;
  created_at: string;
  phone_number: string;
  name: string;
  state: string;
  status: string;
  created_by: number;
}
export interface CreateContactPayload {
  name: string;
  phone_number: string;
  tag?: string;
  country?: string;
  state?: string;
  city?: string;
}
