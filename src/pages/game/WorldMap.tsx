import { useState } from 'react';
import type { GameState, Screen } from '@/App';
import Icon from '@/components/ui/icon';

interface Props {
  gameState: GameState;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

interface Location {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  x: number;
  y: number;
  status: 'current' | 'visited' | 'available' | 'locked';
  chapter: number;
  connections: string[];
}

const LOCATIONS: Location[] = [
  { id: 'yard', name: 'Двор у гаражей', desc: 'Место начала. Здесь живёт дядя Коля и хранится гараж Петровича.', emoji: '🏚', x: 30, y: 55, status: 'current', chapter: 1, connections: ['garage', 'market'] },
  { id: 'garage', name: 'Гараж №12', desc: 'Взломан этой ночью. Следы ведут куда-то дальше.', emoji: '🔧', x: 22, y: 38, status: 'visited', chapter: 1, connections: ['yard', 'factory'] },
  { id: 'market', name: 'Рынок «Черёмушки»', desc: 'Шумный рынок 90-х. Кто-то здесь знает о шкатулке.', emoji: '🏪', x: 52, y: 60, status: 'visited', chapter: 1, connections: ['yard', 'station', 'school'] },
  { id: 'school', name: 'Старая школа', desc: 'Закрытая с 92-го. Говорят, там хранятся архивы.', emoji: '🏫', x: 65, y: 35, status: 'available', chapter: 2, connections: ['market', 'factory'] },
  { id: 'station', name: 'Ж/Д Станция', desc: 'Отсюда уехал отец в 91-м. Кассир кое-что помнит.', emoji: '🚉', x: 75, y: 65, status: 'available', chapter: 2, connections: ['market'] },
  { id: 'factory', name: 'Старый завод', desc: 'Заброшен с 89-го. На карте — крестик именно здесь.', emoji: '🏭', x: 40, y: 22, status: 'locked', chapter: 3, connections: ['garage', 'school'] },
  { id: 'forest', name: 'Городской лес', desc: 'На краю города. Место встречи тех, кто не хочет, чтобы их нашли.', emoji: '🌲', x: 82, y: 30, status: 'locked', chapter: 3, connections: ['school', 'station'] },
];

const STATUS_COLOR: Record<string, string> = {
  current: 'var(--retro-teal)',
  visited: 'var(--retro-amber-dim)',
  available: 'var(--retro-amber)',
  locked: 'rgba(255,230,200,0.2)',
};

const STATUS_LABEL: Record<string, string> = {
  current: 'ТЕКУЩЕЕ МЕСТО',
  visited: 'ПОСЕЩЕНО',
  available: 'ДОСТУПНО',
  locked: 'ЗАБЛОКИРОВАНО',
};

export default function WorldMap({ gameState, onNavigate, onBack }: Props) {
  const [selected, setSelected] = useState<Location | null>(
    LOCATIONS.find(l => l.status === 'current') || null
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--retro-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 nav-bar">
        <button
          onClick={onBack}
          style={{ color: 'rgba(255,230,200,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', letterSpacing: '0.1em', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="ChevronLeft" size={16} />
          НАЗАД
        </button>
        <div className="font-pixel glow-amber" style={{ fontSize: '0.6rem' }}>КАРТА МИРА</div>
        <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: 'rgba(255,230,200,0.4)' }}>
          ОСЕНЬ 1994
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 flex-1 max-w-5xl mx-auto w-full">
        {/* Map area */}
        <div
          className="flex-1 retro-panel relative"
          style={{ minHeight: 400, overflow: 'hidden' }}
        >
          {/* Map background texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,179,0,0.3) 30px, rgba(255,179,0,0.3) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,179,0,0.3) 30px, rgba(255,179,0,0.3) 31px)',
            }}
          />

          {/* Map title */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              fontFamily: 'Caveat',
              fontSize: '0.9rem',
              color: 'rgba(255,179,0,0.3)',
              letterSpacing: '0.05em',
            }}
          >
            Схема района · нарисована от руки
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {LOCATIONS.flatMap(loc =>
              loc.connections.map(connId => {
                const conn = LOCATIONS.find(l => l.id === connId);
                if (!conn || conn.id < loc.id) return null;
                const isActive =
                  (selected?.id === loc.id || selected?.id === connId) ||
                  (hoveredId === loc.id || hoveredId === connId);
                return (
                  <line
                    key={`${loc.id}-${connId}`}
                    x1={`${loc.x}%`}
                    y1={`${loc.y}%`}
                    x2={`${conn.x}%`}
                    y2={`${conn.y}%`}
                    stroke={isActive ? 'rgba(255,179,0,0.5)' : 'rgba(255,179,0,0.12)'}
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeDasharray="4 4"
                  />
                );
              }).filter(Boolean)
            )}
          </svg>

          {/* Location dots */}
          {LOCATIONS.map(loc => {
            const color = STATUS_COLOR[loc.status];
            const isSelected = selected?.id === loc.id;
            const isHovered = hoveredId === loc.id;
            return (
              <div
                key={loc.id}
                style={{
                  position: 'absolute',
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: loc.status === 'locked' ? 'not-allowed' : 'pointer',
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={() => loc.status !== 'locked' && setSelected(loc)}
                onMouseEnter={() => setHoveredId(loc.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Outer ring for current/selected */}
                {(loc.status === 'current' || isSelected) && (
                  <div
                    style={{
                      position: 'absolute',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: `1px solid ${color}`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      animation: 'pulse-glow 2s infinite',
                      opacity: 0.5,
                    }}
                  />
                )}

                <div
                  style={{
                    width: isSelected || isHovered ? 18 : 14,
                    height: isSelected || isHovered ? 18 : 14,
                    borderRadius: '50%',
                    background: loc.status === 'locked' ? 'rgba(255,230,200,0.1)' : color,
                    border: `2px solid ${isSelected ? 'white' : color}`,
                    boxShadow: loc.status !== 'locked' ? `0 0 ${isSelected ? 15 : 8}px ${color}` : 'none',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.5rem',
                  }}
                />

                {/* Label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                    fontFamily: 'Oswald',
                    fontSize: '0.6rem',
                    letterSpacing: '0.05em',
                    color: isSelected ? color : 'rgba(255,230,200,0.5)',
                    textShadow: isSelected ? `0 0 8px ${color}` : 'none',
                    transition: 'all 0.15s',
                    pointerEvents: 'none',
                  }}
                >
                  {loc.emoji} {loc.name}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'rgba(13,10,0,0.8)',
              padding: '8px 12px',
              border: '1px solid rgba(255,179,0,0.15)',
            }}
          >
            {Object.entries(STATUS_LABEL).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[status] }} />
                <span style={{ fontFamily: 'Oswald', fontSize: '0.55rem', color: 'rgba(255,230,200,0.5)', letterSpacing: '0.1em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location info panel */}
        <div className="w-full md:w-60 flex flex-col gap-3">
          {selected ? (
            <div className="retro-panel p-4 animate-fade-in" style={{ borderColor: STATUS_COLOR[selected.status] }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{selected.emoji}</div>
              <div
                style={{
                  fontFamily: 'Oswald',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: STATUS_COLOR[selected.status],
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  textShadow: `0 0 8px ${STATUS_COLOR[selected.status]}66`,
                }}
              >
                {selected.name}
              </div>
              <div
                style={{
                  fontFamily: 'Oswald',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: STATUS_COLOR[selected.status],
                  opacity: 0.7,
                  border: `1px solid ${STATUS_COLOR[selected.status]}33`,
                  display: 'inline-block',
                  padding: '2px 8px',
                  marginBottom: 12,
                }}
              >
                {STATUS_LABEL[selected.status]}
              </div>
              <p style={{ fontFamily: 'Caveat', fontSize: '1rem', color: 'rgba(255,230,200,0.75)', lineHeight: 1.6, marginBottom: 16 }}>
                {selected.desc}
              </p>
              <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.35)', letterSpacing: '0.15em', marginBottom: 12 }}>
                ОТКРЫВАЕТСЯ: ГЛАВА {selected.chapter}
              </div>
              {selected.status !== 'locked' && selected.status !== 'current' && (
                <button className="retro-btn retro-btn-sm w-full" style={{ textAlign: 'center' }}
                  onClick={() => onNavigate('dialog')}
                >
                  ПЕРЕЙТИ
                </button>
              )}
              {selected.status === 'current' && (
                <button className="retro-btn retro-btn-sm retro-btn-teal w-full" style={{ textAlign: 'center' }}
                  onClick={() => onNavigate('dialog')}
                >
                  ВЫ ЗДЕСЬ
                </button>
              )}
            </div>
          ) : (
            <div className="retro-panel p-4 flex items-center justify-center text-center" style={{ minHeight: 180, borderStyle: 'dashed' }}>
              <div>
                <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}>🗺</div>
                <div style={{ fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,230,200,0.3)' }}>
                  ВЫБЕРИТЕ ЛОКАЦИЮ
                </div>
              </div>
            </div>
          )}

          {/* Locations list */}
          <div className="retro-panel p-3">
            <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,230,200,0.35)', marginBottom: 8 }}>
              ВСЕ ЛОКАЦИИ
            </div>
            <div className="flex flex-col gap-1">
              {LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => loc.status !== 'locked' && setSelected(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    background: selected?.id === loc.id ? 'rgba(255,179,0,0.08)' : 'transparent',
                    border: 'none',
                    cursor: loc.status === 'locked' ? 'not-allowed' : 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    opacity: loc.status === 'locked' ? 0.35 : 1,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[loc.status], flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: selected?.id === loc.id ? 'var(--retro-amber)' : 'rgba(255,230,200,0.6)', letterSpacing: '0.03em' }}>
                    {loc.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
