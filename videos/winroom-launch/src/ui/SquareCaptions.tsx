import {createTikTokStyleCaptions} from '@remotion/captions';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, colors, fonts} from '../theme';
import type {VoId} from '../timing';
import {TIMINGS, voCaptions} from '../timing';

// Burned-in captions for the 1:1 cut. Lines whose words already appear as
// kinetic type (S01, S02, S10) are not captioned twice.
const CAPTIONED: VoId[] = ['vo04', 'vo05a', 'vo05b', 'vo06b'];

export const SquareCaptions: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = TIMINGS['1x1'];
	const ms = (frame / fps) * 1000;

	const pages = CAPTIONED.filter((id) => t.vo.some((v) => v.id === id)).flatMap(
		(id) => createTikTokStyleCaptions({captions: voCaptions(t, id), combineTokensWithinMilliseconds: 900}).pages,
	);
	const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs + 300);
	if (!page) {
		return null;
	}

	return (
		<div style={{position: 'absolute', left: 60, right: 60, bottom: 52, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: fonts.ui,
					fontWeight: 600,
					fontSize: 44,
					lineHeight: 1.2,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					padding: '14px 26px',
					borderRadius: 12,
					backgroundColor: colors.ink,
					color: colors.onInk,
					boxShadow: `0 20px 40px -16px ${colors.shadow}`,
				}}
			>
				{page.tokens.map((tok, i) => (
					<span key={i} style={{opacity: interpolate(ms, [tok.fromMs, tok.fromMs + 80], [0.35, 1], clamp)}}>
						{tok.text}
					</span>
				))}
			</div>
		</div>
	);
};
