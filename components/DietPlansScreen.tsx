import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { ArrowLeft, Clock, Flame, Search, Plus } from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';

type DietCategory = 'All' | 'Balanced' | 'Weight Loss' | 'Vegan' | 'Keto';

export function DietPlansScreen() {
  const { dietPlans, navigate, openDietDetail, openDietPlanEditor, loadDietPlans } = useApp();
  const t = useT();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DietCategory>('All');

  const categories: DietCategory[] = ['All', 'Balanced', 'Weight Loss', 'Vegan', 'Keto'];

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'All':
        return t('dietCat.all');
      case 'Balanced':
        return t('dietCat.balanced');
      case 'Weight Loss':
        return t('dietCat.weightLoss');
      case 'Vegan':
        return t('dietCat.vegan');
      case 'Keto':
        return t('dietCat.keto');
      default:
        
        return cat;
    }
  };

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return dietPlans.filter((plan: any) => {
      const matchesSearch =
        (plan.name ?? '').toLowerCase().includes(q) ||
        (plan.description ?? '').toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' || plan.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [dietPlans, searchQuery, selectedCategory]);

  useEffect(() => {
    if (dietPlans.length === 0) {
      void loadDietPlans();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDietPlans();
    } finally {
      setRefreshing(false);
    }
  };

  const fallbackImage =
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?_gl=1*mskzal*_ga*NTQ1NDU2MDYyLjE3NjM3ODU0NDQ.*_ga_8JE65Q40S6*czE3NjM3ODU0NDMkbzEkZzEkdDE3NjM3ODU0NDckajU2JGwwJGgw';

  const formatDuration = (plan: any) => {
   
    if (plan?.durationDays != null) {
      return `${plan.durationDays} ${t('common.days')}`;
    }
    return String(plan?.duration ?? '');
  };

  const planCalories = (plan: any) => {
   
    const fromNutrition = plan?.nutritionTotal?.calories;
    if (typeof fromNutrition === 'number') return Math.round(fromNutrition);
    if (typeof plan?.calories === 'number') return Math.round(plan.calories);
    return 0;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => navigate('main')}
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.input,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>
            {t('dietPlans.title')}
          </Text>
        </View>

        {/* SEARCH */}
        <View style={{ position: 'relative' }}>
          <Search
            size={18}
            color={colors.muted}
            style={{ position: 'absolute', left: 12, top: 16 }}
          />
          <TextInput
            placeholder={t('dietPlans.searchPlaceholder')}
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              paddingLeft: 40,
              paddingVertical: 10,
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              fontSize: 14,
              color: colors.text
            }}
          />
        </View>
      </View>

      {/* CATEGORIES */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderColor: colors.border,
          paddingVertical: 6
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
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
                    backgroundColor: active ? colors.primary : colors.input,
                    marginRight: index !== categories.length - 1 ? 10 : 0
                  }}
                >
                  <Text
                    style={{
                      color: active ? 'white' : colors.text,
                      fontWeight: '600',
                      fontSize: 13
                    }}
                  >
                    {categoryLabel(category)}
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
          paddingBottom: 220,
          paddingTop: 16,
          gap: 16
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredPlans.map((plan: any) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => openDietDetail(plan.id)}
            style={{
              backgroundColor: colors.card,
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
                source={{ uri: plan.image ? plan.image : fallbackImage }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  backgroundColor: colors.card,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '500' }}>
                  {categoryLabel(plan.category ?? 'All')}
                </Text>
              </View>
            </View>

            {/* DETAILS */}
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                {plan.name}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 10 }}>
                {plan.description}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Stat icon={Clock} value={formatDuration(plan)} />
                <Stat icon={Flame} value={`${planCalories(plan)} ${t('common.kcal')}`} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredPlans.length === 0 && (
          <Text style={{ textAlign: 'center', paddingVertical: 40, color: colors.muted }}>
            {t('dietPlans.noneFound')}
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
          backgroundColor: colors.primary,
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
  const colors = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon size={16} color={colors.muted} />
      <Text style={{ color: colors.muted, fontSize: 13 }}>{value}</Text>
    </View>
  );
}
