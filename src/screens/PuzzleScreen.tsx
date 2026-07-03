import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { useGameStore } from '../store/gameStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 20;
const BOARD_SIZE = SCREEN_WIDTH - BOARD_PADDING * 2;

interface Props {
  onBack: () => void;
}

export default function PuzzleScreen({ onBack }: Props) {
  const { puzzle, tileUris, imageUri, difficulty, tap, reset } = useGameStore();
  const [elapsed, setElapsed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [confetti] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!puzzle || puzzle.solved) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - puzzle.startTime);
    }, 1000);
    return () => clearInterval(id);
  }, [puzzle?.startTime, puzzle?.solved]);

  useEffect(() => {
    if (puzzle?.solved) {
      Animated.spring(confetti, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }).start();
    } else {
      confetti.setValue(0);
    }
  }, [puzzle?.solved]);

  if (!puzzle) return null;

  const { gridSize, tiles, moves, solved } = puzzle;
  const tileSize = Math.floor(BOARD_SIZE / gridSize);
  const emptyId = gridSize * gridSize - 1;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const diffLabel = difficulty.replace('x', '×');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backWrap}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{diffLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowPreview(true)}
          style={styles.previewBtn}
          accessibilityRole="button"
          accessibilityLabel="Lihat gambar asli"
        >
          <Text style={styles.previewIcon}>👁</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👆</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>

      {/* Board */}
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {tiles.map((tile) => {
          if (tile.id === emptyId) return null;
          return (
            <TouchableOpacity
              key={tile.id}
              style={[
                styles.tile,
                {
                  width: tileSize - 3,
                  height: tileSize - 3,
                  left: tile.col * tileSize + 1.5,
                  top: tile.row * tileSize + 1.5,
                },
              ]}
              onPress={() => tap(tile.row, tile.col)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Tile ${tile.id + 1}`}
            >
              <Image
                source={{ uri: tileUris[tile.id] }}
                style={{ width: tileSize - 3, height: tileSize - 3, borderRadius: 6 }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Acak ulang"
        >
          <Text style={styles.actionIcon}>🔀</Text>
          <Text style={styles.actionLabel}>Acak Ulang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Ganti foto"
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Ganti Foto</Text>
        </TouchableOpacity>
      </View>

      {/* Solved modal */}
      <Modal visible={solved} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modal,
              { transform: [{ scale: confetti.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] },
            ]}
          >
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Puzzle Selesai!</Text>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatCard}>
                <Text style={styles.modalStatNum}>{formatTime(elapsed)}</Text>
                <Text style={styles.modalStatLabel}>Waktu</Text>
              </View>
              <View style={styles.modalStatCard}>
                <Text style={styles.modalStatNum}>{moves}</Text>
                <Text style={styles.modalStatLabel}>Langkah</Text>
              </View>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.modalImage} />
            )}

            <TouchableOpacity style={styles.modalBtn} onPress={onBack}>
              <Text style={styles.modalBtnText}>🎮 Main Lagi</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Preview modal */}
      <Modal visible={showPreview} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowPreview(false)}
        >
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Gambar Asli</Text>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: BOARD_SIZE - 20, height: BOARD_SIZE - 20, borderRadius: 16 }}
              />
            )}
            <Text style={styles.previewHint}>Ketuk di mana saja untuk tutup</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: '#fff' },
  badge: {
    backgroundColor: '#2a2a4a',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: '#e94560', fontSize: 14, fontWeight: '700' },
  previewBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIcon: { fontSize: 18 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statDivider: { width: 1, height: 20, backgroundColor: '#2a2a4a' },
  board: {
    alignSelf: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#2a2a4a',
  },
  tile: {
    position: 'absolute',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  actionIcon: { fontSize: 16 },
  actionLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  modalEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 20 },
  modalStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modalStatCard: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  modalStatNum: { fontSize: 22, fontWeight: '800', color: '#e94560' },
  modalStatLabel: { fontSize: 12, color: '#6a6a8a', marginTop: 4 },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 14,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  previewContainer: { alignItems: 'center' },
  previewTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  previewHint: { color: '#6a6a8a', marginTop: 16, fontSize: 13 },
});
