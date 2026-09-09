import fs from 'node:fs';import opentype from 'opentype.js';
const font=opentype.loadSync('assets/fonts/Paperlogy-9Black.ttf');
const labelFont=opentype.loadSync('assets/fonts/Paperlogy-7Bold.ttf');
const W=1080,H=1920,END=1080,FPS=60,C={blue:'#104d9e',yellow:'#ffbc1e',cream:'#fffaf0',white:'#ffffff'};
const A=k=>({a:0,k});const rgb=h=>h.match(/\w{2}/g).map(v=>parseInt(v,16)/255).concat(1);
function K(points,ease='out'){return{a:1,k:points.map(([t,v,style],i)=>({t,s:Array.isArray(v)?v:[v],...(i<points.length-1?((style||ease)==='hold'?{h:1}:{i:{x:[(style||ease)==='in'?.75:.3],y:[1]},o:{x:[(style||ease)==='in'?.7:.15],y:[(style||ease)==='in'?0:1]}}):{})}))}}
const prop=v=>v&&v.a!==undefined?v:A(v);let ind=1;const layers=[],assets=[];
function add(nm,ty,ip,op,ks={},extra={}){const l={ddd:0,ind:ind++,ty,nm,sr:1,ks:{p:prop(ks.p??[0,0,0]),a:prop(ks.a??[0,0,0]),s:prop(ks.s??[100,100,100]),r:prop(ks.r??0),o:prop(ks.o??100)},ao:0,ip,op,st:0,bm:0,...extra};layers.push(l);return l;}
function group(nm,ip,op,ks={}){return add(nm,3,ip,op,ks);}
function bg(c,ip,op){return add('Color field',1,ip,op,{}, {sw:W,sh:H,sc:c});}
const fill=c=>({ty:'fl',c:A(rgb(c)),o:A(100),r:1});
function rect(nm,x,y,w,h,c,ip,op,ks={},parent){return add(nm,4,ip,op,{p:[x,y,0],...ks},{...(parent?{parent:parent.ind}:{}),shapes:[{ty:'rc',p:A([0,0]),s:A([w,h]),r:A(0)},fill(c)]});}
function contours(commands){const out=[];let q=null,last=null;const point=(x,y,i=[0,0])=>{q.v.push([x,y]);q.i.push(i);q.o.push([0,0]);last=[x,y]};const close=()=>{if(q&&q.v.length>1){if(q.v[0][0]===q.v.at(-1)[0]&&q.v[0][1]===q.v.at(-1)[1]){q.i[0]=q.i.at(-1);q.v.pop();q.i.pop();q.o.pop()}out.push({ty:'sh',ks:A(q)})}q=null};for(const c of commands){if(c.type==='M'){close();q={v:[],i:[],o:[],c:true};point(c.x,c.y)}else if(c.type==='L')point(c.x,c.y);else if(c.type==='C'){q.o[q.o.length-1]=[c.x1-last[0],c.y1-last[1]];point(c.x,c.y,[c.x2-c.x,c.y2-c.y])}else if(c.type==='Q'){q.o[q.o.length-1]=[(c.x1-last[0])*2/3,(c.y1-last[1])*2/3];point(c.x,c.y,[(c.x1-c.x)*2/3,(c.y1-c.y)*2/3])}else if(c.type==='Z')close()}close();return out;}
function word(str,{size=200,x=540,y=960,c=C.blue,ip=0,op=END,parent,ks={},outline=false,draw,letters,tracking}={}){
const face=size<90?labelFont:font;
const gaps=tracking??(size<90?-.5:-6);let pen=0;const parts=[];let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
for(const ch of str){const glyph=face.charToGlyph(ch),p=glyph.getPath(pen,0,size),b=p.getBoundingBox();if(ch!==' '){minX=Math.min(minX,b.x1);minY=Math.min(minY,b.y1);maxX=Math.max(maxX,b.x2);maxY=Math.max(maxY,b.y2);parts.push(p.commands)}pen+=glyph.advanceWidth/face.unitsPerEm*size+gaps;}
const shapes=[];parts.forEach((commands,j)=>{const shape=contours(commands);if(!outline)shape.push(fill(c));else shape.push({ty:'st',c:A(rgb(c)),o:A(100),w:A(3),lc:2,lj:2});if(draw)shape.push({ty:'tm',s:A(0),e:K([[draw,0],[draw+30,100]]),o:A(0),m:1});
let tr={ty:'tr',p:A([0,0]),a:A([0,0]),s:A([100,100]),r:A(0),o:A(100),sk:A(0),sa:A(0)};
if(letters){const t=letters+j*3;tr={...tr,p:K([[t,[0,-180]],[t+16,[0,18]],[t+26,[0,0]]]),s:K([[t,[82,160]],[t+16,[110,84]],[t+26,[100,100]]]),o:K([[t,0],[t+2,100]])};}
shape.push(tr);shapes.push({ty:'gr',it:shape,nm:'Glyph '+j});});
return add('TYPE '+str,4,ip,op,{p:[x,y,0],a:[(minX+maxX)/2,(minY+maxY)/2,0],...ks},{shapes,...(parent?{parent:parent.ind}:{}),metaText:str});}
const meta=JSON.parse(fs.readFileSync('assets/cutouts/metadata.json'));
function image(i,{x,y,width,ip,op,parent,ks={}}){const m=i==='cover'?meta.cover:i==='kakaotalk'?{w:512,h:512}:meta[i],id='image-'+i,p=i==='cover'?'assets/cover.png':i==='kakaotalk'?'assets/icons/kakaotalk.png':`assets/cutouts/illustration-${i}.png`;if(!assets.some(a=>a.id===id))assets.push({id,w:m.w,h:m.h,u:'',p,e:0});const sc=width/m.w*100;return add('PNG '+i,2,ip,op,{p:[x,y,0],a:[m.w/2,m.h/2,0],s:[sc,sc,100],...ks},{refId:id,...(parent?{parent:parent.ind}:{}),metaWidth:width});}
// 01 / A question made of type. Graphic is already legible in the first quarter second.
bg(C.yellow,0,120);
const hook=group('01 Question move',0,120,{p:K([[0,[0,0,0]],[98,[0,0,0]],[120,[-100,-500,0]]]),r:K([[0,0],[98,0],[120,-9]])});
word('파이썬',{size:330,y:660,ip:0,op:120,parent:hook,letters:5,ks:{s:[100,150,100]}});
word('처음?',{size:235,x:405,y:1040,ip:29,op:120,parent:hook,ks:{p:K([[29,[405,1380,0]],[49,[405,1010,0]],[61,[405,1040,0]]]),r:K([[29,10],[61,-5]])}});
image(5,{x:800,y:1410,width:410,ip:40,op:120,parent:hook,ks:{p:K([[40,[1300,1510,0]],[64,[800,1395,0]],[90,[800,1410,0]]]),r:K([[40,20],[64,-4],[90,3]])}});
// 02 / Type takes over the whole frame. Squash/stretch + a firm reading hold.
bg(C.blue,120,240);
const easy=group('02 Scale release',120,240,{a:[540,960,0],p:[540,960,0],s:K([[120,[100,100,100]],[212,[100,100,100]],[240,[185,220,100]]]),o:K([[120,100],[232,100],[240,0]])});
word('쉽게!',{size:354,y:325,c:C.yellow,outline:true,ip:120,op:240,parent:easy,ks:{o:42,p:K([[120,[440,290,0]],[210,[540,325,0]]])}});
word('쉽게!',{size:354,y:1550,c:C.yellow,outline:true,ip:120,op:240,parent:easy,ks:{o:42,p:K([[120,[650,1600,0]],[210,[540,1550,0]]])}});
word('누구나',{size:284,y:720,c:C.cream,ip:120,op:240,parent:easy,ks:{s:K([[120,[10,160,100]],[136,[108,94,100]],[145,[100,100,100]]])}});
word('쉽게!',{size:350,y:1080,c:C.yellow,ip:133,op:240,parent:easy,ks:{s:K([[133,[130,5,100]],[152,[94,109,100]],[165,[100,100,100]]]),r:K([[133,8],[165,-5]])}});
// 03 / Keep BARO alive; the verb and illustration hand off around it.
bg(C.yellow,240,480);
const action=group('03 Continuous BARO',240,480,{p:K([[240,[0,0,0]],[458,[0,0,0]],[480,[80,-380,0]]]),r:K([[240,0],[458,0],[480,7]])});
word('바로',{size:464,x:556,y:720,c:C.blue,outline:true,draw:242,ip:240,op:480,parent:action,ks:{o:35,p:K([[240,[556,750,0]],[276,[556,720,0]],[360,[556,720,0]],[384,[466,780,0]]]),r:K([[240,0],[360,0],[384,-6]])}});
word('바로',{size:464,y:655,ip:240,op:480,parent:action,ks:{p:K([[240,[540,100,0]],[262,[540,690,0]],[276,[540,655,0]],[358,[540,655,0]],[384,[450,720,0]]]),s:K([[240,[100,75,100]],[262,[108,94,100]],[276,[100,100,100]],[358,[100,100,100]],[384,[88,88,100]]]),r:K([[240,0],[358,0],[384,-6]])}});
word('배우고',{size:188,x:367,y:1160,ip:266,op:367,parent:action,ks:{p:K([[266,[-800,1160,0]],[291,[367,1160,0]],[344,[367,1160,0]],[367,[1600,1160,0]]]),r:-5}});
image(3,{x:770,y:975,width:470,ip:274,op:367,parent:action,ks:{p:K([[274,[1300,925,0]],[302,[770,975,0]],[344,[770,975,0]],[367,[1700,1100,0]]]),r:K([[274,10],[302,4],[344,4],[367,15]])}});
word('쓰자!',{size:244,x:663,y:1285,ip:360,op:480,parent:action,ks:{p:K([[360,[663,1950,0]],[385,[663,1260,0]],[398,[663,1285,0]]]),r:-6}});
image(4,{x:320,y:1030,width:455,ip:365,op:480,parent:action,ks:{p:K([[365,[-450,930,0]],[393,[320,1030,0]],[458,[320,1015,0]]]),r:K([[365,-20],[393,-4],[458,2]])}});
// 04 / Two syllables meet: the visual movement itself says TOGETHER.
bg(C.cream,480,690);
const together=group('04 Meet',480,690,{p:K([[480,[0,0,0]],[666,[0,0,0]],[690,[0,380,0]]]),s:K([[480,[100,100,100]],[666,[100,100,100]],[690,[110,80,100]]])});
word('함',{size:476,x:300,y:765,ip:480,op:690,parent:together,ks:{p:K([[480,[-450,650,0]],[507,[315,765,0]],[520,[300,765,0]]]),r:K([[480,-20],[507,5],[520,0]])}});
word('께',{size:476,x:793,y:765,ip:484,op:690,parent:together,ks:{p:K([[484,[1510,900,0]],[511,[778,765,0]],[524,[793,765,0]]]),r:K([[484,20],[511,-5],[524,0]])}});
rect('Community highlight',540,1100,870,128,C.yellow,519,690,{s:K([[519,[0,100,100]],[549,[100,100,100]]])},together);
image('kakaotalk',{x:208,y:1100,width:98,ip:535,op:690,parent:together,ks:{o:K([[535,0],[547,100]])}});
word('오픈카톡방 소통',{size:74,x:602,y:1100,ip:535,op:690,parent:together,ks:{o:K([[535,0],[547,100]])}});
image(1,{x:275,y:1470,width:274,ip:523,op:690,parent:together,ks:{p:K([[523,[200,1980,0]],[552,[275,1470,0]],[638,[275,1460,0]]]),r:-6}});
image(2,{x:727,y:1510,width:530,ip:534,op:690,parent:together,ks:{p:K([[534,[1250,1550,0]],[563,[727,1510,0]],[640,[727,1500,0]]]),r:4}});
// 05 / Type bands lock into the actual book title, then resolve into the cover.
bg(C.blue,690,840);
const title=group('05 Title to book',690,842,{a:[540,900,0],p:K([[690,[540,900,0]],[783,[540,900,0]],[826,[540,830,0]]]),s:K([[690,[100,100,100]],[783,[100,100,100]],[826,[45,45,100]]]),o:K([[690,100],[800,100],[815,0]])});
word('바로',{size:440,y:420,c:C.yellow,ip:690,op:842,parent:title,ks:{p:K([[690,[-700,420,0]],[714,[540,420,0]]])}});
word('바로',{size:440,y:895,c:C.cream,ip:701,op:842,parent:title,ks:{p:K([[701,[1750,895,0]],[725,[540,895,0]]])}});
word('파이썬',{size:310,y:1340,c:C.yellow,ip:712,op:842,parent:title,ks:{p:K([[712,[-900,1340,0]],[740,[540,1340,0]]])}});
for(const layer of layers){if(layer.parent===title.ind){layer.ks.o=K([[690,100],[800,100],[815,0]]);layer.op=815;}}
// 06 / Product. Four clear seconds, no extra sales copy.
bg(C.yellow,840,END);
rect('Book offset blue edge',550,1018,645,879,C.blue,814,END,{r:K([[814,8],[846,2],[890,0]]),o:K([[814,0],[835,100]])});
image('cover',{x:540,y:1010,width:640,ip:807,op:END,ks:{o:K([[807,0],[835,100]]),p:K([[807,[540,1110,0]],[846,[540,1010,0]],[920,[540,997,0]],[1000,[540,1000,0]]]),r:K([[807,8],[846,2],[890,0]])}});
word('지금, 바로.',{size:120,y:350,ip:839,op:END,ks:{p:K([[839,[540,0,0]],[863,[540,362,0]],[879,[540,350,0]]])}});
word('골든래빗',{size:62,y:1640,ip:859,op:END,ks:{o:K([[859,0],[879,100]])}});
// Two directional transitions. Fast travel, no blank frames or decorative wipes.
rect('Blue push',0,0,1080,1920,C.blue,110,123,{p:K([[110,[1620,960,0]],[120,[540,960,0]],[123,[-540,960,0]]],'in')});
rect('Cream push',0,0,1080,1920,C.cream,470,483,{p:K([[470,[540,2880,0]],[480,[540,960,0]],[483,[540,-960,0]]],'in')});
for(const l of layers){delete l.metaText;delete l.metaWidth;}
const animation={v:'5.12.2',fr:FPS,ip:0,op:END,w:W,h:H,nm:'BARO — kinetic book commercial V4 — Paperlogy',ddd:0,assets,layers:layers.reverse(),markers:[{tm:0,cm:'파이썬 처음?',dr:120},{tm:120,cm:'누구나 쉽게',dr:120},{tm:240,cm:'바로 배우고 바로 쓰자',dr:240},{tm:480,cm:'함께 오픈카톡방',dr:210},{tm:690,cm:'바로바로 파이썬',dr:150},{tm:840,cm:'Book',dr:240}]};
fs.writeFileSync('assets/lottie/python-kinetic-v4.json',JSON.stringify(animation));
fs.writeFileSync('index.html',`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>바로바로 파이썬 — V4 · Paperlogy</title><script src="assets/lottie.min.js"></script><script src="assets/gsap.min.js"></script><style>html,body{margin:0;background:#ffbc1e}#main,#kinetic{position:relative;width:1080px;height:1920px;overflow:hidden}#kinetic{position:absolute;inset:0}</style></head><body><div id="main" data-composition-id="main" data-width="1080" data-height="1920" data-duration="18" data-fps="60"><div id="kinetic" aria-label="파이썬 처음? 누구나 쉽게! 바로 배우고 쓰자! 함께. 오픈카톡방 소통. 바로바로 파이썬. 지금, 바로. 골든래빗."></div><audio id="ad-rhythm" src="assets/music/funkee-monkeee-18s.wav" data-start="0" data-duration="18" data-track-index="10" data-volume="1"></audio></div><script>const animationData=${JSON.stringify(animation)};const animation=lottie.loadAnimation({container:document.getElementById('kinetic'),renderer:'svg',loop:false,autoplay:false,animationData});animation.addEventListener('DOMLoaded',()=>{document.querySelector('#kinetic > svg > g')?.setAttribute('data-layout-allow-overflow','true')});window.__hfLottie=window.__hfLottie||[];window.__hfLottie.push(animation);window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
console.log('V4:',layers.length,'layers,',assets.length,'images');
