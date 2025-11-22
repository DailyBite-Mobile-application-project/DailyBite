import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput
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

export function ScheduleScreen() {
  const { navigate, scheduledMeals, setScheduledMeals, dishes } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  const [newDishId, setNewDishId] = useState<string | null>(null);
  const [newMealType, setNewMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | ''>('');
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
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
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
      type: newMealType
    };

    setScheduledMeals([...scheduledMeals, newMeal]);
    setShowAddMeal(false);
    setNewDishId(null);
    setNewMealType('');
    setNewTime('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingBottom: 70 }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
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
              backgroundColor: '#f3f4f6',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: '600', color: '#111827' }}>
            Schedule
          </Text>
        </View>
      </View>

      {/* CALENDAR HEADER */}
      <View
        style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
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
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={prevMonth}
              style={navBtnStyle}
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextMonth}
              style={navBtnStyle}
            >
              <ChevronRight size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* DAYS OF WEEK */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <Text key={d} style={{ width: '14%', textAlign: 'center', color: '#6b7280' }}>
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
              ? '#00c056ff'
              : isSelected
              ? '#d1fae5'
              : '#f3f4f6';

            const color = isToday ? 'white' : '#111827';

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
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color }}>{day}</Text>
                </View>

                {hasMeals && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isToday ? 'white' : '#00c056ff',
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
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827' }}>
              Meals for {selectedDate}
            </Text>

            <TouchableOpacity
              onPress={() => setShowAddMeal(true)}
              style={{
                backgroundColor: '#00c056ff',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Plus size={16} color="white" />
              <Text style={{ color: 'white', marginLeft: 6 }}>Add</Text>
            </TouchableOpacity>
          </View>

          {mealsForDate(selectedDate).map(meal => {
            const dish = dishes.find(d => d.id === meal.dishId);
            return (
              <View
                key={meal.id}
                style={{
                  backgroundColor: 'white',
                  padding: 16,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 6
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {dish?.name ?? 'Unknown Dish'}
                  </Text>
                  <Text style={{ color: '#6b7280' }}>
                    {meal.time} • {meal.type}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setScheduledMeals(scheduledMeals.filter(m => m.id !== meal.id))
                  }
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#fee2e2',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={16} color="#b91c1c" />
                </TouchableOpacity>
              </View>
            );
          })}

          {mealsForDate(selectedDate).length === 0 && (
            <Text style={{ textAlign: 'center', color: '#6b7280', paddingVertical: 20 }}>
              No meals scheduled for this day
            </Text>
          )}
        </ScrollView>
      )}

      {/* ADD MEAL */}
      <Modal visible={showAddMeal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 14 }}>
              Add Meal
            </Text>

            <Text style={{ marginBottom: 4 }}>Dish</Text>
            <Picker
              selectedValue={newDishId}
              onValueChange={v => setNewDishId(v)}
            >
              <Picker.Item label="Select dish" value={null} />
              {dishes.map(d => (
                <Picker.Item key={d.id} label={d.name} value={d.id} />
              ))}
            </Picker>

            <Text style={{ marginBottom: 4, marginTop: 12 }}>Meal Type</Text>
            <Picker
              selectedValue={newMealType}
              onValueChange={v => setNewMealType(v)}
            >
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Breakfast" value="breakfast" />
              <Picker.Item label="Lunch" value="lunch" />
              <Picker.Item label="Dinner" value="dinner" />
              <Picker.Item label="Snack" value="snack" />
            </Picker>

            <Text style={{ marginBottom: 4, marginTop: 12 }}>Time (HH:MM)</Text>
            <TextInput
              placeholder="e.g. 08:30"
              value={newTime}
              onChangeText={setNewTime}
              style={{
                backgroundColor: '#f3f4f6',
                padding: 10,
                borderRadius: 10
              }}
            />

            {/* MODAL ACTION */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                justifyContent: 'space-between'
              }}
            >
              <TouchableOpacity
                onPress={addMeal}
                style={{
                  backgroundColor: '#00c056ff',
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Add Meal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAddMeal(false)}
                style={{
                  backgroundColor: '#e5e7eb',
                  padding: 12,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav active="schedule" />
    </View>
  );
}

import { ViewStyle } from 'react-native';

const navBtnStyle: ViewStyle = {
  width: 40,
  height: 40,
  backgroundColor: '#f3f4f6',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center'
};

