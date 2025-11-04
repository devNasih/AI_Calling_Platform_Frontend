import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { KnowledgeBaseService } from "../services/knowledge_services";
import {
  KnowledgeBaseSummaryType,
  KnowledgeBaseDocumentSummaryType,
} from "../types/knowledge_type";

interface KnowledgeBaseContextType {
  status: KnowledgeBaseSummaryType | null;
  documents: KnowledgeBaseDocumentSummaryType | null;
  loadingDocuments: boolean;
  loadingStatus: boolean;
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  fetchDocuments: (
    limit?: number,
    offset?: number,
    statusFilter?: string | null,
    isActiveFilter?: boolean | null
  ) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

interface KnowledgeBaseProviderProps {
  children: ReactNode;
  // Add this prop to control when to fetch
  shouldFetch?: boolean;
}

export const KnowledgeBaseProvider: React.FC<KnowledgeBaseProviderProps> = ({ 
  children,
  shouldFetch = false, // Default to false to prevent unwanted fetching
}) => {
  const [status, setStatus] = useState<KnowledgeBaseSummaryType | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBaseDocumentSummaryType | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false); // Changed to false initially
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false); // Changed to false initially
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const data = await KnowledgeBaseService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchDocuments = async (
    limit = 50,
    offset = 0,
    statusFilter: string | null = null,
    isActiveFilter: boolean | null = null
  ) => {
    setLoadingDocuments(true);
    setError(null);
    try {
      const data = await KnowledgeBaseService.getDocuments(limit, offset, statusFilter, isActiveFilter);
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await KnowledgeBaseService.uploadDocument(file);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    setDeleting(true);
    setError(null);
    try {
      await KnowledgeBaseService.deleteDocument(id);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  // Only fetch when shouldFetch is true
  useEffect(() => {
    if (shouldFetch) {
      fetchStatus();
      fetchDocuments();
    }
  }, [shouldFetch]);

  return (
    <KnowledgeBaseContext.Provider
      value={{
        status,
        documents,
        loadingDocuments,
        loadingStatus,
        uploading,
        deleting,
        error,
        fetchStatus,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
      }}
    >
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBase = (): KnowledgeBaseContextType => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error("useKnowledgeBase must be used within a KnowledgeBaseProvider");
  }
  return context;
};