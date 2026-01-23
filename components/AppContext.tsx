import { createContext, useContext, useState, ReactNode } from 'react';

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
  dishIds: string[];
  calories: number;
};

export type Product = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
};

export type Dish = {
  id: string;
  name: string;
  products: { productId: string; amount: number }[];
  instructions: string;
  prepTime: number;
  image?: string | null;
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
};

type AppContextType = {
  user: User | null;
  login: (user: any) => void;
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

  products: Product[];
  dishes: Dish[];
  setDishes: (dishes: Dish[]) => void;

  scheduledMeals: ScheduledMeal[];
  setScheduledMeals: (meals: ScheduledMeal[]) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
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
  },
  {
    id: 'd2',
    name: 'Plan number 2',
    description: 'Description for plan number 2.',
    duration: '21 days',
    category: 'Weight Loss',
    image: null,
    dishIds: [],
    calories: 0
  },
  {
    id: 'd3',
    name: 'Plan number 3',
    description: 'Description for plan number 3.',
    duration: '30 days',
    category: 'Vegan',
    image: null,
    dishIds: [],
    calories: 0
  }
];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'Protein' },
  { id: 'p2', name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, category: 'Protein' },
  { id: 'p3', name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, category: 'Grains' },
  { id: 'p4', name: 'Oats', calories: 389, protein: 17, carbs: 66, fats: 7, category: 'Grains' },
  { id: 'p5', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fats: 0.6, category: 'Vegetables' },
  { id: 'p6', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, category: 'Fats' },
  { id: 'p7', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, category: 'Fats' },
  { id: 'p8', name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, category: 'Dairy' },
  { id: 'p9', name: 'Cheddar Cheese', calories: 403, protein: 25, carbs: 1.3, fats: 33, category: 'Dairy' }
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const [selectedDietId, setSelectedDietId] = useState<string | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  const [dietPlans, setDietPlans] = useState<DietPlan[]>(mockDietPlans);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [products] = useState<Product[]>(mockProducts);

  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);

  const [language, setLanguage] = useState<Language>('pl');

  const [theme, setTheme] = useState<ThemeMode>('light');

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
    setUser(userLike);
    navigate('main');
  };

  const logout = () => {
    setUser(null);
    navigate('login');
  };

  return (
    <AppContextInternal.Provider
      value={{
        user,
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
        products,
        dishes,
        setDishes,
        scheduledMeals,
        setScheduledMeals,
        language,
        setLanguage,
        theme,
        setTheme
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
