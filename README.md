# Foto Puzzle

Game puzzle sliding mobile. Ambil foto dari kamera atau galeri, lalu susun kembali potongannya. Support 3x3 hingga 7x7.

**Tech Stack:** React Native · Expo SDK 54 · TypeScript · Zustand · expo-image-picker · expo-haptics

## Features

- Kamera & Galeri (pakai foto sendiri sebagai puzzle)
- Puzzle dari URL (paste link gambar dari internet)
- 5 tingkat kesulitan: 3x3, 4x4, 5x5, 6x6, 7x7
- Undo/Redo (per game session)
- Hint System (highlight tile yang bisa digeser)
- Timer & Move Counter
- Star Rating (bintang 1-3 berdasarkan kecepatan)
- Numbered Tiles (angka di pojok untuk orientasi)
- Haptic Feedback (geser + selesai)
- Preview Mode (lihat gambar asli)
- Riwayat Game (50 game terakhir + best time per difficulty)
- Dark/Light theme
- Slide animation (spring)
- 12 achievements

## Getting Started

```bash
npm install
npx expo start --go
```

Scan QR code dengan Expo Go.

## Project Structure

```
src/
  core/             → Logika murni (tanpa React)
    types.ts            Type definitions
    puzzle.ts           Shuffle, move, solve detection
    image.ts            Resize & slice image
    haptics.ts          Haptic feedback
    theme.ts            Dark/light theme tokens
    stars.ts            Star rating calculation
  store/            → gameStore.ts (Zustand + persistence)
  screens/
    HomeScreen.tsx      Menu utama + settings
    PuzzleScreen.tsx    Gameplay
    HistoryScreen.tsx   Riwayat game
  utils/
    time.ts             formatTime utility
```

## Testing

```bash
npm run typecheck
npx expo export --platform android
```

## License

MIT
