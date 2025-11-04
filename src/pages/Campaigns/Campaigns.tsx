import React, { useState } from "react";
import {
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  Edit,
  Trash2,
  Search,
  BarChart3,
  Users,
  MapPin,
  Clock,
  Activity,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCampaigns } from "../../contexts/CampaignContext";
import { CampaignType } from "../../types/campaign_type";
import CreateCampaignModal from "../../components/campaigns/CreateCampaignModal";
import DeleteModal from "../../components/common/DeleteModel";

const CampaignsEnhanced: React.FC = () => {
  const {
    campaigns,
    loading,
    deleting,
    error,
    refreshCampaigns,
    startCampaign,
    controlCampaign,
    deleteCampaign,
  } = useCampaigns();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{
    id: number;
    action: string;
  } | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null
  );
  const [controllingId, setControllingId] = useState<number | null>(null);

  /** 🔍 Filters */
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /** 📊 Stats */
  const campaignStats = {
    total: campaigns.length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    running: campaigns.filter(
      (c) => c.status === "running" || c.status === "active"
    ).length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
  };

  const handlePlayCampaign = async (campaign: CampaignType) => {
    try {
      setLoadingAction({ id: campaign.id, action: "play" });
      if (campaign.status === "draft" || campaign.status === "scheduled") {
        await startCampaign(campaign.id);
      } else if (campaign.status === "paused") {
        await controlCampaign(campaign.id, "resume");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePauseCampaign = async (id: number) => {
    try {
      setLoadingAction({ id, action: "pause" });
      await controlCampaign(id, "pause");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStopCampaign = async (id: number) => {
    try {
      setLoadingAction({ id, action: "stop" });
      await controlCampaign(id, "stop");
    } finally {
      setLoadingAction(null);
    }
  };

  /** 🗑️ Handle Delete */
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    try {
      await deleteCampaign(selectedCampaign.id);
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    } catch (err: any) {
      alert(`Failed to delete campaign: ${err.message || "Unknown error"}`);
    }
  };

  /** Modal Handlers */
  const handleOpenDeleteModal = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    }
  };

  /** 🎨 UI Helpers */
  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-emerald-500 text-white",
      running: "bg-emerald-500 text-white",
      paused: "bg-amber-500 text-white",
      completed: "bg-blue-500 text-white",
      cancelled: "bg-red-500 text-white",
      stopped: "bg-red-500 text-white",
      scheduled: "bg-violet-500 text-white",
    };
    return styles[status as keyof typeof styles] || "bg-gray-500 text-white";
  };

  const getStatusGradient = (status: string) => {
    const gradients = {
      active: "from-emerald-400 to-emerald-600",
      running: "from-emerald-400 to-emerald-600",
      paused: "from-amber-400 to-amber-600",
      completed: "from-blue-400 to-blue-600",
      cancelled: "from-red-400 to-red-600",
      stopped: "from-red-400 to-red-600",
      scheduled: "from-violet-400 to-violet-600",
    };
    return (
      gradients[status as keyof typeof gradients] || "from-gray-400 to-gray-600"
    );
  };

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const shouldShowPlayButton = (status: string) =>
    ["scheduled", "paused", "draft"].includes(status);
  const shouldShowPauseButton = (status: string) =>
    ["running", "active"].includes(status);
  const isStopped = (status: string) =>
    ["stopped", "cancelled", "completed"].includes(status);

  /** 🧾 Stat Card Component */
  const StatCard = ({ label, count, icon: Icon, gradient }: any) => (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}
          >
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 capitalize">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );

  /** 🧭 Error & Loading */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Campaigns
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshCampaigns}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  /** 🖥️ MAIN UI */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Campaign Management
            </h1>
            <p className="text-gray-600 text-lg">
              Create, manage, and execute your AI calling campaigns
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total"
            count={campaignStats.total}
            icon={BarChart3}
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            label="Scheduled"
            count={campaignStats.scheduled}
            icon={Calendar}
            gradient="from-violet-400 to-violet-600"
          />
          <StatCard
            label="Running"
            count={campaignStats.running}
            icon={Activity}
            gradient="from-emerald-400 to-emerald-600"
          />
          <StatCard
            label="Paused"
            count={campaignStats.paused}
            icon={Pause}
            gradient="from-amber-400 to-amber-600"
          />
          <StatCard
            label="Completed"
            count={campaignStats.completed}
            icon={BarChart3}
            gradient="from-blue-400 to-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>

        {/* Campaign Cards */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${getStatusGradient(
                    campaign.status
                  )}`}
                />
                <div className="p-6 flex items-start justify-between">
                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getStatusBadge(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {campaign.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {campaign.city},{" "}
                        {campaign.state}, {campaign.country}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />{" "}
                        {formatDateTime(campaign.created_at)}
                      </div>
                      {campaign.contact_list?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />{" "}
                          {campaign.contact_list.length} contacts
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isStopped(campaign.status) ? (
                      <>
                        {/* Play Button (for scheduled, paused, or draft) */}
                        {shouldShowPlayButton(campaign.status) && (
                          <button
                            onClick={() => handlePlayCampaign(campaign)}
                            disabled={
                              loadingAction?.id === campaign.id &&
                              loadingAction?.action === "play"
                            }
                            className="p-3 rounded-xl text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Start / Resume"
                          >
                            {loadingAction?.id === campaign.id &&
                            loadingAction?.action === "play" ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        {/* Pause Button (for running/active) */}
                        {shouldShowPauseButton(campaign.status) && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            disabled={
                              loadingAction?.id === campaign.id &&
                              loadingAction?.action === "pause"
                            }
                            className="p-3 rounded-xl text-amber-600 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Pause"
                          >
                            {loadingAction?.id === campaign.id &&
                            loadingAction?.action === "pause" ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Pause className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        {/* Stop Button (for running/active/paused) */}
                        {(campaign.status === "running" ||
                          campaign.status === "active" ||
                          campaign.status === "paused") && (
                          <button
                            onClick={() => handleStopCampaign(campaign.id)}
                            disabled={
                              loadingAction?.id === campaign.id &&
                              loadingAction?.action === "stop"
                            }
                            className="p-3 rounded-xl text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Stop"
                          >
                            {loadingAction?.id === campaign.id &&
                            loadingAction?.action === "stop" ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowEditModal(true);
                          }}
                          disabled={
                            loadingAction?.id === campaign.id &&
                            loadingAction?.action !== null
                          }
                          className="p-3 rounded-xl text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title="Edit Campaign"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </>
                    ) : null}

                    {/* Always visible Delete button */}
                    <button
                      onClick={() => handleOpenDeleteModal(campaign)}
                      className="p-3 rounded-xl text-red-600 hover:bg-red-100 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={refreshCampaigns}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        itemName={selectedCampaign?.name || ""}
        itemType="Campaign"
        isDeleting={deleting}
      />
    </div>
  );
};

export default CampaignsEnhanced;
