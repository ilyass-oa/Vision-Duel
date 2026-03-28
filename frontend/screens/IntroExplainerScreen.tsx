import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';

const SCENES = [
  { id: 'OBSERVE', duration: 6500 },
  { id: 'SPLIT', duration: 9000 },
  { id: 'PIPELINE', duration: 11000 },
  { id: 'DECISION', duration: 8500 },
  { id: 'FRAGILITY', duration: 13000 },
  { id: 'PAYOFF', duration: 7000 },
] as const;

const TOTAL_DURATION = SCENES.reduce((sum, scene) => sum + scene.duration, 0);
const LOOP_PAUSE_MS = 1800;

const frameMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.35, ease: 'easeIn' } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: 'easeOut' },
  }),
};

const imagePanelClassName = 'relative overflow-hidden rounded-xl border-2 border-black bg-white shadow-retro-sm';

const PixelGridOverlay: React.FC = () => {
  const cells = Array.from({ length: 49 }, (_, index) => {
    const opacity = 0.18 + ((index * 7) % 10) / 18;
    const blueScale = 235 - ((index * 13) % 50);

    return (
      <div
        key={index}
        className="border border-white/20"
        style={{ backgroundColor: `rgba(77, 165, ${blueScale}, ${opacity})` }}
      />
    );
  });

  return <div className="absolute inset-0 grid grid-cols-7 grid-rows-7">{cells}</div>;
};

const NumberRail: React.FC = () => {
  const numbers = ['012', '255', '091', '144', '208', '037', '188', '224'];

  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-brand-dark/80">
      {numbers.map((value, index) => (
        <motion.div
          key={`${value}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + index * 0.05, duration: 0.25 }}
          className="rounded border border-black/10 bg-app-bg px-3 py-2 text-center"
        >
          {value}
        </motion.div>
      ))}
    </div>
  );
};

const ProbabilityBar: React.FC<{ label: string; value: number; colorClassName: string; delay: number }> = ({
  label,
  value,
  colorClassName,
  delay,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm font-mono uppercase text-gray-600">
      <span>{label}</span>
      <span>{value.toFixed(2)}</span>
    </div>
    <div className="h-4 overflow-hidden rounded-full border-2 border-black bg-app-bg">
      <motion.div
        className={`h-full ${colorClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
  </div>
);

const MiniGraph: React.FC = () => (
  <svg viewBox="0 0 260 120" className="h-28 w-full">
    <defs>
      <linearGradient id="confidenceGradient" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#4DA5F4" />
        <stop offset="100%" stopColor="#FFAE42" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="244" height="104" rx="12" fill="#F4F7F6" stroke="#000" strokeWidth="2" />
    <line x1="34" y1="92" x2="226" y2="92" stroke="#94A3B8" strokeWidth="2" />
    <line x1="34" y1="24" x2="34" y2="92" stroke="#94A3B8" strokeWidth="2" />
    <path d="M34 34 C72 38, 86 48, 118 56 S172 78, 226 86" fill="none" stroke="url(#confidenceGradient)" strokeWidth="6" strokeLinecap="round" />
    <circle cx="34" cy="34" r="5" fill="#4DA5F4" stroke="#000" strokeWidth="2" />
    <circle cx="118" cy="56" r="5" fill="#4DA5F4" stroke="#000" strokeWidth="2" />
    <circle cx="226" cy="86" r="5" fill="#FFAE42" stroke="#000" strokeWidth="2" />
    <text x="28" y="108" fontSize="11" fontFamily="Space Mono, monospace" fill="#475569">nette</text>
    <text x="98" y="108" fontSize="11" fontFamily="Space Mono, monospace" fill="#475569">dégradée</text>
    <text x="190" y="108" fontSize="11" fontFamily="Space Mono, monospace" fill="#475569">ambiguë</text>
  </svg>
);

const SourceImageCard: React.FC<{
  imageUrl: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  overlay?: React.ReactNode;
}> = ({ imageUrl, alt, className = '', imageClassName = '', overlay }) => (
  <div className={`${imagePanelClassName} ${className}`}>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(77,165,244,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,165,244,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
    <img src={imageUrl} alt={alt} className={`relative z-10 h-full w-full object-cover ${imageClassName}`} />
    {overlay}
  </div>
);

const SceneBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand-dark shadow-retro-sm">
    <Sparkles size={14} />
    {children}
  </div>
);

const IntroShell: React.FC<{
  children: React.ReactNode;
  currentScene: number;
  progressPercent: number;
  onSkip: () => void;
  onHome: () => void;
}> = ({ children, currentScene, progressPercent, onSkip, onHome }) => (
  <div className="relative min-h-screen overflow-hidden bg-app-bg text-brand-dark">
    <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,rgba(77,165,244,0.18),transparent_35%)]" />
    <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,rgba(77,165,244,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,165,244,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 md:px-8 md:py-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <button
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-retro-sm transition-colors hover:bg-gray-50"
        >
          Retour
        </button>

        <div className="flex-1 px-1 pt-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.28em] text-gray-500">
            <span>Animation / Explication</span>
            <span>Scene {Math.min(currentScene + 1, SCENES.length)} / {SCENES.length}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-2 border-black bg-white shadow-retro-sm">
            <motion.div
              className="h-full bg-brand-blue"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          </div>
        </div>

        <button
          onClick={onSkip}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-retro-sm transition-colors hover:bg-gray-50"
        >
          Passer
        </button>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  </div>
);

const SceneOne: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
    <motion.div custom={0.05} variants={staggerItem} initial="initial" animate="animate" className="space-y-5">
      <SceneBadge>Observation</SceneBadge>
      <div className="space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">Tu vois un chat.</h1>
        <p className="max-w-xl text-lg text-gray-600 md:text-2xl">Mais une IA voit-elle la même chose ?</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {['instantané', 'contexte', 'intuition'].map((label, index) => (
          <motion.div
            key={label}
            custom={0.14 + index * 0.08}
            variants={staggerItem}
            initial="initial"
            animate="animate"
            className="rounded-full border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-retro-sm"
          >
            {label}
          </motion.div>
        ))}
      </div>
    </motion.div>

    <motion.div custom={0.18} variants={staggerItem} initial="initial" animate="animate">
      <SourceImageCard
        imageUrl={imageUrl}
        alt="Chat d'introduction"
        className="mx-auto aspect-[4/5] max-w-md p-3"
        imageClassName="rounded-lg border-2 border-black"
        overlay={<div className="absolute inset-x-5 bottom-5 z-20 rounded-lg border-2 border-black bg-white/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] shadow-retro-sm">Vision humaine: une forme familière</div>}
      />
    </motion.div>
  </motion.div>
);

const SceneTwo: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-6">
    <div className="space-y-3 text-center">
      <SceneBadge>Rupture</SceneBadge>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Humain et machine ne voient pas pareil.</h2>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <motion.div custom={0.08} variants={staggerItem} initial="initial" animate="animate" className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Humain</p>
          <p className="rounded-full border border-black px-3 py-1 text-xs font-bold uppercase">perception globale</p>
        </div>
        <SourceImageCard imageUrl={imageUrl} alt="Vision humaine" className="aspect-[4/3] p-3" imageClassName="rounded-lg border-2 border-black" />
        <div className="mt-4 flex flex-wrap gap-2">
          {['contexte', 'expérience', 'sens'].map((label) => (
            <div key={label} className="rounded-full border border-black bg-app-bg px-3 py-1 font-mono text-xs uppercase">
              {label}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div custom={0.18} variants={staggerItem} initial="initial" animate="animate" className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500">IA</p>
          <p className="rounded-full border border-black px-3 py-1 text-xs font-bold uppercase">analyse numérique</p>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <SourceImageCard
            imageUrl={imageUrl}
            alt="Vision IA"
            className="aspect-[4/3] p-3"
            imageClassName="rounded-lg border-2 border-black contrast-125 saturate-150"
            overlay={
              <>
                <PixelGridOverlay />
                <div className="absolute inset-0 z-20 bg-brand-blue/10" />
              </>
            }
          />
          <div className="rounded-xl border-2 border-black bg-app-bg p-3">
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500">pixels -&gt; valeurs numériques</p>
            <NumberRail />
          </div>
        </div>
      </motion.div>
    </div>

    <motion.p
      custom={0.28}
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className="text-center text-base font-semibold text-gray-700 md:text-lg"
    >
      L’IA ne reçoit pas “un chat”.
    </motion.p>
  </motion.div>
);

const SceneThree: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-6">
    <div className="space-y-3 text-center">
      <SceneBadge>Pipeline</SceneBadge>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">L’image traverse un pipeline visuel.</h2>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-retro">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div custom={0.08} variants={staggerItem} initial="initial" animate="animate">
          <SourceImageCard
            imageUrl={imageUrl}
            alt="Image source"
            className="aspect-square p-3"
            imageClassName="rounded-lg border-2 border-black"
            overlay={
              <div className="absolute inset-x-4 bottom-4 z-20 rounded-lg border-2 border-black bg-white/90 px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] shadow-retro-sm">
                224 x 224
              </div>
            }
          />
        </motion.div>

        <motion.div custom={0.16} variants={staggerItem} initial="initial" animate="animate" className="flex flex-col justify-center gap-4">
          <div className="grid gap-3 md:grid-cols-4">
            {['image', '224 x 224', 'bords', 'textures'].map((label, index) => (
              <div key={label} className="relative rounded-xl border-2 border-black bg-app-bg px-4 py-4 text-center shadow-retro-sm">
                <div className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-gray-500">{label}</div>
                {index < 3 && <div className="absolute right-[-17px] top-1/2 hidden h-0.5 w-8 -translate-y-1/2 bg-brand-blue md:block" />}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
            {[
              { title: 'bords', className: 'from-brand-blue/30' },
              { title: 'textures', className: 'from-brand-orange/30' },
              { title: 'formes', className: 'from-brand-blue/20' },
            ].map((item, index) => (
              <div key={item.title} className="rounded-xl border-2 border-black bg-white p-3">
                <div className={`mb-3 h-24 rounded-lg border-2 border-black bg-gradient-to-br ${item.className} to-white`}>
                  <div className="flex h-full items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.3em] text-brand-dark">
                    {item.title}
                  </div>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">motifs activés</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

    <motion.p
      custom={0.26}
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className="text-center text-base font-semibold text-gray-700 md:text-lg"
    >
      Le modèle extrait des motifs visuels utiles.
    </motion.p>
  </motion.div>
);

const SceneFour: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-6">
    <div className="space-y-3 text-center">
      <SceneBadge>Décision</SceneBadge>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Le modèle calcule une réponse probable.</h2>
    </div>

    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.div custom={0.08} variants={staggerItem} initial="initial" animate="animate">
        <SourceImageCard imageUrl={imageUrl} alt="Image pour décision" className="aspect-[4/5] max-w-md p-3" imageClassName="rounded-lg border-2 border-black" />
      </motion.div>

      <motion.div custom={0.16} variants={staggerItem} initial="initial" animate="animate" className="rounded-2xl border-2 border-black bg-white p-5 shadow-retro">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Sortie du modèle</p>
            <h3 className="text-2xl font-black uppercase">Score puis probabilité</h3>
          </div>
          <div className="rounded-full border border-black px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
            softmax
          </div>
        </div>

        <div className="space-y-5">
          <ProbabilityBar label="Chat" value={0.91} colorClassName="bg-brand-blue" delay={0.15} />
          <ProbabilityBar label="Pas chat" value={0.09} colorClassName="bg-brand-orange" delay={0.3} />
        </div>

        <div className="mt-6 space-y-2 rounded-xl border-2 border-black bg-app-bg p-4">
          <p className="font-semibold text-gray-700">Le modèle choisit la réponse la plus probable.</p>
          <p className="text-sm font-semibold text-gray-500">Mais une forte confiance ne garantit pas qu’il a raison.</p>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const SceneFive: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-6">
    <div className="space-y-3 text-center">
      <SceneBadge>Fragilité</SceneBadge>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">La performance seule ne suffit pas.</h2>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'image nette', imageClassName: 'rounded-lg border-2 border-black', badge: 'Chat 0.98' },
          { title: 'image dégradée', imageClassName: 'rounded-lg border-2 border-black contrast-75 saturate-50', badge: 'Chat 0.61' },
          { title: 'cas ambigu', imageClassName: 'rounded-lg border-2 border-black grayscale sepia', badge: 'Chat 0.87' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            custom={0.08 + index * 0.08}
            variants={staggerItem}
            initial="initial"
            animate="animate"
            className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro"
          >
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500">{item.title}</p>
            <SourceImageCard
              imageUrl={imageUrl}
              alt={item.title}
              className="aspect-square p-2"
              imageClassName={item.imageClassName}
              overlay={index === 1 ? <PixelGridOverlay /> : null}
            />
            <div className="mt-3 rounded-lg border-2 border-black bg-app-bg px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
              {item.badge}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div custom={0.28} variants={staggerItem} initial="initial" animate="animate" className="rounded-2xl border-2 border-black bg-white p-5 shadow-retro">
        <h3 className="text-xl font-black uppercase">Robustesse</h3>
        <MiniGraph />
        <div className="space-y-3">
          {[
            'Performant sur les cas connus.',
            'Plus fragile quand l’image change.',
            'Confiance ≠ vérité.',
          ].map((text, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + index * 0.18, duration: 0.3 }}
              className="rounded-xl border-2 border-black bg-app-bg px-4 py-3 font-semibold"
            >
              {text}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const SceneSix: React.FC<{ imageUrl: string; isComplete: boolean; onReplay: () => void; onStart: () => void }> = ({
  imageUrl,
  isComplete,
  onReplay,
  onStart,
}) => (
  <motion.div {...frameMotion} className="flex h-full flex-col justify-center gap-6">
    <div className="space-y-3 text-center">
      <SceneBadge>Passage à l'action</SceneBadge>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Alors, qui reconnaît vraiment mieux ?</h2>
      <p className="text-lg text-gray-600 md:text-2xl">L’humain ou l’IA ?</p>
    </div>

    <div className="rounded-[28px] border-2 border-black bg-white p-5 shadow-retro md:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SourceImageCard
          imageUrl={imageUrl}
          alt="Transition vers le jeu"
          className="aspect-[4/5] max-w-md p-3"
          imageClassName="rounded-lg border-2 border-black"
          overlay={
            <div className="absolute inset-x-4 bottom-4 z-20 rounded-xl border-2 border-black bg-white/95 px-4 py-3 shadow-retro-sm">
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                <div className="rounded border border-black bg-app-bg px-2 py-2">duel</div>
                <div className="rounded border border-black bg-app-bg px-2 py-2">stress</div>
                <div className="rounded border border-black bg-app-bg px-2 py-2">incertitude</div>
              </div>
            </div>
          }
        />

        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-black bg-app-bg p-4">
            <p className="font-semibold text-gray-700">Teste maintenant ce que l’IA gagne en vitesse, ce qu’elle perd en robustesse, et quand sa confiance devient trompeuse.</p>
          </div>
          <div className="grid gap-3">
            <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
              <Button onClick={onStart} className="w-full text-base md:text-lg">
                Commencer l'expérience <ArrowRight className="ml-2 inline" size={18} />
              </Button>
            </motion.div>
            <Button variant="secondary" onClick={onReplay} className="w-full text-base md:text-lg">
              Revoir l'intro
            </Button>
          </div>
        </div>
      </div>
    </div>

    {!isComplete && (
      <div className="text-center font-mono text-xs uppercase tracking-[0.22em] text-gray-500">
        La transition finale se met en place...
      </div>
    )}
  </motion.div>
);

export const IntroExplainerScreen: React.FC = () => {
  const { allImages, trainingSamplesA, switchTest } = useAppContext();
  const fixedTrainingImageUrl = '/static/training/a_raw/images (183).jpeg';
  const fixedTrainingImage =
    trainingSamplesA.find((sample) =>
      sample.url.includes('images (183).jpeg') || sample.url.includes('images%20(183).jpeg')
    )?.url ?? '';
  const sourceImageUrl = fixedTrainingImage || fixedTrainingImageUrl || trainingSamplesA[0]?.url || allImages[0]?.url || '';

  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [elapsedInScene, setElapsedInScene] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (!sourceImageUrl) {
      setImageReady(false);
      setImageError(false);
      return;
    }

    let active = true;
    const img = new Image();

    setImageReady(false);
    setImageError(false);

    img.onload = () => {
      if (!active) return;
      setImageReady(true);
    };

    img.onerror = () => {
      if (!active) return;
      setImageError(true);
    };

    img.src = sourceImageUrl;

    return () => {
      active = false;
    };
  }, [runKey, sourceImageUrl]);

  useEffect(() => {
    if (!imageReady || imageError || isComplete) return;

    const duration = SCENES[currentScene].duration;
    const startedAt = Date.now();

    setElapsedInScene(0);

    const progressTimer = window.setInterval(() => {
      setElapsedInScene(Math.min(Date.now() - startedAt, duration));
    }, 100);

    const sceneTimer = window.setTimeout(() => {
      setElapsedInScene(duration);

      if (currentScene === SCENES.length - 1) {
        setIsComplete(true);
        return;
      }

      setCurrentScene((value) => value + 1);
    }, duration);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(sceneTimer);
    };
  }, [currentScene, imageError, imageReady, isComplete, runKey]);

  const completedDuration = isComplete
    ? TOTAL_DURATION
    : SCENES.slice(0, currentScene).reduce((sum, scene) => sum + scene.duration, 0) + elapsedInScene;
  const progressPercent = Math.min(100, (completedDuration / TOTAL_DURATION) * 100);

  const restartTimeline = () => {
    setCurrentScene(0);
    setElapsedInScene(0);
    setIsComplete(false);
  };

  const resetIntro = () => {
    restartTimeline();
    setImageReady(false);
    setImageError(false);
    setRunKey((value) => value + 1);
  };

  useEffect(() => {
    if (!isComplete) return;

    const timer = window.setTimeout(() => {
      restartTimeline();
    }, LOOP_PAUSE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isComplete]);

  const renderScene = () => {
    if (imageError) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-xl rounded-[28px] border-2 border-black bg-white p-8 text-center shadow-retro">
            <h2 className="text-3xl font-black uppercase tracking-tight">Impossible de charger l'image source.</h2>
            <p className="mt-3 text-gray-600">Retourne à l’accueil puis réessaie une fois les données chargées.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={() => switchTest('WELCOME')}>Retour à l'accueil</Button>
              <Button onClick={resetIntro}>Réessayer</Button>
            </div>
          </div>
        </div>
      );
    }

    if (!sourceImageUrl || !imageReady) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-3xl rounded-[28px] border-2 border-black bg-white p-6 shadow-retro md:p-8">
            <div className="space-y-4">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="aspect-[4/5] animate-pulse rounded-2xl border-2 border-black bg-app-bg" />
                <div className="space-y-3">
                  <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-24 animate-pulse rounded-2xl border-2 border-black bg-app-bg" />
                </div>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-gray-500">Préparation de l'image source...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <div key={`scene-${currentScene}-${runKey}`} className="h-full">
          {currentScene === 0 && <SceneOne imageUrl={sourceImageUrl} />}
          {currentScene === 1 && <SceneTwo imageUrl={sourceImageUrl} />}
          {currentScene === 2 && <SceneThree imageUrl={sourceImageUrl} />}
          {currentScene === 3 && <SceneFour imageUrl={sourceImageUrl} />}
          {currentScene === 4 && <SceneFive imageUrl={sourceImageUrl} />}
          {currentScene === 5 && (
            <SceneSix
              imageUrl={sourceImageUrl}
              isComplete={isComplete}
              onReplay={resetIntro}
              onStart={() => switchTest('BRIEFING')}
            />
          )}
        </div>
      </AnimatePresence>
    );
  };

  return (
    <IntroShell
      currentScene={currentScene}
      progressPercent={progressPercent}
      onSkip={() => switchTest('WELCOME')}
      onHome={() => switchTest('WELCOME')}
    >
      {renderScene()}

      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-retro-sm">
          Intro en boucle, environ 55 secondes
        </div>
      </div>
    </IntroShell>
  );
};
