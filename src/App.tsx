import { useState } from 'react';
import MainMenu from './pages/game/MainMenu';
import DialogScene from './pages/game/DialogScene';
import Inventory from './pages/game/Inventory';
import Gallery from './pages/game/Gallery';
import WorldMap from './pages/game/WorldMap';
import SaveLoad from './pages/game/SaveLoad';
import Icon from '@/components/ui/icon';

export type Screen = 'menu' | 'dialog' | 'inventory' | 'gallery' | 'map' | 'saveload';

export interface GameState {
  playerName: string;
  chapter: number;
  location: string;
  hp: number;
  maxHp: number;
  karma: number;
  inventory: InventoryItem[];
  unlockedArts: string[];
  achievements: string[];
  saves: SaveData[];
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface SaveData {
  slot: number;
  name: string;
  chapter: number;
  location: string;
  date: string;
  hp: number;
  karma: number;
}

const INITIAL_STATE: GameState = {
  playerName: 'Алексей',
  chapter: 1,
  location: 'Двор у гаражей',
  hp: 78,
  maxHp: 100,
  karma: 45,
  inventory: [
    { id: '1', name: 'Кассета "Кино"', emoji: '📼', description: 'Запись концерта 1990 года. Где-то на ней — послание.', rarity: 'rare' },
    { id: '2', name: 'Жвачка "Turbo"', emoji: '🟠', description: 'Вкладыш №47. Говорят, это редкость.', rarity: 'common' },
    { id: '3', name: 'Советский рубль', emoji: '💎', description: 'Последний рубль СССР. 1991 год.', rarity: 'legendary' },
    { id: '4', name: 'Карта района', emoji: '🗺', description: 'Нарисована от руки. Крестик у старого завода.', rarity: 'common' },
    { id: '5', name: 'Фотография', emoji: '📷', description: 'Размытое фото. Три человека у фонтана.', rarity: 'rare' },
    { id: '6', name: 'Значок', emoji: '⭐', description: 'Остался от прошлого поколения.', rarity: 'common' },
  ],
  unlockedArts: ['art_1', 'art_2', 'art_3'],
  achievements: ['first_step', 'collector', 'talker'],
  saves: [
    { slot: 1, name: 'Автосохранение', chapter: 1, location: 'Двор у гаражей', date: '03.04.1994', hp: 78, karma: 45 },
    { slot: 2, name: 'Ручное сохранение', chapter: 1, location: 'Рынок «Черёмушки»', date: '01.04.1994', hp: 92, karma: 30 },
    { slot: 3, name: '', chapter: 0, location: '', date: '', hp: 0, karma: 0 },
  ],
};

const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: 'menu', label: 'Меню', icon: 'Home' },
  { id: 'dialog', label: 'Диалог', icon: 'MessageSquare' },
  { id: 'inventory', label: 'Вещи', icon: 'Package' },
  { id: 'gallery', label: 'Галерея', icon: 'Image' },
  { id: 'map', label: 'Карта', icon: 'Map' },
  { id: 'saveload', label: 'Сохранить', icon: 'Save' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameState] = useState<GameState>(INITIAL_STATE);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setScreen('dialog');
  };

  const handleContinue = () => {
    setGameStarted(true);
    setScreen('dialog');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--retro-bg)', color: 'var(--retro-cream)' }}>
      <div className="crt-overlay" />
      <div className="film-grain" />
      <div className="scanline" />

      {gameStarted && (
        <nav className="nav-bar fixed top-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-pixel glow-amber" style={{ fontSize: '0.5rem' }}>
              {gameState.playerName}
            </span>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--retro-magenta)', fontSize: '0.65rem', fontFamily: 'Oswald' }}>HP</span>
              <div className="stat-bar-track" style={{ width: 60 }}>
                <div className="stat-bar-fill" style={{ width: `${(gameState.hp / gameState.maxHp) * 100}%` }} />
              </div>
              <span style={{ color: 'rgba(255,230,200,0.6)', fontSize: '0.65rem', fontFamily: 'Oswald' }}>{gameState.hp}/{gameState.maxHp}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span style={{ color: 'var(--retro-teal)', fontSize: '0.65rem', fontFamily: 'Oswald' }}>КАРМА</span>
              <span className="font-pixel glow-teal" style={{ fontSize: '0.5rem' }}>{gameState.karma}</span>
            </div>
          </div>

          <div className="hidden md:block text-center">
            <span style={{ color: 'rgba(255,230,200,0.4)', fontSize: '0.7rem', fontFamily: 'Oswald', letterSpacing: '0.15em' }}>
              ◆ {gameState.location} · ГЛ.{gameState.chapter} ◆
            </span>
          </div>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className="px-2 py-1 transition-all"
                style={{
                  color: screen === item.id ? 'var(--retro-amber)' : 'rgba(255,230,200,0.4)',
                  background: screen === item.id ? 'rgba(255,179,0,0.1)' : 'transparent',
                  border: screen === item.id ? '1px solid rgba(255,179,0,0.4)' : '1px solid transparent',
                }}
                title={item.label}
              >
                <Icon name={item.icon as any} size={14} />
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className={gameStarted ? 'pt-10' : ''}>
        {screen === 'menu' && (
          <MainMenu
            onNewGame={handleStartGame}
            onContinue={handleContinue}
            onSettings={() => {}}
            onSaveLoad={() => setScreen('saveload')}
            hasSave={gameState.saves.some(s => s.name)}
          />
        )}
        {screen === 'dialog' && (
          <DialogScene gameState={gameState} onNavigate={setScreen} />
        )}
        {screen === 'inventory' && (
          <Inventory gameState={gameState} onBack={() => setScreen('dialog')} />
        )}
        {screen === 'gallery' && (
          <Gallery gameState={gameState} onBack={() => setScreen('dialog')} />
        )}
        {screen === 'map' && (
          <WorldMap gameState={gameState} onNavigate={setScreen} onBack={() => setScreen('dialog')} />
        )}
        {screen === 'saveload' && (
          <SaveLoad
            gameState={gameState}
            onBack={() => setScreen(gameStarted ? 'dialog' : 'menu')}
            onLoad={() => { setGameStarted(true); setScreen('dialog'); }}
          />
        )}
      </div>
    </div>
  );
}
