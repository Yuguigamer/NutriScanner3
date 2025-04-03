import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase, foodDB } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FormData {
  nombre: string;
  marca: string;
  calorias: string;
  proteinas: string;
  carbohidratos: string;
  grasas: string;
  codigo: string;
}

export default function AgregarAlimentoScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    marca: '',
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: '',
    codigo: barcode || '',
  });

  const handleSave = async () => {
    // Validar campos requeridos
    if (!formData.nombre.trim() || !formData.codigo) {
      Alert.alert('Error', 'El nombre y código de barras son obligatorios');
      return;
    }

    // Validar que los valores numéricos sean válidos
    const numericFields = ['calorias', 'proteinas', 'carbohidratos', 'grasas'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof FormData]);
      if (isNaN(value) || value < 0) {
        Alert.alert('Error', `El valor de ${field} debe ser un número válido mayor o igual a 0`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const newAlimento = {
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        codigo: formData.codigo,
        calorias: parseFloat(formData.calorias) || 0,
        proteinas: parseFloat(formData.proteinas) || 0,
        carbohidratos: parseFloat(formData.carbohidratos) || 0,
        grasas: parseFloat(formData.grasas) || 0,
      };

      const result = await foodDB.addFood(newAlimento);
      if (!result) throw new Error('No se pudo guardar el alimento');

      Alert.alert(
        'Éxito',
        'Alimento agregado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving alimento:', error);
      Alert.alert('Error', 'No se pudo guardar el alimento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Agregar Alimento</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nombre *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
              placeholder="Nombre del producto"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Marca</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.marca}
              onChangeText={(text) => setFormData(prev => ({ ...prev, marca: text }))}
              placeholder="Marca del producto"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Código de Barras *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.codigo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, codigo: text }))}
              placeholder="Código de barras"
              placeholderTextColor="#999"
              editable={!barcode}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Calorías</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.calorias}
                onChangeText={(text) => setFormData(prev => ({ ...prev, calorias: text }))}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Proteínas (g)</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.proteinas}
                onChangeText={(text) => setFormData(prev => ({ ...prev, proteinas: text }))}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Carbohidratos (g)</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.carbohidratos}
                onChangeText={(text) => setFormData(prev => ({ ...prev, carbohidratos: text }))}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Grasas (g)</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.grasas}
                onChangeText={(text) => setFormData(prev => ({ ...prev, grasas: text }))}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <ThemedText style={styles.saveButtonText}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </ThemedText>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
