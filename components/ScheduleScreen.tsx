import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  type ViewStyle
} from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as Calendar from 'expo-calendar';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';
import { syncMealsToSystemCalendar } from './calendarSync';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function ScheduleScreen() {
  const {
    navigate,
    scheduledMeals,
    setScheduledMeals,
    dishes,
    dietPlans,
    theme,
    selectedCalendarId,
    setSelectedCalendarId
  } = useApp();

  const t = useT();
  const colors = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [editingTarget, setEditingTarget] = useState<{
    kind: 'meal' | 'google';
    id: string;
    dateStr: string;
    durationMinutes: number;
    calendarId?: string;
  } | null>(null);
  const [editingTime, setEditingTime] = useState<string>('');

  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [calendarChoices, setCalendarChoices] = useState<Calendar.Calendar[]>([]);
  const [selectedCalendarLabel, setSelectedCalendarLabel] = useState('');

  const [googleEvents, setGoogleEvents] = useState<Calendar.Event[]>([]);
  const [googleEventsByDate, setGoogleEventsByDate] = useState<Record<string, Calendar.Event[]>>({});
  const [googleEventsLoading, setGoogleEventsLoading] = useState(false);
  const [calendarPickerMode, setCalendarPickerMode] = useState<'sync' | 'view'>('sync');

  const isMountedRef = useRef(true);
  const requestSeqRef = useRef(0);

  const [addMode, setAddMode] = useState<'dish' | 'plan'>('dish');
  const [newDishId, setNewDishId] = useState<string | null>(null);
  const [newPlanId, setNewPlanId] = useState<string | null>(null);
  const [newMealType, setNewMealType] = useState<MealType | ''>('');
  const [newTime, setNewTime] = useState<string>('');

  const softBg = colors.input;
  const softActiveBg = colors.primarySoft ?? colors.input;
  const modalOverlayBg = theme === 'dark' ? 'rgba(0,0,0,0.60)' : 'rgba(0,0,0,0.35)';

  const mealTypeLabel = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return t('meal.breakfast');
      case 'lunch':
        return t('meal.lunch');
      case 'dinner':
        return t('meal.dinner');
      case 'snack':
        return t('meal.snack');
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

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

  const mealsForDate = (dateStr: string) => scheduledMeals.filter(meal => meal.date === dateStr);

  const today = new Date().toISOString().split('T')[0];

  const timeOptions = useMemo(() => {
    const times: string[] = [];
    for (let h = 0; h < 24; h += 1) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }, []);

  const formatTime = (dt: Date | null) => {
    if (!dt || Number.isNaN(dt.getTime())) return '--:--';
    const h = String(dt.getHours()).padStart(2, '0');
    const m = String(dt.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const parseMealIdFromNotes = (notes?: string | null) => {
    if (!notes) return null;
    const match = notes.match(/MealId:\s*([^\s]+)/);
    return match ? match[1] : null;
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
    return h * 60 + m;
  };

  const addMeal = () => {
    if (!selectedDate || !newMealType || !newTime) {
      Alert.alert(t('schedule.alert.missingFields.title'), t('schedule.alert.missingFields.msg'));
      return;
    }

    if (addMode === 'dish') {
      if (!newDishId) {
        Alert.alert(t('schedule.alert.missingFields.title'), t('schedule.alert.missingDish.msg'));
        return;
      }

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
      setNewPlanId(null);
      setNewMealType('');
      setNewTime('');
      setAddMode('dish');
      return;
    }

    if (!newPlanId) {
      Alert.alert(t('schedule.alert.missingFields.title'), t('schedule.alert.missingPlan.msg'));
      return;
    }

    const plan = dietPlans.find(p => p.id === newPlanId);
    if (!plan || plan.dishIds.length === 0) {
      Alert.alert(t('schedule.alert.emptyPlan.title'), t('schedule.alert.emptyPlan.msg'));
      return;
    }

    const days = Number(plan.duration.replace(/\D/g, '')) || 0;
    if (days <= 0) {
      Alert.alert(t('schedule.alert.invalidDuration.title'), t('schedule.alert.invalidDuration.msg'));
      return;
    }

    const base = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) {
      Alert.alert(t('schedule.alert.invalidDate.title'), t('schedule.alert.invalidDate.msg'));
      return;
    }

    const newMeals: any[] = [];
    for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      for (const dishId of plan.dishIds) {
        newMeals.push({
          id: `${Date.now()}-${dayOffset}-${dishId}`,
          date: dateStr,
          time: newTime,
          dishId,
          type: newMealType as MealType
        });
      }
    }

    setScheduledMeals([...scheduledMeals, ...newMeals]);
    setShowAddMeal(false);
    setNewDishId(null);
    setNewPlanId(null);
    setNewMealType('');
    setNewTime('');
    setAddMode('dish');
  };

  const startEditMealTime = (mealId: string, time: string) => {
    if (!selectedDate) return;
    setEditingTarget({
      kind: 'meal',
      id: mealId,
      dateStr: selectedDate,
      durationMinutes: 30
    });
    setEditingTime(time);
  };

  const startEditGoogleEventTime = (event: Calendar.Event) => {
    const startValue = event.startDate as any;
    const endValue = event.endDate as any;
    const start = startValue ? new Date(startValue) : null;
    const end = endValue ? new Date(endValue) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const h = String(start.getHours()).padStart(2, '0');
    const m = String(start.getMinutes()).padStart(2, '0');
    const dateStr = start.toISOString().split('T')[0];
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

    setEditingTarget({
      kind: 'google',
      id: event.id,
      dateStr,
      durationMinutes,
      calendarId: (event as any).calendarId
    });
    setEditingTime(`${h}:${m}`);
  };

  const loadGoogleEvents = async (dateStr: string) => {
    if (!selectedCalendarId) return;

    const requestId = requestSeqRef.current + 1;
    requestSeqRef.current = requestId;
    if (isMountedRef.current) setGoogleEventsLoading(true);

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEvents([]);
        return;
      }

      const start = new Date(`${dateStr}T00:00:00`);
      const end = new Date(`${dateStr}T23:59:59`);
      const events = await Calendar.getEventsAsync([selectedCalendarId], start, end);

      if (isMountedRef.current && requestSeqRef.current === requestId) {
        setGoogleEvents(events);
      }
    } catch {
      if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEvents([]);
    } finally {
      if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEventsLoading(false);
    }
  };

  const loadGoogleEventsForMonth = async (date: Date) => {
    if (!selectedCalendarId) {
      if (isMountedRef.current) setGoogleEventsByDate({});
      return;
    }

    const requestId = requestSeqRef.current + 1;
    requestSeqRef.current = requestId;
    if (isMountedRef.current) setGoogleEventsLoading(true);

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEventsByDate({});
        return;
      }

      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      const events = await Calendar.getEventsAsync([selectedCalendarId], start, end);

      const byDate: Record<string, Calendar.Event[]> = {};
      for (const ev of events) {
        const startValue = ev.startDate as any;
        const startDate = startValue ? new Date(startValue) : null;
        if (!startDate || Number.isNaN(startDate.getTime())) continue;
        const key = startDate.toISOString().split('T')[0];
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(ev);
      }

      if (isMountedRef.current && requestSeqRef.current === requestId) {
        setGoogleEventsByDate(byDate);
      }
    } catch {
      if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEventsByDate({});
    } finally {
      if (isMountedRef.current && requestSeqRef.current === requestId) setGoogleEventsLoading(false);
    }
  };

  const saveEditMealTime = async () => {
    if (!editingTarget || !editingTime) {
      Alert.alert(t('schedule.alert.missingFields.title'), t('schedule.alert.missingFields.msg'));
      return;
    }

    if (editingTarget.kind === 'meal') {
      setScheduledMeals(
        scheduledMeals.map(meal => (meal.id === editingTarget.id ? { ...meal, time: editingTime } : meal))
      );
      setEditingTarget(null);
      setEditingTime('');
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('schedule.alert.calendarPermission.title'), t('schedule.alert.calendarPermission.msg'));
        return;
      }

      const start = new Date(`${editingTarget.dateStr}T${editingTime}:00`);
      if (Number.isNaN(start.getTime())) {
        Alert.alert(t('schedule.alert.invalidDate.title'), t('schedule.alert.invalidDate.msg'));
        return;
      }
      const end = new Date(start.getTime() + editingTarget.durationMinutes * 60000);

      try {
        await Calendar.updateEventAsync(editingTarget.id, { startDate: start, endDate: end });
      } catch {
        Alert.alert(t('schedule.alert.calendarDelete.title'), t('schedule.alert.calendarDelete.msg'));
      }
    } finally {
      setEditingTarget(null);
      setEditingTime('');

      if (selectedDate) await loadGoogleEvents(selectedDate);
      await loadGoogleEventsForMonth(currentDate);
    }
  };

  const deleteGoogleEvent = async (eventId: string) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('schedule.alert.calendarPermission.title'), t('schedule.alert.calendarPermission.msg'));
        return;
      }

      await Calendar.deleteEventAsync(eventId);
      if (selectedDate) await loadGoogleEvents(selectedDate);
      await loadGoogleEventsForMonth(currentDate);
    } catch {
      Alert.alert(t('schedule.alert.calendarDelete.title'), t('schedule.alert.calendarDelete.msg'));
    }
  };

  const formatCalendarLabel = (cal: Calendar.Calendar) => cal.title || 'Google';

  const openGoogleCalendarPicker = async (mode: 'sync' | 'view') => {
    setCalendarPickerMode(mode);

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('schedule.alert.calendarPermission.title'), t('schedule.alert.calendarPermission.msg'));
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const googleCalendars = calendars.filter(c => {
        const src = (c.source?.name || '').toLowerCase();
        const owner = (c.ownerAccount || '').toLowerCase();
        return src.includes('google') || owner.includes('gmail.com') || owner.includes('googlemail.com');
      });

      if (googleCalendars.length === 0) {
        Alert.alert(t('schedule.alert.noGoogleCalendar.title'), t('schedule.alert.noGoogleCalendar.msg'));
        return;
      }

      const initialId = selectedCalendarId ?? googleCalendars[0].id;
      const initialCal = googleCalendars.find(c => c.id === initialId) ?? googleCalendars[0];

      if (!isMountedRef.current) return;

      setCalendarChoices(googleCalendars);
      setSelectedCalendarId(initialCal.id);
      setSelectedCalendarLabel(formatCalendarLabel(initialCal));
      setShowCalendarPicker(true);
    } catch {
      Alert.alert(t('schedule.sync.errorTitle'), t('schedule.sync.errorMsg'));
    }
  };

  const handleSyncToCalendar = async () => {
    if (syncLoading) return;

    setSyncLoading(true);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('schedule.alert.calendarPermission.title'), t('schedule.alert.calendarPermission.msg'));
        return;
      }

      if (!selectedCalendarId) {
        await openGoogleCalendarPicker('sync');
        return;
      }

      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      await syncMealsToSystemCalendar(scheduledMeals as any, dishes as any, {
        durationMinutes: 30,
        clearExistingInRange: false,
        titlePrefix: '🍽',
        rangeStart: monthStart,
        rangeEnd: monthEnd,
        calendarIdOverride: selectedCalendarId
      });

      Alert.alert(t('schedule.sync.okTitle'), t('schedule.sync.okMsg'));
    } catch {
      Alert.alert(t('schedule.sync.errorTitle'), t('schedule.sync.errorMsg'));
    } finally {
      setSyncLoading(false);
    }
  };

  const confirmCalendarSelection = async () => {
    setShowCalendarPicker(false);
    if (!selectedCalendarId) return;

    if (calendarPickerMode === 'sync') {
      await handleSyncToCalendar();
    } else if (selectedDate) {
      await loadGoogleEvents(selectedDate);
    }
  };

  const combinedItems = useMemo(() => {
    if (!selectedDate) return [];

    const appMeals = mealsForDate(selectedDate).map(meal => {
      const dish = dishes.find(d => d.id === meal.dishId);
      return {
        kind: 'app' as const,
        id: meal.id,
        timeKey: timeToMinutes(meal.time),
        title: dish?.name ?? t('main.unknownDish'),
        subtitle: `${meal.time} • ${mealTypeLabel(meal.type)}`,
        meal
      };
    });

    const appMealIds = new Set(appMeals.map(m => m.id));

    const googleItems = googleEvents
      .map(ev => {
        const startValue = ev.startDate as any;
        const endValue = ev.endDate as any;
        const start = startValue ? new Date(startValue) : null;
        const end = endValue ? new Date(endValue) : null;
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

        const linkedMealId = parseMealIdFromNotes(ev.notes);
        if (linkedMealId && appMealIds.has(linkedMealId)) return null;

        const title = ev.title || t('schedule.googleCalendar.untitled');
        return {
          kind: 'google' as const,
          id: ev.id,
          timeKey: start.getHours() * 60 + start.getMinutes(),
          title,
          subtitle: `${formatTime(start)} • ${t('schedule.googleCalendar.label')}`,
          event: ev
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);

    return [...appMeals, ...googleItems].sort((a, b) => a.timeKey - b.timeKey);
  }, [selectedDate, scheduledMeals, googleEvents, dishes, t]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      setShowCalendarPicker(false);
      setCalendarChoices([]);
    };
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedCalendarId) {
      setGoogleEvents([]);
      return;
    }
    void loadGoogleEvents(selectedDate);
  }, [selectedDate, selectedCalendarId]);

  useEffect(() => {
    if (!selectedCalendarId) {
      setGoogleEventsByDate({});
      return;
    }
    void loadGoogleEventsForMonth(currentDate);
  }, [selectedCalendarId, currentDate]);

  useEffect(() => {
    if (!selectedCalendarId) {
      setSelectedCalendarLabel('');
      return;
    }

    const loadLabel = async () => {
      try {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const cal = calendars.find(c => c.id === selectedCalendarId);
        if (!cal || !isMountedRef.current) return;
        setSelectedCalendarLabel(formatCalendarLabel(cal));
      } catch {
        if (isMountedRef.current) setSelectedCalendarLabel('');
      }
    };

    void loadLabel();
  }, [selectedCalendarId]);

  const navBtnStyle: ViewStyle = {
    width: 40,
    height: 40,
    backgroundColor: softBg,
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
              backgroundColor: softBg,
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
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

        {/* SYNC BUTTON */}
        <TouchableOpacity
          onPress={handleSyncToCalendar}
          disabled={syncLoading}
          style={{
            backgroundColor: syncLoading ? softBg : colors.primary,
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
            borderWidth: theme === 'dark' && syncLoading ? 1 : 0,
            borderColor: theme === 'dark' && syncLoading ? colors.border : 'transparent'
          }}
        >
          <Text style={{ color: syncLoading ? colors.text : colors.primaryText, fontWeight: '700' }}>
            {syncLoading ? t('schedule.sync.inProgress') : t('schedule.sync.button')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: colors.subtext }}>
            {t('schedule.googleCalendar.label')}: {selectedCalendarLabel || t('schedule.googleCalendar.none')}
          </Text>
          <TouchableOpacity onPress={() => openGoogleCalendarPicker('view')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {selectedCalendarId ? t('schedule.googleCalendar.change') : t('schedule.googleCalendar.select')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DAYS OF WEEK */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {weekDays.map((d, i) => (
            <Text key={`${d}-${i}`} style={{ width: '14%', textAlign: 'center', color: colors.subtext }}>
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
            const hasGoogle = (googleEventsByDate[dateStr]?.length ?? 0) > 0;
            const isToday = dateStr === today;
            const isSelected = selectedDate === dateStr;

            const bg = isToday ? colors.primary : isSelected ? softActiveBg : softBg;
            const textColor = isToday ? colors.primaryText : colors.text;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDate(dateStr)}
                style={{ width: '14%', padding: 4, alignItems: 'center' }}
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

                {(hasMeals || hasGoogle) && (
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
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
              <Text style={{ color: 'white', marginLeft: 6 }}>{t('common.add')}</Text>
            </TouchableOpacity>
          </View>

          {googleEventsLoading && (
            <Text style={{ color: colors.subtext }}>
              {t('schedule.googleCalendar.loading')}
            </Text>
          )}

          {combinedItems.map(item => (
            <View
              key={`${item.kind}-${item.id}`}
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
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.title}
                </Text>

                {item.kind === 'app' ? (
                  <TouchableOpacity onPress={() => startEditMealTime(item.meal.id, item.meal.time)}>
                    <Text style={{ color: colors.subtext }}>
                      {item.subtitle} • {t('schedule.editTime')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => startEditGoogleEventTime(item.event)}>
                    <Text style={{ color: colors.subtext }}>
                      {item.subtitle} • {t('schedule.editTime')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  item.kind === 'app'
                    ? setScheduledMeals(scheduledMeals.filter(m => m.id !== item.id))
                    : deleteGoogleEvent(item.id)
                }
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
          ))}

          {combinedItems.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.subtext, paddingVertical: 20 }}>
              {t('schedule.noMealsThisDay')}
            </Text>
          )}
        </ScrollView>
      )}

      {/* ADD MEAL */}
      <Modal visible={showAddMeal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: modalOverlayBg, justifyContent: 'center', padding: 20 }}>
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

            <Text style={{ marginBottom: 6, color: colors.text }}>{t('schedule.addModeLabel')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setAddMode('dish')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: addMode === 'dish' ? colors.primary : colors.input,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: addMode === 'dish' ? colors.primaryText : colors.text }}>
                  {t('schedule.addModeDish')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddMode('plan')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: addMode === 'plan' ? colors.primary : colors.input,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: addMode === 'plan' ? colors.primaryText : colors.text }}>
                  {t('schedule.addModePlan')}
                </Text>
              </TouchableOpacity>
            </View>

            {addMode === 'dish' ? (
              <>
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
              </>
            ) : (
              <>
                <Text style={{ marginBottom: 6, color: colors.text }}>{t('schedule.planLabel')}</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: colors.input
                  }}
                >
                  <Picker selectedValue={newPlanId} onValueChange={(v) => setNewPlanId(v)}>
                    <Picker.Item label={t('schedule.selectPlan')} value={null} />
                    {dietPlans.map(plan => (
                      <Picker.Item key={plan.id} label={plan.name} value={plan.id} />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <Text style={{ marginBottom: 6, marginTop: 12, color: colors.text }}>{t('schedule.mealTypeLabel')}</Text>
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

            <Text style={{ marginBottom: 6, marginTop: 12, color: colors.text }}>{t('schedule.timeLabel')}</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: colors.input
              }}
            >
              <Picker selectedValue={newTime} onValueChange={(v) => setNewTime(v)}>
                <Picker.Item label={t('schedule.selectTime')} value="" />
                {timeOptions.map(time => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>

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
                  backgroundColor: colors.input,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT TIME */}
      <Modal visible={!!editingTarget} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: modalOverlayBg, justifyContent: 'center', padding: 20 }}>
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
              {t('schedule.editTimeTitle')}
            </Text>

            <Text style={{ marginBottom: 6, color: colors.text }}>{t('schedule.timeLabel')}</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: colors.input
              }}
            >
              <Picker selectedValue={editingTime} onValueChange={(v) => setEditingTime(v)}>
                <Picker.Item label={t('schedule.selectTime')} value="" />
                {timeOptions.map(time => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={saveEditMealTime}
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8
                }}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{t('common.save')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setEditingTarget(null);
                  setEditingTime('');
                }}
                style={{
                  backgroundColor: colors.input,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CALENDAR PICKER */}
      <Modal visible={showCalendarPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: modalOverlayBg, justifyContent: 'center', padding: 20 }}>
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
              {t('schedule.calendarPicker.title')}
            </Text>

            <Text style={{ marginBottom: 6, color: colors.text }}>{t('schedule.calendarPicker.label')}</Text>

            {calendarChoices.length === 0 ? (
              <Text style={{ color: colors.subtext }}>{t('schedule.alert.noGoogleCalendar.msg')}</Text>
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.input
                }}
              >
                <Picker
                  selectedValue={selectedCalendarId}
                  onValueChange={(v) => {
                    setSelectedCalendarId(v);
                    const found = calendarChoices.find(c => c.id === v);
                    setSelectedCalendarLabel(found ? formatCalendarLabel(found) : '');
                  }}
                >
                  {calendarChoices.map(cal => (
                    <Picker.Item key={cal.id} label={cal.title || 'Google'} value={cal.id} />
                  ))}
                </Picker>
              </View>
            )}

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={confirmCalendarSelection}
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8
                }}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{t('common.save')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowCalendarPicker(false)}
                style={{
                  backgroundColor: colors.input,
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8,
                  borderWidth: theme === 'dark' ? 1 : 0,
                  borderColor: theme === 'dark' ? colors.border : 'transparent'
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav active="schedule" />
    </View>
  );
}
