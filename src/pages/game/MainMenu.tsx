import { useState, useEffect } from 'react';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onSaveLoad: () => void;
  hasSave: boolean;
}

const MENU_ITEMS = [
  { id: 'new', label: 'НОВАЯ ИГРА' },
  { id: 'continue', label: 'ПРОДОЛЖИТЬ' },
  { id: 'saves', label: 'СОХРАНЕНИЯ' },
  { id: 'settings', label: 'НАСТРОЙКИ' },
];

export default function MainMenu({ onNewGame, onContinue, onSaveLoad, hasSave }: Props) {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (id: string) => {
    if (id === 'new') onNewGame();
    if (id === 'continue') onContinue();
    if (id === 'saves') onSaveLoad();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--retro-bg)' }}
    >
      {/* Background art */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/e39579b5-bd31-408c-81e1-55d0c5c162d3.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'sepia(0.8) saturate(0.5)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6" style={{ color: 'rgba(255,179,0,0.3)', fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
        ◤ НОСТАЛЬГИЯ
      </div>
      <div className="absolute top-6 right-6" style={{ color: 'rgba(255,179,0,0.3)', fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
        1990–2000 ◥
      </div>
      <div className="absolute bottom-6 left-6" style={{ color: 'rgba(255,179,0,0.3)', fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
        ◣ VER 1.0
      </div>
      <div className="absolute bottom-6 right-6" style={{ color: 'rgba(255,179,0,0.3)', fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
        RPG ◢
      </div>

      {/* Horizontal lines */}
      <div
        className="absolute"
        style={{
          top: '15%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,179,0,0.3), transparent)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '15%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,179,0,0.3), transparent)',
        }}
      />

      <div className={`relative z-10 flex flex-col items-center gap-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Title block */}
        <div className="text-center">
          <div
            className="font-pixel glow-amber mb-3"
            style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', lineHeight: 1.4, letterSpacing: '0.05em' }}
          >
            НОСТАЛЬГИЯ
          </div>
          <div
            className="font-pixel"
            style={{ fontSize: 'clamp(0.5rem, 2vw, 0.8rem)', color: 'var(--retro-teal)', letterSpacing: '0.3em' }}
          >
            '90
          </div>
          <div
            className="mt-4"
            style={{
              fontFamily: 'Oswald',
              fontSize: '0.8rem',
              letterSpacing: '0.4em',
              color: 'rgba(255,230,200,0.4)',
              textTransform: 'uppercase',
            }}
          >
            Текстовая RPG · Интерактивное кино
          </div>
        </div>

        {/* Separator */}
        <div className="w-48" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--retro-amber-dim), transparent)' }} />

        {/* Menu items */}
        <div className="flex flex-col items-center gap-1 stagger-children">
          {MENU_ITEMS.map((item, i) => {
            const isDisabled = item.id === 'continue' && !hasSave;
            const isActive = selected === i;
            return (
              <button
                key={item.id}
                className="animate-fade-in-up"
                style={{
                  fontFamily: 'Oswald',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  letterSpacing: '0.25em',
                  padding: '10px 48px',
                  color: isDisabled
                    ? 'rgba(255,230,200,0.2)'
                    : isActive
                      ? 'var(--retro-amber)'
                      : 'rgba(255,230,200,0.7)',
                  background: isActive ? 'rgba(255,179,0,0.08)' : 'transparent',
                  border: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  textShadow: isActive ? '0 0 20px rgba(255,179,0,0.6)' : 'none',
                  position: 'relative',
                }}
                onMouseEnter={() => !isDisabled && setSelected(i)}
                onClick={() => !isDisabled && handleSelect(item.id)}
              >
                {isActive && !isDisabled && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 16,
                      color: 'var(--retro-amber)',
                    }}
                  >▶</span>
                )}
                {item.label}
                {item.id === 'continue' && !hasSave && (
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,230,200,0.2)', marginLeft: 8 }}>НЕТ СОХРАНЕНИЙ</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom text */}
        <div
          style={{
            fontFamily: 'Caveat',
            fontSize: '1rem',
            color: 'rgba(255,230,200,0.3)',
            letterSpacing: '0.05em',
          }}
        >
          «Всё было не так плохо, как вспоминается. И не так хорошо.»
        </div>
      </div>
    </div>
  );
}
