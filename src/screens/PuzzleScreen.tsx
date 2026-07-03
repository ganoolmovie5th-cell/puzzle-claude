import React, { useEffect, useRef, useState } from 'react';
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
import { darkTheme, lightTheme, Theme } from '../core/theme';
import { getStars } from '../core/stars';
import { hapticTap, hapticSuccess } from '../core/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 16;
const BOARD_SIZE = SCREEN_WIDTH - BOARD_PADDING * 2;

interface Props {
  onBack: () => void;
}

export default function PuzzleScreen({ onBack }: Props) {
  const { puzzle, tileUris, imageUri, difficulty, tap, reset, themeMode, showNumbers } = useGameStore();
  const [elapsed, setElapsed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const t: Theme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    if (!puzzle || puzzle.solved) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - puzzle.startTime);
    }, 1000);
    return () => clearInterval(id);
  }, [puzzle?.startTime, puzzle?.solved]);

  useEffect(() => {
    if (puzzle?.solved) {
      hapticSuccess();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [puzzle?.solved]);

  if (!puzzle) return null;

  const { gridSize, tiles, moves, solved } = puzzle;
  const tileSize = Math.floor(BOARD_SIZE / gridSize);
  const emptyId = gridSize * gridSize - 1;
  const emptyTile = tiles[puzzle.emptyIndex];

  // Find movable tiles (adjacent to empty)
  const movableTiles = new Set(
    tiles
      .filter((tile) => {
        if (tile.id === emptyId) return false;
        const dr = Math.abs(tile.row - emptyTile.row);
        const dc = Math.abs(tile.col - emptyTile.col);
        return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
      })
      .map((tile) => tile.id)
  );

  const handleTap = (row: number, col: number) => {
    const moved = tap(row, col);
    if (moved) hapticTap();
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const stars = solved ? getStars(difficulty, elapsed) : 0;
  const diffLabel = difficulty.replace('x', '×');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.circleBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={[styles.circleBtnText, { color: t.text }]}>←</Text>
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
          <Text style={[styles.badgeText, { color: t.accent }]}>{diffLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowPreview(true)}
          style={[styles.circleBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Lihat gambar asli"
        >
          <Text style={styles.circleBtnText}>👁</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={[styles.statChip, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
          <Text style={{ fontSize: 14 }}>⏱</Text>
          <Text style={[styles.statValue, { color: t.text }]}>{formatTime(elapsed)}</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
          <Text style={{ fontSize: 14 }}>👆</Text>
          <Text style={[styles.statValue, { color: t.text }]}>{moves}</Text>
        </View>
      </View>

      {/* Board */}
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE, backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
        {tiles.map((tile) => {
          if (tile.id === emptyId) return null;
          const isMovable = movableTiles.has(tile.id);
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
                showHint && isMovable && styles.tileHint,
              ]}
              onPress={() => handleTap(tile.row, tile.col)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Tile ${tile.id + 1}`}
            >
              <Image
                source={{ uri: tileUris[tile.id] }}
                style={{ width: tileSize - 3, height: tileSize - 3, borderRadius: 4 }}
              />
              {showNumbers && (
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{tile.id + 1}</Text>
                </View>
              )}
              {showHint && isMovable && (
                <View style={styles.hintOverlay}>
                  <Text style={styles.hintArrow}>↕</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          onPress={() => { hapticTap(); setShowHint(!showHint); }}
          accessibilityRole="button"
          accessibilityLabel="Hint"
        >
          <Text style={styles.actionIcon}>💡</Text>
          <Text style={[styles.actionLabel, { color: showHint ? t.accent : t.text }]}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          onPress={() => { hapticTap(); reset(); }}
          accessibilityRole="button"
          accessibilityLabel="Acak ulang"
        >
          <Text style={styles.actionIcon}>🔀</Text>
          <Text style={[styles.actionLabel, { color: t.text }]}>Acak</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Ganti foto"
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={[styles.actionLabel, { color: t.text }]}>Ganti</Text>
        </TouchableOpacity>
      </View>

      {/* Solved modal */}
      <Modal visible={solved} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: t.overlay }]}>
          <Animated.View
            style={[
              styles.modal,
              { backgroundColor: t.surface, borderColor: t.surfaceBorder },
              { transform: [{ scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
            ]}
          >
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={[styles.modalTitle, { color: t.text }]}>Puzzle Selesai!</Text>

            {/* Stars */}
            <Text style={styles.starsDisplay}>
              {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </Text>

            <View style={styles.modalStatsRow}>
              <View style={[styles.modalStatCard, { backgroundColor: t.bg }]}>
                <Text style={[styles.modalStatNum, { color: t.accent }]}>{formatTime(elapsed)}</Text>
                <Text style={[styles.modalStatLabel, { color: t.textDim }]}>Waktu</Text>
              </View>
              <View style={[styles.modalStatCard, { backgroundColor: t.bg }]}>
                <Text style={[styles.modalStatNum, { color: t.accent }]}>{moves}</Text>
                <Text style={[styles.modalStatLabel, { color: t.textDim }]}>Langkah</Text>
              </View>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.modalImage} />
            )}

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: t.accent }]} onPress={onBack}>
              <Text style={styles.modalBtnText}>🎮 Main Lagi</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Preview modal */}
      <Modal visible={showPreview} transparent animationType="fade">
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: t.overlay }]}
          activeOpacity={1}
          onPress={() => setShowPreview(false)}
        >
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Gambar Asli</Text>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: BOARD_SIZE - 24, height: BOARD_SIZE - 24, borderRadius: 16 }}
              />
            )}
            <Text style={[styles.previewHint, { color: t.textDim }]}>Ketuk untuk tutup</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  circleBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  circleBtnText: { fontSize: 18 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  statsBar: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  statValue: { fontSize: 16, fontWeight: '700' },
  board: { alignSelf: 'center', borderRadius: 14, overflow: 'hidden', position: 'relative', borderWidth: 2 },
  tile: { position: 'absolute', borderRadius: 4, overflow: 'hidden' },
  tileHint: { borderWidth: 2, borderColor: '#4ade80' },
  numberBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,222,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintArrow: { fontSize: 20, color: '#4ade80' },
  bottomBar: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20, paddingHorizontal: 16 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modal: { borderRadius: 24, padding: 28, alignItems: 'center', width: '85%', borderWidth: 1 },
  modalEmoji: { fontSize: 44, marginBottom: 4 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  starsDisplay: { fontSize: 28, marginBottom: 16 },
  modalStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  modalStatCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  modalStatNum: { fontSize: 20, fontWeight: '800' },
  modalStatLabel: { fontSize: 11, marginTop: 3 },
  modalImage: { width: 100, height: 100, borderRadius: 12, marginBottom: 16 },
  modalBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  previewContainer: { alignItems: 'center' },
  previewTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  previewHint: { marginTop: 14, fontSize: 13 },
});
