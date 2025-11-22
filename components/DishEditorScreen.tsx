import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { ArrowLeft, Plus, Trash2, Clock, Save, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from './AppContext';

export function DishEditorScreen() {
  const { navigate, selectedDishId, dishes, setDishes, products } = useApp();

  const existingDish = selectedDishId
    ? dishes.find(d => d.id === selectedDishId)
    : null;

  const [dishName, setDishName] = useState(existingDish?.name ?? '');
  const [instructions, setInstructions] = useState(existingDish?.instructions ?? '');
  const [prepTime, setPrepTime] = useState(existingDish?.prepTime ?? 30);
  const [ingredients, setIngredients] = useState(existingDish?.products ?? []);
  const [imageUri, setImageUri] = useState(existingDish?.image ?? null);

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    if (products.length > 0) {
      setIngredients([
        ...ingredients,
        { productId: products[0].id, amount: 100 }
      ]);
    }
  };

  const updateIngredient = (index: number, field: 'productId' | 'amount', value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const nutrition = (() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;

    ingredients.forEach(sp => {
      const product = products.find(p => p.id === sp.productId);
      if (product) {
        const m = sp.amount / 100;
        calories += product.calories * m;
        protein += product.protein * m;
        carbs += product.carbs * m;
        fats += product.fats * m;
      }
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  })();

  const saveDish = () => {
    if (!dishName.trim()) {
      Alert.alert('Missing Name', 'Please enter a dish name.');
      return;
    }

    const newDish = {
      id: existingDish?.id ?? Date.now().toString(),
      name: dishName.trim(),
      products: ingredients,
      instructions,
      prepTime,
      image: imageUri ?? null,
      nutrition: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats
      }
    };

    if (existingDish) {
      setDishes(dishes.map(d => d.id === existingDish.id ? newDish : d));
    } else {
      setDishes([...dishes, newDish]);
    }

    navigate('main');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      
      {/* HEADER */}
      <View
        style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <TouchableOpacity
          onPress={() => navigate('main')}
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#f3f4f6',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827' }}>
          {existingDish ? 'Edit Dish' : 'Add Dish'}
        </Text>

        <TouchableOpacity
          onPress={saveDish}
          style={{
            backgroundColor: '#00c056ff',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Save size={16} color="white" />
          <Text style={{ color: 'white', marginLeft: 6, fontWeight: '600' }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

        {/* IMAGE PICKER */}
        <Section title="Dish Image">
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Add Image", "Choose source:", [
                { text: "Camera", onPress: pickImageFromCamera },
                { text: "Gallery", onPress: pickImageFromGallery },
                { text: "Cancel", style: "cancel" }
              ])
            }
            style={{
              backgroundColor: '#e5f8ee',
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}
          >
            <Camera size={20} color="#00a14b" />
            <Text style={{ marginLeft: 8, color: '#00a14b', fontWeight: '600' }}>
              {imageUri ? "Change Image" : "Add Image"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 14,
                marginBottom: 12
              }}
            />
          )}
        </Section>

        {/* BASIC INFO */}
        <Section title="Basic Information">
          <Text style={{ color: '#374151', marginBottom: 6 }}>Dish Name</Text>
          <TextInput
            value={dishName}
            onChangeText={setDishName}
            placeholder="e.g., Grilled Chicken Bowl"
            style={inputStyle}
          />

          <Text style={{ color: '#374151', marginTop: 16, marginBottom: 6 }}>
            Preparation Time (minutes)
          </Text>
          <TextInput
            value={String(prepTime)}
            onChangeText={(v) => setPrepTime(Number(v))}
            keyboardType="numeric"
            style={inputStyle}
          />
        </Section>

        {/* INGREDIENTS */}
        <Section title="Ingredients" rightButtonLabel="Add" rightButtonAction={addIngredient}>
          {ingredients.map((ing, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 12,
                marginBottom: 10
              }}
            >
              <Picker
                selectedValue={ing.productId}
                onValueChange={(v) => updateIngredient(index, 'productId', v)}
              >
                {products.map(p => (
                  <Picker.Item key={p.id} label={p.name} value={p.id} />
                ))}
              </Picker>

              <TextInput
                value={String(ing.amount)}
                onChangeText={(v) => updateIngredient(index, 'amount', Number(v))}
                keyboardType="numeric"
                placeholder="Amount (g)"
                style={[inputStyle, { marginTop: 6 }]}
              />

              <TouchableOpacity
                onPress={() => removeIngredient(index)}
                style={{
                  marginTop: 8,
                  backgroundColor: '#fee2e2',
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={16} color="#b91c1c" />
              </TouchableOpacity>
            </View>
          ))}

          {ingredients.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#6b7280', paddingVertical: 20 }}>
              No ingredients added yet
            </Text>
          )}
        </Section>

        {/* NUTRITION */}
        {ingredients.length > 0 && (
          <Section title="Nutrition Summary">
            <NutritionItem label="Calories" value={`${nutrition.calories} kcal`} />
            <NutritionItem label="Protein" value={`${nutrition.protein}g`} />
            <NutritionItem label="Carbs" value={`${nutrition.carbs}g`} />
            <NutritionItem label="Fats" value={`${nutrition.fats}g`} />
          </Section>
        )}

        {/* INSTRUCTIONS */}
        <Section title="Instructions">
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={6}
            placeholder="Step-by-step cooking instructions..."
            style={[inputStyle, { height: 140, textAlignVertical: 'top' }]}
          />
        </Section>

      </ScrollView>
    </View>
  );
}

function Section({ title, children, rightButtonLabel, rightButtonAction }: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>{title}</Text>

        {rightButtonLabel && (
          <TouchableOpacity
            onPress={rightButtonAction}
            style={{
              backgroundColor: '#00c056ff',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>{rightButtonLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );
}

function NutritionItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: '#10974dff' }}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: '600', color: '#98ccaeff' }}>{value}</Text>
    </View>
  );
}

const inputStyle = {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#111827'
};
