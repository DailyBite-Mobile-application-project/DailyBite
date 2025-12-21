const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

type ApiError = {
    detail?: string;
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
        throw new Error(error.detail || "Request failed");
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
