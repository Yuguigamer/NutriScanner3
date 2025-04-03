import { useState, useEffect } from "react"
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView } from "react-native"
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const STORAGE_KEY = "recent_searches"
const MAX_RECENT_SEARCHES = 10

export default function SearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem(STORAGE_KEY)
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches))
      }
    } catch (error) {
      console.error("Error loading search history:", error)
    }
  }

  const clearSearchHistory = async () => {
    Alert.alert("Borrar historial", "¿Estás seguro que deseas borrar todo el historial de búsquedas?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(STORAGE_KEY)
            setRecentSearches([])
          } catch (error) {
            console.error("Error clearing search history:", error)
          }
        },
      },
    ])
  }

  const removeSearchItem = async (index: number) => {
    try {
      const updatedSearches = [...recentSearches]
      updatedSearches.splice(index, 1)
      setRecentSearches(updatedSearches)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches))
    } catch (error) {
      console.error("Error removing search item:", error)
    }
  }

  const onSelectSearch = (search: string) => {
    router.push({
      pathname: '/(tabs)',
      params: { search }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#1B5E20']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>Historial de Búsquedas</ThemedText>
          {recentSearches.length > 0 && (
            <TouchableOpacity onPress={clearSearchHistory}>
              <ThemedText style={styles.clearText}>Limpiar Historial</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {recentSearches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#666" />
          <ThemedText style={styles.emptyText}>
            No hay búsquedas recientes
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.searchList}>
          {recentSearches.map((search, index) => (
            <View key={index} style={styles.searchItem}>
              <TouchableOpacity 
                style={styles.searchContent} 
                onPress={() => onSelectSearch(search)}
              >
                <Ionicons name="time-outline" size={24} color="#666" style={styles.searchIcon} />
                <ThemedText style={styles.searchText}>{search}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeSearchItem(index)}>
                <Ionicons name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  )
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
  clearText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  searchList: {
    padding: 16,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchText: {
    fontSize: 16,
  },
});