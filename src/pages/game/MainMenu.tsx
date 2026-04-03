import { useState, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onSaveLoad: () => void;
  hasSave: boolean;
}

interface Character {
  id: string;
  emoji: string;
  name: string;
  role: string;
  x: number;
  speed: number;
  direction: 1 | -1;
  bobOffset: number;
  size: number;
  zIndex: number;
  color: string;
}

const CHARACTERS: Character[] = [
  { id: 'bandit1', emoji: '🕶', name: 'Бандит', role: 'Солнцевская ОПГ', x: 10, speed: 0.4, direction: 1, bobOffset: 0, size: 3.5, zIndex: 2, color: '#ff2d78' },
  { id: 'cop', emoji: '👮', name: 'Участковый', role: 'Районный отдел', x: 25, speed: 0.25, direction: -1, bobOffset: 1.2, size: 3, zIndex: 2, color: '#ffb300' },
  { id: 'yeltsin', emoji: '🎩', name: 'Президент', role: '1991–1999', x: 45, speed: 0.15, direction: 1, bobOffset: 0.7, size: 4, zIndex: 3, color: '#ffb300' },
  { id: 'gorbachev', emoji: '🌟', name: 'Горбачёв', role: 'Генсек · ГКЧП', x: 62, speed: 0.2, direction: -1, bobOffset: 2, size: 3.5, zIndex: 2, color: '#00e5cc' },
  { id: 'bandit2', emoji: '⛓', name: 'Рэкетир', role: 'Люберецкая ОПГ', x: 78, speed: 0.45, direction: 1, bobOffset: 0.4, size: 3, zIndex: 2, color: '#ff2d78' },
  { id: 'journalist', emoji: '📰', name: 'Журналист', role: '«Новая газета»', x: 88, speed: 0.3, direction: -1, bobOffset: 1.8, size: 2.8, zIndex: 2, color: '#00e5cc' },
];

const MENU_ITEMS = [
  { id: 'new', label: 'НОВАЯ ИГРА' },
  { id: 'continue', label: 'ПРОДОЛЖИТЬ' },
  { id: 'saves', label: 'СОХРАНЕНИЯ' },
  { id: 'settings', label: 'НАСТРОЙКИ' },
];

const TICKER_ITEMS = [
  '✦ ОКТЯБРЬ 1993 · РАССТРЕЛ ПАРЛАМЕНТА',
  '✦ ВАУЧЕРНАЯ ПРИВАТИЗАЦИЯ В РАЗГАРЕ',
  '✦ КУРС ДОЛЛАРА: 1247 РУБЛЕЙ',
  '✦ ЛЮБЕРЕЦКАЯ ОПГ ДЕЛИТ РЫНКИ С СОЛНЦЕВСКОЙ',
  '✦ ГОРБАЧЁВ ПОДПИСЫВАЕТ БЕЛОВЕЖСКИЕ СОГЛАШЕНИЯ',
  '✦ МММ ОБЕЩАЕТ 1000% ГОДОВЫХ',
  '✦ ЕЛЬЦИН ВЫСТУПАЕТ С ОБРАЩЕНИЕМ К НАЦИИ',
  '✦ ГКЧП: ПРОВАЛ ПУТЧА · АВГУСТ 1991',
];

export default function MainMenu({ onNewGame, onContinue, onSaveLoad, hasSave }: Props) {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [chars, setChars] = useState<Character[]>(CHARACTERS);
  const [tickerPos, setTickerPos] = useState(0);
  const [time, setTime] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const { play, toggle } = useSound();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Animate characters
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
      setChars(prev =>
        prev.map(c => {
          let nx = c.x + c.speed * c.direction * 0.5;
          let dir = c.direction;
          if (nx > 95) { nx = 95; dir = -1; }
          if (nx < 2) { nx = 2; dir = 1; }
          return { ...c, x: nx, direction: dir };
        })
      );
      setTickerPos(prev => prev - 1.2);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (id: string) => {
    play('menuSelect');
    if (id === 'new') onNewGame();
    if (id === 'continue') onContinue();
    if (id === 'saves') onSaveLoad();
  };

  const handleToggleSound = () => {
    const state = toggle();
    setSoundOn(state);
  };

  // Ticker wrap
  const tickerText = TICKER_ITEMS.join('          ');
  const tickerWidth = tickerText.length * 9; // approx px

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ background: 'var(--retro-bg)' }}>
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/495c48ab-527b-463e-b198-c049037afe6b.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'sepia(0.7) brightness(0.18) saturate(0.8)',
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.92) 100%)' }} />

      {/* Top ticker */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          background: 'rgba(255,45,120,0.12)',
          borderBottom: '1px solid rgba(255,45,120,0.4)',
          height: 28,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            fontFamily: 'Oswald',
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: 'var(--retro-magenta)',
            transform: `translateX(${tickerPos % (tickerWidth + window.innerWidth)}px)`,
            willChange: 'transform',
          }}
        >
          {tickerText}{'          '}{tickerText}
        </div>
      </div>

      {/* === ANIMATED CHARACTERS STRIP === */}
      <div
        className="relative z-10"
        style={{ height: 130, borderBottom: '1px solid rgba(255,179,0,0.15)', overflow: 'hidden' }}
      >
        {/* Ground line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,179,0,0.3), transparent)' }} />

        {/* Street lamp silhouette left */}
        <div style={{ position: 'absolute', left: '5%', bottom: 0, width: 4, height: 90, background: 'rgba(255,179,0,0.15)' }} />
        <div style={{ position: 'absolute', left: '4.5%', bottom: 86, width: 24, height: 3, background: 'rgba(255,179,0,0.15)' }} />

        {/* Street lamp silhouette right */}
        <div style={{ position: 'absolute', right: '8%', bottom: 0, width: 4, height: 80, background: 'rgba(255,179,0,0.12)' }} />
        <div style={{ position: 'absolute', right: '7.5%', bottom: 77, width: 24, height: 3, background: 'rgba(255,179,0,0.12)' }} />

        {/* Building silhouettes */}
        {[12, 30, 55, 72, 85].map((left, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${left}%`,
              width: `${4 + (i % 3) * 3}%`,
              height: `${40 + (i % 4) * 20}px`,
              background: 'rgba(13,10,0,0.9)',
              border: '1px solid rgba(255,179,0,0.08)',
            }}
          >
            {/* windows */}
            {Array.from({ length: Math.ceil((40 + (i % 4) * 20) / 12) }).map((_, wi) => (
              <div key={wi} style={{ position: 'absolute', top: wi * 12 + 4, left: '20%', width: '60%', height: 5, background: Math.random() > 0.5 ? 'rgba(255,179,0,0.2)' : 'transparent' }} />
            ))}
          </div>
        ))}

        {/* Characters */}
        {chars.map(c => {
          const bob = Math.sin((time * 0.12) + c.bobOffset) * 3;
          const sway = Math.sin((time * 0.08) + c.bobOffset) * 1.5;
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: `${c.x}%`,
                bottom: 8 + bob,
                transform: `translateX(-50%) rotate(${sway}deg) scaleX(c.direction === -1 ? -1 : 1)`,
                fontSize: `${c.size}rem`,
                zIndex: c.zIndex,
                filter: `drop-shadow(0 0 8px ${c.color}66)`,
                transition: 'none',
                lineHeight: 1,
                cursor: 'default',
                userSelect: 'none',
              }}
              title={`${c.name} · ${c.role}`}
            >
              {c.emoji}
              {/* Name tag on hover area */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Oswald',
                  fontSize: '0.5rem',
                  color: c.color,
                  letterSpacing: '0.1em',
                  opacity: 0.7,
                  marginBottom: 2,
                  textShadow: `0 0 6px ${c.color}`,
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}

        {/* Atmosphere overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,10,0,0.5), transparent 50%, rgba(13,10,0,0.3))' }} />
      </div>

      {/* Main menu content */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative z-10"
        style={{ transition: 'all 0.6s', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <div style={{ fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.5em', color: 'rgba(255,230,200,0.35)', marginBottom: 12, textTransform: 'uppercase' }}>
            Интерактивная история
          </div>

          <div
            className="font-pixel glow-amber"
            style={{ fontSize: 'clamp(1.3rem, 5vw, 2.2rem)', lineHeight: 1.3, letterSpacing: '0.04em', marginBottom: 6 }}
          >
            СМУТНОЕ ВРЕМЯ
          </div>

          <div
            className="font-pixel glow-magenta"
            style={{ fontSize: 'clamp(0.5rem, 2vw, 0.85rem)', letterSpacing: '0.3em' }}
          >
            1991 — 1999
          </div>

          <div style={{ marginTop: 14, fontFamily: 'Caveat', fontSize: '1.05rem', color: 'rgba(255,230,200,0.38)', letterSpacing: '0.04em', maxWidth: 380 }}>
            «Страна делится. Улицы — тоже.»
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,0,0.5), transparent)', marginBottom: 36 }} />

        {/* Menu */}
        <div className="flex flex-col items-center gap-0.5 stagger-children">
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
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
                  letterSpacing: '0.28em',
                  padding: '11px 56px',
                  color: isDisabled ? 'rgba(255,230,200,0.18)' : isActive ? 'var(--retro-amber)' : 'rgba(255,230,200,0.62)',
                  background: isActive && !isDisabled ? 'rgba(255,179,0,0.07)' : 'transparent',
                  border: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.14s',
                  textShadow: isActive && !isDisabled ? '0 0 25px rgba(255,179,0,0.7)' : 'none',
                  position: 'relative',
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={() => { if (!isDisabled) { setSelected(i); play('menuMove'); } }}
                onClick={() => !isDisabled && handleSelect(item.id)}
              >
                {isActive && !isDisabled && (
                  <span style={{ position: 'absolute', left: 20, color: 'var(--retro-amber)', fontSize: '0.8rem' }}>▶</span>
                )}
                {item.label}
                {item.id === 'continue' && !hasSave && (
                  <span style={{ fontSize: '0.55rem', color: 'rgba(255,230,200,0.2)', marginLeft: 10, fontWeight: 400 }}>НЕТ СОХРАНЕНИЙ</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          style={{
            marginTop: 32,
            fontFamily: 'Oswald',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: soundOn ? 'rgba(0,229,204,0.6)' : 'rgba(255,230,200,0.25)',
            background: 'none',
            border: `1px solid ${soundOn ? 'rgba(0,229,204,0.25)' : 'rgba(255,230,200,0.1)'}`,
            padding: '5px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {soundOn ? '🔊 ЗВУК ВКЛ' : '🔇 ЗВУК ВЫКЛ'}
        </button>

        {/* Version */}
        <div style={{ marginTop: 20, fontFamily: 'Oswald', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(255,230,200,0.18)' }}>
          VER 1.0 · МОСКВА, 1993
        </div>
      </div>

      {/* Bottom ticker */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          background: 'rgba(255,179,0,0.06)',
          borderTop: '1px solid rgba(255,179,0,0.18)',
          height: 26,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            fontFamily: 'Oswald',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,179,0,0.5)',
            transform: `translateX(${(-tickerPos * 0.7) % (tickerWidth + window.innerWidth)}px)`,
            willChange: 'transform',
          }}
        >
          {tickerText}{'          '}{tickerText}
        </div>
      </div>
    </div>
  );
}
