import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Dimensions, Vibration, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { BarcodeScanningResult } from 'expo-camera/build/Camera.types';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { foodDB } from '../lib/supabase';
import type { Alimento } from '../lib/supabase';

interface BarcodeScannerProps {
  onScan: (alimento: Alimento | null, barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [torch, setTorch] = useState<'on' | 'off'>('off');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (!isScanning || isSearching) return;
    
    setIsScanning(false);
    setIsSearching(true);
    Vibration.vibrate(100); // Haptic feedback

    try {
      const alimento = await foodDB.getFoodByBarcode(data);
      onScan(alimento, data);
    } catch (error) {
      console.error('Error al buscar el alimento:', error);
      onScan(null, data);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleTorch = () => {
    setTorch(current => current === 'off' ? 'on' : 'off');
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Solicitando permiso de cámara...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Sin acceso a la cámara</ThemedText>
        <View style={styles.buttonContainer}>
          <Button title="Cerrar" onPress={onClose} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        enableTorch={torch === 'on'}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />
      <View style={styles.scanFrame}>
        <View style={styles.scanCorner} />
        <View style={[styles.scanCorner, { right: 0 }]} />
        <View style={[styles.scanCorner, { bottom: 0 }]} />
        <View style={[styles.scanCorner, { bottom: 0, right: 0 }]} />
      </View>
      <View style={styles.overlay}>
        <ThemedText style={styles.overlayText}>
          Apunta al código de barras del producto
        </ThemedText>
        {isSearching ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View style={styles.buttonContainer}>
            <Button title="Cancelar" onPress={onClose} />
            <Button 
              title={torch === 'on' ? "Apagar Luz" : "Encender Luz"} 
              onPress={toggleTorch} 
            />
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const scanFrameSize = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 16,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: scanFrameSize,
    height: scanFrameSize,
    transform: [
      { translateX: -scanFrameSize / 2 },
      { translateY: -scanFrameSize / 2 }
    ],
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
});
