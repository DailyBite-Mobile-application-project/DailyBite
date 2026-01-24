import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, Book, Calendar, User, Apple } from 'lucide-react-native';
import { useApp } from './AppContext';
import { useT } from './i18n';
import { useTheme } from './theme';

type NavItem = 'main' | 'diet-plans' | 'products' | 'schedule' | 'settings';

export function BottomNav({ active }: { active: NavItem }) {
  const { navigate } = useApp();
  const t = useT();
  const colors = useTheme();

  const navItems = [
    { id: 'main' as const, icon: Home, label: t('nav.home') },
    { id: 'diet-plans' as const, icon: Book, label: t('nav.plans') },
    { id: 'products' as const, icon: Apple, label: t('nav.products') },
    { id: 'schedule' as const, icon: Calendar, label: t('nav.schedule') },
    { id: 'settings' as const, icon: User, label: t('nav.profile') }
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 8 : 0,
        left: 0,
        right: 0,
        backgroundColor: colors.card,
        borderTopWidth: 0,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'android' ? 16 : 10
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxWidth: 520,
          alignSelf: 'center'
        }}
      >
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigate(item.id)}
              style={{
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: isActive ? (colors.primarySoft ?? colors.soft) : colors.card
              }}
            >
              <item.icon size={22} color={isActive ? colors.primary : colors.muted} />
              <Text
                style={{
                  marginTop: 2,
                  color: isActive ? colors.primary : colors.muted,
                  fontSize: 11,
                  fontWeight: '600'
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
