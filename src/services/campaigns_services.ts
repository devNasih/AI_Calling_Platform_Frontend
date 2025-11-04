import { apiClient } from "./api";
import { CampaignType, ContactType } from "../types/campaign_type";
import { start } from "repl";

export const CampaignService = {
  getAllCampaigns: async (): Promise<CampaignType[]> => {
    const response = await apiClient.get<CampaignType[]>("/v1/campaigns/db/");
    return response.data;
  },

  createCampaign: async (campaignData: {
    name: string;
    description: string;
    country: string;
    state: string;
    city: string;
    knowledge_base_file_id: number;
    contact_list: ContactType[];
  }): Promise<CampaignType> => {
    const response = await apiClient.post<CampaignType>(
      "/v1/campaigns/db/",
      campaignData
    );
    return response.data;
  },

  controlCampaign: async (
    campaignId: number,
    action: "pause" | "resume" | "stop"
  ): Promise<{
    status: string;
    campaign_id: number;
    new_status: string;
  }> => {
    const response = await apiClient.post(
      `/v1/campaigns/control/${campaignId}/${action}`
    );
    return response.data;
  },

  deleteCampaign: async (campaignId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/v1/campaigns/db/${campaignId}`);
    return response.data;
  },

  startCampaign: async (campaignId: number): Promise<{ message: string }> => {
    const response = await apiClient.post(`/v1/campaigns/${campaignId}/start`);
    return response.data;
  },
};
