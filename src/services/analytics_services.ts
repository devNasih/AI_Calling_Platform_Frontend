import { apiClient } from "./api";
import {
  AnalyticsSummary,
  AnalyticsData,
  AnalyticsExportResponse,
  ExportFormat,
} from "../types/analytics_type";

export class AnalyticsService {
  static async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>(
      "/v1/analytics/summary"
    );
    return response.data;
  }

  static async getAnalyticsData(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>("/v1/analytics/data");
    return response.data;
  }

  static async exportAnalytics(
    format: ExportFormat = "csv",
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsExportResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("format", format);

    const response = await apiClient.get<AnalyticsExportResponse>(
      `/v1/analytics/export?${params.toString()}`
    );
    return response.data;
  }

  static async downloadAnalyticsExport(
    format: ExportFormat = "csv",
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    const response = await this.exportAnalytics(format, startDate, endDate);

    // Only CSV and XLSX supported
    const blob = new Blob([response.data], {
      type:
        format === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${
      new Date().toISOString().split("T")[0]
    }.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async filterAnalytics(
    startDate: string,
    endDate: string
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append("start_date", startDate);
    params.append("end_date", endDate);

    const response = await apiClient.get(
      `/v1/analytics/filter?${params.toString()}`
    );
    return response.data;
  }
}
