import { StyleSheet, View, Image, ScrollView, Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const teamMembers = [
  {
    name: 'Eduar Heredia Cahvez',
    role: 'Desarrollador Frontend',
    github: 'SrHeath',
  },
  {
    name: 'Juan Junior Almendras Davalos',
    role: 'Desarrollador Backend',
    github: 'Yuguigamer',
  },
  {
    name: 'Jorge Gabriel Paniagua Montenegro',
    role: 'QA (Quality Assurance)',
    github: 'Jorgepaniaguam',
  },
];

export default function AboutScreen() {
  const openGithub = (username: string) => {
    Linking.openURL(`https://github.com/${username}`);
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#1B5E20']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/perfil')}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>Sobre Nosotros</ThemedText>
            <ThemedText style={styles.subtitle}>El equipo detrás de NutriScan</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nuestra Misión</ThemedText>
          <ThemedText style={styles.text}>
            NutriScan nace con el objetivo de hacer la información nutricional más accesible y comprensible para todos.
            Buscamos empoderar a las personas para que tomen decisiones más informadas sobre su alimentación.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>El Equipo</ThemedText>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.githubButton}
                onPress={() => openGithub(member.github)}
              >
                <Ionicons name="logo-github" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tecnologías Utilizadas</ThemedText>
          <View style={styles.techList}>
            <View style={styles.techItem}>
              <Ionicons name="logo-react" size={24} color="#61DAFB" />
              <ThemedText style={styles.techText}>React Native</ThemedText>
            </View>
            <View style={styles.techItem}>
              <Ionicons name="server-outline" size={24} color="#2E7D32" />
              <ThemedText style={styles.techText}>Supabase</ThemedText>
            </View>
            <View style={styles.techItem}>
              <Ionicons name="code-slash-outline" size={24} color="#F7DF1E" />
              <ThemedText style={styles.techText}>TypeScript</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
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
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  githubButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  techText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});
