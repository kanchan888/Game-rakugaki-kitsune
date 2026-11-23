import { useEffect, useState } from 'react';
import { Game, type ExitResult } from './game/Game';
import { Lobby } from './game/Lobby';
import { loadSave, writeSave, type SaveData } from './game/save';
import { STAGES } from './game/stages';

type Screen = 'lobby' | 'stage';

export default function App() {
  const [save, setSave] = useState<SaveData>(loadSave);
  const [screen, setScreen] = useState<Screen>('lobby');
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    writeSave(save);
  }, [save]);

  const changeSave = (updater: (prev: SaveData) => SaveData) => setSave((prev) => updater(prev));

  const finishStage = ({ coins, cleared }: ExitResult) => {
    changeSave((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      // クリアしたら、次のステージが解放される
      clearedStage: cleared ? Math.max(prev.clearedStage, stageIndex + 1) : prev.clearedStage,
    }));
    setScreen('lobby');
  };

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>らくがききつね(試作)</h1>
      {screen === 'lobby' ? (
        <Lobby
          save={save}
          onChange={changeSave}
          onStart={(i) => {
            setStageIndex(i);
            setScreen('stage');
          }}
        />
      ) : (
        <Game stage={STAGES[stageIndex]} frames={save.frames} onExit={finishStage} />
      )}
    </main>
  );
}
