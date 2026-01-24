// SettingsScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  ArrowLeft,
  User,
  Target,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Languages
} from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';

export function SettingsScreen() {
  const { user, logout, navigate, theme, setTheme, language, setLanguage } = useApp();
  const t = useT();
  const colors = useTheme();

  const brandHeaderBg = theme === 'dark' ? '#0b3d2a' : colors.primary;

  const showWip = (label: string) => {
    Alert.alert(
      t('settings.wip.title'),
      t('settings.wip.msg', { feature: label }),
      [{ text: t('common.ok') }]
    );
  };

  // i18n: używamy kluczy, które masz w słowniku
  const settingsSections = [
    {
      title: t('settings.profile'),
      items: [
        { icon: User, label: t('settings.personalInfo'), value: user?.name ?? '' },
        { icon: Target, label: t('settings.healthGoals'), value: (user as any)?.goal ?? '' }
      ]
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: Bell, label: t('settings.notifications'), value: t('settings.enabled') },
        {
          icon: Target,
          label: t('settings.dailyTarget'),
          value: `${(user as any)?.targetCalories ?? '-'} ${t('common.kcal')}`
        }
      ]
    },
    {
      title: t('settings.account'),
      items: [
        { icon: Lock, label: t('settings.privacy') },
        { icon: HelpCircle, label: t('settings.help') }
      ]
    }
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 70 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View
          style={{
            backgroundColor: brandHeaderBg,
            paddingHorizontal: 20,
            paddingTop: 26,
            paddingBottom: 40
          }}
        >
          <TouchableOpacity
            onPress={() => navigate('main')}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.20)',
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
                {user?.name ?? ''}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                {(user as any)?.email ?? ''}
              </Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={{ paddingHorizontal: 20, marginTop: -26, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: theme === 'dark' ? 0 : 0.08,
              shadowRadius: 6,
              borderWidth: theme === 'dark' ? 1 : 0,
              borderColor: theme === 'dark' ? colors.border : 'transparent'
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Stat label={t('settings.daysActive')} value="12" colors={colors} />
              <Stat label={t('settings.mealsLogged')} value="45" divider colors={colors} />
              <Stat label={t('settings.progress')} value="2.3kg" colors={colors} />
            </View>
          </View>
        </View>

        {/* THEME + LANGUAGE */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10, color: colors.text }}>
            {t('settings.theme')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <OptionCard
              active={theme === 'light'}
              onPress={() => setTheme('light')}
              icon={<Sun size={18} color={theme === 'light' ? colors.primaryText : colors.text} />}
              label={t('settings.theme.light')}
              colors={colors}
            />
            <OptionCard
              active={theme === 'dark'}
              onPress={() => setTheme('dark')}
              icon={<Moon size={18} color={theme === 'dark' ? colors.primaryText : colors.text} />}
              label={t('settings.theme.dark')}
              colors={colors}
            />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10, color: colors.text }}>
            {t('settings.language')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <OptionCard
              active={language === 'pl'}
              onPress={() => setLanguage('pl')}
              icon={<Languages size={18} color={language === 'pl' ? colors.primaryText : colors.text} />}
              label="PL"
              colors={colors}
            />
            <OptionCard
              active={language === 'en'}
              onPress={() => setLanguage('en')}
              icon={<Languages size={18} color={language === 'en' ? colors.primaryText : colors.text} />}
              label="EN"
              colors={colors}
            />
          </View>
        </View>

        {/* SETTINGS LIST (STARE SEKCJE) */}
        <View style={{ paddingHorizontal: 20 }}>
          {settingsSections.map((section, i) => (
            <View key={i} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: colors.text }}>
                {section.title}
              </Text>

              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOpacity: theme === 'dark' ? 0 : 0.06,
                  shadowRadius: 4,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                {section.items.map((item, j) => (
                  <TouchableOpacity
                    key={j}
                    onPress={() => showWip(item.label)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 18,
                      borderBottomWidth: j !== section.items.length - 1 ? 1 : 0,
                      borderColor: colors.border,
                      alignItems: 'center'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: colors.primarySoft ?? 'rgba(0,192,86,0.16)',
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: theme === 'dark' ? 1 : 0,
                          borderColor: theme === 'dark' ? 'rgba(0,192,86,0.22)' : 'transparent'
                        }}
                      >
                        <item.icon size={20} color={colors.primary} />
                      </View>

                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                          {item.label}
                        </Text>

                        {!!(item as any).value && (
                          <Text style={{ color: colors.muted }}>{(item as any).value}</Text>
                        )}
                      </View>
                    </View>

                    <ChevronRight size={20} color={colors.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: colors.card,
              padding: 18,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: theme === 'dark' ? 0 : 0.06,
              shadowRadius: 4,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
              borderWidth: theme === 'dark' ? 1 : 0,
              borderColor: theme === 'dark' ? colors.border : 'transparent'
            }}
          >
            <LogOut size={20} color={colors.danger ?? '#dc2626'} />
            <Text style={{ color: colors.danger ?? '#dc2626', fontWeight: '700', fontSize: 16 }}>
              {t('settings.logout')}
            </Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', color: colors.muted, marginVertical: 20 }}>
            DailyBites v0.1
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="settings" />
    </View>
  );
}

function OptionCard({
  active,
  onPress,
  icon,
  label,
  colors
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: active ? colors.primary : colors.card,
        borderWidth: active ? 0 : 1,
        borderColor: active ? 'transparent' : colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
      }}
    >
      {icon}
      <Text
        style={{
          marginLeft: 8,
          color: active ? colors.primaryText : colors.text,
          fontWeight: '700'
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Stat({
  label,
  value,
  divider = false,
  colors
}: {
  label: string;
  value: string;
  divider?: boolean;
  colors: any;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: 10,
        borderLeftWidth: divider ? 1 : 0,
        borderRightWidth: divider ? 1 : 0,
        borderColor: colors.border,
        width: '33%'
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{value}</Text>
      <Text style={{ color: colors.muted }}>{label}</Text>
    </View>
  );
}
