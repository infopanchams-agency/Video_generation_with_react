import {AbsoluteFill, interpolate} from 'remotion';
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
	const cam = [
		{at: from, fx: cx, fy: cy, s: 1.25},
		{at: buildAt, fx: cx, fy: cy, s: 1.0, dur: Math.max(20, to - buildAt - 10)},
	];
	// Impact flash: an amber burst that peaks on the cut and settles to a warm pool.
	const burst = interpolate(g, [cutAt, cutAt + 3, cutAt + 30], [0, 1, 0.35], clamp);

	return (
		<SceneShell id="S04Reveal" cam={cam}>
			<LightPool x={cx} y={cy} r={square ? 700 : 1000} color={colors.amber} g={g} fps={fps} strength={0.25 + 0.4 * burst} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						fontFamily: fonts.headline,
						fontWeight: 700,
						fontSize: square ? 210 : 270,
						lineHeight: 1,
						letterSpacing: '-0.03em',
						color: colors.amber,
						textShadow: `0 0 ${40 + 60 * burst}px ${colors.amber}66`,
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
						color: colors.textPrimary,
						opacity: 0.85,
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
