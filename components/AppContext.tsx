import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { fetchProducts, fetchDishes, fetchDietPlans } from './api'; 
export type Screen =
  | 'login'
  | 'main'
  | 'diet-plans'
  | 'diet-detail'
  | 'diet-plan-editor'
  | 'products'
  | 'dish-editor'
  | 'schedule'
  | 'settings';

export type Language = 'pl' | 'en';
export type ThemeMode = 'light' | 'dark';

export type DietPlan = {
  id: string;
  name: string;
  description: string;
  duration: string; 
  category: string;
  image?: string | null;
  imageUrl?: string | null;
  durationDays?: number;
  dishIds: string[];
  calories: number;
  nutritionTotal?: {
    calories: number;
    protein: number;
    carbs: number;
    fat?: number;
    fats?: number;
  };
};

export type Product = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fat?: number; 
  category: string;
};

export type Dish = {
  id: string;
  name: string;
  products: { productId: string; amount: number }[];
  ingredients?: { productId: string; grams: number }[];
  instructions: string;
  prepTime: number;
  prepTimeMinutes?: number;
  image?: string | null;
  imageUrl?: string | null;
  nutritionTotal?: {
    calories: number;
    protein: number;
    carbs: number;
    fat?: number;
    fats?: number;
  };
};

export type ScheduledMeal = {
  id: string;
  date: string;
  time: string;
  dishId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

export type User = {
  id: string;
  name: string; 
  email: string;
  goal: string;
  targetCalories: number;

  firstName?: string;
  lastName?: string;
};

type AppContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (userLike: any) => void;
  logout: () => void;

  currentScreen: Screen;
  navigate: (screen: Screen) => void;

  selectedDietId: string | null;
  openDietDetail: (id: string) => void;
  openDietPlanEditor: (id: string | null) => void;

  selectedDishId: string | null;
  openDishEditor: (id: string | null) => void;

  dietPlans: DietPlan[];
  setDietPlans: (plans: DietPlan[]) => void;
  loadDietPlans: () => Promise<void>;

  products: Product[];
  setProducts: (products: Product[]) => void;
  loadProducts: () => Promise<void>;
  productsLoading: boolean;
  productsError: string | null;

  dishes: Dish[];
  setDishes: (dishes: Dish[]) => void;
  loadDishes: () => Promise<void>;

  scheduledMeals: ScheduledMeal[];
  setScheduledMeals: (meals: ScheduledMeal[]) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;

  selectedCalendarId: string | null;
  setSelectedCalendarId: (id: string | null) => void;
};

export const AppContextInternal = createContext<AppContextType | undefined>(undefined);


const mockDietPlans: DietPlan[] = [
  {
    id: 'd1',
    name: 'Plan number 1',
    description: 'Description for plan number 1.',
    duration: '14 days',
    category: 'Balanced',
    image: null,
    dishIds: [],
    calories: 0
  }
];

const mockDishes: Dish[] = [
  {
    id: 'dish1',
    name: 'Chicken & Rice',
    prepTime: 25,
    instructions: 'Grill chicken, cook rice, combine and season.',
    products: [
      { productId: 'p1', amount: 150 },
      { productId: 'p3', amount: 180 },
      { productId: 'p5', amount: 80 }
    ],
    image: null
  }
];

function normalizeProduct(p: any): Product | null {
  const id = String(p?._id ?? p?.id ?? '');
  const name = String(p?.nazwa ?? p?.name ?? '');

  if (!id || !name) return null;

  return {
    id,
    name,
    category: String(p?.kategoria ?? p?.category ?? 'Inne'),
    calories: Number(p?.kalorie ?? p?.calories ?? 0),
    protein: Number(p?.bialko ?? p?.protein ?? 0),
    carbs: Number(p?.weglowodany ?? p?.carbs ?? 0),
    fats: Number(p?.tluszcz ?? p?.fat ?? p?.fats ?? 0),
    fat: Number(p?.tluszcz ?? p?.fat ?? p?.fats ?? 0),
  };
}

function normalizeDishFromApi(d: any): Dish {
  const ingredients = Array.isArray(d?.ingredients) ? d.ingredients : Array.isArray(d?.products) ? d.products : [];
  const products = ingredients.map((i: any) => ({
    productId: String(i?.productId ?? ''),
    amount: Number(i?.amount ?? i?.grams ?? 0),
  }));

  const nutritionTotal = d?.nutritionTotal
    ? {
        calories: Number(d.nutritionTotal.calories ?? 0),
        protein: Number(d.nutritionTotal.protein ?? 0),
        carbs: Number(d.nutritionTotal.carbs ?? 0),
        fat: Number(d.nutritionTotal.fat ?? d.nutritionTotal.fats ?? 0),
        fats: Number(d.nutritionTotal.fat ?? d.nutritionTotal.fats ?? 0),
      }
    : undefined;

  return {
    id: String(d?.id ?? d?._id ?? ''),
    name: String(d?.name ?? ''),
    products,
    ingredients: ingredients.map((i: any) => ({
      productId: String(i?.productId ?? ''),
      grams: Number(i?.grams ?? i?.amount ?? 0),
    })),
    instructions: String(d?.instructions ?? ''),
    prepTime: Number(d?.prepTime ?? d?.prepTimeMinutes ?? 0),
    prepTimeMinutes: Number(d?.prepTimeMinutes ?? d?.prepTime ?? 0),
    image: d?.image ?? null,
    imageUrl: d?.imageUrl ?? null,
    nutritionTotal,
  };
}

function normalizeDietPlanFromApi(p: any): DietPlan {
  const nutritionTotal = p?.nutritionTotal
    ? {
        calories: Number(p.nutritionTotal.calories ?? 0),
        protein: Number(p.nutritionTotal.protein ?? 0),
        carbs: Number(p.nutritionTotal.carbs ?? 0),
        fat: Number(p.nutritionTotal.fat ?? p.nutritionTotal.fats ?? 0),
        fats: Number(p.nutritionTotal.fat ?? p.nutritionTotal.fats ?? 0),
      }
    : undefined;

  const durationDays = Number(p?.durationDays ?? 0);
  const duration = durationDays > 0 ? `${durationDays} dni` : String(p?.duration ?? '');

  return {
    id: String(p?.id ?? p?._id ?? ''),
    name: String(p?.name ?? ''),
    description: String(p?.description ?? ''),
    duration,
    durationDays: durationDays || undefined,
    category: String(p?.category ?? ''),
    image: p?.image ?? null,
    imageUrl: p?.imageUrl ?? null,
    dishIds: Array.isArray(p?.dishIds) ? p.dishIds.map((id: any) => String(id)) : [],
    calories: Number(p?.calories ?? nutritionTotal?.calories ?? 0),
    nutritionTotal,
  };
}

function normalizeUser(userLike: any): User {
  const id = String(userLike?.id ?? userLike?._id ?? '');
  const email = String(userLike?.email ?? '');

  const firstName = String(userLike?.first_name ?? userLike?.firstName ?? '');
  const lastName = String(userLike?.last_name ?? userLike?.lastName ?? '');

  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id,
    email,
    firstName,
    lastName,
    name: fullName || String(userLike?.name ?? ''), 
    goal: String(userLike?.goal ?? ''),
    targetCalories: Number(userLike?.targetCalories ?? 0),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const [selectedDietId, setSelectedDietId] = useState<string | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  const [dietPlans, setDietPlans] = useState<DietPlan[]>(mockDietPlans);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [language, setLanguage] = useState<Language>('pl');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);

    if (screen !== 'diet-detail' && screen !== 'diet-plan-editor') {
      setSelectedDietId(null);
    }

    if (screen !== 'dish-editor') {
      setSelectedDishId(null);
    }
  };

  const openDietDetail = (id: string) => {
    setSelectedDietId(id);
    navigate('diet-detail');
  };

  const openDietPlanEditor = (id: string | null) => {
    setSelectedDietId(id);
    navigate('diet-plan-editor');
  };

  const openDishEditor = (id: string | null) => {
    setSelectedDishId(id);
    navigate('dish-editor');
  };

  const login = (userLike: any) => {
    const normalized = normalizeUser(userLike);
    setUser(normalized);
    if (userLike?.access_token) setAccessToken(String(userLike.access_token));
    if (userLike?.refresh_token) setRefreshToken(String(userLike.refresh_token));
    navigate('main');
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    navigate('login');
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {

      const raw = await fetchProducts();
      const normalized = Array.isArray(raw)
        ? raw
            .map((p: any) => {
              if (p && typeof p.id === 'string' && typeof p.name === 'string' && 'fats' in p) {
                return p as Product;
              }
              return normalizeProduct(p);
            })
            .filter(Boolean) as Product[]
        : [];

      setProducts(normalized);
    } catch (e: any) {
      setProductsError(e?.message ?? 'Nie udało się pobrać produktów');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadDishes = async () => {
    if (!accessToken) return;
    try {
      const list = await fetchDishes(accessToken);
      if (Array.isArray(list) && list.length > 0) {
        setDishes(list.map(normalizeDishFromApi));
      }
    } catch {
      // zostawiamy lokalny stan jako fallback
    }
  };

  const loadDietPlans = async () => {
    if (!accessToken) return;
    try {
      const list = await fetchDietPlans(accessToken);
      if (Array.isArray(list) && list.length > 0) {
        setDietPlans(list.map(normalizeDietPlanFromApi));
      }
    } catch {
      // zostawiamy lokalny stan jako fallback
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    void loadProducts();
    void loadDishes();
    void loadDietPlans();
  }, [accessToken]);

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <AppContextInternal.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,

        currentScreen,
        navigate,

        selectedDietId,
        openDietDetail,
        openDietPlanEditor,

        selectedDishId,
        openDishEditor,

        dietPlans,
        setDietPlans,
        loadDietPlans,

        products,
        setProducts,
        loadProducts,
        productsLoading,
        productsError,

        dishes,
        setDishes,
        loadDishes,

        scheduledMeals,
        setScheduledMeals,

        language,
        setLanguage,

        theme,
        setTheme,

        selectedCalendarId,
        setSelectedCalendarId
      }}
    >
      {children}
    </AppContextInternal.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContextInternal);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
