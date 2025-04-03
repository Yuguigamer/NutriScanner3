import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ScrollView, Image, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase, foodDB, createAlimentosBucket } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Function to convert base64 to Uint8Array for Supabase upload
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

interface FormData {
  nombre: string;
  marca: string;
  calorias: string;
  proteinas: string;
  carbohidratos: string;
  grasas: string;
  codigo: string;
  azucares: string;
  fibra: string;
  sodio: string;
}

export default function AgregarAlimentoScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    marca: '',
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: '',
    codigo: barcode || '',
    azucares: '',
    fibra: '',
    sodio: '',
  });

  useEffect(() => {
    // Intentar crear el bucket al montar el componente
    createAlimentosBucket().catch(console.error);
  }, []);

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // Verificar si el usuario está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Debes iniciar sesión para subir imágenes');
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `${Date.now()}-${session.user.id}.jpg`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('alimentos')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('alimentos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'No se pudo subir la imagen. Por favor, intenta de nuevo.');
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleSave = async () => {
    // Validar campos requeridos
    if (!formData.nombre.trim() || !formData.codigo) {
      Alert.alert('Error', 'El nombre y código de barras son obligatorios');
      return;
    }

    // Validar que los valores numéricos sean válidos
    const numericFields = ['calorias', 'proteinas', 'carbohidratos', 'grasas', 'azucares', 'fibra', 'sodio'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof FormData]);
      if (isNaN(value) || value < 0) {
        Alert.alert('Error', `El valor de ${field} debe ser un número válido mayor o igual a 0`);
        return;
      }
    }

    setIsSaving(true);
    try {
      let imagen_url: string | undefined;
      
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          imagen_url = uploadedUrl;
        }
      }

      const newAlimento = {
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        codigo: formData.codigo,
        calorias: parseFloat(formData.calorias) || 0,
        proteinas: parseFloat(formData.proteinas) || 0,
        carbohidratos: parseFloat(formData.carbohidratos) || 0,
        grasas: parseFloat(formData.grasas) || 0,
        azucares: parseFloat(formData.azucares) || 0,
        fibra: parseFloat(formData.fibra) || 0,
        sodio: parseFloat(formData.sodio) || 0,
        imagen_url,
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
          <View style={styles.imagePickerContainer}>
            {selectedImage ? (
              <>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageButtons}>
                  <TouchableOpacity 
                    style={styles.imageButton} 
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera" size={32} color="#666" />
                    <ThemedText style={styles.imageButtonText}>
                      Tomar Foto
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.buttonSeparator} />
                  <TouchableOpacity 
                    style={styles.imageButton} 
                    onPress={pickImage}
                  >
                    <Ionicons name="images" size={32} color="#666" />
                    <ThemedText style={styles.imageButtonText}>
                      Galería
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Azúcares (g)</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.azucares}
              onChangeText={(text) => setFormData(prev => ({ ...prev, azucares: text }))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Fibra (g)</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.fibra}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fibra: text }))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Sodio (mg)</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.sodio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, sodio: text }))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
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
  imagePickerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    alignItems: 'center',
    padding: 16,
  },
  imageButtonText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  buttonSeparator: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});
