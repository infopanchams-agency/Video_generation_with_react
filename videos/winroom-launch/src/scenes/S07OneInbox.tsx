import {interpolate, spring} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {float, glow, LightPool, pop, SceneShell} from '../ui/fx';
import {CoachingCard, Mono, Panel} from '../ui/kit';

const ROW_HITS = ['s07Voice', 's07WhatsApp', 's07Email', 's07LinkedIn'];
const ROW_Y = 148; // first row, inside the timeline card
const ROW_STEP = 101;
const CARD = {left: 140, top: 140};

export const S07OneInbox: React.FC = () => {
	const {g, hit, from, t} = useScene('S07OneInbox');
	const fps = t.fps;
	const rowsAt = ROW_HITS.map((k) => hit(k));
	const stackAt = hit('s07Playbook');
	const lineEnd = interpolate(g, [rowsAt[0], rowsAt[3] + 8], [0, 3 * ROW_STEP + 40], {...clamp, easing: entryEase});

	// Camera: follow the rows down the timeline, then cross to the playbook stack.
	const cam = [
		{at: from, fx: 560, fy: 420, s: 1.3},
		{at: rowsAt[1], fx: 560, fy: 480, s: 1.28, dur: 12},
		{at: rowsAt[3], fx: 560, fy: 560, s: 1.25, dur: 12},
		{at: stackAt - 8, fx: 1440, fy: 440, s: 1.28, dur: 16},
		{at: stackAt + 40, fx: 960, fy: 540, s: 1.0, dur: 26},
	];

	return (
		<SceneShell id="S07OneInbox" cam={cam}>
			<LightPool x={560} y={540} r={800} color="#7B5CFF" g={g} fps={fps} strength={0.3} />
			<LightPool x={1440} y={420} r={600} color={colors.amber} g={g} fps={fps} at={stackAt} strength={0.3} />

			{/* one contact timeline */}
			<div style={{position: 'absolute', ...CARD, ...float(g, fps, 1, 5)}}>
				<Panel style={{left: 0, top: 0, width: 840, height: 800, ...pop(g, from, fps, {tiltY: 16})}}>
					<div style={{position: 'absolute', left: 49, top: 46, fontFamily: fonts.ui, fontWeight: 600, fontSize: 44, color: colors.textPrimary}}>{COPY.lead.name}</div>
					<Mono size={19} style={{position: 'absolute', right: 48, top: 72}}>
						{COPY.s07.timelineLabel}
					</Mono>
					<div style={{position: 'absolute', left: 58, top: ROW_Y + 9, width: 2, height: lineEnd, backgroundColor: colors.signalCyan, boxShadow: `0 0 12px ${colors.signalCyan}`}} />
					{COPY.s07.rows.map((row, i) => {
						const at = rowsAt[i];
						const ping = interpolate(g, [at, at + 14], [0, 1], clamp);
						return (
							<div key={row.channel} style={{position: 'absolute', left: 49, top: ROW_Y + i * ROW_STEP, ...pop(g, at, fps, {tiltX: 0, tiltY: 30, rise: 0, from: 0.9})}}>
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										width: 20,
										height: 20,
										borderRadius: 10,
										border: `2.5px solid ${colors.signalCyan}`,
										backgroundColor: g >= at ? colors.signalCyan : colors.surface,
										boxSizing: 'border-box',
										boxShadow: `0 0 0 ${ping * 16}px ${colors.signalCyan}${Math.round((1 - ping) * 140)
											.toString(16)
											.padStart(2, '0')}`,
									}}
								/>
								<Mono size={19} color={colors.signalCyan} style={{position: 'absolute', left: 48, top: -2, letterSpacing: '0.04em'}}>
									{row.channel}
								</Mono>
								<div style={{position: 'absolute', left: 48, top: 26, whiteSpace: 'nowrap', fontFamily: fonts.ui, fontSize: 32, color: colors.textPrimary}}>{row.text}</div>
							</div>
						);
					})}
				</Panel>
			</div>

			{/* coached by your own playbook: layered stack flying in */}
			{COPY.s07.playbook.map((file, i) => {
				const at = stackAt + i * 3;
				const p = spring({frame: g - at, fps, config: {damping: 12, stiffness: 140}});
				return (
					<div
						key={file}
						style={{
							position: 'absolute',
							left: 1100,
							top: 0,
							width: 680,
							height: 78,
							boxSizing: 'border-box',
							padding: '0 32px',
							display: 'flex',
							alignItems: 'flex-end',
							paddingBottom: 18,
							backgroundColor: colors.surfaceRaised,
							border: `1.5px solid ${colors.signalCyan}55`,
							borderRadius: 14,
							translate: `${(1 - p) * 260}px ${400 + i * 68 + (1 - p) * 500}px`,
							rotate: `${(1 - p) * (12 + i * 6)}deg`,
							opacity: interpolate(g, [at, at + 5], [0, 1], clamp),
							boxShadow: `0 30px 60px -20px ${colors.shadow}, 0 0 30px ${colors.signalCyan}22`,
							zIndex: 3 - i,
						}}
					>
						<Mono size={20}>{file}</Mono>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 1100, top: 140, zIndex: 5, ...float(g, fps, 4, 5)}}>
				<CoachingCard
					labelSize={26}
					hintSize={42}
					g={g}
					markAt={stackAt + 10}
					style={{left: 0, top: 0, width: 680, height: 290, boxSizing: 'border-box', ...pop(g, rowsAt[0], fps, {tiltY: -18}), ...glow(g, stackAt, colors.amber)}}
				/>
			</div>
		</SceneShell>
	);
};
