import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ScheduledMeal = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
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

const APP_EVENT_MARKER = 'DailyBites';

function parseMealDateTime(meal: ScheduledMeal): Date | null {
  const [y, m, d] = meal.date.split('-').map(Number);
  const [hh, mm] = meal.time.split(':').map(Number);

  if (!y || !m || !d) return null;
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const dt = new Date(y, m - 1, d, hh, mm, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function parseMealIdFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/MealId:\s*([^\s]+)/);
  return match ? match[1] : null;
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
  const writable = calendars.filter(c => c.allowsModifications && c.source);

  const google = writable.find(c => {
    const src = (c.source?.name || '').toLowerCase();
    const owner = (c.ownerAccount || '').toLowerCase();
    return src.includes('google') || owner.includes('gmail.com') || owner.includes('googlemail.com');
  });
  if (google?.source) return google.source;

  if (writable[0]?.source) return writable[0].source;
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
    const notes = ev.notes ?? '';
    if (!notes.includes(APP_EVENT_MARKER) && !notes.includes('MealId:')) continue;

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
    rangeStart?: Date;
    rangeEnd?: Date;
    calendarIdOverride?: string;
  }
): Promise<SyncResult> {
  await ensureCalendarPermissions();

  const calendarId = opts?.calendarIdOverride ?? await getOrCreateDailyBitesCalendarId();

  const duration = opts?.durationMinutes ?? 30;
  const clearExisting = opts?.clearExistingInRange !== false; 
  const prefix = opts?.titlePrefix ?? '🍽';

  const dateTimes = meals
    .map(parseMealDateTime)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());

  const rangeStart = opts?.rangeStart
    ? opts.rangeStart
    : dateTimes[0]
      ? addMinutes(dateTimes[0], -24 * 60)
      : null;

  const rangeEnd = opts?.rangeEnd
    ? opts.rangeEnd
    : dateTimes[dateTimes.length - 1]
      ? addMinutes(dateTimes[dateTimes.length - 1], 24 * 60)
      : null;

  if (dateTimes.length === 0) {
    return { created: 0, removed: 0, calendarId };
  }

  let removed = 0;
  let created = 0;

  const existingByMealId = new Map<string, Calendar.Event>();
  const existingByKey = new Set<string>();

  if (rangeStart && rangeEnd) {
    const existing = await Calendar.getEventsAsync([calendarId], rangeStart, rangeEnd);

    for (const ev of existing) {
      const mealId = parseMealIdFromNotes(ev.notes);
      if (mealId) {
        existingByMealId.set(mealId, ev);

        const startValue = ev.startDate as any;
        const startDate = startValue ? new Date(startValue) : null;
        if (startDate && !Number.isNaN(startDate.getTime())) {
          existingByKey.add(`${ev.title || ''}|${startDate.toISOString()}`);
        }
        continue;
      }

      if (ev.title && ev.title.startsWith(prefix)) {
        const startValue = ev.startDate as any;
        const startDate = startValue ? new Date(startValue) : null;
        if (startDate && !Number.isNaN(startDate.getTime())) {
          existingByKey.add(`${ev.title}|${startDate.toISOString()}`);
        }
      }
    }
  }

  
  if (clearExisting && meals.length > 0) {
    const desiredIds = new Set(meals.map(m => m.id));

    for (const [mealId, ev] of existingByMealId.entries()) {
      if (!desiredIds.has(mealId)) {
        try {
          await Calendar.deleteEventAsync(ev.id);
          removed++;
        } catch {
          
        }
      }
    }
  }

  for (const meal of meals) {
    const start = parseMealDateTime(meal);
    if (!start) continue;

    const end = addMinutes(start, duration);

    const dishName = dishes.find(d => d.id === meal.dishId)?.name ?? 'Meal';
    const title = `${prefix} ${dishName}`;

    const existing = existingByMealId.get(meal.id);
    if (existing) {
      try {
        const existingStart = existing.startDate ? new Date(existing.startDate as any) : null;
        const existingEnd = existing.endDate ? new Date(existing.endDate as any) : null;

        const needsUpdate =
          !existingStart ||
          !existingEnd ||
          Number.isNaN(existingStart.getTime()) ||
          Number.isNaN(existingEnd.getTime()) ||
          existingStart.getTime() !== start.getTime() ||
          existingEnd.getTime() !== end.getTime() ||
          existing.title !== title;

        if (needsUpdate) {
          await Calendar.updateEventAsync(existing.id, {
            title,
            startDate: start,
            endDate: end,
            notes: `${APP_EVENT_MARKER}\nMealId: ${meal.id}\nType: ${meal.type}\nDish: ${dishName}`,
          });
        }
      } catch {
        
      }
      continue;
    }

    const key = `${title}|${start.toISOString()}`;
    if (existingByKey.has(key)) {
      continue;
    }

    try {
      await Calendar.createEventAsync(calendarId, {
        title,
        startDate: start,
        endDate: end,
        notes: `${APP_EVENT_MARKER}\nMealId: ${meal.id}\nType: ${meal.type}\nDish: ${dishName}`,
      });
      created++;
    } catch {
      
    }
  }

  return { created, removed, calendarId };
}
