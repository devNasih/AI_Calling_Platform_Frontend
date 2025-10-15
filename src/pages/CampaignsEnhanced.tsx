import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  Activity,
  Clock,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ContactApiResponse, CampaignDB, CampaignDBCreate } from '../types';
import campaignsService from '../services/campaigns-new';
import { contactsService } from '../services/contacts';

const CampaignsEnhanced: React.FC = () => {
  // State
  const [campaigns, setCampaigns] = useState<CampaignDB[]>([]);
  const [contacts, setContacts] = useState<ContactApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected items
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDB | null>(null);

  // Form data
  const [createFormData, setCreateFormData] = useState<CampaignDBCreate>({
    name: '',
    message: '',
    region: 'global'
    // DO NOT include: status, created_at, id - backend will set these
  });

  const [editFormData, setEditFormData] = useState<CampaignDBCreate>({
    name: '',
    message: '',
    region: 'global',
    status: 'scheduled'
  });

  const [startFormData, setStartFormData] = useState({
    campaignName: '',
    message: '',
    region: 'global',
    selectedContacts: [] as ContactApiResponse[]
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    name: '',
    message: '',
    region: 'global',
    startTime: ''
  });

  // Load data
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await campaignsService.getAllCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsData = await contactsService.getUploadedContacts();
      const mappedContacts: ContactApiResponse[] = contactsData.map(contact => ({
        name: contact.name,
        phone_number: contact.phone
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadContacts();
  }, []);

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Campaign statistics
  const campaignStats = {
    total: campaigns.length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    running: campaigns.filter(c => c.status === 'running').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length
  };

  // Handlers
  const handleCreateCampaign = async () => {
    if (!createFormData.name || !createFormData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newCampaign = await campaignsService.createCampaignDB(createFormData);
      setCampaigns(prev => [...prev, newCampaign]);
      toast.success(`Campaign "${newCampaign.name}" created successfully!`);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!selectedCampaign || !editFormData.name || !editFormData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const updatedCampaign = await campaignsService.updateCampaign(selectedCampaign.id, editFormData);
      setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? updatedCampaign : c));
      toast.success(`Campaign "${updatedCampaign.name}" updated successfully!`);
      setShowEditModal(false);
      setSelectedCampaign(null);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      setLoading(true);
      await campaignsService.deleteCampaign(selectedCampaign.id);
      setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
      toast.success(`Campaign "${selectedCampaign.name}" deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!startFormData.campaignName || !startFormData.message || startFormData.selectedContacts.length === 0) {
      toast.error('Please fill in all required fields and select contacts');
      return;
    }

    try {
      setLoading(true);
      await campaignsService.startCampaign(
        startFormData.campaignName,
        startFormData.message,
        startFormData.region,
        startFormData.selectedContacts
      );
      
      toast.success(`Campaign "${startFormData.campaignName}" started successfully!`);
      setShowStartModal(false);
      resetStartForm();
      loadCampaigns(); // Reload to get updated status
    } catch (error: any) {
      console.error('Error starting campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to start campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCampaign = async () => {
    if (!scheduleFormData.name || !scheduleFormData.message || !scheduleFormData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await campaignsService.scheduleCampaign(
        scheduleFormData.name,
        scheduleFormData.message,
        scheduleFormData.region,
        scheduleFormData.startTime
      );
      
      toast.success(`Campaign "${scheduleFormData.name}" scheduled successfully!`);
      setShowScheduleModal(false);
      resetScheduleForm();
      loadCampaigns(); // Reload to get updated campaigns
    } catch (error: any) {
      console.error('Error scheduling campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleControlCampaign = async (campaignId: number, action: 'pause' | 'resume' | 'stop') => {
    try {
      setLoading(true);
      await campaignsService.controlCampaign(campaignId, action);
      
      toast.success(`Campaign ${action}d successfully!`);
      loadCampaigns(); // Reload to get updated status
    } catch (error: any) {
      console.error(`Error ${action} campaign:`, error);
      toast.error(error.response?.data?.detail || `Failed to ${action} campaign`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (campaign: CampaignDB) => {
    setSelectedCampaign(campaign);
    setEditFormData({
      name: campaign.name,
      message: campaign.message,
      region: campaign.region,
      status: campaign.status
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (campaign: CampaignDB) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleContactSelection = (contact: ContactApiResponse, isSelected: boolean) => {
    if (isSelected) {
      setStartFormData(prev => ({
        ...prev,
        selectedContacts: [...prev.selectedContacts, contact]
      }));
    } else {
      setStartFormData(prev => ({
        ...prev,
        selectedContacts: prev.selectedContacts.filter(c => c.phone_number !== contact.phone_number)
      }));
    }
  };

  // Reset forms
  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      message: '',
      region: 'global'
      // DO NOT include: status, created_at, id - backend will set these
    });
  };

  const resetStartForm = () => {
    setStartFormData({
      campaignName: '',
      message: '',
      region: 'global',
      selectedContacts: []
    });
  };

  const resetScheduleForm = () => {
    setScheduleFormData({
      name: '',
      message: '',
      region: 'global',
      startTime: ''
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Create, manage, and execute your AI calling campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowScheduleModal(true)}
            variant="outline"
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Schedule Campaign
          </Button>
          <Button
            onClick={() => setShowStartModal(true)}
            variant="outline"
            leftIcon={<Play className="w-4 h-4" />}
          >
            Start Campaign
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.scheduled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.running}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.paused}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          {/* Campaigns List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No campaigns found. Create your first campaign above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{campaign.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Region: {campaign.region}</span>
                      <span>Created: {formatDateTime(campaign.created_at)}</span>
                      <span>ID: {campaign.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Control buttons for active campaigns */}
                    {campaign.status === 'running' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControlCampaign(campaign.id, 'pause')}
                          leftIcon={<Pause className="w-4 h-4" />}
                        >
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControlCampaign(campaign.id, 'stop')}
                          leftIcon={<Square className="w-4 h-4" />}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                    {campaign.status === 'paused' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControlCampaign(campaign.id, 'resume')}
                          leftIcon={<Play className="w-4 h-4" />}
                        >
                          Resume
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControlCampaign(campaign.id, 'stop')}
                          leftIcon={<Square className="w-4 h-4" />}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                    
                    {/* Edit button for non-running campaigns */}
                    {['scheduled', 'paused', 'completed', 'cancelled'].includes(campaign.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(campaign)}
                        leftIcon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                    )}
                    
                    {/* Delete button for non-running campaigns */}
                    {['scheduled', 'completed', 'cancelled'].includes(campaign.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(campaign)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="createName">Campaign Name *</Label>
            <Input
              id="createName"
              value={createFormData.name}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="createMessage">Message *</Label>
            <Textarea
              id="createMessage"
              value={createFormData.message}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter the message to be delivered"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="createRegion">Region</Label>
            <Select
              value={createFormData.region}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, region: e.target.value }))}
            >
              <option value="global">Global</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">Europe</option>
              <option value="asia">Asia</option>
            </Select>
          </div>

          {/* Status is automatically set by backend - no need for user input */}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editName">Campaign Name *</Label>
            <Input
              id="editName"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="editMessage">Message *</Label>
            <Textarea
              id="editMessage"
              value={editFormData.message}
              onChange={(e) => setEditFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter the message to be delivered"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="editRegion">Region</Label>
            <Select
              value={editFormData.region}
              onChange={(e) => setEditFormData(prev => ({ ...prev, region: e.target.value }))}
            >
              <option value="global">Global</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">Europe</option>
              <option value="asia">Asia</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="editStatus">Status</Label>
            <Select
              value={editFormData.status}
              onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCampaign} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Update Campaign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Campaign"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the campaign "{selectedCampaign?.name}"? 
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteCampaign} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete Campaign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Start Campaign Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start New Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="startCampaignName">Campaign Name *</Label>
            <Input
              id="startCampaignName"
              value={startFormData.campaignName}
              onChange={(e) => setStartFormData(prev => ({ ...prev, campaignName: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="startMessage">Message *</Label>
            <Textarea
              id="startMessage"
              value={startFormData.message}
              onChange={(e) => setStartFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter the message to be delivered"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="startRegion">Region</Label>
            <Select
              value={startFormData.region}
              onChange={(e) => setStartFormData(prev => ({ ...prev, region: e.target.value }))}
            >
              <option value="global">Global</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">Europe</option>
              <option value="asia">Asia</option>
            </Select>
          </div>

          <div>
            <Label>Select Contacts * ({startFormData.selectedContacts.length} selected)</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 mt-1">
              {contacts.map((contact) => (
                <label key={contact.phone_number} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={startFormData.selectedContacts.some(c => c.phone_number === contact.phone_number)}
                    onChange={(e) => handleContactSelection(contact, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {contact.name} - {contact.phone_number}
                  </span>
                </label>
              ))}
            </div>
            {contacts.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No contacts available. Please upload contacts first.</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowStartModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartCampaign} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Start Campaign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Campaign Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduleName">Campaign Name *</Label>
            <Input
              id="scheduleName"
              value={scheduleFormData.name}
              onChange={(e) => setScheduleFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="scheduleMessage">Message *</Label>
            <Textarea
              id="scheduleMessage"
              value={scheduleFormData.message}
              onChange={(e) => setScheduleFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter the message to be delivered"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="scheduleRegion">Region</Label>
            <Select
              value={scheduleFormData.region}
              onChange={(e) => setScheduleFormData(prev => ({ ...prev, region: e.target.value }))}
            >
              <option value="global">Global</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">Europe</option>
              <option value="asia">Asia</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={scheduleFormData.startTime}
              onChange={(e) => setScheduleFormData(prev => ({ ...prev, startTime: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleCampaign} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Schedule Campaign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignsEnhanced;
