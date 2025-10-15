import { apiClient } from './api';
import { 
  Contact, 
  ContactApiResponse, 
  ContactCreateRequest, 
  ContactCreateResponse,
  HTTPValidationError,
  SuccessResponse
} from '../types';

export interface ContactFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'dnc';
  company?: string;
  page?: number;
  limit?: number;
  // Individual contacts DB filters
  region?: string;
  tag?: string;
}

export interface ContactUploadResponse {
  success: boolean;
  message: string;
  totalUploaded?: number;
  errors?: string[];
}

export const contactsService = {
  // === CSV Upload System (for campaigns) ===
  
  // Get all uploaded contacts from CSV - uses GET /v1/contacts/all
  getUploadedContacts: async (): Promise<Contact[]> => {
    try {
      console.log('📞 Fetching uploaded contacts from CSV');
      const response = await apiClient.get<ContactApiResponse[]>('/v1/contacts/all');
      console.log(response.data);
      
      // Convert CSV uploaded contacts to frontend Contact type
      const contacts: Contact[] = response.data.map((apiContact, index) => ({
        id: `csv-${index}`, // Generate ID since CSV contacts don't have IDs
        name: "apiContact.name",
        phone: "apiContact.phone_number",
        email: '', // Not provided by CSV upload API
        company: '', // Not provided by CSV upload API
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      console.log(`✅ Fetched ${contacts.length} uploaded contacts from CSV`);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching uploaded contacts:', error);
      throw error;
    }
  },

  // Upload contacts CSV - uses POST /v1/contacts/upload
  uploadContacts: async (file: File): Promise<ContactUploadResponse> => {
    try {
      console.log('📤 Uploading contacts CSV file');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<SuccessResponse>('/v1/contacts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ CSV uploaded successfully');
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error uploading contacts CSV:', error);
      
      // Handle HTTPValidationError from backend
      if (error.response?.data?.detail) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessage = validationError.detail
          .map(err => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
        
        return {
          success: false,
          message: `Validation Error: ${errorMessage}`,
        };
      }
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to upload contacts CSV';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // === Individual Contacts DB System ===
  
  // Get individual contacts with filters - uses GET /v1/contacts/
  getIndividualContacts: async (filters: { region?: string; tag?: string } = {}): Promise<Contact[]> => {
    try {
      console.log('📞 Fetching individual contacts with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.region) params.append('region', filters.region);
      if (filters.tag) params.append('tag', filters.tag);
      
      const url = `/v1/contacts/${params.toString() ? `?${params}` : ''}`;
      const response = await apiClient.get<ContactCreateResponse[]>(url);
      
      // Convert individual contacts to frontend Contact type
      const contacts: Contact[] = response.data.map((apiContact) => ({
        id: String(apiContact.id),
        name: apiContact.name,
        phone: apiContact.phone_number,
        email: '', // Not provided by API
        company: '', // Not provided by API
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store API fields
        tag: apiContact.tag,
        region: apiContact.region,
      }));
      
      console.log(`✅ Fetched ${contacts.length} individual contacts`);
      return contacts;
    } catch (error: any) {
      console.error('❌ Error fetching individual contacts:', error);
      throw error;
    }
  },

  // Create individual contact - uses POST /v1/contacts/
  createContact: async (contactData: {
    name: string;
    phone_number: string;
    tag: string;
    region: string;
  }): Promise<ContactCreateResponse> => {
    try {
      console.log('➕ Creating individual contact');
      const payload: ContactCreateRequest = {
        name: contactData.name,
        phone_number: contactData.phone_number,
        tag: contactData.tag,
        region: contactData.region
      };

      const response = await apiClient.post<ContactCreateResponse>('/v1/contacts/', payload);
      console.log('✅ Individual contact created successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating individual contact:', error);
      
      const errorMessage = error.response?.data?.detail?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Failed to create contact';
      
      throw new Error(errorMessage);
    }
  },

  // Update individual contact - uses PUT /v1/contacts/{contact_id}
  updateContact: async (contactId: string, contactData: {
    name: string;
    phone_number: string;
    tag: string;
    region: string;
  }): Promise<ContactCreateResponse> => {
    try {
      // Check if this is a CSV contact (can't be updated)
      if (contactId.startsWith('csv-')) {
        throw new Error('CSV uploaded contacts cannot be updated. Only individual contacts can be modified.');
      }
      
      console.log('✏️ Updating individual contact:', contactId);
      
      // Ensure contactId is a valid number
      const numericId = parseInt(contactId);
      if (isNaN(numericId)) {
        throw new Error('Invalid contact ID - must be a number');
      }
      
      const payload: ContactCreateRequest = {
        id: numericId,
        name: contactData.name,
        phone_number: contactData.phone_number,
        tag: contactData.tag,
        region: contactData.region
      };

      const response = await apiClient.put<ContactCreateResponse>(`/v1/contacts/${numericId}`, payload);
      console.log('✅ Individual contact updated successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating individual contact:', error);
      
      const errorMessage = error.response?.data?.detail?.[0]?.msg || 
                          error.response?.data?.message || 
                          error.message ||
                          'Failed to update contact';
      
      throw new Error(errorMessage);
    }
  },

  // Delete individual contact - uses DELETE /v1/contacts/{contact_id}
  deleteContact: async (contactId: string): Promise<string> => {
    try {
      // Check if this is a CSV contact (can't be deleted)
      if (contactId.startsWith('csv-')) {
        throw new Error('CSV uploaded contacts cannot be deleted individually. Please upload a new CSV file to replace all contacts.');
      }
      
      console.log('🗑️ Deleting individual contact:', contactId);
      
      // Ensure contactId is a valid number
      const numericId = parseInt(contactId);
      if (isNaN(numericId)) {
        throw new Error('Invalid contact ID - must be a number');
      }
      
      const response = await apiClient.delete<string>(`/v1/contacts/${numericId}`);
      console.log('✅ Individual contact deleted successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting individual contact:', error);
      
      const errorMessage = error.response?.data?.detail?.[0]?.msg || 
                          error.response?.data?.message || 
                          error.message ||
                          'Failed to delete contact';
      
      throw new Error(errorMessage);
    }
  },

  // === Combined Methods (for UI compatibility) ===
  
  // Get all contacts (combines both systems with client-side filtering)
  getContacts: async (filters: ContactFilters = {}): Promise<Contact[]> => {
    try {
      // Get both CSV uploaded contacts and individual contacts
      const [uploadedContacts, individualContacts] = await Promise.allSettled([
        contactsService.getUploadedContacts(),
        contactsService.getIndividualContacts({ region: filters.region, tag: filters.tag })
      ]);
      
      let allContacts: Contact[] = [];
      
      // Add uploaded contacts if successful
      if (uploadedContacts.status === 'fulfilled') {
        allContacts = [...allContacts, ...uploadedContacts.value];
      }
      
      // Add individual contacts if successful
      if (individualContacts.status === 'fulfilled') {
        allContacts = [...allContacts, ...individualContacts.value];
      }
      
      // Apply client-side filters
      let filteredContacts = allContacts;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredContacts = filteredContacts.filter(contact =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.phone.includes(filters.search!)
        );
      }
      
      
      if (filters.status) {
        filteredContacts = filteredContacts.filter(contact => contact.status === filters.status);
      }
      
      return filteredContacts;
    } catch (error: any) {
      console.error('❌ Error fetching contacts:', error);
      throw error;
    }
  },

  // Convenience methods
  getContactsByRegion: async (region: string): Promise<Contact[]> => {
    return contactsService.getIndividualContacts({ region });
  },

  getContactsByTag: async (tag: string): Promise<Contact[]> => {
    return contactsService.getIndividualContacts({ tag });
  },

  // Get contact statistics
  getContactStats: async () => {
    try {
      const contacts = await contactsService.getContacts();
      return {
        total: contacts.length,
        active: contacts.filter(c => c.status === 'active').length,
        inactive: contacts.filter(c => c.status === 'inactive').length,
        dnc: contacts.filter(c => c.status === 'dnc').length,
      };
    } catch (error) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        dnc: 0,
      };
    }
  },

  // === Not Supported Methods ===
  
  getContact: async (id: string): Promise<Contact> => {
    const contacts = await contactsService.getContacts();
    const contact = contacts.find(c => c.id === id);
    
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    
    return contact;
  },

  // === Not Fully Supported Methods ===
  
  bulkDeleteContacts: async (_ids: string[]): Promise<void> => {
    throw new Error('Bulk deleting contacts is not supported by the current API.');
  },

  exportContacts: async (_filters: ContactFilters = {}): Promise<Blob> => {
    throw new Error('Exporting contacts is not supported by the current API.');
  },
};
