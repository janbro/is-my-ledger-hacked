'use strict';
/* Electronic parts for MeshKit, drawn on a circuit board face.
 * Every part stands on z = 0 (the board surface) and grows upward (+z).
 * To put parts on the other face, wrap them in k.place({at:[0,0,faceZ], rx:Math.PI}, ...)
 * (or ry:Math.PI). Sizes follow the standard packages (QFN, 0402, SOT-23, USB-C...). */
const PASSIVE_SIZES={'0201':[.6,.3,.26],'0402':[1,.5,.35],'0603':[1.6,.8,.45],'0805':[2,1.25,.55],'1206':[3.2,1.6,.6]};
Object.assign(MeshKit.prototype,{
  // QFN chip: black epoxy body. Small metal pads show at each edge, each with a shiny solder fillet.
  //  o.w, o.d body size. o.h height. o.pins pads per side. o.label uv box of the marking. o.rz turn.
  qfn(x,y,o={}){
    const w=o.w||5,d=o.d||w,h=o.h||.85,n=o.pins??8;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox('chip',[0,0,h/2+.02],[w,d,h],.07,1);
      for(let side=0;side<4;side++){
        const len=side%2?d:w,p=Math.min(.5,(len-.8)/Math.max(1,n));
        for(let i=0;i<n;i++){
          const u=(i-(n-1)/2)*p;
          // Sides in order: bottom, right, top, left. Local -y points out of the chip.
          const [px,py,rz]=[[u,-d/2,0],[w/2,u,Math.PI/2],[-u,d/2,Math.PI],[-w/2,-u,-Math.PI/2]][side];
          this.place({at:[px,py,0],rz},()=>{this.roundBox('nickel',[0,-.02,.1],[p*.5,.08,.18],0,0);this.roundBox('solder',[0,-.1,.04],[p*.56,.2,.08],.035,1);});
        }
      }
      if(o.label)this.label('chipLabel',o.lx||0,o.ly||0,h+.026,o.lw||w*.82,o.lh||d*.62,o.label,o.lrz||0);
      if(o.dot!==false)this.disc('chipDot',-w/2+Math.min(.7,w*.18),d/2-Math.min(.7,d*.18),h+.024,Math.min(.25,w*.07),12);
    });
  },
  // Resistor or capacitor: body plus two metal end caps sitting in solder. o.res makes a black resistor.
  passive(x,y,size='0402',o={}){
    const [L,W,H]=PASSIVE_SIZES[size],end=L*.2;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox(o.res?'chip':o.mat||'ceramic',[0,0,H/2+.01],[L-2*end+.02,W*.94,H*.94],Math.min(.04,H*.15),1);
      for(const s of [-1,1]){
        this.roundBox('nickel',[s*(L-end)/2,0,H/2+.01],[end,W,H],Math.min(.05,end*.35),1);
        this.roundBox('solder',[s*(L/2+.03),0,H*.16],[end*.8+.1,W*1.06,H*.32],0,0);
      }
    });
  },
  // SOT-23: small plastic package with 3 or 6 bent "gull-wing" legs.
  sot23(x,y,o={}){
    const pos=o.leads===6?[[-.95,-1],[0,-1],[.95,-1],[-.95,1],[0,1],[.95,1]]:o.leads===5?[[-.95,-1],[0,-1],[.95,-1],[-.95,1],[.95,1]]:[[-.95,-1],[.95,-1],[0,1]];
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox('chip',[0,0,.6],[2.9,1.6,.85],.09,1);
      for(const [lx,s] of pos){
        this.roundBox('nickel',[lx,s*.94,.45],[.38,.3,.12],0,0);
        this.roundBox('nickel',[lx,s*1.1,.25],[.38,.1,.4],0,0);
        this.roundBox('solder',[lx,s*1.27,.05],[.5,.42,.1],.04,1);
      }
      if(o.label)this.label('chipLabel',0,0,1.04,2.2,.9,o.label);
    });
  },
  // Quartz crystal: ceramic base with a metal lid.
  crystal(x,y,o={}){
    const w=o.w||2,d=o.d||1.2,h=o.h||.55;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox(o.base||'ivory',[0,0,h*.2],[w,d,h*.4],.04,1);
      this.roundBox(o.lid||'nickel',[0,0,h*.62],[w-.18,d-.18,h*.44],.07,2);
      for(const s of [-1,1])this.roundBox('solder',[s*(w/2+.02),0,.05],[.2,d*.8,.1],0,0);
    });
  },
  // Power inductor: black block with a printed value, soldered at two sides.
  inductor(x,y,o={}){
    const s=o.s||4,d=o.d||s,h=o.h||2;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox('chip',[0,0,h/2+.02],[s,d,h],.3,2);
      if(o.label)this.label('chipLabel',0,0,h+.03,s*.6,s*.32,o.label);
      for(const sx of [-1,1])this.roundBox('solder',[sx*(s/2+.04),0,.1],[.3,d*.6,.2],.07,1);
    });
  },
  // Tactile push switch: black base, steel cover with four soldered legs, round plunger on top.
  tactSwitch(x,y,o={}){
    const s=o.s||3.5;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox('chip',[0,0,.29],[s,s,.54],.1,1);
      this.roundBox('nickel',[0,0,.6],[s*.96,s*.96,.09],.04,1);
      for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){this.roundBox('nickel',[sx*(s/2+.1),sy*s*.32,.22],[.2,.5,.42],0,0);this.roundBox('solder',[sx*(s/2+.24),sy*s*.32,.06],[.38,.62,.12],.05,1);}
      this.cyl('ivory',[0,0,.64],s*.26,.45,20,{top:.07});
    });
  },
  // USB-C socket. The opening faces -x. o.mid = true: a "mid-mount" socket centred in a board cutout.
  usbC(x,y,o={}){
    const L=7.35,W=8.94,H=3.26,t=.22,zc=o.mid?0:H/2+.02;
    this.place({at:[x,y,zc],rz:o.rz||0},()=>{
      // The shell is a steel pill-shaped tube. It is built along +z, then turned to run along +x.
      this.place({ry:Math.PI/2},()=>{
        this.slab('nickel',Outline.stadium(H,W,8),[Outline.stadium(H-2*t,W-2*t,8)],0,L);
        this.slab('darkMetal',Outline.stadium(H-2*t,W-2*t,8),[],L-.35,L-.05);
        this.roundBox('chip',[0,0,L/2+.4],[.7,6.6,L-1.2],.1,1); // the tongue
        for(let i=0;i<12;i++)for(const s of [-1,1])this.roundBox('gold',[s*.36,(i-5.5)*.5,1.7],[.03,.24,2.4],0,0);
      });
      for(const [lx,sy] of [[1.4,-1],[5.6,-1],[1.4,1],[5.6,1]]){this.roundBox('nickel',[lx,sy*(W/2+.08),0],[.9,.16,H*.8],0,0);this.roundBox('solder',[lx,sy*(W/2+.28),-zc+.08],[1.2,.5,.16],.07,1);}
    });
  },
  // Board-to-board connector: black body with two rows of gold contacts and steel end clips.
  b2b(x,y,o={}){
    const n=o.pins||16,p=.4,len=n/2*p+1.3;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox('chip',[0,0,.42],[len,2.3,.8],.1,1);
      this.roundBox('darkMetal',[0,0,.8],[len-1.1,.9,.06],.02,1);
      for(let i=0;i<n/2;i++){const xx=(i-(n/2-1)/2)*p;for(const s of [-1,1]){this.roundBox('gold',[xx,s*.68,.82],[.17,.5,.04],0,0);this.roundBox('solder',[xx,s*1.28,.05],[.2,.36,.1],0,0);}}
      for(const s of [-1,1])this.roundBox('nickel',[s*(len/2+.08),0,.38],[.22,1.9,.74],.04,1);
    });
  },
  // Flat-cable (FPC) socket: long housing, a row of gold pins, a dark locking flap.
  zif(x,y,o={}){
    const n=o.pins||30,p=.5,len=n*p+1.4;
    this.place({at:[x,y,0],rz:o.rz||0},()=>{
      this.roundBox(o.housing||'ivory',[0,0,.45],[len,3,.86],.08,1);
      this.roundBox('chip',[0,-1.05,.95],[len-.3,1.2,.22],.06,1);
      for(let i=0;i<n;i++){const xx=(i-(n-1)/2)*p;this.roundBox('gold',[xx,.55,.9],[.2,1.3,.03],0,0);this.roundBox('solder',[xx,1.75,.05],[.22,.5,.1],0,0);}
      for(const s of [-1,1])this.roundBox('solder',[s*(len/2+.2),-.4,.07],[.4,1.1,.14],.05,1);
    });
  },
  // Tiny round antenna socket (U.FL / IPEX).
  ufl(x,y){this.roundBox('ivory',[x,y,.15],[2.6,2.6,.3],.05,1);this.cyl('gold',[x,y,.3],.95,.95,20);this.cyl('nickel',[x,y,.3],.45,1.0,12);},
  // Gold test pad, small via, and a plated screw hole (the hole itself must be cut in the board outline).
  testPoint(x,y,r=.5){this.cyl('gold',[x,y,0],r,.035,18);},
  via(x,y,r=.26){this.ring('gold',x,y,.012,r*.45,r,10);this.disc('chipDot',x,y,.011,r*.45,8);},
  // mat: ring finish. Gold by default. The Flex also has silver (nickel) rings.
  mountHole(x,y,r,ring,thick,mat='gold'){this.ring(mat,x,y,.016,r,ring,28);this.ring(mat,x,y,-thick-.016,r,ring,28,-1);this.tubeWall(mat,x,y,-thick,0,r,28);},
  pad(x,y,w,d,mat='gold',rz=0){this.place({at:[x,y,0],rz},()=>this.roundBox(mat,[0,0,.02],[w,d,.04],Math.min(.15,w*.2,d*.2),1));},
  // Copper traces under the solder mask: raised strips, slightly lighter than the board.
  trace(mat,pts,w=.16){this.strip(mat,pts,w,0,.018);},
  // Routes a trace from a to b the way board tools do: straight, then a 45 degree bend.
  route(mat,a,b,w=.16){
    const dx=b[0]-a[0],dy=b[1]-a[1],mid=Math.abs(dx)>Math.abs(dy)?[b[0]-Math.sign(dx)*Math.abs(dy),a[1]]:[a[0],b[1]-Math.sign(dy)*Math.abs(dx)];
    this.trace(mat,[a,mid,b],w);
  },
  // Printed paper sticker with a code on it.
  sticker(x,y,w,d,uv,rz=0){this.place({at:[x,y,0],rz},()=>{this.roundBox('paper',[0,0,.04],[w,d,.08],.02,1);this.label('labelInk',0,0,.085,w*.88,d*.88,uv);});},
  // Lithium polymer pouch cell: a soft pillow-shaped pack lying on z = 0.
  //  o.skin: 'foil' (bare silver) or 'pouchYellow' (wrapped in yellow tape). o.label: uv of the printed label.
  battery(w,d,h,o={}){
    this.roundBox(o.skin||'foil',[0,0,h/2],[w,d,h],h*.42,3);
    if(o.label)this.label('labelInk',0,0,h+.012,w*.82,d*.7,o.label,o.labelRz||0);
  },
  // Flat spiral coil printed on film (NFC or wireless-charging antenna). Turns go from radius r1 in to r0.
  coilRound(x,y,z,r0,r1,turns,mat='copper'){
    const pts=[],steps=turns*72;
    for(let i=0;i<=steps;i++){const t=i/steps,a=t*turns*2*Math.PI,r=r1-(r1-r0)*t;pts.push([x+r*Math.cos(a),y+r*Math.sin(a)]);}
    this.strip(mat,pts,(r1-r0)/turns*.6,z,.035);
  },
  // Rectangular spiral coil with rounded corners. Each lap is "pitch" smaller than the last.
  coilRect(x,y,z,w,h,turns,pitch,mat='copper',width=pitch*.55){
    const pts=[];
    for(let i=0;i<turns;i++){
      const A=Outline.rect(w-2*i*pitch,h-2*i*pitch,Math.max(.5,2.5-i*pitch*.6),4,x,y),B=Outline.rect(w-2*(i+1)*pitch,h-2*(i+1)*pitch,Math.max(.5,2.5-(i+1)*pitch*.6),4,x,y);
      // Blend from this lap to the next one along the way, so the laps join into one spiral.
      A.forEach((p,j)=>{const f=j/A.length;pts.push([p[0]+(B[j][0]-p[0])*f,p[1]+(B[j][1]-p[1])*f]);});
    }
    this.strip(mat,pts,width,z,.03);
  }
});
