import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Confirmation Modal Component
export const ConfirmModal = ({ isOpen, title, message, type = 'info', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const colors = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      border: 'border-green-100',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-100',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-100',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-100',
    },
  };

  const Icon = type === 'success' ? CheckCircleIcon :
               type === 'warning' ? ExclamationTriangleIcon :
               type === 'error' ? XCircleIcon :
               InformationCircleIcon;

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
        <div className={`p-6 border-b ${colorScheme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colorScheme.bg}`}>
              <Icon className={`h-6 w-6 ${colorScheme.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${colorScheme.button}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Modal Component
export const NotificationModal = ({ isOpen, title, message, type = 'success', onClose }) => {
  if (!isOpen) return null;

  const colors = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      border: 'border-green-100',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-100',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-100',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-100',
    },
  };

  const Icon = type === 'success' ? CheckCircleIcon :
               type === 'warning' ? ExclamationTriangleIcon :
               type === 'error' ? XCircleIcon :
               InformationCircleIcon;

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
        <div className={`p-6 border-b ${colorScheme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colorScheme.bg}`}>
              <Icon className={`h-6 w-6 ${colorScheme.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${colorScheme.button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Input Modal Component
export const InputModal = ({ isOpen, title, message, placeholder, value, onChange, onConfirm, onCancel, type = 'info' }) => {
  if (!isOpen) return null;

  const colors = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      border: 'border-green-100',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-100',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-100',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-100',
    },
  };

  const Icon = type === 'success' ? CheckCircleIcon :
               type === 'warning' ? ExclamationTriangleIcon :
               type === 'error' ? XCircleIcon :
               InformationCircleIcon;

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
        <div className={`p-6 border-b ${colorScheme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colorScheme.bg}`}>
              <Icon className={`h-6 w-6 ${colorScheme.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">{message}</p>
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${colorScheme.button}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
