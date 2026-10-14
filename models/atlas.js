'use strict';
/* Atlas: one big canvas that holds every printed mark of a model:
 * chip markings, silkscreen text, logos, QR codes, laser etching.
 *
 * Decals (material kind 4) only use the ALPHA channel of the atlas.
 * The colour comes from the decal's material. So everything here is drawn in plain white.
 * add() returns the uv box [u0,v0,u1,v1] to pass to MeshKit.label().
 * Keep the decal's millimetre size in the same shape (width:height) as the box in pixels. */
class Atlas{
  constructor(size=2048){
    this.size=size;this.canvas=document.createElement('canvas');this.canvas.width=this.canvas.height=size;
    this.ctx=this.canvas.getContext('2d');this.x=0;this.y=0;this.row=0;
  }
  // Reserves a w x h pixel box (filled row by row), lets draw(ctx,w,h) paint it, returns its uv box.
  // The renderer flips the image when uploading it, so v = 1 is the top of the canvas.
  add(w,h,draw){
    const pad=6;if(this.x+w>this.size){this.x=0;this.y+=this.row+pad;this.row=0;}
    const x=this.x,y=this.y,c=this.ctx;this.x+=w+pad;this.row=Math.max(this.row,h);
    c.save();c.translate(x,y);c.beginPath();c.rect(0,0,w,h);c.clip();c.fillStyle=c.strokeStyle='#fff';c.lineCap='butt';draw(c,w,h);c.restore();
    const S=this.size;return [x/S,1-(y+h)/S,(x+w)/S,1-y/S];
  }
  // Lines of text, evenly spaced. o.weight, o.family, o.align ('left','center','right'), o.px (font size).
  text(lines,o={}){
    const w=o.w||512,h=o.h||128,list=[].concat(lines);
    return this.add(w,h,c=>{
      const px=o.px||Math.floor(h/list.length*.74);
      c.font=`${o.weight||600} ${px}px ${o.family||'Arial, Helvetica, sans-serif'}`;c.textBaseline='middle';c.textAlign=o.align||'center';
      const x=o.align==='left'?2:o.align==='right'?w-2:w/2;
      list.forEach((t,i)=>c.fillText(t,x,(i+.5)*h/list.length,w-4));
    });
  }
  // Ledger's mark: four corner brackets. With an "L" inside (o.word omitted) or a word between them.
  logo(o={}){
    const w=o.w||256,h=o.h||256;
    return this.add(w,h,c=>{
      const t=o.line||Math.max(3,h*.07),arm=o.arm||h*.3,m=t/2+1;c.lineWidth=t;
      const corner=(x,y,dx,dy)=>{c.beginPath();c.moveTo(x+dx*arm,y);c.lineTo(x,y);c.lineTo(x,y+dy*arm);c.stroke();};
      corner(m,m,1,1);corner(w-m,m,-1,1);corner(m,h-m,1,-1);corner(w-m,h-m,-1,-1);
      if(o.word){c.font=`${o.weight||500} ${Math.floor(h*.62)}px Arial, Helvetica, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(o.word,w/2,h/2+h*.03,w-arm*1.2);}
      else{c.lineWidth=t;c.beginPath();c.moveTo(w*.43,h*.3);c.lineTo(w*.43,h*.62);c.lineTo(w*.66,h*.62);c.stroke();}
    });
  }
  // A made-up QR-style code (random squares plus the three corner finder marks).
  // It only looks like a code. It does not encode anything.
  qr(seed=1,o={}){
    const n=o.n||25,px=o.px||200,rnd=seededRandom(seed);
    return this.add(px,px,c=>{
      const s=px/n;
      for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(rnd()<.5)c.fillRect(x*s,y*s,s+.5,s+.5);
      for(const [fx,fy] of [[0,0],[n-7,0],[0,n-7]]){
        c.clearRect(fx*s,fy*s,7*s,7*s);c.fillRect(fx*s,fy*s,7*s,7*s);c.clearRect((fx+1)*s,(fy+1)*s,5*s,5*s);c.fillRect((fx+2)*s,(fy+2)*s,3*s,3*s);
      }
    });
  }
  // A paper sticker image: a square made-up code on top, one line of small text under it.
  // Used for the QR stickers on the Flex and Stax parts. Box size o.w x o.h pixels.
  qrLabel(seed=1,o={}){
    const w=o.w||200,h=o.h||220,n=21,rnd=seededRandom(seed);
    return this.add(w,h,c=>{
      const s=Math.min(w,h*.78)-4,cell=s/n,x0=(w-s)/2;
      for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(rnd()<.5)c.fillRect(x0+x*cell,2+y*cell,cell+.5,cell+.5);
      for(const [fx,fy] of [[0,0],[n-7,0],[0,n-7]]){
        const X=x0+fx*cell,Y=2+fy*cell;c.clearRect(X,Y,7*cell,7*cell);c.fillRect(X,Y,7*cell,7*cell);c.clearRect(X+cell,Y+cell,5*cell,5*cell);c.fillRect(X+2*cell,Y+2*cell,3*cell,3*cell);
      }
      c.font=`600 ${Math.floor(h*.13)}px Arial, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(o.text||'',w/2,h*.9,w-4);
    });
  }
  // A made-up Data Matrix code (the small square codes laser-etched on circuit boards).
  matrix(seed=2,o={}){
    const n=o.n||16,px=o.px||160,rnd=seededRandom(seed);
    return this.add(px,px,c=>{const s=px/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const edge=x===0||y===n-1||(y===0&&x%2===0)||(x===n-1&&y%2===1);if(edge||rnd()<.48)c.fillRect(x*s,y*s,s,s);}});
  }
  // Regulatory marks: "CE", the crossed-out wheelie bin, and optionally "UK CA".
  marks(o={}){
    const w=o.w||512,h=o.h||160;
    return this.add(w,h,c=>{
      c.lineWidth=h*.08;const r=h*.32,cy=h/2;
      // CE: two open circles. The E has a middle bar.
      // The arc runs clockwise from lower-right, round the left side, to upper-right: a "C" open to the right.
      for(const [x,bar] of [[h*.42,false],[h*1.12,true]]){c.beginPath();c.arc(x,cy,r,Math.PI*.27,Math.PI*1.73);c.stroke();if(bar){c.fillRect(x-r*.95,cy-h*.04,r*.8,h*.08);}}
      let x=h*1.75;
      if(o.ukca){c.font=`700 ${Math.floor(h*.36)}px Arial, sans-serif`;c.textAlign='left';c.textBaseline='middle';c.fillText('UK',x,cy-h*.2);c.fillText('CA',x,cy+h*.2);x+=h*.9;}
      // Bin: body, lid, wheel, two crossing lines, and the bar underneath.
      c.lineWidth=h*.045;c.strokeRect(x+h*.12,h*.25,h*.4,h*.5);c.beginPath();c.moveTo(x+h*.06,h*.2);c.lineTo(x+h*.58,h*.2);c.stroke();
      c.beginPath();c.moveTo(x,h*.1);c.lineTo(x+h*.66,h*.85);c.moveTo(x+h*.66,h*.1);c.lineTo(x,h*.85);c.stroke();
      if(o.binBar!==false)c.fillRect(x+h*.08,h*.88,h*.5,h*.08);
    });
  }
}
