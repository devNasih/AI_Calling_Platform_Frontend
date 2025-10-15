import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/common/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'notifications' | 'system'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'api', label: 'API Settings', icon: '🔧' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'system', label: 'System Status', icon: '📊' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={user?.name || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="mt-1">
                    <Badge variant={user?.role === 'admin' ? 'default' : 'outline'}>
                      {user?.role?.toUpperCase() || 'USER'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="joined">Member Since</Label>
                  <Input
                    id="joined"
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button disabled>
                  Update Profile
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Profile updates will be available in a future release.
                </p>
              </div>
            </Card>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-url">API Base URL</Label>
                  <Input
                    id="api-url"
                    type="text"
                    value="http://127.0.0.1:8001"
                    className="mt-1"
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The base URL for API requests. Contact your administrator to change this.
                  </p>
                </div>
                <div>
                  <Label htmlFor="timeout">Request Timeout</Label>
                  <Input
                    id="timeout"
                    type="text"
                    value="30 seconds"
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label>Authentication</Label>
                  <div className="mt-1">
                    <Badge variant="success">Bearer Token Active</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    API requests are authenticated using your session token.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication APIs</span>
                  <Badge variant="success">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Campaign Management</span>
                  <Badge variant="success">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact Management</span>
                  <Badge variant="success">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Call Processing</span>
                  <Badge variant="success">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics APIs</span>
                  <Badge variant="warning">Mock Data</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Root API Health</span>
                  <Badge variant="success">Available</Badge>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Campaign Updates</p>
                    <p className="text-sm text-gray-500">Get notified when campaigns start, complete, or encounter issues</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Call Results</p>
                    <p className="text-sm text-gray-500">Receive notifications for successful and failed calls</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Alerts</p>
                    <p className="text-sm text-gray-500">Important system maintenance and security notifications</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-gray-500">Receive weekly analytics and performance summaries</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </div>
              <div className="mt-6">
                <Button disabled>
                  Update Preferences
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Notification settings will be customizable in a future release.
                </p>
              </div>
            </Card>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            {/* <SystemStatus showTitle={false} autoRefresh={true} refreshInterval={30000} /> */}
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Frontend Version</p>
                  <p className="text-sm text-gray-900">v1.0.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Build Date</p>
                  <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Environment</p>
                  <Badge variant="warning">Development</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Browser</p>
                  <p className="text-sm text-gray-900">{navigator.userAgent.split(' ')[0]}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application settings</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Settings;
