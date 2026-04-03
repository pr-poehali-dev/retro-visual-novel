import { useState } from 'react';
import type { GameState } from '@/App';
import Icon from '@/components/ui/icon';

interface Props {
  gameState: GameState;
  onBack: () => void;
}

interface ArtPiece {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  unlocked: boolean;
  chapter: number;
  achievementId?: string;
}

const ARTS: ArtPiece[] = [
  { id: 'art_1', title: 'Двор детства', subtitle: 'Место, где всё началось', emoji: '🏚', unlocked: true, chapter: 1 },
  { id: 'art_2', title: 'Дядя Коля', subtitle: 'Свидетель эпохи', emoji: '👴', unlocked: true, chapter: 1 },
  { id: 'art_3', title: 'Гараж №12', subtitle: 'Хранитель тайн', emoji: '🚗', unlocked: true, chapter: 1 },
  { id: 'art_4', title: 'Рынок Черёмушки', subtitle: 'Пройдёт в главе 2', emoji: '🏪', unlocked: false, chapter: 2 },
  { id: 'art_5', title: 'Петрович', subtitle: 'Мастер и хранитель', emoji: '🧔', unlocked: false, chapter: 1 },
  { id: 'art_6', title: 'Шкатулка отца', subtitle: 'Ключ ко всему', emoji: '📦', unlocked: false, chapter: 2 },
  { id: 'art_7', title: 'Ночная улица', subtitle: 'Осень 94-го', emoji: '🌃', unlocked: false, chapter: 3 },
  { id: 'art_8', title: 'Поезд', subtitle: 'Конец пути', emoji: '🚂', unlocked: false, chapter: 3 },
];

const ACHIEVEMENTS = [
  { id: 'first_step', title: 'Первый шаг', desc: 'Начать игру', emoji: '👣', unlocked: true },
  { id: 'collector', title: 'Коллекционер', desc: 'Собрать 5 предметов', emoji: '📦', unlocked: true },
  { id: 'talker', title: 'Собеседник', desc: 'Выбрать 10 реплик', emoji: '💬', unlocked: true },
  { id: 'karma_hero', title: 'Праведник', desc: 'Набрать 80+ кармы', emoji: '✨', unlocked: false },
  { id: 'completionist', title: 'Перфекционист', desc: 'Открыть все арты', emoji: '🏆', unlocked: false },
  { id: 'truth_seeker', title: 'Искатель истины', desc: 'Найти все улики', emoji: '🔍', unlocked: false },
];

export default function Gallery({ gameState, onBack }: Props) {
  const [tab, setTab] = useState<'arts' | 'achievements'>('arts');
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);

  const unlockedCount = ARTS.filter(a => gameState.unlockedArts.includes(a.id)).length;
  const achievedCount = ACHIEVEMENTS.filter(a => gameState.achievements.includes(a.id)).length;

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
        <div className="font-pixel glow-amber" style={{ fontSize: '0.6rem' }}>ГАЛЕРЕЯ</div>
        <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: 'rgba(255,230,200,0.4)' }}>
          {unlockedCount}/{ARTS.length} артов
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'rgba(255,179,0,0.2)' }}>
        {[
          { id: 'arts', label: `АРТВОРК (${unlockedCount}/${ARTS.length})` },
          { id: 'achievements', label: `ДОСТИЖЕНИЯ (${achievedCount}/${ACHIEVEMENTS.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'arts' | 'achievements')}
            style={{
              fontFamily: 'Oswald',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              padding: '12px 24px',
              color: tab === t.id ? 'var(--retro-amber)' : 'rgba(255,230,200,0.35)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--retro-amber)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {tab === 'arts' && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Art grid */}
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, flex: 1 }}
            >
              {ARTS.map((art, i) => {
                const isUnlocked = gameState.unlockedArts.includes(art.id);
                return (
                  <div
                    key={art.id}
                    className={`achievement-card animate-fade-in ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={{ animationDelay: `${i * 0.04}s`, cursor: isUnlocked ? 'pointer' : 'default', aspectRatio: '1' }}
                    onClick={() => isUnlocked && setSelectedArt(art)}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '80%',
                        background: isUnlocked
                          ? 'linear-gradient(135deg, rgba(255,179,0,0.05), rgba(0,229,204,0.05))'
                          : 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isUnlocked ? '3rem' : '2rem',
                        marginBottom: 8,
                        border: `1px solid ${isUnlocked ? 'rgba(255,179,0,0.15)' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      {isUnlocked ? art.emoji : '🔒'}
                    </div>
                    <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: isUnlocked ? 'var(--retro-cream)' : 'rgba(255,230,200,0.3)', letterSpacing: '0.05em' }}>
                      {isUnlocked ? art.title : `ГЛ. ${art.chapter}`}
                    </div>
                    {isUnlocked && (
                      <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.4)', marginTop: 2 }}>
                        {art.subtitle}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected art preview */}
            {selectedArt && (
              <div
                className="w-full md:w-56 retro-panel p-4 animate-fade-in"
                style={{ height: 'fit-content' }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: 'linear-gradient(135deg, rgba(255,179,0,0.08), rgba(0,229,204,0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    marginBottom: 12,
                    border: '1px solid rgba(255,179,0,0.2)',
                  }}
                >
                  {selectedArt.emoji}
                </div>
                <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: '1rem', color: 'var(--retro-amber)', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {selectedArt.title}
                </div>
                <div style={{ fontFamily: 'Caveat', fontSize: '1rem', color: 'rgba(255,230,200,0.6)', lineHeight: 1.5 }}>
                  {selectedArt.subtitle}
                </div>
                <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'rgba(255,230,200,0.3)', marginTop: 8, letterSpacing: '0.15em' }}>
                  ГЛАВА {selectedArt.chapter}
                </div>
                <button
                  onClick={() => setSelectedArt(null)}
                  style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'rgba(255,230,200,0.3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, letterSpacing: '0.1em' }}
                >
                  [ЗАКРЫТЬ]
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {ACHIEVEMENTS.map((ach, i) => {
              const isUnlocked = gameState.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`achievement-card animate-fade-in ${isUnlocked ? 'unlocked' : 'locked'}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: '1.8rem' }}>{isUnlocked ? ach.emoji : '🔒'}</span>
                    <div>
                      <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: '0.85rem', color: isUnlocked ? 'var(--retro-amber)' : 'rgba(255,230,200,0.3)', letterSpacing: '0.05em' }}>
                        {ach.title}
                      </div>
                      {isUnlocked && (
                        <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--retro-teal)' }}>
                          ✓ ПОЛУЧЕНО
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Caveat', fontSize: '0.9rem', color: isUnlocked ? 'rgba(255,230,200,0.7)' : 'rgba(255,230,200,0.2)' }}>
                    {ach.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6 retro-panel p-4">
          <div className="flex justify-between mb-2">
            <span style={{ fontFamily: 'Oswald', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,230,200,0.4)' }}>
              ОБЩИЙ ПРОГРЕСС
            </span>
            <span style={{ fontFamily: 'Oswald', fontSize: '0.7rem', color: 'var(--retro-amber)' }}>
              {Math.round(((unlockedCount + achievedCount) / (ARTS.length + ACHIEVEMENTS.length)) * 100)}%
            </span>
          </div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{ width: `${((unlockedCount + achievedCount) / (ARTS.length + ACHIEVEMENTS.length)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
