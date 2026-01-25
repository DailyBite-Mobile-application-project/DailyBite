import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft, Search, RefreshCcw } from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';
import { useT } from './i18n';
import { useTheme } from './theme';
import { fetchProducts, searchProducts, type Product as ApiProduct } from './api';

type ProductCategory = 'All' | 'Protein' | 'Grains' | 'Vegetables' | 'Fats' | 'Dairy';

export function ProductsScreen() {
  const { navigate, theme } = useApp();
  const t = useT();
  const colors = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories: ProductCategory[] = ['All', 'Protein', 'Grains', 'Vegetables', 'Fats', 'Dairy'];

  const categoryLabel = (cat: ProductCategory) => {
    switch (cat) {
      case 'All':
        return t('productCat.all');
      case 'Protein':
        return t('productCat.protein');
      case 'Grains':
        return t('productCat.grains');
      case 'Vegetables':
        return t('productCat.vegetables');
      case 'Fats':
        return t('productCat.fats');
      case 'Dairy':
        return t('productCat.dairy');
      default:
        return cat;
    }
  };

  const softBg = colors.input;

  const loadInitial = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await fetchProducts();
      setProducts(list);
    } catch (e: any) {
      setErrorMsg(e?.message || t('err.generic'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitial();
    
  }, []);

   const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);


  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 70 }}>
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
              backgroundColor: softBg,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text, flex: 1 }}>
            {t('products.title')}
          </Text>

          <TouchableOpacity
            onPress={loadInitial}
            style={{
              width: 40,
              height: 40,
              backgroundColor: softBg,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCcw size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={{ position: 'relative' }}>
          <Search size={18} color={colors.muted} style={{ position: 'absolute', left: 12, top: 16 }} />
          <TextInput
            placeholder={t('products.searchPlaceholder')}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {categories.map((category, index) => {
              const active = selectedCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: active ? colors.primary : softBg,
                    marginRight: index !== categories.length - 1 ? 10 : 0,
                    borderWidth: theme === 'dark' && !active ? 1 : 0,
                    borderColor: theme === 'dark' && !active ? colors.border : 'transparent'
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.primaryText : colors.text,
                      fontWeight: '600',
                      fontSize: 14,
                      lineHeight: 18,
                      includeFontPadding: false,
                      textAlignVertical: 'center'
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

      {/* BODY */}
      {loading && (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      )}

      {errorMsg && !loading && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: colors.muted, marginBottom: 10 }}>{errorMsg}</Text>
          <TouchableOpacity
            onPress={loadInitial}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              alignSelf: 'flex-start'
            }}
          >
            <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{t('common.ok')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !errorMsg && (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: 100,
            gap: 12
          }}
        >
          <Text style={{ color: colors.muted, marginBottom: 8 }}>
            {t('products.found', { count: filteredProducts.length })}
          </Text>

          {filteredProducts.map((product) => (
            <View
              key={product.id}
              style={{
                backgroundColor: colors.card,
                padding: 18,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: theme === 'dark' ? 0 : 0.08,
                shadowRadius: 6,
                borderWidth: theme === 'dark' ? 1 : 0,
                borderColor: theme === 'dark' ? colors.border : 'transparent'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ paddingRight: 10, flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                    {product.name}
                  </Text>

                  <View
                    style={{
                      marginTop: 6,
                      backgroundColor: theme === 'dark' ? 'rgba(0,192,86,0.16)' : '#d1fae5',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      alignSelf: 'flex-start',
                      borderWidth: theme === 'dark' ? 1 : 0,
                      borderColor: theme === 'dark' ? 'rgba(0,192,86,0.22)' : 'transparent'
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>
                      {categoryLabel((product.category as ProductCategory) ?? 'All')}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                    {product.calories}
                  </Text>
                  <Text style={{ color: colors.muted }}>{t('products.kcal')}</Text>
                </View>
              </View>

              {/* NUTRITION */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderTopWidth: 1,
                  borderColor: colors.border,
                  paddingTop: 12
                }}
              >
                <Nut label={t('macro.protein')} value={`${product.protein}g`} colors={colors} />
                <Nut label={t('macro.carbs')} value={`${product.carbs}g`} colors={colors} />
                {/* API ma fat, więc tu używamy product.fat */}
                <Nut label={t('macro.fats')} value={`${product.fat}g`} colors={colors} />
              </View>
            </View>
          ))}

          {filteredProducts.length === 0 && (
            <Text style={{ textAlign: 'center', paddingVertical: 40, color: colors.muted }}>
              {t('products.noneFound')}
            </Text>
          )}
        </ScrollView>
      )}

      <BottomNav active="products" />
    </View>
  );
}

function Nut({
  label,
  value,
  colors
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '600', color: colors.text }}>{value}</Text>
    </View>
  );
}
