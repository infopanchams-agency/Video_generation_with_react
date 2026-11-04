import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, fonts} from '../theme';
import {useScene} from '../timing';
import {enter} from '../ui/kit';

// vo02 word index where each on-screen question starts ("But" is word 0).
const VO_WORD_OFFSET = [1, 5, 10];
const HITS = ['s02Q1', 's02Q2', 's02Q3'];

export const S02Questions: React.FC = () => {
	const {g, hit, words, square, t} = useScene('S02Questions');
	const vo = words('vo02');
	const shown = HITS.filter((k) => t.hits.some((h) => h.key === k)); // square cut: first 2 only
	const size = square ? 84 : 100;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.graphite,
				justifyContent: 'center',
				paddingLeft: square ? 80 : 140,
				paddingRight: square ? 80 : 140,
			}}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: size * 0.5}}>
				{shown.map((key, q) => {
					const at = hit(key);
					const nextAt = q + 1 < shown.length ? hit(shown[q + 1]) : null;
					return (
						<div
							key={key}
							style={{
								fontFamily: fonts.headline,
								fontWeight: 700,
								fontSize: size,
								lineHeight: 1.08,
								letterSpacing: '-0.01em',
								...enter(g, at),
							}}
						>
							{COPY.s02.questions[q].split(' ').map((word, i) => {
								// Each word lights up as it is spoken (rule S3), then the
								// question dims once the next one comes in.
								const spokenAt = vo[VO_WORD_OFFSET[q] + i]?.from ?? at;
								const lit = interpolate(g, [spokenAt, spokenAt + 4], [0, 1], clamp);
								const dim = nextAt === null ? 0 : interpolate(g, [nextAt, nextAt + 8], [0, 1], clamp);
								return (
									<span
										key={i}
										style={{
											color: lit - dim > 0.5 ? colors.textPrimary : colors.textDim,
										}}
									>
										{word}{' '}
									</span>
								);
							})}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
