import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PuzzleScreen from './src/screens/PuzzleScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { useGameStore } from './src/store/gameStore';

type Screen = 'home' | 'puzzle' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const themeMode = useGameStore((s) => s.themeMode);

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {screen === 'home' && (
        <HomeScreen
          onStart={() => setScreen('puzzle')}
          onHistory={() => setScreen('history')}
        />
      )}
      {screen === 'puzzle' && (
        <PuzzleScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'history' && (
        <HistoryScreen onBack={() => setScreen('home')} />
      )}
    </>
  );
}
