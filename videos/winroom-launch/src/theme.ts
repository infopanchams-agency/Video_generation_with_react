import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadSpace} from '@remotion/google-fonts/SpaceGrotesk';
import {Easing} from 'remotion';

// All colours live here so they can be changed in one place.
// graphite, amber and signalCyan come from the PROJECT VALUES table.
// v3 (Vikas): white background. Graphite is now the "ink" of the one dark
// card per scene (the coaching card, captions), not the page.
export const colors = {
	graphite: '#0E0F11',
	amber: '#F2A93B', // Winroom accent (provisional)
	signalCyan: '#2FD3E0',
	cyanInk: '#0FA5B4', // Signal Cyan, one step deeper so lines and labels read on white
	coral: '#FF5D73', // the "problem" accent in S03
	violet: '#7B5CFF', // background tint only
	canvas: '#F7F6F2', // page background (warm white)
	ink: '#15171B', // dark card background (coaching card, captions)
	onInk: '#F4F4F1', // text on the dark card
	textPrimary: '#15171B',
	textMuted: '#6A6E76',
	textDim: '#C3C5CA', // questions that have already been asked
	onAmber: '#16130D', // text on amber buttons, chips and markers
	surface: '#FFFFFF', // UI panels
	surfaceRaised: '#FFFFFF',
	surfaceSunken: '#F3F4F6',
	border: '#E3E4E8',
	tileFill: '#FFFFFF',
	tileBar: '#D8DADF',
	gridDot: 'rgba(21, 23, 27, 0.10)',
	gridLine: 'rgba(21, 23, 27, 0.045)',
	shadow: 'rgba(21, 23, 27, 0.16)',
} as const;

// Per-scene background: two pastel washes over the warm white canvas.
// (Vikas approved gradients and glow, overriding the brief's
// "no soft gradients, no glows" rule.)
export const scenePalettes: Record<string, {wash: [string, string]}> = {
	S01Hook: {wash: ['#DCE6FF', '#D5F4F2']},
	S02Questions: {wash: ['#E6DEFF', '#DCE6FF']},
	S03Fragmented: {wash: ['#FFDDE2', '#E4E6F5']},
	S04Reveal: {wash: ['#FFE6BE', '#FFF3DF']},
	S05LiveCall: {wash: ['#D5F3F5', '#E0E6FF']},
	S06PostCall: {wash: ['#DCE7FF', '#D5F4F0']},
	S07OneInbox: {wash: ['#E6DEFF', '#D5F3F5']},
	S08ChatSetup: {wash: ['#D3F2F4', '#DFE5FF']},
	S09Loop: {wash: ['#FFE6BE', '#D5F3F5']},
	S10EndCard: {wash: ['#FFE3B8', '#EAE6FF']},
};

export const fonts = {
	headline: loadSpace('normal', {weights: ['700'], subsets: ['latin']}).fontFamily,
	ui: loadInter('normal', {weights: ['400', '600'], subsets: ['latin']}).fontFamily,
	mono: loadMono('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
};

// Entry easing from the brief: Easing.bezier(0.16, 1, 0.3, 1), clamped both ends.
export const entryEase = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

// Words slide 24 px up and fade in over 8 frames.
export const WORD_RISE_PX = 24;
export const WORD_IN_FRAMES = 8;
