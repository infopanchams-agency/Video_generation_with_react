import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {AudioLayer} from './AudioLayer';
import {S01Hook} from './scenes/S01Hook';
import {S02Questions} from './scenes/S02Questions';
import {S03Fragmented} from './scenes/S03Fragmented';
import {S04Reveal} from './scenes/S04Reveal';
import {S05LiveCall} from './scenes/S05LiveCall';
import {S06PostCall} from './scenes/S06PostCall';
import {S07OneInbox} from './scenes/S07OneInbox';
import {S08ChatSetup} from './scenes/S08ChatSetup';
import {S09Loop} from './scenes/S09Loop';
import {S10EndCard} from './scenes/S10EndCard';
import {colors} from './theme';
import type {Layout, SceneId} from './timing';
import {FADE_FRAMES, LayoutContext, sequenceDuration, TIMINGS} from './timing';
import {SquareCaptions} from './ui/SquareCaptions';

const SCENES: Record<SceneId, React.FC> = {
	S01Hook,
	S02Questions,
	S03Fragmented,
	S04Reveal,
	S05LiveCall,
	S06PostCall,
	S07OneInbox,
	S08ChatSetup,
	S09Loop,
	S10EndCard,
};

export type WinroomLaunchProps = {
	readonly layout: Layout;
};

export const WinroomLaunch: React.FC<WinroomLaunchProps> = ({layout}) => {
	const t = TIMINGS[layout];
	return (
		<LayoutContext.Provider value={layout}>
			<AbsoluteFill style={{backgroundColor: colors.graphite}}>
				{/* Hard cuts everywhere except the scenes marked "fade8" (rule S5). */}
				<TransitionSeries name="Scenes">
					{t.scenes.map((s) => {
						const Scene = SCENES[s.id as SceneId];
						return (
							<Fragment key={s.id}>
								{s.transitionIn ? (
									<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: FADE_FRAMES})} />
								) : null}
								<TransitionSeries.Sequence name={s.id} durationInFrames={sequenceDuration(s)}>
									<Scene />
								</TransitionSeries.Sequence>
							</Fragment>
						);
					})}
				</TransitionSeries>
				{layout === '1x1' ? <SquareCaptions /> : null}
				<AudioLayer layout={layout} />
			</AbsoluteFill>
		</LayoutContext.Provider>
	);
};
