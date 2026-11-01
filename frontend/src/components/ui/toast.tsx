
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const showSuccessToast = (title: string, description?: string) =>
    toast(
        <div className="w-full">
            <div className="flex items-center gap-2">
                <CheckCircle
                    className="shrink-0 text-green-600 dark:text-green-400"
                    size={20}
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </span>
            </div>

            {description && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {description}
                </div>
            )}
        </div>
    );

export const showErrorToast = (title: string, description?: string) =>
    toast(
        <div className="w-full">
            <div className="flex items-center gap-2">
                <XCircle
                    className="shrink-0 text-red-600 dark:text-red-400"
                    size={20}
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </span>
            </div>

            {description && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {description}
                </div>
            )}
        </div>
    );

export const showWarningToast = (title: string, description?: string) =>
    toast(
        <div className="w-full">
            <div className="flex items-center gap-2">
                <AlertCircle
                    className="shrink-0 text-yellow-600 dark:text-yellow-400"
                    size={20}
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </span>
            </div>

            {description && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {description}
                </div>
            )}
        </div>
    );
