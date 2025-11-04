import React, { useState, useRef } from "react";
import { useContacts } from "../../contexts/ContactsContext";
import Table, { TableColumn } from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ContactForm from "./forms/contacts_form";
import { Button } from "../../components/common/Button";
import { toast } from "react-hot-toast";
import { ContactsData } from "../../types/contacts_type";
import {
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const ContactsPage: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    uploadLoading,
    refreshContacts,
    createContact,
    updateContact,
    deleteContact,
    uploadContacts,
  } = useContacts();

  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    tag: "",
    country: "",
    state: "",
    city: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddContact = async () => {
    try {
      await createContact(formData);
      setShowForm(false);
      resetForm();
      toast.success("Contact added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add contact");
    }
  };

  const handleUpdateContact = async () => {
    if (editingId === null) return;
    try {
      await updateContact(editingId, formData);
      setShowForm(false);
      resetForm();
      toast.success("Contact updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update contact");
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteContact(id);
      toast.success("Contact deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete contact");
    }
  };

  const handleEditClick = (contact: typeof formData & { id: number }) => {
    setFormData({
      name: contact.name || "",
      phone_number: contact.phone_number || "",
      tag: contact.tag || "",
      country: contact.country || "",
      state: contact.state || "",
      city: contact.city || "",
    });
    setEditingId(contact.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      tag: "",
      country: "",
      state: "",
      city: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please select a CSV file");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const result = await uploadContacts(selectedFile);
      await refreshContacts();

      console.log("Upload result:", result);

      toast.success("Contacts uploaded successfully");

      setShowImportModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message || "Failed to upload contacts");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const columns: TableColumn<ContactsData>[] = [
    {
      key: "name",
      label: "Name",
      render: (v) => (
        <div className="font-medium text-gray-900">{v || "N/A"}</div>
      ),
    },
    {
      key: "phone_number",
      label: "Phone",
      render: (v) => <span className="text-gray-600">{v || "N/A"}</span>,
    },
    {
      key: "country",
      label: "Country",
      render: (v) => <span className="text-gray-600">{v || "N/A"}</span>,
    },
    {
      key: "state",
      label: "State",
      render: (v) => <span className="text-gray-600">{v || "N/A"}</span>,
    },
    {
      key: "city",
      label: "City",
      render: (v) => <span className="text-gray-600">{v || "N/A"}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_v, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditClick(row)}
            title="Edit"
            className="p-1 text-blue-500 hover:bg-blue-100 rounded"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteContact(row.id)}
            title="Delete"
            className="p-1 text-red-500 hover:bg-red-100 rounded"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <button
          onClick={refreshContacts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center space-x-2">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Add Contact
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span>Import</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {contacts.length > 0 ? (
        <Table
          data={contacts}
          columns={columns}
          loading={false}
          emptyMessage="No contacts found"
        />
      ) : (
        <div className="text-gray-500 py-12 text-center">
          No contacts available
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Contact" : "Add Contact"}
            </h2>
            <ContactForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={isEditing ? handleUpdateContact : handleAddContact}
              onCancel={() => {
                setShowForm(false);
                resetForm();
              }}
              isEditing={isEditing}
            />
          </div>
        </div>
      )}

      {/* Import Contacts Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCloseImportModal}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">Import Contacts</h2>

            {/* CSV Format Instructions */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                CSV Format Required:
              </p>
              <code className="text-xs text-blue-800 block bg-white p-2 rounded">
                name,phone_number,tag,country,state,city
              </code>
              <p className="text-blue-700 mt-2 text-xs">
                <strong>Required:</strong> name, phone_number
                <br />
                <strong>Optional:</strong> tag, country, state, city
              </p>
            </div>

            <p className="mb-4 text-gray-600">
              Select a CSV file to upload contacts.
            </p>

            {/* File Input */}
            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="border p-2 w-full rounded"
                onChange={handleFileSelect}
                disabled={uploadLoading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploadLoading && (
              <div className="mb-4 flex items-center justify-center space-x-2">
                <LoadingSpinner />
                <span className="text-gray-600">Uploading...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button onClick={handleCloseImportModal} disabled={uploadLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
