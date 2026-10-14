'use strict';
/* MeshKit: a small toolbox that builds 3D models in plain JavaScript.
 * The Nano X, Flex and Stax models are built with it the first time their tab is opened.
 *
 * Output format. It is the same as the pre-built Nano S model, so the same renderer draws both:
 *  - One Float32Array. Every vertex is 8 numbers: position x,y,z, normal x,y,z, texture u,v.
 *  - Triangles are not indexed: every 3 vertices make one triangle.
 *  - Each (part, material) pair becomes one draw call.
 *    "part" is the piece the take-apart animation moves (for example "pcb" or "rear").
 *    "material" is a look from the MATERIALS table in the renderer (for example "gold").
 * World space: Z is up. Units are millimetres.
 *
 * Shapes are added by mesh-shapes.js and electronics.js. */

// Seeded random numbers: the same seed always gives the same "random" layout,
// so the models look the same on every visit.
function seededRandom(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}

// 3 x 3 rotation matrices, stored row by row.
const Rot3={
  id:[1,0,0, 0,1,0, 0,0,1],
  x:a=>{const c=Math.cos(a),s=Math.sin(a);return [1,0,0, 0,c,-s, 0,s,c];},
  y:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,0,s, 0,1,0, -s,0,c];},
  z:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,-s,0, s,c,0, 0,0,1];},
  mul:(a,b)=>{const r=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];return r;},
  apply:(r,p)=>[r[0]*p[0]+r[1]*p[1]+r[2]*p[2],r[3]*p[0]+r[4]*p[1]+r[5]*p[2],r[6]*p[0]+r[7]*p[1]+r[8]*p[2]]
};

class MeshKit{
  constructor(){
    this.buckets=new Map(); // "part|material" -> flat list of vertex numbers
    this.part='body';       // the part new shapes belong to
    this.r=Rot3.id;this.t=[0,0,0]; // current placement: rotation + offset
    this.triangles=0;
  }
  // Runs fn() with shapes moved and turned.
  //  o.at = [x,y,z] offset. o.rz, o.ry, o.rx = turns in radians (rz first, then ry, then rx).
  // Calls nest: a chip placed inside a board placement follows the board.
  place(o,fn){
    const r0=this.r,t0=this.t;
    let r=Rot3.z(o.rz||0);if(o.ry)r=Rot3.mul(Rot3.y(o.ry),r);if(o.rx)r=Rot3.mul(Rot3.x(o.rx),r);
    const off=Rot3.apply(r0,o.at||[0,0,0]);
    this.r=Rot3.mul(r0,r);this.t=[t0[0]+off[0],t0[1]+off[1],t0[2]+off[2]];
    try{fn();}finally{this.r=r0;this.t=t0;}
  }
  // Runs fn() with every new shape assigned to part "name".
  inPart(name,fn){const before=this.part;this.part=name;try{fn();}finally{this.part=before;}}
  bucket(mat){const key=this.part+'|'+mat;let b=this.buckets.get(key);if(!b){b=[];this.buckets.set(key,b);}return b;}

  // One triangle. a, b, c are points. na, nb, nc are their normals (nb and nc default to na).
  // ua, ub, uc are optional texture coordinates.
  // The corner order is fixed here automatically. The renderer flips the normal on back faces,
  // so the order must agree with the normals, or the triangle would be lit from behind.
  tri(mat,a,b,c,na,nb,nc,ua,ub,uc){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
    if(fx*fx+fy*fy+fz*fz<1e-14)return; // a zero-area triangle draws nothing
    nb=nb||na;nc=nc||na;
    if(fx*(na[0]+nb[0]+nc[0])+fy*(na[1]+nb[1]+nc[1])+fz*(na[2]+nb[2]+nc[2])<0){[b,c]=[c,b];[nb,nc]=[nc,nb];[ub,uc]=[uc,ub];}
    const out=this.bucket(mat),r=this.r,t=this.t;
    for(const [p,n,uv] of [[a,na,ua],[b,nb,ub],[c,nc,uc]]){
      const w=Rot3.apply(r,p),m=Rot3.apply(r,n),len=Math.hypot(m[0],m[1],m[2])||1;
      out.push(w[0]+t[0],w[1]+t[1],w[2]+t[2],m[0]/len,m[1]/len,m[2]/len,uv?uv[0]:0,uv?uv[1]:0);
    }
    this.triangles++;
  }
  // Four corners in order around the edge, as two triangles.
  quad(mat,a,b,c,d,na,nb,nc,nd,ua,ub,uc,ud){
    nb=nb||na;nc=nc||na;nd=nd||na;
    this.tri(mat,a,b,c,na,nb,nc,ua,ub,uc);this.tri(mat,a,c,d,na,nc,nd,ua,uc,ud);
  }
  // Packs everything into the renderer's format.
  build(){
    let total=0;for(const b of this.buckets.values())total+=b.length;
    const data=new Float32Array(total),meshes=[];let at=0;
    for(const [key,b] of this.buckets){
      const [part,material]=key.split('|');
      data.set(b,at);meshes.push({part,material,offset:at*4,count:b.length/8});at+=b.length;
    }
    return {geometry:data,meta:{meshes,triangle_count:this.triangles,vertex_count:total/8}};
  }
}
