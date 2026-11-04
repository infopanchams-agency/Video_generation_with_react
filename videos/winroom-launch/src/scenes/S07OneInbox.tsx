import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {CoachingCard, enter, Mono, Panel, slideIn} from '../ui/kit';

const ROW_HITS = ['s07Voice', 's07WhatsApp', 's07Email', 's07LinkedIn'];
const ROW_Y = 148; // first row, inside the timeline card
const ROW_STEP = 101;

export const S07OneInbox: React.FC = () => {
	const {g, hit, from} = useScene('S07OneInbox');
	const rowsAt = ROW_HITS.map((k) => hit(k));
	const stackAt = hit('s07Playbook');
	const lineEnd = interpolate(g, [rowsAt[0], rowsAt[3] + 8], [0, 3 * ROW_STEP + 40], {...clamp, easing: entryEase});

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			{/* one contact timeline */}
			<Panel style={{left: 140, top: 140, width: 840, height: 800, ...enter(g, from, 10)}}>
				<div style={{position: 'absolute', left: 49, top: 46, fontFamily: fonts.ui, fontWeight: 600, fontSize: 44, color: colors.textPrimary}}>{COPY.lead.name}</div>
				<Mono size={19} style={{position: 'absolute', right: 48, top: 72}}>
					{COPY.s07.timelineLabel}
				</Mono>
				<div style={{position: 'absolute', left: 58, top: ROW_Y + 9, width: 2, height: lineEnd, backgroundColor: colors.signalCyan}} />
				{COPY.s07.rows.map((row, i) => (
					<div key={row.channel} style={{position: 'absolute', left: 49, top: ROW_Y + i * ROW_STEP, ...slideIn(g, rowsAt[i], -40, 10)}}>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: 20,
								height: 20,
								borderRadius: 10,
								border: `2.5px solid ${colors.signalCyan}`,
								backgroundColor: colors.surface,
								boxSizing: 'border-box',
							}}
						/>
						<Mono size={19} style={{position: 'absolute', left: 48, top: -2, letterSpacing: '0.04em'}}>
							{row.channel}
						</Mono>
						<div style={{position: 'absolute', left: 48, top: 26, whiteSpace: 'nowrap', fontFamily: fonts.ui, fontSize: 32, color: colors.textPrimary}}>{row.text}</div>
					</div>
				))}
			</Panel>

			{/* coached by your own playbook: layered stack */}
			{COPY.s07.playbook.map((file, i) => {
				const at = stackAt + i * 3;
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
							border: `1.5px solid ${colors.border}`,
							borderRadius: 14,
							translate: `0px ${interpolate(g, [at, at + 12], [900, 400 + i * 68], {...clamp, easing: entryEase})}px`,
							opacity: interpolate(g, [at, at + 6], [0, 1], clamp),
							zIndex: 3 - i,
						}}
					>
						<Mono size={20}>{file}</Mono>
					</div>
				);
			})}
			<CoachingCard
				labelSize={26}
				hintSize={42}
				style={{left: 1100, top: 140, width: 680, height: 290, boxSizing: 'border-box', zIndex: 5, ...slideIn(g, rowsAt[0], 60)}}
			/>
		</AbsoluteFill>
	);
};
