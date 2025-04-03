import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Lista de avatares predefinidos
const AVATARS: Record<number, ImageSourcePropType> = {
  0: require('../../assets/avatars/avatar1.jpg'),
  1: require('../../assets/avatars/avatar2.jpg'),
  2: require('../../assets/avatars/avatar3.jpg'),
  3: require('../../assets/avatars/avatar4.jpg'),
} as const;

interface Profile {
  name: string;
  email: string;
  avatar_index: number;
}

export default function PerfilScreen() {
  const { signOut, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingAvatarIndex, setEditingAvatarIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Cargar perfil inicial
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, avatar_index')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Suscribirse a cambios en el perfil
    const subscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user?.id]);

  const handleUpdateProfile = async () => {
    if (!session?.user || !editingName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre válido');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingName.trim(),
          avatar_index: editingAvatarIndex,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setIsEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión. Por favor intenta de nuevo.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || !session?.user) return;
    
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, avatar_index')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        return;
      }

      setProfile(data);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#4CAF50', '#1B5E20']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.title}>Mi Perfil</ThemedText>
            <ThemedText style={styles.subtitle}>Información de la cuenta</ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={40} color="#666" />
            <ThemedText style={styles.loadingText}>
              {isSigningOut ? 'Cerrando sesión...' : 'Cargando perfil...'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#1B5E20']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>Mi Perfil</ThemedText>
          <ThemedText style={styles.subtitle}>Información de la cuenta</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Image 
            source={AVATARS[profile?.avatar_index || 0]}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.name}>{profile?.name || 'Usuario'}</ThemedText>
            <ThemedText style={styles.email}>{profile?.email || session?.user?.email}</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setEditingName(profile?.name || '');
              setEditingAvatarIndex(profile?.avatar_index || 0);
              setIsEditModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Ionicons 
              name={isRefreshing ? "sync-circle" : "sync-outline"} 
              size={24} 
              color="#666"
              style={isRefreshing ? styles.spinningIcon : undefined}
            />
            <ThemedText style={styles.menuText}>
              {isRefreshing ? 'Actualizando...' : 'Actualizar Perfil'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#666" />
            <ThemedText style={styles.menuText}>Configuración</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <Ionicons name="people-outline" size={24} color="#666" />
            <ThemedText style={styles.menuText}>Sobre Nosotros</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, isSigningOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isSigningOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <ThemedText style={styles.logoutText}>
            {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </ThemedText>
        </TouchableOpacity>

        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Editar Perfil</ThemedText>
              
              <TextInput
                style={styles.input}
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Nombre"
                placeholderTextColor="#999"
              />

              <ThemedText style={styles.avatarTitle}>Selecciona un avatar</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
                {Object.entries(AVATARS).map(([index, source]) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      editingAvatarIndex === Number(index) && styles.selectedAvatar
                    ]}
                    onPress={() => setEditingAvatarIndex(Number(index))}
                  >
                    <Image source={source} style={styles.avatarImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, isSaving && styles.disabledButton]}
                  onPress={handleUpdateProfile}
                  disabled={isSaving}
                >
                  <ThemedText style={styles.buttonText}>
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 'auto',
  },
  logoutButtonDisabled: {
    backgroundColor: '#ffaaaa',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  avatarTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  avatarList: {
    marginBottom: 20,
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: '#007AFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
})