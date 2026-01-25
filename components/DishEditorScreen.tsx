import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from './AppContext';
import { useT } from './i18n';
import { useTheme } from './theme';
import { createDish, updateDish } from './api';

type Ingredient = { productId: string; amount: number };
type Nutrition = { calories: number; protein: number; carbs: number; fats: number };

export function DishEditorScreen() {
  const { navigate, selectedDishId, dishes, setDishes, products, accessToken, loadProducts, loadDishes } = useApp();
  const t = useT();
  const colors = useTheme();

  const existingDish = selectedDishId ? dishes.find(d => d.id === selectedDishId) : null;

  const [dishName, setDishName] = useState(existingDish?.name ?? '');
  const [instructions, setInstructions] = useState(existingDish?.instructions ?? '');
  const [prepTime, setPrepTime] = useState<number>(existingDish?.prepTime ?? 30);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    existingDish?.products ?? []
  );

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  useEffect(() => {
    if (products.length === 0) {
      void loadProducts();
    }
  }, [products.length]);

  // Derived from ingredient grams to keep UI responsive without extra API calls.
  const nutrition = useMemo<Nutrition>(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;

    for (const sp of ingredients) {
      const product = productById.get(sp.productId);
      if (!product) continue;

      const amount = Number(sp.amount);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      const m = amount / 100;
      calories += product.calories * m;
      protein += product.protein * m;
      carbs += product.carbs * m;
      const fatsValue = Number((product as any).fats ?? (product as any).fat ?? 0);
      fats += fatsValue * m;
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  }, [ingredients, productById]);

  const addIngredient = () => {
    if (products.length === 0) {
      Alert.alert(t('common.error'), t('dishEditor.noProducts'));
      return;
    }

    setIngredients(prev => [...prev, { productId: products[0].id, amount: 100 }]);
  };

  const updateIngredient = (index: number, field: 'productId' | 'amount', value: any) => {
    setIngredients(prev => {
      const updated = [...prev];

      if (!updated[index]) return prev;

      if (field === 'amount') {
        const n = Number(String(value).replace(/[^\d.]/g, ''));
        updated[index] = { ...updated[index], amount: Number.isFinite(n) ? n : 0 };
      } else {
        updated[index] = { ...updated[index], productId: String(value) };
      }

      return updated;
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const saveDish = async () => {
    if (!dishName.trim()) {
      Alert.alert(t('dishEditor.alert.missingName.title'), t('dishEditor.alert.missingName.msg'));
      return;
    }

    const prep = Number(prepTime);
    if (!Number.isFinite(prep) || prep <= 0) {
      Alert.alert(t('dishEditor.alert.invalidPrepTime.title'), t('dishEditor.alert.invalidPrepTime.msg'));
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert(t('dishEditor.alert.noIngredients.title'), t('dishEditor.alert.noIngredients.msg'));
      return;
    }

    for (const ing of ingredients) {
      if (!ing.productId) {
        Alert.alert(t('dishEditor.alert.invalidIngredient.title'), t('dishEditor.alert.invalidIngredient.msg'));
        return;
      }
      if (!Number.isFinite(ing.amount) || ing.amount <= 0) {
        Alert.alert(t('dishEditor.alert.invalidIngredientAmount.title'), t('dishEditor.alert.invalidIngredientAmount.msg'));
        return;
      }
    }

    if (!instructions.trim()) {
      Alert.alert(t('dishEditor.alert.missingInstructions.title'), t('dishEditor.alert.missingInstructions.msg'));
      return;
    }

    const newDish: any = {
      id: existingDish?.id ?? Date.now().toString(),
      name: dishName.trim(),
      products: ingredients.map(i => ({ productId: i.productId, amount: Number(i.amount) })),
      instructions: instructions.trim(),
      prepTime: prep,
      image: existingDish?.image ?? null,
      nutritionTotal: nutrition
    };

    // lokalny zapis (UI natychmiast)
    if (existingDish) {
      setDishes(dishes.map(d => (d.id === existingDish.id ? newDish : d)));
    } else {
      setDishes([...dishes, newDish]);
    }

    // backend zapis (jeśli zalogowany)
    if (accessToken) {
      try {
        const payload = {
          name: dishName.trim(),
          prepTimeMinutes: prep,
          instructions: instructions.trim(),
          ingredients: ingredients.map(i => ({ productId: i.productId, grams: Number(i.amount) })),
          nutritionTotal: {
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fats
          }
        };

        if (existingDish?.id) {
          await updateDish(existingDish.id, payload as any, accessToken);
        } else {
          await createDish(payload as any, accessToken);
        }
        await loadDishes();
      } catch (e: any) {
        Alert.alert(t('common.error'), e?.message ?? t('err.generic'));
      }
    }

    navigate('main');
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
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

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
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
            onChangeText={(v) => {
              const n = Number(String(v).replace(/[^\d]/g, ''));
              setPrepTime(Number.isFinite(n) ? n : 0);
            }}
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />
        </Section>

        <Section
          title={t('dishEditor.section.ingredients')}
          colors={colors}
          rightButtonLabel={t('common.add')}
          rightButtonAction={addIngredient}
        >
          {products.length === 0 && (
            <Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 10 }}>
              {t('dishEditor.noProducts')}
            </Text>
          )}

          {ingredients.map((ing, index) => (
            <View
              key={`${ing.productId}-${index}`}
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
                  enabled={products.length > 0}
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
                  onChangeText={(v) => updateIngredient(index, 'amount', v)}
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
    </KeyboardAvoidingView>
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
