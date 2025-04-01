import React from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import type { Alimento } from '../lib/supabase';

interface ProductDetailProps {
  alimento: Alimento;
}

export function ProductDetail({ alimento }: ProductDetailProps) {
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
    <ScrollView style={styles.container}>
      <ThemedView style={styles.card}>
        {alimento.imagen_url && (
          <Image
            source={{ uri: alimento.imagen_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
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
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: width * 0.6,
  },
  header: {
    padding: 16,
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
