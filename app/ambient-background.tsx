'use client';

import { useEffect, useRef, useState } from 'react';

export default function AmbientBackground({ active }: { active: boolean }) {
	const video = useRef<HTMLVideoElement>(null);
	const [motionAllowed, setMotionAllowed] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const preference = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		);
		const update = () => setMotionAllowed(!preference.matches);
		update();
		preference.addEventListener('change', update);
		return () => preference.removeEventListener('change', update);
	}, []);

	useEffect(() => {
		const syncPlayback = () => {
			const element = video.current;
			if (!element) return;
			element.defaultPlaybackRate = 0.5;
			element.playbackRate = 0.5;
			if (active && motionAllowed && !document.hidden) {
				// Autoplay restrictions leave the static background visible.
				void element.play().catch(() => setReady(false));
			} else {
				element.pause();
			}
		};
		syncPlayback();
		document.addEventListener('visibilitychange', syncPlayback);
		return () =>
			document.removeEventListener('visibilitychange', syncPlayback);
	}, [active, motionAllowed]);

	return (
		<div className="ambient" aria-hidden="true">
			{motionAllowed && (
				<video
					ref={video}
					className={'ambient-video' + (ready ? ' is-ready' : '')}
					src="/ambient-aurora.mp4"
					muted
					loop
					playsInline
					preload="none"
					disablePictureInPicture
					onPlaying={() => setReady(true)}
					onError={() => setReady(false)}
				/>
			)}
		</div>
	);
}
