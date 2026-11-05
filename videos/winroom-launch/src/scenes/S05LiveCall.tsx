import type {CamKey} from '../ui/fx';
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
	// Whole panel stays in frame; the spotlight on the coaching card does the focusing.
	const cam: CamKey[] = [{at: from, box: square ? [40, 40, 1000, 860] : [72, 230, 1776, 620]}];

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
