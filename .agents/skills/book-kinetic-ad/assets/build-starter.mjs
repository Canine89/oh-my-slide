// Shared output wiring only. Author the new book's timeline in composition.mjs.
import fs from 'node:fs';
import { animation, audio } from './composition.mjs';

if (!animation || !Array.isArray(animation.layers) || !animation.layers.length) {
  throw new Error('새 책의 BRIEF와 선곡을 정하고 scripts/composition.mjs에 장면을 작성하세요. 이전 광고는 자동 복제하지 않습니다.');
}
const { w, h, fr, ip = 0, op } = animation;
if (![w, h, fr, op].every(Number.isFinite) || w <= 0 || h <= 0 || fr <= 0 || ip !== 0 || op <= ip) {
  throw new Error('Lottie requires positive w/h/fr/op and ip=0.');
}
if (audio !== null && (!audio?.src || !fs.existsSync(audio.src))) {
  throw new Error('audio.src must name the selected local music file; use audio:null only for an intentional silent composition.');
}
const duration = op / fr;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = JSON.stringify(animation).replace(/</g, '\\u003c');
const music = audio === null ? '' : `<audio id="ad-bgm" src="${esc(audio.src)}" data-start="0" data-duration="${duration}" data-track-index="10" data-volume="${Number.isFinite(audio.volume) ? Math.max(0, Math.min(1, audio.volume)) : 1}"></audio>`;
fs.mkdirSync('assets/lottie', {recursive:true});
fs.writeFileSync('assets/lottie/kinetic-ad.json', JSON.stringify(animation));
fs.writeFileSync('index.html', `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(animation.nm || 'Book kinetic ad')}</title><script src="assets/lottie.min.js"></script><script src="assets/gsap.min.js"></script><style>html,body{margin:0}#main,#kinetic{width:${w}px;height:${h}px;overflow:hidden}#main{position:relative}#kinetic{position:absolute;inset:0}</style></head><body><div id="main" data-composition-id="main" data-width="${w}" data-height="${h}" data-duration="${duration}" data-fps="${fr}"><div id="kinetic"></div>${music}</div><script>const animation=lottie.loadAnimation({container:document.getElementById('kinetic'),renderer:'svg',loop:false,autoplay:false,animationData:${json}});window.__hfLottie=window.__hfLottie||[];window.__hfLottie.push(animation);window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
console.log(`Built ${animation.nm || 'composition'}: ${w}x${h}, ${duration}s, ${fr}fps.`);
