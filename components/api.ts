const BASE_URL = "http://192.168.0.101:8000";

export async function signup(data: { name: string; email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        let error;
        try {
            error = await res.json();
        } catch {
            throw new Error("Signup failed");
        }
        throw new Error(error.detail || "Signup failed");
    }

    return res.json();
}

export async function login(data: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        let error;
        try {
            error = await res.json();
        } catch {
            throw new Error("Login failed");
        }
        throw new Error(error.detail || "Login failed");
    }

    return res.json();
}
