import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadSpace} from '@remotion/google-fonts/SpaceGrotesk';
import {Easing} from 'remotion';

// All colours live here so they can be changed in one place.
// graphite, amber and signalCyan come from the PROJECT VALUES table.
export const colors = {
	graphite: '#0E0F11',
	amber: '#F2A93B', // Winroom accent (provisional)
	signalCyan: '#2FD3E0',
	textPrimary: '#F2F2EE',
	textMuted: '#8B8E94',
	textDim: '#55575C', // questions that have already been asked
	onAmber: '#16130D', // text on amber buttons and chips
	// UI panels are slightly see-through so the coloured background reads through.
	surface: 'rgba(28, 29, 34, 0.86)',
	surfaceRaised: 'rgba(36, 37, 44, 0.9)',
	surfaceSunken: 'rgba(15, 16, 20, 0.9)',
	border: '#2C2E33',
	tileFill: '#18191C',
	tileBar: '#3A3C41',
	gridDot: 'rgba(255, 255, 255, 0.07)',
	gridLine: 'rgba(255, 255, 255, 0.035)',
	shadow: 'rgba(0, 0, 0, 0.6)',
} as const;

// Per-scene background: two colour washes over graphite, and the colour of
// the light pool behind the scene's focal point. (Vikas approved gradients
// and glow, overriding the brief's "no soft gradients, no glows" rule.)
export const scenePalettes: Record<string, {wash: [string, string]; pool: string}> = {
	S01Hook: {wash: ['#1B2A5C', '#0E3A4A'], pool: '#2FD3E0'},
	S02Questions: {wash: ['#2A1A5E', '#14244F'], pool: '#7B5CFF'},
	S03Fragmented: {wash: ['#3A1424', '#1A1F3A'], pool: '#FF5D73'},
	S04Reveal: {wash: ['#3A2408', '#1A1206'], pool: '#F2A93B'},
	S05LiveCall: {wash: ['#0B3B45', '#162A55'], pool: '#2FD3E0'},
	S06PostCall: {wash: ['#0F2F55', '#0B3B3F'], pool: '#2FD3E0'},
	S07OneInbox: {wash: ['#2A1A5E', '#0B3B45'], pool: '#7B5CFF'},
	S08ChatSetup: {wash: ['#073B44', '#14244F'], pool: '#2FD3E0'},
	S09Loop: {wash: ['#3A2408', '#0B3B45'], pool: '#F2A93B'},
	S10EndCard: {wash: ['#4A2C06', '#1B1A3A'], pool: '#F2A93B'},
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
