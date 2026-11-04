import {AbsoluteFill} from 'remotion';
import {COPY} from '../script';
import {colors, fonts} from '../theme';
import {useScene} from '../timing';
import {enter} from '../ui/kit';

// Frames between letters as the wordmark builds.
const LETTER_STEP = 2;

export const S04Reveal: React.FC = () => {
	const {g, hit, square} = useScene('S04Reveal');
	const buildAt = hit('s04Wordmark');

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite, justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					fontFamily: fonts.headline,
					fontWeight: 700,
					fontSize: square ? 210 : 270,
					lineHeight: 1,
					letterSpacing: '-0.03em',
					color: colors.amber,
				}}
			>
				{COPY.brand.product.split('').map((ch, i) => (
					<span key={i} style={{display: 'inline-block', ...enter(g, buildAt + i * LETTER_STEP)}}>
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
					...enter(g, hit('s04ByAerobee')),
				}}
			>
				{COPY.brand.by}
			</div>
		</AbsoluteFill>
	);
};
