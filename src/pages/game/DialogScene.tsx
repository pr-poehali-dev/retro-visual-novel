import { useState, useEffect, useRef } from 'react';
import type { GameState, Screen } from '@/App';
import Icon from '@/components/ui/icon';

interface Props {
  gameState: GameState;
  onNavigate: (screen: Screen) => void;
}

interface DialogNode {
  id: string;
  speaker: string;
  speakerTitle: string;
  text: string;
  avatar: string;
  mood: 'neutral' | 'suspicious' | 'friendly' | 'angry' | 'scared';
  choices: Choice[];
}

interface Choice {
  id: string;
  text: string;
  next: string;
  karmaChange?: number;
  effect?: string;
}

const DIALOG_TREE: Record<string, DialogNode> = {
  start: {
    id: 'start',
    speaker: 'Дядя Коля',
    speakerTitle: 'Сосед · Знает всё о районе',
    text: 'О, Лёха! Ты слышал? Сегодня ночью кто-то взломал гараж Петровича. Говорят, там хранилось что-то ценное из старых времён...',
    avatar: '👴',
    mood: 'suspicious',
    choices: [
      { id: 'c1', text: 'Что именно хранилось? Расскажи подробнее.', next: 'ask_detail', karmaChange: 0, effect: 'Проявил интерес' },
      { id: 'c2', text: 'Не моё дело. Пойду мимо.', next: 'ignore', karmaChange: -5, effect: 'Репутация ↓' },
      { id: 'c3', text: 'Петрович в порядке? Надо помочь.', next: 'help_offer', karmaChange: 10, effect: 'Карма ↑ +10' },
    ],
  },
  ask_detail: {
    id: 'ask_detail',
    speaker: 'Дядя Коля',
    speakerTitle: 'Сосед · Знает всё о районе',
    text: 'Говорят, там была какая-то старая шкатулка. С документами из горкома. Петрович всегда молчал об этом, но соседи шептались...',
    avatar: '👴',
    mood: 'suspicious',
    choices: [
      { id: 'c4', text: 'Пойти к Петровичу прямо сейчас.', next: 'go_petro', karmaChange: 5 },
      { id: 'c5', text: 'Сначала осмотреть место взлома.', next: 'inspect', karmaChange: 0 },
    ],
  },
  ignore: {
    id: 'ignore',
    speaker: 'Дядя Коля',
    speakerTitle: 'Сосед · Знает всё о районе',
    text: 'Ну и зря. Ты всегда такой был — нос в сторону... Только потом не удивляйся, что всё прошло мимо.',
    avatar: '👴',
    mood: 'angry',
    choices: [
      { id: 'c6', text: 'Подождите, я передумал. Что случилось?', next: 'ask_detail', karmaChange: -2 },
    ],
  },
  help_offer: {
    id: 'help_offer',
    speaker: 'Дядя Коля',
    speakerTitle: 'Сосед · Знает всё о районе',
    text: 'Вот это по-нашему! Петрович сейчас дома, весь трясётся. Жена говорит — не ест, не спит. Сходи, узнай, что там. Ты парень надёжный.',
    avatar: '👴',
    mood: 'friendly',
    choices: [
      { id: 'c7', text: 'Иду к Петровичу.', next: 'go_petro', karmaChange: 5 },
      { id: 'c5b', text: 'Сначала осмотрю место происшествия.', next: 'inspect', karmaChange: 0 },
    ],
  },
  go_petro: {
    id: 'go_petro',
    speaker: 'Петрович',
    speakerTitle: 'Гараж №12 · Старый мастер',
    text: 'Лёша... хорошо, что пришёл. Они взяли шкатулку. А в ней — письмо. Для тебя. Твой отец оставил его мне перед отъездом в 91-м...',
    avatar: '🧔',
    mood: 'scared',
    choices: [
      { id: 'c8', text: '...Что? Отец? Расскажи всё.', next: 'revelation', karmaChange: 0 },
    ],
  },
  inspect: {
    id: 'inspect',
    speaker: 'Рассказчик',
    speakerTitle: 'Нарратор',
    text: 'Ты подходишь к гаражу №12. Дверь взломана грубо, но профессионально. На полу — следы тяжёлых ботинок. И странная деталь: среди мусора лежит свежая жвачка Turbo с вкладышем №47.',
    avatar: '📖',
    mood: 'neutral',
    choices: [
      { id: 'c9', text: 'Взять вкладыш. Это улика.', next: 'go_petro', karmaChange: 5, effect: 'Получен предмет: вкладыш Turbo' },
      { id: 'c10', text: 'Идти к Петровичу.', next: 'go_petro', karmaChange: 0 },
    ],
  },
  revelation: {
    id: 'revelation',
    speaker: 'Петрович',
    speakerTitle: 'Гараж №12 · Старый мастер',
    text: 'Твой отец работал не в НИИ. Он знал слишком много. Шкатулка — это ключ. А те, кто её взял... они придут за тобой следующим.',
    avatar: '🧔',
    mood: 'scared',
    choices: [
      { id: 'c11', text: 'Я должен найти их. Любой ценой.', next: 'end', karmaChange: 0 },
      { id: 'c12', text: 'Может, лучше забыть и жить спокойно?', next: 'end', karmaChange: -10 },
    ],
  },
  end: {
    id: 'end',
    speaker: 'Рассказчик',
    speakerTitle: 'Конец главы 1',
    text: 'Осень 1994-го. Ты стоишь у гаража, и знаешь — жизнь изменилась навсегда. Впереди — карта, следы, правда. И вкладыш №47, который, может быть, что-то значит.',
    avatar: '📖',
    mood: 'neutral',
    choices: [],
  },
};

const MOOD_COLOR: Record<string, string> = {
  neutral: 'var(--retro-amber)',
  suspicious: 'var(--retro-magenta)',
  friendly: 'var(--retro-teal)',
  angry: '#ff4444',
  scared: 'var(--retro-purple)',
};

export default function DialogScene({ gameState, onNavigate }: Props) {
  const [nodeId, setNodeId] = useState('start');
  const [displayText, setDisplayText] = useState('');
  const [typing, setTyping] = useState(true);
  const [karmaEffect, setKarmaEffect] = useState('');
  const [showEffect, setShowEffect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const node = DIALOG_TREE[nodeId];

  useEffect(() => {
    setDisplayText('');
    setTyping(true);
    let i = 0;
    const text = node.text;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [nodeId, node.text]);

  const handleChoice = (choice: Choice) => {
    if (typing) {
      setDisplayText(node.text);
      setTyping(false);
      return;
    }
    if (choice.effect) {
      setKarmaEffect(choice.effect);
      setShowEffect(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowEffect(false), 2000);
    }
    setNodeId(choice.next);
  };

  const moodColor = MOOD_COLOR[node.mood] || 'var(--retro-amber)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--retro-bg)' }}>
      {/* Scene area */}
      <div
        className="flex-1 relative flex items-end justify-center pb-4"
        style={{ minHeight: '55vh' }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/e39579b5-bd31-408c-81e1-55d0c5c162d3.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: 'sepia(0.6) brightness(0.35) saturate(0.8)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(13,10,0,0.2), rgba(13,10,0,0.9))',
          }}
        />

        {/* Chapter badge */}
        <div
          className="absolute top-4 left-4"
          style={{
            fontFamily: 'Oswald',
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            color: 'rgba(255,179,0,0.5)',
            textTransform: 'uppercase',
          }}
        >
          ГЛАВА {gameState.chapter} · {gameState.location}
        </div>

        {/* Karma effect popup */}
        {showEffect && (
          <div
            className="absolute top-4 right-4 animate-fade-in-up"
            style={{
              fontFamily: 'Oswald',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              color: 'var(--retro-teal)',
              border: '1px solid var(--retro-teal)',
              padding: '6px 14px',
              background: 'rgba(0,229,204,0.08)',
            }}
          >
            {karmaEffect}
          </div>
        )}

        {/* Character avatar */}
        <div
          className="absolute bottom-0 right-8 text-8xl animate-fade-in"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}
        >
          {node.avatar !== '📖' ? node.avatar : ''}
        </div>
      </div>

      {/* Dialog panel */}
      <div
        className="relative z-10 mx-4 mb-4 retro-panel retro-panel-teal animate-fade-in"
        style={{ borderColor: moodColor, boxShadow: `0 0 20px ${moodColor}22, inset 0 0 20px rgba(0,0,0,0.5)` }}
      >
        {/* Speaker name */}
        <div
          className="flex items-center gap-3 px-5 pt-4 pb-2"
          style={{ borderBottom: `1px solid ${moodColor}33` }}
        >
          <span style={{ fontSize: '1.5rem' }}>{node.avatar}</span>
          <div>
            <div
              style={{
                fontFamily: 'Oswald',
                fontWeight: 600,
                fontSize: '1rem',
                color: moodColor,
                letterSpacing: '0.1em',
                textShadow: `0 0 10px ${moodColor}88`,
              }}
            >
              {node.speaker}
            </div>
            <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'rgba(255,230,200,0.4)', letterSpacing: '0.15em' }}>
              {node.speakerTitle}
            </div>
          </div>
          {typing && (
            <div
              className="ml-auto"
              style={{
                fontFamily: 'Oswald',
                fontSize: '0.6rem',
                color: moodColor,
                letterSpacing: '0.2em',
                animation: 'pulse 1s infinite',
              }}
            >
              ●●●
            </div>
          )}
        </div>

        {/* Dialog text */}
        <div
          className="px-5 py-4 dialog-scroll"
          style={{ minHeight: 80, maxHeight: 140, overflowY: 'auto' }}
          onClick={() => {
            if (typing) {
              setDisplayText(node.text);
              setTyping(false);
            }
          }}
        >
          <p
            style={{
              fontFamily: 'Oswald',
              fontWeight: 300,
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'var(--retro-cream)',
              letterSpacing: '0.02em',
            }}
          >
            {displayText}
            {typing && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  background: moodColor,
                  marginLeft: 2,
                  animation: 'blink-cursor 0.7s step-end infinite',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </p>
        </div>

        {/* Choices */}
        <div
          className="px-5 pb-5 pt-1 flex flex-col gap-1"
          style={{ borderTop: `1px solid rgba(255,230,200,0.08)` }}
        >
          {!typing && node.choices.length === 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              <button className="retro-btn retro-btn-sm" onClick={() => onNavigate('map')}>
                Открыть карту
              </button>
              <button className="retro-btn retro-btn-sm retro-btn-teal" onClick={() => onNavigate('inventory')}>
                Инвентарь
              </button>
              <button className="retro-btn retro-btn-sm retro-btn-magenta" onClick={() => onNavigate('menu')}>
                Главное меню
              </button>
            </div>
          )}
          {node.choices.map((choice, i) => (
            <button
              key={choice.id}
              className="choice-btn animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => handleChoice(choice)}
            >
              <span style={{ color: 'rgba(255,230,200,0.35)', marginRight: 10, fontFamily: 'Oswald', fontSize: '0.75rem' }}>
                {i + 1}.
              </span>
              {choice.text}
              {choice.karmaChange !== undefined && choice.karmaChange !== 0 && (
                <span
                  style={{
                    float: 'right',
                    fontSize: '0.7rem',
                    color: choice.karmaChange > 0 ? 'var(--retro-teal)' : 'var(--retro-magenta)',
                  }}
                >
                  {choice.karmaChange > 0 ? `+${choice.karmaChange}` : choice.karmaChange} карма
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav shortcuts */}
      <div
        className="flex justify-center gap-3 pb-3"
        style={{ fontFamily: 'Oswald', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,230,200,0.3)' }}
      >
        {[
          { label: 'I — ИНВЕНТАРЬ', screen: 'inventory' as Screen },
          { label: 'M — КАРТА', screen: 'map' as Screen },
          { label: 'G — ГАЛЕРЕЯ', screen: 'gallery' as Screen },
        ].map(item => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            style={{
              fontFamily: 'Oswald',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,230,200,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,179,0,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,230,200,0.3)')}
          >
            [{item.label}]
          </button>
        ))}
      </div>
    </div>
  );
}
