import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const AlertDialog = ({
  isOpen,
  onClose,
  title = "Alert",
  message = "",
  type = "info", // warning, success, info, danger
  buttonText = "OK",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
      icon: ExclamationTriangleIcon,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: CheckCircleIcon,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      button: "bg-green-600 hover:bg-green-700",
    },
    info: {
      icon: InformationCircleIcon,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-full ${style.iconBg} p-3`}>
              <Icon className={`h-6 w-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${style.button}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
