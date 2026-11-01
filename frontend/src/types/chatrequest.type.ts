
export type ChatRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface ChatRequestSender {
  id: string;
  name?: string | null;
  fullName?: string | null;
  profileImage?: string | null;
  profileImages?: Array<{
    url: string;
  }>;
  email?: string | null;
}

export interface ChatRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string | null;
  status: ChatRequestStatus;
  createdAt: string;
  sender: ChatRequestSender;
}

export interface ChatRequestsPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ChatRequestsResponse {
  data: ChatRequest[];
  pagination: ChatRequestsPagination;
}
