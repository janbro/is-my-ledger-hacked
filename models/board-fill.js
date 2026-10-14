'use strict';
/* BoardFill: fills the empty space of a board face with small parts and vias.
 * Real Ledger boards are packed with tiny capacitors, resistors and via holes.
 * Placing each one by hand would take hundreds of lines, so this places them for us:
 *  - only inside the board outline,
 *  - never on top of a big part (every big part is "blocked" first),
 *  - never on top of each other.
 * A seeded random generator is used, so the layout is the same on every visit.
 *
 * Usage, inside a board-face placement:
 *   const fill=new BoardFill(outline,seed); fill.block(x,y,w,h); ...
 *   fill.passives(k,40,[x0,y0,x1,y1]); fill.vias(k,120); */
class BoardFill{
  constructor(outline,seed=1){this.poly=outline;this.taken=[];this.rnd=seededRandom(seed);}
  // Marks a w x h box centred on (x,y) as used (a chip, a connector, a hole, an antenna...).
  block(x,y,w,h){this.taken.push([x-w/2,y-h/2,x+w/2,y+h/2]);return this;}
  // Same for a list of [x,y,w,h].
  blockAll(list){for(const b of list)this.block(...b);return this;}
  // True if point (x,y) is inside the outline (standard ray-crossing test).
  inside(x,y){
    let c=false;const p=this.poly;
    for(let i=0,j=p.length-1;i<p.length;j=i++){
      if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;
    }
    return c;
  }
  // True if a w x h box at (x,y) is on the board and touches nothing already placed.
  // "edge" keeps parts this far away from the board edge.
  fits(x,y,w,h,edge=.5){
    const b=[x-w/2,y-h/2,x+w/2,y+h/2];
    for(const [cx,cy] of [[b[0]-edge,b[1]-edge],[b[2]+edge,b[1]-edge],[b[2]+edge,b[3]+edge],[b[0]-edge,b[3]+edge]])if(!this.inside(cx,cy))return false;
    return !this.taken.some(t=>b[0]<t[2]&&b[2]>t[0]&&b[1]<t[3]&&b[3]>t[1]);
  }
  // A random point, inside "area" [x0,y0,x1,y1] if given, else inside the outline's bounding box.
  pick(area){
    const xs=this.poly.map(p=>p[0]),ys=this.poly.map(p=>p[1]);
    const a=area||[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    return [a[0]+this.rnd()*(a[2]-a[0]),a[1]+this.rnd()*(a[3]-a[1])];
  }
  // Adds up to n small passives (mostly 0402, some 0201 and 0603). Some are black resistors.
  passives(k,n,area,sizes=['0402','0402','0402','0201','0603']){
    let placed=0;
    for(let tries=0;tries<n*40&&placed<n;tries++){
      const [x,y]=this.pick(area),size=sizes[Math.floor(this.rnd()*sizes.length)],turn=this.rnd()<.5;
      const [L,W]=PASSIVE_SIZES[size],w=(turn?W:L)+.3,h=(turn?L:W)+.3;
      if(!this.fits(x,y,w,h))continue;
      k.passive(x,y,size,{rz:turn?Math.PI/2:0,res:this.rnd()<.3});this.block(x,y,w,h);placed++;
    }
    return placed;
  }
  // Adds up to n tiny vias (plated holes). They may sit closer together than parts.
  vias(k,n,area,r=.17){
    let placed=0;
    for(let tries=0;tries<n*20&&placed<n;tries++){
      const [x,y]=this.pick(area),s=r*2+.12;
      if(!this.fits(x,y,s,s,.35))continue;
      k.via(x,y,r);this.block(x,y,s,s);placed++;
    }
    return placed;
  }
}
