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
| Image | expo-image-picker + expo-image-manipulator@14 |
| Haptics | expo-haptics |
| Gesture | react-native-gesture-handler |

---

## Struktur File

```
puzzle-claude/
├── App.tsx              # Root: navigasi home ↔ puzzle ↔ history
├── index.ts             # registerRootComponent
├── src/
│   ├── core/
│   │   ├── types.ts     # Difficulty, Tile, PuzzleState, HistoryEntry
│   │   ├── puzzle.ts    # createSolvedPuzzle, shufflePuzzle, moveTile, isSolved
│   │   ├── image.ts     # prepareImage (resize square), sliceImage (crop grid parallel)
│   │   ├── haptics.ts   # hapticTap, hapticSuccess, hapticError (expo-haptics)
│   │   ├── theme.ts     # Theme type, darkTheme, lightTheme
│   │   └── stars.ts     # getStars (timer challenge rating)
│   ├── store/
│   │   └── gameStore.ts # Zustand: puzzle state, history, bestTimes, theme, showNumbers
│   └── screens/
│       ├── HomeScreen.tsx    # Pilih difficulty + kamera/galeri + settings
│       ├── PuzzleScreen.tsx  # Gameplay: board, timer, moves, hint, numbers, preview
│       └── HistoryScreen.tsx # Riwayat game + best times
├── assets/              # Icon & splash placeholders
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Fitur

### Difficulty Scaling
- **3×3** (9 tiles, 1 kosong) — Mudah
- **4×4** (16 tiles, 1 kosong) — Sedang
- **5×5** (25 tiles, 1 kosong) — Sulit
- Shuffle dilakukan via random valid moves (menjamin solvable)

### Image Source
- 📷 Kamera (expo-image-picker, aspect 1:1, allowsEditing)
- 🖼️ Galeri (expo-image-picker, aspect 1:1, allowsEditing)
- Gambar di-resize ke 600×600 lalu di-crop per tile (parallel Promise.all)

### Gameplay
- Tap tile yang bersebelahan dengan slot kosong untuk geser
- Timer berjalan sejak puzzle dimulai
- Move counter
- Preview mode (lihat gambar utuh sebagai hint)
- Acak ulang (shuffle ulang tanpa ganti gambar)
- **Haptic feedback** — getaran ringan saat geser, getaran sukses saat selesai (expo-haptics)
- **Move hint** — highlight tile yang bisa digeser (tombol 💡)
- **Numbered tiles** — angka kecil di pojok tiap tile untuk orientasi (toggle 🔢)
- **Timer challenge** — bintang 1-3 berdasarkan waktu penyelesaian per difficulty

### Timer Challenge (Star Rating)
| Difficulty | ⭐ | ⭐⭐ | ⭐⭐⭐ |
|---|---|---|---|
| 3×3 | < 2 menit | < 1 menit | < 30 detik |
| 4×4 | < 5 menit | < 2.5 menit | < 1 menit |
| 5×5 | < 10 menit | < 5 menit | < 2 menit |

### History Screen
- Riwayat 50 game terakhir dengan thumbnail, difficulty, waktu, langkah, dan stars
- Summary best time per difficulty di bagian atas

### Dark / Light Theme
- Toggle tema dari HomeScreen (tombol ☀️/🌙)
- Warna mengikuti `src/core/theme.ts` (darkTheme / lightTheme)
- Preferensi tersimpan di AsyncStorage

### Persistence (AsyncStorage via Zustand persist)
- Best time per difficulty
- History 50 game terakhir
- Difficulty preference
- Theme mode (dark/light)
- Show numbers toggle

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

- [x] Animasi slide tile (Animated.spring) — Juli 2026
- [x] Custom grid 6×6 / 7×7 — Juli 2026
- [x] Achievements (12 badge) — Juli 2026
- [ ] Share puzzle ke teman
- [ ] Daily puzzle (foto sample baru setiap hari)

---

## Fitur Baru (Juli 2026)

### Slide Animation
- Tile bergeser smooth via `Animated.spring` (tension:180, friction:15)
- Setiap tile punya persistent `Animated.Value` untuk x/y
- Animasi trigger setiap kali posisi tile berubah (dari `puzzle.tiles`)

### Custom Grid (6×6, 7×7)
- `Difficulty` type diperluas: `'6x6' | '7x7'`
- `GRID_SIZES` dan `stars.ts` targets ditambah untuk kedua difficulty
- HomeScreen picker menampilkan 5 opsi (Expert 🟣, Insane ⚫)
- `bestTimes` store diperluas

### Achievements (12 badges)
- `src/core/achievements.ts`: First Solve, Puzzle Lover (5), Master (20), Legend (50)
- Speed Demon per difficulty (3×3<30s, 4×4<1m, 5×5<2m)
- Expert Mode (solve 6×6), Insane Mode (solve 7×7)
- Perfect Run (all 3-star), Efficient (low moves 3×3<15, 4×4<60)
- `unlockedAchievements` di-persist; popup saat badge baru unlock
