import type React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {LiveCall} from '../ui/LiveCall';
import {Chip, Cursor, enter, Mono, Panel, slideIn, typed} from '../ui/kit';

const TYPE_FRAMES = 10; // a CRM field types out over 10 frames from its hit

/** Signal Cyan connector that draws from 0 to full length over `frames`. */
const Connector: React.FC<{
	readonly g: number;
	readonly at: number;
	readonly x1: number;
	readonly y1: number;
	readonly x2: number;
	readonly y2: number;
}> = ({g, at, x1, y1, x2, y2}) => {
	const p = interpolate(g, [at, at + 10], [0, 1], {...clamp, easing: entryEase});
	const len = Math.hypot(x2 - x1, y2 - y1);
	const ang = Math.atan2(y2 - y1, x2 - x1);
	return (
		<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
			<line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={colors.signalCyan} strokeWidth={2.5} />
			<polygon
				points="0,-7 12,0 0,7"
				fill={colors.signalCyan}
				transform={`translate(${x1 + Math.cos(ang) * (len * p - 12)} ${y1 + Math.sin(ang) * (len * p - 12)}) rotate(${(ang * 180) / Math.PI})`}
				opacity={p > 0.05 ? 1 : 0}
			/>
		</svg>
	);
};

const Tick: React.FC<{readonly size: number; readonly g: number; readonly at: number}> = ({size, g, at}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{marginLeft: size * 0.5, opacity: interpolate(g, [at, at + 6], [0, 1], clamp)}}>
		<path
			d="M4 12.5l5 5L20 6.5"
			fill="none"
			stroke={colors.signalCyan}
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeDasharray={26}
			strokeDashoffset={interpolate(g, [at, at + 6], [26, 0], clamp)}
		/>
	</svg>
);

export const S06PostCall: React.FC = () => {
	const {g, hit, words, square, t} = useScene('S06PostCall');
	const endsAt = hit('s06CallEnds');
	const crm = [hit('s06Crm1'), hit('s06Crm2')];
	const taskAt = hit('s06Task');

	// Before the call ends the rep's reply types into the live transcript.
	if (g < endsAt) {
		return (
			<AbsoluteFill style={{backgroundColor: colors.graphite}}>
				<LiveCall
					g={g}
					fps={t.fps}
					square={square}
					dialAt={hit('s05Dial')}
					connectAt={hit('s05Connect')}
					cardAt={hit('s05Card')}
					customerWords={words('vo05a')}
					repWords={words('vo06a')}
				/>
			</AbsoluteFill>
		);
	}

	const L = square
		? {
				call: {left: 60, top: 60, width: 960, height: 230},
				crm: {left: 60, top: 350, width: 960, height: 270},
				task: {left: 60, top: 690, width: 960, height: 170},
				field: 31,
				a1: [540, 290, 540, 350],
				a2: [540, 620, 540, 690],
			}
		: {
				call: {left: 140, top: 300, width: 460, height: 300},
				crm: {left: 760, top: 220, width: 1020, height: 360},
				task: {left: 760, top: 700, width: 1020, height: 170},
				field: 40,
				a1: [600, 450, 760, 450],
				a2: [1270, 580, 1270, 700],
			};

	const taskCheck = interpolate(g, [taskAt + 4, taskAt + 10], [0, 1], clamp);

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			<Panel style={{...L.call, padding: '44px 36px', boxSizing: 'border-box'}}>
				<Mono size={19}>{COPY.s06.callEnded}</Mono>
				<div style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: 46, color: colors.textPrimary, marginTop: 18}}>{COPY.lead.name}</div>
				<div
					style={{
						marginTop: 26,
						display: 'inline-block',
						opacity: interpolate(g, [endsAt, endsAt + 6], [0, 1], clamp),
						scale: interpolate(g, [endsAt, endsAt + 10], [0.8, 1], {...clamp, easing: entryEase}),
						transformOrigin: 'left center',
					}}
				>
					<Chip size={32} filled>
						{COPY.s06.outcome}
					</Chip>
				</div>
			</Panel>

			<Connector g={g} at={crm[0] - 10} x1={L.a1[0]} y1={L.a1[1]} x2={L.a1[2]} y2={L.a1[3]} />

			<Panel style={{...L.crm, boxSizing: 'border-box', ...enter(g, endsAt, 10)}}>
				<div style={{height: 66, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', padding: '0 36px'}}>
					<Mono size={19}>{COPY.s06.crmBreadcrumb}</Mono>
				</div>
				<div style={{padding: square ? '34px 36px' : '48px 36px', display: 'flex', flexDirection: 'column', gap: square ? 28 : 36}}>
					{COPY.s06.fields.map((f, i) => {
						const at = crm[i];
						const typing = g >= at && g < at + TYPE_FRAMES + t.framesPerBeat;
						return (
							<div key={f.key} style={{display: 'flex', alignItems: 'center', fontFamily: fonts.mono, fontSize: L.field, opacity: g >= at ? 1 : 0}}>
								<span style={{color: colors.textMuted}}>{f.key}</span>
								<span style={{color: colors.textPrimary, marginLeft: L.field * 0.6}}>{typed(f.value, g, at, TYPE_FRAMES)}</span>
								{typing ? <Cursor g={g} from={at + 999} framesPerBeat={t.framesPerBeat} height={L.field * 1.1} /> : null}
								{g >= at + TYPE_FRAMES ? <Tick size={L.field * 0.9} g={g} at={at + TYPE_FRAMES} /> : null}
							</div>
						);
					})}
				</div>
			</Panel>

			<Connector g={g} at={taskAt - 10} x1={L.a2[0]} y1={L.a2[1]} x2={L.a2[2]} y2={L.a2[3]} />

			<Panel style={{...L.task, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 36px', gap: 30, ...slideIn(g, taskAt, 60)}}>
				<div
					style={{
						width: 44,
						height: 44,
						borderRadius: 10,
						border: `2px solid ${taskCheck > 0 ? colors.signalCyan : colors.textMuted}`,
						backgroundColor: taskCheck > 0 ? colors.signalCyan : 'transparent',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<svg width={30} height={30} viewBox="0 0 24 24">
						<path
							d="M4 12.5l5 5L20 6.5"
							fill="none"
							stroke={colors.graphite}
							strokeWidth={3.2}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={26}
							strokeDashoffset={26 * (1 - taskCheck)}
						/>
					</svg>
				</div>
				<div>
					<Mono size={17}>{COPY.s06.taskLabel}</Mono>
					<div style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: square ? 36 : 40, color: colors.textPrimary, marginTop: 6}}>{COPY.s06.taskTitle}</div>
					<div style={{fontFamily: fonts.ui, fontSize: 27, color: colors.textMuted, marginTop: 6}}>{COPY.s06.taskMeta}</div>
				</div>
			</Panel>
		</AbsoluteFill>
	);
};
