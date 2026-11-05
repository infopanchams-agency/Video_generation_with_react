import type {CamKey} from '../ui/fx';
import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, fonts} from '../theme';
import {useScene} from '../timing';
import {LightPool, Marker, pop, SceneShell} from '../ui/fx';

// vo02 word index where each on-screen question starts ("But" is word 0).
const VO_WORD_OFFSET = [1, 5, 10];
const HITS = ['s02Q1', 's02Q2', 's02Q3'];
// Key word in each question (index into its words): calling / logs / coaches.
const KEY_WORD = [1, 1, 1];

export const S02Questions: React.FC = () => {
	const {g, hit, words, square, t, from} = useScene('S02Questions');
	const fps = t.fps;
	const vo = words('vo02');
	const shown = HITS.filter((k) => t.hits.some((h) => h.key === k)); // square cut: first 2 only
	const size = square ? 84 : 100;
	const x = square ? 80 : 140;
	// In the square cut every question wraps onto two lines.
	const lineGap = square ? size * 1.08 * 2 + size * 0.5 : size * 1.6;
	const top = square ? 260 : 280;

	// Camera follows the newest question.
	const cam: CamKey[] = square
		? [{at: from, box: [80, 220, 920, 640]}]
		: [{at: from, box: [140, 240, 1640, 600]}, ...shown.map((k, q) => ({at: hit(k), box: [140, 250 + q * 110, 1640, 460] as CamKey['box'], dur: 14}))];

	return (
		<SceneShell id="S02Questions" cam={cam}>
			<LightPool x={square ? 300 : 500} y={square ? 600 : 520} r={square ? 600 : 900} color={colors.violet} g={g} fps={fps} strength={0.3} />
			{shown.map((key, q) => {
				const at = hit(key);
				const nextAt = q + 1 < shown.length ? hit(shown[q + 1]) : null;
				const dim = nextAt === null ? 0 : interpolate(g, [nextAt, nextAt + 8], [0, 1], clamp);
				return (
					<div
						key={key}
						style={{
							position: 'absolute',
							left: x,
							top: top + q * lineGap,
							width: (square ? 1080 : 1920) - x * 2,
							fontFamily: fonts.headline,
							fontWeight: 700,
							fontSize: size,
							lineHeight: 1.08,
							letterSpacing: '-0.01em',
							transformOrigin: 'left center',
							...pop(g, at, fps, {tiltX: 0, tiltY: -28, rise: 40, from: 0.9}),
						}}
					>
						{COPY.s02.questions[q].split(' ').map((word, i) => {
							// Each word lights up as it is spoken (rule S3), then the
							// question dims once the next one comes in.
							const spokenAt = vo[VO_WORD_OFFSET[q] + i]?.from ?? at;
							const lit = interpolate(g, [spokenAt, spokenAt + 4], [0, 1], clamp);
							const color = lit - dim > 0.5 ? colors.textPrimary : colors.textDim;
							return (
								<span key={i} style={{color}}>
									{i === KEY_WORD[q] ? (
										<Marker g={g} at={spokenAt + 2} baseText={color} dim={dim}>
											{word}
										</Marker>
									) : (
										word
									)}{' '}
								</span>
							);
						})}
					</div>
				);
			})}
		</SceneShell>
	);
};
