import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { darkTheme, lightTheme, Theme } from '../core/theme';
import { getStars } from '../core/stars';
import { HistoryEntry } from '../core/types';
import { formatTime } from '../utils/time';

interface Props {
  onBack: () => void;
}

export default function HistoryScreen({ onBack }: Props) {
  const { history, bestTimes, themeMode, clearHistory } = useGameStore();
  const t: Theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const handleClear = () => {
    Alert.alert(
      'Hapus Riwayat',
      'Semua riwayat game, best time, dan achievements akan dihapus. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const stars = getStars(item.difficulty, item.timeMs);
    return (
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, { backgroundColor: t.surfaceBorder }]} />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardDiff, { color: t.accent }]}>{item.difficulty}</Text>
            <Text style={styles.cardStars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          </View>
          <Text style={[styles.cardStats, { color: t.textMuted }]}>
            {formatTime(item.timeMs)} · {item.moves} langkah
          </Text>
          <Text style={[styles.cardDate, { color: t.textDim }]}>{formatDate(item.date)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={[styles.backText, { color: t.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Riwayat</Text>
        {history.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.backBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Hapus riwayat"
          >
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      {/* Best times summary */}
      <View style={styles.bestRow}>
        {(['3x3', '4x4', '5x5'] as const).map((d) => (
          <View key={d} style={[styles.bestCard, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
            <Text style={[styles.bestLabel, { color: t.textDim }]}>{d}</Text>
            <Text style={[styles.bestTime, { color: t.text }]}>
              {bestTimes[d] !== null ? formatTime(bestTimes[d]!) : '-'}
            </Text>
            {bestTimes[d] !== null && (
              <Text style={styles.bestStars}>
                {'⭐'.repeat(getStars(d, bestTimes[d]!))}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* List */}
      {history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🧩</Text>
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Belum ada riwayat game</Text>
          <Text style={[styles.emptyHint, { color: t.textDim }]}>Mainkan puzzle pertamamu!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  backText: { fontSize: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  bestRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  bestCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  bestLabel: { fontSize: 12, fontWeight: '600' },
  bestTime: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  bestStars: { fontSize: 12, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, alignItems: 'center' },
  thumb: { width: 50, height: 50, borderRadius: 10 },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDiff: { fontSize: 14, fontWeight: '700' },
  cardStars: { fontSize: 14 },
  cardStats: { fontSize: 13, marginTop: 3 },
  cardDate: { fontSize: 11, marginTop: 2 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13, marginTop: 4 },
});
