import { Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useState } from 'react';

export default function TabOneScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  
  const recentSearches = [
    'Manzana',
    'Yogurt Natural',
    'Pan Integral'
  ];

  const favoriteItems = [
    { name: 'Avena', calories: '389 kcal/100g' },
    { name: 'Plátano', calories: '89 kcal/100g' },
    { name: 'Almendras', calories: '579 kcal/100g' }
  ];

  const handleBarcodeScan = (data: string) => {
    setSearchQuery(data);
    setIsScannerVisible(false);
    // Aquí se implementará la búsqueda por código de barras
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#4CAF50', dark: '#1B5E20' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.logo}
          />
        }>
        <ThemedView style={styles.container}>
          {/* Barra de búsqueda */}
          <ThemedView style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimento..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => setIsScannerVisible(true)}
            >
              <Ionicons name="barcode-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </ThemedView>

          {/* Búsquedas recientes */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Búsquedas Recientes</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentSearches}>
              {recentSearches.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.recentItem}
                  onPress={() => setSearchQuery(item)}
                >
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          {/* Favoritos */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Mis Favoritos</ThemedText>
            {favoriteItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.favoriteItem}
                onPress={() => setSearchQuery(item.name)}
              >
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText>{item.calories}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>

      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScannerVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
  },
  scanButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  recentSearches: {
    marginTop: 8,
  },
  recentItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
