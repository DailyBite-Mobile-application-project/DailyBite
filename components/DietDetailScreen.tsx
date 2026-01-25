import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Clock, Flame, Calendar } from 'lucide-react-native';
import { useApp } from './AppContext';
import { useT } from './i18n';
import { useTheme } from './theme';

type Nutrition = { calories: number; protein: number; carbs: number; fats: number };

export function DietDetailScreen({ dietId }: { dietId: string }) {
  const { dietPlans, navigate, dishes, products } = useApp();
  const t = useT();
  const colors = useTheme();

  const plan = dietPlans.find(p => p.id === dietId);
 const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'Balanced':
        return t('dietCat.balanced');
      case 'Weight Loss':
        return t('dietCat.weightLoss');
      case 'Vegan':
        return t('dietCat.vegan');
      case 'Keto':
        return t('dietCat.keto');
      default:
        return cat || t('dietCat.balanced');
    }
  };

  if (!plan) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.muted }}>{t('dietDetail.notFound')}</Text>
      </View>
    );
  }

  const imageSource =
    plan.image ??
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?_gl=1*mskzal*_ga*NTQ1NDU2MDYyLjE3NjM3ODU0NDQ.*_ga_8JE65Q40S6*czE3NjM3ODU0NDMkbzEkZzEkdDE3NjM3ODU0NDckajU2JGwwJGgw';

  const productById = new Map(products.map(p => [p.id, p]));
  const dishById = new Map(dishes.map(d => [d.id, d]));

  const planDishes = (plan.dishIds || [])
    .map(id => dishById.get(id))
    .filter((d): d is NonNullable<typeof d> => !!d);
 const durationLabel =
    (plan as any).durationDays != null
      ? `${(plan as any).durationDays} ${t('common.days')}`
      : (plan.duration ?? '');

  const cat = plan.category ?? 'Balanced';

  const computedNutrition: Nutrition = planDishes.reduce(
    (acc, dish) => {
      dish.products.forEach(sp => {
        const product = productById.get(sp.productId);
        if (!product) return;

        const m = sp.amount / 100;
        acc.calories += product.calories * m;
        acc.protein += product.protein * m;
        acc.carbs += product.carbs * m;
        acc.fats += product.fats * m;
      });

      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const nutritionFromPlan = (plan as any).nutritionTotal as Nutrition | undefined;
  const nutrition = nutritionFromPlan ?? computedNutrition;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* HEADER IMAGE */}
      <View style={{ height: 220, backgroundColor: colors.primary }}>
        <Image
          source={{ uri: imageSource }}
          style={{ width: '100%', height: '100%', opacity: 0.85 }}
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={() => navigate('diet-plans')}
          style={{
            position: 'absolute',
            top: 40,
            left: 20,
            width: 40,
            height: 40,
            backgroundColor: colors.card,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4
          }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingHorizontal: 20, marginTop: -20 }}>
        {/* INFO CARD */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            marginBottom: 16
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
            {plan.name}
          </Text>

          <Text
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.input,
              color: colors.primary,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 12
            }}
          >
            {categoryLabel(cat)}
          </Text>

          <Text style={{ color: colors.muted, marginBottom: 16 }}>
            {plan.description}
          </Text>

          {/* STATS */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Stat icon={Clock} label={t('dietDetail.duration')} value={durationLabel} />
            <Stat
              icon={Flame}
              label={t('dietDetail.calories')}
              value={`${Math.round(nutrition.calories)} ${t('common.kcal')}`}
            />
          </View>

          {/* MACROS */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Macro label={t('macro.protein')} value={`${Math.round(nutrition.protein)} g`} />
            <Macro label={t('macro.carbs')} value={`${Math.round(nutrition.carbs)} g`} />
            <Macro label={t('macro.fats')} value={`${Math.round(nutrition.fats)} g`} />
          </View>

          <TouchableOpacity
            onPress={() => navigate('schedule')}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Calendar size={18} color="#fff" />
            <Text style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
              {t('dietDetail.startPlan')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DESCRIPTION */}
        <Section title={t('planEditor.desc')}>
          <Text style={{ color: colors.muted }}>{plan.description}</Text>
        </Section>

        {/* DISHES */}
        <Section title={t('planEditor.assignDishes')}>
          {planDishes.length === 0 && (
            <Text style={{ color: colors.muted }}>{t('planEditor.alert.noDishes.msg')}</Text>
          )}

          {planDishes.map(dish => (
            <View key={dish.id} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {dish.name}
              </Text>

              <Text style={{ color: colors.subtext, marginBottom: 8 }}>
                {t('dishEditor.prepTimeLabel')}: {dish.prepTime} min
              </Text>

              <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6 }}>
                {t('dishEditor.section.ingredients')}
              </Text>

              {dish.products.map((sp, idx) => {
                const product = productById.get(sp.productId);
                const label = product ? product.name : t('main.unknownDish');

                return (
                  <Text key={`${dish.id}-ing-${idx}`} style={{ color: colors.muted }}>
                    {label} - {sp.amount} g
                  </Text>
                );
              })}

              <Text style={{ color: colors.text, fontWeight: '600', marginTop: 10, marginBottom: 6 }}>
                {t('dishEditor.section.instructions')}
              </Text>
              <Text style={{ color: colors.muted }}>
                {dish.instructions || '-'}
              </Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const colors = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon size={18} color={colors.primary} />
      <View style={{ marginLeft: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  const colors = useTheme();

  return (
    <View style={{ alignItems: 'center', width: '33%' }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
