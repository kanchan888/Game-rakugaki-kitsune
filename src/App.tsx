import { useEffect, useState } from 'react';
import { Game } from './game/Game';
import { Lobby } from './game/Lobby';
import { loadSave, writeSave, type SaveData } from './game/save';

type Screen = 'lobby' | 'stage';

export default function App() {
  const [save, setSave] = useState<SaveData>(loadSave);
  const [screen, setScreen] = useState<Screen>('lobby');

  useEffect(() => {
    writeSave(save);
  }, [save]);

  const changeSave = (updater: (prev: SaveData) => SaveData) => setSave((prev) => updater(prev));

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>らくがききつね(試作)</h1>
      {screen === 'lobby' ? (
        <Lobby save={save} onChange={changeSave} onStart={() => setScreen('stage')} />
      ) : (
        <>
          <Game
            frames={save.frames}
            onExit={(coinsEarned) => {
              changeSave((prev) => ({ ...prev, coins: prev.coins + coinsEarned }));
              setScreen('lobby');
            }}
          />
        </>
      )}
    </main>
  );
}
