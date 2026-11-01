export interface SafeUser {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: Date;
}
export interface   pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
export interface UsersResponse {
  data: SafeUser[];
  pagination: pagination;
}
export interface OutgoingRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  respondedAt: string | null;
  receiver: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
    status: string;
  } | null;
}
export interface OutgoingRequestsResponse {
  data: OutgoingRequest[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}
export type ChatRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface ChatRequestUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  status: string;
}

export interface ChatRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message: string | null;
  status: ChatRequestStatus;
  createdAt: string;
  respondedAt: string | null;
  sender?: ChatRequestUser;
  receiver?: ChatRequestUser;
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
