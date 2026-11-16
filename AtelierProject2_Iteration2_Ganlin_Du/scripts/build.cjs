const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
for (const file of ['src/main.js','src/adaptive-system.js','src/panel-materials.js','src/application-interiors.js','src/scene-sizing.js']) {
  const filename=path.join(root,file);
  execFileSync(process.execPath, ['--check',filename]);
  if(/[\u3400-\u9fff]/.test(fs.readFileSync(filename,'utf8'))) throw new Error('Non-English source text found: '+file);
}
const out = path.join(root, 'dist');
fs.mkdirSync(out, {recursive:true});
for (const name of ['index.html','src','public']) fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Built dist/ for static hosting. Three.js uses the existing CDN import map.');
