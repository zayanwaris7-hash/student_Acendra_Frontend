import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const showSuccessToast = (title: string, description?: string) =>
    toast(
        <div>
            <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-semibold">{title}</span>
            </div>
            {description && (
                <div className="text-xs text-gray-500 dark:text-gray-200 mt-1">{description}</div>
            )}
        </div>
    );

export const showErrorToast = (title: string, description?: string) =>
    toast(
        <div>
            <div className="flex items-center gap-2">
                <XCircle className="text-red-600" size={20} />
                <span className="font-semibold">{title}</span>
            </div>
            {description && (
                <div className="text-xs text-gray-500  dark:text-gray-200 mt-1">{description}</div>
            )}
        </div>
    );

export const showWarningToast = (title: string, description?: string) =>
    toast(
        <div>
            <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <span className="font-semibold">{title}</span>
            </div>
            {description && (
                <div className="text-xs text-gray-500 mt-1">{description}</div>
            )}
        </div>,
        { style: { backgroundColor: "#fffbe6", color: "#b27d00" } }
    );