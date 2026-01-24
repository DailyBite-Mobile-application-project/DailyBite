const BASE_URL = "https://dailybite-e3r3.onrender.com";

type ApiError = {
  detail?: string | { msg: string }[];
};

async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let error: ApiError = {};
    try {
      error = await res.json();
    } catch {
      throw new Error("Request failed");
    }

    const msg =
      typeof error.detail === "string"
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map(e => e.msg).join(", ")
          : "Request failed";

    throw new Error(msg);
  }

  return res.json();
}

export function signup(data: { email: string; password: string }) {
  return request(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return request<{
    access_token: string;
    refresh_token: string;
    token_type: string;
  }>(`${BASE_URL}/api/auth/token`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
