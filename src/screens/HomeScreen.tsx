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
import { darkTheme, lightTheme, Theme } from '../core/theme';
import { getStars } from '../core/stars';
import { hapticTap } from '../core/haptics';

const DIFFICULTIES: { key: Difficulty; label: string; desc: string; icon: string }[] = [
  { key: '3x3', label: '3×3', desc: 'Mudah', icon: '🟢' },
  { key: '4x4', label: '4×4', desc: 'Sedang', icon: '🟡' },
  { key: '5x5', label: '5×5', desc: 'Sulit', icon: '🔴' },
  { key: '6x6', label: '6×6', desc: 'Expert', icon: '🟣' },
  { key: '7x7', label: '7×7', desc: 'Insane', icon: '⚫' },
];
const IMAGE_SIZE = 600;

interface Props {
  onStart: () => void;
  onHistory: () => void;
}

export default function HomeScreen({ onStart, onHistory }: Props) {
  const {
    difficulty, setDifficulty, startGame, bestTimes,
    history, themeMode, toggleTheme, showNumbers, toggleNumbers,
  } = useGameStore();
  const [loading, setLoading] = React.useState(false);
  const t: Theme = themeMode === 'dark' ? darkTheme : lightTheme;

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

  const bestTime = bestTimes[difficulty];
  const bestStars = bestTime !== null ? getStars(difficulty, bestTime) : 0;
  const gamesPlayed = history.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => { hapticTap(); onHistory(); }}
            style={[styles.iconBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
            accessibilityRole="button"
            accessibilityLabel="History"
          >
            <Text style={styles.iconBtnText}>📊</Text>
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              onPress={() => { hapticTap(); toggleNumbers(); }}
              style={[
                styles.iconBtn,
                { backgroundColor: showNumbers ? t.accentSoft : t.surface, borderColor: showNumbers ? t.accent : t.surfaceBorder },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Toggle nomor tile"
            >
              <Text style={styles.iconBtnText}>🔢</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { hapticTap(); toggleTheme(); }}
              style={[styles.iconBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
              accessibilityRole="button"
              accessibilityLabel="Toggle tema"
            >
              <Text style={styles.iconBtnText}>{themeMode === 'dark' ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🧩</Text>
          <Text style={[styles.title, { color: t.text }]}>Foto Puzzle</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Ubah fotomu jadi puzzle seru!
          </Text>
        </View>

        {/* Stats mini */}
        {gamesPlayed > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
              <Text style={[styles.statNum, { color: t.text }]}>{gamesPlayed}</Text>
              <Text style={[styles.statLabel, { color: t.textDim }]}>Selesai</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
              <Text style={[styles.statNum, { color: t.text }]}>{formatTime(bestTime)}</Text>
              <Text style={[styles.statLabel, { color: t.textDim }]}>Best {difficulty}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
              <Text style={[styles.statNum, { color: t.accent }]}>{'⭐'.repeat(bestStars) || '-'}</Text>
              <Text style={[styles.statLabel, { color: t.textDim }]}>Rating</Text>
            </View>
          </View>
        )}

        {/* Difficulty */}
        <Text style={[styles.sectionTitle, { color: t.textDim }]}>Tingkat Kesulitan</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => {
            const active = d.key === difficulty;
            return (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.diffBtn,
                  { backgroundColor: active ? t.accent : t.surface, borderColor: active ? t.accent : t.surfaceBorder },
                ]}
                onPress={() => { hapticTap(); setDifficulty(d.key); }}
                accessibilityRole="button"
                accessibilityLabel={`${d.label} ${d.desc}`}
              >
                <Text style={styles.diffIcon}>{d.icon}</Text>
                <Text style={[styles.diffLabel, { color: active ? '#fff' : t.textMuted }]}>
                  {d.label}
                </Text>
                <Text style={[styles.diffDesc, { color: active ? 'rgba(255,255,255,0.7)' : t.textDim }]}>
                  {d.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Star targets */}
        <View style={[styles.targetCard, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
          <Text style={[styles.targetTitle, { color: t.textMuted }]}>🎯 Target Waktu ({difficulty})</Text>
          <View style={styles.targetRow}>
            <Text style={[styles.targetItem, { color: t.textDim }]}>⭐ {'<'} {{ '3x3': '2m', '4x4': '5m', '5x5': '10m', '6x6': '15m', '7x7': '20m' }[difficulty]}</Text>
            <Text style={[styles.targetItem, { color: t.textDim }]}>⭐⭐ {'<'} {{ '3x3': '1m', '4x4': '2.5m', '5x5': '5m', '6x6': '7.5m', '7x7': '10m' }[difficulty]}</Text>
            <Text style={[styles.targetItem, { color: t.textDim }]}>⭐⭐⭐ {'<'} {{ '3x3': '30d', '4x4': '1m', '5x5': '2m', '6x6': '3m', '7x7': '4m' }[difficulty]}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <Text style={[styles.sectionTitle, { color: t.textDim }]}>Pilih Sumber Foto</Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.accent }]}
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
          style={[styles.btn, { backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.accent }]}
          onPress={() => pickImage('gallery')}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Pilih dari galeri"
        >
          <Text style={styles.btnIcon}>🖼️</Text>
          <View style={styles.btnTextWrap}>
            <Text style={[styles.btnTitle, { color: t.text }]}>Dari Galeri</Text>
            <Text style={[styles.btnDesc, { color: t.textMuted }]}>Pilih foto yang sudah ada</Text>
          </View>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={t.accent} />
            <Text style={[styles.loadingText, { color: t.accent }]}>Memotong gambar...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topBarRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  iconBtnText: { fontSize: 18 },
  hero: { alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 52, marginBottom: 6 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  diffBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5 },
  diffIcon: { fontSize: 16, marginBottom: 4 },
  diffLabel: { fontSize: 18, fontWeight: '800' },
  diffDesc: { fontSize: 11, marginTop: 2 },
  targetCard: { borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1 },
  targetTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  targetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  targetItem: { fontSize: 11 },
  btn: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, marginBottom: 12 },
  btnIcon: { fontSize: 26, marginRight: 14 },
  btnTextWrap: { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  loadingText: { fontSize: 14 },
});
