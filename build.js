import * as esbuild from 'esbuild';

const ctx = await esbuild.context({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: process.argv.includes('--minify'),
  define: { 'process.env.NODE_ENV': '"production"' }
});

if (process.argv.includes('--watch')) {
  await ctx.watch();
  console.log('Watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete');
}
