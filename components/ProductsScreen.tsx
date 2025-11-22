import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useApp } from './AppContext';
import { BottomNav } from './BottomNav';

export function ProductsScreen() {
  const { navigate, products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Protein', 'Grains', 'Vegetables', 'Fats', 'Dairy'];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>

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
            Products Base
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
            placeholder="Search products..."
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
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: active ? '#00c056ff' : '#f3f4f6',
                    marginRight: index !== categories.length - 1 ? 10 : 0
                  }}
                >
                  <Text
                    style={{
                      color: active ? 'white' : '#374151',
                      fontWeight: '600',
                      fontSize: 14,
                      lineHeight: 18,
                      includeFontPadding: false,
                      textAlignVertical: 'center'
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

      {/* PRODUCTS */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 100,
          gap: 12
        }}
      >
        <Text style={{ color: '#6b7280', marginBottom: 8 }}>
          {filteredProducts.length} products found
        </Text>

        {filteredProducts.map(product => (
          <View
            key={product.id}
            style={{
              backgroundColor: 'white',
              padding: 18,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10
              }}
            >
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                  {product.name}
                </Text>

                <View
                  style={{
                    marginTop: 6,
                    backgroundColor: '#dbeafe',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'flex-start'
                  }}
                >
                  <Text style={{ color: '#1d4ed8', fontWeight: '500' }}>
                    {product.category}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                  {product.calories}
                </Text>
                <Text style={{ color: '#6b7280' }}>kcal</Text>
              </View>
            </View>

            {/* NUTRITION */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderColor: '#e5e7eb',
                paddingTop: 12
              }}
            >
              <Nut label="Protein" value={`${product.protein}g`} />
              <Nut label="Carbs" value={`${product.carbs}g`} />
              <Nut label="Fats" value={`${product.fats}g`} />
            </View>
          </View>
        ))}

        {filteredProducts.length === 0 && (
          <Text style={{ textAlign: 'center', paddingVertical: 40, color: '#6b7280' }}>
            No products found
          </Text>
        )}
      </ScrollView>

      {/* NAVITEM */}
      <BottomNav active="main" />
    </View>
  );
}

function Nut({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={{ color: '#6b7280', fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '600', color: '#111827' }}>{value}</Text>
    </View>
  );
}
