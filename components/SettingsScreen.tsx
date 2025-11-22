import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  ArrowLeft,
  User,
  Target,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';

export function SettingsScreen() {
  const { user, logout, navigate } = useApp();

  const settingsSections = [
    {
      title: 'Profile',
      items: [
        { icon: User, label: 'Personal Information', value: user?.name },
        { icon: Target, label: 'Health Goals', value: user?.goal }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'Enabled' },
        { icon: Target, label: 'Daily Calorie Target', value: `${user?.targetCalories} kcal` }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Privacy & Security' },
        { icon: HelpCircle, label: 'Help & Support' }
      ]
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6', paddingBottom: 70 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View
          style={{
            backgroundColor: '#00c056ff',
            paddingHorizontal: 20,
            paddingTop: 26,
            paddingBottom: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => navigate('main')}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={36} color="white" />
            </View>

            <View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>
                {user?.name}
              </Text>
              <Text style={{ color: '#d1fae5' }}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={{ paddingHorizontal: 20, marginTop: -26, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <Stat label="Days Active" value="12" />
              <Stat label="Meals Logged" value="45" divider />
              <Stat label="Progress" value="2.3kg" />
            </View>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={{ paddingHorizontal: 20 }}>
          {settingsSections.map((section, i) => (
            <View key={i} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#111827' }}>
                {section.title}
              </Text>

              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 4
                }}
              >
                {section.items.map((item, j) => (
                  <TouchableOpacity
                    key={j}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 18,
                      borderBottomWidth: j !== section.items.length - 1 ? 1 : 0,
                      borderColor: '#e5e7eb',
                      alignItems: 'center'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: '#d1fae5',
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <item.icon size={20} color="#00c056ff" />
                      </View>

                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                          {item.label}
                        </Text>

                        {item.value && (
                          <Text style={{ color: '#6b7280' }}>{item.value}</Text>
                        )}
                      </View>
                    </View>

                    <ChevronRight size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: 'white',
              padding: 18,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8
            }}
          >
            <LogOut size={20} color="#dc2626" />
            <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 16 }}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* APP VERSION */}
          <Text style={{ textAlign: 'center', color: '#6b7280', marginVertical: 20 }}>
            DailyBites v0.1
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="settings" />
    </View>
  );
}

function Stat({ label, value, divider = false }) {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: 10,
        borderLeftWidth: divider ? 1 : 0,
        borderRightWidth: divider ? 1 : 0,
        borderColor: '#e5e7eb',
        width: '33%'
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{value}</Text>
      <Text style={{ color: '#6b7280' }}>{label}</Text>
    </View>
  );
}
