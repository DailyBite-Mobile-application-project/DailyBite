import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Clock, Flame, Check, Calendar } from 'lucide-react-native';
import { useApp } from './AppContext';

export function DietDetailScreen({ dietId }: { dietId: string }) {
  const { dietPlans, navigate } = useApp();

  const plan = dietPlans.find(p => p.id === dietId);

  if (!plan) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Diet plan not found</Text>
      </View>
    );
  }

  const benefits = [
    'Balanced macronutrient distribution',
    'Easy to follow meal structure',
    'Supports sustainable weight management',
    'Includes variety of whole foods',
    'Flexible meal timing options'
  ];

  const imageSource =
    plan.image ??
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?_gl=1*mskzal*_ga*NTQ1NDU2MDYyLjE3NjM3ODU0NDQ.*_ga_8JE65Q40S6*czE3NjM3ODU0NDMkbzEkZzEkdDE3NjM3ODU0NDckajU2JGwwJGgw';

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* HEADER IMAGE */}
      <View style={{ height: 220, backgroundColor: '#10b981' }}>
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
            backgroundColor: 'white',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 4
          }}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingHorizontal: 20, marginTop: -20 }}>
        {/* INFO CARD */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          marginBottom: 16
        }}>
          <Text style={{ fontSize: 22, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
            {plan.name}
          </Text>

          <Text style={{
            alignSelf: 'flex-start',
            backgroundColor: '#cafde3ff',
            color: '#00c056ff',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            fontSize: 13,
            marginBottom: 12
          }}>
            {plan.category}
          </Text>

          <Text style={{ color: '#4b5563', marginBottom: 16 }}>
            {plan.description}
          </Text>

          {/* STATS */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Stat icon={Clock} label="Duration" value={plan.duration} />
            <Stat icon={Flame} label="Calories" value={`${plan.calories} kcal`} />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#00c056ff',
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Calendar size={18} color="#fff" />
            <Text style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
              Start This Plan
            </Text>
          </TouchableOpacity>
        </View>

        {/* BENEFITS */}
        <Section title="Key Benefits">
          {benefits.map((benefit, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={{
                width: 22,
                height: 22,
                backgroundColor: '#d1fae5',
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}>
                <Check size={14} color="#00c056ff" />
              </View>
              <Text style={{ color: '#4b5563' }}>{benefit}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon size={18} color="#00c056ff" />
      <View style={{ marginLeft: 6 }}>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
        <Text style={{ color: '#111827', fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
