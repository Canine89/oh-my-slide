// Install-time asset preparation. No network request is made by this script.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=path.join(root,'assets');
fs.mkdirSync(path.join(assets,'licenses'),{recursive:true});
for(const [name,file,out] of [['lottie-web','build/player/lottie.min.js','lottie.min.js'],['gsap','dist/gsap.min.js','gsap.min.js']]){
 const dir=path.dirname(require.resolve(name+'/package.json'));
 fs.copyFileSync(path.join(dir,file),path.join(assets,out));
 const license=['LICENSE','LICENSE.md','LICENSE.txt','license.txt'].find(f=>fs.existsSync(path.join(dir,f)));
 if(license){
  fs.copyFileSync(path.join(dir,license),path.join(assets,'licenses',name+'.txt'));
 }else{
  // GSAP's npm package declares its license by URL and retains copyright in the runtime header.
  const meta=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
  if(typeof meta.license!=='string')throw new Error('Package license declaration not found: '+name);
  const header=fs.readFileSync(path.join(dir,file),'utf8').match(/^\/\*![\s\S]*?\*\//)?.[0]||'';
  fs.writeFileSync(path.join(assets,'licenses',name+'.txt'),`${meta.name} ${meta.version}\nLicense declaration: ${meta.license}\n\n${header}\n`);
 }
}
console.log('Local Lottie/GSAP runtime assets and license notices prepared.');
