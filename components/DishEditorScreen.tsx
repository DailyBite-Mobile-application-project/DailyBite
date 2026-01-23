import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { ArrowLeft, Plus, Trash2, Save, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from './AppContext';
import { useT } from './i18n';
import { useTheme } from './theme';

export function DishEditorScreen() {
  const { navigate, selectedDishId, dishes, setDishes, products } = useApp();
  const t = useT();
  const colors = useTheme();

  const existingDish = selectedDishId ? dishes.find(d => d.id === selectedDishId) : null;

  const [dishName, setDishName] = useState(existingDish?.name ?? '');
  const [instructions, setInstructions] = useState(existingDish?.instructions ?? '');
  const [prepTime, setPrepTime] = useState<number>(existingDish?.prepTime ?? 30);
  const [ingredients, setIngredients] = useState<{ productId: string; amount: number }[]>(
    existingDish?.products ?? []
  );
  const [imageUri, setImageUri] = useState<string | null>(existingDish?.image ?? null);

  const nutrition = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;

    ingredients.forEach(sp => {
      const product = products.find(p => p.id === sp.productId);
      if (!product) return;

      const m = sp.amount / 100;
      calories += product.calories * m;
      protein += product.protein * m;
      carbs += product.carbs * m;
      fats += product.fats * m;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  }, [ingredients, products]);

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('dishEditor.alert.permission.title'), t('dishEditor.alert.permission.msg'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const addIngredient = () => {
    if (products.length === 0) return;
    setIngredients(prev => [...prev, { productId: products[0].id, amount: 100 }]);
  };

  const updateIngredient = (index: number, field: 'productId' | 'amount', value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const saveDish = () => {
    if (!dishName.trim()) {
      Alert.alert(t('dishEditor.alert.missingName.title'), t('dishEditor.alert.missingName.msg'));
      return;
    }

    const newDish = {
      id: existingDish?.id ?? Date.now().toString(),
      name: dishName.trim(),
      products: ingredients,
      instructions,
      prepTime,
      image: imageUri ?? null
    };

    if (existingDish) {
      setDishes(dishes.map(d => (d.id === existingDish.id ? newDish : d)));
    } else {
      setDishes([...dishes, newDish]);
    }

    navigate('main');
  };

  const openImageSourceDialog = () => {
    Alert.alert(
      t('dishEditor.imageSource.title'),
      t('dishEditor.imageSource.msg'),
      [
        { text: t('dishEditor.imageSource.camera'), onPress: pickImageFromCamera },
        { text: t('dishEditor.imageSource.gallery'), onPress: pickImageFromGallery },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const inputStyle = {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderColor: colors.border,
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
            backgroundColor: colors.input,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
          {existingDish ? t('dishEditor.titleEdit') : t('dishEditor.titleAdd')}
        </Text>

        <TouchableOpacity
          onPress={saveDish}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Save size={16} color="white" />
          <Text style={{ color: 'white', marginLeft: 6, fontWeight: '600' }}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* IMAGE */}
        <Section
          title={t('dishEditor.section.image')}
          colors={colors}
          rightButtonLabel={undefined}
          rightButtonAction={undefined}
        >
          <TouchableOpacity
            onPress={openImageSourceDialog}
            style={{
              backgroundColor: colors.input,
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}
          >
            <Camera size={20} color={colors.primary} />
            <Text style={{ marginLeft: 8, color: colors.primary, fontWeight: '600' }}>
              {imageUri ? t('dishEditor.changeImage') : t('dishEditor.addImage')}
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

        {/* BASIC */}
        <Section title={t('dishEditor.section.basic')} colors={colors}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>{t('dishEditor.nameLabel')}</Text>
          <TextInput
            value={dishName}
            onChangeText={setDishName}
            placeholder={t('dishEditor.namePh')}
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />

          <Text style={{ color: colors.muted, marginTop: 16, marginBottom: 6 }}>
            {t('dishEditor.prepTimeLabel')}
          </Text>
          <TextInput
            value={String(prepTime)}
            onChangeText={(v) => setPrepTime(Number(v))}
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />
        </Section>

        {/* INGREDIENTS */}
        <Section
          title={t('dishEditor.section.ingredients')}
          colors={colors}
          rightButtonLabel={t('common.add')}
          rightButtonAction={addIngredient}
        >
          {ingredients.map((ing, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.input,
                padding: 12,
                borderRadius: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.muted, marginBottom: 6 }}>
                {t('dishEditor.ingredient.product')}
              </Text>

              <View
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  overflow: 'hidden'
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
              </View>

              <Text style={{ color: colors.muted, marginTop: 10, marginBottom: 6 }}>
                {t('dishEditor.ingredient.amount')}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  value={String(ing.amount)}
                  onChangeText={(v) => updateIngredient(index, 'amount', Number(v))}
                  keyboardType="numeric"
                  placeholderTextColor={colors.muted}
                  style={[inputStyle, { flex: 1 }]}
                />

                <TouchableOpacity
                  onPress={() => removeIngredient(index)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#fee2e2',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={18} color="#b91c1c" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {ingredients.length === 0 && (
            <Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 10 }}>
              {t('dishEditor.noIngredients')}
            </Text>
          )}
        </Section>

        {/* INSTRUCTIONS */}
        <Section title={t('dishEditor.section.instructions')} colors={colors}>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t('dishEditor.instructionsPh')}
            placeholderTextColor={colors.muted}
            multiline
            style={[inputStyle, { height: 110, textAlignVertical: 'top' }]}
          />
        </Section>

        {/* NUTRITION (read-only) */}
        <Section title={t('dishEditor.section.nutrition')} colors={colors}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>
            {t('dishEditor.nut.calories')}: {nutrition.calories} {t('common.kcal')}
          </Text>
          <Text style={{ color: colors.primary, fontSize: 16, marginTop: 4 }}>
            {t('macro.protein')}: {nutrition.protein} g
          </Text>
          <Text style={{ color: colors.primary, fontSize: 16, marginTop: 4 }}>
            {t('macro.carbs')}: {nutrition.carbs} g
          </Text>
          <Text style={{ color: colors.primary, fontSize: 16, marginTop: 4 }}>
            {t('macro.fats')}: {nutrition.fats} g
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  rightButtonLabel,
  rightButtonAction,
  colors
}: {
  title: string;
  children: any;
  rightButtonLabel?: string;
  rightButtonAction?: () => void;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{title}</Text>

        {rightButtonLabel && rightButtonAction && (
          <TouchableOpacity
            onPress={rightButtonAction}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Plus size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: 6, fontWeight: '600' }}>
              {rightButtonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );
}
