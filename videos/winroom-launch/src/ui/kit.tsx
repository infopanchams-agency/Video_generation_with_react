import type React from 'react';
import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts, WORD_IN_FRAMES, WORD_RISE_PX} from '../theme';
import {lift, Marker} from './fx';

/** Entry: fade in and slide up, starting exactly on `at`. */
export const enter = (g: number, at: number, frames = WORD_IN_FRAMES, rise = WORD_RISE_PX): React.CSSProperties => ({
	opacity: interpolate(g, [at, at + frames], [0, 1], {...clamp, easing: entryEase}),
	translate: `0px ${interpolate(g, [at, at + frames], [rise, 0], {...clamp, easing: entryEase})}px`,
});

/** Entry from the side (cards, rows). */
export const slideIn = (g: number, at: number, dx: number, frames = 12): React.CSSProperties => ({
	opacity: interpolate(g, [at, at + frames], [0, 1], {...clamp, easing: entryEase}),
	translate: `${interpolate(g, [at, at + frames], [dx, 0], {...clamp, easing: entryEase})}px 0px`,
});

/** Number of characters to show for a type-on that runs from `at` for `frames`. */
export const typed = (text: string, g: number, at: number, frames: number) =>
	text.slice(0, Math.round(interpolate(g, [at, at + frames], [0, text.length], clamp)));

export const Panel: React.FC<{
	readonly style?: React.CSSProperties;
	readonly children?: React.ReactNode;
	readonly raised?: boolean;
}> = ({style, children, raised}) => (
	<div
		style={{
			position: 'absolute',
			backgroundColor: raised ? colors.surfaceRaised : colors.surface,
			border: `1.5px solid ${colors.border}`,
			borderRadius: 18,
			overflow: 'hidden',
			...lift,
			...style,
		}}
	>
		{children}
	</div>
);

export const Mono: React.FC<{
	readonly size: number;
	readonly color?: string;
	readonly style?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({size, color, style, children}) => (
	<div style={{fontFamily: fonts.mono, fontSize: size, color: color ?? colors.textMuted, whiteSpace: 'pre', ...style}}>
		{children}
	</div>
);

export const Chip: React.FC<{
	readonly size: number;
	readonly filled?: boolean;
	readonly style?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({size, filled, style, children}) => (
	<div
		style={{
			display: 'inline-block',
			fontFamily: fonts.ui,
			fontWeight: filled ? 600 : 400,
			fontSize: size,
			lineHeight: 1,
			padding: `${size * 0.35}px ${size * 0.6}px`,
			borderRadius: size * 0.3,
			color: filled ? colors.onAmber : colors.textPrimary,
			backgroundColor: filled ? colors.amber : 'transparent',
			border: filled ? 'none' : `1.5px solid ${colors.border}`,
			...style,
		}}
	>
		{children}
	</div>
);

/** Text cursor that blinks on the beat: 15 frames on, 15 off, from `from`. */
export const Cursor: React.FC<{
	readonly g: number;
	readonly from: number;
	readonly framesPerBeat: number;
	readonly height: number;
	readonly color?: string;
}> = ({g, from, framesPerBeat, height, color}) => (
	<span
		style={{
			display: 'inline-block',
			width: Math.max(3, height * 0.05),
			height,
			marginLeft: height * 0.12,
			verticalAlign: 'middle',
			backgroundColor: color ?? colors.textPrimary,
			opacity: g < from || Math.floor((g - from) / framesPerBeat) % 2 === 0 ? 1 : 0,
		}}
	/>
);

export const PhoneIcon: React.FC<{readonly size: number; readonly color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round">
		<path d="M5 3.5h3.2l1.6 4.2-2.2 1.5a11 11 0 0 0 5.2 5.2l1.5-2.2 4.2 1.6V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z" />
	</svg>
);

/** Coaching card: amber label + one hint line. One card on screen at a time. */
export const CoachingCard: React.FC<{
	readonly style?: React.CSSProperties;
	readonly labelSize: number;
	readonly hintSize: number;
	readonly g: number;
	readonly markAt: number;
}> = ({style, labelSize, hintSize, g, markAt}) => (
	<div
		style={{
			position: 'absolute',
			backgroundColor: colors.surfaceSunken,
			border: `1.5px solid ${colors.border}`,
			borderRadius: 18,
			padding: hintSize * 0.8,
			...lift,
			...style,
		}}
	>
		<Chip size={labelSize} filled>
			{COPY.coaching.label}
		</Chip>
		<div
			style={{
				fontFamily: fonts.ui,
				fontSize: hintSize,
				lineHeight: 1.18,
				color: colors.textPrimary,
				marginTop: hintSize * 0.55,
			}}
		>
			{COPY.coaching.hintLead}
			<Marker g={g} at={markAt}>
				{COPY.coaching.hintKey}
			</Marker>
		</div>
	</div>
);
