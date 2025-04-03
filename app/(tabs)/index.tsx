import { Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ProductDetailCard } from '@/components/ProductDetailCard';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alimento } from '@/lib/supabase';
import { foodDB } from '@/lib/supabase';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function TabOneScreen() {
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedAlimento, setScannedAlimento] = useState<Alimento | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [favorites, setFavorites] = useState<Alimento[]>([]);

  // Cargar datos guardados cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      loadFavorites();
    }, [])
  );

  const loadRecentSearches = useCallback(async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem('favorites');
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const addToRecentSearches = async (query: string) => {
    try {
      const newSearches = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 5);
      
      setRecentSearches(newSearches);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(newSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const toggleFavorite = async (alimento: Alimento) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === alimento.id);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav.id !== alimento.id);
      } else {
        newFavorites = [...favorites, alimento];
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (alimento: Alimento) => {
    return favorites.some(fav => fav.id === alimento.id);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 2) return;

    setIsSearching(true);
    try {
      const results = await foodDB.searchFoods(query);
      setSearchResults(results);
      addToRecentSearches(query);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'No se pudieron cargar los resultados');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBarcodeScan = async (alimento: Alimento | null, barcode: string) => {
    setIsScannerVisible(false);
    
    if (alimento) {
      setSelectedAlimento(alimento);
    } else {
      router.push({
        pathname: "/agregar-alimento",
        params: { barcode }
      });
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#4CAF50', dark: '#1B5E20' }}
        headerImage={
          <View style={styles.headerImageContainer}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.headerGradient}
            >
              <View style={styles.headerOverlay}>
                <ThemedText type="title" style={styles.headerTitle}>NutriScan</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  Escanea y descubre la información nutricional
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        }
      >
        <View style={styles.content}>
          {/* Barra de búsqueda */}
          <ThemedView style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => setIsScannerVisible(true)}
            >
              <Ionicons name="barcode-outline" size={24} color="#666" />
            </TouchableOpacity>
          </ThemedView>

          {/* Búsquedas recientes */}
          {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
            <ThemedView style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Búsquedas recientes</ThemedText>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <ThemedText style={styles.clearButton}>Limpiar</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal style={styles.recentSearches}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <ThemedText>{search}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          {/* Resultados de búsqueda */}
          {isSearching ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </ThemedView>
          ) : searchResults.length > 0 ? (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Resultados</ThemedText>
              <ScrollView style={styles.searchResults}>
                {searchResults.map((item) => (
                  <ProductDetailCard
                    key={item.id}
                    alimento={item}
                    isFavorite={isFavorite(item)}
                    onToggleFavorite={() => toggleFavorite(item)}
                    expanded={selectedAlimento?.id === item.id}
                    onPress={() => setSelectedAlimento(selectedAlimento?.id === item.id ? null : item)}
                  />
                ))}
              </ScrollView>
            </ThemedView>
          ) : searchQuery.trim().length > 0 && (
            <ThemedView style={[styles.section, styles.noResults]}>
              <Ionicons name="search" size={48} color="#666" />
              <ThemedText style={styles.noResultsText}>
                No se encontraron resultados
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ParallaxScrollView>

      {/* Modal del scanner */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isScannerVisible}
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
  },
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  scanButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    color: '#666',
    fontSize: 14,
  },
  recentSearches: {
    flexGrow: 0,
  },
  recentSearchItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  searchResults: {
    marginTop: 8,
  },
  searchResultItem: {
    marginBottom: 8,
  },
  searchResultContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  searchResultMain: {
    flex: 1,
    paddingRight: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
