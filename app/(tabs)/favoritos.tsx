import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alimento } from '@/lib/supabase';
import { ProductDetailCard } from '@/components/ProductDetailCard';
import { useFocusEffect } from '@react-navigation/native';

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

  // Usar useFocusEffect para recargar favoritos cada vez que la pantalla obtiene el foco
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
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Mis Favoritos</ThemedText>
        
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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  favoritesList: {
    paddingBottom: 16,
  },
});
