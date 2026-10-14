'use strict';
/* The implants for "Show an implant" mode. Each one is rebuilt from real photos of implanted
 * Ledgers posted by Mark Karpelès (@MagicalTux) on X (the same photos as in the quiz):
 *  - Nano X: a flex board sprayed black, with a silver LTE modem can and a big chip whose
 *    markings were sanded off. It is soldered onto the test pads on the board's top face, under the screen.
 *  - Stax: a second black board stacked on the right half of the board's screen side, with a big
 *    chip and a silver modem can that sticks out past the edge. A black flex taps the battery socket.
 *    An antenna patch ("AC-A2014-STAX-V1.1") is stuck inside the back cover, with a thin black cable.
 *  - Flex: an antenna sheet ("AC-A2201-FLEX-欧亚版-V1.2") inside the back cover, with a thin black
 *    cable into the device. The photos do not show the radio module itself. We put it in the foam
 *    pad's space, next to where the cable goes in. That spot is a best guess.
 * Sizes were estimated from the photos (the Ledger parts next to them give the scale). Fits are approximate.
 * All sizes are millimetres. */

// ---------- Shared pieces ----------
// Atlas images used by the implants.
const ImplantArt={
  // Sanding scratches on a chip top: a faint dull haze, then many short light strokes going roughly one way.
  // Kept faint: in the photos the sanded top looks dull grey, not white.
  scratches(A,seed=5){
    const rnd=seededRandom(seed);
    return A.add(256,256,(c,w,h)=>{
      c.globalAlpha=.12;c.fillRect(0,0,w,h);
      for(let i=0;i<260;i++){
        const x=rnd()*w*1.2-w*.1,y=rnd()*h*1.2,len=20+rnd()*70;
        c.globalAlpha=.06+rnd()*.26;c.lineWidth=.6+rnd()*2.2;
        c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y-len*.45);c.stroke();
      }
    });
  },
  // The "CE" mark printed on modem cans: two open circles, the E has a middle bar.
  ce(A){
    return A.add(220,120,(c,w,h)=>{
      c.lineWidth=h*.1;const r=h*.36;
      for(const [x,bar] of [[h*.5,false],[h*1.3,true]]){c.beginPath();c.arc(x,h/2,r,Math.PI*.27,Math.PI*1.73);c.stroke();if(bar)c.fillRect(x-r*.95,h/2-h*.05,r*.85,h*.1);}
    });
  }
};

// A smooth path through the points (Catmull-Rom spline), n steps between two points.
// Cables drawn along it bend softly instead of kinking at every point.
function smoothPath(pts,n=6){
  const out=[];
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    for(let s=0;s<n;s++){
      const t=s/n,t2=t*t,t3=t2*t;
      out.push([0,1,2].map(j=>.5*(2*p1[j]+(p2[j]-p0[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*t3)));
    }
  }
  out.push(pts[pts.length-1]);return out;
}
// A thin black antenna cable (micro coax, about 0.8 mm thick).
function implantCable(k,pts,r=.4){k.tube('wireBlack',smoothPath(pts),r,10);}
// The metal can over a radio module, standing on a board face (z = 0), with solder along its edges.
function modemCan(k,x,y,w,d,h){
  k.roundBox('aluSilver',[x,y,h/2+.05],[w,d,h],.14,2);
  for(const s of [-1,1]){k.roundBox('solder',[x,y+s*(d/2+.04),.04],[w*.9,.16,.08],.03,1);k.roundBox('solder',[x+s*(w/2+.04),y,.04],[.16,d*.9,.08],.03,1);}
}
// The plug at the end of an antenna cable, pressed onto a round antenna socket (k.ufl).
function cablePlug(k,x,y,z){k.cyl('nickel',[x,y,z],1.05,.45,20,{top:.12});}

// ---------- Nano X: the black-painted LTE flex under the screen ----------
// Built on the board's TOP face (z = 0 is the board surface). Same x, y as device-nano-x.js:
// USB-C at -x, the screen's board-to-board connector at x = 17.2, y = 0.8.
// Photo (HUMY0AJbkAAtabm, 9 Oct 2026): from the screen-connector end, a frame with a window,
// small parts, a paint-covered chip, the silver can, then the big sanded chip near the USB end.
function buildNanoXImplant(k,A){
  const PI=Math.PI,T={scratch:ImplantArt.scratches(A,7),ce:ImplantArt.ce(A),code:A.matrix(61,{n:18,px:180})};
  const Z=.07,TOP=Z+.12; // the flex rides on its solder joints, 0.07 mm above the board. It is 0.12 mm thick.
  // Outline, counter-clockwise: the main body, then the narrower frame round the screen connector.
  const outline=[[-23.8,-6.8],[12.2,-6.8],[12.2,-5.4],[21.1,-5.4],[21.1,5.4],[12.2,5.4],[12.2,6.7],[-23.8,6.7]];
  // The window leaves room for the screen's connector, so the screen still plugs in.
  k.slab('coatBlack',outline,[Outline.rect(4.2,6.6,.4,2,17.2,.8)],Z,TOP);
  // Solder joints: it is soldered onto the board's gold test pads, through holes in the flex.
  for(const [x,y] of [[-21.57,5.81],[-18.01,-5.94],[-13.94,-5.68],[-13.94,.13],[9.89,.78],[11.19,3.75],[14.29,-3.1]])k.cyl('solder',[x,y,0],.38,TOP+.14,12,{top:.16});
  k.place({at:[0,0,TOP]},()=>{
    // The silver modem can (an LTE radio). It has a CE mark and a 2D code printed on it.
    modemCan(k,-5.6,.6,13.4,10.6,1.05);
    k.label('etch',-2,-2.6,1.106,3,1.64,T.ce);k.label('etch',-9.6,2.9,1.106,3,3,T.code);
    // The big chip near the USB end. Its markings were sanded off, so nobody can read what it is.
    k.qfn(-19.3,0,{w:7.6,d:7.2,pins:10,label:T.scratch,lw:7.2,lh:6.8});
    // A small chip under a thick blob of black paint.
    k.roundBox('coatBlack',[6.6,2.6,.36],[5.2,5.2,.66],.32,2);
    // Small parts: two SOT-23s and passives, painted over but still showing their metal ends.
    k.sot23(9.8,-3.8,{leads:6});k.sot23(5.2,-4.6,{leads:5});
    for(const [x,y,s,rz] of [[2.6,-5.6,'0402',0],[3.6,-1.4,'0603',0],[11.2,-1,'0402',PI/2],[8.4,-1,'0402',0],[2.4,-3.2,'0402',PI/2],[11.4,-5.9,'0402',0],
      [-13.9,2.6,'0402',PI/2],[-13.9,4.8,'0402',PI/2],[-16.5,5.6,'0603',0],[-22.4,-5.4,'0402',0],[-16,-5.4,'0402',0],[1.8,5.6,'0402',0],
      [13.6,-4.4,'0402',0],[20.3,-4,'0402',PI/2],[20.3,3.8,'0402',PI/2],[13.6,4.6,'0603',0]])k.passive(x,y,s,{rz});
  });
  // A paint-covered tail runs off the edge and wraps round to the battery pad underneath (power).
  // The board's bottom face is 0.8 mm below its top face. The pad is at x -20.7, y -4.5.
  k.ribbon('coatBlack',smoothPath([[-20.7,-6.3,TOP-.06],[-20.7,-7.4,TOP-.08],[-20.7,-7.95,-.3],[-20.7,-7.6,-.82],[-20.7,-6.2,-.9],[-20.7,-4.6,-.9]],5),1.8,.1,[1,0,0]);
  k.roundBox('solder',[-20.7,-4.6,-.98],[1.5,1.3,.1],.05,1);
}

// ---------- Stax: the stacked board on the screen side ----------
// Built on the board's SCREEN side (+Z, z = 0 is the board surface). Same x, y as stax-board.js.
// Photos (HUXhOdPaEAAu7N1, HUXhOdYbwAAXSAB): the second board covers the right half, right of the
// "Display" socket. A big chip at the top, a large silver can below it (it sticks out past the edge),
// and a round antenna socket at the can's bottom-left corner.
function buildStaxImplant(k){
  const PI=Math.PI,Z=.62,TOP=Z+.42; // it stands on solder posts above the Ledger board's small parts
  k.slab('boardBlack',Outline.rect(15.9,28.6,.4,2,13.35,-9.9),[],Z,TOP); // x 5.4 to 21.3, y -24.2 to 4.4
  for(const [x,y] of [[6,3.8],[20.1,3.8],[6,-23.6],[20.1,-23.6],[6,-10]])k.cyl('solder',[x,y,0],.35,Z,10);
  k.place({at:[0,0,TOP]},()=>{
    k.qfn(11.6,-4.9,{w:6.6,d:6.6,pins:12});
    modemCan(k,15,-17.6,13.2,12.6,1.15);
    k.ufl(6.9,-22.4);cablePlug(k,6.9,-22.4,1.0);
    k.crystal(17.4,-1.4,{w:2,d:1.6});k.qfn(17.6,-6.6,{w:2,d:2,pins:3});
    for(let i=0;i<9;i++)k.passive(6.3,3.4-i*1.5,i%3?'0402':'0201');                    // a column along the left edge
    for(let i=0;i<8;i++)k.passive(8.6+i*1.5,3.4,i%2?'0402':'0603',{rz:PI/2});           // a row along the top edge
    for(let i=0;i<7;i++)k.passive(9.4+i*1.6,-9.6,'0402');                                // between the chip and the can
    for(let i=0;i<5;i++)k.testPoint(20.5,-.5-i*1.7,.42);                                  // gold pads on the right edge
  });
  // The thin black antenna cable: from the socket, below the can, round the board's right edge,
  // then down the gap next to the frame to the back cover. Its end meets the cable taped to the cover.
  implantCable(k,[[6.9,-22.4,2.3],[6.9,-24.6,1.9],[10,-25.2,1.5],[20,-25.1,1.3],[22.4,-24.4,.4],[22.9,-22,-1.2],[23.2,-12,-1.9],[23.4,-4,-2.05]]);
  k.place({at:[23.4,-4,-2.05],rx:-PI/2},()=>k.cyl('nickel',[0,0,0],.55,1.4,12));
  // A black flex taps the battery: a plug on the board's "Battery" socket, a tail up past the top edge
  // (the battery plugs in there instead), and a strip along the top edge to the second board.
  k.roundBox('nickel',[-13.04,6.2,1],[3.6,2.6,.14],.05,1);
  k.strip('flexBlack',[[-13.3,6.6],[-13.3,13.2]],2.2,1.07,.07,{bottom:true});k.place({at:[-13.3,12.3,1.14]},()=>k.b2b(0,0,{pins:6}));
  k.strip('flexBlack',[[-11.4,7.4],[9.6,7.4]],2,1.1,.07,{bottom:true});
  k.ribbon('flexBlack',[[9,7.6,1.13],[9,5.4,1.14],[9,4.6,1.2],[9,3.6,1.2]],2,.07,[1,0,0]);
  k.roundBox('flexBlack',[.4,6.6,1.18],[2.8,5,.1],.3,1); // black tape over the strip
}
// The antenna patch inside the Stax back cover. Device coordinates: the cover's inside face is z = -2.4.
// Photo HUXhOdYbwAAXSAB: a black patch at the bottom (USB) end, between the two magnets, with its part
// number printed on it. The cable is soldered to its top-right corner and runs to the side button edge.
function buildStaxImplantCover(k,A){
  const label=A.text('AC-A2014-STAX-V1.1',{w:1000,h:110,weight:600});
  k.slab('flexBlack',Outline.rect(17,12.5,.6,3,9.5,-33),[],-2.399,-2.33);
  k.slab('flexTrace',Outline.rect(14,9,.4,2,9.5,-33.4),[],-2.33,-2.325);
  k.label('silkLabel',10.6,-37.6,-2.322,10.9,1.2,label);
  k.roundBox('gold',[14.5,-26.4,-2.31],[1.4,1.6,.05],.05,1);k.cyl('solder',[14.5,-26.3,-2.33],.45,.32,12,{top:.18});
  // It goes round the bracket's screw ring (x 17, y -25.6), then up to where it meets the board's cable.
  implantCable(k,[[14.5,-26.3,-2.05],[15.6,-28.3,-2.05],[19.6,-28,-2.05],[22.2,-21,-2.05],[23.1,-11,-2.05],[23.4,-4,-2.05]]);
}

// ---------- Flex: the antenna in the back cover and its hidden module ----------
// The module, in device coordinates (part "implantFrame", it stays in the frame).
// It sits in the foam pad's space, right of the battery (x 15.75 to 26.25, y -18 to -7), parts facing the back cover.
function buildFlexImplantModule(k){
  const PI=Math.PI;
  k.slab('boardBlack',Outline.rect(10.5,11,.5,2,21,-12.5),[],-.2,.22);
  // rx = 180 degrees: the parts face the back cover (-z). Local y = -device y.
  k.place({at:[0,0,-.2],rx:PI},()=>{
    modemCan(k,22.2,10.8,7.6,6.4,.95);
    k.ufl(18.3,16.3);cablePlug(k,18.3,16.3,1.0);
    k.qfn(23.6,16.1,{w:3,d:3,pins:5});
    for(const [x,y,rz] of [[17.4,8.6,0],[17.4,10.4,0],[17.4,12.2,0],[21,14.6,PI/2],[25.6,13.6,PI/2],[20.6,17.2,0]])k.passive(x,y,'0402',{rz});
  });
  // Its cable goes to the right-hand edge, near the chin. There it meets the cable from the back cover.
  implantCable(k,[[18.3,-16.3,-1.9],[19.6,-18.4,-2.4],[23,-20.2,-2.9],[26.4,-20,-3.05]],.35);
}
// The antenna sheet inside the Flex back cover. Device coordinates: the cover's inside face is z = -3.3.
// Photo HUfsevTaMAAEd1l: a black sheet over the chin end of the cover, with its part number printed
// in white. A small silver tab is the feed point, where the cable is soldered on.
function buildFlexImplantCover(k,A){
  const label=A.text('AC-A2201-FLEX-欧亚版-V1.2',{w:1300,h:96,weight:600});
  k.slab('flexBlack',Outline.rect(53,25.5,[0,0,1,1],3,0,-13.6),[],-3.299,-3.25);
  // The text reads from the chin end, so it is turned 180 degrees.
  k.label('silkLabel',1.7,-19.7,-3.248,20.3,1.5,label,Math.PI);
  k.roundBox('nickel',[15.3,-4.6,-3.22],[1.2,2.2,.06],.05,1);k.cyl('solder',[15.3,-4.2,-3.25],.42,.3,12,{top:.16});
  implantCable(k,[[15.3,-4.2,-3.0],[18,-6.5,-3.0],[22,-12,-3.0],[25.5,-18,-3.02],[26.4,-20,-3.05]],.35);
}
