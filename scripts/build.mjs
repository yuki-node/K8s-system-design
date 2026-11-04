import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const result = await build({
  entryPoints: ['src/isokit-renderer.jsx'],
  outfile: 'dist/isokit.js',
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'eof',
  metafile: true,
});
await mkdir('dist/licenses', { recursive: true });
for (const name of ['react', 'react-dom', 'react-isokit']) {
  await writeFile(`dist/licenses/${name}.txt`, await readFile(`node_modules/${name}/LICENSE`, 'utf8'));
}
await writeFile('dist/licenses/isokit-notices.md', await readFile('node_modules/react-isokit/NOTICE.md', 'utf8'));
const inputs = Object.keys(result.metafile.inputs);
if (!inputs.some(name => name.includes('react-isokit'))) throw new Error('IsoKit missing from bundle');
await writeFile('dist/licenses/build-info.json', JSON.stringify({
  renderer: 'react-isokit', version: '0.5.0',
  react: '19.3.1',
  outputs: Object.fromEntries(Object.entries(result.metafile.outputs).map(([name, output]) => [name, { bytes: output.bytes }])),
}, null, 2) + '\n');
console.log('Built local React / IsoKit renderer:', result.metafile.outputs['dist/isokit.js'].bytes, 'bytes');
