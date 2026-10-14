'use strict';
/* Ledger Flex circuit board (part "pcb"), rebuilt from Ledger's two board photos:
 *   ledger-genuine/flex/pcb-back.jpg  = the side that faces the screen (+Z). Processor and antennas.
 *   ledger-genuine/flex/pcb-front.jpg = the side that faces the back cover (-Z). Connectors, USB-C, [LEDGER] logo.
 * The outline was traced from the photo pixels. Scale: 0.051 mm per pixel (screen side photo),
 * checked against the 7 x 7 mm STM32WB35 chip.
 * The numbers below are "board coordinates": the board upright, as in the photos, USB-C at the bottom.
 * In the device the board lies sideways at the top (see FLEX_BOARD.at), and the USB-C port faces
 * the left side. Ledger's newer photos (disassembled-2.jpg) and MagicalTux's teardown show it there.
 * Board faces: z = -1.25 (back side) and z = -0.45 (screen side). */
const FLEX_BOARD={
  TOP:-.45,BOT:-1.25,
  // Where the board sits in the device: turned 90 degrees clockwise (seen from the front), moved up.
  // The four holes then land on the four screw posts of the mid-frame (frame-removed-back.jpg),
  // and the USB-C opening ends just inside the left wall of the frame (x = -26.5).
  at:{at:[12.5,20.5,0],rz:-Math.PI/2},
  // Turns a board point [x, y] into device millimetres (same move as "at").
  toDevice:([x,y])=>[y+12.5,20.5-x],
  // Outline, counter-clockwise, in device millimetres. It has notches on both long sides
  // and a slot at the bottom where the "mid-mount" USB-C socket passes through the board.
  outline:[[-6.94,-37.7],[-4.6,-37.7],[-4.6,-31.2],[4.6,-31.2],[4.6,-37.7],[17.7,-37.7],[18.1,-37.3],[18.1,-24.1],[15.25,-24.1],[15.25,-20],[17.9,-20],[17.9,-10.6],[15.66,-10.6],
    [15.66,-4.1],[17.49,-4.1],[17.49,6.1],[17.08,6.52],[4.74,6.52],[4.74,6.02],[1.99,6.02],[1.99,6.52],[-9.85,6.52],[-10.25,6.12],[-10.25,-3.7],[-1.99,-3.7],[-1.99,-9.45],
    [-10.15,-9.45],[-10.15,-23.98],[-12.19,-24.2],[-12.19,-31.4],[-11.8,-31.8],[-6.94,-31.8]],
  // Screw holes: [x, y, radius]. Measured on the screen-side photo.
  holes:[[-2.75,4.22,1.38],[-10.05,-27.04,1.63],[13.26,-27.65,1.4],[8.26,-13.58,.55]]
};

// Builds the board into the current part. T holds the atlas boxes made in device-flex.js.
function buildFlexBoard(k,T){
  const B=FLEX_BOARD,PI=Math.PI;
  k.slab('boardBlack',B.outline,B.holes.map(([x,y,r])=>Outline.circle(r,28,x,y)),B.BOT,B.TOP);
  for(const [x,y,r] of B.holes)k.tubeWall('nickel',x,y,B.BOT,B.TOP,r,28);
  // The USB-C socket goes through the slot. Its middle is the board's middle (z = -0.85).
  k.place({at:[0,0,(B.TOP+B.BOT)/2]},()=>k.usbC(0,-39,{mid:true,rz:PI/2}));
  k.place({at:[0,-35.3,-2.495],ry:PI},()=>k.label('etch',0,0,0,3.2,1.1,T.usbMark)); // "21261" stamped on the shell
  // Gold pads and rings, with a hole in the middle, lying on a board face.
  const padHole=(mat,x,y,w,d,hole)=>k.slab(mat,Outline.rect(w,d,.3,2,x,y),[Outline.circle(hole[2],28,hole[0],hole[1])],0,.04);

  // ---------- Screen side (+Z), seen from the front: processor, antennas, radio parts ----------
  k.place({at:[0,0,B.TOP]},()=>{
    const fill=new BoardFill(B.outline,11);
    // Two L-shaped Bluetooth / NFC antenna areas: rough gold plating on the left edge.
    const ant=[[-8.95,1.85,2.2,6.38],[-4.77,-2.34,10.56,1.99],[-9.08,-17.79,1.95,12.18],[-5.89,-10.8,8.32,2.2]];
    for(const [x,y,w,d] of ant)k.roundBox('goldHatch',[x,y,.03],[w,d,.06],.1,1);
    k.label('silkLabel',-6.04,.86,.012,3.6,3.6,T.lLogo);
    // Gold contact strips on the right edge (they touch the frame).
    k.roundBox('gold',[16.15,-15.15,.025],[1.7,8.9,.05],.15,1);k.roundBox('gold',[16.15,-26.85,.025],[1.7,4.9,.05],.15,1);
    // Screw rings: silver at the two left holes, gold on the right.
    k.ring('nickel',-2.75,4.22,.016,1.38,1.84,28);k.ring('nickel',-10.05,-27.04,.016,1.63,2.05,28);
    k.ring('gold',13.26,-27.65,.016,1.4,1.95,28);k.ring('gold',8.26,-13.58,.016,.55,1.2,20);
    // The processor: ST STM32WB35, 7 x 7 mm, 48 pins.
    k.qfn(.25,-19,{w:7,d:7,pins:12,label:T.mcu,lw:5.4,lh:4.6});
    k.roundBox('ivory',[-5.2,-15.8,.32],[1.9,1.9,.6],.12,2); // small white sensor
    k.qfn(6.05,-.5,{w:3.3,d:3.4,pins:5});k.crystal(3.65,3.2,{w:2,d:1.6});k.qfn(10.6,4.6,{w:2.4,d:2,pins:3});
    k.qfn(5.9,-7.3,{w:2,d:2.5,pins:3});k.qfn(12.85,-33.8,{w:2,d:2,pins:3});
    k.roundBox('darkMetal',[8.4,-30.6,.45],[1.4,1.9,.9],.12,2);
    for(const x of [-2.4,.2,2.4])k.qfn(x,-27.8,{w:1.4,d:1.8,pins:3});
    k.passive(-.2,-9.3,'0805',{mat:'ivory',rz:PI/2});k.crystal(5.8,-21,{w:1.6,d:1.2,rz:PI/2});
    k.testPoint(10.66,-25.9,.45);k.testPoint(.1,4.07,.4);
    // Traces fanning out from the processor.
    for(let i=0;i<5;i++){k.route('traceBlack',[-3.6,-17.4+i*.7],[-7.8,-13.2+i*.9],.13);k.route('traceBlack',[4.1,-16.6-i*.7],[9.4,-22.4-i*.8],.13);k.route('traceBlack',[-1.6+i*.7,-15.1],[2.6+i*.9,-8.7],.13);}
    for(let i=0;i<4;i++)k.route('traceBlack',[-1.2+i*.8,-22.9],[-2.4+i*1.6,-26.6],.13);
    // Keep the scattered parts off the big parts, the antennas, the holes and the USB slot.
    fill.blockAll([...ant,[.25,-19,8,8],[-5.2,-15.8,2.6,2.6],[6.05,-.5,4.2,4.2],[3.65,3.2,2.8,2.4],[10.6,4.6,3.2,2.8],[5.9,-7.3,2.8,3.3],[12.85,-33.8,2.8,2.8],
      [8.4,-30.6,2,2.5],[0,-27.8,7,2.6],[-.2,-9.3,1.8,2.6],[5.8,-21,1.8,2.2],[16.15,-15.15,2.4,9.6],[16.15,-26.85,2.4,5.6],[0,-34.5,10.4,7.6],[-6.04,.86,4,4]]);
    for(const [x,y,r] of B.holes)fill.block(x,y,r*2+1.4,r*2+1.4);
    fill.passives(k,26,[2,-6,17,6]);fill.passives(k,22,[-5,-26,14,-8]);fill.passives(k,14,[5,-37,17,-26]);fill.passives(k,10);
    fill.vias(k,260,null,.15);
  });

  // ---------- Back side (-Z), seen from the back. ry = 180 degrees: x is mirrored ----------
  // Local x = -device x, so these numbers match the back-side photo directly.
  k.place({at:[0,0,B.BOT],ry:PI},()=>{
    const local=B.outline.map(([x,y])=>[-x,y]).reverse(),fill=new BoardFill(local,23);
    k.sticker(7.65,3.2,4.3,5.2,T.qr1,PI/2);
    k.label('silkLabel',1.2,-18.5,.012,10.1,3.55,T.ledgerWord,-PI/2);
    k.label('silkLabel',8.75,-12.7,.012,4.4,1.5,T.rev,-PI/2);
    k.label('silkLabel',-4.15,1.65,.012,8.3,5.3,T.rohs,-PI/2);
    // Debug test points (CLK, IO, RST, 3V0) and two more gold dots.
    const tps=[[4.86,-21.47,T.tpClk],[6.82,-20.7,T.tp3v],[5.16,-22.5,T.tpIo],[6.82,-21.86,T.tpRst],[.59,-24.75],[3.14,-24.87]];
    tps.forEach(([x,y,uv],i)=>{k.testPoint(x,y,.42);if(uv)k.label('silkLabel',x+(i%2?1.2:-1.15),y,.012,1.6,.8,uv,-PI/2);});
    // Connectors: board-to-board (display), flat cable sockets (battery, button, NFC).
    k.b2b(-13.6,-7.25,{pins:20,rz:PI/2});k.zif(-12.6,-22.2,{pins:6,rz:PI/2});
    k.zif(-14.8,4.2,{pins:4,housing:'chip'});k.zif(-14.4,-.7,{pins:4,rz:PI/2,housing:'chip'});
    for(const x of [-15,-13.2,-11.4])for(const y of [-12.6,-14.6])k.passive(x,y,'0805');
    k.inductor(-13.05,-18.5,{s:1.8,h:.9});k.qfn(3.25,-1.45,{w:2.4,d:2.2,pins:3});k.qfn(-14.5,-34.5,{w:2.4,d:2.4,pins:4});
    // Gold ground strips and screw pads.
    for(const [x,y,w,d] of [[1.5,6.05,5.9,.7],[7.65,-1.75,.7,4.4],[7.1,-14.2,.6,8.6],[8.4,-10.2,3.3,.6],[2.8,-29.55,5,.7],[-5.8,-29.55,3.3,.7],[-7.05,-30.8,.7,2.4]])k.pad(x,y,w,d);
    padHole('gold',-14.1,-28.15,5,3.9,[-13.26,-27.65,1.4]);
    k.ring('gold',2.75,4.22,.016,1.38,1.9,28);k.ring('gold',10.05,-27.04,.016,1.63,2.2,28);k.ring('gold',-8.26,-13.58,.016,.55,1.15,20);
    for(let i=0;i<4;i++)k.route('traceBlack',[-12.2,-9.6-i*.6],[-6.5,-13.6-i*.7],.13);
    fill.blockAll([[7.65,3.2,6,5],[1.2,-18.5,4.4,10.8],[8.75,-12.7,2,5],[-4.15,1.65,6,9],[5.8,-21.6,4,4],[1.9,-24.8,4,1.6],[-13.6,-7.25,3,7],[-12.6,-22.2,3.4,5.4],
      [-14.8,4.2,4.4,3.4],[-14.4,-.7,3.4,4.4],[-13.2,-13.6,6.6,4],[-13.05,-18.5,2.4,2.4],[3.25,-1.45,3,3],[-14.5,-34.5,3,3],[0,-34.5,10.4,7.6],[-14.1,-28.15,5.4,4.4],
      [1.5,6.05,6.2,1],[7.65,-1.75,1,4.8],[7.1,-14.2,1,9],[2.8,-29.55,5.4,1],[-5.8,-29.55,3.6,1],[-7.05,-30.8,1,2.8],[-4,-8,7,6]]);
    for(const [x,y,r] of B.holes)fill.block(-x,y,r*2+1.6,r*2+1.6);
    fill.passives(k,14,[-17,-37,-8,-24]);fill.passives(k,12,[-9,-6,6,4]);fill.passives(k,10);
    fill.vias(k,150,null,.15);
  });
}
