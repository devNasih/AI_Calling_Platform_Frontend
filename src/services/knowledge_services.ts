import { apiClient } from "./api";
import {
  KnowledgeBaseSummaryType,
  KnowledgeBaseDocumentSummaryType,
} from "../types/knowledge_type";

const API_BASE = "/v1/knowledgebase";

export class KnowledgeBaseService {
  static async getStatus(): Promise<KnowledgeBaseSummaryType> {
    try {
      const { data } = await apiClient.get<KnowledgeBaseSummaryType>(
        `/v1/knowledgebase/status`
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch knowledge base status:", error);
      throw error;
    }
  }

  static async getDocuments(
    limit = 50,
    offset = 0,
    status: string | null = null,
    isActive: boolean | null = null
  ): Promise<KnowledgeBaseDocumentSummaryType> {
    try {
      const { data } = await apiClient.get<KnowledgeBaseDocumentSummaryType>(
        `/v1/knowledgebase/documents`,
        {
          params: { limit, offset, status, is_active: isActive },
        }
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch knowledge base documents:", error);
      throw error;
    }
  }

  static async uploadDocument(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await apiClient.post(`/v1/knowledge/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  }

  static async deleteDocument(id: number): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.delete<{ success: boolean }>(
        `${API_BASE}/documents/${id}`
      );
      return data;
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  }
}
