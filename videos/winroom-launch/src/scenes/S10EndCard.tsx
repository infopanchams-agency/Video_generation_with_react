import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {enter} from '../ui/kit';

export const S10EndCard: React.FC = () => {
	const {g, hit, words, square} = useScene('S10EndCard');
	const builtAt = hit('s10Built');
	const byAt = hit('s10By');
	const ctaAt = hit('s10Cta');
	// Kinetic words follow the VO word timings (rule S3); each line starts on its hit.
	const lineWords = [words('vo10a'), words('vo10b')];
	const lineAt = [builtAt, byAt];

	const L = square
		? {x: 80, top: 120, size: 112, rule: 640, mark: 120, markTop: 690, by: 44, btn: {right: 80, top: 860, size: 38}}
		: {x: 140, top: 160, size: 156, rule: 732, mark: 130, markTop: 780, by: 42, btn: {right: 140, top: 798, size: 42}};

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			<div
				style={{
					position: 'absolute',
					left: L.x,
					right: L.x,
					top: L.top,
					fontFamily: fonts.headline,
					fontWeight: 700,
					fontSize: L.size,
					lineHeight: 1.0,
					letterSpacing: '-0.02em',
					color: colors.textPrimary,
				}}
			>
				{COPY.s10.lines.map((line, li) => (
					<div key={line} style={{textWrap: 'balance'}}>
						{line.split(' ').map((w, i) => (
							<span key={i} style={{display: 'inline-block', marginRight: '0.25em', ...enter(g, Math.max(lineAt[li], lineWords[li][i]?.from ?? lineAt[li]))}}>
								{w}
							</span>
						))}
					</div>
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: L.x,
					right: L.x,
					top: L.rule,
					height: 1.5,
					backgroundColor: colors.border,
					scale: `${interpolate(g, [ctaAt, ctaAt + 14], [0, 1], {...clamp, easing: entryEase})} 1`,
					transformOrigin: 'left center',
				}}
			/>
			<div style={{position: 'absolute', left: L.x, top: L.markTop, ...enter(g, ctaAt)}}>
				<div style={{fontFamily: fonts.headline, fontWeight: 700, fontSize: L.mark, lineHeight: 1, letterSpacing: '-0.03em', color: colors.amber}}>{COPY.brand.product}</div>
				<div style={{fontFamily: fonts.ui, fontSize: L.by, color: colors.textMuted, marginTop: 14}}>{COPY.brand.by}</div>
			</div>
			<div
				style={{
					position: 'absolute',
					right: L.btn.right,
					top: L.btn.top,
					padding: `${L.btn.size * 0.55}px ${L.btn.size * 1.0}px`,
					borderRadius: 12,
					backgroundColor: colors.amber,
					fontFamily: fonts.ui,
					fontWeight: 600,
					fontSize: L.btn.size,
					lineHeight: 1,
					color: colors.onAmber,
					...enter(g, ctaAt),
				}}
			>
				{COPY.brand.cta}
			</div>
		</AbsoluteFill>
	);
};
