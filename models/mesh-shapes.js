'use strict';
/* Shape helpers for MeshKit (see mesh-kit.js). All sizes are millimetres.
 * Shapes are drawn in the current placement (MeshKit.place).
 * The main tools:
 *  - roundBox: a box with rounded edges (chips, buttons, batteries).
 *  - slab: a flat outline pushed up into a plate, with holes and rounded edges (cases, boards).
 *  - strip / ribbon / tube: things that follow a path (traces, flex cables, wires).
 *  - label: a flat decal that shows part of the texture atlas (printed text, logos). */

// ---------- 2D outlines: lists of [x,y] points, counter-clockwise ----------
const Outline={
  // Rounded rectangle centred on (cx,cy). r is one radius or [bottomLeft,bottomRight,topRight,topLeft].
  // Every corner always gets seg+1 points, even when its radius is 0.
  // So outlines of different sizes line up point for point. Rounded edges need that.
  rect(w,h,r=0,seg=6,cx=0,cy=0){
    const rs=Array.isArray(r)?r:[r,r,r,r],pts=[];
    // Corners in counter-clockwise order: bottom-right, top-right, top-left, bottom-left.
    for(const [sx,sy,rr,a0] of [[1,-1,rs[1],-Math.PI/2],[1,1,rs[2],0],[-1,1,rs[3],Math.PI/2],[-1,-1,rs[0],Math.PI]]){
      const k=Math.max(0,Math.min(rr,w/2,h/2)),ox=cx+sx*(w/2-k),oy=cy+sy*(h/2-k);
      for(let i=0;i<=seg;i++){const a=a0+i/seg*Math.PI/2;pts.push([ox+k*Math.cos(a),oy+k*Math.sin(a)]);}
    }
    return pts;
  },
  // Same, but given as an inset function. Used by slab() for rounded edges.
  rectFn(w,h,r=0,seg=6,cx=0,cy=0){const rs=Array.isArray(r)?r:[r,r,r,r];return ins=>Outline.rect(w-2*ins,h-2*ins,rs.map(x=>Math.max(0,x-ins)),seg,cx,cy);},
  circle(r,seg=32,cx=0,cy=0){const p=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return p;},
  // Pill shape: a rectangle whose short ends are half circles.
  stadium(w,h,seg=8,cx=0,cy=0){return Outline.rect(w,h,Math.min(w,h)/2,seg,cx,cy);}
};
const V2={norm:a=>{const d=Math.hypot(a[0],a[1])||1;return [a[0]/d,a[1]/d];}};
const V3={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  scale:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm:a=>{const d=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/d,a[1]/d,a[2]/d];}
};
// Outward normal of each edge of a counter-clockwise outline (null for zero-length edges).
function edgeNormals(p){return p.map((a,i)=>{const b=p[(i+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);return d<1e-9?null:[dy/d,-dx/d];});}
// Wall normals at both ends of edge i. Gentle corners (under 40 degrees) are smoothed;
// sharp corners stay sharp, so flat walls do not get a shading gradient.
function wallNormals(en,i){
  const n=en.length,near=s=>{for(let k=1;k<n;k++){const e=en[((i+s*k)%n+n)%n];if(e)return e;}return en[i];};
  const blend=(a,b)=>a[0]*b[0]+a[1]*b[1]>.77?V2.norm([a[0]+b[0],a[1]+b[1]]):a;
  return [blend(en[i],near(-1)),blend(en[i],near(1))];
}
const ccw=p=>Triangulate.area(p)<0?p.slice().reverse():p;
const cw=p=>Triangulate.area(p)>0?p.slice().reverse():p;

Object.assign(MeshKit.prototype,{
  // Box centred on c with size s and rounded edges of radius r.
  // Each face is a grid. Points near an edge are pushed onto a quarter circle.
  // seg = steps per rounded edge (0 = sharp box).
  roundBox(mat,c,s,r=0,seg=1){
    const h=s.map(v=>v/2);r=Math.min(r,...h.map(v=>v*.999));if(r<1e-4){r=0;seg=0;}
    const inner=h.map(v=>v-r);
    // Grid lines along one axis: the flat middle plus seg steps over each rounded edge.
    // tan() spacing gives equal angle steps once points are pushed onto the circle.
    const axis=i=>{const a=[];for(let k=seg;k>=1;k--)a.push(-inner[i]-r*Math.tan(k/seg*Math.PI/4));a.push(-inner[i],inner[i]);for(let k=1;k<=seg;k++)a.push(inner[i]+r*Math.tan(k/seg*Math.PI/4));return a;};
    const grids=[axis(0),axis(1),axis(2)];
    const vert=p=>{
      const q=p.map((v,i)=>Math.max(-inner[i],Math.min(inner[i],v))),d=V3.sub(p,q),len=Math.hypot(...d);
      if(len<1e-9)return null;const n=V3.scale(d,1/len);return [V3.add(V3.add(q,V3.scale(n,r)),c),n];
    };
    for(let ax=0;ax<3;ax++)for(const sign of [-1,1]){
      const u=(ax+1)%3,v=(ax+2)%3,gu=grids[u],gv=grids[v];
      const P=(i,j)=>{const p=[0,0,0];p[ax]=sign*h[ax];p[u]=gu[i];p[v]=gv[j];const out=vert(p);if(out)return out;const n=[0,0,0];n[ax]=sign;return [V3.add(p,c),n];};
      for(let i=0;i<gu.length-1;i++)for(let j=0;j<gv.length-1;j++){
        const a=P(i,j),b=P(i+1,j),cc=P(i+1,j+1),d=P(i,j+1);
        this.quad(mat,a[0],b[0],cc[0],d[0],a[1],b[1],cc[1],d[1]);
      }
    }
  },
  // A plate: an outline pushed up from z0 to z1.
  //  outline: point list, or a function inset -> point list (needed for rounded edges).
  //  holes: point lists cut straight through.
  //  o.top / o.bottom: rounding radius of the outer top / bottom edge. o.seg: steps per rounding.
  //  o.caps: 'top', 'bottom' or false to skip flat faces. o.wall: another material for the sides.
  slab(mat,outline,holes,z0,z1,o={}){
    const shape=typeof outline==='function'?outline:()=>outline;
    const rt=o.top||0,rb=o.bottom||0,seg=o.seg||3,wall=o.wall||mat,rings=[];
    // Profile rings around the outer edge, from bottom to top: [points, z, vertical part of normal].
    if(rb>0)for(let i=0;i<=seg;i++){const a=-Math.PI/2+i/seg*Math.PI/2;rings.push([ccw(shape(rb*(1-Math.cos(a)))),z0+rb+rb*Math.sin(a),Math.sin(a)]);}
    else rings.push([ccw(shape(0)),z0,0]);
    if(rt>0)for(let i=0;i<=seg;i++){const a=i/seg*Math.PI/2;rings.push([ccw(shape(rt*(1-Math.cos(a)))),z1-rt+rt*Math.sin(a),Math.sin(a)]);}
    else rings.push([ccw(shape(0)),z1,0]);
    const en=edgeNormals(ccw(shape(0)));
    for(let k=0;k<rings.length-1;k++){
      const [A,za,nza]=rings[k],[B,zb,nzb]=rings[k+1],ca=Math.sqrt(1-nza*nza),cb=Math.sqrt(1-nzb*nzb);
      for(let i=0;i<A.length;i++){
        if(!en[i])continue;const j=(i+1)%A.length,[s,f]=wallNormals(en,i);
        this.quad(wall,[A[i][0],A[i][1],za],[A[j][0],A[j][1],za],[B[j][0],B[j][1],zb],[B[i][0],B[i][1],zb],
          [s[0]*ca,s[1]*ca,nza],[f[0]*ca,f[1]*ca,nza],[f[0]*cb,f[1]*cb,nzb],[s[0]*cb,s[1]*cb,nzb]);
      }
    }
    const hs=(holes||[]).map(cw);
    if(o.caps!==false)for(const [poly,z,nz] of [[rings[rings.length-1][0],z1,1],[rings[0][0],z0,-1]]){
      if(o.caps==='top'&&nz<0||o.caps==='bottom'&&nz>0)continue;
      for(const [a,b,c] of Triangulate.run(poly,hs))this.tri(mat,[a[0],a[1],z],[b[0],b[1],z],[c[0],c[1],z],[0,0,nz]);
    }
    // Hole walls. Clockwise holes make the same normal formula point into the hole (away from the material).
    for(const h of hs){
      const he=edgeNormals(h);
      for(let i=0;i<h.length;i++){
        if(!he[i])continue;const j=(i+1)%h.length,[s,f]=wallNormals(he,i);
        this.quad(wall,[h[i][0],h[i][1],z0],[h[j][0],h[j][1],z0],[h[j][0],h[j][1],z1],[h[i][0],h[i][1],z1],[s[0],s[1],0],[f[0],f[1],0],[f[0],f[1],0],[s[0],s[1],0]);
      }
    }
  },
  // Upright cylinder: base centre p = [x,y,z0], radius r, height h. o.top / o.bottom round its edges.
  cyl(mat,p,r,h,seg=24,o={}){this.slab(mat,ins=>Outline.circle(r-ins,seg,p[0],p[1]),[],p[2],p[2]+h,{top:o.top||0,bottom:o.bottom||0,seg:o.seg||2,caps:o.caps});},
  // Flat disc and flat ring facing up (nz=1) or down (nz=-1).
  disc(mat,x,y,z,r,seg=16,nz=1){for(let i=0;i<seg;i++){const a=i/seg*2*Math.PI,b=(i+1)/seg*2*Math.PI;this.tri(mat,[x,y,z],[x+r*Math.cos(a),y+r*Math.sin(a),z],[x+r*Math.cos(b),y+r*Math.sin(b),z],[0,0,nz]);}},
  ring(mat,x,y,z,r0,r1,seg=24,nz=1){for(let i=0;i<seg;i++){const a=i/seg*2*Math.PI,b=(i+1)/seg*2*Math.PI,P=(r,t)=>[x+r*Math.cos(t),y+r*Math.sin(t),z];this.quad(mat,P(r0,a),P(r1,a),P(r1,b),P(r0,b),[0,0,nz]);}},
  // The inside wall of a round hole (normals point to the hole's centre).
  tubeWall(mat,x,y,z0,z1,r,seg=24){for(let i=0;i<seg;i++){const a=i/seg*2*Math.PI,b=(i+1)/seg*2*Math.PI,na=[-Math.cos(a),-Math.sin(a),0],nb=[-Math.cos(b),-Math.sin(b),0];this.quad(mat,[x-na[0]*r,y-na[1]*r,z0],[x-nb[0]*r,y-nb[1]*r,z0],[x-nb[0]*r,y-nb[1]*r,z1],[x-na[0]*r,y-na[1]*r,z1],na,nb,nb,na);}},
  // A raised flat strip along a 2D path: circuit traces and printed coil turns.
  // w = width, z = base height, h = thickness. o.bottom adds the underside (for loose film).
  strip(mat,path,w,z,h,o={}){
    const L=[],R=[];
    for(let i=0;i<path.length;i++){
      const p=path[i],d1=i>0?V2.norm([p[0]-path[i-1][0],p[1]-path[i-1][1]]):null,d2=i<path.length-1?V2.norm([path[i+1][0]-p[0],path[i+1][1]-p[1]]):null;
      const d=d1&&d2?V2.norm([d1[0]+d2[0],d1[1]+d2[1]]):(d1||d2),n=[-d[1],d[0]];
      // Mitre: corners are pushed out a little so the strip keeps its width round bends.
      const k=d1&&d2?Math.min(2.5,1/Math.max(.4,n[0]*-d1[1]+n[1]*d1[0])):1;
      L.push([p[0]+n[0]*w/2*k,p[1]+n[1]*w/2*k]);R.push([p[0]-n[0]*w/2*k,p[1]-n[1]*w/2*k]);
    }
    const top=z+h,P=(q,zz)=>[q[0],q[1],zz];
    for(let i=0;i<path.length-1;i++){
      const d=V2.norm([path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]]),side=[-d[1],d[0],0];
      this.quad(mat,P(L[i],top),P(L[i+1],top),P(R[i+1],top),P(R[i],top),[0,0,1]);
      this.quad(mat,P(L[i],z),P(L[i+1],z),P(L[i+1],top),P(L[i],top),side);
      this.quad(mat,P(R[i],z),P(R[i+1],z),P(R[i+1],top),P(R[i],top),V3.scale(side,-1));
      if(o.bottom)this.quad(mat,P(L[i],z),P(L[i+1],z),P(R[i+1],z),P(R[i],z),[0,0,-1]);
    }
    for(const [i,s] of [[0,-1],[path.length-1,1]]){
      const j=i===0?1:i-1,d=V2.norm([path[i][0]-path[j][0],path[i][1]-path[j][1]]);
      this.quad(mat,P(L[i],z),P(R[i],z),P(R[i],top),P(L[i],top),[d[0],d[1],0]);
    }
  },
  // A flat ribbon (flex cable) following a 3D path. "across" is the direction of its width.
  ribbon(mat,pts,w,t,across=[0,1,0]){
    const frames=pts.map((p,i)=>{const tan=V3.norm(V3.sub(pts[Math.min(pts.length-1,i+1)],pts[Math.max(0,i-1)]));const n=V3.norm(V3.cross(across,tan));return [p,V3.scale(across,w/2),V3.scale(n,t/2),n];});
    const C=(f,sa,sn)=>V3.add(V3.add(f[0],V3.scale(f[1],sa)),V3.scale(f[2],sn));
    for(let i=0;i<frames.length-1;i++){
      const a=frames[i],b=frames[i+1];
      this.quad(mat,C(a,-1,1),C(b,-1,1),C(b,1,1),C(a,1,1),a[3],b[3],b[3],a[3]);
      this.quad(mat,C(a,-1,-1),C(b,-1,-1),C(b,1,-1),C(a,1,-1),V3.scale(a[3],-1),V3.scale(b[3],-1),V3.scale(b[3],-1),V3.scale(a[3],-1));
      for(const s of [-1,1])this.quad(mat,C(a,s,-1),C(b,s,-1),C(b,s,1),C(a,s,1),V3.norm(V3.scale(across,s)));
    }
  },
  // A round wire following a 3D path (implant wires).
  tube(mat,pts,r,seg=8){
    let prev=null;const rings=[];
    for(let i=0;i<pts.length;i++){
      const t=V3.norm(V3.sub(pts[Math.min(pts.length-1,i+1)],pts[Math.max(0,i-1)]));
      // Carry the side direction along the wire, so the tube does not twist.
      let n=prev?V3.sub(prev,V3.scale(t,V3.dot(prev,t))):V3.cross(t,Math.abs(t[2])<.9?[0,0,1]:[1,0,0]);n=V3.norm(n);prev=n;
      const b=V3.cross(t,n);
      rings.push(Array.from({length:seg},(_,k)=>{const a=k/seg*2*Math.PI,d=V3.add(V3.scale(n,Math.cos(a)),V3.scale(b,Math.sin(a)));return [V3.add(pts[i],V3.scale(d,r)),d];}));
    }
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=rings[i][k],b=rings[i][(k+1)%seg],c=rings[i+1][(k+1)%seg],d=rings[i+1][k];this.quad(mat,a[0],b[0],c[0],d[0],a[1],b[1],c[1],d[1]);}
  },
  // Flat decal facing +z: shows the atlas box uv=[u0,v0,u1,v1] on a w x h rectangle.
  label(mat,x,y,z,w,h,uv,rz=0){
    this.place({at:[x,y,z],rz},()=>this.quad(mat,[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0],[0,0,1],null,null,null,[uv[0],uv[1]],[uv[2],uv[1]],[uv[2],uv[3]],[uv[0],uv[3]]));
  },
  // A flat screen surface with any outline. uvAt(x,y) gives each corner's place in the screen image.
  screen(mat,outline,z,uvAt){for(const [a,b,c] of Triangulate.run(outline))this.tri(mat,[a[0],a[1],z],[b[0],b[1],z],[c[0],c[1],z],[0,0,1],null,null,uvAt(a[0],a[1]),uvAt(b[0],b[1]),uvAt(c[0],c[1]));}
});
