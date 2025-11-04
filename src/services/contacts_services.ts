import { apiClient } from "./api";
import { ContactsData, CreateContactPayload } from "../types/contacts_type";

export const contactsService = {
  getContacts: async (): Promise<ContactsData[]> => {
    try {
      const response = await apiClient.get<ContactsData[]>("/v1/contacts/");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching contacts:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  },
  createNewContact: async (
    payload: CreateContactPayload
  ): Promise<ContactsData> => {
    try {
      const response = await apiClient.post<ContactsData>(
        "/v1/contacts/create",
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating contact:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  },
  updateContact: async (
    id: number,
    payload: CreateContactPayload
  ): Promise<ContactsData> => {
    try {
      const response = await apiClient.put<ContactsData>(
        `/v1/contacts/update/${id}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating contact:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  },
  deleteContact: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/v1/contacts/delete/${id}`);
    } catch (error: any) {
      console.error("❌ Error deleting contact:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  },

  uploadContacts: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post("/v1/contacts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error uploading contacts:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  }
};
