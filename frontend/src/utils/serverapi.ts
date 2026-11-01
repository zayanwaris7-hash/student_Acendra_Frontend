
import "server-only";

import axios from "axios";
import { cookies } from "next/headers";

export async function getServerApi() {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("auth-token")?.value;

  const baseURL =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (!baseURL) {
    throw new Error("API URL is not configured.");
  }

  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      Accept: "application/json",

      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  });
}
