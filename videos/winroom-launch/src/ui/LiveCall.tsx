import type React from 'react';
import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import type {TimedWord} from '../timing';
import {glow, Marker, pop} from './fx';
import {Chip, CoachingCard, Mono, PhoneIcon} from './kit';

/** Words that type into the transcript as they are spoken. */
const SpokenLine: React.FC<{
	readonly text: string;
	readonly words: TimedWord[];
	readonly g: number;
	readonly style: React.CSSProperties;
	readonly keyIndex: number | null; // word that gets the highlighter marker
	readonly keyColor: string;
}> = ({text, words, g, style, keyIndex, keyColor}) => (
	<div style={style}>
		{text.split(' ').map((w, i) => {
			const at = words[i]?.from ?? null; // a word with no timing never shows
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						marginRight: '0.25em',
						opacity: at === null ? 0 : interpolate(g, [at, at + 4], [0, 1], clamp),
						translate: at === null ? undefined : `0px ${interpolate(g, [at, at + 6], [14, 0], {...clamp, easing: entryEase})}px`,
					}}
				>
					{i === keyIndex && at !== null ? (
						<Marker g={g} at={at + 3} color={keyColor} baseText={style.color as string}>
							{w}
						</Marker>
					) : (
						w
					)}
				</span>
			);
		})}
	</div>
);

const pad2 = (n: number) => String(n).padStart(2, '0');

export const LiveCall: React.FC<{
	readonly g: number;
	readonly fps: number;
	readonly square: boolean;
	readonly dialAt: number;
	readonly connectAt: number;
	readonly cardAt: number;
	readonly customerWords: TimedWord[];
	readonly repWords: TimedWord[] | null;
}> = ({g, fps, square, dialAt, connectAt, cardAt, customerWords, repWords}) => {
	const L = square
		? {
				panel: {left: 40, top: 40, width: 1000, height: 860},
				bar: 64,
				name: 46,
				body: 30,
				line: 34,
				mono: 19,
				lead: {left: 36, top: 92},
				button: {left: 640, top: 104, width: 324, height: 70},
				transcript: {left: 36, top: 290, width: 928},
				colB: 470,
				card: {left: 36, top: 590, width: 928, labelSize: 26, hintSize: 40},
			}
		: {
				panel: {left: 72, top: 97, width: 1776, height: 1000},
				bar: 66,
				name: 54,
				body: 28,
				line: 34,
				mono: 20,
				lead: {left: 41, top: 113},
				button: {left: 41, top: 353, width: 420, height: 74},
				transcript: {left: 540, top: 106, width: 720},
				colB: 352,
				card: {left: 1302, top: 110, width: 440, labelSize: 26, hintSize: 44},
			};

	const connected = g >= connectAt;
	const secs = Math.max(0, Math.floor((g - connectAt) / fps)) + 1; // dummy call timer
	const press = interpolate(g, [dialAt, dialAt + 3, dialAt + 8], [1, 0.9, 1], clamp);
	// Ringing pulse on the call button while the call is live.
	const ring = connected ? ((g - connectAt) % fps) / fps : 0;

	return (
		<div style={{position: 'absolute', ...L.panel, backgroundColor: colors.surface, border: `1.5px solid ${colors.border}`, borderRadius: 20, overflow: 'hidden'}}>
			{/* top bar */}
			<div style={{height: L.bar, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px'}}>
				<Mono size={L.mono}>{COPY.lead.breadcrumb}</Mono>
				<Mono size={L.mono} color={colors.textPrimary} style={{opacity: connected ? 1 : 0, display: 'flex', alignItems: 'center', gap: 10}}>
					<span
						style={{
							width: 12,
							height: 12,
							borderRadius: 6,
							backgroundColor: colors.amber,
							display: 'inline-block',
							boxShadow: `0 0 0 ${6 * ring}px ${colors.amber}${Math.round((1 - ring) * 120)
								.toString(16)
								.padStart(2, '0')}`,
						}}
					/>
					{`${COPY.s05.live} · 00:00:${pad2(secs)}`}
				</Mono>
			</div>

			{/* lead */}
			<div style={{position: 'absolute', ...L.lead}}>
				<div style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: L.name, color: colors.textPrimary}}>{COPY.lead.name}</div>
				<Chip size={L.body * 0.9} style={{marginTop: 22}}>
					{COPY.lead.status}
				</Chip>
				<Mono size={L.mono} style={{marginTop: 22}}>
					{COPY.lead.owner}
				</Mono>
			</div>
			<div
				style={{
					position: 'absolute',
					...L.button,
					borderRadius: 12,
					backgroundColor: colors.amber,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 16,
					scale: press,
					boxShadow: connected
						? `0 0 0 ${14 * ring}px ${colors.amber}${Math.round((1 - ring) * 90)
								.toString(16)
								.padStart(2, '0')}, 0 12px 40px -6px ${colors.amber}88`
						: `0 12px 40px -6px ${colors.amber}55`,
				}}
			>
				<PhoneIcon size={L.body * 1.05} color={colors.onAmber} />
				<span style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: L.body * 1.1, color: colors.onAmber}}>
					{connected ? COPY.s05.onCall : COPY.s05.callButton}
				</span>
			</div>

			{/* transcript */}
			<div
				style={{
					position: 'absolute',
					...L.transcript,
					height: square ? 270 : 900,
					borderLeft: square ? 'none' : `1.5px solid ${colors.border}`,
					borderRight: square ? 'none' : `1.5px solid ${colors.border}`,
					borderTop: square ? `1.5px solid ${colors.border}` : 'none',
					padding: square ? '22px 0 0 0' : '0 40px',
					top: square ? L.transcript.top - 28 : L.transcript.top - 106,
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: square ? 0 : 46}}>
					<Mono size={L.mono}>{COPY.s05.transcript}</Mono>
					<Mono size={L.mono}>{COPY.s05.lang}</Mono>
				</div>
				<div style={{display: 'flex', marginTop: 24, paddingBottom: 14, borderBottom: `1.5px solid ${colors.border}`}}>
					<Mono size={L.mono * 0.92} style={{width: L.colB}}>
						{COPY.s05.repHeader}
					</Mono>
					<Mono size={L.mono * 0.92}>{COPY.s05.customerHeader}</Mono>
				</div>
				<div style={{position: 'relative'}}>
					<div style={{position: 'absolute', left: 0, top: 30, width: L.colB - 40, fontFamily: fonts.ui, fontSize: L.body, lineHeight: 1.25, color: colors.textMuted}}>
						{COPY.s05.repEarlier}
					</div>
					<SpokenLine
						text={COPY.s05.customerLine}
						words={customerWords}
						g={g}
						keyIndex={3}
						keyColor={colors.signalCyan}
						style={{
							position: 'absolute',
							left: L.colB,
							top: square ? 30 : 120,
							width: (square ? 928 : 640) - L.colB,
							fontFamily: fonts.ui,
							fontSize: L.line,
							lineHeight: 1.22,
							color: repWords ? colors.textMuted : colors.textPrimary,
						}}
					/>
					{repWords ? (
						<SpokenLine
							text={COPY.s06.repReply}
							words={repWords}
							g={g}
							keyIndex={2}
							keyColor={colors.amber}
							style={{
								position: 'absolute',
								left: 0,
								top: square ? 150 : 300,
								width: L.colB - 30,
								fontFamily: fonts.ui,
								fontSize: L.line,
								lineHeight: 1.22,
								color: colors.textPrimary,
							}}
						/>
					) : null}
				</div>
			</div>

			{/* coaching card: one at a time */}
			<CoachingCard
				labelSize={L.card.labelSize}
				hintSize={L.card.hintSize}
				g={g}
				markAt={cardAt + 14}
				style={{
					left: L.card.left,
					top: L.card.top,
					width: L.card.width,
					boxSizing: 'border-box',
					...pop(g, cardAt, fps, {tiltX: 8, tiltY: -24, rise: 50}),
					...glow(g, cardAt, colors.amber),
				}}
			/>
		</div>
	);
};
