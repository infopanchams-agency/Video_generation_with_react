import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadLexend} from '@remotion/google-fonts/Lexend';
import type React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {clamp, colors} from '../theme';
import {COPY} from '../script';

// Winroom by Aerobee logo (rebuilt from Vikas's logo image as SVG so the bee can move).
const wordmarkFont = loadFraunces('normal', {weights: ['900'], subsets: ['latin']}).fontFamily;
const byFont = loadLexend('normal', {weights: ['300'], subsets: ['latin']}).fontFamily;

const INK = '#141414';
const WING = '#D6D6D2';

/** The bee, drawn in a 200 x 200 box centred on the ring. `flap` is the wing angle offset in degrees. */
const Bee: React.FC<{readonly flap: number}> = ({flap}) => (
	<g>
		{/* back wing */}
		<g transform={`translate(112 92) rotate(${-2 + flap * 0.8})`}>
			<ellipse cx={0} cy={-38} rx={19} ry={40} fill={WING} fillOpacity={0.55} stroke="#4A4A48" strokeWidth={2} />
		</g>
		<g transform="translate(6 -4) rotate(-18 100 112)">
			{/* body */}
			<clipPath id="bee-body">
				<ellipse cx={95} cy={118} rx={50} ry={33} />
			</clipPath>
			<ellipse cx={95} cy={118} rx={50} ry={33} fill={colors.amber} />
			<g clipPath="url(#bee-body)" fill={INK}>
				<rect x={68} y={70} width={9} height={100} rx={3} transform="rotate(8 72 118)" />
				<rect x={87} y={70} width={9} height={100} rx={3} transform="rotate(8 91 118)" />
				<rect x={106} y={70} width={9} height={100} rx={3} transform="rotate(8 110 118)" />
			</g>
			<ellipse cx={95} cy={118} rx={50} ry={33} fill="none" stroke={INK} strokeWidth={3} />
			{/* stinger and legs */}
			<path d="M 46 116 L 30 124 L 47 129 Z" fill={INK} />
			<path d="M 82 149 l -6 14 M 98 150 l -2 15 M 114 147 l 4 14" stroke={INK} strokeWidth={3} strokeLinecap="round" />
			{/* head */}
			<circle cx={147} cy={112} r={22} fill={INK} />
			<circle cx={155} cy={106} r={4.5} fill="#FFFFFF" />
			<path d="M 150 92 C 156 78 166 72 174 74 C 178 76 176 81 172 80" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
			<path d="M 140 92 C 141 78 148 68 156 66 C 160 66 160 71 156 71" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
		</g>
		{/* front wing */}
		<g transform={`translate(108 90) rotate(${-24 + flap})`}>
			<ellipse cx={0} cy={-40} rx={22} ry={44} fill={WING} fillOpacity={0.88} stroke="#3A3A38" strokeWidth={2.5} />
			<path d="M -4 -10 C -8 -30 -6 -55 4 -72" fill="none" stroke="#9A9A96" strokeWidth={2} />
		</g>
	</g>
);

export type LogoTimes = {
	writeAt: number; // "Winroom" starts writing (end of "By sales people.")
	flyAt: number; // bee starts flying in
	landAt: number; // bee reaches the ring position
	cageAt: number; // ring starts drawing round the bee
	byAt: number; // "by Aerobee" appears, wings stop (narrator: "Aerobee")
};

export const LogoLockup: React.FC<{
	readonly g: number;
	readonly fps: number;
	readonly times: LogoTimes;
	readonly ring: number; // ring diameter in px
	readonly wordSize: number;
	readonly bySize: number;
	readonly style: React.CSSProperties;
	readonly flyFrom: [number, number]; // bee start, relative to the ring centre
}> = ({g, fps, times, ring, wordSize, bySize, style, flyFrom}) => {
	const {writeAt, flyAt, landAt, cageAt, byAt} = times;
	const R = ring / 2;

	// ---- bee flight: eased path from off-frame with a wiggle that dies out on arrival
	const flightP = (f: number) => interpolate(f, [flyAt, landAt], [0, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});
	const beePos = (f: number) => {
		const p = flightP(f);
		const wig = (1 - p) * (1 - p);
		return {
			x: flyFrom[0] * (1 - p) + Math.sin(p * Math.PI * 3) * 120 * wig,
			y: flyFrom[1] * (1 - p) + Math.sin(p * Math.PI * 4 + 1) * 90 * wig,
		};
	};
	const pos = beePos(g);
	const prev = beePos(g - 1);
	const flying = g >= flyAt && g < landAt;
	// The bee flies in from the left, so it always faces the text (the drawing faces right).
	const facing = 1;
	const tilt = flying ? Math.max(-25, Math.min(25, (pos.y - prev.y) * 0.8)) : 0;
	// Hover bob in the cage until the wings stop.
	const bob = g >= landAt && g < byAt ? Math.sin(((g - landAt) / fps) * Math.PI * 4) * 4 : 0;
	// Wings flap fast (alternating every frame) until "by Aerobee", then settle to rest.
	const flapAmp = interpolate(g, [byAt, byAt + 6], [1, 0], clamp);
	const flap = (g % 2 === 0 ? 34 : -22) * flapAmp;
	const beeVisible = g >= flyAt;

	// ---- ring cages the bee
	const circ = 2 * Math.PI * (R - 4);
	const cage = interpolate(g, [cageAt, cageAt + 12], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
	const cagePop = spring({frame: g - (cageAt + 12), fps, config: {damping: 9, stiffness: 180}});

	// ---- "by Aerobee"
	const byP = spring({frame: g - byAt, fps, config: {damping: 12, stiffness: 160}});

	return (
		<div style={{position: 'absolute', display: 'flex', alignItems: 'center', gap: ring * 0.22, ...style}}>
			<div style={{position: 'relative', width: ring, height: ring, flexShrink: 0}}>
				<svg
					width={ring}
					height={ring}
					viewBox={`0 0 ${ring} ${ring}`}
					style={{
						position: 'absolute',
						overflow: 'visible',
						scale: 1 + 0.06 * (1 - cagePop) * cage, // the cage "snaps" shut
						filter: `drop-shadow(0 0 ${10 + 20 * (1 - cagePop) * cage}px ${colors.amber}AA)`,
					}}
				>
					<circle cx={R} cy={R} r={R - 4} fill={`${INK}CC`} opacity={cage} />
					<circle
						cx={R}
						cy={R}
						r={R - 4}
						fill="none"
						stroke={colors.amber}
						strokeWidth={ring * 0.035}
						strokeDasharray={circ}
						strokeDashoffset={circ * (1 - cage)}
						transform={`rotate(-90 ${R} ${R})`}
					/>
				</svg>
				{beeVisible ? (
					<svg
						width={ring}
						height={ring}
						viewBox="0 0 200 200"
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							overflow: 'visible',
							translate: `${pos.x}px ${pos.y + bob}px`,
							rotate: `${tilt * facing}deg`,
							scale: `${facing * 1.05} 1.05`,
						}}
					>
						<Bee flap={flap} />
					</svg>
				) : null}
			</div>
			<div>
				<div style={{fontFamily: wordmarkFont, fontWeight: 900, fontSize: wordSize, lineHeight: 1, color: colors.amber, letterSpacing: '0.005em', textShadow: `0 10px 30px ${colors.amber}55`}}>
					{COPY.brand.product.split('').map((ch, i) => {
						// "Winroom" writes up letter by letter, in time with the narrator saying it.
						const at = writeAt + i * 3;
						const p = spring({frame: g - at, fps, config: {damping: 10, stiffness: 170}});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									opacity: interpolate(g, [at, at + 3], [0, 1], clamp),
									transform: `perspective(800px) translateY(${(1 - p) * wordSize * 0.5}px) rotateX(${(1 - p) * 60}deg)`,
								}}
							>
								{ch}
							</span>
						);
					})}
				</div>
				<div
					style={{
						fontFamily: byFont,
						fontWeight: 300,
						fontSize: bySize,
						lineHeight: 1,
						color: colors.textMuted,
						marginTop: wordSize * 0.22,
						opacity: interpolate(g, [byAt, byAt + 4], [0, 1], clamp),
						translate: `${(1 - byP) * -30}px 0px`,
					}}
				>
					{COPY.brand.by}
				</div>
			</div>
		</div>
	);
};
