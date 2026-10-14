'use strict';
/* Device registry for the "Take one apart yourself" tabs, and the Ledger Nano S entry.
 *
 * Every device model is an object with:
 *  name, geometry (Float32Array), meta {meshes, triangle_count}, atlas (image URL or canvas),
 *  screen {canvas, px:[w,h], kind:'oled'|'eink'}, partIds {part:number}, pcbParts [names],
 *  center [x,y,z] (aims the shadow lights), startProgress, implantProgress,
 *  rig(progress) -> {part: 4x4 matrix}. Progress runs from 0 (closed) to 6 (fully apart).
 *
 * The Nano S is the original pre-built model, embedded in the page as #assets-data.
 * Its take-apart animation used to live inside the renderer. It moved here unchanged. */
const DEVICE_MODELS={};

DEVICE_MODELS.nanoS={
  label:'Nano S',name:'Ledger Nano S',
  note:'Ledger Nano S, 3D reconstruction.',
  implantNote:'Illustration only: this added board is fictional, not a real Nano S implant.',
  create(){
    const assets=JSON.parse(document.getElementById('assets-data').textContent);
    const bytes=Uint8Array.from(atob(assets.binary),c=>c.charCodeAt(0));
    // The OLED image: 128 x 32 pixels, blue text on black.
    const screen=document.createElement('canvas');screen.width=128;screen.height=32;
    const c=screen.getContext('2d');c.fillStyle='#050c15';c.fillRect(0,0,128,32);
    c.fillStyle='#82d8fa';c.textAlign='center';c.font='bold 9px monospace';c.fillText('Ledger Nano S',64,12);c.font='7px monospace';c.fillStyle='#4da2c3';c.fillText('3D REFERENCE',64,24);
    return {name:this.name,geometry:new Float32Array(bytes.buffer),meta:assets.meta,atlas:assets.atlas,
      screen:{canvas:screen,px:[128,32],kind:'oled'},partIds:PART_IDS,pcbParts:PCB_PARTS,
      center:[17,0,0],startProgress:1,implantProgress:5,rig:nanoSRig};
  }
};

// Nano S take-apart steps: 1 swivel swings open, 2 swivel slides away, 3 rear shell drops,
// 4 front shell lifts, 5 buttons and the OLED come off, 6 the board turns over.
function nanoSRig(p){
  const t={},s1=smooth(clamp(p,0,1)),s2=smooth(clamp(p-1,0,1)),s3=smooth(clamp(p-2,0,1)),s4=smooth(clamp(p-3,0,1)),s5=smooth(clamp(p-4,0,1)),s6=smooth(clamp(p-5,0,1));
  const cover=Mat.mul(Mat.translation(19.775+8*s2,15*s2,9*s2),Mat.mul(Mat.rotZ(-Math.PI*s1),Mat.translation(-19.775,0,0)));
  const spread=.82*Math.sin(s2*Math.PI);
  t.coverTop=Mat.mul(cover,Mat.translation(0,0,spread));
  t.coverBottom=Mat.mul(cover,Mat.translation(0,0,-spread));t.coverSpine=cover;
  t.front=Mat.translation(0,0,21.5*s4);
  t.rear=Mat.translation(0,0,-13.5*s3);
  t.buttons=Mat.translation(0,12*s5,12*s5);
  // Slide the flex out of the right-facing slot before lifting the OLED.
  const release=smooth(clamp((p-4)/.30,0,1));
  const lift=smooth(clamp((p-4-.30)/.70,0,1));
  t.display=Mat.translation(3.8*release+16.2*lift,0,11.7*lift);
  t.ribbon=t.display;
  const board=Mat.rotX(Math.PI*(1+s6));
  for(const k of PCB_PARTS)t[k]=board;
  t.implant=Mat.translation(0,-1.0,-7.0);
  return t;
}

// Shared helpers for the built models (Nano X, Flex, Stax).
// Gives every part a pick id (1, 2, 3...). The "cover*" pieces share one id, like the Nano S.
function makePartIds(parts){const ids={};let n=1;for(const p of parts){const k=p.startsWith('cover')?'cover':p;if(!ids[k])ids[k]=n++;}return ids;}
// Step i of the animation (0-based), eased: 0 before the step, 1 after it.
const rigStep=(p,i)=>smooth(clamp(p-i,0,1));
