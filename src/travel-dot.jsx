import React, { useLayoutEffect, useRef } from 'react';
import { createPointMotion } from './point-motion.mjs';

export function TravelDot({ points, duration, mode, motionKey }) {
  const element = useRef(null), motion = useRef(null);
  const routeKey = JSON.stringify(points);
  useLayoutEffect(() => {
    const circle = element.current;
    const controller = createPointMotion({
      points, duration,
      requestFrame: callback => requestAnimationFrame(callback),
      cancelFrame: id => cancelAnimationFrame(id),
      paint([x, y], progress) {
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.setAttribute('data-progress', progress.toFixed(4));
      },
    });
    motion.current = controller;
    return () => controller.pause();
  }, [motionKey, routeKey]);
  useLayoutEffect(() => {
    const controller = motion.current;
    controller.setDuration(duration);
    if (mode === 'paused') controller.pause();
    else controller.play();
    return () => controller.pause();
  }, [motionKey, routeKey, duration, mode]);
  return <circle ref={element} className="flow-particle iso-travel-dot" r="7"
    cx={points[0][0]} cy={points[0][1]} data-motion={mode} aria-hidden="true" />;
}
