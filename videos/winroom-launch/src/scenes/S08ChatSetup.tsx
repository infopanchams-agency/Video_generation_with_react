import type {CamKey} from '../ui/fx';
import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {float, glow, LightPool, Marker, pop, SceneShell} from '../ui/fx';
import {Mono, Panel, typed} from '../ui/kit';

const NODE_HITS = ['s08Node1', 's08Node2', 's08Node3', 's08Node4'];
const NODE_W = 360;
const NODE_H = 108;
// Inbound line -> Site-visit leads -> Pune team, missed -> WhatsApp
const NODES: [number, number][] = [
	[980, 200],
	[980, 430],
	[1400, 430],
	[1400, 660],
];
// Each edge draws in over the beat before the node it points to.
const EDGES = [
	{to: 1, x1: 1160, y1: 308, x2: 1160, y2: 430, label: null},
	{to: 2, x1: 1340, y1: 484, x2: 1400, y2: 484, label: null},
	{to: 3, x1: 1580, y1: 538, x2: 1580, y2: 660, label: COPY.s08.missedEdge},
];

export const S08ChatSetup: React.FC = () => {
	const {g, hit, from, t} = useScene('S08ChatSetup');
	const fps = t.fps;
	const sendAt = hit('s08Send');
	const nodesAt = NODE_HITS.map((k) => hit(k));
	const sent = g >= sendAt;
	const press = interpolate(g, [sendAt, sendAt + 3, sendAt + 8], [1, 0.9, 1], clamp);

	// Camera: the admin types and sends, then we cross to the graph as it builds.
	const cam: CamKey[] = [{at: from, box: [140, 160, 1680, 760]}];
	let keyIndex = 0;

	return (
		<SceneShell id="S08ChatSetup" cam={cam}>
			<LightPool x={510} y={540} r={700} color={colors.signalCyan} g={g} fps={fps} strength={0.22} />
			<LightPool x={1300} y={480} r={800} color={colors.signalCyan} g={g} fps={fps} at={nodesAt[0]} strength={0.3} />
			<div style={{position: 'absolute', left: 0, top: 0, ...float(g, fps, 2, 4), opacity: interpolate(g, [nodesAt[0] - 6, nodesAt[0] + 4, nodesAt[3] + 20, nodesAt[3] + 34], [1, 0.4, 0.4, 1], clamp)}}>
			<Panel style={{left: 140, top: 160, width: 740, height: 760, ...pop(g, from, fps, {tiltY: 16}), ...glow(g, sendAt, colors.amber, 0.2)}}>
				<div style={{height: 66, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', padding: '0 36px'}}>
					<Mono size={20}>{COPY.s08.breadcrumb}</Mono>
				</div>
				<div style={{padding: '44px 40px', ...pop(g, sendAt, fps, {tiltX: 20, tiltY: 0, rise: 60, from: 0.9})}}>
					<div style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: 22, color: colors.textMuted}}>{COPY.s08.sender}</div>
					<div style={{fontFamily: fonts.ui, fontSize: 38, lineHeight: 1.32, color: colors.textPrimary, marginTop: 14}}>
						{COPY.s08.messageParts.map((part) => {
							if (!part.key) {
								return <span key={part.text}>{part.text}</span>;
							}
							// Key phrases get the marker one after another once the message lands.
							const at = sendAt + 10 + keyIndex++ * 6;
							return (
								<Marker key={part.text} g={g} at={at}>
									{part.text}
								</Marker>
							);
						})}
					</div>
				</div>
				{/* input: the admin's message types out, then sends on the hit */}
				<div
					style={{
						position: 'absolute',
						left: 32,
						right: 32,
						bottom: 32,
						height: 72,
						borderRadius: 12,
						border: `1.5px solid ${colors.border}`,
						backgroundColor: colors.surface,
						display: 'flex',
						alignItems: 'center',
						padding: '0 12px 0 24px',
						gap: 16,
					}}
				>
					<div
						style={{
							flex: 1,
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							direction: 'rtl', // keep the newest typed text in view
							textAlign: 'left',
							fontFamily: fonts.ui,
							fontSize: 26,
							color: sent ? colors.textMuted : colors.textPrimary,
						}}
					>
						<bdi>{sent ? COPY.s08.placeholder : typed(COPY.s08.message, g, from, sendAt - from - 2)}</bdi>
					</div>
					<div style={{width: 50, height: 50, borderRadius: 10, backgroundColor: colors.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: press}}>
						<svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.onAmber} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 19V5M5 12l7-7 7 7" />
						</svg>
					</div>
				</div>
			</Panel>
			</div>

			{/* flow graph builds in Signal Cyan, one node per beat */}
			<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
				{EDGES.map((e) => {
					const at = nodesAt[e.to] - 8;
					const p = interpolate(g, [at, at + 8], [0, 1], {...clamp, easing: entryEase});
					const x = e.x1 + (e.x2 - e.x1) * p;
					const y = e.y1 + (e.y2 - e.y1) * p;
					const vertical = e.x1 === e.x2;
					return (
						<g key={e.to}>
							<line x1={e.x1} y1={e.y1} x2={x} y2={y} stroke={colors.cyanInk} strokeWidth={3} style={{filter: `drop-shadow(0 0 6px ${colors.signalCyan})`}} />
							<polygon
								points={vertical ? '-7,-12 7,-12 0,0' : '-12,-7 -12,7 0,0'}
								fill={colors.cyanInk}
								transform={`translate(${x} ${y})`}
								opacity={p > 0.1 ? 1 : 0}
							/>
							{e.label ? (
								<text x={e.x1 + 18} y={(e.y1 + e.y2) / 2 + 6} fill={colors.textMuted} fontFamily={fonts.mono} fontSize={19} opacity={p}>
									{e.label}
								</text>
							) : null}
						</g>
					);
				})}
			</svg>
			{COPY.s08.nodes.map((n, i) => (
				<div
					key={n.label}
					style={{
						position: 'absolute',
						left: NODES[i][0],
						top: NODES[i][1],
						width: NODE_W,
						height: NODE_H,
						boxSizing: 'border-box',
						border: `2px solid ${colors.cyanInk}`,
						borderRadius: 10,
						padding: '22px 26px',
						backgroundColor: colors.surface,
						...pop(g, nodesAt[i], fps, {tiltX: 30, tiltY: i % 2 ? 20 : -20, rise: 40, from: 0.6}),
						...glow(g, nodesAt[i], colors.signalCyan, 0.4),
					}}
				>
					<Mono size={18} style={{letterSpacing: '0.04em'}}>
						{n.label}
					</Mono>
					<Mono size={32} color={colors.textPrimary} style={{marginTop: 8}}>
						{n.value}
					</Mono>
				</div>
			))}
		</SceneShell>
	);
};
