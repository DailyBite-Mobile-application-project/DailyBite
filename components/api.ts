const BASE_URL = "https://dailybite-e3r3.onrender.com";

type ApiError = {
  detail?: string | { msg: string }[];
};

type RequestOptions = RequestInit & {
  token?: string; 
};

async function request<T>(url: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let error: ApiError = {};
    try {
      error = await res.json();
    } catch {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Request failed");
    }

    const msg =
      typeof error.detail === "string"
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map((e) => e.msg).join(", ")
          : "Request failed";

    throw new Error(msg);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

// ========= AUTH =========

export function signup(data: { email: string; password: string; name: string }) {
  return request<{ id?: string; email?: string }>(`${BASE_URL}/api/auth/register`, {
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

export type Me = {
  id: string;
  email: string;
  name?: string | null;
};

export function getMe(accessToken: string) {
  return request<Me>(`${BASE_URL}/api/users/me`, {
    method: "GET",
    token: accessToken,
  });
}

// ========= PRODUCTS =========

export type ApiProductRaw = {
  _id?: string;
  id?: string;

  // PL
  nazwa?: string;
  kalorie?: number;
  bialko?: number;
  weglowodany?: number;
  tluszcz?: number;
  kategoria?: string;

  // EN 
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  category?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function mapApiProduct(p: ApiProductRaw): Product {
  const id = String(p._id ?? p.id ?? "").trim();
  return {
    id,
    name: (p.nazwa ?? p.name ?? "").trim(),
    category: (p.kategoria ?? p.category ?? "Inne").trim(),
    calories: Number(p.kalorie ?? p.calories ?? 0),
    protein: Number(p.bialko ?? p.protein ?? 0),
    carbs: Number(p.weglowodany ?? p.carbs ?? 0),
    fat: Number(p.tluszcz ?? p.fat ?? 0),
  };
}

async function fetchProductsFrom(path: string) {
  return request<ApiProductRaw[]>(`${BASE_URL}${path}`, { method: "GET" });
}

export async function fetchProductsRaw() {
  try {
    return await fetchProductsFrom("/api/food/");
  } catch {
    return await fetchProductsFrom("/api/food");
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const raw = await fetchProductsRaw();
  return raw.map(mapApiProduct).filter((p) => p.id && p.name);
}

export async function importDefaultProducts() {
  return request<{ imported: number }>(`${BASE_URL}/api/food/import-defaults`, {
    method: "POST",
  });
}

export async function searchProducts(q: string): Promise<Product[]> {
  const raw = await request<ApiProductRaw[]>(
    `${BASE_URL}/api/food/search?q=${encodeURIComponent(q)}`,
    { method: "GET" }
  );
  return raw.map(mapApiProduct).filter((p) => p.id && p.name);
}

// ========= DISHES =========

export type DishIngredient = {
  productId: string;
  grams: number;
};

export type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DishCreate = {
  name: string;
  prepTimeMinutes: number;
  instructions: string;
  ingredients: DishIngredient[];
  nutritionTotal: Nutrition;
  imageUrl?: string | null;
};

export type Dish = DishCreate & {
  id: string;
};

export function fetchDishes(token?: string) {
  return request<Dish[]>(`${BASE_URL}/api/dishes/`, { method: "GET", token });
}

export function createDish(data: DishCreate, token?: string) {
  return request<Dish>(`${BASE_URL}/api/dishes/`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function updateDish(id: string, data: DishCreate, token?: string) {
  return request<Dish>(`${BASE_URL}/api/dishes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export function deleteDish(id: string, token?: string) {
  return request<{ ok: true }>(`${BASE_URL}/api/dishes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

// ========= DIET PLANS =========

export type DietPlanCreate = {
  name: string;
  description: string;
  durationDays: number; 
  category: string;
  imageUrl?: string | null;
  dishIds: string[];
  nutritionTotal: Nutrition;
};

export type DietPlan = DietPlanCreate & {
  id: string;
};

export function fetchDietPlans(token?: string) {
  return request<DietPlan[]>(`${BASE_URL}/api/diet-plans/`, { method: "GET", token });
}

export function createDietPlan(data: DietPlanCreate, token?: string) {
  return request<DietPlan>(`${BASE_URL}/api/diet-plans/`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function updateDietPlan(id: string, data: DietPlanCreate, token?: string) {
  return request<DietPlan>(`${BASE_URL}/api/diet-plans/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export function deleteDietPlan(id: string, token?: string) {
  return request<{ ok: true }>(
    `${BASE_URL}/api/diet-plans/${encodeURIComponent(id)}`,
    { method: "DELETE", token }
  );
}
