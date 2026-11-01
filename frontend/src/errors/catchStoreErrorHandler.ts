import axios from "axios"

interface StoreState {
    isLoading: boolean
    error: string | null
}

type SetFunction<T extends StoreState> = (partial: Partial<T>) => void

export const catchStoreErrorHandler = <T extends StoreState>(set: SetFunction<T>, error: unknown): void => {

    if (axios.isAxiosError(error)) {
        set({
            isLoading: false,
            error: error.response?.data.message || error.message
        } as Partial<T>)
    }

    else {
        set({
            isLoading: false,
            error: "Unexpected Error"
        } as Partial<T>)
    }
}