import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
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

export function MainScreen() {
  const { user, navigate, scheduledMeals, dishes } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = scheduledMeals.filter(meal => meal.date === today);

  const quickActions = [
    { icon: Book, label: 'Diet Plans', screen: 'diet-plans' as const, bg: '#5038d8ff' },
    { icon: Utensils, label: 'Add Dish', screen: 'dish-editor' as const, bg: '#57b420ff' },
    { icon: Apple, label: 'Products', screen: 'products' as const, bg: '#17ad51ff' },
    { icon: Calendar, label: 'Schedule', screen: 'schedule' as const, bg: '#23aae9ff' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: 70 }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View
          style={{
            backgroundColor: '#00c056ff',
            padding: 20,
            paddingBottom: 32,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: '#d1fae5' }}>Welcome back,</Text>
              <Text style={{ fontSize: 26, fontWeight: '700', color: 'white' }}>
                {user?.name}
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
            <StatCard icon={Flame} label="kcal today" value="1,847" color="#fb923c" />
            <StatCard icon={Target} label="target" value="2,000" color="#38bdf8" />
            <StatCard icon={TrendingDown} label="progress" value="-2.3kg" color="#4ade80" />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.label}
                onPress={() => navigate(action.screen)}
                style={{
                  width: '47%',
                  backgroundColor: 'white',
                  padding: 18,
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
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
                    color: '#111827',
                    textAlign: 'center'
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TODAY MEAL */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
              Today's Meals
            </Text>

            <TouchableOpacity onPress={() => navigate('schedule')}>
              <Text style={{ color: '#00c056ff', fontWeight: '600' }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {todayMeals.length === 0 ? (
            <View
              style={{
                backgroundColor: '#ffffff',
                padding: 28,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6
              }}
            >
              <Calendar size={40} color="#d1d5db" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#6b7280', marginBottom: 12 }}>
                No meals scheduled for today
              </Text>

              <TouchableOpacity
                onPress={() => navigate('schedule')}
                style={{
                  backgroundColor: '#00c056ff',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Schedule Meals
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
                      backgroundColor: 'white',
                      padding: 14,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.06,
                      shadowRadius: 4
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: '#d1fae5',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}
                    >
                      <Utensils size={22} color="#00c056ff" />
                    </View>

                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                        {dish?.name ?? 'Unknown Dish'}
                      </Text>

                      <Text style={{ color: '#6b7280' }}>
                        {meal.time} • {meal.type}
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

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 179, 80, 1)',
        padding: 14,
        borderRadius: 16,
        width: '30%'
      }}
    >
      <Icon size={22} color={color} style={{ marginBottom: 4 }} />
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{value}</Text>
      <Text style={{ color: '#dbdbdbff', fontSize: 12 }}>{label}</Text>
    </View>
  );
}
