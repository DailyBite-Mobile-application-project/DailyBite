import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ScheduledMeal = {
  id: string;
  date: string;     
  time: string;     
  dishId: string;
  type: MealType;
};

export type Dish = {
  id: string;
  name: string;
};

type SyncResult = {
  created: number;
  removed: number;
  calendarId: string;
};

function parseMealDateTime(meal: ScheduledMeal): Date | null {

  const iso = `${meal.date}T${meal.time}:00`;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function ensureCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('CALENDAR_PERMISSION_DENIED');
  }
}

async function getWritableSource() {
  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    if (defaultCal?.source) return defaultCal.source;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find(c => c.allowsModifications && c.source);
  if (writable?.source) return writable.source;

  if (calendars[0]?.source) return calendars[0].source;

  throw new Error('NO_CALENDAR_SOURCE');
}

export async function getOrCreateDailyBitesCalendarId(): Promise<string> {
  await ensureCalendarPermissions();

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(c => c.title === 'DailyBites');

  if (existing?.id) return existing.id;

  const source = await getWritableSource();

  const newId = await Calendar.createCalendarAsync({
    title: 'DailyBites',
    color: '#00c056',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source.id,
    source,
    name: 'dailybites',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER
  });

  return newId;
}

async function removeExistingEventsInRange(calendarId: string, start: Date, end: Date): Promise<number> {

  const events = await Calendar.getEventsAsync([calendarId], start, end);
  let removed = 0;

  for (const ev of events) {
    try {
      await Calendar.deleteEventAsync(ev.id);
      removed++;
    } catch {

    }
  }

  return removed;
}

function mealTypeLabelEN(type: MealType) {
  switch (type) {
    case 'breakfast': return 'Breakfast';
    case 'lunch': return 'Lunch';
    case 'dinner': return 'Dinner';
    case 'snack': return 'Snack';
  }
}

export async function syncMealsToSystemCalendar(
  meals: ScheduledMeal[],
  dishes: Dish[],
  opts?: {

    durationMinutes?: number;

    clearExistingInRange?: boolean;

    titlePrefix?: string; 
  }
): Promise<SyncResult> {
  await ensureCalendarPermissions();

  const calendarId = await getOrCreateDailyBitesCalendarId();

  const duration = opts?.durationMinutes ?? 30;
  const clearExisting = opts?.clearExistingInRange ?? true;
  const prefix = opts?.titlePrefix ?? '🍽';

  const dateTimes = meals
    .map(parseMealDateTime)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dateTimes.length === 0) {
    return { created: 0, removed: 0, calendarId };
  }


  const rangeStart = addMinutes(dateTimes[0], -24 * 60);
  const rangeEnd = addMinutes(dateTimes[dateTimes.length - 1], 24 * 60);

  let removed = 0;
  if (clearExisting) {
    removed = await removeExistingEventsInRange(calendarId, rangeStart, rangeEnd);
  }

  let created = 0;

  for (const meal of meals) {
    const start = parseMealDateTime(meal);
    if (!start) continue;

    const end = addMinutes(start, duration);

    const dishName = dishes.find(d => d.id === meal.dishId)?.name ?? 'Meal';
    const title = `${prefix} ${mealTypeLabelEN(meal.type)} • ${dishName}`;

    try {
      await Calendar.createEventAsync(calendarId, {
        title,
        startDate: start,
        endDate: end,
        notes: `DailyBites\nType: ${meal.type}\nDish: ${dishName}`,

      });
      created++;
    } catch {

    }
  }

  return { created, removed, calendarId };
}
