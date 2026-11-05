import {colors} from '../theme';
import {useScene} from '../timing';
import {float, LightPool, SceneShell} from '../ui/fx';
import {LiveCall} from '../ui/LiveCall';

export const S05LiveCall: React.FC = () => {
	const {g, hit, words, square, t, from} = useScene('S05LiveCall');
	const fps = t.fps;
	const dialAt = hit('s05Dial');
	const connectAt = hit('s05Connect');
	const cardAt = hit('s05Card');

	// Camera: lead card -> dial -> customer's words -> coaching card -> whole screen.
	const cam = square
		? [
				{at: from, fx: 540, fy: 300, s: 1.18},
				{at: connectAt + 6, fx: 540, fy: 440, s: 1.14, dur: 18},
				{at: cardAt, fx: 540, fy: 640, s: 1.06, dur: 14},
				{at: cardAt + 45, fx: 540, fy: 480, s: 1.0, dur: 24},
			]
		: [
				{at: from, fx: 330, fy: 430, s: 1.32},
				{at: dialAt, fx: 330, fy: 470, s: 1.42, dur: 8},
				{at: connectAt + 4, fx: 880, fy: 430, s: 1.3, dur: 18},
				{at: cardAt, fx: 1560, fy: 340, s: 1.38, dur: 14},
				{at: cardAt + 45, fx: 960, fy: 560, s: 1.02, dur: 26},
			];

	return (
		<SceneShell id="S05LiveCall" cam={cam}>
			<LightPool x={square ? 540 : 900} y={square ? 400 : 500} r={square ? 700 : 1100} color={colors.signalCyan} g={g} fps={fps} strength={0.22} />
			<LightPool x={square ? 540 : 1560} y={square ? 700 : 330} r={square ? 500 : 600} color={colors.amber} g={g} fps={fps} at={cardAt} strength={0.3} />
			<div style={{position: 'absolute', inset: 0, ...float(g, fps, 3, 3)}}>
				<LiveCall
					g={g}
					fps={fps}
					square={square}
					dialAt={dialAt}
					connectAt={connectAt}
					cardAt={cardAt}
					customerWords={words('vo05a')}
					repWords={null}
				/>
			</div>
		</SceneShell>
	);
};
