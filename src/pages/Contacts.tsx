import React, { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/common/Button';
import Table, { TableColumn } from '../components/common/Table';
import Modal from '../components/common/Modal';
import FileUpload from '../components/common/FileUpload';
import SearchBox from '../components/common/SearchBox';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Contact } from '../types';
import { contactsService, ContactFilters } from '../services/contacts';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Filters
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 20
  });

  // Form data for add/edit - only API required fields
  const [formData, setFormData] = useState<{
    name: string;
    phone_number: string;
    tag: string;
    region: string;
  }>({
    name: '',
    phone_number: '',
    tag: '',
    region: 'global'
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      // Pass filters to the API for region and tag filtering
      const apiFilters: ContactFilters = {};
      if (filters.region && filters.region !== 'all') apiFilters.region = filters.region;
      if (filters.tag && filters.tag !== 'all') apiFilters.tag = filters.tag;
      
      const contacts = await contactsService.getContacts(apiFilters);
      
      // Apply additional client-side filtering for fields not supported by API
      let filteredContacts = contacts;
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredContacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.phone.toLowerCase().includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm) ||
          contact.company?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.status && filters.status !== 'active') {
        filteredContacts = filteredContacts.filter(contact => contact.status === filters.status);
      }
      
      // Simple client-side pagination
      const itemsPerPage = filters.limit || 10;
      const startIndex = ((filters.page || 1) - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
      
      setContacts(paginatedContacts);
      setTotalContacts(filteredContacts.length);
      setTotalPages(Math.ceil(filteredContacts.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleExport = async () => {
    try {
      const blob = await contactsService.exportContacts(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Contacts exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      if (error.message?.includes('not supported')) {
        toast.error('Exporting contacts is not supported by the current API.');
      } else {
        toast.error('Failed to export contacts');
      }
    }
  };

  const handleAddContact = async () => {
    try {
      // Create contact using exact API format
      const apiData = {
        name: formData.name,
        phone_number: formData.phone_number,
        tag: formData.tag,
        region: formData.region
      };
      
      await contactsService.createContact(apiData);
      toast.success('Contact added successfully');
      setShowAddModal(false);
      setFormData({ name: '', phone_number: '', tag: '', region: 'global' });
      loadContacts();
    } catch (error: any) {
      console.error('Add contact error:', error);
      toast.error(error.message || 'Failed to add contact');
    }
  };

  const handleEditContact = async () => {
    if (!editingContact) return;

    try {
      const contactId = parseInt(editingContact.id);
      if (isNaN(contactId)) {
        toast.error('Cannot edit CSV uploaded contacts. Only individual contacts can be edited.');
        return;
      }

      await contactsService.updateContact(contactId.toString(), {
        name: formData.name,
        phone_number: formData.phone_number,
        tag: formData.tag,
        region: formData.region
      });
      
      toast.success('Contact updated successfully');
      setShowEditModal(false);
      setEditingContact(null);
      setFormData({ name: '', phone_number: '', tag: '', region: 'global' });
      
      // Reload contacts to show updated contact immediately
      await loadContacts();
    } catch (error: any) {
      console.error('Edit contact error:', error);
      if (error.message?.includes('not supported')) {
        toast.error('Editing contacts is not supported by the current API.');
      } else {
        toast.error('Failed to update contact');
      }
    }
  };

    const handleDeleteContact = async (id: string) => {
    // Check if it's a CSV contact
    if (id.startsWith('csv-')) {
      alert('CSV contacts cannot be deleted individually. Please upload a new CSV file to update bulk contacts.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.deleteContact(id);
        await loadContacts();
      } catch (error: any) {
        alert('Failed to delete contact: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await contactsService.bulkDeleteContacts(selectedContacts);
      toast.success(`${selectedContacts.length} contacts deleted successfully`);
      setSelectedContacts([]);
      setShowDeleteModal(false);
      loadContacts();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      if (error.message?.includes('not supported')) {
        toast.error('Deleting contacts is not supported by the current API.');
      } else {
        toast.error('Failed to delete contacts');
      }
    }
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone_number: contact.phone,
      tag: (contact as any).tag || '', // Use API tag if available
      region: (contact as any).region || 'global' // Use API region if available
    });
    setShowEditModal(true);
  };

  const columns: TableColumn<Contact>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      key: 'tag',
      label: 'Tag',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 'general'}
        </span>
      )
    },
    {
      key: 'region',
      label: 'Region',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value || 'global'}
        </span>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => {
        const isCSVContact = row.id.startsWith('csv-');
        const isIndividualContact = !isCSVContact;
        
        return (
          <div className="flex space-x-2">
            {isIndividualContact && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(row)}
                  title="Edit contact"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteContact(row.id)}
                  title="Delete contact"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {isCSVContact && (
              <div className="flex items-center space-x-1 text-gray-500 text-xs">
                <Upload className="h-3 w-3" />
                <span>CSV Contact</span>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your contact lists and upload new contacts</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleExport()}
          >
            Export
          </Button>
          <Button
            variant="outline"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload CSV
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBox
              placeholder="Search contacts..."
              onSearch={handleSearch}
              debounceMs={300}
            />
          </div>
          <div className="flex space-x-2">
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
              className="w-32"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="dnc">DNC</option>
            </Select>
            
            <Select
              value={filters.region || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value || undefined, page: 1 }))}
              className="w-32"
            >
              <option value="">All Regions</option>
              <option value="global">Global</option>
              <option value="india">India</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">Europe</option>
            </Select>
            
            <Select
              value={filters.tag || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value || undefined, page: 1 }))}
              className="w-32"
            >
              <option value="">All Tags</option>
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="lead">Lead</option>
              <option value="customer">Customer</option>
              <option value="prospect">Prospect</option>
            </Select>
            
            {selectedContacts.length > 0 && (
              <Button
                variant="destructive"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete ({selectedContacts.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Contact List ({totalContacts} total)
            </h3>
          </div>
        </div>

        <Table
          data={contacts}
          columns={columns}
          loading={loading}
          emptyMessage="No contacts found"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Contacts"
        size="md"
      >
        <UploadContactsModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadContacts();
          }}
        />
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
        size="md"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddContact}
          onCancel={() => setShowAddModal(false)}
          isEditing={false}
        />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        size="md"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditContact}
          onCancel={() => setShowEditModal(false)}
          isEditing={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Contacts"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-900">
                Are you sure you want to delete {selectedContacts.length} contact(s)?
              </p>
              <p className="text-xs text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Contact Form Component
interface ContactFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter contact name"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone_number">Phone Number *</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleChange('phone_number', e.target.value)}
          placeholder="Enter phone number"
          required
        />
      </div>

      <div>
        <Label htmlFor="tag">Tag *</Label>
        <Input
          id="tag"
          value={formData.tag}
          onChange={(e) => handleChange('tag', e.target.value)}
          placeholder="Enter tag (e.g., sales, support, marketing)"
          required
        />
      </div>

      <div>
        <Label htmlFor="region">Region *</Label>
        <Select
          id="region"
          value={formData.region}
          onChange={(e) => handleChange('region', e.target.value)}
        >
          <option value="global">Global</option>
          <option value="india">India</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="eu">Europe</option>
        </Select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Update' : 'Add'} Contact
        </Button>
      </div>
    </div>
  );
};

// Upload Contacts Modal Component
interface UploadContactsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UploadContactsModal: React.FC<UploadContactsModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const result = await contactsService.uploadContacts(file);
      setUploadResult(result);

      if (result.success) {
        toast.success(`Successfully uploaded ${result.totalUploaded} contacts`);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        toast.error('Upload completed with errors');
      }
    } catch (error) {
      toast.error('Failed to upload contacts');
      setUploadResult({ success: false, errors: ['Upload failed'] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!uploadResult ? (
        <>
          <div className="text-sm text-gray-600 mb-4">
            <p>Upload a CSV file with the following columns:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>name (required)</li>
              <li>phone (required)</li>
              <li>email (optional)</li>
              <li>company (optional)</li>
              <li>status (optional: active, inactive, dnc)</li>
            </ul>
          </div>

          <FileUpload
            onFileSelect={handleFileUpload}
            accept=".csv"
            maxSize={10}
            disabled={uploading}
          />

          {uploading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
              <span className="ml-2 text-sm text-gray-600">Uploading contacts...</span>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
              </p>
              <p className="text-sm text-gray-600">
                {uploadResult.totalUploaded} contacts uploaded
              </p>
            </div>
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {uploadResult.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
