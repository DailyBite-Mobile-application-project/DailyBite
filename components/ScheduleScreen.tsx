import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  type ViewStyle
} from 'react-native';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function ScheduleScreen() {
  const { navigate, scheduledMeals, setScheduledMeals, dishes, theme } = useApp();
  const t = useT();
  const colors = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  const [newDishId, setNewDishId] = useState<string | null>(null);
  const [newMealType, setNewMealType] = useState<MealType | ''>('');
  const [newTime, setNewTime] = useState('');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    t('month.january'),
    t('month.february'),
    t('month.march'),
    t('month.april'),
    t('month.may'),
    t('month.june'),
    t('month.july'),
    t('month.august'),
    t('month.september'),
    t('month.october'),
    t('month.november'),
    t('month.december')
  ];

  const weekDays = [
    t('weekday.sun'),
    t('weekday.mon'),
    t('weekday.tue'),
    t('weekday.wed'),
    t('weekday.thu'),
    t('weekday.fri'),
    t('weekday.sat')
  ];

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const formatDate = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const mealsForDate = (dateStr: string) =>
    scheduledMeals.filter(meal => meal.date === dateStr);

  const today = new Date().toISOString().split('T')[0];

  const addMeal = () => {
    if (!selectedDate || !newDishId || !newMealType || !newTime) return;

    const newMeal = {
      id: Date.now().toString(),
      date: selectedDate,
      time: newTime,
      dishId: newDishId,
      type: newMealType as MealType
    };

    setScheduledMeals([...scheduledMeals, newMeal]);
    setShowAddMeal(false);
    setNewDishId(null);
    setNewMealType('');
    setNewTime('');
  };

  const navBtnStyle: ViewStyle = {
    width: 40,
    height: 40,
    backgroundColor: colors.soft,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: theme === 'dark' ? 1 : 0,
    borderColor: theme === 'dark' ? colors.border : 'transparent'
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 70 }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 20,
          paddingVertical: 14
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigate('main')}
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.soft,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              borderWidth: theme === 'dark' ? 1 : 0,
              borderColor: theme === 'dark' ? colors.border : 'transparent'
            }}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>
            {t('schedule.title')}
          </Text>
        </View>
      </View>

      {/* CALENDAR HEADER */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 20,
          paddingVertical: 14
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={prevMonth} style={navBtnStyle}>
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextMonth} style={navBtnStyle}>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DAYS OF WEEK */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {weekDays.map((d) => (
            <Text
              key={d}
              style={{ width: '14%', textAlign: 'center', color: colors.subtext }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* CALENDAR GRID */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <View key={`empty-${i}`} style={{ width: '14%', padding: 4 }} />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);

            const hasMeals = mealsForDate(dateStr).length > 0;
            const isToday = dateStr === today;
            const isSelected = selectedDate === dateStr;

            const bg = isToday
              ? colors.primary
              : isSelected
                ? colors.primarySoft
                : colors.soft;

            const textColor = isToday ? colors.primaryText : colors.text;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDate(dateStr)}
                style={{
                  width: '14%',
                  padding: 4,
                  alignItems: 'center'
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: theme === 'dark' ? 1 : 0,
                    borderColor: theme === 'dark' ? colors.border : 'transparent'
                  }}
                >
                  <Text style={{ color: textColor }}>{day}</Text>
                </View>

                {hasMeals && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isToday ? colors.primaryText : colors.primary,
                      marginTop: 2
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SELECTED MEALS */}
      {selectedDate && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 6
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
              {t('schedule.mealsFor', { date: selectedDate })}
            </Text>

            <TouchableOpacity
              onPress={() => setShowAddMeal(true)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Plus size={16} color="white" />
              <Text style={{ color: 'white', marginLeft: 6 }}>
                {t('common.add')}
              </Text>
            </TouchableOpacity>
          </View>

          {mealsForDate(selectedDate).map(meal => {
            const dish = dishes.find(d => d.id === meal.dishId);

            return (
              <View
                key={meal.id}
                style={{
                  backgroundColor: colors.card,
                  padding: 16,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: theme === 'dark' ? 0 : 0.08,
                  shadowRadius: 6,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {dish?.name ?? t('main.unknownDish')}
                  </Text>
                  <Text style={{ color: colors.subtext }}>
                    {meal.time} • {t(`meal.${meal.type}`)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setScheduledMeals(scheduledMeals.filter(m => m.id !== meal.id))}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: colors.dangerSoft,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          {mealsForDate(selectedDate).length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.subtext, paddingVertical: 20 }}>
              {t('schedule.noMealsThisDay')}
            </Text>
          )}
        </ScrollView>
      )}

      {/* ADD MEAL */}
      <Modal visible={showAddMeal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            padding: 20
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: theme === 'dark' ? 1 : 0,
              borderColor: theme === 'dark' ? colors.border : 'transparent'
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 14, color: colors.text }}>
              {t('schedule.addMealTitle')}
            </Text>

            <Text style={{ marginBottom: 6, color: colors.text }}>{t('schedule.dishLabel')}</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: colors.input
              }}
            >
              <Picker selectedValue={newDishId} onValueChange={(v) => setNewDishId(v)}>
                <Picker.Item label={t('schedule.selectDish')} value={null} />
                {dishes.map(d => (
                  <Picker.Item key={d.id} label={d.name} value={d.id} />
                ))}
              </Picker>
            </View>

            <Text style={{ marginBottom: 6, marginTop: 12, color: colors.text }}>
              {t('schedule.mealTypeLabel')}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: colors.input
              }}
            >
              <Picker selectedValue={newMealType} onValueChange={(v) => setNewMealType(v)}>
                <Picker.Item label={t('schedule.selectType')} value="" />
                <Picker.Item label={t('meal.breakfast')} value="breakfast" />
                <Picker.Item label={t('meal.lunch')} value="lunch" />
                <Picker.Item label={t('meal.dinner')} value="dinner" />
                <Picker.Item label={t('meal.snack')} value="snack" />
              </Picker>
            </View>

            <Text style={{ marginBottom: 6, marginTop: 12, color: colors.text }}>
              {t('schedule.timeLabel')}
            </Text>
            <TextInput
              placeholder={t('schedule.timePlaceholder')}
              placeholderTextColor={colors.muted}
              value={newTime}
              onChangeText={setNewTime}
              style={{
                backgroundColor: colors.input,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
                borderRadius: 12
              }}
            />

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={addMeal}
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8
                }}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '600' }}>
                  {t('schedule.addMealButton')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAddMeal(false)}
                style={{
                  backgroundColor: colors.soft,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav active="schedule" />
    </View>
  );
}
