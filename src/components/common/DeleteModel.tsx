import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType?: string;
  description?: string;
  warningMessage?: string;
  isDeleting?: boolean;
  additionalInfo?: Array<{
    label: string;
    value: string | number;
    badge?: {
      text: string;
      className: string;
    };
  }>;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = "item",
  description,
  warningMessage = "This action cannot be undone. All data will be permanently deleted.",
  isDeleting = false,
  additionalInfo = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Description */}
          <div className="space-y-2">
            {description ? (
              <p className="text-gray-700">{description}</p>
            ) : (
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                {itemType && <span className="lowercase">{itemType} </span>}
                <span className="font-bold text-gray-900">"{itemName}"</span>?
              </p>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> {warningMessage}
            </p>
          </div>

          {/* Additional Information */}
          {additionalInfo.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              {additionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600">{info.label}:</span>
                  {info.badge ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${info.badge.className}`}>
                      {info.badge.text}
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {info.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete {itemType}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DeleteModal;