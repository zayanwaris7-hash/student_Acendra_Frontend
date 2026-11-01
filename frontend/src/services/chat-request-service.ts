
import "server-only";

import { redirect } from "next/navigation";
import { isAxiosError } from "axios";


import type {
  ChatRequestsResponse,
} from "@/types/chatrequest.type";
import { api } from "@/utils/axios";

export async function getIncomingRequests(
  cursor?: string,
  limit = 20,
): Promise<ChatRequestsResponse> {
  try {

    const response = await api.get<ChatRequestsResponse>(
      "/chats/requests/incoming",
      {
        params: {
          limit,
          ...(cursor && { cursor }),
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        redirect("/login");
      }

      console.error("Incoming requests API error:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    throw error;
  }
}
