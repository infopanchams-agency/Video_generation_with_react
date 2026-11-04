import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';

const NODE_HITS = ['s09Call', 's09Log', 's09Coach', 's09NextCall'];
const CX = 960;
const CY = 540;
const R = 320;
const CIRC = 2 * Math.PI * R;

export const S09Loop: React.FC = () => {
	const {g, hit} = useScene('S09Loop');
	const nodesAt = NODE_HITS.map((k) => hit(k));
	const startAt = nodesAt[0];
	const closeAt = hit('s09LoopClose');
	// Amber stroke runs clockwise from the top and closes exactly on s09LoopClose.
	const drawn = interpolate(g, [startAt, closeAt], [0, 1], clamp);

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<circle
					cx={CX}
					cy={CY}
					r={R}
					fill="none"
					stroke={colors.amber}
					strokeWidth={3}
					strokeDasharray={CIRC}
					strokeDashoffset={CIRC * (1 - drawn)}
					transform={`rotate(-90 ${CX} ${CY})`}
				/>
				{/* Signal Cyan link arrows between the nodes, shown once the stroke passes them */}
				{[45, 135, 225, 315].map((deg, i) => {
					const rad = ((deg - 90) * Math.PI) / 180;
					const x = CX + R * Math.cos(rad);
					const y = CY + R * Math.sin(rad);
					const passAt = startAt + (closeAt - startAt) * (deg / 360);
					return (
						<polygon
							key={deg}
							points="-10,-9 10,0 -10,9"
							fill={colors.signalCyan}
							transform={`translate(${x} ${y}) rotate(${deg})`}
							opacity={interpolate(g, [passAt, passAt + 3], [0, 1], clamp)}
						>
							<title>{`link ${i + 1}`}</title>
						</polygon>
					);
				})}
			</svg>
			{COPY.s09.nodes.map((label, i) => {
				const rad = ((i * 90 - 90) * Math.PI) / 180;
				const at = nodesAt[i];
				return (
					<div
						key={label}
						style={{
							position: 'absolute',
							left: CX + R * Math.cos(rad),
							top: CY + R * Math.sin(rad),
							translate: '-50% -50%',
							padding: '18px 42px',
							borderRadius: 60,
							border: `2.5px solid ${colors.amber}`,
							backgroundColor: colors.graphite,
							fontFamily: fonts.headline,
							fontWeight: 700,
							fontSize: 60,
							lineHeight: 1,
							whiteSpace: 'nowrap',
							color: colors.textPrimary,
							opacity: interpolate(g, [at, at + 6], [0, 1], clamp),
							scale: interpolate(g, [at, at + 10], [0.7, 1], {...clamp, easing: entryEase}),
						}}
					>
						{label}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
