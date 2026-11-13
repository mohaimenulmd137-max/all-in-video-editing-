const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');
const assetsDir = path.join(distDir, 'assets');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir) || !fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));

if (cssFile) {
  const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
  html = html.replace(/<link rel="stylesheet"[^>]+>/, `<style>\n${css}\n</style>`);
}

if (jsFile) {
  const js = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  html = html.replace(/<script type="module"[^>]+><\/script>/, `<script type="module">\n${js}\n</script>`);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write to both dist and public
fs.writeFileSync(path.join(distDir, 'cinematic_studio_standalone.html'), html, 'utf8');
fs.writeFileSync(path.join(publicDir, 'cinematic_studio_standalone.html'), html, 'utf8');

console.log('Successfully created standalone single-file HTML bundle:');
console.log(' - ' + path.join(distDir, 'cinematic_studio_standalone.html'));
console.log(' - ' + path.join(publicDir, 'cinematic_studio_standalone.html'));
