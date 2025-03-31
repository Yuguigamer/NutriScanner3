import { Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alimento } from '@/lib/supabase';
import { foodDB } from '@/lib/supabase';

interface FavoriteItem {
  id: string;
  nombre: string;
  calorias: number;
}

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites'
};

const MAX_RECENT_SEARCHES = 5;

export default function TabOneScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedAlimento, setScannedAlimento] = useState<Alimento | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedSearches, savedFavorites] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES)
      ]);

      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const addToRecentSearches = async (query: string) => {
    try {
      const updatedSearches = [query, ...recentSearches.filter(item => item !== query)]
        .slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const toggleFavorite = async (alimento: Alimento) => {
    try {
      const isFavorite = favorites.some(item => item.id === alimento.id);
      let updatedFavorites: FavoriteItem[];

      if (isFavorite) {
        updatedFavorites = favorites.filter(item => item.id !== alimento.id);
      } else {
        const newFavorite: FavoriteItem = {
          id: alimento.id,
          nombre: alimento.nombre,
          calorias: alimento.calorias
        };
        updatedFavorites = [...favorites, newFavorite];
      }

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

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

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBarcodeScan = async (alimento: Alimento | null, barcode: string) => {
    setIsScannerVisible(false);
    
    if (alimento) {
      setScannedAlimento(alimento);
      handleSearch(alimento.nombre);
    } else {
      Alert.alert(
        'Alimento no encontrado',
        '¿Deseas agregar este producto a la base de datos?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Sí',
            onPress: () => {
              console.log('Navegar a agregar alimento con código:', barcode);
            }
          }
        ]
      );
    }
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
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.searchResultItem}
                    onPress={() => setScannedAlimento(item)}
                  >
                    <ThemedView style={styles.searchResultContent}>
                      <ThemedView style={styles.searchResultMain}>
                        <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
                        <ThemedText>{item.calorias} kcal</ThemedText>
                      </ThemedView>
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(item)}
                        style={styles.favoriteButton}
                      >
                        <Ionicons 
                          name={favorites.some(fav => fav.id === item.id) ? "heart" : "heart-outline"} 
                          size={24} 
                          color="#FF4081" 
                        />
                      </TouchableOpacity>
                    </ThemedView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          ) : searchQuery.trim().length > 0 && (
            <ThemedView style={[styles.section, styles.noResults]}>
              <ThemedText>No se encontraron resultados</ThemedText>
            </ThemedView>
          )}

          {/* Búsquedas recientes (solo mostrar si no hay búsqueda activa) */}
          {searchQuery.trim().length === 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Búsquedas Recientes</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentSearches}>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.recentItem}
                    onPress={() => handleSearch(item)}
                  >
                    <ThemedText>{item}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          {/* Favoritos */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Mis Favoritos</ThemedText>
            {favorites.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.favoriteItem}
                onPress={() => handleSearch(item.nombre)}
              >
                <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
                <ThemedText>{item.calorias} kcal</ThemedText>
                <TouchableOpacity 
                  onPress={() => toggleFavorite(item as Alimento)}
                  style={styles.favoriteButton}
                >
                  <Ionicons name="heart" size={24} color="#FF4081" />
                </TouchableOpacity>
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
    height: 40,
    marginRight: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  scanButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
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
  scannedFoodContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  nutrientItem: {
    width: '50%',
    padding: 8,
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchResultMain: {
    flex: 1,
    marginRight: 16,
  },
  noResults: {
    alignItems: 'center',
    padding: 20,
  },
});
