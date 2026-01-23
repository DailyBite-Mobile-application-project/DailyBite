import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Calendar,
  Utensils,
  Book,
  Apple,
  Settings,
  TrendingDown,
  Flame,
  Target
} from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';

export function MainScreen() {
  const { user, navigate, scheduledMeals, dishes, theme } = useApp();
  const t = useT();
  const colors = useTheme();

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = scheduledMeals.filter(meal => meal.date === today);

  const mealTypeLabel = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    switch (type) {
      case 'breakfast':
        return t('meal.breakfast');
      case 'lunch':
        return t('meal.lunch');
      case 'dinner':
        return t('meal.dinner');
      case 'snack':
        return t('meal.snack');
      default:
        return type;
    }
  };

  const quickActions = [
    { icon: Book, label: t('main.action.dietPlans'), screen: 'diet-plans' as const, bg: '#5038d8ff' },
    { icon: Utensils, label: t('main.action.addDish'), screen: 'dish-editor' as const, bg: '#57b420ff' },
    { icon: Apple, label: t('main.action.products'), screen: 'products' as const, bg: '#17ad51ff' },
    { icon: Calendar, label: t('main.action.schedule'), screen: 'schedule' as const, bg: '#23aae9ff' }
  ];

  // zachowujemy "brand" tło, ale zależne od theme
  const brandHeaderBg = theme === 'dark' ? '#0b3d2a' : '#00c056ff';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 70 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View
          style={{
            backgroundColor: brandHeaderBg,
            padding: 20,
            paddingBottom: 32
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                {t('main.welcomeBack')}
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '700', color: 'white' }}>
                {user?.name ?? ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigate('settings')}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Settings size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* STATS ROW */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StatCard
              icon={Flame}
              label={t('main.kcalToday')}
              value="1,847"
              accent="#fb923c"
              theme={theme}
            />
            <StatCard
              icon={Target}
              label={t('main.target')}
              value="2,000"
              accent="#38bdf8"
              theme={theme}
            />
            <StatCard
              icon={TrendingDown}
              label={t('main.progress')}
              value="-2.3kg"
              accent="#4ade80"
              theme={theme}
            />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            {t('main.quickActions')}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.label}
                onPress={() => navigate(action.screen)}
                style={{
                  width: '47%',
                  backgroundColor: colors.card,
                  padding: 18,
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOpacity: theme === 'dark' ? 0 : 0.08,
                  shadowRadius: 6,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent',
                  alignItems: 'center'
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: action.bg,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8
                  }}
                >
                  <action.icon size={22} color="white" />
                </View>

                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text,
                    textAlign: 'center'
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TODAY MEALS */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              {t('main.todaysMeals')}
            </Text>

            <TouchableOpacity onPress={() => navigate('schedule')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('main.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {todayMeals.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 28,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: theme === 'dark' ? 0 : 0.08,
                shadowRadius: 6,
                borderWidth: theme === 'dark' ? 1 : 0,
                borderColor: theme === 'dark' ? colors.border : 'transparent'
              }}
            >
              <Calendar size={40} color={colors.muted} style={{ marginBottom: 10 }} />
              <Text style={{ color: colors.muted, marginBottom: 12 }}>
                {t('main.noMealsToday')}
              </Text>

              <TouchableOpacity
                onPress={() => navigate('schedule')}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '600' }}>
                  {t('main.scheduleMeals')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {todayMeals.map(meal => {
                const dish = dishes.find(d => d.id === meal.dishId);

                return (
                  <View
                    key={meal.id}
                    style={{
                      backgroundColor: colors.card,
                      padding: 14,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: theme === 'dark' ? 0 : 0.06,
                      shadowRadius: 4,
                      borderWidth: theme === 'dark' ? 1 : 0,
                      borderColor: theme === 'dark' ? colors.border : 'transparent'
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: theme === 'dark' ? 'rgba(0,192,86,0.18)' : '#d1fae5',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}
                    >
                      <Utensils size={22} color={colors.primary} />
                    </View>

                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {dish?.name ?? t('main.unknownDish')}
                      </Text>

                      <Text style={{ color: colors.muted }}>
                        {meal.time} • {mealTypeLabel(meal.type)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav active="main" />
    </View>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  theme
}: {
  icon: any;
  label: string;
  value: string;
  accent: string;
  theme: 'light' | 'dark';
}) {
  return (
    <View
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.18)',
        padding: 14,
        borderRadius: 16,
        width: '30%',
        borderWidth: theme === 'dark' ? 1 : 0,
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'transparent'
      }}
    >
      <Icon size={22} color={accent} style={{ marginBottom: 4 }} />
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12 }}>{label}</Text>
    </View>
  );
}
