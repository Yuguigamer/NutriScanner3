import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import type { Alimento } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface ProductDetailCardProps {
  alimento: Alimento;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  expanded?: boolean;
  onPress?: () => void;
}

export function ProductDetailCard({ 
  alimento, 
  isFavorite, 
  onToggleFavorite,
  expanded = false,
  onPress
}: ProductDetailCardProps) {
  if (!alimento) return null;

  const renderNutrient = (label: string, value: number | undefined, unit: string = 'g') => {
    if (value === undefined) return null;
    return (
      <View style={styles.nutrientRow}>
        <ThemedText style={styles.nutrientLabel}>{label}</ThemedText>
        <ThemedText style={styles.nutrientValue}>
          {value} {unit}
        </ThemedText>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, expanded && styles.containerExpanded]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title} numberOfLines={expanded ? undefined : 1}>
              {alimento.nombre}
            </ThemedText>
            <View style={styles.mainNutrients}>
              <ThemedText style={styles.nutrientBadge}>🔥 {alimento.calorias} kcal</ThemedText>
              {alimento.proteinas && (
                <ThemedText style={styles.nutrientBadge}>🥩 {alimento.proteinas}g</ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={onToggleFavorite} 
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ff4444" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {expanded && (
          <>
            <View style={styles.imageContainer}>
              {alimento.imagen_url ? (
                <Image
                  source={{ uri: alimento.imagen_url }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noImage}>
                  <Ionicons name="image-outline" size={48} color="#666" />
                  <ThemedText style={styles.noImageText}>Sin imagen</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.details}>
              <ThemedText style={styles.barcode}>Código: {alimento.codigo}</ThemedText>
              
              <View style={styles.nutritionSection}>
                <View style={styles.nutrients}>
                  {renderNutrient('Carbohidratos', alimento.carbohidratos)}
                  {renderNutrient('Azúcares', alimento.azucares)}
                  {renderNutrient('Grasas', alimento.grasas)}
                  {renderNutrient('Fibra', alimento.fibra)}
                  {renderNutrient('Sodio', alimento.sodio, 'mg')}
                </View>
              </View>
            </View>
          </>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerExpanded: {
    margin: 0,
    flex: 1,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mainNutrients: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrientBadge: {
    fontSize: 14,
    opacity: 0.7,
  },
  favoriteButton: {
    padding: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#666',
  },
  details: {
    padding: 16,
  },
  barcode: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  nutritionSection: {
    gap: 16,
  },
  nutrients: {
    gap: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 16,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
