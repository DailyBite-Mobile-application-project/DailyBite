import { View, StatusBar, Platform } from 'react-native';
import { LoginScreen } from './components/LoginScreen';
import { MainScreen } from './components/MainScreen';
import { DietPlansScreen } from './components/DietPlansScreen';
import { DietDetailScreen } from './components/DietDetailScreen';
import { ProductsScreen } from './components/ProductsScreen';
import { DishEditorScreen } from './components/DishEditorScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AppProvider, useApp } from './components/AppContext';
import { DietPlanEditorScreen } from './components/DietPlanEditorScreen';

export type Screen =
  | 'login'
  | 'main'
  | 'diet-plans'
  | 'diet-plan-editor'
  | 'diet-detail'
  | 'products'
  | 'dish-editor'
  | 'schedule'
  | 'settings';

function AppContent() {
  const { currentScreen, user, selectedDietId } = useApp();
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  if (!user) {
    return (
      <View style={{ flex: 1, paddingTop: topInset }}>
        <LoginScreen />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0fdfa', paddingTop: topInset }}>
      {currentScreen === 'main' && <MainScreen />}
      {currentScreen === 'diet-plans' && <DietPlansScreen />}
      {currentScreen === 'diet-plan-editor' && <DietPlanEditorScreen />}
      {currentScreen === 'diet-detail' && (
        <DietDetailScreen dietId={selectedDietId!} />
      )}
      {currentScreen === 'products' && <ProductsScreen />}
      {currentScreen === 'dish-editor' && <DishEditorScreen />}
      {currentScreen === 'schedule' && <ScheduleScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
