'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotionPreference } from '@/components/ui/ReducedMotionProvider';

const POSTER_SRC = '/experience/working-poster.webp';
/**
 * WebM first, H.264 second, and the browser takes the first it can play. Both
 * are needed: Safari and iOS only decode the H.264, and Chromium builds without
 * proprietary codecs only decode the VP9.
 */
const SOURCES = [
  { src: '/experience/working.webm', type: 'video/webm' },
  { src: '/experience/working.mp4', type: 'video/mp4' },
];

/**
 * The clip opens on the character standing on black — the same framing as the
 * hero's sprite — and dissolves into the desk over its first couple of seconds.
 * Past this point he is settled and typing, so it is where the tail loop starts
 * once the scrub has run its course.
 */
const TAIL_START = 3.2;
/**
 * The scrub's window, as fractions of the viewport height above the section's
 * top edge. It starts late enough that the stage has climbed into view before
 * the clip leaves its opening shot — otherwise the standing-on-black beat, the
 * one that matches the hero, is spent below the fold.
 */
const SCRUB_START_AT = 0.7;
const SCRUB_END_AT = 0.05;
/**
 * Hand over to the tail loop just short of the end, and don't take it back until
 * the scroll has moved meaningfully. At the very bottom of the page `progress`
 * lands on 1 only to sub-pixel precision, and Lenis leaves it a fraction under
 * often enough that a single threshold would flick between playing and paused.
 */
const LOOP_ENTER = 0.995;
const LOOP_EXIT = 0.97;
/** Don't seek for less than half a frame — it only makes the decoder thrash. */
const SEEK_EPSILON = 1 / 48;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type WorkingCharacterProps = {
  /** The section whose scroll position drives the scrub. */
  sectionRef: React.RefObject<HTMLElement | null>;
  className?: string;
  label: string;
};

/**
 * Scroll drives the clip: the character sits down and gets to work as the
 * section comes up the screen, and scrolling back up reverses it.
 *
 * Two modes, picked once on mount:
 *
 * - **scrub** — `currentTime` is written from the section's scroll position and
 *   the element is never played. Once the scrub reaches the end it hands over
 *   to a tail loop so he keeps typing while the entries are read.
 * - **auto** — for coarse pointers, where frame-seeking stutters badly enough to
 *   look broken. The clip simply plays through when the section is in view.
 *
 * Reduced motion gets neither: the poster alone, and the video is never
 * requested.
 */
export default function WorkingCharacter({
  sectionRef,
  className,
  label,
}: WorkingCharacterProps) {
  const { reduced } = useReducedMotionPreference();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduced) return;

    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    // The element renders with preload="none" and is armed a frame later. The
    // motion preference is only knowable on the client, so the first commit has
    // it false whatever the visitor set; that resolves during hydration, well
    // inside a frame, and the cleanup below cancels this before it can fetch
    // 600 KB for someone who is about to be shown the poster instead.
    const arming = requestAnimationFrame(() => {
      video.preload = 'auto';
      video.load();
    });

    // Coarse pointers are the phones and tablets where seeking a decoder every
    // frame drops the whole page's framerate; they play the clip instead.
    const scrubs = window.matchMedia('(pointer: fine)').matches;

    let frame = 0;
    let inView = false;
    let looping = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView && !video.paused) video.pause();
        if (!scrubs && inView) void video.play().catch(() => {});
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(section);

    // Keeps him working rather than freezing on the final frame; `loop` would
    // rewind all the way to the standing shot, which reads as a glitch.
    //
    // `timeupdate` only fires a few times a second, so it is the smooth path,
    // not a reliable one — miss the window and the clip reaches its end and
    // pauses itself. `ended` is the guarantee.
    const restart = () => {
      if (!looping) return;
      video.currentTime = TAIL_START;
      void video.play().catch(() => {});
    };
    const onTimeUpdate = () => {
      if (looping && video.currentTime >= video.duration - 0.25) restart();
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', restart);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!inView || !video.duration) return;

      // The scrub runs from "section about to appear" to "section nearly at the
      // top" — but clamped to what the page can actually scroll, because while
      // this is the last section there is not a full screen of travel below it
      // and the clip would otherwise never reach its end.
      const box = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const sectionTop = box.top + window.scrollY;
      const from = sectionTop - viewport * SCRUB_START_AT;
      const to = Math.min(
        sectionTop - viewport * SCRUB_END_AT,
        document.documentElement.scrollHeight - viewport,
      );
      const progress = clamp(
        (window.scrollY - from) / Math.max(1, to - from),
        0,
        1,
      );

      if (!looping && progress >= LOOP_ENTER) {
        // Scrub finished — let it run so the typing carries on.
        looping = true;
        if (video.currentTime < TAIL_START) video.currentTime = TAIL_START;
        void video.play().catch(() => {});
      } else if (looping && progress < LOOP_EXIT) {
        looping = false;
        video.pause();
      }
      if (looping) return;
      if (video.seeking) return;

      const target = progress * video.duration;
      if (Math.abs(target - video.currentTime) > SEEK_EPSILON) {
        video.currentTime = target;
      }
    };

    if (scrubs) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(arming);
      cancelAnimationFrame(frame);
      observer.disconnect();
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', restart);
    };
  }, [reduced, sectionRef]);

  return (
    <div className={cn('xp-stage', className)} role="img" aria-label={label}>
      <div className="xp-stage__glow" aria-hidden="true" />

      {reduced ? (
        <img src={POSTER_SRC} alt="" aria-hidden="true" className="xp-stage__media" />
      ) : (
        // `poster` covers the gap before the first frame decodes, so there is
        // nothing here to fade in and no loaded-state to track.
        <video
          ref={videoRef}
          className="xp-stage__media"
          poster={POSTER_SRC}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
        >
          {SOURCES.map((source) => (
            <source key={source.type} src={source.src} type={source.type} />
          ))}
        </video>
      )}
    </div>
  );
}
