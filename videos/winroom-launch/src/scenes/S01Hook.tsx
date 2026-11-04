import {AbsoluteFill, interpolate} from 'remotion';
import {COPY} from '../script';
import {clamp, colors, entryEase, fonts, WORD_IN_FRAMES} from '../theme';
import {useScene} from '../timing';
import {enter} from '../ui/kit';

// Deterministic 0..1 value per tile, so the grid is identical on every render.
const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

export const S01Hook: React.FC = () => {
	const {g, hit, words, square} = useScene('S01Hook');
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
			tiles.push(
				<div
					key={i}
					style={{
						position: 'absolute',
						left: grid.x + c * grid.px,
						top: grid.y + r * grid.py,
						width: grid.w,
						height: grid.h,
						borderRadius: 8,
						backgroundColor: colors.tileFill,
						border: `1.5px solid ${colors.border}`,
						opacity: interpolate(g, [at, at + 8], [0, 0.55 + 0.45 * rand(i + 7)], {...clamp, easing: entryEase}),
						scale: interpolate(g, [at, at + 8], [0.85, 1], {...clamp, easing: entryEase}),
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
								backgroundColor: colors.tileBar,
								opacity: k === 0 ? 1 : 0.6,
							}}
						/>
					))}
				</div>,
			);
		}
	}

	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
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
					<span style={{display: 'inline-block', ...enter(g, wordAt[0])}}>{COPY.s01.headline[0]}</span>{' '}
					<span style={{display: 'inline-block', ...enter(g, wordAt[1])}}>{COPY.s01.headline[1]}</span>
				</div>
				<div>
					<span style={{display: 'inline-block', ...enter(g, wordAt[2])}}>{COPY.s01.headline[2]}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
