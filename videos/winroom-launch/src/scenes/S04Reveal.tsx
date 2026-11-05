import type {CamKey} from '../ui/fx';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, fonts} from '../theme';
import {useScene} from '../timing';
import {LightPool, pop, SceneShell} from '../ui/fx';

// Frames between letters as the wordmark builds.
const LETTER_STEP = 2;

export const S04Reveal: React.FC = () => {
	const {g, hit, square, t, from, to} = useScene('S04Reveal');
	const fps = t.fps;
	const buildAt = hit('s04Wordmark');
	const cutAt = hit('s04Cut');
	const W = square ? 1080 : 1920;
	const cx = W / 2;
	const cy = 540;
	const cam: CamKey[] = [
		{at: from, box: [cx - 500, cy - 210, 1000, 420], maxS: 1.25},
		{at: buildAt, box: [0, 0, W, 1080], dur: Math.max(20, to - buildAt - 10)},
	];
	// Impact flash: an amber burst that peaks on the cut and settles to a warm pool.
	const burst = interpolate(g, [cutAt, cutAt + 3, cutAt + 30], [0, 1, 0.35], clamp);

	return (
		<SceneShell id="S04Reveal" cam={cam}>
			<LightPool x={cx} y={cy} r={square ? 700 : 1000} color={colors.amber} g={g} fps={fps} strength={0.16 + 0.3 * burst} />
			<svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				{[0, 6].map((d) => (
					<circle
						key={d}
						cx={cx}
						cy={cy}
						// amber shockwave on the impact
						r={interpolate(g, [cutAt + d, cutAt + d + 26], [20, square ? 760 : 1150], {...clamp, easing: Easing.out(Easing.cubic)})}
						fill="none"
						stroke={colors.amber}
						strokeWidth={d ? 2 : 4}
						opacity={interpolate(g, [cutAt + d, cutAt + d + 3, cutAt + d + 26], [0, 0.9, 0], clamp)}
					/>
				))}
			</svg>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						fontFamily: fonts.headline,
						fontWeight: 700,
						fontSize: square ? 210 : 270,
						lineHeight: 1,
						letterSpacing: '-0.03em',
						color: colors.amber,
						textShadow: `0 ${10 + 10 * burst}px ${30 + 30 * burst}px ${colors.amber}55`,
					}}
				>
					{COPY.brand.product.split('').map((ch, i) => (
						<span key={i} style={{display: 'inline-block', ...pop(g, buildAt + i * LETTER_STEP, fps, {tiltX: 70, tiltY: 0, rise: 90, from: 0.4})}}>
							{ch}
						</span>
					))}
				</div>
				<div
					style={{
						fontFamily: fonts.ui,
						fontSize: square ? 50 : 58,
						color: colors.textMuted,
						marginTop: square ? 26 : 34,
						...pop(g, hit('s04ByAerobee'), fps, {tiltX: 30, tiltY: 0, rise: 30}),
					}}
				>
					{COPY.brand.by}
				</div>
			</AbsoluteFill>
		</SceneShell>
	);
};
