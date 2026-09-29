import { useEffect, useRef } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';

// Fraction of the video's duration scrubbed by a full-width mouse sweep.
const SENSITIVITY = 0.8;

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const seeking = useRef(false);

  const seekTo = (video: HTMLVideoElement, time: number) => {
    seeking.current = true;
    video.currentTime = time;
  };

  // Once a seek lands, chase the target if the mouse moved in the meantime.
  const handleSeeked = () => {
    const video = videoRef.current;
    seeking.current = false;
    if (video && Math.abs(video.currentTime - targetTime.current) > 0.001) {
      seekTo(video, targetTime.current);
    }
  };

  useEffect(() => {
    let prevX: number | null = null;

    const onMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      const currentX = e.clientX;
      if (prevX === null) {
        prevX = currentX;
        return;
      }
      const delta = currentX - prevX;
      prevX = currentX;

      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTime.current = Math.min(Math.max(targetTime.current + offset, 0), video.duration);

      if (!seeking.current) seekTo(video, targetTime.current);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      onSeeked={handleSeeked}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: '70% center' }}
    />
  );
}
