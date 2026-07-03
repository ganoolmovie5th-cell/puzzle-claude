# 📸 Foto Puzzle

Game puzzle sliding mobile — ambil foto dari kamera atau galeri, lalu susun kembali potongannya!

## Fitur

- **Kamera & Galeri** — pakai foto sendiri sebagai puzzle
- **3 Tingkat Kesulitan** — 3×3 (Easy), 4×4 (Medium), 5×5 (Hard)
- **Timer & Move Counter** — lacak performa kamu
- **Preview Mode** — tekan untuk lihat gambar asli sebagai hint
- **Best Time** — tersimpan per difficulty
- **History** — 50 game terakhir tersimpan

## Tech Stack

- React Native + Expo SDK 54
- TypeScript strict
- Zustand (state + persistence)
- expo-image-picker + expo-image-manipulator

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

## Struktur Project

```
src/
├── core/           # Logika murni (tanpa React)
│   ├── types.ts    # Type definitions
│   ├── puzzle.ts   # Shuffle, move, solve detection
│   └── image.ts    # Resize & slice image
├── store/
│   └── gameStore.ts  # Zustand state management
└── screens/
    ├── HomeScreen.tsx    # Menu utama
    └── PuzzleScreen.tsx  # Gameplay
```

## License

MIT
