import { useState } from 'react';
import type { GameState, SaveData } from '@/App';
import Icon from '@/components/ui/icon';

interface Props {
  gameState: GameState;
  onBack: () => void;
  onLoad: (save: SaveData) => void;
}

export default function SaveLoad({ gameState, onBack, onLoad }: Props) {
  const [tab, setTab] = useState<'save' | 'load'>('load');
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<number | null>(null);
  const [saves, setSaves] = useState<SaveData[]>(gameState.saves);

  const handleSave = (slot: number) => {
    const newSave: SaveData = {
      slot,
      name: slot === 1 ? 'Автосохранение' : 'Ручное сохранение',
      chapter: gameState.chapter,
      location: gameState.location,
      date: '03.04.1994',
      hp: gameState.hp,
      karma: gameState.karma,
    };
    setSaves(prev => prev.map(s => s.slot === slot ? newSave : s));
    setSavedMsg(slot);
    setTimeout(() => setSavedMsg(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--retro-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 nav-bar">
        <button
          onClick={onBack}
          style={{ color: 'rgba(255,230,200,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald', letterSpacing: '0.1em', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="ChevronLeft" size={16} />
          НАЗАД
        </button>
        <div className="font-pixel glow-amber" style={{ fontSize: '0.6rem' }}>СОХРАНЕНИЯ</div>
        <div style={{ width: 60 }} />
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(255,179,0,0.2)' }}>
        {[
          { id: 'load', label: 'ЗАГРУЗИТЬ', icon: 'Download' },
          { id: 'save', label: 'СОХРАНИТЬ', icon: 'Upload' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'save' | 'load')}
            style={{
              fontFamily: 'Oswald',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              padding: '12px 28px',
              color: tab === t.id ? 'var(--retro-amber)' : 'rgba(255,230,200,0.35)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--retro-amber)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <Icon name={t.icon as 'Download' | 'Upload'} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-2xl mx-auto">

        {/* Current game info (for save tab) */}
        {tab === 'save' && (
          <div
            className="retro-panel-teal retro-panel p-4 mb-6 animate-fade-in"
          >
            <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,230,200,0.35)', marginBottom: 10 }}>
              ТЕКУЩИЙ ПРОГРЕСС
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <div className="font-pixel glow-teal" style={{ fontSize: '0.9rem' }}>ГЛ.{gameState.chapter}</div>
                <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.4)', letterSpacing: '0.1em', marginTop: 2 }}>ГЛАВА</div>
              </div>
              <div>
                <div style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: '0.9rem', color: 'var(--retro-cream)' }}>{gameState.location}</div>
                <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'rgba(255,230,200,0.4)', letterSpacing: '0.1em' }}>ЛОКАЦИЯ</div>
              </div>
              <div className="flex gap-4 ml-auto">
                <div className="text-center">
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: '0.95rem', color: 'var(--retro-magenta)' }}>{gameState.hp}</div>
                  <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.4)' }}>HP</div>
                </div>
                <div className="text-center">
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: '0.95rem', color: 'var(--retro-teal)' }}>{gameState.karma}</div>
                  <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.4)' }}>КАРМА</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save slots */}
        <div className="flex flex-col gap-3 stagger-children">
          {saves.map((save, i) => {
            const isEmpty = !save.name;
            const isHovered = hoveredSlot === save.slot;
            const isSaved = savedMsg === save.slot;

            return (
              <div
                key={save.slot}
                className={`save-slot animate-fade-in ${!isEmpty ? 'occupied' : ''}`}
                onMouseEnter={() => setHoveredSlot(save.slot)}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                {isSaved && (
                  <div
                    className="absolute inset-0 flex items-center justify-center animate-fade-in"
                    style={{ background: 'rgba(13,10,0,0.9)', zIndex: 10 }}
                  >
                    <div style={{ fontFamily: 'Oswald', fontSize: '1rem', color: 'var(--retro-teal)', letterSpacing: '0.2em' }}>
                      ✓ СОХРАНЕНО
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Slot number */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        border: `1px solid ${isEmpty ? 'rgba(255,230,200,0.15)' : 'rgba(255,179,0,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Press Start 2P',
                        fontSize: '0.65rem',
                        color: isEmpty ? 'rgba(255,230,200,0.2)' : 'var(--retro-amber)',
                        flexShrink: 0,
                      }}
                    >
                      {save.slot}
                    </div>

                    {isEmpty ? (
                      <div style={{ fontFamily: 'Oswald', fontSize: '0.85rem', color: 'rgba(255,230,200,0.25)', letterSpacing: '0.1em' }}>
                        ПУСТОЙ СЛОТ
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span style={{ fontFamily: 'Oswald', fontWeight: 500, fontSize: '0.95rem', color: 'var(--retro-cream)', letterSpacing: '0.05em' }}>
                            {save.name}
                          </span>
                          <span style={{ fontFamily: 'Oswald', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--retro-teal)', border: '1px solid rgba(0,229,204,0.3)', padding: '1px 8px' }}>
                            ГЛ.{save.chapter}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: 'rgba(255,230,200,0.45)', marginTop: 3 }}>
                          {save.location} · {save.date}
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'var(--retro-magenta)' }}>HP {save.hp}</span>
                          <span style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'var(--retro-teal)' }}>КАРМА {save.karma}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 ml-2">
                    {tab === 'load' && !isEmpty && (
                      <button
                        className="retro-btn retro-btn-sm retro-btn-teal"
                        onClick={() => onLoad(save)}
                      >
                        ЗАГРУЗИТЬ
                      </button>
                    )}
                    {tab === 'save' && (
                      <button
                        className={`retro-btn retro-btn-sm ${isEmpty ? '' : 'retro-btn-magenta'}`}
                        onClick={() => handleSave(save.slot)}
                      >
                        {isEmpty ? 'ЗАПИСАТЬ' : 'ПЕРЕЗАПИСАТЬ'}
                      </button>
                    )}
                    {!isEmpty && isHovered && (
                      <button
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,68,68,0.3)',
                          color: 'rgba(255,68,68,0.5)',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontFamily: 'Oswald',
                          fontSize: '0.65rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderColor = '#ff4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,68,68,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.3)'; }}
                        title="Удалить сохранение"
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <div
          style={{
            marginTop: 24,
            fontFamily: 'Caveat',
            fontSize: '0.95rem',
            color: 'rgba(255,230,200,0.25)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {tab === 'save'
            ? 'Игра сохраняется автоматически при переходе между главами.'
            : 'Загрузка вернёт тебя к состоянию в момент сохранения.'}
        </div>
      </div>
    </div>
  );
}
