import React from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import type { Alimento } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface ProductDetailProps {
  alimento: Alimento;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ProductDetail({ alimento, onClose, isFavorite, onToggleFavorite }: ProductDetailProps) {
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
    <View style={styles.modalContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.modalContent}>
        <ScrollView style={styles.container} bounces={false}>
          <ThemedView style={styles.card}>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.actionButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onToggleFavorite} style={styles.actionButton}>
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#ff4444" : "#666"} 
                />
              </TouchableOpacity>
            </View>

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
            
            <View style={styles.header}>
              <ThemedText style={styles.title}>{alimento.nombre}</ThemedText>
              <ThemedText style={styles.barcode}>Código: {alimento.codigo}</ThemedText>
            </View>

            <View style={styles.nutritionSection}>
              <View style={styles.caloriesContainer}>
                <ThemedText style={styles.caloriesTitle}>Calorías</ThemedText>
                <ThemedText style={styles.caloriesValue}>{alimento.calorias}</ThemedText>
              </View>

              <View style={styles.nutrients}>
                {renderNutrient('Proteínas', alimento.proteinas)}
                {renderNutrient('Grasas', alimento.grasas)}
                {renderNutrient('Carbohidratos', alimento.carbohidratos)}
                {renderNutrient('Azúcares', alimento.azucares)}
                {renderNutrient('Fibra', alimento.fibra)}
                {renderNutrient('Sodio', alimento.sodio, 'mg')}
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: height * 0.1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  barcode: {
    fontSize: 14,
    opacity: 0.7,
  },
  nutritionSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  caloriesTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
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
