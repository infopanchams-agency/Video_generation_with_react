import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts} from '../theme';
import {useScene} from '../timing';
import {LightPool, Marker, pop, SceneShell} from '../ui/fx';
import {LogoLockup} from '../ui/LogoLockup';

// Words in each line that get the highlighter marker: "sales people."
const KEY_WORDS = [
	[2, 3],
	[1, 2],
];

export const S10EndCard: React.FC = () => {
	const {g, hit, words, square, t, from} = useScene('S10EndCard');
	const fps = t.fps;
	const builtAt = hit('s10Built');
	const byAt = hit('s10By');
	const ctaAt = hit('s10Cta');
	// Kinetic words follow the VO word timings (rule S3); each line starts on its hit.
	const lineWords = [words('vo10a'), words('vo10b')];
	const lineAt = [builtAt, byAt];
	// Logo sequence, synced to the narrator (rule S3): starts as "By sales people." ends,
	// "Winroom" writes in as it is said, "by Aerobee" lands on "Aerobee".
	const vo10b = lineWords[1];
	const logoAt = vo10b[2]?.to ?? ctaAt;
	const aerobeeAt = vo10b[5]?.from ?? ctaAt;
	const logoTimes = {
		writeAt: logoAt,
		flyAt: logoAt + 2,
		landAt: Math.min(logoAt + 30, aerobeeAt - 10),
		cageAt: Math.min(logoAt + 28, aerobeeAt - 12),
		byAt: aerobeeAt,
	};

	const L = square
		? {x: 80, top: 120, size: 112, rule: 640, ring: 170, word: 104, by: 44, markTop: 672, btn: {right: 80, top: 900, size: 36}}
		: {x: 140, top: 160, size: 156, rule: 732, ring: 210, word: 140, by: 56, markTop: 770, btn: {right: 140, top: 830, size: 42}};
	const W = square ? 1080 : 1920;
	const cam = [
		{at: from, fx: W / 2, fy: square ? 420 : 380, s: 1.18},
		{at: byAt, fx: W / 2, fy: square ? 460 : 420, s: 1.1, dur: 14},
		{at: logoAt - 6, fx: W / 2, fy: 540, s: 1.0, dur: 20},
	];
	// The CTA button keeps a slow amber pulse once it is in.
	const pulse = g >= ctaAt + 15 ? (Math.sin(((g - ctaAt) / fps) * Math.PI * 2) + 1) / 2 : 0;

	return (
		<SceneShell id="S10EndCard" cam={cam}>
			<LightPool x={W * 0.3} y={330} r={square ? 700 : 1000} color={colors.amber} g={g} fps={fps} strength={0.24} />
			<LightPool x={W * 0.75} y={850} r={600} color={colors.amber} g={g} fps={fps} at={ctaAt} strength={0.3} />
			<div
				style={{
					position: 'absolute',
					left: L.x,
					right: L.x,
					top: L.top,
					fontFamily: fonts.headline,
					fontWeight: 700,
					fontSize: L.size,
					lineHeight: 1.08,
					letterSpacing: '-0.02em',
					color: colors.textPrimary,
				}}
			>
				{COPY.s10.lines.map((line, li) => (
					<div key={line} style={{textWrap: 'balance'}}>
						{line.split(' ').map((w, i) => {
							const at = Math.max(lineAt[li], lineWords[li][i]?.from ?? lineAt[li]);
							return (
								<span key={i} style={{display: 'inline-block', marginRight: '0.25em', ...pop(g, at, fps, {tiltX: 50, tiltY: 0, rise: 50, from: 0.6})}}>
									{KEY_WORDS[li].includes(i) ? (
										<Marker g={g} at={at + 6}>
											{w}
										</Marker>
									) : (
										w
									)}
								</span>
							);
						})}
					</div>
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: L.x,
					right: L.x,
					top: L.rule,
					height: 2,
					background: `linear-gradient(90deg, ${colors.amber}, ${colors.signalCyan}55 60%, transparent)`,
					scale: `${interpolate(g, [logoAt, logoAt + 14], [0, 1], {...clamp, easing: entryEase})} 1`,
					transformOrigin: 'left center',
				}}
			/>
			<LogoLockup
				g={g}
				fps={fps}
				times={logoTimes}
				ring={L.ring}
				wordSize={L.word}
				bySize={L.by}
				flyFrom={square ? [-230, -520] : [-330, -660]}
				style={{left: L.x, top: L.markTop}}
			/>
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
					...pop(g, ctaAt, fps, {tiltX: 30, tiltY: -16}),
					boxShadow: `0 0 0 ${pulse * 10}px ${colors.amber}33, 0 18px 50px -10px ${colors.amber}99`,
				}}
			>
				{COPY.brand.cta}
			</div>
		</SceneShell>
	);
};
