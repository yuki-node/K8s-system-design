import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MechanismScene } from './isokit-scene.jsx';
import 'react-isokit/styles.css';

let root;
window.SystemsDiagram = Object.freeze({
  render(props) {
    root ??= createRoot(document.getElementById('diagram'));
    // Keep the diagram and the existing synchronous trace/controls on the same frame.
    flushSync(() => root.render(<MechanismScene {...props} />));
  },
});
