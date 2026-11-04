import {AbsoluteFill} from 'remotion';
import {colors} from '../theme';
import {useScene} from '../timing';
import {LiveCall} from '../ui/LiveCall';

export const S05LiveCall: React.FC = () => {
	const {g, hit, words, square, t} = useScene('S05LiveCall');
	return (
		<AbsoluteFill style={{backgroundColor: colors.graphite}}>
			<LiveCall
				g={g}
				fps={t.fps}
				square={square}
				dialAt={hit('s05Dial')}
				connectAt={hit('s05Connect')}
				cardAt={hit('s05Card')}
				customerWords={words('vo05a')}
				repWords={null}
			/>
		</AbsoluteFill>
	);
};
