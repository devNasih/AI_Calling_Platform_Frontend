import { apiClient } from './api';
import { Contact, ContactApiResponse, ContactUploadApiResponse } from '../types';

export interface ContactFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'dnc';
  company?: string;
  page?: number;
  limit?: number;
}

export interface ContactUploadResponse {
  success: boolean;
  message: string;
  totalUploaded?: number;
  errors?: string[];
}

export const contactsService = {
  // Get all contacts - matches the actual API
  getContacts: async (): Promise<Contact[]> => {
    console.log('📞 Fetching all contacts...');
    
    try {
      const response = await apiClient.get<ContactApiResponse[]>('/v1/contacts/all');
      console.log('✅ Contacts fetched successfully:', response.data);
      
      // Convert API response to frontend Contact type
      const contacts: Contact[] = response.data.map((apiContact, index) => ({
        id: String(index + 1), // Generate ID since API doesn't provide it
        name: apiContact.name,
        phone: apiContact.phone_number,
        email: '', // Not provided by API
        company: '', // Not provided by API
        status: 'active' as const, // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      return contacts;
    } catch (error: any) {
      console.error('❌ Error fetching contacts:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Upload contacts from CSV - matches the actual API
  uploadContacts: async (file: File): Promise<ContactUploadResponse> => {
    console.log('📤 Uploading contacts file:', file.name);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Form data created, making request...');
      
      // Use POST instead of upload
      const response = await apiClient.post<ContactUploadApiResponse>(
        '/v1/contacts/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Contacts uploaded successfully:', response.data);
      
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error uploading contacts:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage =
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.message ||
        'Failed to upload contacts';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Note: The following methods are not supported by the current API
  // but are kept for compatibility with the frontend components
  
  // Get single contact by ID (not supported by API - returns mock data)
  getContact: async (id: string): Promise<Contact> => {
    // Since the API doesn't support individual contact retrieval,
    // we'll fetch all contacts and find the one with matching ID
    const contacts = await contactsService.getContacts();
    const contact = contacts.find(c => c.id === id);
    
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    
    return contact;
  },

  // Create new contact (not supported by API)
  createContact: async (_contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    throw new Error('Creating individual contacts is not supported by the current API. Please use the upload feature.');
  },

  // Update contact (not supported by API)
  updateContact: async (_id: string, _contactData: Partial<Contact>): Promise<Contact> => {
    throw new Error('Updating contacts is not supported by the current API.');
  },

  // Delete contact (not supported by API)
  deleteContact: async (_id: string): Promise<void> => {
    throw new Error('Deleting contacts is not supported by the current API.');
  },

  // Bulk delete contacts (not supported by API)
  bulkDeleteContacts: async (_ids: string[]): Promise<void> => {
    throw new Error('Bulk deleting contacts is not supported by the current API.');
  },

  // Export contacts to CSV (not supported by API)
  exportContacts: async (_filters: ContactFilters = {}): Promise<Blob> => {
    throw new Error('Exporting contacts is not supported by the current API.');
  },

  // Get contact statistics (not supported by API)
  getContactStats: async () => {
    // Return mock stats based on the contacts we can fetch
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
};