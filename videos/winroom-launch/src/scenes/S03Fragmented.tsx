import type React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {Cursor, enter, Mono} from '../ui/kit';

type Win = {
	label: string;
	// start (clustered, where the S01 grid was) -> end (storyboard position)
	from: [number, number];
	to: [number, number];
	w: number;
	h: number;
	drift: [number, number];
	body: React.ReactNode;
};

const Bars: React.FC = () => (
	<div style={{padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 16}}>
		{[0, 1, 2, 3].map((i) => (
			<div key={i} style={{display: 'flex', gap: 16}}>
				<div style={{width: 120, height: 7, borderRadius: 4, backgroundColor: colors.tileBar}} />
				<div style={{flex: 1, height: 5, marginTop: 1, borderRadius: 3, backgroundColor: colors.border}} />
			</div>
		))}
	</div>
);

const Keypad: React.FC = () => (
	<div style={{padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 94px)', gap: '26px 14px'}}>
		{Array.from({length: 9}).map((_, i) => (
			<div key={i} style={{height: 36, borderRadius: 18, border: `1.5px solid ${colors.border}`}} />
		))}
	</div>
);

const Sheet: React.FC = () => (
	<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)'}}>
		{Array.from({length: 25}).map((_, i) => (
			<div key={i} style={{height: 36, borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`}} />
		))}
	</div>
);

const Chat: React.FC = () => (
	<div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
		{[0, 1, 2, 3].map((i) => (
			<div
				key={i}
				style={{
					alignSelf: i % 2 ? 'flex-end' : 'flex-start',
					width: [220, 180, 260, 140][i],
					height: 34,
					borderRadius: 8,
					backgroundColor: i % 2 ? colors.border : 'transparent',
					border: `1.5px solid ${colors.border}`,
				}}
			/>
		))}
	</div>
);

export const S03Fragmented: React.FC = () => {
	const {g, hit, to, t} = useScene('S03Fragmented');
	const splitAt = hit('s03Split');
	const notesAt = hit('s03Notes');

	const wins: Win[] = [
		{label: COPY.s03.windows[0], from: [560, 300], to: [-40, 62], w: 440, h: 280, drift: [-30, -14], body: <Keypad />},
		{label: COPY.s03.windows[1], from: [920, 300], to: [1500, 42], w: 460, h: 300, drift: [30, -14], body: <Bars />},
		{label: COPY.s03.windows[2], from: [520, 560], to: [40, 852], w: 500, h: 260, drift: [-24, 18], body: <Sheet />},
		{label: COPY.s03.windows[3], from: [960, 560], to: [1460, 832], w: 440, h: 260, drift: [26, 18], body: <Chat />},
	];

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			{wins.map((w) => {
				// Split apart on the hit, then keep drifting until the cut.
				const p = interpolate(g, [splitAt, splitAt + 30], [0, 1], {...clamp, easing: entryEase});
				const d = interpolate(g, [splitAt + 30, to], [0, 1], clamp);
				const x = w.from[0] + (w.to[0] - w.from[0]) * p + w.drift[0] * d;
				const y = w.from[1] + (w.to[1] - w.from[1]) * p + w.drift[1] * d;
				return (
					<div
						key={w.label}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: w.w,
							height: w.h,
							translate: `${x}px ${y}px`,
							backgroundColor: colors.surface,
							border: `1.5px solid ${colors.border}`,
							borderRadius: 12,
							overflow: 'hidden',
							opacity: interpolate(g, [splitAt, splitAt + 10], [0.6, 1], clamp),
						}}
					>
						<div style={{height: 40, borderBottom: `1.5px solid ${colors.border}`, padding: '0 16px', display: 'flex', alignItems: 'center'}}>
							<Mono size={17}>{w.label}</Mono>
						</div>
						{w.body}
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: 460,
					top: 380,
					width: 1000,
					height: 320,
					backgroundColor: colors.surfaceRaised,
					border: `1.5px solid ${colors.border}`,
					borderRadius: 14,
					padding: '52px 56px',
					...enter(g, notesAt),
				}}
			>
				<Mono size={22}>{COPY.s03.notesLabel}</Mono>
				<div style={{display: 'flex', alignItems: 'center', marginTop: 34, fontFamily: fonts.mono, fontSize: 76, color: colors.textPrimary}}>
					{COPY.s03.notesKey}
					<span style={{color: colors.textMuted, marginLeft: 36}}>{COPY.s03.notesEmpty}</span>
					<Cursor g={g} from={notesAt} framesPerBeat={t.framesPerBeat} height={84} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
