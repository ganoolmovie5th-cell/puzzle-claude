# Foto Puzzle — Project Context & Conventions

## Overview

Game puzzle sliding mobile. Pengguna ambil foto dari kamera atau galeri, gambar dipotong menjadi grid (3×3 / 4×4 / 5×5), lalu diacak. Geser tile untuk menyusun ulang gambar ke posisi semula.

- **Repo:** puzzle-claude
- **Branch:** `main` (push langsung)
- **Stack:** React Native + Expo SDK 54 + TypeScript strict

---

## Aturan Penting

- **Harus jalan di Expo Go SDK 54** — jangan native module yang butuh prebuild
- Tambah paket selalu via `npx expo install <paket>`, bukan `npm install` versi bebas
- **Logika puzzle di `src/core/` harus murni** (no React import)
- Push langsung ke `main`, tanpa PR

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React Native 0.79 + Expo SDK 54 |
| Bahasa | TypeScript strict |
| State | Zustand 5 + persist (AsyncStorage) |
| Image | expo-image-picker + expo-image-manipulator |
| Gesture | react-native-gesture-handler |

---

## Struktur File

```
puzzle-claude/
├── App.tsx              # Root: navigasi sederhana home ↔ puzzle
├── index.ts             # registerRootComponent
├── src/
│   ├── core/
│   │   ├── types.ts     # Difficulty, Tile, PuzzleState, HistoryEntry
│   │   ├── puzzle.ts    # createSolvedPuzzle, shufflePuzzle, moveTile, isSolved
│   │   └── image.ts     # prepareImage (resize square), sliceImage (crop grid)
│   ├── store/
│   │   └── gameStore.ts # Zustand: puzzle state, history, bestTimes
│   └── screens/
│       ├── HomeScreen.tsx   # Pilih difficulty + kamera/galeri
│       └── PuzzleScreen.tsx # Gameplay: board, timer, moves, preview, solved modal
├── assets/              # Icon & splash placeholders
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Fitur

### Difficulty Scaling
- **3×3** (9 tiles, 1 kosong) — Easy
- **4×4** (16 tiles, 1 kosong) — Medium
- **5×5** (25 tiles, 1 kosong) — Hard
- Shuffle dilakukan via random valid moves (menjamin solvable)

### Image Source
- 📷 Kamera (expo-image-picker, aspect 1:1, allowsEditing)
- 🖼️ Galeri (expo-image-picker, aspect 1:1, allowsEditing)
- Gambar di-resize ke 900×900 lalu di-crop per tile

### Gameplay
- Tap tile yang bersebelahan dengan slot kosong untuk geser
- Timer berjalan sejak puzzle dimulai
- Move counter
- Preview mode (lihat gambar utuh sebagai hint)
- Acak ulang (shuffle ulang tanpa ganti gambar)

### Persistence (AsyncStorage via Zustand persist)
- Best time per difficulty
- History 50 game terakhir
- Difficulty preference

---

## Perintah Development

```bash
npx expo start --go    # Jalankan di Expo Go
npm run typecheck      # tsc --noEmit (0 error)
npx expo export --platform android  # Bundle harus sukses ("Exported: dist")
```

---

## Design

- **Background:** Dark navy `#1a1a2e`
- **Accent:** Coral `#e94560`
- **Surface:** `#2a2a4a`
- **Text:** White `#fff`, Muted `#a0a0b0`

---

## Commit Convention

```
<type>: <deskripsi singkat>
```

Type: `feat` `fix` `refactor` `chore` `docs`

---

## Roadmap

- [ ] Animasi slide tile (Animated API)
- [ ] Leaderboard lokal (history screen)
- [ ] Share puzzle ke teman
- [ ] Haptic feedback saat tile bergerak
- [ ] Sound effects
