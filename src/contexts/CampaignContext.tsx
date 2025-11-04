import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { CampaignType, ContactType } from "../types/campaign_type";
import { CampaignService } from "../services/campaigns_services";

interface CampaignContextType {
  campaigns: CampaignType[];
  loading: boolean;
  deleting: boolean;
  error: string | null;
  refreshCampaigns: () => Promise<void>;
  createCampaign: (campaignData: {
    name: string;
    description: string;
    country: string;
    state: string;
    city: string;
    knowledge_base_file_id: number;
    contact_list: ContactType[];
  }) => Promise<CampaignType | null>;
  startCampaign: (campaignId: number) => Promise<void>;
  controlCampaign: (
    campaignId: number,
    action: "pause" | "resume" | "stop"
  ) => Promise<void>;
  deleteCampaign: (campaignId: number) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const hasFetchedRef = useRef(false);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CampaignService.getAllCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  // Create a new campaign
  const createCampaign = async (campaignData: {
    name: string;
    description: string;
    country: string;
    state: string;
    city: string;
    knowledge_base_file_id: number;
    contact_list: ContactType[];
  }): Promise<CampaignType | null> => {
    try {
      setLoading(true);
      setError(null);
      const newCampaign = await CampaignService.createCampaign(campaignData);
      await fetchCampaigns();
      return newCampaign;
    } catch (err: any) {
      console.error("Failed to create campaign:", err);
      setError(err.message || "Failed to create campaign");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Start a campaign
  const startCampaign = async (campaignId: number): Promise<void> => {
    try {
      setError(null);
      await CampaignService.startCampaign(campaignId);

      // Update campaign status to 'active' in local state
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "active" }
            : campaign
        )
      );
    } catch (err: any) {
      console.error("Failed to start campaign:", err);
      setError(err.message || "Failed to start campaign");
      throw err; // Re-throw to allow component-level error handling
    }
  };

  // Control (pause/resume/stop) a campaign
  const controlCampaign = async (
    campaignId: number,
    action: "pause" | "resume" | "stop"
  ): Promise<void> => {
    try {
      setError(null);
      const result = await CampaignService.controlCampaign(campaignId, action);

      // Update local state
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === result.campaign_id
            ? { ...campaign, status: result.new_status }
            : campaign
        )
      );
    } catch (err: any) {
      console.error("Failed to control campaign:", err);
      setError(err.message || "Failed to control campaign");
    }
  };

  // Delete a campaign
  const deleteCampaign = async (campaignId: number): Promise<void> => {
    try {
      setDeleting(true);
      setError(null);
      await CampaignService.deleteCampaign(campaignId);

      // Remove campaign from local state
      setCampaigns((prev) =>
        prev.filter((campaign) => campaign.id !== campaignId)
      );
    } catch (err: any) {
      console.error("Failed to delete campaign:", err);
      setError(err.message || "Failed to delete campaign");
      throw err; // Re-throw to allow component-level error handling
    } finally {
      setDeleting(false);
    }
  };

  // Automatically fetch campaigns when navigating to /campaigns
  useEffect(() => {
    if (location.pathname === "/campaigns" && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCampaigns();
    }
  }, [location.pathname]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading,
        deleting,
        error,
        refreshCampaigns: fetchCampaigns,
        createCampaign,
        startCampaign,
        controlCampaign,
        deleteCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

// Custom hook
export const useCampaigns = (): CampaignContextType => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaigns must be used within a CampaignProvider");
  }
  return context;
};
