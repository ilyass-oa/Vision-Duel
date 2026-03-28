import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Layers3, RefreshCcw, ScanSearch, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';

type StoryStepId = 'pixels' | 'numbers' | 'layers' | 'architecture' | 'weights' | 'learning' | 'decision';
type FeatureKey = 'edges' | 'textures' | 'shapes';
type NetworkPhaseId = 'input' | 'conv1' | 'conv2' | 'dense' | 'softmax';
type LearningPhaseId = 'observe' | 'predict' | 'measure' | 'update';

type StoryStep = {
    id: StoryStepId;
    eyebrow: string;
    title: string;
    description: string;
};

type FeatureMeta = {
    key: FeatureKey;
    label: string;
    shortLabel: string;
    explanation: string;
};

type DemoExample = {
    id: string;
    title: string;
    caption: string;
    truthIsCat: boolean;
    imageUrl: string;
    imageClassName?: string;
    features: Record<FeatureKey, number>;
};

type WeightsState = Record<FeatureKey, number>;
type WeightShiftState = Record<FeatureKey, number>;

const STORY_STEPS: StoryStep[] = [
    {
        id: 'pixels',
        eyebrow: '1. Pixels',
        title: 'Une image est une grille.',
        description: "Le réseau ne reçoit pas \"un chat\". Il reçoit des milliers de petits carrés colorés.",
    },
    {
        id: 'numbers',
        eyebrow: '2. Nombres',
        title: 'Chaque pixel devient des valeurs.',
        description: 'Rouge, vert, bleu: chaque case est transformée en nombres que le modèle peut calculer.',
    },
    {
        id: 'layers',
        eyebrow: '3. Couches',
        title: 'Les couches extraient des motifs.',
        description: 'Au fil du réseau, on passe de détails simples a des formes de plus en plus utiles.',
    },
    {
        id: 'architecture',
        eyebrow: '4. Reseau',
        title: 'Le reseau a une architecture visible.',
        description: "Entree, couches intermediaires, connexions, couche dense, puis sortie: chaque phase a un role clair.",
    },
    {
        id: 'weights',
        eyebrow: '5. Poids',
        title: "Les connexions n'ont pas toutes la meme force.",
        description: "Pendant l'apprentissage, les poids montent ou descendent selon l'erreur produite.",
    },
    {
        id: 'learning',
        eyebrow: '6. Apprentissage',
        title: "L'erreur revient en arriere pour corriger le reseau.",
        description: "Le modele predit, compare avec la verite, puis ajuste ses connexions pour la prochaine image.",
    },
    {
        id: 'decision',
        eyebrow: '7. Sortie',
        title: 'Le modele calcule la reponse la plus probable.',
        description: 'A la fin, tous les signaux sont combines pour produire un score puis une probabilite.',
    },
];

const NETWORK_PHASES: Array<{
    id: NetworkPhaseId;
    eyebrow: string;
    title: string;
    stat: string;
    detail: string;
}> = [
    {
        id: 'input',
        eyebrow: 'Entree',
        title: 'Pixels',
        stat: '224 x 224 x 3',
        detail: "Chaque pixel est lu comme trois nombres. C'est la matiere premiere du reseau.",
    },
    {
        id: 'conv1',
        eyebrow: 'Couche 1',
        title: 'Bords',
        stat: '64 cartes',
        detail: 'Les premiers neurones reagissent aux contrastes locaux: lignes, transitions, contours.',
    },
    {
        id: 'conv2',
        eyebrow: 'Couche 2',
        title: 'Textures',
        stat: '128 cartes',
        detail: 'Les motifs simples sont recombines en textures et petits morceaux de formes.',
    },
    {
        id: 'dense',
        eyebrow: 'Couche dense',
        title: 'Poids',
        stat: '256 neurones',
        detail: "Les connexions pesees melangent les signaux et decident lesquels comptent le plus.",
    },
    {
        id: 'softmax',
        eyebrow: 'Sortie',
        title: 'Probabilites',
        stat: '2 scores',
        detail: 'Le modele transforme le score final en probabilites pour choisir la reponse la plus plausible.',
    },
];

const LEARNING_PHASES: Array<{
    id: LearningPhaseId;
    label: string;
    detail: string;
}> = [
    {
        id: 'observe',
        label: 'Voir un exemple',
        detail: "Une image et sa bonne reponse entrent dans le reseau.",
    },
    {
        id: 'predict',
        label: 'Laisser passer',
        detail: 'Les nombres traversent les couches et produisent une prediction.',
    },
    {
        id: 'measure',
        label: "Mesurer l'erreur",
        detail: 'On compare la sortie du modele a la verite attendue.',
    },
    {
        id: 'update',
        label: 'Corriger les poids',
        detail: 'Une petite mise a jour renforce ou diminue certaines connexions.',
    },
];

const FEATURE_META: FeatureMeta[] = [
    {
        key: 'edges',
        label: 'Bords',
        shortLabel: 'B',
        explanation: 'contours, transitions, oreilles, moustaches',
    },
    {
        key: 'textures',
        label: 'Textures',
        shortLabel: 'T',
        explanation: 'poils, motifs repetes, surfaces',
    },
    {
        key: 'shapes',
        label: 'Formes',
        shortLabel: 'F',
        explanation: 'silhouette globale, tete, corps',
    },
];

const DEFAULT_WEIGHTS: WeightsState = {
    edges: 52,
    textures: 45,
    shapes: 58,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));
const toPercent = (value: number) => Math.round(value * 100);
const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
const EMPTY_WEIGHT_SHIFT: WeightShiftState = { edges: 0, textures: 0, shapes: 0 };

const sectionMotion = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, ease: 'easeOut' as const },
};

const SceneBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-brand-dark shadow-retro-sm">
        <Sparkles size={13} />
        {children}
    </div>
);

const SourceImageCard: React.FC<{
    imageUrl: string;
    alt: string;
    imageClassName?: string;
    overlay?: React.ReactNode;
    label?: string;
}> = ({ imageUrl, alt, imageClassName = '', overlay, label }) => (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-black bg-white p-3 shadow-retro-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(77,165,244,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,165,244,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <img src={imageUrl} alt={alt} className={`relative z-10 h-full w-full rounded-xl border-2 border-black object-cover ${imageClassName}`} />
        {label && (
            <div className="absolute left-6 top-6 z-20 rounded-full border-2 border-black bg-white/95 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em] shadow-retro-sm">
                {label}
            </div>
        )}
        {overlay}
    </div>
);

const PixelMosaic: React.FC = () => {
    const tiles = [
        { color: '#0F2744', rgb: '15 39 68' },
        { color: '#4DA5F4', rgb: '77 165 244' },
        { color: '#9AD0FF', rgb: '154 208 255' },
        { color: '#E9F4FF', rgb: '233 244 255' },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {tiles.map((tile, index) => (
                <motion.div
                    key={tile.rgb}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 * index, duration: 0.28 }}
                    className="rounded-xl border-2 border-black bg-white p-3 shadow-retro-sm"
                >
                    <div className="mb-3 aspect-square rounded-lg border-2 border-black" style={{ backgroundColor: tile.color }} />
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Pixel</div>
                    <div className="mt-1 font-mono text-sm text-brand-dark">{tile.rgb}</div>
                </motion.div>
            ))}
        </div>
    );
};

const NumberFlow: React.FC = () => {
    const rows = [
        ['15', '39', '68'],
        ['77', '165', '244'],
        ['154', '208', '255'],
        ['233', '244', '255'],
    ];

    return (
        <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Flux numerique</div>
                    <h4 className="text-xl font-black uppercase tracking-tight">RGB -&gt; valeurs</h4>
                </div>
                <div className="rounded-full border border-black px-3 py-1 font-mono text-[11px] uppercase">224 x 224 x 3</div>
            </div>
            <div className="space-y-2">
                {rows.map((row, index) => (
                    <motion.div
                        key={row.join('-')}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.07 * index, duration: 0.24 }}
                        className="grid grid-cols-3 gap-2"
                    >
                        {row.map((value) => (
                            <div key={value} className="rounded-lg border border-black/15 bg-app-bg px-3 py-2 text-center font-mono text-sm text-brand-dark">
                                {value}
                            </div>
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const LayerPipeline: React.FC<{ example: DemoExample }> = ({ example }) => (
    <div className="space-y-3">
        {FEATURE_META.map((feature, index) => {
            const amount = example.features[feature.key];

            return (
                <motion.div
                    key={feature.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.28 }}
                    className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm"
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{feature.label}</div>
                            <div className="text-sm text-gray-600">{feature.explanation}</div>
                        </div>
                        <div className="rounded-full border border-black px-3 py-1 font-mono text-xs uppercase">{toPercent(amount)}%</div>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full border-2 border-black bg-app-bg">
                        <motion.div
                            className="h-full bg-brand-blue"
                            initial={{ width: 0 }}
                            animate={{ width: `${toPercent(amount)}%` }}
                            transition={{ duration: 0.55, delay: 0.05 * index, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>
            );
        })}
    </div>
);

const WeightNetworkGraphic: React.FC<{
    weights: WeightsState;
    activations: Record<FeatureKey, number>;
}> = ({ weights, activations }) => {
    const yPositions: Record<FeatureKey, number> = {
        edges: 60,
        textures: 110,
        shapes: 160,
    };

    return (
        <svg viewBox="0 0 360 220" className="h-56 w-full rounded-2xl border-2 border-black bg-white p-3 shadow-retro-sm">
            <defs>
                <linearGradient id="network-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4DA5F4" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#4DA5F4" stopOpacity="0.95" />
                </linearGradient>
            </defs>

            <rect x="8" y="8" width="344" height="204" rx="18" fill="#FFFFFF" stroke="#000000" strokeWidth="0" />

            {FEATURE_META.map((feature) => {
                const y = yPositions[feature.key];
                const strokeWidth = 4 + (weights[feature.key] / 100) * 12;
                const opacity = 0.25 + activations[feature.key] * 0.75;

                return (
                    <g key={feature.key}>
                        <motion.line
                            x1="108"
                            y1={y}
                            x2="252"
                            y2="110"
                            stroke="url(#network-flow)"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0.2 }}
                            animate={{ pathLength: 1, opacity }}
                            transition={{ duration: 0.45 }}
                            strokeWidth={strokeWidth}
                        />
                        <circle cx="88" cy={y} r="24" fill="#F4F7F6" stroke="#000" strokeWidth="2" />
                        <text x="88" y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Space Mono, monospace" fill="#2C3E50">
                            {feature.shortLabel}
                        </text>
                        <text x="126" y={y - 8} fontSize="12" fontWeight="700" fontFamily="Space Mono, monospace" fill="#475569">
                            {weights[feature.key].toFixed(0)}
                        </text>
                    </g>
                );
            })}

            <circle cx="278" cy="110" r="32" fill="#4DA5F4" fillOpacity="0.14" stroke="#000" strokeWidth="2" />
            <text x="278" y="105" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Space Mono, monospace" fill="#2C3E50">
                CHAT
            </text>
            <text x="278" y="123" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Space Mono, monospace" fill="#64748B">
                score
            </text>
        </svg>
    );
};

const computeWeightDeltas = (example: DemoExample, chatProbability: number): WeightShiftState => {
    const target = example.truthIsCat ? 1 : 0;
    const error = target - chatProbability;
    const deltas: WeightShiftState = { ...EMPTY_WEIGHT_SHIFT };

    FEATURE_META.forEach((feature, index) => {
        const learningRate = feature.key === 'shapes' ? 22 : feature.key === 'edges' ? 19 : 17;
        const rawDelta = error * example.features[feature.key] * learningRate;
        const damping = index === 1 && !example.truthIsCat ? 0.85 : 1;
        deltas[feature.key] = rawDelta * damping;
    });

    return deltas;
};

const NetworkArchitectureExplorer: React.FC<{
    activePhase: NetworkPhaseId;
    onPhaseSelect: (phase: NetworkPhaseId) => void;
    weights: WeightsState;
    chatProbability: number;
}> = ({ activePhase, onPhaseSelect, weights, chatProbability }) => {
    const activeIndex = NETWORK_PHASES.findIndex((phase) => phase.id === activePhase);
    const activeInfo = NETWORK_PHASES[activeIndex] || NETWORK_PHASES[0];
    const positions = [88, 250, 412, 574, 736];
    const nodeCounts: Record<NetworkPhaseId, number> = {
        input: 9,
        conv1: 7,
        conv2: 6,
        dense: 4,
        softmax: 2,
    };

    const columns = NETWORK_PHASES.map((phase, phaseIndex) => {
        const count = nodeCounts[phase.id];
        const gap = count === 1 ? 0 : 170 / (count - 1);
        const top = 66;

        return {
            ...phase,
            x: positions[phaseIndex],
            nodes: Array.from({ length: count }, (_, nodeIndex) => ({
                key: `${phase.id}-${nodeIndex}`,
                y: top + nodeIndex * gap,
            })),
        };
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {NETWORK_PHASES.map((phase) => {
                    const isActive = phase.id === activePhase;

                    return (
                        <motion.button
                            key={phase.id}
                            whileHover={{ y: -2 }}
                            onClick={() => onPhaseSelect(phase.id)}
                            className={`rounded-full border-2 px-4 py-2 text-left transition-all ${isActive ? 'border-black bg-brand-dark text-white shadow-retro-sm' : 'border-black bg-white text-brand-dark hover:bg-gray-50'}`}
                        >
                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">{phase.eyebrow}</div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="rounded-2xl border-2 border-black bg-white p-4 md:p-6 shadow-retro-sm">
                <svg viewBox="0 0 820 310" className="h-[24rem] w-full md:h-[34rem]">
                        <defs>
                            <linearGradient id="architecture-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4DA5F4" stopOpacity="0.14" />
                                <stop offset="100%" stopColor="#4DA5F4" stopOpacity="0.85" />
                            </linearGradient>
                        </defs>

                        {columns.slice(0, -1).map((column, columnIndex) => {
                            const nextColumn = columns[columnIndex + 1];
                            const isPathActive = columnIndex < activeIndex;
                            const isCurrentPath = columnIndex === activeIndex;

                            return column.nodes.flatMap((node, nodeIndex) => {
                                const ratio = column.nodes.length === 1 ? 0 : nodeIndex / (column.nodes.length - 1);
                                const targetIndex = Math.round(ratio * (nextColumn.nodes.length - 1));
                                const targets = Array.from(new Set([targetIndex, Math.min(targetIndex + 1, nextColumn.nodes.length - 1)]));

                                return targets.map((target) => (
                                    <motion.line
                                        key={`${node.key}-${nextColumn.id}-${target}`}
                                        x1={column.x}
                                        y1={node.y}
                                        x2={nextColumn.x}
                                        y2={nextColumn.nodes[target].y}
                                        stroke="url(#architecture-flow)"
                                        strokeWidth={isCurrentPath ? 2.6 : 1.5}
                                        initial={{ pathLength: 0.25, opacity: 0.12 }}
                                        animate={{
                                            pathLength: isPathActive || isCurrentPath ? 1 : 0.55,
                                            opacity: isCurrentPath ? 0.9 : isPathActive ? 0.45 : 0.12,
                                        }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                        strokeLinecap="round"
                                    />
                                ));
                            });
                        })}

                        {columns.map((column, columnIndex) => {
                            const isActiveColumn = columnIndex === activeIndex;
                            const isPassedColumn = columnIndex < activeIndex;

                            return (
                                <g key={column.id}>
                                    <text x={column.x} y="28" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Space Mono, monospace" fill="#64748B">
                                        {column.eyebrow.toUpperCase()}
                                    </text>
                                    <text x={column.x} y="48" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Space Mono, monospace" fill="#2C3E50">
                                        {column.title}
                                    </text>
                                    {column.nodes.map((node) => (
                                        <motion.circle
                                            key={node.key}
                                            cx={column.x}
                                            cy={node.y}
                                            r={isActiveColumn ? 11 : 8}
                                            initial={{ opacity: 0.4, scale: 0.92 }}
                                            animate={{
                                                opacity: isActiveColumn ? 1 : isPassedColumn ? 0.72 : 0.42,
                                                scale: isActiveColumn ? 1.06 : 1,
                                            }}
                                            transition={{ duration: 0.35 }}
                                            fill={isActiveColumn ? '#4DA5F4' : isPassedColumn ? '#CFE7FB' : '#F4F7F6'}
                                            stroke="#000"
                                            strokeWidth="2"
                                        />
                                    ))}
                                </g>
                            );
                        })}
                </svg>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border-2 border-black bg-app-bg p-5 shadow-retro-sm lg:col-span-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{activeInfo.eyebrow}</div>
                            <h4 className="mt-2 text-2xl font-black uppercase tracking-tight">{activeInfo.title}</h4>
                            <p className="mt-2 text-sm text-gray-700">{activeInfo.detail}</p>
                        </div>
                        <div className="rounded-full border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-retro-sm">
                            {activeInfo.stat}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Connexions</div>
                    <p className="mt-2 text-sm text-gray-700">
                        Chaque trait relie une couche a la suivante. Les connexions actives transportent le signal qui va influencer la decision.
                    </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Poids moyens</div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {FEATURE_META.map((feature) => (
                            <div key={feature.key} className="rounded-xl border border-black bg-app-bg px-3 py-3 text-center">
                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{feature.label}</div>
                                <div className="mt-1 text-xl font-black">{weights[feature.key].toFixed(0)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Sortie actuelle</div>
                    <div className="mt-2 text-3xl font-black">{toPercent(chatProbability)}%</div>
                    <p className="mt-1 text-sm text-gray-600">Plus le signal traverse des couches utiles, plus le score final devient net.</p>
                </div>
            </div>
        </div>
    );
};

const LearningCyclePanel: React.FC<{
    activePhase: LearningPhaseId;
    onPhaseSelect: (phase: LearningPhaseId) => void;
    onAdvance: () => void;
    onApply: () => void;
    errorValue: number;
    chatProbability: number;
    truthIsCat: boolean;
    weightShift: WeightShiftState;
    hasAppliedUpdate: boolean;
}> = ({ activePhase, onPhaseSelect, onAdvance, onApply, errorValue, chatProbability, truthIsCat, weightShift, hasAppliedUpdate }) => {
    const activeIndex = LEARNING_PHASES.findIndex((phase) => phase.id === activePhase);
    const activeInfo = LEARNING_PHASES[activeIndex] || LEARNING_PHASES[0];
    const isUpdatePhase = activePhase === 'update';
    const targetLabel = truthIsCat ? 'CHAT' : 'PAS CHAT';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {LEARNING_PHASES.map((phase, index) => {
                    const isActive = phase.id === activePhase;

                    return (
                        <motion.button
                            key={phase.id}
                            whileHover={{ y: -2 }}
                            onClick={() => onPhaseSelect(phase.id)}
                            className={`rounded-full border-2 px-4 py-2 text-left transition-all ${isActive ? 'border-black bg-brand-dark text-white shadow-retro-sm' : 'border-black bg-white text-brand-dark hover:bg-gray-50'}`}
                        >
                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">{index + 1}. {phase.label}</div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-retro-sm">
                    <div className="relative flex items-center justify-between gap-3">
                        {LEARNING_PHASES.map((phase, index) => {
                            const isActive = phase.id === activePhase;
                            const isPassed = index < activeIndex;

                            return (
                                <React.Fragment key={phase.id}>
                                    <div className="relative z-10 flex flex-1 flex-col items-center text-center">
                                        <motion.div
                                            animate={{ scale: isActive ? 1.08 : 1, opacity: isActive || isPassed ? 1 : 0.55 }}
                                            transition={{ duration: 0.25 }}
                                            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-black font-mono text-sm font-black shadow-retro-sm ${isActive ? 'bg-brand-blue text-brand-dark' : isPassed ? 'bg-blue-100 text-brand-dark' : 'bg-app-bg text-gray-500'}`}
                                        >
                                            {index + 1}
                                        </motion.div>
                                        <div className="mt-3 max-w-[120px] text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-gray-600">
                                            {phase.label}
                                        </div>
                                    </div>
                                    {index < LEARNING_PHASES.length - 1 && (
                                        <div className="h-[2px] flex-1 bg-black/15">
                                            <motion.div
                                                className="h-full bg-brand-blue"
                                                animate={{ width: activeIndex > index ? '100%' : activeIndex === index ? '55%' : '0%' }}
                                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-black bg-app-bg p-5 shadow-retro-sm">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{activeInfo.label}</div>
                    <h4 className="mt-2 text-2xl font-black uppercase tracking-tight">{activeInfo.detail}</h4>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border-2 border-black bg-white p-4">
                            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">Verite attendue</div>
                            <div className="mt-2 text-2xl font-black">{targetLabel}</div>
                        </div>
                        <div className="rounded-xl border-2 border-black bg-white p-4">
                            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">Prediction actuelle</div>
                            <div className="mt-2 text-2xl font-black">{toPercent(chatProbability)}% chat</div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border-2 border-black bg-white p-4">
                        <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">
                            <span>Erreur mesuree</span>
                            <span>{toPercent(errorValue)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full border-2 border-black bg-app-bg">
                            <motion.div
                                className="h-full bg-brand-dark"
                                animate={{ width: `${toPercent(errorValue)}%` }}
                                transition={{ duration: 0.35 }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {FEATURE_META.map((feature) => (
                            <div key={feature.key} className="rounded-xl border-2 border-black bg-white p-3 text-center">
                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{feature.label}</div>
                                <div className={`mt-2 text-lg font-black ${weightShift[feature.key] >= 0 ? 'text-brand-blue' : 'text-brand-dark'}`}>
                                    {formatSigned(weightShift[feature.key])}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="secondary"
                            onClick={isUpdatePhase ? onApply : onAdvance}
                            className="flex-1 text-sm md:text-base"
                        >
                            {isUpdatePhase ? 'Appliquer la correction' : 'Phase suivante'}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onPhaseSelect('observe')}
                            className="flex-1 text-sm md:text-base"
                        >
                            Revoir le cycle
                        </Button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                        <RefreshCcw size={14} />
                        {hasAppliedUpdate
                            ? "Une mise a jour a deja ete appliquee. Tu peux relancer la correction ou revenir au debut du cycle."
                            : "Passe les phases une a une pour voir comment la prediction se transforme en apprentissage."}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProbabilityPanel: React.FC<{
    chatProbability: number;
    truthIsCat: boolean;
}> = ({ chatProbability, truthIsCat }) => {
    const nonCatProbability = 1 - chatProbability;
    const predictedCat = chatProbability >= 0.5;
    const isCorrect = predictedCat === truthIsCat;

    return (
        <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-retro-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Sortie</div>
                    <h4 className="text-xl font-black uppercase tracking-tight">La reponse probable</h4>
                </div>
                <div className={`rounded-full border-2 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] ${isCorrect ? 'border-brand-blue bg-blue-50 text-brand-dark' : 'border-black bg-app-bg text-brand-dark'}`}>
                    {isCorrect ? 'coherent' : 'fragile'}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="mb-1 flex items-center justify-between font-mono text-xs uppercase text-gray-500">
                        <span>Chat</span>
                        <span>{toPercent(chatProbability)}%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full border-2 border-black bg-app-bg">
                        <motion.div
                            className="h-full bg-brand-blue"
                            animate={{ width: `${toPercent(chatProbability)}%` }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between font-mono text-xs uppercase text-gray-500">
                        <span>Pas chat</span>
                        <span>{toPercent(nonCatProbability)}%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full border-2 border-black bg-app-bg">
                        <motion.div
                            className="h-full bg-brand-dark"
                            animate={{ width: `${toPercent(nonCatProbability)}%` }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 rounded-xl border-2 border-black bg-app-bg p-4">
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Verdict</div>
                <div className="mt-2 text-lg font-black uppercase tracking-tight">
                    {predictedCat ? 'Le modele penche vers chat.' : 'Le modele penche vers pas chat.'}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    {isCorrect
                        ? "Ici, les signaux utiles l'emportent sur le reste."
                        : "Ici, certains motifs trompeurs prennent encore trop de place."}
                </p>
            </div>
        </div>
    );
};

const ExampleTabs: React.FC<{
    examples: DemoExample[];
    selectedId: string;
    onSelect: (id: string) => void;
}> = ({ examples, selectedId, onSelect }) => (
    <div className="flex flex-wrap gap-2">
        {examples.map((example) => {
            const isActive = example.id === selectedId;

            return (
                <button
                    key={example.id}
                    onClick={() => onSelect(example.id)}
                    className={`rounded-full border-2 px-4 py-2 text-left transition-all ${isActive ? 'border-black bg-brand-dark text-white shadow-retro-sm' : 'border-black bg-white text-brand-dark hover:bg-gray-50'}`}
                >
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">{example.title}</div>
                </button>
            );
        })}
    </div>
);

const LabSlider: React.FC<{
    label: string;
    value: number;
    helper: string;
    onChange: (value: number) => void;
}> = ({ label, value, helper, onChange }) => (
    <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{label}</div>
                <div className="text-sm text-gray-600">{helper}</div>
            </div>
            <div className="rounded-full border border-black px-3 py-1 font-mono text-xs">{value.toFixed(0)}</div>
        </div>
        <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full cursor-pointer accent-[#4DA5F4]"
            style={{ accentColor: '#4DA5F4' }}
        />
    </div>
);

const StoryVisual: React.FC<{
    stepId: StoryStepId;
    example: DemoExample;
    weights: WeightsState;
    chatProbability: number;
    activeNetworkPhase: NetworkPhaseId;
    onNetworkPhaseSelect: (phase: NetworkPhaseId) => void;
    activeLearningPhase: LearningPhaseId;
    onLearningPhaseSelect: (phase: LearningPhaseId) => void;
    onAdvanceLearningPhase: () => void;
    onApplyLearningStep: () => void;
    errorValue: number;
    weightShift: WeightShiftState;
    hasAppliedUpdate: boolean;
}> = ({
    stepId,
    example,
    weights,
    chatProbability,
    activeNetworkPhase,
    onNetworkPhaseSelect,
    activeLearningPhase,
    onLearningPhaseSelect,
    onAdvanceLearningPhase,
    onApplyLearningStep,
    errorValue,
    weightShift,
    hasAppliedUpdate,
}) => {
    if (stepId === 'pixels') {
        return (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <SourceImageCard
                    imageUrl={example.imageUrl}
                    alt={example.title}
                    imageClassName={example.imageClassName}
                    label="Image"
                    overlay={
                        <div className="absolute inset-3 z-20 rounded-xl bg-[linear-gradient(to_right,rgba(77,165,244,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,165,244,0.16)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    }
                />
                <PixelMosaic />
            </div>
        );
    }

    if (stepId === 'numbers') {
        return (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <SourceImageCard
                    imageUrl={example.imageUrl}
                    alt={example.title}
                    imageClassName={`${example.imageClassName || ''} saturate-125 contrast-110`}
                    label="Entree"
                    overlay={
                        <div className="absolute bottom-5 left-5 z-20 rounded-xl border-2 border-black bg-white/95 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] shadow-retro-sm">
                            pixels -&gt; valeurs
                        </div>
                    }
                />
                <NumberFlow />
            </div>
        );
    }

    if (stepId === 'layers') {
        return (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <SourceImageCard
                    imageUrl={example.imageUrl}
                    alt={example.title}
                    imageClassName={example.imageClassName}
                    label="Motifs"
                    overlay={
                        <>
                            <div className="absolute left-6 top-20 z-20 h-16 w-16 rounded-full border-2 border-black bg-brand-blue/20" />
                            <div className="absolute bottom-10 right-10 z-20 h-24 w-24 rounded-full border-2 border-black bg-brand-blue/10" />
                            <div className="absolute left-1/2 top-1/2 z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white/55" />
                        </>
                    }
                />
                <LayerPipeline example={example} />
            </div>
        );
    }

    if (stepId === 'weights') {
        return (
            <div className="space-y-4">
                <WeightNetworkGraphic weights={weights} activations={example.features} />
                <div className="grid gap-3 md:grid-cols-3">
                    {FEATURE_META.map((feature) => (
                        <div key={feature.key} className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{feature.label}</div>
                            <div className="mt-2 text-2xl font-black">{weights[feature.key].toFixed(0)}</div>
                            <div className="mt-1 text-sm text-gray-600">{feature.explanation}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (stepId === 'architecture') {
        return (
            <NetworkArchitectureExplorer
                activePhase={activeNetworkPhase}
                onPhaseSelect={onNetworkPhaseSelect}
                weights={weights}
                chatProbability={chatProbability}
            />
        );
    }

    if (stepId === 'learning') {
        return (
            <LearningCyclePanel
                activePhase={activeLearningPhase}
                onPhaseSelect={onLearningPhaseSelect}
                onAdvance={onAdvanceLearningPhase}
                onApply={onApplyLearningStep}
                errorValue={errorValue}
                chatProbability={chatProbability}
                truthIsCat={example.truthIsCat}
                weightShift={weightShift}
                hasAppliedUpdate={hasAppliedUpdate}
            />
        );
    }

    return <ProbabilityPanel chatProbability={chatProbability} truthIsCat={example.truthIsCat} />;
};

export const LabTrainerScreen: React.FC = () => {
    const { trainingSamplesA, trainingSamplesB, allImages, test3Images, switchTest } = useAppContext();

    const catImageUrl = useMemo(
        () =>
            trainingSamplesA.find((sample) => sample.label === 'CHAT')?.url ||
            trainingSamplesA[0]?.url ||
            allImages.find((image) => image.truth === 'CHAT')?.url ||
            allImages[0]?.url ||
            '',
        [allImages, trainingSamplesA]
    );

    const nonCatImageUrl = useMemo(
        () =>
            test3Images[0]?.url ||
            trainingSamplesB.find((sample) => sample.label === 'PAS_CHAT')?.url ||
            trainingSamplesB[0]?.url ||
            allImages.find((image) => image.truth === 'PAS_CHAT')?.url ||
            allImages.find((image) => image.url !== catImageUrl)?.url ||
            catImageUrl,
        [allImages, catImageUrl, test3Images, trainingSamplesB]
    );

    const examples = useMemo<DemoExample[]>(
        () => [
            {
                id: 'clear-cat',
                title: 'Chat net',
                caption: 'Les indices utiles ressortent clairement.',
                truthIsCat: true,
                imageUrl: catImageUrl,
                features: {
                    edges: 0.86,
                    textures: 0.72,
                    shapes: 0.88,
                },
            },
            {
                id: 'blur-cat',
                title: 'Chat flou',
                caption: 'Le flou affaiblit les bords et une partie des textures.',
                truthIsCat: true,
                imageUrl: catImageUrl,
                imageClassName: 'blur-[2px] saturate-75',
                features: {
                    edges: 0.43,
                    textures: 0.34,
                    shapes: 0.67,
                },
            },
            {
                id: 'lookalike',
                title: 'Faux ami',
                caption: 'Certains motifs ressemblent a un chat, mais la forme globale est moins fiable.',
                truthIsCat: false,
                imageUrl: nonCatImageUrl,
                imageClassName: 'contrast-110 saturate-125',
                features: {
                    edges: 0.58,
                    textures: 0.82,
                    shapes: 0.42,
                },
            },
        ].filter((example) => Boolean(example.imageUrl)),
        [catImageUrl, nonCatImageUrl]
    );

    const [activeStep, setActiveStep] = useState<StoryStepId>('pixels');
    const [activeNetworkPhase, setActiveNetworkPhase] = useState<NetworkPhaseId>('input');
    const [activeLearningPhase, setActiveLearningPhase] = useState<LearningPhaseId>('observe');
    const [bonusDCardIndex, setBonusDCardIndex] = useState(0);
    const [selectedExampleId, setSelectedExampleId] = useState<string>('clear-cat');
    const [weights, setWeights] = useState<WeightsState>(DEFAULT_WEIGHTS);
    const [trainingSteps, setTrainingSteps] = useState(0);
    const [lastWeightShift, setLastWeightShift] = useState<WeightShiftState | null>(null);

    const selectedExample = useMemo(
        () => examples.find((example) => example.id === selectedExampleId) || examples[0] || null,
        [examples, selectedExampleId]
    );

    const chatProbability = useMemo(() => {
        if (!selectedExample) return 0.5;

        const weightedSum =
            (weights.edges / 100) * selectedExample.features.edges * 1.15 +
            (weights.textures / 100) * selectedExample.features.textures * 0.95 +
            (weights.shapes / 100) * selectedExample.features.shapes * 1.35 -
            1.05;

        return clamp(sigmoid(weightedSum * 4.2), 0.02, 0.98);
    }, [selectedExample, weights]);

    const targetProbability = selectedExample?.truthIsCat ? 1 : 0;
    const errorValue = Math.abs(targetProbability - chatProbability);
    const predictedCat = chatProbability >= 0.5;
    const isPredictionCorrect = selectedExample ? predictedCat === selectedExample.truthIsCat : false;
    const previewWeightShift = useMemo(
        () => (selectedExample ? computeWeightDeltas(selectedExample, chatProbability) : EMPTY_WEIGHT_SHIFT),
        [chatProbability, selectedExample]
    );
    const displayedWeightShift = lastWeightShift || previewWeightShift;

    const correctionMessage = useMemo(() => {
        if (!selectedExample) return '';
        if (isPredictionCorrect && errorValue < 0.16) {
            return "Le score est deja bien aligne: l'erreur a peu de chose a corriger.";
        }
        if (selectedExample.truthIsCat) {
            return "Ici, l'erreur pousse surtout a renforcer les signaux utiles qui manquent encore.";
        }
        return "Ici, l'erreur sert a baisser l'importance de motifs trompeurs qui ressemblent a un chat.";
    }, [errorValue, isPredictionCorrect, selectedExample]);

    const applyLearningStep = () => {
        if (!selectedExample) return;
        const deltas = computeWeightDeltas(selectedExample, chatProbability);

        setWeights((previous) => {
            const next: WeightsState = { ...previous };

            FEATURE_META.forEach((feature) => {
                next[feature.key] = clamp(previous[feature.key] + deltas[feature.key], 0, 100);
            });

            return next;
        });

        setLastWeightShift(deltas);
        setActiveLearningPhase('update');
        setTrainingSteps((current) => current + 1);
    };

    const updateWeight = (key: FeatureKey, value: number) => {
        setWeights((previous) => ({ ...previous, [key]: value }));
        setLastWeightShift(null);
    };

    const resetSimulation = () => {
        setWeights(DEFAULT_WEIGHTS);
        setTrainingSteps(0);
        setActiveLearningPhase('observe');
        setLastWeightShift(null);
    };

    const advanceLearningPhase = () => {
        if (activeLearningPhase === 'observe') {
            setActiveLearningPhase('predict');
            return;
        }
        if (activeLearningPhase === 'predict') {
            setActiveLearningPhase('measure');
            return;
        }
        if (activeLearningPhase === 'measure') {
            setActiveLearningPhase('update');
            return;
        }
        applyLearningStep();
    };

    const handleExampleSelect = (id: string) => {
        setSelectedExampleId(id);
        setActiveLearningPhase('observe');
        setActiveNetworkPhase('input');
        setLastWeightShift(null);
    };

    if (!selectedExample) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
                <div className="relative z-10 mx-auto max-w-6xl rounded-2xl border-4 border-black bg-white p-8 shadow-retro-lg">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 w-40 rounded bg-gray-200" />
                        <div className="h-12 w-2/3 rounded bg-gray-200" />
                        <div className="h-80 rounded-2xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    const currentStep = STORY_STEPS.find((step) => step.id === activeStep) || STORY_STEPS[0];
    const isArchitectureStep = activeStep === 'architecture';
    const bonusDTotalCards = 4;

    return (
        <div className="relative min-h-screen overflow-hidden bg-app-bg text-brand-dark">
            <div className="absolute inset-0 pointer-events-none bg-dot-pattern opacity-45" />
            <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top,rgba(77,165,244,0.18),transparent_35%)]" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 md:px-8 md:py-8">
                {bonusDCardIndex === 0 && (
                    <motion.section {...sectionMotion} className="rounded-[28px] border-2 md:border-4 border-black bg-white p-5 md:p-8 shadow-retro-lg">
                        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div className="space-y-5">
                                <SceneBadge>Bonus D</SceneBadge>
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Voir comment un reseau apprend a reconnaitre une image.</h1>
                                    <p className="max-w-2xl text-base text-gray-600 md:text-lg">
                                        Une version simple, fidele et visuelle: pixels, nombres, couches, poids et probabilite finale.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {['peu de texte', 'beaucoup de visuel', 'simulation manuelle'].map((pill) => (
                                        <div key={pill} className="rounded-full border-2 border-black bg-app-bg px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-retro-sm">
                                            {pill}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button variant="secondary" onClick={() => switchTest('BONUS_MENU')} className="px-4 py-3 text-sm md:text-base">
                                        Retour bonus
                                    </Button>
                                    <motion.div whileHover={{ y: -2 }}>
                                        <Button onClick={() => switchTest('CONCLUSION')} className="px-4 py-3 text-sm md:text-base">
                                            Revenir au parcours <ArrowRight className="ml-2 inline" size={16} />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <SourceImageCard
                                    imageUrl={selectedExample.imageUrl}
                                    alt={selectedExample.title}
                                    imageClassName={selectedExample.imageClassName}
                                    label={selectedExample.title}
                                    overlay={
                                        <div className="absolute inset-0 z-20 bg-[linear-gradient(to_right,rgba(77,165,244,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,165,244,0.14)_1px,transparent_1px)] bg-[size:24px_24px]" />
                                    }
                                />
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {FEATURE_META.map((feature, index) => (
                                        <motion.div
                                            key={feature.key}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.08 * index, duration: 0.3 }}
                                            className="rounded-2xl border-2 border-black bg-app-bg p-4 shadow-retro-sm"
                                        >
                                            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{feature.label}</div>
                                            <div className="mt-2 text-2xl font-black">{toPercent(selectedExample.features[feature.key])}%</div>
                                            <div className="mt-1 text-sm text-gray-600">{feature.explanation}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {bonusDCardIndex === 1 && (
                    <motion.section {...sectionMotion} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }} className="rounded-[28px] border-2 md:border-4 border-black bg-white p-5 md:p-8 shadow-retro-lg">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="space-y-3">
                                    <SceneBadge>Lecture guidee</SceneBadge>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">Une image passe ici par sept reperes cles.</h2>
                                        <p className="mt-2 max-w-2xl text-gray-600">
                                            Clique sur une etape. Le visuel change, mais l'idee reste la meme: le modele transforme l'image en signaux calculables.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border-2 border-black bg-app-bg px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 shadow-retro-sm">
                                    Exemples du site, explication simplifiee mais fidele
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <ExampleTabs examples={examples} selectedId={selectedExample.id} onSelect={handleExampleSelect} />
                                <div className="flex flex-wrap gap-2">
                                    {STORY_STEPS.map((step, index) => {
                                        const isActive = step.id === activeStep;

                                        return (
                                            <motion.button
                                                key={step.id}
                                                whileHover={{ y: -2 }}
                                                onClick={() => setActiveStep(step.id)}
                                                className={`rounded-full border-2 px-4 py-2 text-left transition-all ${isActive ? 'border-black bg-brand-dark text-white shadow-retro-sm' : 'border-black bg-white text-brand-dark hover:bg-gray-50'}`}
                                            >
                                                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
                                                    {index + 1}. {step.eyebrow.replace(`${index + 1}. `, '')}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={isArchitectureStep ? 'space-y-6' : 'grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start'}>
                                <motion.div
                                    key={`${selectedExample.id}-${activeStep}-visual`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.32, ease: 'easeOut' }}
                                    className={isArchitectureStep ? 'w-full' : ''}
                                >
                                    <StoryVisual
                                        stepId={activeStep}
                                        example={selectedExample}
                                        weights={weights}
                                        chatProbability={chatProbability}
                                        activeNetworkPhase={activeNetworkPhase}
                                        onNetworkPhaseSelect={setActiveNetworkPhase}
                                        activeLearningPhase={activeLearningPhase}
                                        onLearningPhaseSelect={setActiveLearningPhase}
                                        onAdvanceLearningPhase={advanceLearningPhase}
                                        onApplyLearningStep={applyLearningStep}
                                        errorValue={errorValue}
                                        weightShift={displayedWeightShift}
                                        hasAppliedUpdate={Boolean(lastWeightShift)}
                                    />
                                </motion.div>

                                <motion.div
                                    key={`${selectedExample.id}-${activeStep}-copy`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.32, ease: 'easeOut' }}
                                    className="space-y-4"
                                >
                                    <div className="rounded-2xl border-2 border-black bg-app-bg p-5 shadow-retro-sm">
                                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{currentStep.eyebrow}</div>
                                        <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">{currentStep.title}</h3>
                                        <p className="mt-3 text-base text-gray-700">{currentStep.description}</p>
                                    </div>

                                    <div className="grid gap-3">
                                        {[
                                            { icon: ScanSearch, title: 'Entree', text: "Le reseau commence toujours par lire l'image comme une matrice de couleurs." },
                                            { icon: Layers3, title: 'Transformation', text: "Chaque couche recombine les signaux de la precedente pour faire emerger des motifs utiles." },
                                            { icon: Brain, title: 'Decision', text: "Le resultat final n'est pas une certitude humaine, mais un calcul de probabilite." },
                                        ].map((item) => (
                                            <div key={item.title} className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-full border-2 border-black bg-brand-blue/10 p-2">
                                                        <item.icon size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{item.title}</div>
                                                        <p className="mt-1 text-sm text-gray-700">{item.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {bonusDCardIndex === 2 && (
                    <motion.section {...sectionMotion} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }} className="rounded-[28px] border-2 md:border-4 border-black bg-white p-5 md:p-8 shadow-retro-lg">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="space-y-3">
                                    <SceneBadge>Mini labo</SceneBadge>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">Fais varier les poids toi-meme.</h2>
                                        <p className="mt-2 max-w-2xl text-gray-600">
                                            Ici, tu manipules une petite simulation: trois signaux, trois poids, une probabilite. Chaque correction pousse le reseau dans une nouvelle direction.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border-2 border-black bg-app-bg px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 shadow-retro-sm">
                                    {trainingSteps} correction{trainingSteps > 1 ? 's' : ''} appliquee{trainingSteps > 1 ? 's' : ''}
                                </div>
                            </div>

                            <ExampleTabs examples={examples} selectedId={selectedExample.id} onSelect={handleExampleSelect} />

                            <div className="grid gap-5 xl:grid-cols-[0.8fr_1fr_0.85fr]">
                                <div className="space-y-4">
                                    <SourceImageCard
                                        imageUrl={selectedExample.imageUrl}
                                        alt={selectedExample.title}
                                        imageClassName={selectedExample.imageClassName}
                                        label={selectedExample.truthIsCat ? 'verite: chat' : 'verite: pas chat'}
                                        overlay={
                                            <div className="absolute inset-x-5 bottom-5 z-20 rounded-xl border-2 border-black bg-white/95 px-4 py-3 text-sm text-gray-700 shadow-retro-sm">
                                                {selectedExample.caption}
                                            </div>
                                        }
                                    />
                                    <div className="rounded-2xl border-2 border-black bg-app-bg p-4 shadow-retro-sm">
                                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Erreur actuelle</div>
                                        <div className="mt-2 text-3xl font-black">{toPercent(errorValue)}%</div>
                                        <p className="mt-2 text-sm text-gray-600">{correctionMessage}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <WeightNetworkGraphic weights={weights} activations={selectedExample.features} />
                                    {FEATURE_META.map((feature) => (
                                        <LabSlider
                                            key={feature.key}
                                            label={feature.label}
                                            value={weights[feature.key]}
                                            helper={feature.explanation}
                                            onChange={(value) => updateWeight(feature.key, value)}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <ProbabilityPanel chatProbability={chatProbability} truthIsCat={selectedExample.truthIsCat} />

                                    <div className="rounded-2xl border-2 border-black bg-app-bg p-4 shadow-retro-sm">
                                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Interaction</div>
                                        <p className="mt-2 text-sm text-gray-700">
                                            Un clic sur la correction applique une petite mise a jour des poids a partir de l'erreur du moment.
                                        </p>
                                        <div className="mt-4 flex flex-col gap-3">
                                            <motion.div whileHover={{ y: -2 }}>
                                                <Button onClick={applyLearningStep} className="w-full text-sm md:text-base">
                                                    Corriger apres erreur
                                                </Button>
                                            </motion.div>
                                            <Button variant="secondary" onClick={resetSimulation} className="w-full text-sm md:text-base">
                                                Revenir aux poids initiaux
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-retro-sm">
                                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Ce qu'il faut sentir</div>
                                        <div className="mt-3 space-y-3 text-sm text-gray-700">
                                            <p>Les signaux ne sont pas des mots: ce sont des motifs visuels quantifies.</p>
                                            <p>Les poids changent parce que le modele compare sa sortie a la verite attendue.</p>
                                            <p>Une reponse finale forte reste un calcul de probabilite, pas une comprehension humaine.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {bonusDCardIndex === 3 && (
                    <motion.section {...sectionMotion} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }} className="rounded-[28px] border-2 md:border-4 border-black bg-white p-5 md:p-8 shadow-retro-lg">
                        <div className="flex flex-col items-center justify-center gap-8 text-center">
                            <div className="space-y-5 max-w-3xl">
                                <SceneBadge>A retenir</SceneBadge>
                                <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Reconnaître une image n'est pas la comprendre.</h2>
                                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-700 md:text-2xl">
                                    Le modele convertit, extrait, pondere, puis choisit la reponse la plus probable. C'est puissant, mais ca reste sensible aux motifs qu'il a appris a privilegier.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                <Button variant="secondary" onClick={() => switchTest('BONUS_MENU')} className="px-4 py-3 text-sm md:text-base">
                                    Retour aux bonus
                                </Button>
                                <motion.div whileHover={{ y: -2 }}>
                                    <Button onClick={() => switchTest('CONCLUSION')} className="px-4 py-3 text-sm md:text-base">
                                        Continuer le parcours <ArrowRight className="ml-2 inline" size={16} />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>
                )}

                <div className="flex flex-col gap-4 rounded-[24px] border-2 border-black bg-white px-5 py-4 shadow-retro-sm md:flex-row md:items-center md:justify-between">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">
                        Carte {bonusDCardIndex + 1} / {bonusDTotalCards}
                    </div>
                    <div className="flex flex-wrap gap-3 md:justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setBonusDCardIndex((current) => Math.max(0, current - 1))}
                            disabled={bonusDCardIndex === 0}
                            className="px-4 py-3 text-sm md:text-base"
                        >
                            Precedent
                        </Button>
                        <Button
                            onClick={() => setBonusDCardIndex((current) => Math.min(bonusDTotalCards - 1, current + 1))}
                            disabled={bonusDCardIndex === bonusDTotalCards - 1}
                            className="px-4 py-3 text-sm md:text-base"
                        >
                            Suivant <ArrowRight className="ml-2 inline" size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
