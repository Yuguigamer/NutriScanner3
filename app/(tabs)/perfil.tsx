import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

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

  // Memorizar la consulta del perfil
  const loadProfile = useMemo(() => async () => {
    try {
      if (!session?.user) return;

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
  }, [session?.user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Memorizar el avatar actual para evitar re-renders innecesarios
  const currentAvatar = useMemo(() => {
    return AVATARS[profile?.avatar_index || 0];
  }, [profile?.avatar_index]);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión. Por favor intenta de nuevo.');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#666" />
          <ThemedText style={styles.loadingText}>
            {isSigningOut ? 'Cerrando sesión...' : 'Cargando perfil...'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={currentAvatar}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.name}>{profile?.name || 'Usuario'}</ThemedText>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <ThemedText style={styles.email}>{profile?.email}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <ThemedText style={styles.menuText}>Editar Perfil</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <ThemedText style={styles.menuText}>Configuración</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <ThemedText style={styles.menuText}>Ayuda</ThemedText>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 16,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
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
});