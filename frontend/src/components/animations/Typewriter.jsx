/**
 * Typewriter — Animation #6.
 * Types out a string one character at a time.
 * Desktop only (min-width 768px); on mobile the text renders instantly.
 * Slow pace: 60ms per character by default (brand atmosphere — calm, not urgent).
 * Respects prefers-reduced-motion — renders full text immediately.
 *
 * Used on: Homepage hero sub-headline only.
 */
import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function Typewriter({
  text,
  speed = 60,
  delay = 1200,
  className,
  disabled = false,
}) {
  const noMotion = useReducedMotion(disabled);
  const [displayed, setDisplayed] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const started = useRef(false);

  // Check viewport on mount — desktop only
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (noMotion || isMobile) {
      setDisplayed(text);
      return;
    }

    if (started.current) return;
    started.current = true;

    let index = 0;
    let timeoutId;

    function typeNext() {
      index++;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timeoutId = setTimeout(typeNext, speed);
      }
    }

    const delayId = setTimeout(typeNext, delay);
    return () => {
      clearTimeout(delayId);
      clearTimeout(timeoutId);
    };
  }, [text, speed, delay, noMotion, isMobile]);

  return (
    <span className={className} aria-label={text}>
      {noMotion || isMobile ? text : displayed}
    </span>
  );
}
