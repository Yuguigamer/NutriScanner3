import { StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useState } from "react"
import type { Alimento } from "@/lib/supabase"
import { foodDB } from "@/lib/supabase"
import { LinearGradient } from 'expo-linear-gradient';

export default function FoodComparison() {
  const [selectedFoods, setSelectedFoods] = useState<Alimento[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Alimento[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await foodDB.searchFoods(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching foods:", error)
      Alert.alert("Error", "No se pudieron cargar los resultados")
    } finally {
      setIsSearching(false)
    }
  }

  const addFoodToComparison = (food: Alimento) => {
    if (selectedFoods.length >= 3) {
      Alert.alert(
        "Límite alcanzado",
        "Solo puedes comparar hasta 3 alimentos a la vez. Elimina uno para agregar otro.",
        [{ text: "OK" }],
      )
      return
    }

    if (selectedFoods.some((item) => item.id === food.id)) {
      Alert.alert("Alimento duplicado", "Este alimento ya está en la comparación")
      return
    }

    setSelectedFoods([...selectedFoods, food])
    setIsSelecting(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const removeFoodFromComparison = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((food) => food.id !== foodId))
  }

  const clearComparison = () => {
    if (selectedFoods.length === 0) return

    Alert.alert("Limpiar comparación", "¿Estás seguro que deseas eliminar todos los alimentos de la comparación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpiar",
        style: "destructive",
        onPress: () => setSelectedFoods([]),
      },
    ])
  }

  // Render a nutrient comparison row
  const renderNutrientRow = (label: string, nutrientKey: keyof Alimento, unit = "") => {
    return (
      <ThemedView style={styles.nutrientRow}>
        <ThemedText style={styles.nutrientLabel}>{label}</ThemedText>
        <ThemedView style={styles.nutrientValues}>
          {selectedFoods.map((food, index) => (
            <ThemedText
              key={index}
              style={[styles.nutrientValue, getBestValueStyle(nutrientKey, food[nutrientKey] as number)]}
            >
              {food[nutrientKey]} {unit}
            </ThemedText>
          ))}
        </ThemedView>
      </ThemedView>
    )
  }

  // Helper to highlight the best value (lowest for calories, highest for protein, etc.)
  const getBestValueStyle = (nutrientKey: keyof Alimento, value: number) => {
    if (selectedFoods.length < 2) return {}

    // For these nutrients, lower is better
    const lowerIsBetter = ["calorias", "grasas", "grasas_saturadas", "azucares", "sodio"]

    // For these nutrients, higher is better
    const higherIsBetter = ["proteinas", "fibra", "vitamina_a", "vitamina_c", "calcio", "hierro"]

    if (lowerIsBetter.includes(nutrientKey as string)) {
      const lowestValue = Math.min(...selectedFoods.map((food) => food[nutrientKey] as number))
      return value === lowestValue ? styles.bestValueLow : {}
    }

    if (higherIsBetter.includes(nutrientKey as string)) {
      const highestValue = Math.max(...selectedFoods.map((food) => food[nutrientKey] as number))
      return value === highestValue ? styles.bestValueHigh : {}
    }

    return {}
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#1B5E20']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>Comparar Alimentos</ThemedText>
          {selectedFoods.length > 0 && (
            <TouchableOpacity onPress={clearComparison}>
              <ThemedText style={styles.clearText}>Limpiar</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Selected foods for comparison */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedFoodsContainer}>
        {selectedFoods.map((food, index) => (
          <ThemedView key={index} style={styles.selectedFoodItem}>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeFoodFromComparison(food.id)}>
              <Ionicons name="close-circle" size={20} color="#FF5252" />
            </TouchableOpacity>
            <ThemedText style={styles.selectedFoodName}>{food.nombre}</ThemedText>
          </ThemedView>
        ))}

        {selectedFoods.length < 3 && (
          <TouchableOpacity style={styles.addFoodButton} onPress={() => setIsSelecting(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
            <ThemedText style={styles.addFoodText}>Agregar</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Food selection modal */}
      {isSelecting && (
        <ThemedView style={styles.selectionContainer}>
          <ThemedView style={styles.selectionHeader}>
            <ThemedText type="subtitle">Seleccionar alimento</ThemedText>
            <TouchableOpacity onPress={() => setIsSelecting(false)}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#757575" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimento..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text)
                if (text.trim().length > 0) {
                  handleSearch(text)
                } else {
                  setSearchResults([])
                }
              }}
              placeholderTextColor="#757575"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("")
                  setSearchResults([])
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color="#757575" />
              </TouchableOpacity>
            )}
          </ThemedView>

          {isSearching ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </ThemedView>
          ) : searchResults.length > 0 ? (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.searchResultItem}
                  onPress={() => addFoodToComparison(food)}
                >
                  <ThemedText>{food.nombre}</ThemedText>
                  <ThemedText style={styles.caloriesText}>{food.calorias} kcal</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : searchQuery ? (
            <ThemedView style={styles.noResults}>
              <ThemedText>No se encontraron resultados</ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>
      )}

      {/* Comparison table */}
      {selectedFoods.length > 0 ? (
        <ScrollView style={styles.comparisonContainer}>
          <ThemedView style={styles.comparisonTable}>
            <ThemedView style={styles.tableHeader}>
              <ThemedText style={styles.nutrientLabel}>Nutriente</ThemedText>
              <ThemedView style={styles.nutrientValues}>
                {selectedFoods.map((food, index) => (
                  <ThemedText key={index} style={styles.foodHeaderName}>
                    {food.nombre.length > 10 ? `${food.nombre.substring(0, 10)}...` : food.nombre}
                  </ThemedText>
                ))}
              </ThemedView>
            </ThemedView>

            {renderNutrientRow("Calorías", "calorias", "kcal")}
            {renderNutrientRow("Proteínas", "proteinas", "g")}
            {renderNutrientRow("Grasas", "grasas", "g")}
            {renderNutrientRow("Carbohidratos", "carbohidratos", "g")}
            {renderNutrientRow("Fibra", "fibra", "g")}
            {renderNutrientRow("Azúcares", "azucares", "g")}
            {renderNutrientRow("Sodio", "sodio", "mg")}
          </ThemedView>
        </ScrollView>
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="nutrition-outline" size={48} color="#BDBDBD" />
          <ThemedText style={styles.emptyText}>
            Selecciona hasta 3 alimentos para comparar sus valores nutricionales
          </ThemedText>
        </ThemedView>
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
  selectedFoodsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  selectedFoodItem: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: "center",
    position: "relative",
  },
  selectedFoodName: {
    textAlign: "center",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 10,
  },
  addFoodButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  addFoodText: {
    color: "#4CAF50",
    marginTop: 4,
  },
  selectionContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginLeft: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#000000",
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  caloriesText: {
    color: "#757575",
  },
  noResults: {
    padding: 16,
    alignItems: "center",
  },
  comparisonContainer: {
    flex: 1,
  },
  comparisonTable: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 8,
    marginBottom: 8,
  },
  nutrientRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  nutrientLabel: {
    flex: 1,
    fontWeight: "500",
  },
  nutrientValues: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutrientValue: {
    flex: 1,
    textAlign: "center",
  },
  foodHeaderName: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  bestValueLow: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  bestValueHigh: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    color: "#757575",
    textAlign: "center",
  },
})
