import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import {
  ArrowLeft,
  Clock,
  Flame,
  Search,
  Plus
} from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';

export function DietPlansScreen() {
  const { dietPlans, navigate, openDietDetail, openDietPlanEditor } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Balanced', 'Weight Loss', 'Vegan', 'Keto'];

  const filteredPlans = dietPlans.filter(plan => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || plan.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
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
            Diet Plans
          </Text>
        </View>

        {/* SEARCH */}
        <View style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#9ca3af"
            style={{ position: 'absolute', left: 12, top: 16 }}
          />
          <TextInput
            placeholder="Search diet plans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              paddingLeft: 40,
              paddingVertical: 10,
              backgroundColor: '#f9fafb',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              fontSize: 14
            }}
          />
        </View>
      </View>

      {/* CATEGORIES */}
      <View
        style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
          paddingVertical: 6
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {categories.map((category, index) => {
              const active = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: active ? '#00c056ff' : '#f3f4f6',
                    marginRight: index !== categories.length - 1 ? 10 : 0
                  }}
                >
                  <Text
                    style={{
                      color: active ? 'white' : '#374151',
                      fontWeight: '600',
                      fontSize: 13
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* PLANS LIST */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
          paddingTop: 16,
          gap: 16
        }}
      >
        {filteredPlans.map(plan => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => openDietDetail(plan.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6
            }}
          >
            {/* IMAGE */}
            <View style={{ height: 140 }}>
              <Image
                source={{
                  uri: plan.image
                    ? plan.image
                    : 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?_gl=1*mskzal*_ga*NTQ1NDU2MDYyLjE3NjM3ODU0NDQ.*_ga_8JE65Q40S6*czE3NjM3ODU0NDMkbzEkZzEkdDE3NjM3ODU0NDckajU2JGwwJGgw'
                }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  backgroundColor: 'white',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: '#00c056ff', fontWeight: '500' }}>
                  {plan.category}
                </Text>
              </View>
            </View>

            {/* DETAILS */}
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                {plan.name}
              </Text>

              <Text style={{ color: '#4b5563', marginBottom: 10 }}>
                {plan.description}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Stat icon={Clock} value={plan.duration} />
                <Stat icon={Flame} value={`${plan.calories} kcal`} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredPlans.length === 0 && (
          <Text style={{ textAlign: 'center', paddingVertical: 40, color: '#6b7280' }}>
            No diet plans found
          </Text>
        )}
      </ScrollView>

      {/* ADD PLAN BUTTON */}
      <TouchableOpacity
        onPress={() => openDietPlanEditor(null)}
        style={{
          position: 'absolute',
          bottom: 95,
          right: 20,
          backgroundColor: '#00c056ff',
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6
        }}
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>

      <BottomNav active="diet-plans" />
    </View>
  );
}

function Stat({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon size={16} color="#6b7280" />
      <Text style={{ color: '#6b7280', fontSize: 13 }}>{value}</Text>
    </View>
  );
}
