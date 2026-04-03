import { useState, useEffect } from 'react';
import type { GameState, InventoryItem } from '@/App';
import Icon from '@/components/ui/icon';
import { useSound } from '@/hooks/useSound';

interface Props {
  gameState: GameState;
  onBack: () => void;
}

const RARITY_LABEL: Record<string, string> = {
  common: 'ОБЫЧНЫЙ',
  rare: 'РЕДКИЙ',
  legendary: 'ЛЕГЕНДАРНЫЙ',
};

const RARITY_COLOR: Record<string, string> = {
  common: 'rgba(255,230,200,0.5)',
  rare: 'var(--retro-teal)',
  legendary: 'var(--retro-amber)',
};

// Extra items for empty slots
const EMPTY_SLOTS = 6;

export default function Inventory({ gameState, onBack }: Props) {
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'legendary'>('all');
  const { play } = useSound();

  useEffect(() => { play('inventoryOpen'); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = gameState.inventory.filter(
    item => filter === 'all' || item.rarity === filter
  );

  const rarityCount = {
    common: gameState.inventory.filter(i => i.rarity === 'common').length,
    rare: gameState.inventory.filter(i => i.rarity === 'rare').length,
    legendary: gameState.inventory.filter(i => i.rarity === 'legendary').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--retro-bg)', padding: '0 0 24px' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 nav-bar"
        style={{ borderBottom: '1px solid rgba(255,179,0,0.2)' }}
      >
        <button onClick={onBack} className="flex items-center gap-2" style={{ color: 'rgba(255,230,200,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
          <Icon name="ChevronLeft" size={16} />
          НАЗАД
        </button>
        <div className="font-pixel glow-amber" style={{ fontSize: '0.6rem' }}>ИНВЕНТАРЬ</div>
        <div style={{ fontFamily: 'Oswald', fontSize: '0.8rem', color: 'rgba(255,230,200,0.4)' }}>
          {gameState.inventory.length} / {gameState.inventory.length + EMPTY_SLOTS}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 max-w-4xl mx-auto">
        {/* Left: grid */}
        <div className="flex-1">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {(['all', 'common', 'rare', 'legendary'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: 'Oswald',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  padding: '4px 12px',
                  border: `1px solid ${filter === f ? RARITY_COLOR[f] || 'var(--retro-amber)' : 'rgba(255,230,200,0.2)'}`,
                  color: filter === f ? (RARITY_COLOR[f] || 'var(--retro-amber)') : 'rgba(255,230,200,0.4)',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'all' ? `ВСЕ (${gameState.inventory.length})` : `${RARITY_LABEL[f]} (${rarityCount[f]})`}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div
            className="retro-panel p-3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 72px)', gap: 6 }}
          >
            {filtered.map(item => (
              <div
                key={item.id}
                className={`inv-slot ${selected?.id === item.id ? 'selected' : ''}`}
                onClick={() => { play('itemPickup'); setSelected(selected?.id === item.id ? null : item); }}
                title={item.name}
              >
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{item.emoji}</span>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: RARITY_COLOR[item.rarity],
                    boxShadow: `0 0 4px ${RARITY_COLOR[item.rarity]}`,
                  }}
                />
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: EMPTY_SLOTS }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="inv-slot"
                style={{ opacity: 0.2, cursor: 'default' }}
              />
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-4">
            {Object.entries(rarityCount).map(([rarity, count]) => (
              <div key={rarity} className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: RARITY_COLOR[rarity] }} />
                <span style={{ fontFamily: 'Oswald', fontSize: '0.7rem', color: 'rgba(255,230,200,0.4)' }}>
                  {RARITY_LABEL[rarity]}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: item detail */}
        <div className="w-full md:w-64">
          {selected ? (
            <div className="retro-panel p-5 animate-fade-in" style={{ borderColor: RARITY_COLOR[selected.rarity] }}>
              <div className="text-center mb-4">
                <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: 8 }}>{selected.emoji}</div>
                <div
                  style={{
                    fontFamily: 'Oswald',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: RARITY_COLOR[selected.rarity],
                    letterSpacing: '0.05em',
                    textShadow: `0 0 10px ${RARITY_COLOR[selected.rarity]}66`,
                    marginBottom: 4,
                  }}
                >
                  {selected.name}
                </div>
                <div
                  style={{
                    fontFamily: 'Oswald',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    color: RARITY_COLOR[selected.rarity],
                    opacity: 0.7,
                    border: `1px solid ${RARITY_COLOR[selected.rarity]}44`,
                    display: 'inline-block',
                    padding: '2px 10px',
                  }}
                >
                  {RARITY_LABEL[selected.rarity]}
                </div>
              </div>

              <div className="retro-hr" />

              <p
                style={{
                  fontFamily: 'Caveat',
                  fontSize: '1.05rem',
                  color: 'rgba(255,230,200,0.8)',
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {selected.description}
              </p>

              <div className="flex gap-2">
                <button
                  className="retro-btn retro-btn-sm flex-1"
                  style={{ textAlign: 'center' }}
                >
                  ПРИМЕНИТЬ
                </button>
                <button
                  className="retro-btn retro-btn-sm retro-btn-magenta"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="retro-panel p-5 flex flex-col items-center justify-center text-center"
              style={{ minHeight: 220, borderStyle: 'dashed' }}
            >
              <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: 12 }}>📦</div>
              <div
                style={{
                  fontFamily: 'Oswald',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,230,200,0.3)',
                }}
              >
                ВЫБЕРИТЕ ПРЕДМЕТ
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="retro-panel mt-3 p-4">
            <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,230,200,0.35)', marginBottom: 10 }}>
              СОСТОЯНИЕ ПЕРСОНАЖА
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'ЗДОРОВЬЕ', value: gameState.hp, max: gameState.maxHp, color: 'var(--retro-magenta)' },
                { label: 'КАРМА', value: gameState.karma, max: 100, color: 'var(--retro-teal)' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: stat.color }}>
                      {stat.label}
                    </span>
                    <span style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'rgba(255,230,200,0.5)' }}>
                      {stat.value}/{stat.max}
                    </span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${(stat.value / stat.max) * 100}%`,
                        background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}