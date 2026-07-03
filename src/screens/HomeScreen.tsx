import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGameStore } from '../store/gameStore';
import { Difficulty, GRID_SIZES } from '../core/types';
import { prepareImage, sliceImage } from '../core/image';

const DIFFICULTIES: { key: Difficulty; label: string; desc: string }[] = [
  { key: '3x3', label: '3×3', desc: 'Mudah' },
  { key: '4x4', label: '4×4', desc: 'Sedang' },
  { key: '5x5', label: '5×5', desc: 'Sulit' },
];
const IMAGE_SIZE = 600;

interface Props {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: Props) {
  const { difficulty, setDifficulty, startGame, bestTimes, history } = useGameStore();
  const [loading, setLoading] = React.useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (result.canceled || !result.assets[0]) return;

    setLoading(true);
    try {
      const uri = result.assets[0].uri;
      const prepared = await prepareImage(uri, IMAGE_SIZE);
      const gridSize = GRID_SIZES[difficulty];
      const tiles = await sliceImage(prepared, gridSize, IMAGE_SIZE);
      startGame(prepared, tiles);
      onStart();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Gagal memproses gambar', msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return '-';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const gamesPlayed = history.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🧩</Text>
          <Text style={styles.title}>Foto Puzzle</Text>
          <Text style={styles.subtitle}>
            Ubah fotomu jadi puzzle seru!
          </Text>
        </View>

        {/* Stats mini */}
        {gamesPlayed > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{gamesPlayed}</Text>
              <Text style={styles.statLabel}>Game Selesai</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{formatTime(bestTimes[difficulty])}</Text>
              <Text style={styles.statLabel}>Best {difficulty}</Text>
            </View>
          </View>
        )}

        {/* Difficulty selector */}
        <Text style={styles.sectionTitle}>Tingkat Kesulitan</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.diffBtn, d.key === difficulty && styles.diffBtnActive]}
              onPress={() => setDifficulty(d.key)}
              accessibilityRole="button"
              accessibilityLabel={`Difficulty ${d.label} ${d.desc}`}
            >
              <Text style={[styles.diffLabel, d.key === difficulty && styles.diffLabelActive]}>
                {d.label}
              </Text>
              <Text style={[styles.diffDesc, d.key === difficulty && styles.diffDescActive]}>
                {d.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <Text style={styles.sectionTitle}>Pilih Sumber Foto</Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => pickImage('camera')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Ambil foto dari kamera"
        >
          <Text style={styles.btnIcon}>📷</Text>
          <View style={styles.btnTextWrap}>
            <Text style={styles.btnTitle}>Ambil Foto</Text>
            <Text style={styles.btnDesc}>Gunakan kamera untuk foto baru</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={() => pickImage('gallery')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Pilih dari galeri"
        >
          <Text style={styles.btnIcon}>🖼️</Text>
          <View style={styles.btnTextWrap}>
            <Text style={styles.btnTitle}>Dari Galeri</Text>
            <Text style={styles.btnDesc}>Pilih foto yang sudah ada</Text>
          </View>
        </TouchableOpacity>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#e94560" />
            <Text style={styles.loadingText}>Memotong gambar...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  scroll: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#8888a0', marginTop: 6, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#6a6a8a', marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6a6a8a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  diffBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2a2a4a',
  },
  diffBtnActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  diffLabel: { fontSize: 20, fontWeight: '800', color: '#6a6a8a' },
  diffLabelActive: { color: '#fff' },
  diffDesc: { fontSize: 11, color: '#555', marginTop: 4 },
  diffDescActive: { color: 'rgba(255,255,255,0.7)' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  btnPrimary: { backgroundColor: '#e94560' },
  btnOutline: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#e94560',
  },
  btnIcon: { fontSize: 28, marginRight: 14 },
  btnTextWrap: { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  loadingText: { color: '#e94560', fontSize: 14 },
});
