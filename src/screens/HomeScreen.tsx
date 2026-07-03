import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGameStore } from '../store/gameStore';
import { Difficulty, GRID_SIZES } from '../core/types';
import { prepareImage, sliceImage } from '../core/image';

const DIFFICULTIES: Difficulty[] = ['3x3', '4x4', '5x5'];
const IMAGE_SIZE = 900; // px for slicing

interface Props {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: Props) {
  const { difficulty, setDifficulty, startGame, bestTimes } = useGameStore();
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
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return '--:--';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📸 Foto Puzzle</Text>
        <Text style={styles.subtitle}>
          Ambil foto atau pilih dari galeri, lalu susun puzzle-nya!
        </Text>

        {/* Difficulty selector */}
        <Text style={styles.label}>Tingkat Kesulitan</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.diffBtn, d === difficulty && styles.diffBtnActive]}
              onPress={() => setDifficulty(d)}
              accessibilityRole="button"
              accessibilityLabel={`Difficulty ${d}`}
            >
              <Text
                style={[styles.diffText, d === difficulty && styles.diffTextActive]}
              >
                {d}
              </Text>
              <Text style={styles.bestText}>
                Best: {formatTime(bestTimes[d])}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.btn}
          onPress={() => pickImage('camera')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Ambil foto dari kamera"
        >
          <Text style={styles.btnText}>📷 Ambil Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => pickImage('gallery')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Pilih dari galeri"
        >
          <Text style={[styles.btnText, styles.btnTextSecondary]}>
            🖼️ Pilih dari Galeri
          </Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loading}>Memotong gambar...</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a0a0b0', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 14, color: '#a0a0b0', marginBottom: 12 },
  diffRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  diffBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
  },
  diffBtnActive: { backgroundColor: '#e94560' },
  diffText: { fontSize: 18, fontWeight: '700', color: '#a0a0b0' },
  diffTextActive: { color: '#fff' },
  bestText: { fontSize: 11, color: '#888', marginTop: 4 },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#e94560',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondary: { backgroundColor: '#2a2a4a' },
  btnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  btnTextSecondary: { color: '#e94560' },
  loading: { color: '#e94560', marginTop: 16, fontSize: 14 },
});
