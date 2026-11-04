import {Composition} from 'remotion';
import {TIMINGS} from './timing';
import {WinroomLaunch} from './WinroomLaunch';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="WinroomLaunch16x9"
				component={WinroomLaunch}
				width={1920}
				height={1080}
				fps={TIMINGS['16x9'].fps}
				durationInFrames={TIMINGS['16x9'].durationInFrames}
				defaultProps={{layout: '16x9' as const}}
			/>
			<Composition
				id="WinroomLaunch1x1"
				component={WinroomLaunch}
				width={1080}
				height={1080}
				fps={TIMINGS['1x1'].fps}
				durationInFrames={TIMINGS['1x1'].durationInFrames}
				defaultProps={{layout: '1x1' as const}}
			/>
		</>
	);
};
