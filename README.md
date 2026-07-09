# 🧩 Foto Puzzle

Game puzzle sliding mobile — ambil foto dari kamera atau galeri, lalu susun kembali potongannya!

## Fitur

- **Kamera & Galeri** — pakai foto sendiri sebagai puzzle
- **3 Tingkat Kesulitan** — 3×3 (Mudah), 4×4 (Sedang), 5×5 (Sulit)
- **Expert Mode** — 6×6 dan 7×7 untuk pemain advanced
- **Timer & Move Counter** — lacak performa kamu
- **Star Rating** — bintang 1-3 berdasarkan kecepatan penyelesaian
- **Move Hint** — highlight tile yang bisa digeser
- **Numbered Tiles** — angka di pojok tile untuk orientasi
- **Haptic Feedback** — getaran saat geser dan saat selesai
- **Preview Mode** — lihat gambar asli sebagai hint
- **Riwayat Game** — 50 game terakhir tersimpan + best time per difficulty
- **Dark / Light Theme** — pilih tema sesuai selera
- **Slide Animation** — tile bergeser smooth dengan spring animation
- **Achievements** — 12 badge (speed demon, efficient, expert mode, dll)
- **Best Time** — tersimpan per difficulty
- **🔗 Puzzle dari URL** — paste URL gambar dari internet untuk dijadikan puzzle

## Tech Stack

- React Native + Expo SDK 54
- TypeScript strict
- Zustand (state + persistence)
- expo-image-picker + expo-image-manipulator
- expo-haptics

## Development

```bash
npm install
npx expo start --go       # Jalankan di Expo Go
npm run typecheck          # TypeScript check
npx expo export --platform android  # Verify bundle
```

## Cara Main

1. Pilih tingkat kesulitan (3×3 / 4×4 / 5×5)
2. Ambil foto dari kamera atau pilih dari galeri
3. Foto dipotong dan diacak otomatis
4. Geser tile yang bersebelahan dengan slot kosong
5. Susun semua tile ke posisi semula — selesai!

## Star Rating

| Difficulty | ⭐ | ⭐⭐ | ⭐⭐⭐ |
|---|---|---|---|
| 3×3 | < 2 menit | < 1 menit | < 30 detik |
| 4×4 | < 5 menit | < 2.5 menit | < 1 menit |
| 5×5 | < 10 menit | < 5 menit | < 2 menit |

## Struktur Project

```
src/
├── core/              # Logika murni (tanpa React)
│   ├── types.ts       # Type definitions
│   ├── puzzle.ts      # Shuffle, move, solve detection
│   ├── image.ts       # Resize & slice image
│   ├── haptics.ts     # Haptic feedback
│   ├── theme.ts       # Dark/light theme tokens
│   └── stars.ts       # Star rating calculation
├── store/
│   └── gameStore.ts   # Zustand state management
└── screens/
    ├── HomeScreen.tsx     # Menu utama + settings
    ├── PuzzleScreen.tsx   # Gameplay
    └── HistoryScreen.tsx  # Riwayat game
```

## License

MIT
