import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PuzzleScreen from './src/screens/PuzzleScreen';

type Screen = 'home' | 'puzzle';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <>
      <StatusBar style="light" />
      {screen === 'home' ? (
        <HomeScreen onStart={() => setScreen('puzzle')} />
      ) : (
        <PuzzleScreen onBack={() => setScreen('home')} />
      )}
    </>
  );
}
