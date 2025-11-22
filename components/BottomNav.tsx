import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Book, Calendar, User } from 'lucide-react-native';
import { useApp } from './AppContext';

type NavItem = 'main' | 'diet-plans' | 'schedule' | 'settings';

export function BottomNav({ active }: { active: NavItem }) {
  const { navigate } = useApp();

  const navItems = [
    { id: 'main' as const, icon: Home, label: 'Home' },
    { id: 'diet-plans' as const, icon: Book, label: 'Plans' },
    { id: 'schedule' as const, icon: Calendar, label: 'Schedule' },
    { id: 'settings' as const, icon: User, label: 'Profile' },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxWidth: 400,
          alignSelf: 'center',
        }}
      >
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigate(item.id)}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: isActive ? '#ecfdf5' : '#ffffff',
              }}
            >
              <item.icon
                size={24}
                color={isActive ? '#00c056ff' : '#9ca3af'}
              />

              <Text
                style={{
                  marginTop: 2,
                  color: isActive ? '#00c056ff' : '#6b7280',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
