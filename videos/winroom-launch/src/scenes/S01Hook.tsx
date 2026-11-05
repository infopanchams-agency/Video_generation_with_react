import {interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, fonts, WORD_IN_FRAMES} from '../theme';
import {useScene} from '../timing';
import {float, LightPool, Marker, pop, SceneShell} from '../ui/fx';
import {enter} from '../ui/kit';

// Deterministic 0..1 value per tile, so the grid is identical on every render.
const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const ACCENTS = [colors.amber, colors.signalCyan];

export const S01Hook: React.FC = () => {
	const {g, hit, words, square, t, from} = useScene('S01Hook');
	const fps = t.fps;
	const tilesAt = hit('s01Tiles');
	const vo = words('vo01');

	const grid = square
		? {x: 80, y: 80, cols: 6, rows: 3, w: 141, h: 88, px: 156, py: 102}
		: {x: 140, y: 96, cols: 13, rows: 4, w: 122, h: 96, px: 138, py: 112};
	const headline = square ? {x: 80, top: 450, size: 150} : {x: 140, top: 560, size: 210};

	// "Everyone" lands on the hit (frame 0). The rest follow the voice (rule S3).
	// The square cut must read with sound off on frame 0, so all words show at once.
	const settled = hit('s01Word') - WORD_IN_FRAMES; // already fully in on frame 0
	const wordAt = square
		? [settled, settled, settled]
		: [hit('s01Word'), vo[0]?.to ?? hit('s01Word'), vo[1]?.from ?? hit('s01Word')];
	const markAt = square ? hit('s01Word') + 12 : wordAt[2] + 8;

	const W = square ? 1080 : 1920;
	const H = square ? 1080 : 1080;
	const cam = square
		? [
				{at: from, fx: 540, fy: 540, s: 1},
				{at: tilesAt, fx: 540, fy: 600, s: 1.06, dur: 40},
			]
		: [
				{at: from, fx: 960, fy: 560, s: 1.08},
				{at: tilesAt, fx: 900, fy: 600, s: 1.0, dur: 30},
				{at: markAt, fx: 700, fy: 700, s: 1.12, dur: 22},
			];

	const tiles = [];
	for (let r = 0; r < grid.rows; r++) {
		for (let c = 0; c < grid.cols; c++) {
			const i = r * grid.cols + c;
			const seed = rand(i);
			if (seed < 0.28) {
				continue; // gaps make the grid read as "multiplying", not a wall
			}
			// A few tiles are there from the start; the rest multiply on bar 2.
			const at = seed > 0.86 ? settled : tilesAt + Math.floor(rand(i + 99) * 24);
			const accent = rand(i + 31) > 0.72 ? ACCENTS[i % 2] : null;
			tiles.push(
				<div key={i} style={{position: 'absolute', left: grid.x + c * grid.px, top: grid.y + r * grid.py, ...float(g, fps, i, 5)}}>
					<div
						style={{
							width: grid.w,
							height: grid.h,
							borderRadius: 10,
							backgroundColor: colors.tileFill,
							border: `1.5px solid ${accent ? `${accent}66` : colors.border}`,
							boxShadow: accent ? `0 0 28px ${accent}33` : undefined,
							...pop(g, at, fps, {tiltX: 25, tiltY: (c % 2 ? 1 : -1) * 18, rise: 30, from: 0.5}),
						}}
					>
						{[0.38, 0.56, 0.42].map((w, k) => (
							<div
								key={k}
								style={{
									position: 'absolute',
									left: 14,
									top: 14 + k * 14,
									width: grid.w * w,
									height: k === 0 ? 6 : 4,
									borderRadius: 3,
									backgroundColor: k === 0 && accent ? accent : colors.tileBar,
									opacity: k === 0 ? 1 : 0.6,
								}}
							/>
						))}
					</div>
				</div>,
			);
		}
	}

	return (
		<SceneShell id="S01Hook" cam={cam}>
			<LightPool x={W * 0.3} y={H * 0.72} r={700} color={colors.signalCyan} g={g} fps={fps} strength={0.22} />
			<LightPool x={W * 0.75} y={H * 0.2} r={600} color="#7B5CFF" g={g} fps={fps} at={tilesAt} strength={0.25} />
			{tiles}
			<div
				style={{
					position: 'absolute',
					left: headline.x,
					top: headline.top,
					fontFamily: fonts.headline,
					fontWeight: 700,
					fontSize: headline.size,
					lineHeight: 1.0,
					letterSpacing: '-0.02em',
					color: colors.textPrimary,
				}}
			>
				<div>
					<span style={{display: 'inline-block', ...enter(g, wordAt[0], WORD_IN_FRAMES, 40)}}>{COPY.s01.headline[0]}</span>{' '}
					<span style={{display: 'inline-block', ...enter(g, wordAt[1], WORD_IN_FRAMES, 40)}}>{COPY.s01.headline[1]}</span>
				</div>
				<div style={{marginTop: 10}}>
					<span
						style={{
							display: 'inline-block',
							...enter(g, wordAt[2], WORD_IN_FRAMES, 40),
							scale: interpolate(g, [markAt, markAt + 5, markAt + 12], [1, 1.06, 1], clamp),
						}}
					>
						<Marker g={g} at={markAt}>
							{COPY.s01.headline[2]}
						</Marker>
					</span>
				</div>
			</div>
		</SceneShell>
	);
};
