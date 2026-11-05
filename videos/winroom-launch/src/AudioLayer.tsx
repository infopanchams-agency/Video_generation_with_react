import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import type {Layout} from './timing';
import {SFX_META, TIMINGS, voClipFrames} from './timing';

// Every audio position comes from timing.json / timing.square.json.
// Nothing here types a frame number by hand.

const MUSIC_BASE = 0.5;
const MUSIC_UNDER_VO = 0.18;
const MUSIC_UNDER_PHONE = 0.12;
const DUCK_DOWN_FRAMES = 6; // ramp down, ending on the VO start
const DUCK_UP_FRAMES = 10; // ramp up after the VO ends
const IMPACT_FREE_FRAMES = 15; // no duck for the first beat of an impact

const SFX_VOLUME: Record<string, number> = {
	'mouse-click': 0.25,
	switch: 0.25,
};
const SFX_DEFAULT = 0.35;
const WHIP_VOLUME = 0.16; // whip-pan cuts: present but under the VO

export const AudioLayer: React.FC<{readonly layout: Layout}> = ({layout}) => {
	const t = TIMINGS[layout];
	const musicSrc = staticFile(layout === '16x9' ? 'audio/music.wav' : 'audio/square/music.wav');

	// Duck ranges use the measured clip lengths, not maxEnd.
	const ducks = t.vo.map((v) => ({
		start: v.start,
		end: v.start + voClipFrames(v),
		level: v.phoneFilter ? MUSIC_UNDER_PHONE : MUSIC_UNDER_VO,
	}));
	const impacts = t.hits.filter((h) => h.alignPeak).map((h) => h.frame);

	const musicVolume = (f: number) => {
		if (impacts.some((i) => f >= i && f < i + IMPACT_FREE_FRAMES)) {
			return MUSIC_BASE; // let the impacts hit
		}
		let v = MUSIC_BASE;
		for (const d of ducks) {
			let k = 1; // 1 = full music, 0 = fully ducked
			if (f >= d.start - DUCK_DOWN_FRAMES && f < d.start) {
				k = (d.start - f) / DUCK_DOWN_FRAMES;
			} else if (f >= d.start && f <= d.end) {
				k = 0;
			} else if (f > d.end && f < d.end + DUCK_UP_FRAMES) {
				k = (f - d.end) / DUCK_UP_FRAMES;
			}
			v = Math.min(v, d.level + (MUSIC_BASE - d.level) * k);
		}
		return v;
	};

	return (
		<>
			<Audio name="Music" src={musicSrc} volume={musicVolume} />
			{t.vo.map((v) => (
				<Audio
					key={v.id}
					name={`VO ${v.id} (${v.speaker})`}
					src={staticFile(`audio/vo/${v.id}${v.phoneFilter ? '.call' : ''}.mp3`)}
					from={v.start}
					durationInFrames={voClipFrames(v)}
				/>
			))}
			{t.hits
				.filter((h) => h.sfx)
				.map((h) => {
					const meta = SFX_META[h.sfx as string];
					// Rule S4: transients are aligned by their peak, so the peak lands on the hit.
					return (
						<Audio
							key={`${h.key}-${h.sfx}`}
							name={`SFX ${h.sfx} @ ${h.key}`}
							src={staticFile(meta.file)}
							from={h.frame - meta.peakOffsetFrames}
							durationInFrames={meta.durationFrames}
							volume={SFX_VOLUME[h.sfx as string] ?? SFX_DEFAULT}
						/>
					);
				})}
			{/* Soft whoosh on each whip-pan cut (cuts that have no impact hit of their own). */}
			{t.scenes
				.filter((s) => s.from > 0 && !t.hits.some((h) => h.sfx && h.frame === s.from))
				.map((s) => {
					const meta = SFX_META.whoosh;
					return (
						<Audio
							key={`whip-${s.id}`}
							name={`SFX whip @ ${s.id}`}
							src={staticFile(meta.file)}
							from={s.from - meta.peakOffsetFrames}
							durationInFrames={meta.durationFrames}
							volume={WHIP_VOLUME}
						/>
					);
				})}
		</>
	);
};
