import { useState, useEffect, useRef } from 'react';
import type { GameState, Screen } from '@/App';
import Icon from '@/components/ui/icon';
import { useSound } from '@/hooks/useSound';

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
  mood: 'neutral' | 'suspicious' | 'friendly' | 'angry' | 'scared' | 'drunk' | 'authority';
  bgScene: 'street' | 'office' | 'garage' | 'parliament';
  sound?: 'gunshot' | 'explosion' | 'paperSign' | 'dialogOpen';
  choices: Choice[];
}

interface Choice {
  id: string;
  text: string;
  next: string;
  karmaChange?: number;
  effect?: string;
  sound?: 'karmaUp' | 'karmaDown' | 'choiceSelect' | 'gunshot' | 'paperSign';
}

const DIALOG_TREE: Record<string, DialogNode> = {
  start: {
    id: 'start',
    speaker: 'Дядя Толик',
    speakerTitle: 'Бывший участковый · 1993 год, Москва',
    text: 'Слышал новости? Ельцин распустил парламент. Танки у Белого дома. У нас в районе уже стреляли — Солнцевские с Люберецкими делят рынок. Тебе письмо от отца. Он работал следователем. Пропал три дня назад.',
    avatar: '👮',
    mood: 'suspicious',
    bgScene: 'street',
    choices: [
      { id: 'c1', text: '«Что в письме? Дай сюда.»', next: 'read_letter', karmaChange: 0, effect: 'Получено: письмо отца', sound: 'choiceSelect' },
      { id: 'c2', text: '«Где отца видели последний раз?»', next: 'father_location', karmaChange: 5, effect: 'Карма +5', sound: 'karmaUp' },
      { id: 'c3', text: '«Мне не нужны проблемы. Уйди.»', next: 'refuse', karmaChange: -10, effect: 'Карма -10', sound: 'karmaDown' },
    ],
  },
  read_letter: {
    id: 'read_letter',
    speaker: 'Письмо отца',
    speakerTitle: 'Майор Волков А.В. · КГБ СССР → ФСБ РФ',
    text: 'Сын. Если читаешь это — я уже под наблюдением или хуже. Я нашёл документы о том, как люди из окружения президента крышуют Солнцевскую ОПГ. Деньги идут через «Столичный банк». Шкатулка у Петровича в гараже — там улики. Горбачёв предупреждал, что после ГКЧП власть уйдёт к уголовникам. Он был прав.',
    avatar: '📜',
    mood: 'neutral',
    bgScene: 'office',
    sound: 'paperSign',
    choices: [
      { id: 'c4', text: '«Еду к Петровичу немедленно.»', next: 'petro_garage', karmaChange: 5, sound: 'choiceSelect' },
      { id: 'c5', text: '«Сначала узнаю про банк.»', next: 'bank_info', karmaChange: 0, sound: 'choiceSelect' },
    ],
  },
  father_location: {
    id: 'father_location',
    speaker: 'Дядя Толик',
    speakerTitle: 'Бывший участковый',
    text: 'Последний раз видели у «Столичного банка» на Тверской. Потом — ничего. Знаешь что это значит? Там такие люди ходят... твой отец сунул нос куда не следует. Говорили, сам начальник охраны президента звонил в отдел.',
    avatar: '👮',
    mood: 'scared',
    bgScene: 'street',
    choices: [
      { id: 'c6', text: '«Веди меня туда.»', next: 'petro_garage', karmaChange: 5, sound: 'karmaUp' },
      { id: 'c7', text: '«Сначала читаю письмо.»', next: 'read_letter', karmaChange: 0, sound: 'choiceSelect' },
    ],
  },
  refuse: {
    id: 'refuse',
    speaker: 'Дядя Толик',
    speakerTitle: 'Бывший участковый',
    text: 'Дело твоё... но знай — они уже знают, что ты его сын. Через день-два придут сами. Солнцевские так не делают: не предупреждают. Просто берут. Или хуже.',
    avatar: '👮',
    mood: 'angry',
    bgScene: 'street',
    choices: [
      { id: 'c8', text: '«Ладно, чёрт с тобой. Что в письме?»', next: 'read_letter', karmaChange: -5, sound: 'karmaDown' },
    ],
  },
  bank_info: {
    id: 'bank_info',
    speaker: 'Нарратор',
    speakerTitle: '1993. Москва. После расстрела парламента.',
    text: '«Столичный банк» — прачечная для денег трёх ОПГ. Основан в 91-м, сразу после путча. По данным отца — через банк прошло 2 миллиарда рублей рэкетирских денег. Приватизация — прикрытие. Гайдар распродаёт заводы за копейки своим людям.',
    avatar: '📖',
    mood: 'neutral',
    bgScene: 'office',
    choices: [
      { id: 'c9', text: '«К Петровичу. Нужны улики.»', next: 'petro_garage', karmaChange: 5, sound: 'choiceSelect' },
    ],
  },
  petro_garage: {
    id: 'petro_garage',
    speaker: 'Петрович',
    speakerTitle: 'Гараж №12 · Бывший сотрудник ОБХСС',
    text: 'Лёша... Слава богу. Час назад тут были двое. В адидасе, с цепями. Сказали — отдай шкатулку или пожалеешь. Я не отдал. Твой отец говорил: Ельцин окружил себя жуликами. КГБ стало ФСБ — те же люди, другие погоны.',
    avatar: '🧔',
    mood: 'scared',
    bgScene: 'garage',
    choices: [
      { id: 'c10', text: '«Шкатулку. Быстро.»', next: 'box_found', karmaChange: 0, sound: 'choiceSelect' },
      { id: 'c11', text: '«Ты в безопасности? Они вернутся?»', next: 'box_found', karmaChange: 10, effect: 'Карма +10', sound: 'karmaUp' },
    ],
  },
  box_found: {
    id: 'box_found',
    speaker: 'Нарратор',
    speakerTitle: 'Шкатулка открыта.',
    text: 'Внутри — три фотографии. На первой: человек из охраны президента жмёт руку «смотрящему» Солнцевской ОПГ. На второй: здание «Столичного банка». На третьей — твой отец. Он жив. За спиной — решётка. Подвал.',
    avatar: '📦',
    mood: 'neutral',
    bgScene: 'garage',
    sound: 'paperSign',
    choices: [
      { id: 'c12', text: '«Иду в банк. Один.»', next: 'go_bank_alone', karmaChange: -5, effect: 'Риск ↑↑', sound: 'karmaDown' },
      { id: 'c13', text: '«Нужна помощь. Иду к Толику.»', next: 'team_up', karmaChange: 5, effect: 'Команда +1', sound: 'karmaUp' },
      { id: 'c14', text: '«Несу фото в прокуратуру.»', next: 'prosecutor', karmaChange: 10, effect: 'Официальный путь', sound: 'choiceSelect' },
    ],
  },
  go_bank_alone: {
    id: 'go_bank_alone',
    speaker: 'Нарратор',
    speakerTitle: 'Ночь. Тверская улица.',
    text: 'Ты входишь в банк через служебный вход. В холле — двое охранников. Телефон за стойкой молчит. Откуда-то снизу — голос отца. Потом — звук удара. Потом тишина. Ты не один — за тобой уже идут.',
    avatar: '🌃',
    mood: 'scared',
    bgScene: 'street',
    sound: 'gunshot',
    choices: [
      { id: 'c15', text: '«Прорываюсь вниз.»', next: 'rescue', karmaChange: 5, sound: 'choiceSelect' },
      { id: 'c16', text: '«Отхожу. Позвоню Толику.»', next: 'team_up', karmaChange: 0, sound: 'choiceSelect' },
    ],
  },
  team_up: {
    id: 'team_up',
    speaker: 'Дядя Толик',
    speakerTitle: 'Бывший участковый · Звонок в 3 ночи',
    text: 'У меня есть выход на одного честного мента из МУРа. Звать Серёга Краснов. Он знает про Солнцевских. Но учти — если мы идём против людей сверху, нас прикроет только огласка. Журналисты нужны. «Новая газета» — они не боятся.',
    avatar: '👮',
    mood: 'friendly',
    bgScene: 'street',
    choices: [
      { id: 'c17', text: '«Едем к журналистам сначала.»', next: 'journalist', karmaChange: 10, effect: 'Огласка — защита', sound: 'karmaUp' },
      { id: 'c18', text: '«Сначала спасти отца.»', next: 'rescue', karmaChange: 5, sound: 'choiceSelect' },
    ],
  },
  prosecutor: {
    id: 'prosecutor',
    speaker: 'Прокурор Завьялов',
    speakerTitle: 'Генеральная прокуратура РФ',
    text: 'Молодой человек... эти фотографии ничего не доказывают. И я советую забыть, что видели. В стране переходный период. Некоторые вещи решаются иначе. Уходите. Пока можете.',
    avatar: '🕴',
    mood: 'authority',
    bgScene: 'office',
    choices: [
      { id: 'c19', text: '«Значит, вы тоже куплены.»', next: 'journalist', karmaChange: 5, sound: 'karmaUp' },
      { id: 'c20', text: '«Хорошо. Я уйду...»', next: 'rescue', karmaChange: -5, sound: 'karmaDown' },
    ],
  },
  journalist: {
    id: 'journalist',
    speaker: 'Катя Орлова',
    speakerTitle: 'Репортёр · «Новая газета»',
    text: 'Мы знаем об этом банке. Не хватало только прямых улик. Эти фото — то, что нужно. Но ты понимаешь — как только материал выйдет, тебя будут искать. Твой отец жив, потому что они хотят найти оригиналы. Публикуем?',
    avatar: '📰',
    mood: 'friendly',
    bgScene: 'office',
    choices: [
      { id: 'c21', text: '«Публикуйте. Это единственный шанс.»', next: 'ending_truth', karmaChange: 15, effect: 'Финал: Правда', sound: 'karmaUp' },
      { id: 'c22', text: '«Подождите. Сначала вытащу отца.»', next: 'rescue', karmaChange: 5, sound: 'choiceSelect' },
    ],
  },
  rescue: {
    id: 'rescue',
    speaker: 'Нарратор',
    speakerTitle: 'Подвал «Столичного банка». 4:17 утра.',
    text: 'Отец жив. Следы на запястьях. Три сломанных ребра. Выходите — Тверская пустая. Где-то далеко — звук выстрела. Привычный для Москвы 93-го. Отец говорит тихо: «Пока система работает на них — нам нужно уехать.»',
    avatar: '🏃',
    mood: 'scared',
    bgScene: 'street',
    sound: 'gunshot',
    choices: [
      { id: 'c23', text: '«Едем. Документы уже у журналистов.»', next: 'ending_truth', karmaChange: 10, sound: 'karmaUp' },
      { id: 'c24', text: '«Едем. И забываем обо всём.»', next: 'ending_escape', karmaChange: -15, sound: 'karmaDown' },
    ],
  },
  ending_truth: {
    id: 'ending_truth',
    speaker: 'Нарратор',
    speakerTitle: 'Эпилог. Декабрь 1993.',
    text: 'Материал вышел. Один чиновник отстранён через год — официально по другим причинам. ОПГ продолжает работать под другими именами. «Столичный банк» лопнул в 95-м. Отец уехал в Нижний. Ты остался. Правда вышла. Но страна уже другая — и возврата нет.',
    avatar: '📖',
    mood: 'neutral',
    bgScene: 'parliament',
    choices: [],
  },
  ending_escape: {
    id: 'ending_escape',
    speaker: 'Нарратор',
    speakerTitle: 'Эпилог. Декабрь 1993.',
    text: 'Вы уехали в Петербург. Потом — в Финляндию. Документы остались у Петровича в гараже. В 95-м их нашли — и уничтожили. История не любит молчаливых свидетелей — но иногда прощает их.',
    avatar: '📖',
    mood: 'neutral',
    bgScene: 'street',
    choices: [],
  },
};

const MOOD_COLOR: Record<string, string> = {
  neutral: 'var(--retro-amber)',
  suspicious: 'var(--retro-magenta)',
  friendly: 'var(--retro-teal)',
  angry: '#ff4444',
  scared: '#b44fff',
  drunk: '#ff8c00',
  authority: 'var(--retro-amber-dim)',
};

const BG_IMAGES: Record<string, string> = {
  street: 'https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/495c48ab-527b-463e-b198-c049037afe6b.jpg',
  office: 'https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/e213c278-0c85-45c8-8907-1d4bfd3bd12b.jpg',
  garage: 'https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/e39579b5-bd31-408c-81e1-55d0c5c162d3.jpg',
  parliament: 'https://cdn.poehali.dev/projects/c8c011c0-a8dd-4762-a4b0-11b5378688df/files/adc10c07-8e52-4b39-811d-b6b2c2c9f45c.jpg',
};

const NARRATOR_AVATARS = new Set(['📖', '📜', '📦', '🌃', '🏃', '📰']);

export default function DialogScene({ gameState, onNavigate }: Props) {
  const [nodeId, setNodeId] = useState('start');
  const [displayText, setDisplayText] = useState('');
  const [typing, setTyping] = useState(true);
  const [karmaEffect, setKarmaEffect] = useState('');
  const [showEffect, setShowEffect] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const effectTimer = useRef<ReturnType<typeof setTimeout>>();
  const { play } = useSound();

  const node = DIALOG_TREE[nodeId];

  useEffect(() => {
    setDisplayText('');
    setTyping(true);
    setBgLoaded(false);
    play('dialogOpen');
    if (node.sound) play(node.sound);

    let i = 0;
    const text = node.text;
    let charTimer: ReturnType<typeof setInterval>;

    const delay = setTimeout(() => {
      charTimer = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i % 4 === 0) play('typeClick');
        if (i >= text.length) { clearInterval(charTimer); setTyping(false); }
      }, 26);
    }, 80);

    return () => { clearTimeout(delay); clearInterval(charTimer!); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  const handleChoice = (choice: Choice) => {
    if (typing) { setDisplayText(node.text); setTyping(false); return; }
    if (choice.sound) play(choice.sound);
    if (choice.effect) {
      setKarmaEffect(choice.effect);
      setShowEffect(true);
      if (effectTimer.current) clearTimeout(effectTimer.current);
      effectTimer.current = setTimeout(() => setShowEffect(false), 2200);
    }
    setNodeId(choice.next);
  };

  const moodColor = MOOD_COLOR[node.mood] || 'var(--retro-amber)';
  const bgImg = BG_IMAGES[node.bgScene];
  const isNarrator = NARRATOR_AVATARS.has(node.avatar);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--retro-bg)' }}>
      {/* Scene */}
      <div className="flex-1 relative flex items-end justify-center pb-4" style={{ minHeight: '55vh' }}>
        {/* BG */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 25%',
            filter: 'sepia(0.55) brightness(0.28) saturate(1)',
            opacity: bgLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
        <img src={bgImg} alt="" style={{ display: 'none' }} onLoad={() => setBgLoaded(true)} />

        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,0,0.05) 0%, rgba(13,10,0,0.97) 100%)' }} />

        {/* Animated rain for street scenes */}
        {node.bgScene === 'street' && (
          <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden', opacity: 0.18 }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: `${(i * 2.1) % 100}%`, top: '-10%', width: '1px', height: `${35 + (i % 5) * 15}px`, background: 'rgba(160,210,255,0.7)', animation: `rain-fall ${0.55 + (i % 4) * 0.2}s linear infinite`, animationDelay: `${(i * 0.13) % 2}s` }} />
            ))}
          </div>
        )}

        {/* Labels */}
        <div className="absolute top-4 left-4" style={{ fontFamily: 'Oswald', fontSize: '0.62rem', letterSpacing: '0.28em', color: 'rgba(255,179,0,0.48)', textTransform: 'uppercase' }}>
          ГЛАВА {gameState.chapter} · {gameState.location}
        </div>
        <div className="absolute top-4 right-4" style={{ fontFamily: 'Oswald', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,179,0,0.38)', border: '1px solid rgba(255,179,0,0.18)', padding: '3px 10px' }}>
          {node.bgScene === 'street' && '🌧 МОСКВА · НОЧЬ 1993'}
          {node.bgScene === 'office' && '🏢 КАБИНЕТ'}
          {node.bgScene === 'garage' && '🔧 ГАРАЖ №12'}
          {node.bgScene === 'parliament' && '🏛 БЕЛЫЙ ДОМ · ОКТЯБРЬ 1993'}
        </div>

        {/* Karma effect popup */}
        {showEffect && (
          <div className="absolute top-14 right-4 animate-fade-in-up" style={{ fontFamily: 'Oswald', fontSize: '0.82rem', letterSpacing: '0.1em', color: karmaEffect.includes('-') ? 'var(--retro-magenta)' : 'var(--retro-teal)', border: `1px solid ${karmaEffect.includes('-') ? 'var(--retro-magenta)' : 'var(--retro-teal)'}`, padding: '5px 14px', background: karmaEffect.includes('-') ? 'rgba(255,45,120,0.08)' : 'rgba(0,229,204,0.08)' }}>
            {karmaEffect}
          </div>
        )}

        {/* Character avatar (not for narrators) */}
        {!isNarrator && (
          <div className="absolute bottom-0 right-6 animate-fade-in" style={{ fontSize: '6rem', filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.95))', lineHeight: 1 }}>
            {node.avatar}
          </div>
        )}
      </div>

      {/* Dialog box */}
      <div
        className="relative z-10 mx-3 mb-3 retro-panel animate-fade-in"
        style={{ borderColor: moodColor, boxShadow: `0 0 30px ${moodColor}15, inset 0 0 30px rgba(0,0,0,0.7)` }}
      >
        {/* Speaker row */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2" style={{ borderBottom: `1px solid ${moodColor}22` }}>
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{node.avatar}</span>
          <div className="flex-1">
            <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: '0.98rem', color: moodColor, letterSpacing: '0.08em', textShadow: `0 0 12px ${moodColor}77` }}>
              {node.speaker}
            </div>
            <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', color: 'rgba(255,230,200,0.35)', letterSpacing: '0.12em' }}>
              {node.speakerTitle}
            </div>
          </div>
          {typing && (
            <div style={{ fontFamily: 'Oswald', fontSize: '0.58rem', color: moodColor, letterSpacing: '0.3em', animation: 'pulse 1.2s infinite' }}>●●●</div>
          )}
        </div>

        {/* Text */}
        <div className="px-5 py-4 dialog-scroll" style={{ minHeight: 80, maxHeight: 155, overflowY: 'auto', cursor: typing ? 'pointer' : 'default' }}
          onClick={() => { if (typing) { setDisplayText(node.text); setTyping(false); } }}
        >
          <p style={{ fontFamily: 'Oswald', fontWeight: 300, fontSize: '1rem', lineHeight: 1.78, color: 'var(--retro-cream)', letterSpacing: '0.02em' }}>
            {displayText}
            {typing && <span style={{ display: 'inline-block', width: 2, height: '1em', background: moodColor, marginLeft: 2, verticalAlign: 'middle', animation: 'blink-cursor 0.7s step-end infinite' }} />}
          </p>
        </div>

        {/* Choices */}
        <div className="px-4 pb-4 pt-1 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(255,230,200,0.05)' }}>
          {!typing && node.choices.length === 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              <button className="retro-btn retro-btn-sm" onClick={() => { play('menuSelect'); onNavigate('map'); }}>Карта</button>
              <button className="retro-btn retro-btn-sm retro-btn-teal" onClick={() => { play('inventoryOpen'); onNavigate('inventory'); }}>Инвентарь</button>
              <button className="retro-btn retro-btn-sm retro-btn-magenta" onClick={() => { play('menuSelect'); onNavigate('menu'); }}>Главное меню</button>
            </div>
          )}
          {node.choices.map((choice, i) => (
            <button
              key={choice.id}
              className="choice-btn animate-fade-in"
              style={{ animationDelay: `${i * 0.07}s`, opacity: typing ? 0.35 : 1, pointerEvents: typing ? 'none' : 'auto' }}
              onClick={() => handleChoice(choice)}
              onMouseEnter={() => play('hover')}
            >
              <span style={{ color: 'rgba(255,230,200,0.28)', marginRight: 10, fontFamily: 'Oswald', fontSize: '0.7rem' }}>{i + 1}.</span>
              {choice.text}
              {choice.karmaChange !== undefined && choice.karmaChange !== 0 && (
                <span style={{ float: 'right', fontSize: '0.66rem', color: choice.karmaChange > 0 ? 'var(--retro-teal)' : 'var(--retro-magenta)', marginLeft: 8 }}>
                  {choice.karmaChange > 0 ? `+${choice.karmaChange}` : choice.karmaChange}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-center gap-4 pb-2">
        {[
          { label: 'ИНВЕНТАРЬ', screen: 'inventory' as Screen, sound: 'inventoryOpen' as const },
          { label: 'КАРТА', screen: 'map' as Screen, sound: 'menuMove' as const },
          { label: 'ГАЛЕРЕЯ', screen: 'gallery' as Screen, sound: 'menuMove' as const },
        ].map(item => (
          <button key={item.screen}
            onClick={() => { play(item.sound); onNavigate(item.screen); }}
            style={{ fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,230,200,0.22)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,179,0,0.65)'; play('hover'); }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,230,200,0.22)'; }}
          >
            [{item.label}]
          </button>
        ))}
      </div>

      <style>{`
        @keyframes rain-fall {
          from { transform: translateY(0) rotate(12deg); opacity: 1; }
          to { transform: translateY(110vh) rotate(12deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
