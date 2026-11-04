import type {Caption} from '@remotion/captions';
import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import sfxMeta from '../public/audio/sfx/sfx_meta.json';
import splitReport from '../public/audio/vo/split_report.json';
import vo01 from '../public/audio/vo/vo01.words.json';
import vo02 from '../public/audio/vo/vo02.words.json';
import vo03 from '../public/audio/vo/vo03.words.json';
import vo04 from '../public/audio/vo/vo04.words.json';
import vo05a from '../public/audio/vo/vo05a.words.json';
import vo05b from '../public/audio/vo/vo05b.words.json';
import vo06a from '../public/audio/vo/vo06a.words.json';
import vo06b from '../public/audio/vo/vo06b.words.json';
import vo07 from '../public/audio/vo/vo07.words.json';
import vo08 from '../public/audio/vo/vo08.words.json';
import vo09 from '../public/audio/vo/vo09.words.json';
import vo10a from '../public/audio/vo/vo10a.words.json';
import vo10b from '../public/audio/vo/vo10b.words.json';
import film from '../timing.json';
import square from '../timing.square.json';

// timing.json / timing.square.json are the single source of truth for every
// frame, beat and audio event. Scenes read frames through useScene() only.

export type Layout = '16x9' | '1x1';
export type SceneId =
	| 'S01Hook'
	| 'S02Questions'
	| 'S03Fragmented'
	| 'S04Reveal'
	| 'S05LiveCall'
	| 'S06PostCall'
	| 'S07OneInbox'
	| 'S08ChatSetup'
	| 'S09Loop'
	| 'S10EndCard';
export type VoId = keyof typeof WORDS;

type SceneT = {
	id: string;
	from: number;
	to: number;
	transitionIn?: string;
};
export type VoT = {
	id: string;
	speaker: string;
	scene: string;
	start: number;
	maxEnd: number;
	phoneFilter: boolean;
	clipFrames?: number;
};
export type HitT = {
	key: string;
	frame: number;
	what: string;
	sfx: string | null;
	alignPeak?: boolean;
};
export type TimingFile = {
	fps: number;
	framesPerBeat: number;
	durationInFrames: number;
	scenes: SceneT[];
	vo: VoT[];
	hits: HitT[];
	sfxFiles: Record<string, string>;
};

export const TIMINGS: Record<Layout, TimingFile> = {
	'16x9': film,
	'1x1': square,
};

export const WORDS = {vo01, vo02, vo03, vo04, vo05a, vo05b, vo06a, vo06b, vo07, vo08, vo09, vo10a, vo10b};
export const SFX_META: Record<string, {file: string; peakOffsetFrames: number; durationFrames: number}> = sfxMeta;

// Sync rule S5: a "fade8" scene's sequence starts 8 frames early and fades in
// over the last 8 frames of the previous scene, finishing exactly on the
// scene's `from` frame (where the impact lands). Adding those 8 frames back
// to its duration keeps every start frame and the total length as in
// timing.json.
export const FADE_FRAMES = 8;

export const sceneOf = (t: TimingFile, id: SceneId): SceneT => {
	const s = t.scenes.find((x) => x.id === id);
	if (!s) {
		throw new Error(`Scene ${id} is not in this timing file`);
	}
	return s;
};

/** Frame at which the scene's TransitionSeries.Sequence begins (includes the fade-in overlap). */
export const sequenceStart = (s: SceneT) => s.from - (s.transitionIn ? FADE_FRAMES : 0);
/** Duration of the scene's sequence, including the fade-in overlap. */
export const sequenceDuration = (s: SceneT) => s.to - sequenceStart(s);

/** Measured length of each VO clip in frames, from scripts/split_vo.py. */
export const voClipFrames = (v: VoT) => {
	const r = splitReport.find((x) => x.id === v.id);
	if (!r) {
		throw new Error(`No measured length for ${v.id}`);
	}
	const full = Math.ceil(r.lengthS * film.fps);
	return v.clipFrames ? Math.min(v.clipFrames, full) : full;
};

export type TimedWord = {text: string; from: number; to: number};

/** The VO's words in composition frames (only words inside the clip that is played). */
export const voWords = (t: TimingFile, id: VoId): TimedWord[] => {
	const v = t.vo.find((x) => x.id === id);
	if (!v) {
		return [];
	}
	const end = v.start + voClipFrames(v);
	return WORDS[id]
		.map((w) => ({
			text: w.text,
			from: v.start + Math.round((w.startMs / 1000) * t.fps),
			to: v.start + Math.round((w.endMs / 1000) * t.fps),
		}))
		.filter((w) => w.from < end);
};

/** @remotion/captions Caption objects for one VO clip, in composition time. */
export const voCaptions = (t: TimingFile, id: VoId): Caption[] =>
	voWords(t, id).map((w, i) => ({
		// TikTok-style pages join tokens as-is, so each word after the first carries its space.
		text: i === 0 ? w.text : ` ${w.text}`,
		startMs: (w.from / t.fps) * 1000,
		endMs: (w.to / t.fps) * 1000,
		timestampMs: (w.from / t.fps) * 1000,
		confidence: null,
	}));

export const LayoutContext = createContext<Layout>('16x9');

/**
 * Scene clock. `g` is the frame in composition time, so scenes compare it
 * against hit frames from timing.json directly.
 */
export const useScene = (id: SceneId) => {
	const layout = useContext(LayoutContext);
	const t = TIMINGS[layout];
	const scene = sceneOf(t, id);
	const g = useCurrentFrame() + sequenceStart(scene);
	const hit = (key: string): number => {
		const h = t.hits.find((x) => x.key === key);
		if (!h) {
			throw new Error(`Hit ${key} is not in the ${layout} timing file`);
		}
		return h.frame;
	};
	return {
		g,
		t,
		layout,
		square: layout === '1x1',
		from: scene.from,
		to: scene.to,
		hit,
		hasVo: (v: VoId) => t.vo.some((x) => x.id === v),
		words: (v: VoId) => voWords(t, v),
	};
};
