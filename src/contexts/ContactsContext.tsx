import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { contactsService } from "../services/contacts_services";
import { ContactsData, CreateContactPayload } from "../types/contacts_type";

interface ContactsContextType {
  contacts: ContactsData[];
  loading: boolean;
  error: string | null;
  uploadLoading: boolean;
  refreshContacts: () => Promise<void>;
  createContact: (payload: CreateContactPayload) => Promise<ContactsData>;
  updateContact: (
    id: number,
    payload: CreateContactPayload
  ) => Promise<ContactsData>;
  deleteContact: (id: number) => Promise<void>;
  uploadContacts: (file: File) => Promise<any>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined
);

interface ContactsProviderProps {
  children: ReactNode;
  shouldFetch?: boolean;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({
  children,
}) => {
  const [contacts, setContacts] = useState<ContactsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const location = useLocation();

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactsService.getContacts();
      setContacts(data);
      hasFetchedRef.current = true;
    } catch (err: any) {
      setError(err.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (
    contactData: CreateContactPayload
  ): Promise<ContactsData> => {
    try {
      const cleanPayload: CreateContactPayload = {
        name: contactData.name.trim(),
        phone_number: contactData.phone_number.trim(),
        tag: contactData.tag?.trim(),
        country: contactData.country?.trim(),
        state: contactData.state?.trim() || "",
        city: contactData.city?.trim() || "",
      };

      console.log("📤 Sending payload to API:", cleanPayload);

      const result = await contactsService.createNewContact(cleanPayload);

      console.log("✅ Contact created successfully:", result);

      await fetchContacts();

      return result;
    } catch (error: any) {
      console.error("❌ Create contact failed");
      console.error("❌ Error details:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Status code:", error.response?.status);
      console.error(
        "❌ Full error object:",
        JSON.stringify(error.response, null, 2)
      );

      let errorMessage = "Failed to create contact";

      if (error.response?.data) {
        const data = error.response.data;
        errorMessage =
          data.message ||
          data.error ||
          data.detail ||
          (typeof data === "string" ? data : JSON.stringify(data));
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const updateContact = async (
    id: number,
    payload: CreateContactPayload
  ): Promise<ContactsData> => {
    try {
      const cleanPayload: CreateContactPayload = {
        name: payload.name.trim(),
        phone_number: payload.phone_number.trim(),
        tag: payload.tag?.trim(),
        country: payload.country?.trim(),
        state: payload.state?.trim() || "",
        city: payload.city?.trim() || "",
      };
      const updated = await contactsService.updateContact(id, cleanPayload);

      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update contact";

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteContact = async (id: number): Promise<void> => {
    try {
      await contactsService.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete contact";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const uploadContacts = async (file: File): Promise<any> => {
    setUploadLoading(true);
    try {
      console.log("📤 Uploading file:", file.name, "Size:", file.size, "bytes");

      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Please upload a CSV file");
      }

      if (file.size === 0) {
        throw new Error("File is empty");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size should not exceed 10MB");
      }

      const result = await contactsService.uploadContacts(file);

      console.log("✅ Upload successful:", result);

      await fetchContacts();

      return result;
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      console.error("❌ Error response:", err.response?.data);

      let errorMessage = "Failed to upload contacts";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        const data = err.response.data;
        errorMessage =
          data.message ||
          data.error ||
          data.detail ||
          (typeof data === "string" ? data : JSON.stringify(data));
      }

      throw new Error(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/contacts" && !hasFetchedRef.current) {
      fetchContacts();
    }
  }, [location.pathname]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        error,
        uploadLoading,
        refreshContacts: fetchContacts,
        createContact,
        updateContact,
        deleteContact,
        uploadContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = (): ContactsContextType => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
