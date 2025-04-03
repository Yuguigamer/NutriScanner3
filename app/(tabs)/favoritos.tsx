import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alimento } from '@/lib/supabase';
import { ProductDetailCard } from '@/components/ProductDetailCard';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface FavoriteItem extends Alimento {}

export default function FavoritosScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const toggleFavorite = async (alimento: FavoriteItem) => {
    try {
      const newFavorites = favorites.filter(fav => fav.id !== alimento.id);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Mis Favoritos</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Tus alimentos guardados
            </ThemedText>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView}>
        {favorites.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#666" />
            <ThemedText style={styles.emptyStateText}>
              No tienes alimentos favoritos
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.favoritesList}>
            {favorites.map((item) => (
              <ProductDetailCard
                key={item.id}
                alimento={item}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(item)}
                expanded={selectedAlimento?.id === item.id}
                onPress={() => setSelectedAlimento(selectedAlimento?.id === item.id ? null : item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  favoritesList: {
    padding: 16,
    gap: 8,
  },
});
