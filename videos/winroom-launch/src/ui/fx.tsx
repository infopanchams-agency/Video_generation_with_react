import type React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useVideoConfig} from 'remotion';
import {clamp, colors, entryEase, scenePalettes} from '../theme';
import type {SceneId} from '../timing';
import {useScene} from '../timing';

// ------------------------------------------------------------------ motion

const POP_SPRING = {damping: 11, stiffness: 150, mass: 0.9};

/** Energetic entry: overshoot spring with a 12 degree 3D tilt that settles flat. */
export const pop = (
	g: number,
	at: number,
	fps: number,
	opts: {tiltX?: number; tiltY?: number; rise?: number; from?: number} = {},
): React.CSSProperties => {
	const p = spring({frame: g - at, fps, config: POP_SPRING});
	const tx = opts.tiltX ?? 12;
	const ty = opts.tiltY ?? -8;
	const rise = opts.rise ?? 70;
	const s0 = opts.from ?? 0.82;
	return {
		opacity: interpolate(g, [at, at + 5], [0, 1], clamp),
		transform: `perspective(1600px) translateY(${(1 - p) * rise}px) rotateX(${(1 - p) * tx}deg) rotateY(${(1 - p) * ty}deg) scale(${s0 + (1 - s0) * p})`,
	};
};

/** Gentle idle float so nothing sits dead still. `seed` de-syncs neighbours. */
export const float = (g: number, fps: number, seed: number, amp = 7): React.CSSProperties => {
	const t = g / fps;
	return {
		translate: `${Math.sin(t * 0.9 + seed * 1.7) * amp * 0.5}px ${Math.sin(t * 1.3 + seed) * amp}px`,
		rotate: `${Math.sin(t * 0.7 + seed * 2.3) * 0.5}deg`,
	};
};

/** Border light-up on a hit: bright ring that settles to a soft halo. */
export const glow = (g: number, at: number, color: string, hold = 0.35): React.CSSProperties => {
	if (g < at) {
		return {};
	}
	const k = interpolate(g, [at, at + 4, at + 24], [0, 1, hold], clamp);
	const a = Math.round(k * 255)
		.toString(16)
		.padStart(2, '0');
	const soft = Math.round(k * 110)
		.toString(16)
		.padStart(2, '0');
	return {boxShadow: `0 0 0 2px ${color}${a}, 0 0 60px 6px ${color}${soft}, 0 40px 90px -20px ${colors.shadow}`};
};

/** Default drop shadow that lifts cards off the background. */
export const lift: React.CSSProperties = {boxShadow: `0 40px 90px -20px ${colors.shadow}`};

// ------------------------------------------------------------------ marker

/** Highlighter marker: an amber block sweeps in under the word, the text turns dark on it. */
export const Marker: React.FC<{
	readonly g: number;
	readonly at: number;
	readonly color?: string;
	readonly baseText?: string;
	readonly dim?: number; // 0..1, fades the marker (e.g. an earlier question)
	readonly children: React.ReactNode;
}> = ({g, at, color, baseText, dim, children}) => {
	const p = interpolate(g, [at, at + 7], [0, 1], {...clamp, easing: entryEase});
	const fade = 1 - 0.6 * (dim ?? 0);
	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span
				style={{
					position: 'absolute',
					left: '-0.1em',
					right: '-0.1em',
					top: '0.06em',
					bottom: '-0.02em',
					backgroundColor: color ?? colors.amber,
					borderRadius: '0.1em',
					transformOrigin: 'left center',
					scale: `${p} 1`,
					rotate: '-1.2deg',
					opacity: fade,
				}}
			/>
			<span
				style={{
					position: 'relative',
					// Dark on the marker; back to the surrounding colour when the marker dims.
					color: interpolateColors(p * (1 - (dim ?? 0)), [0.35, 0.75], [baseText ?? colors.textPrimary, colors.onAmber]),
				}}
			>
				{children}
			</span>
		</span>
	);
};

// ------------------------------------------------------------------ camera

export type CamKey = {at: number; fx: number; fy: number; s: number; dur?: number};

const camEase = Easing.bezier(0.7, 0, 0.2, 1);

const resolveCamera = (g: number, keys: CamKey[]) => {
	let {fx, fy, s} = keys[0];
	for (const k of keys.slice(1)) {
		const p = interpolate(g, [k.at, k.at + (k.dur ?? 16)], [0, 1], {...clamp, easing: camEase});
		fx += (k.fx - fx) * p;
		fy += (k.fy - fy) * p;
		s += (k.s - s) * p;
	}
	return {fx, fy, s};
};

// ------------------------------------------------------------------ background

const Backdrop: React.FC<{readonly id: SceneId; readonly g: number; readonly fps: number; readonly camX: number; readonly camY: number}> = ({
	id,
	g,
	fps,
	camX,
	camY,
}) => {
	const pal = scenePalettes[id];
	const t = g / fps;
	const mask = 'radial-gradient(ellipse 75% 70% at 50% 50%, black 25%, transparent 90%)';
	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(90% 80% at ${18 + Math.sin(t * 0.4) * 6}% ${8 + Math.cos(t * 0.3) * 6}%, ${pal.wash[0]} 0%, transparent 62%), radial-gradient(85% 75% at ${88 + Math.cos(t * 0.35) * 6}% ${96 + Math.sin(t * 0.45) * 5}%, ${pal.wash[1]} 0%, transparent 60%)`,
				}}
			/>
			{/* two grid layers at different speeds = parallax depth */}
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${colors.gridDot} 1.4px, transparent 1.8px)`,
					backgroundSize: '44px 44px',
					backgroundPosition: `${-g * 0.25 - camX * 0.08}px ${-g * 0.12 - camY * 0.08}px`,
					maskImage: mask,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(${colors.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)`,
					backgroundSize: '176px 176px',
					backgroundPosition: `${-g * 0.6 - camX * 0.2}px ${-g * 0.3 - camY * 0.2}px`,
					maskImage: mask,
				}}
			/>
		</AbsoluteFill>
	);
};

/** Soft light pool behind a focal card. Lives inside the camera, so it moves with the scene. */
export const LightPool: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly r: number;
	readonly color: string;
	readonly g: number;
	readonly fps: number;
	readonly at?: number;
	readonly strength?: number;
}> = ({x, y, r, color, g, fps, at, strength}) => (
	<div
		style={{
			position: 'absolute',
			left: x - r,
			top: y - r,
			width: r * 2,
			height: r * 2,
			borderRadius: '50%',
			background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
			mixBlendMode: 'screen',
			opacity: (strength ?? 0.32) * (0.85 + 0.15 * Math.sin((g / fps) * 2.2)) * (at === undefined ? 1 : interpolate(g, [at, at + 12], [0, 1], clamp)),
			pointerEvents: 'none',
		}}
	/>
);

const Grain: React.FC<{readonly g: number}> = ({g}) => (
	<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.12, pointerEvents: 'none'}}>
		<svg width="100%" height="100%">
			<filter id="grain">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(g / 2) % 97} stitchTiles="stitch" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
			<rect width="100%" height="100%" filter="url(#grain)" />
		</svg>
	</AbsoluteFill>
);

const Vignette: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 48%, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
);

// ------------------------------------------------------------------ scene shell

const WHIP_IN = 7;
const WHIP_OUT = 6;

/**
 * Wraps every scene: coloured background with parallax grid, a camera that
 * pans card to card, whip-pan cuts (no overlap, so scene timing is
 * unchanged), vignette and film grain.
 */
export const SceneShell: React.FC<{
	readonly id: SceneId;
	readonly cam: CamKey[];
	readonly children: React.ReactNode;
}> = ({id, cam, children}) => {
	const {g, from, to, fadeIn, isLast} = useScene(id);
	const {width, height, fps} = useVideoConfig();
	const c = resolveCamera(g, cam);
	const breathe = 1 + interpolate(g, [from, to], [0, 0.03], clamp); // slow push-in under the moves
	// Whip pan: incoming scene flies in from the right, outgoing leaves to the left.
	const inP = from === 0 || fadeIn ? 0 : interpolate(g, [from, from + WHIP_IN], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const outP = isLast ? 0 : interpolate(g, [to - WHIP_OUT, to], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const dx = (inP - outP) * width * 0.4;
	const blur = (inP + outP) * 26;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Backdrop id={id} g={g} fps={fps} camX={c.fx + dx} camY={c.fy} />
			<AbsoluteFill style={{translate: `${dx}px 0px`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
				<AbsoluteFill
					style={{
						transformOrigin: '0 0',
						transform: `translate(${width / 2}px, ${height / 2}px) scale(${c.s * breathe}) translate(${-c.fx}px, ${-c.fy}px)`,
					}}
				>
					{children}
				</AbsoluteFill>
			</AbsoluteFill>
			<Vignette />
			<Grain g={g} />
		</AbsoluteFill>
	);
};
