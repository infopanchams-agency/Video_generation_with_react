import {interpolate, interpolateColors} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, fonts} from '../theme';
import {useScene} from '../timing';
import {LightPool, pop, SceneShell} from '../ui/fx';

const NODE_HITS = ['s09Call', 's09Log', 's09Coach', 's09NextCall'];
const CX = 960;
const CY = 540;
const R = 320;
const CIRC = 2 * Math.PI * R;

export const S09Loop: React.FC = () => {
	const {g, hit, from, t} = useScene('S09Loop');
	const fps = t.fps;
	const nodesAt = NODE_HITS.map((k) => hit(k));
	const startAt = nodesAt[0];
	const closeAt = hit('s09LoopClose');
	// Amber stroke runs clockwise from the top and closes exactly on s09LoopClose.
	const drawn = interpolate(g, [startAt, closeAt], [0, 1], clamp);
	const closeFlash = interpolate(g, [closeAt, closeAt + 3, closeAt + 24], [0, 1, 0], clamp);
	const pos = (i: number) => {
		const rad = ((i * 90 - 90) * Math.PI) / 180;
		return {x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad)};
	};

	// Camera rides round the loop with the stroke, then pulls back as it closes.
	const cam = [
		{at: from, fx: CX, fy: CY - 120, s: 1.35},
		...nodesAt.map((at, i) => ({at: at - 4, fx: CX + (pos(i).x - CX) * 0.45, fy: CY + (pos(i).y - CY) * 0.45, s: 1.3, dur: 10})),
		{at: closeAt - 2, fx: CX, fy: CY, s: 1.0, dur: 20},
	];

	return (
		<SceneShell id="S09Loop" cam={cam}>
			<LightPool x={CX} y={CY} r={760} color={colors.amber} g={g} fps={fps} strength={0.22 + 0.35 * closeFlash} />
			<LightPool x={CX} y={CY} r={420} color={colors.signalCyan} g={g} fps={fps} at={startAt} strength={0.18} />
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				<circle cx={CX} cy={CY} r={R} fill="none" stroke={`${colors.amber}22`} strokeWidth={3} />
				<circle
					cx={CX}
					cy={CY}
					r={R}
					fill="none"
					stroke={colors.amber}
					strokeWidth={4 + 3 * closeFlash}
					strokeLinecap="round"
					strokeDasharray={CIRC}
					strokeDashoffset={CIRC * (1 - drawn)}
					transform={`rotate(-90 ${CX} ${CY})`}
					style={{filter: `drop-shadow(0 0 ${8 + 16 * closeFlash}px ${colors.amber})`}}
				/>
				{/* Signal Cyan link arrows between the nodes, shown once the stroke passes them */}
				{[45, 135, 225, 315].map((deg) => {
					const rad = ((deg - 90) * Math.PI) / 180;
					const x = CX + R * Math.cos(rad);
					const y = CY + R * Math.sin(rad);
					const passAt = startAt + (closeAt - startAt) * (deg / 360);
					return (
						<polygon
							key={deg}
							points="-12,-11 12,0 -12,11"
							fill={colors.signalCyan}
							transform={`translate(${x} ${y}) rotate(${deg}) scale(${interpolate(g, [passAt, passAt + 4, passAt + 10], [0, 1.6, 1], clamp)})`}
							style={{filter: `drop-shadow(0 0 6px ${colors.signalCyan})`}}
						/>
					);
				})}
			</svg>
			{COPY.s09.nodes.map((label, i) => {
				const at = nodesAt[i];
				const {x, y} = pos(i);
				// Each node lights up amber on its hit, cools to an outline, and flashes again on the close.
				const lit = Math.max(interpolate(g, [at, at + 3, at + 22], [0, 1, 0.15], clamp), closeFlash);
				return (
					<div key={label} style={{position: 'absolute', left: x, top: y, translate: '-50% -50%'}}>
						<div
							style={{
								padding: '18px 42px',
								borderRadius: 60,
								border: `2.5px solid ${colors.amber}`,
								backgroundColor: interpolateColors(lit, [0, 1], [colors.graphite, colors.amber]),
								boxShadow: `0 0 ${10 + 50 * lit}px ${colors.amber}${Math.round(40 + 140 * lit)
									.toString(16)
									.padStart(2, '0')}`,
								fontFamily: fonts.headline,
								fontWeight: 700,
								fontSize: 60,
								lineHeight: 1,
								whiteSpace: 'nowrap',
								color: interpolateColors(lit, [0.3, 0.7], [colors.textPrimary, colors.onAmber]),
								...pop(g, at, fps, {tiltX: 40, tiltY: 0, rise: 30, from: 0.4}),
							}}
						>
							{label}
						</div>
					</div>
				);
			})}
		</SceneShell>
	);
};
