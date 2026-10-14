'use strict';
/* Ledger Stax circuit board (part "pcb", Rev 4.1), rebuilt from Ledger's two board photos:
 *   ledger-genuine/stax/pcb-front.jpg = the side that faces the screen (+Z). Connectors, buzzer, USB-C.
 *   ledger-genuine/stax/pcb-back.jpg  = the side that faces the back cover (-Z). Gold shield frame, processor.
 * The outline was traced from the photo pixels. Scale: 0.0392 mm per pixel on the full 1202 x 1600 photo,
 * checked against the 8.94 mm wide USB-C socket.
 * Positions below are written as PHOTO PIXELS (on the photo shown at 769 x 1024), converted by P() and Q().
 * So any part can be checked against Ledger's photo directly. */
const STAX_BOARD={
  TOP:0,BOT:-.7,
  // Screen-side photo pixel -> device mm. (The board's top-left corner is at x -17.5, y 9.26.)
  P:(px,py)=>[px*.0613-23.77,16.32-py*.0613],
  // Back-side photo pixel -> local mm on the back face (x is mirrored, as seen from the back).
  Q:(px,py)=>[-26.59+.0635*px,10.8-.0635*py],
  // Outline, counter-clockwise. A slot at the bottom lets the mid-mount USB-C pass through.
  outline:[[-17.15,-41.23],[.4,-41.23],[.4,-34.7],[9.6,-34.7],[9.6,-41.23],[12.45,-41.23],[12.45,-38.17],[20.7,-38.05],[20.7,8.86],[20.3,9.26],[-17.5,9.26],
    [-17.5,4.95],[-16.64,4.63],[-16.64,-.07],[-17.15,-.38]],
  // Round screw holes [x, y, radius]. Hole C (the middle one) is a "dog bone": a big hole with two small ones.
  holes:[[-6.6,6.85,1.25],[18.2,6.32,.6],[4.45,-15.97,1.35],[1.98,-15.97,.5],[6.92,-15.97,.5],[17,-25.6,.6],[-14.75,-27.6,1.3]]
};

function buildStaxBoard(k,T){
  const B=STAX_BOARD,PI=Math.PI,{P,Q}=B;
  k.slab('boardBlack',B.outline,B.holes.map(([x,y,r])=>Outline.circle(r,28,x,y)),B.BOT,B.TOP);
  for(const [x,y,r] of B.holes)k.tubeWall('nickel',x,y,B.BOT,B.TOP,r,28);
  k.place({at:[0,0,(B.TOP+B.BOT)/2]},()=>k.usbC(4.96,-42.45,{mid:true,rz:PI/2}));
  // Gold screw rings and the dog-bone pad. side = 1 (screen side) or -1 (back side, mirrored x).
  const rings=side=>{
    for(const [x,y,r,ring] of [[-6.6,6.85,1.25,1.85],[18.2,6.32,.6,1.3],[17,-25.6,.6,1.35],[-14.75,-27.6,1.3,1.85]])k.ring('gold',side*x,y,.016,r,ring,28);
    k.slab('gold',Outline.stadium(7.6,3,8,side*4.45,-15.97),[0,1,-1].map(i=>Outline.circle(i?.5:1.35,20,side*(4.45+i*2.47),-15.97)),0,.045);
  };

  // ---------- Screen side (+Z): display socket, connectors, buzzer, test points ----------
  k.place({at:[0,0,B.TOP]},()=>{
    const fill=new BoardFill(B.outline,7),at=(px,py,fn)=>{const [x,y]=P(px,py);fn(x,y);};
    rings(1);
    at(422,342,(x,y)=>k.zif(x,y,{pins:34,rz:PI/2,housing:'chip'}));                     // "Display" socket
    for(const [px,py] of [[175,165],[155,230],[182,320]])at(px,py,(x,y)=>k.b2b(x,y,{pins:10})); // Battery, BT, ON/OFF
    at(175,437,(x,y)=>k.b2b(x,y,{pins:8,rz:PI/2}));at(205,635,(x,y)=>k.zif(x,y,{pins:8,rz:PI/2,housing:'chip'})); // NFC, TOUCH
    // The buzzer: a grey metal can, bottom left, with a "+" next to it.
    at(260,857,(x,y)=>{k.roundBox('zinc',[x,y,.52],[9.2,8.9,1],.3,2);k.disc('chip',x-3.4,y-3,1.03,.35,12);});
    at(400,707,(x,y)=>k.sticker(x,y,5.5,5.2,T.qrBoard));
    at(397,632,(x,y)=>k.label('silkLabel',x,y,.012,10.7,3.4,T.ledgerWord));at(547,632,(x,y)=>k.label('silkLabel',x,y,.012,5.2,1.3,T.rev));
    at(527,430,(x,y)=>k.label('silkLabel',x,y,.012,8.9,7.4,T.ul));
    for(const [px,py,uv,w,rz] of [[375,262,T.sDisplay,4,PI/2],[222,160,T.sBattery,3.4,-PI/2],[135,197,T.sBt,1.2,0],[140,322,T.sOnOff,3.6,PI/2],[183,486,T.sNfc,2,0],[205,684,T.sTouch,3,0],[162,855,T.sPlus,.9,0],
      [590,142,T.tp300,2.6,0],[705,268,T.tp409,2.6,0],[635,642,T.tp101,2.6,0],[145,645,T.tp702,2.6,0],[130,383,T.tp601,2.6,0],[228,395,T.tp700,2.6,0]])at(px,py,(x,y)=>k.label('silkLabel',x,y,.012,w,w*(uv===T.sBt||uv===T.sPlus?.66:.27),uv,rz));
    // Chips and big parts.
    for(const [px,py,o] of [[330,322,{w:2,d:1.6,pins:3}],[240,210,{w:2.2,d:2.2,pins:4}],[265,555,{w:2.4,d:2.4,pins:4}],[195,545,{w:2,d:2,pins:3}],[300,705,{w:1.6,d:1.6,pins:3}],[290,740,{w:1.6,d:1.6,pins:3}],[600,770,{w:1.6,d:1.6,pins:3}],[600,835,{w:1.6,d:1.6,pins:3}]])at(px,py,(x,y)=>k.qfn(x,y,o));
    at(265,340,(x,y)=>k.sot23(x,y,{leads:6}));at(510,180,(x,y)=>k.sot23(x,y,{leads:3}));at(242,507,(x,y)=>k.crystal(x,y,{w:2,d:1.6}));
    at(527,742,(x,y)=>k.passive(x,y,'1206',{rz:PI/2}));at(332,378,(x,y)=>k.passive(x,y,'0805',{mat:'ivory'}));
    for(const [px,py] of [[292,402],[318,402],[340,430],[362,430],[340,455],[362,455],[292,462],[318,520],[340,520]])at(px,py,(x,y)=>k.passive(x,y,'0805'));
    for(const [px,py] of [[240,440],[255,440],[270,470],[250,470],[215,455],[205,230]])at(px,py,(x,y)=>k.passive(x,y,'0603',{rz:PI/2}));
    // The radio corner: a silkscreen box round the bottom-right parts.
    k.trace('traceBlack',[P(455,738),P(712,738),P(712,890),P(455,890),P(455,738)],.13);
    // Gold test points, each with a short trace to the nearest part.
    const tps=[[345,165],[370,180],[332,214],[355,265],[430,143],[497,163],[555,142],[475,208],[527,256],[570,243],[510,312],[597,205],[640,192],[635,240],[637,285],[700,287],[630,360],[700,330],[700,375],[700,418],[700,462],
      [568,522],[545,557],[495,562],[435,595],[380,540],[380,565],[380,590],[233,415],[210,357],[180,393],[140,405],[237,575],[145,532],[145,575],[145,600],[145,625],[632,625],[688,768],[665,862],[250,210],[335,705]].map(p=>P(...p));
    const anchors=[P(422,200),P(422,490),P(330,322),P(527,430),P(600,770),P(265,555),P(175,437),P(182,320)];
    for(const t of tps){k.testPoint(t[0],t[1],.5);const a=anchors.reduce((b,c)=>Math.hypot(c[0]-t[0],c[1]-t[1])<Math.hypot(b[0]-t[0],b[1]-t[1])?c:b);k.route('traceBlack',t,a,.14);fill.block(t[0],t[1],1.3,1.3);}
    fill.blockAll([[...P(422,342),4,19.4],[...P(175,165),4.4,3],[...P(155,230),4.4,3],[...P(182,320),4.4,3],[...P(175,437),3,4],[...P(205,635),3.4,6],[...P(260,857),10,9.6],[...P(400,707),6,5.8],
      [...P(397,632),11,3.8],[...P(547,632),5.6,1.8],[...P(527,430),9.4,8],[...P(330,420),6,8],[...P(255,455),4,3],[4.96,-38.5,10.2,8.4],[4.45,-15.97,8.4,3.6]]);
    for(const [x,y,r] of B.holes)fill.block(x,y,r*2+1.4,r*2+1.4);
    fill.passives(k,30);fill.vias(k,220,null,.15);
  });

  // ---------- Back side (-Z), seen from the back. ry = 180 degrees: x is mirrored ----------
  k.place({at:[0,0,B.BOT],ry:PI},()=>{
    const local=B.outline.map(([x,y])=>[-x,y]).reverse(),fill=new BoardFill(local,19),at=(px,py,fn)=>{const [x,y]=Q(px,py);fn(x,y);};
    rings(-1);
    // The gold frame that the steel shield can is soldered to. Its window shows the processor area.
    const arc=(cx,cy,r,a0,a1,n=10)=>Array.from({length:n+1},(_,i)=>{const a=(a0+(a1-a0)*i/n)*PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];});
    const outer=[[105,30],[688,30],[688,555],[228,555],[228,600],[105,600]].map(p=>Q(...p));
    const win=[[145,505],[640,505],[640,95],[600,95],...arc(527,62,72,20,160),[440,80],[205,80],...arc(143,82,62,0,90)].map(p=>Q(...p));
    k.slab('goldHatch',outer,[win],0,.05);
    // Rows of tiny "stitching" vias along the gold frame.
    for(let t=0;t<=1;t+=1/42){for(const [a,b] of [[[115,40],[678,40]],[[678,40],[678,545]],[[240,545],[678,545]]]){const p=Q(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);k.via(p[0],p[1],.12);}}
    for(let t=0;t<=1;t+=1/38){const p=Q(115,40+550*t);k.via(p[0],p[1],.12);}
    // Inside the window: the processor and the radio parts.
    at(310,270,(x,y)=>k.qfn(x,y,{w:7.4,d:7.4,pins:14,label:T.mcu}));
    at(440,218,(x,y)=>k.pad(x,y,5.1,2.9));
    for(const [px,py,o] of [[535,255,{w:3.2,d:3.2,pins:6}],[300,120,{w:2.5,d:2,pins:4}],[590,145,{w:2.2,d:1.8,pins:3}],[440,385,{w:2,d:2,pins:4}],[545,470,{w:3,d:2.4,pins:5}],[210,480,{w:2,d:2,pins:2}]])at(px,py,(x,y)=>k.qfn(x,y,o));
    at(602,258,(x,y)=>k.roundBox('ivory',[x,y,.3],[1.6,1.4,.6],.1,2));at(420,140,(x,y)=>k.passive(x,y,'0603',{mat:'ivory'}));
    at(345,113,(x,y)=>k.roundBox('darkMetal',[x,y,.3],[2.2,1.4,.6],.1,1));at(340,175,(x,y)=>k.crystal(x,y,{w:1.6,d:1.2}));
    at(255,365,(x,y)=>{k.crystal(x,y,{w:2.2,d:1.6});k.label('chipLabel',x,y,.6,1.6,.6,T.xtal);});
    at(180,330,(x,y)=>{k.roundBox('ivory',[x,y,.3],[1.6,1.2,.6],.1,1);k.disc('wireRed',x,y,.61,.3,12);});
    at(550,185,(x,y)=>k.ufl(x,y));at(183,410,(x,y)=>k.ufl(x,y));
    for(const [px,uv] of [[325,T.tp100],[368,T.tp105]])at(px,355,(x,y)=>{k.testPoint(x,y,.45);k.label('silkLabel',x,y-1.2,.012,2.6,.7,uv);});
    at(165,255,(x,y)=>k.label('silkLabel',x,y,.012,2.4,1.6,T.r416));
    // Below the frame: the [L] logo, a gold dot, traces down to the USB socket.
    at(178,680,(x,y)=>k.label('silkLabel',x,y,.012,4.4,4.4,T.lLogo));at(170,745,(x,y)=>k.testPoint(x,y,.42));
    for(let i=0;i<5;i++)k.route('traceBlack',Q(232+i*9,640),Q(330+i*9,722),.13);
    for(let i=0;i<4;i++)k.route('traceBlack',Q(380+i*10,600),Q(452+i*10,690),.13);
    fill.blockAll([[...Q(310,270),8.4,8.4],[...Q(440,218),5.6,3.4],[...Q(535,255),4,4],[...Q(300,120),3,2.6],[...Q(590,145),2.8,2.4],[...Q(440,385),2.6,2.6],[...Q(545,470),3.6,3],[...Q(210,480),2.6,2.6],
      [...Q(602,258),2.2,2],[...Q(420,140),2.2,1.4],[...Q(345,113),2.8,2],[...Q(340,175),2.2,1.8],[...Q(255,365),2.8,2.2],[...Q(180,330),2.2,1.8],[...Q(550,185),3,3],[...Q(183,410),3,3],[...Q(346,355),4.4,2.6],
      [...Q(165,255),2.8,2],[...Q(178,680),5,5],[-4.96,-38.5,10.2,8.4],[-4.45,-15.97,8.4,3.6],[5,-30.5,9.5,7.5]]);
    for(const [x,y,r] of B.holes)fill.block(-x,y,r*2+1.4,r*2+1.4);
    // Gold areas are blocked too, so the scattered parts land inside the window or below the frame.
    fill.block(...Q(396,55),37,3.2).block(...Q(125,315),2.5,37).block(...Q(664,300),2.5,33).block(...Q(458,530),29,3.4).block(...Q(166,578),8,3.4);
    fill.passives(k,60,[...Q(150,500),...Q(635,90)]); // the window: [x0,y0,x1,y1]
    fill.passives(k,12);fill.vias(k,160,null,.15);
  });
}
