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
      <LinearGradient
        colors={['#4CAF50', '#1B5E20']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>Mis Favoritos</ThemedText>
          <ThemedText style={styles.subtitle}>Lista de alimentos favoritos</ThemedText>
        </View>
      </LinearGradient>

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
    margin: 16,
    marginTop: 24,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
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
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  favoritesList: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});