import { showErrorToast } from "@/components/ui/toast"
import axios from "axios"

export const handleError = (error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) {
        const raw = error.response?.data?.message || error.message || fallbackMessage
        const message = Array.isArray(raw)
            ? raw.map((e: { constraints?: Record<string, string>; property?: string }) =>
                e?.constraints
                    ? Object.values(e.constraints).join(", ")
                    : e?.property ?? String(e)
              ).join("; ")
            : String(raw)
        showErrorToast(fallbackMessage, message)
    } else {
        showErrorToast(fallbackMessage, 'Unexpected Error')
    }
}