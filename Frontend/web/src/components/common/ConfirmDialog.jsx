import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // kept for backward-compatibility (icon only)
  isLoading = false,
  children,
}) => {
  if (!isOpen) return null;

  const iconByType = {
    warning: ExclamationTriangleIcon,
    danger: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon,
  };

  const Icon = iconByType[type] || ExclamationTriangleIcon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-full bg-[#FA8630]/10 p-3">
              <Icon className="h-6 w-6 text-[#FA8630]" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{message}</p>
              {children ? <div className="mt-4">{children}</div> : null}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#FA8630] hover:bg-[#E87928]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
