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
} from 'react-native';
import { useGameStore } from '../store/gameStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 16;
const BOARD_SIZE = SCREEN_WIDTH - BOARD_PADDING * 2;

interface Props {
  onBack: () => void;
}

export default function PuzzleScreen({ onBack }: Props) {
  const { puzzle, tileUris, imageUri, tap, reset } = useGameStore();
  const [elapsed, setElapsed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!puzzle || puzzle.solved) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - puzzle.startTime);
    }, 1000);
    return () => clearInterval(id);
  }, [puzzle?.startTime, puzzle?.solved]);

  if (!puzzle) return null;

  const { gridSize, tiles, moves, solved } = puzzle;
  const tileSize = Math.floor(BOARD_SIZE / gridSize);
  const emptyId = gridSize * gridSize - 1;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Kembali">
          <Text style={styles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.statText}>⏱ {formatTime(elapsed)}</Text>
          <Text style={styles.statText}>👆 {moves}</Text>
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
                  width: tileSize - 2,
                  height: tileSize - 2,
                  left: tile.col * tileSize + 1,
                  top: tile.row * tileSize + 1,
                },
              ]}
              onPress={() => tap(tile.row, tile.col)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Tile ${tile.id + 1}`}
            >
              <Image
                source={{ uri: tileUris[tile.id] }}
                style={{ width: tileSize - 2, height: tileSize - 2 }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowPreview(true)}
          accessibilityRole="button"
          accessibilityLabel="Lihat gambar asli"
        >
          <Text style={styles.actionText}>👁 Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Acak ulang"
        >
          <Text style={styles.actionText}>🔀 Acak Ulang</Text>
        </TouchableOpacity>
      </View>

      {/* Solved modal */}
      <Modal visible={solved} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🎉 Selesai!</Text>
            <Text style={styles.modalStat}>Waktu: {formatTime(elapsed)}</Text>
            <Text style={styles.modalStat}>Langkah: {moves}</Text>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.modalImage}
              />
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={onBack}>
              <Text style={styles.modalBtnText}>Main Lagi</Text>
            </TouchableOpacity>
          </View>
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
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: BOARD_SIZE, height: BOARD_SIZE, borderRadius: 12 }}
              />
            )}
            <Text style={styles.previewHint}>Ketuk untuk tutup</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { color: '#e94560', fontSize: 16, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 16 },
  statText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  board: {
    alignSelf: 'center',
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  tile: { position: 'absolute', borderRadius: 4, overflow: 'hidden' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
  },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 12 },
  modalStat: { fontSize: 18, color: '#a0a0b0', marginBottom: 4 },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginVertical: 16,
  },
  modalBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  previewContainer: { alignItems: 'center' },
  previewHint: { color: '#a0a0b0', marginTop: 12, fontSize: 14 },
});
