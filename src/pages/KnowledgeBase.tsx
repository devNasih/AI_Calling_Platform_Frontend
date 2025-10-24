import React, { useEffect, useState } from "react";
import { useKnowledgeBase } from "../contexts/KnowledgeBaseContext";
import FileUpload from "../components/common/FileUpload";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { toast } from "react-hot-toast";
import {
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  FileX,
} from "lucide-react";

const KnowledgeBase: React.FC = () => {
  const { status, documents, fetchStatus, fetchDocuments, uploadDocument, deleteDocument } = useKnowledgeBase();

  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchStatus();
      await fetchDocuments();
    };
    fetchData();
  }, [fetchStatus, fetchDocuments]);

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    const file = files[0];
    try {
      await uploadDocument(file);
      toast.success(`Document "${file.name}" uploaded successfully!`);
      await fetchDocuments();
      await fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    setDocumentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(documentToDelete);
      toast.success("Document deleted successfully");
      await fetchDocuments();
      await fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "processed":
        return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "Ready", color: "text-green-600 bg-green-50" };
      case "processing":
        return { icon: <Clock className="h-5 w-5 text-yellow-500" />, text: "Processing", color: "text-yellow-600 bg-yellow-50" };
      case "failed":
        return { icon: <AlertCircle className="h-5 w-5 text-red-500" />, text: "Failed", color: "text-red-600 bg-red-50" };
      case "uploaded":
        return { icon: <Upload className="h-5 w-5 text-blue-500" />, text: "Uploaded", color: "text-blue-600 bg-blue-50" };
      default:
        return { icon: <FileText className="h-5 w-5 text-gray-500" />, text: "Unknown", color: "text-gray-600 bg-gray-50" };
    }
  };

  // Compute summary stats
  const totalDocuments = status?.summary.total_files ?? 0;
  const totalSize = status?.summary.total_chunks ?? 0; // Adjust if actual size available
  const processingDocuments = status?.processing_status.currently_processing ?? 0;
  const failedDocuments = status?.status_breakdown.failed ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600">Upload and manage documents for AI training</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Database className="h-8 w-8 text-blue-500" />} label="Total Documents" value={totalDocuments} />
        <StatCard icon={<HardDrive className="h-8 w-8 text-green-500" />} label="Total Chunks" value={totalSize} />
        <StatCard icon={<Clock className="h-8 w-8 text-yellow-500" />} label="Processing" value={processingDocuments} />
        <StatCard icon={<FileX className="h-8 w-8 text-red-500" />} label="Failed" value={failedDocuments} />
      </div>

      {/* Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <Upload className="h-5 w-5 text-gray-400" />
        </div>
        <FileUpload
          accept=".pdf,.doc,.docx,.txt,.md,.rtf"
          maxSize={10}
          onFileSelect={handleFileUpload}
          disabled={uploading}
          multiple={false}
        />
        {uploading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600">Uploading document...</span>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="p-6">
  { !documents ? (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" />
      <span className="ml-2 text-gray-600">Loading documents...</span>
    </div>
  ) : !documents || documents.documents.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="space-y-4">
      {documents.documents.map((doc) => {
        const statusInfo = getStatus(doc.status);
        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{doc.filename}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</span>
                  <span className="text-xs text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.text}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(doc.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  )}
</div>


      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Document">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" /> <span className="ml-2">Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;

// ----------------------
// Helper Components
// ----------------------
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    {icon}
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
const EmptyState: React.FC = () => (
  <div className="text-center py-8">
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
    <p className="text-gray-600">Upload your first document to get started with AI training.</p>
  </div>
);
