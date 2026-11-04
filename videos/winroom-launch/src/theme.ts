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
	surface: '#1C1D20', // UI panels
	surfaceRaised: '#232428',
	surfaceSunken: '#151619',
	border: '#2C2E33',
	tileFill: '#18191C',
	tileBar: '#3A3C41',
} as const;

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
