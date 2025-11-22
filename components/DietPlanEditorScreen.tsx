import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { ArrowLeft, Save, Trash2, Copy, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from './AppContext';

export function DietPlanEditorScreen() {
  const {
    navigate,
    dietPlans,
    setDietPlans,
    selectedDietId,
    dishes,
    products
  } = useApp();

  const existingPlan = selectedDietId
    ? dietPlans.find(d => d.id === selectedDietId)
    : null;

  const [name, setName] = useState(existingPlan?.name ?? '');
  const [description, setDescription] = useState(existingPlan?.description ?? '');
  const [durationDays, setDurationDays] = useState(
    existingPlan?.duration ? existingPlan.duration.replace(/\D/g, '') : ''
  );
  const [category, setCategory] = useState(existingPlan?.category ?? 'Balanced');
  const [image, setImage] = useState<string | null>(existingPlan?.image ?? null);
  const [assignedDishes, setAssignedDishes] = useState<string[]>(
    existingPlan?.dishIds ?? []
  );

  const nutrition = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;

    assignedDishes.forEach(id => {
      const dish = dishes.find(d => d.id === id);
      if (!dish) return;

      dish.products.forEach(sp => {
        const product = products.find(p => p.id === sp.productId);
        if (!product) return;

        const m = sp.amount / 100;
        calories += product.calories * m;
        protein += product.protein * m;
        carbs += product.carbs * m;
        fats += product.fats * m;
      });
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  }, [assignedDishes, dishes, products]);

  const toggleDish = (id: string) => {
    setAssignedDishes(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const savePlan = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a plan name.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a plan description.');
      return;
    }

    if (!durationDays.trim()) {
      Alert.alert('Missing Duration', 'Please enter number of days.');
      return;
    }

    const daysNumber = Number(durationDays);
    if (isNaN(daysNumber) || daysNumber < 1) {
      Alert.alert('Invalid Duration', 'Duration must be a number greater than 0.');
      return;
    }

    if (assignedDishes.length === 0) {
      Alert.alert('No Dishes Assigned', 'Please assign at least one dish.');
      return;
    }

    const newPlan = {
      id: existingPlan?.id ?? Date.now().toString(),
      name,
      description,
      duration: `${daysNumber} days`,
      category,
      image,
      dishIds: assignedDishes,
      calories: nutrition.calories
    };

    if (existingPlan) {
      setDietPlans(dietPlans.map(p => p.id === existingPlan.id ? newPlan : p));
    } else {
      setDietPlans([...dietPlans, newPlan]);
    }

    navigate('diet-plans');
  };

  const duplicatePlan = () => {
    if (!existingPlan) return;

    const cloned = {
      ...existingPlan,
      id: Date.now().toString(),
      name: existingPlan.name + ' (Copy)'
    };

    setDietPlans([...dietPlans, cloned]);
    navigate('diet-plans');
  };

  const deletePlan = () => {
    if (!existingPlan) return;

    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDietPlans(dietPlans.filter(p => p.id !== existingPlan.id));
            navigate('diet-plans');
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setImage(null);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>

      {/* HEADER */}
      <View style={header}>
        <TouchableOpacity
          onPress={() => navigate('diet-plans')}
          style={backBtn}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>

        <Text style={headerTitle}>
          {existingPlan ? 'Edit Diet Plan' : 'Add Diet Plan'}
        </Text>

        <TouchableOpacity onPress={savePlan} style={saveBtn}>
          <Save size={16} color="white" />
          <Text style={saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>

        {/* IMAGE SECTION */}
        <Text style={label}>Plan Image</Text>

        {image ? (
          <View>
            <Image source={{ uri: image }} style={previewImage} />
            <TouchableOpacity onPress={removeImage} style={removeImgBtn}>
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={addImgBtn}>
            <Camera size={22} color="white" />
            <Text style={addImgText}>Add Image</Text>
          </TouchableOpacity>
        )}

        {/* NAME */}
        <Text style={label}>Plan Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Lean Muscle Plan"
          style={inputStyle}
        />

        {/* DESCRIPTION */}
        <Text style={label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description..."
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          multiline
        />

        {/* DURATION */}
        <Text style={label}>Duration (days)</Text>
        <TextInput
          value={durationDays}
          onChangeText={setDurationDays}
          keyboardType="numeric"
          placeholder="Enter number of days"
          style={inputStyle}
        />

        {/* NUTRITION SUMMARY */}
        <Text style={sectionTitle}>Nutrition (calculated)</Text>

        <Text style={nutriText}>Calories: {nutrition.calories} kcal</Text>
        <Text style={nutriText}>Protein: {nutrition.protein} g</Text>
        <Text style={nutriText}>Carbs: {nutrition.carbs} g</Text>
        <Text style={nutriText}>Fats: {nutrition.fats} g</Text>

        {/* CATEGORY */}
        <Text style={label}>Category</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {['Balanced', 'Weight Loss', 'Vegan', 'Keto'].map(cat => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    catBtn,
                    active ? catBtnActive : catBtnInactive
                  ]}
                >
                  <Text style={active ? catTextActive : catTextInactive}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ASSIGN DISHES */}
        <Text style={sectionTitle}>Assign Dishes</Text>

        {dishes.map(dish => (
          <TouchableOpacity
            key={dish.id}
            onPress={() => toggleDish(dish.id)}
            style={[
              dishItem,
              assignedDishes.includes(dish.id) ? dishItemActive : dishItemInactive
            ]}
          >
            <Text style={dishText}>{dish.name}</Text>
          </TouchableOpacity>
        ))}

        {/* DUPLICATE */}
        {existingPlan && (
          <TouchableOpacity onPress={duplicatePlan} style={duplicateBtn}>
            <Copy size={18} color="white" />
            <Text style={duplicateBtnText}>Duplicate Plan</Text>
          </TouchableOpacity>
        )}

        {/* DELETE */}
        {existingPlan && (
          <TouchableOpacity onPress={deletePlan} style={deleteBtn}>
            <Trash2 size={18} color="white" />
            <Text style={deleteBtnText}>Delete Plan</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const header: ViewStyle = {
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderColor: '#e5e7eb',
  paddingHorizontal: 20,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const backBtn: ViewStyle = {
  width: 40,
  height: 40,
  backgroundColor: '#f3f4f6',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center'
};

const headerTitle: TextStyle = {
  fontSize: 20,
  fontWeight: '600',
  color: '#111827'
};

const saveBtn: ViewStyle = {
  backgroundColor: '#00c056ff',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center'
};

const saveBtnText: TextStyle = {
  color: 'white',
  marginLeft: 6,
  fontWeight: '600'
};

const label: TextStyle = {
  marginTop: 16,
  marginBottom: 4,
  color: '#374151'
};

const previewImage: ImageStyle = {
  width: '100%',
  height: 160,
  borderRadius: 12,
  marginBottom: 6
};

const removeImgBtn: ViewStyle = {
  position: 'absolute',
  right: 10,
  top: 10,
  backgroundColor: '#ef4444',
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center'
};

const addImgBtn: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: '#10b981',
  marginBottom: 6
};

const addImgText: TextStyle = {
  color: 'white',
  fontWeight: '600',
  marginLeft: 6
};

const sectionTitle: TextStyle = {
  fontSize: 18,
  fontWeight: '600',
  marginTop: 22
};

const inputStyle: TextStyle = {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#111827'
};

const nutriText: TextStyle = {
  color: '#10974dff',
  fontSize: 16,
  marginTop: 4
};

const catBtn: ViewStyle = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 12,
  marginRight: 10
};

const catBtnActive: ViewStyle = {
  backgroundColor: '#00c056ff'
};

const catBtnInactive: ViewStyle = {
  backgroundColor: '#e5e7eb'
};

const catTextActive: TextStyle = {
  color: 'white',
  fontWeight: '600'
};

const catTextInactive: TextStyle = {
  color: '#374151',
  fontWeight: '600'
};

const dishItem: ViewStyle = {
  padding: 12,
  borderRadius: 10,
  marginBottom: 8
};

const dishItemActive: ViewStyle = {
  backgroundColor: '#d1fae5'
};

const dishItemInactive: ViewStyle = {
  backgroundColor: '#f3f4f6'
};

const dishText: TextStyle = {
  fontWeight: '600',
  color: '#111827'
};

const duplicateBtn: ViewStyle = {
  backgroundColor: '#3b82f6',
  paddingVertical: 12,
  borderRadius: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 26
};

const duplicateBtnText: TextStyle = {
  color: 'white',
  fontWeight: '600',
  marginLeft: 8
};

const deleteBtn: ViewStyle = {
  backgroundColor: '#ef4444',
  paddingVertical: 12,
  borderRadius: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 12
};

const deleteBtnText: TextStyle = {
  color: 'white',
  fontWeight: '600',
  marginLeft: 8
};
