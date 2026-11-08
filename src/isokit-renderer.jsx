import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MechanismScene } from './isokit-scene.jsx';
import { BeginnerIntro } from './beginner-intro.jsx';
import { INTRO_CHAPTERS } from './intro-content.mjs';
import 'react-isokit/styles.css';

let root, introRoot;
window.SystemsDiagram = Object.freeze({
  render(props) {
    root ??= createRoot(document.getElementById('diagram'));
    // Keep the diagram and the existing synchronous trace/controls on the same frame.
    flushSync(() => root.render(<MechanismScene {...props} />));
  },
});
window.K8sIntro = Object.freeze({
  chapters: INTRO_CHAPTERS.map(chapter => chapter.short),
  render(props) {
    introRoot ??= createRoot(document.getElementById('intro-view'));
    flushSync(() => introRoot.render(<BeginnerIntro {...props}/>));
  },
  clear() {
    if (!introRoot) return;
    flushSync(() => introRoot.unmount());
    introRoot = undefined;
  },
});
