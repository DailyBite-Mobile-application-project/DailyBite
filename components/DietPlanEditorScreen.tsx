import { useMemo, useState } from 'react';
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
  ImageStyle,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Save, Trash2, Copy, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from './AppContext';
import { useT } from './i18n';
import { useTheme } from './theme';

type DietCategory = 'Balanced' | 'Weight Loss' | 'Vegan' | 'Keto';

export function DietPlanEditorScreen() {
  const t = useT();
  const colors = useTheme();

  const styles = useMemo(() => makeStyles(colors), [colors]);

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
  const [category, setCategory] = useState<DietCategory>(
    (existingPlan?.category as DietCategory) ?? 'Balanced'
  );
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

  const categoryLabel = (cat: DietCategory) => {
    switch (cat) {
      case 'Balanced':
        return t('dietCat.balanced');
      case 'Weight Loss':
        return t('dietCat.weightLoss');
      case 'Vegan':
        return t('dietCat.vegan');
      case 'Keto':
        return t('dietCat.keto');
    }
  };

  const savePlan = () => {
    if (!name.trim()) {
      Alert.alert(
        t('planEditor.alert.missingName.title'),
        t('planEditor.alert.missingName.msg')
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        t('planEditor.alert.missingDesc.title'),
        t('planEditor.alert.missingDesc.msg')
      );
      return;
    }

    if (!durationDays.trim()) {
      Alert.alert(
        t('planEditor.alert.missingDuration.title'),
        t('planEditor.alert.missingDuration.msg')
      );
      return;
    }

    const daysNumber = Number(durationDays);
    if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 14) {
      Alert.alert(
        t('planEditor.alert.invalidDuration.title'),
        t('planEditor.alert.invalidDuration.msg')
      );
      return;
    }

    if (assignedDishes.length === 0) {
      Alert.alert(
        t('planEditor.alert.noDishes.title'),
        t('planEditor.alert.noDishes.msg')
      );
      return;
    }

    const newPlan = {
      id: existingPlan?.id ?? Date.now().toString(),
      name,
      description,
      duration: `${daysNumber} ${t('common.days')}`,
      category,
      image,
      dishIds: assignedDishes,
      calories: nutrition.calories
    };

    if (existingPlan) {
      setDietPlans(dietPlans.map(p => (p.id === existingPlan.id ? newPlan : p)));
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
      name: `${existingPlan.name} ${t('planEditor.copySuffix')}`
    };

    setDietPlans([...dietPlans, cloned]);
    navigate('diet-plans');
  };

  const deletePlan = () => {
    if (!existingPlan) return;

    Alert.alert(
      t('planEditor.alert.delete.title'),
      t('planEditor.alert.delete.msg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
      Alert.alert(
        t('planEditor.alert.permission.title'),
        t('planEditor.alert.permission.msg')
      );
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('diet-plans')} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {existingPlan ? t('planEditor.titleEdit') : t('planEditor.titleAdd')}
        </Text>

        <TouchableOpacity onPress={savePlan} style={styles.saveBtn}>
          <Save size={16} color="white" />
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* IMAGE SECTION */}
        <Text style={styles.label}>{t('planEditor.image')}</Text>

        {image ? (
          <View>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity onPress={removeImage} style={styles.removeImgBtn}>
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.addImgBtn}>
            <Camera size={22} color="white" />
            <Text style={styles.addImgText}>{t('planEditor.addImage')}</Text>
          </TouchableOpacity>
        )}

        {/* NAME */}
        <Text style={styles.label}>{t('planEditor.name')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('planEditor.namePh')}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        {/* DESCRIPTION */}
        <Text style={styles.label}>{t('planEditor.desc')}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('planEditor.descPh')}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        {/* DURATION */}
        <Text style={styles.label}>{t('planEditor.durationDays')}</Text>
        <TextInput
          value={durationDays}
          onChangeText={setDurationDays}
          keyboardType="numeric"
          placeholder={t('planEditor.durationPh')}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        {/* NUTRITION SUMMARY */}
        <Text style={styles.sectionTitle}>{t('planEditor.nutritionCalculated')}</Text>

        <Text style={styles.nutriText}>
          {t('planEditor.nut.calories')}: {nutrition.calories} {t('common.kcal')}
        </Text>
        <Text style={styles.nutriText}>
          {t('planEditor.nut.protein')}: {nutrition.protein} g
        </Text>
        <Text style={styles.nutriText}>
          {t('planEditor.nut.carbs')}: {nutrition.carbs} g
        </Text>
        <Text style={styles.nutriText}>
          {t('planEditor.nut.fats')}: {nutrition.fats} g
        </Text>

        {/* CATEGORY */}
        <Text style={styles.label}>{t('planEditor.category')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.catRow}>
            {(['Balanced', 'Weight Loss', 'Vegan', 'Keto'] as DietCategory[]).map(cat => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.catBtn, active ? styles.catBtnActive : styles.catBtnInactive]}
                >
                  <Text style={active ? styles.catTextActive : styles.catTextInactive}>
                    {categoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ASSIGN DISHES */}
        <Text style={styles.sectionTitle}>{t('planEditor.assignDishes')}</Text>

        {dishes.map(dish => {
          const active = assignedDishes.includes(dish.id);
          return (
            <TouchableOpacity
              key={dish.id}
              onPress={() => toggleDish(dish.id)}
              style={[styles.dishItem, active ? styles.dishItemActive : styles.dishItemInactive]}
            >
              <Text style={styles.dishText}>{dish.name}</Text>
            </TouchableOpacity>
          );
        })}

        {/* DUPLICATE */}
        {existingPlan && (
          <TouchableOpacity onPress={duplicatePlan} style={styles.duplicateBtn}>
            <Copy size={18} color="white" />
            <Text style={styles.duplicateBtnText}>{t('planEditor.duplicate')}</Text>
          </TouchableOpacity>
        )}

        {/* DELETE */}
        {existingPlan && (
          <TouchableOpacity onPress={deletePlan} style={styles.deleteBtn}>
            <Trash2 size={18} color="white" />
            <Text style={styles.deleteBtnText}>{t('planEditor.delete')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg
    } as ViewStyle,

    header: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    } as ViewStyle,

    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: colors.input,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
    } as ViewStyle,

    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text
    } as TextStyle,

    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center'
    } as ViewStyle,

    saveBtnText: {
      color: colors.primaryText ?? 'white',
      marginLeft: 6,
      fontWeight: '600'
    } as TextStyle,

    scrollContent: {
      padding: 20,
      paddingBottom: 80
    } as ViewStyle,

    label: {
      marginTop: 16,
      marginBottom: 4,
      color: colors.muted
    } as TextStyle,

    previewImage: {
      width: '100%',
      height: 160,
      borderRadius: 12,
      marginBottom: 6
    } as ImageStyle,

    removeImgBtn: {
      position: 'absolute',
      right: 10,
      top: 10,
      backgroundColor: '#ef4444',
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center'
    } as ViewStyle,

    addImgBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
      marginBottom: 6
    } as ViewStyle,

    addImgText: {
      color: 'white',
      fontWeight: '600',
      marginLeft: 6
    } as TextStyle,

    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 22,
      color: colors.text
    } as TextStyle,

    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text
    } as TextStyle,

    textArea: {
      height: 80,
      textAlignVertical: 'top'
    } as TextStyle,

    nutriText: {
      color: colors.primary,
      fontSize: 16,
      marginTop: 4
    } as TextStyle,

    catRow: {
      flexDirection: 'row',
      marginBottom: 12
    } as ViewStyle,

    catBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      marginRight: 10
    } as ViewStyle,

    catBtnActive: {
      backgroundColor: colors.primary
    } as ViewStyle,

    catBtnInactive: {
      backgroundColor: colors.input
    } as ViewStyle,

    catTextActive: {
      color: 'white',
      fontWeight: '600'
    } as TextStyle,

    catTextInactive: {
      color: colors.text,
      fontWeight: '600'
    } as TextStyle,

    dishItem: {
      padding: 12,
      borderRadius: 10,
      marginBottom: 8
    } as ViewStyle,

    dishItemActive: {
      backgroundColor: colors.input
    } as ViewStyle,

    dishItemInactive: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border
    } as ViewStyle,

    dishText: {
      fontWeight: '600',
      color: colors.text
    } as TextStyle,

    duplicateBtn: {
      backgroundColor: '#3b82f6',
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 26
    } as ViewStyle,

    duplicateBtnText: {
      color: 'white',
      fontWeight: '600',
      marginLeft: 8
    } as TextStyle,

    deleteBtn: {
      backgroundColor: '#ef4444',
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12
    } as ViewStyle,

    deleteBtnText: {
      color: 'white',
      fontWeight: '600',
      marginLeft: 8
    } as TextStyle
  };
}
