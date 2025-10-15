import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  Users,
  Activity,
  Clock
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
import { ContactApiResponse } from '../types';
import { campaignsService } from '../services/campaigns';
import { contactsService } from '../services/contacts';

const Campaigns: React.FC = () => {
  const [contacts, setContacts] = useState<ContactApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form data for campaign creation
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

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await contactsService.getContacts();
      // Map Contact[] to ContactApiResponse[]
      const mappedContacts: ContactApiResponse[] = contactsData.map(contact => ({
        name: contact.name,
        phone_number: contact.phone
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleStartCampaign = async () => {
    if (!startFormData.campaignName || !startFormData.message || startFormData.selectedContacts.length === 0) {
      toast.error('Please fill in all required fields and select contacts');
      return;
    }

    try {
      setLoading(true);
      const result = await campaignsService.startCampaign(
        startFormData.campaignName,
        startFormData.message,
        startFormData.region,
        startFormData.selectedContacts
      );
      
      toast.success(`Campaign "${startFormData.campaignName}" started successfully!`);
      console.log('Campaign started:', result);
      
      // Add to active campaigns list with a random ID since the API response doesn't include campaign_id
      setActiveCampaigns(prev => [...prev, {
        id: Date.now(), // Use timestamp as ID since backend doesn't return campaign_id
        name: startFormData.campaignName,
        status: 'running',
        startedAt: new Date().toISOString(),
        contactCount: startFormData.selectedContacts.length
      }]);
      
      setShowStartModal(false);
      resetStartForm();
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
      const result = await campaignsService.scheduleCampaign(
        scheduleFormData.name,
        scheduleFormData.message,
        scheduleFormData.region,
        scheduleFormData.startTime
      );
      
      toast.success(`Campaign "${scheduleFormData.name}" scheduled successfully!`);
      console.log('Campaign scheduled:', result);
      
      setShowScheduleModal(false);
      resetScheduleForm();
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
      const result = await campaignsService.controlCampaign(campaignId, action);
      
      toast.success(`Campaign ${action}d successfully!`);
      console.log(`Campaign ${action}:`, result);
      
      // Update local campaign status
      setActiveCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: action === 'stop' ? 'stopped' : action === 'pause' ? 'paused' : 'running' }
            : campaign
        )
      );
    } catch (error: any) {
      console.error(`Error ${action} campaign:`, error);
      toast.error(error.response?.data?.detail || `Failed to ${action} campaign`);
    } finally {
      setLoading(false);
    }
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Start, schedule, and manage your AI calling campaigns</p>
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
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Start Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCampaigns.filter(c => c.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Campaigns</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCampaigns.filter(c => c.status === 'paused').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCampaigns.filter(c => c.status === 'stopped').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {activeCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No campaigns running. Start your first campaign above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Started: {formatDateTime(campaign.startedAt)}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.contactCount} contacts
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'running' 
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Campaign Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start New Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="campaignName">Campaign Name *</Label>
            <Input
              id="campaignName"
              value={startFormData.campaignName}
              onChange={(e) => setStartFormData(prev => ({ ...prev, campaignName: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={startFormData.message}
              onChange={(e) => setStartFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter the message to be delivered"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
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

export default Campaigns;
