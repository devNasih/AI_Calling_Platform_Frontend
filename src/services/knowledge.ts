import { apiClient } from './api';
import { KnowledgeDocument } from '../types';

export interface KnowledgeUploadResponse {
  success: boolean;
  message: string;
  document?: KnowledgeDocument;
  error?: string;
}

export interface KnowledgeListResponse {
  documents: KnowledgeDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to determine file type from filename
const getFileType = (filename: string): 'pdf' | 'docx' | 'txt' | 'csv' => {
  const extension = filename.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'doc':
      return 'docx';
    case 'csv':
      return 'csv';
    case 'txt':
    case 'md':
    case 'rtf':
    default:
      return 'txt';
  }
};

export const knowledgeService = {
  // Upload document to knowledge base - uses POST /v1/knowledge/upload
  uploadDocument: async (file: File): Promise<KnowledgeUploadResponse> => {
    try {
      console.log('📤 Uploading document to knowledge base:', file.name);
      
      // Validate file before upload
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Check file type (allow common document types)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'application/rtf'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, DOC, DOCX, TXT, MD, or RTF files.');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Form data created, making request to /v1/knowledge/upload...');
      
      const response = await apiClient.post<any>('/v1/knowledge/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Document uploaded successfully:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Document uploaded successfully',
        document: response.data.document ? {
          id: response.data.document.id || Date.now().toString(),
          filename: response.data.document.filename || file.name,
          originalName: file.name,
          fileSize: file.size,
          fileType: getFileType(file.name),
          uploadedAt: response.data.document.uploadedAt || new Date().toISOString(),
          status: response.data.document.status || 'uploaded',
          vectorized: response.data.document.vectorized || false,
          processedAt: response.data.document.processedAt
        } : undefined
      };
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail?.[0]?.msg || 
                          error.response?.data?.message || 
                          error.message ||
                          'Failed to upload document';
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    }
  },

  // Get all knowledge base documents (placeholder - API not specified)
  getDocuments: async (page: number = 1, limit: number = 20): Promise<KnowledgeListResponse> => {
    try {
      console.log('📚 Fetching knowledge base documents...');
      
      // Since the API endpoint for listing documents is not specified,
      // we'll create a placeholder that could work with a future endpoint
      try {
        const response = await apiClient.get<KnowledgeListResponse>(`/v1/knowledge/documents?page=${page}&limit=${limit}`);
        console.log('✅ Documents fetched successfully:', response.data);
        return response.data;
      } catch (error: any) {
        // If the endpoint doesn't exist yet, return empty list
        if (error.response?.status === 404) {
          console.log('ℹ️ Knowledge documents endpoint not implemented yet');
          return {
            documents: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error fetching documents:', error);
      throw error;
    }
  },

  // Delete document (placeholder - API not specified)
  deleteDocument: async (documentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🗑️ Deleting document:', documentId);
      
      try {
        await apiClient.delete(`/v1/knowledge/documents/${documentId}`);
        console.log('✅ Document deleted successfully');
        
        return {
          success: true,
          message: 'Document deleted successfully'
        };
      } catch (error: any) {
        // If the endpoint doesn't exist yet, return placeholder response
        if (error.response?.status === 404) {
          console.log('ℹ️ Knowledge delete endpoint not implemented yet');
          return {
            success: false,
            message: 'Delete functionality not available yet'
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error deleting document:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Failed to delete document';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Get document details (placeholder - API not specified)
  getDocument: async (documentId: string): Promise<KnowledgeDocument | null> => {
    try {
      console.log('📄 Fetching document details:', documentId);
      
      try {
        const response = await apiClient.get<KnowledgeDocument>(`/v1/knowledge/documents/${documentId}`);
        console.log('✅ Document details fetched successfully');
        return response.data;
      } catch (error: any) {
        // If the endpoint doesn't exist yet, return null
        if (error.response?.status === 404) {
          console.log('ℹ️ Knowledge document details endpoint not implemented yet');
          return null;
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error fetching document details:', error);
      throw error;
    }
  },

  // Get knowledge base statistics (placeholder - API not specified)
  getStats: async (): Promise<{
    totalDocuments: number;
    totalSize: number;
    processingDocuments: number;
    vectorizedDocuments: number;
    failedDocuments: number;
    uploadedDocuments: number;
  }> => {
    try {
      console.log('📊 Fetching knowledge base statistics...');
      
      try {
        const response = await apiClient.get<{
          totalDocuments: number;
          totalSize: number;
          processingDocuments: number;
          vectorizedDocuments: number;
          failedDocuments: number;
          uploadedDocuments: number;
        }>('/v1/knowledge/stats');
        console.log('✅ Knowledge stats fetched successfully');
        return response.data;
      } catch (error: any) {
        // If the endpoint doesn't exist yet, return placeholder stats
        if (error.response?.status === 404) {
          console.log('ℹ️ Knowledge stats endpoint not implemented yet');
          return {
            totalDocuments: 0,
            totalSize: 0,
            processingDocuments: 0,
            vectorizedDocuments: 0,
            failedDocuments: 0,
            uploadedDocuments: 0
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error fetching knowledge stats:', error);
      throw error;
    }
  }
};
