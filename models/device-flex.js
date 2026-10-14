'use strict';
/* Ledger Flex, rebuilt from Ledger's own photos (support article "Check hardware integrity"):
 *   ledger-genuine/flex/front.jpg, back.jpg, disassembled-1.jpg, disassembled-2.jpg,
 *   frame-removed-front.jpg, frame-removed-back.jpg, pcb-front.jpg, pcb-back.jpg.
 * Also checked against MagicalTux's Flex teardown video (back cover off, shield off, board view).
 * Size: 78.4 x 56.5 x 7.7 mm, 480 x 600 E Ink touchscreen (Ledger's spec sheet).
 *
 * Layout: the device stands upright. X = width, Y = height (chin at the bottom, -Y), Z = thickness.
 * The screen faces +Z. The USB-C port is on the left side (-X), the power button on the right (+X).
 * Stack from the front: glass and E Ink screen, black mid-frame (with the orange display flex).
 * Behind it: the circuit board lies sideways in the top half (see flex-board.js) under a steel
 * shield, and the battery lies in the bottom half. The NFC antenna film covers the top half,
 * then the plastic back cover. A brushed aluminium "chin" clips over the bottom.
 * Hidden fits are approximate: this is a photo-based reconstruction, not Ledger's CAD. */

DEVICE_MODELS.flex={
  label:'Flex',name:'Ledger Flex',
  note:"Ledger Flex, rebuilt from Ledger's photos.",
  implantNote:'Illustration: an added radio board wired to the debug pads, hidden under the shield. Not a real Flex implant.',
  create(){
    const k=new MeshKit(),A=new Atlas(),PI=Math.PI;
    const W=56.5,H=78.4,CHIN=-26.5; // the chin covers everything below y = -26.5
    // The frame band stops 1.8 mm short of the bottom. That part is hidden inside the chin,
    // and the chin's rounded bottom would otherwise cut through the band's corners.
    const BODY=Outline.rectFn(W,H-1.8,[2,2,6.5,6.5],8,0,.9);
    // The glass and the back cover: the full width, from the chin to the top.
    const FACE=Outline.rectFn(W-.9,38.75-CHIN,[0,0,6.05,6.05],8,0,(38.75+CHIN)/2);

    // ---------- Printed marks (texture atlas) ----------
    const T={
      lLogo:A.logo({w:256,h:256}),ledgerWord:A.logo({w:740,h:260,word:'LEDGER',line:14,arm:60}),
      mcu:A.text(['STM32WB35','CCU6A','GQ271 1J9E','CHN GQ 343'],{w:460,h:390}),usbMark:A.text('21261',{w:300,h:100}),
      rev:A.text('Rev.3.0',{w:300,h:100,weight:700}),rohs:A.text(['ROHS   1124','94V-0  E170968','DEHI 062226941','3.4'],{w:600,h:380,align:'left',weight:700}),
      tpClk:A.text('CLK',{w:160,h:80,weight:700}),tp3v:A.text('3V0',{w:160,h:80,weight:700}),tpIo:A.text('IO',{w:160,h:80,weight:700}),tpRst:A.text('RST',{w:160,h:80,weight:700}),
      qr1:A.qrLabel(41,{w:180,h:220,text:'7U4000ZO'}),qr2:A.qrLabel(42,{w:200,h:190,text:'LF2420'}),qr3:A.qrLabel(43,{w:220,h:190,text:'60X1028'}),
      nfc:A.text(['[ LEDGER ]','EU_NFC_FPC','Rev 2.1.0'],{w:420,h:300,weight:700}),spd:A.text('SPD',{w:160,h:80,weight:700}),
      flexA:A.text(['ICA-FU-20','94V-0  1-C','ichia 2420'],{w:720,h:300,weight:700}),flexB:A.text('VDD  GND  SWCLK  SWDIO  NRST  3V0',{w:1100,h:90,weight:700}),
      bt:A.text(['BT','RF'],{w:120,h:120,weight:700}),
      // The white label on the NFC film, and the print on the battery (MagicalTux's teardown).
      nfcQr:A.qrLabel(44,{w:180,h:200,text:'LS2'}),nfcLabel:A.text(['LS2_NFC','50A560020A0','2025/01/09','REV:01'],{w:380,h:230,align:'left',weight:600}),
      cell:A.text(['U242532PV  3.8V','Y24L08881','200mAh  0.76Wh'],{w:640,h:220,weight:600}),cellQr:A.qrLabel(45,{w:180,h:200,text:'Y24L'}),cellCode:A.matrix(46,{n:14,px:140})
    };

    // ---------- Frame (part frame, stays): dark aluminium band, side button, black mid-frame ----------
    k.inPart('frame',()=>{
      k.slab('aluDark',BODY,[Outline.rect(W-2,H-3.8,[1,1,5.5,5.5],8,0,.9)],-3.4,3.4,{top:.8,bottom:.8,seg:3});
      k.roundBox('aluSilver',[28.4,22,0],[.8,10,2.2],.35,2); // power button, right side
      // USB-C opening in the left wall, in front of the board's socket (socket middle: y = 20.5, z = -0.85).
      k.place({at:[-W/2-.005,20.5,-.85],ry:-PI/2},()=>k.slab('chip',Outline.stadium(3.5,9.2,8),[],0,.04));
      k.slab('plastic',Outline.rect(W-2.1,H-3.9,[.9,.9,5.4,5.4],8,0,.9),[],1.05,2.35);
      // Parts stuck on the back of the mid-frame (photo frame-removed-back.jpg, seen from the back).
      k.place({at:[0,0,1.05],ry:PI},()=>{
        for(const x of [1.65,15.95])k.roundBox('aluSilver',[x,-10,.03],[9.9,20.3,.06],.1,1); // silver tape
        k.roundBox('kapton',[-6.6,-5.2,.08],[6.6,27.8,.1],.3,1);k.roundBox('kapton',[1.4,-26.6,.08],[37.9,15,.1],.6,1); // orange display flex
        k.label('labelInk',-6.6,-6,.135,18,7.5,T.flexA,-PI/2);
        k.place({at:[-7.5,-26.2,.13]},()=>k.sticker(0,0,5.2,5,T.qr2));k.place({at:[13.75,-27.8,.13]},()=>k.sticker(0,0,5.8,5,T.qr3));
        k.place({at:[-14.85,-27,.13]},()=>k.sot23(0,0,{leads:6,rz:PI/2}));
        k.roundBox('flexBlack',[8.5,-6.4,.08],[3.8,28.5,.1],.2,1);k.roundBox('kapton',[8.5,7.3,.15],[3.4,2.6,.12],.1,1);
        k.label('silkLabel',8.5,-6.4,.135,26,2.1,T.flexB,-PI/2);
        k.roundBox('goldHatch',[19.25,21.6,.06],[8.8,9.9,.12],.2,1);   // screen connector pad
        k.roundBox('aluSilver',[-5.2,32.35,.15],[30.25,7.1,.3],.4,2);  // top bracket
        // Screw posts, exactly under the board's holes. Local x is mirrored here (seen from the back).
        for(const h of FLEX_BOARD.holes){const [x,y]=FLEX_BOARD.toDevice(h);k.cyl('aluSilver',[-x,y,0],1.1,.3,20);k.disc('chip',-x,y,.305,.45,12);}
        k.roundBox('flexBlack',[-25.1,18.8,.06],[3.8,24.3,.1],.2,1);  // side button flex
        k.roundBox('darkMetal',[-23.4,1.9,.5],[4.8,6,1],.3,2);         // vibration motor
        k.roundBox('rubber',[-20.9,-12,.4],[12,10,.8],.4,2);           // foam pad
      });
    });
    // ---------- Front glass and the E Ink screen (part front, stays) ----------
    k.inPart('front',()=>{
      k.slab('gloss',FACE,[],3.3,3.85,{top:.3,seg:3});
      k.screen('eink',Outline.rect(44.4,55.5,.6,3,0,5.9),3.856,(x,y)=>[(x+22.2)/44.4,(y-5.9+27.75)/55.5]);
    });
    // ---------- Aluminium chin: wraps the bottom, with a deeply rounded bottom edge. [L] etched on the front ----------
    // Built as a side profile (Y-Z plane) pushed along X. In this placement local x = -Z, local y = Y, local z = X.
    // Profile: 7.9 mm thick, 12.85 mm tall. The bottom corners have a 3.2 mm radius (almost a half-round,
    // as in back.jpg and the teardown). The 2 mm rounding at both ends rounds the device's bottom corners.
    // There is no USB hole here: the port is on the left side.
    k.inPart('chin',()=>{
      k.place({ry:PI/2},()=>k.slab('aluSilver',Outline.rectFn(7.9,12.85,[3.2,3.2,.3,.3],8,0,-32.925),[],-(W+.3)/2,(W+.3)/2,{top:2,bottom:2,seg:4}));
      k.label('etch',-20.75,-32.9,3.956,5.3,5.3,T.lLogo);
    });
    // ---------- Plastic back cover with the big [L] logo ----------
    k.inPart('back',()=>{
      k.slab('backPlastic',FACE,[],-3.85,-3.3,{bottom:.3,seg:3});
      k.place({at:[0,5.7,-3.856],ry:PI},()=>k.label('labelInk',0,0,0,12.5,12.5,T.lLogo));
    });
    // ---------- NFC antenna: black film with a printed coil, glued under the back cover ----------
    // Landscape, 47 x 36 mm, over the top half (y -6 to 30). It also covers the top of the battery.
    // Measured on MagicalTux's photo with the back cover off. The local numbers below are seen from the back.
    k.inPart('nfc',()=>{
      k.slab('flexBlack',Outline.rect(47,36,1.5,4,-1.5,12),[],-3.29,-3.19);
      k.place({at:[0,0,-3.29],ry:PI},()=>{
        k.coilRect(1.5,12,0,45.6,34.6,6,.55,'flexTrace',.3);
        // Six round dots: two columns at the sides and a pair at the bottom.
        for(const [x,y] of [[-12.1,6.1],[12.1,6.1],[-12.1,-1.6],[12.1,-1.6],[-4.1,-7.7],[4.1,-7.7]])k.disc('flexTrace',1.5+x,12+y,.012,1.3,20);
        k.label('silkLabel',1.5,19.2,.015,12.3,8.8,T.nfc);
        // White label: QR code on the left, four lines of text on the right.
        k.roundBox('paper',[1.5,9.7,.04],[16,6.7,.08],.1,1);
        k.label('labelInk',-4.3,9.7,.085,4.9,5.6,T.nfcQr);k.label('labelInk',3.9,9.7,.085,9.6,5.8,T.nfcLabel);
      });
      // The tail runs down the right side (seen from the front) under the foam block, with "SPD" printed on it.
      k.strip('flexBlack',[[19,-5.5],[19,-13]],2.6,-3.29,.1,{bottom:true});
      k.place({at:[19,-10,-3.297],ry:PI},()=>k.label('silkLabel',0,0,0,2.4,1.2,T.spd,PI/2));
    });
    // ---------- Battery: soft pouch in yellow tape, lying sideways in the bottom half ----------
    // 36 x 26.5 mm, from just above the chin (y -24.5) up to the board (y 2). Protection board on its left end.
    const CELL=[-3.5,-11.25];
    k.inPart('battery',()=>{
      k.place({at:[CELL[0],CELL[1],-3.15]},()=>k.battery(36,26.5,3.85,{skin:'pouchYellow'}));
      // Print on the back face. Local x is mirrored here (seen from the back); the text is upside down, as on the real cell.
      k.place({at:[CELL[0],CELL[1],-3.15],ry:PI},()=>{
        for(const [x,w] of [[-2.5,7],[10.1,5.6]])k.roundBox('flexBlack',[x,5.75,.02],[w,11.5,.04],.1,1); // two black tape strips
        k.label('labelInk',-11.2,.65,.012,3.5,3.5,T.cellCode);
        k.label('labelInk',-1,-3,.012,14,4.8,T.cell,PI);
        k.roundBox('paper',[7.3,-8.5,.02],[5.6,6,.04],.05,1);k.label('labelInk',7.3,-8.5,.045,5,5.4,T.cellQr);
      });
      k.roundBox('boardGreen',[-22.7,CELL[1],-1.6],[2.2,20,.6],.08,1);
      for(let i=0;i<6;i++)k.place({at:[-22.7,CELL[1]-8.3+i*3.3,-1.9],rx:PI},()=>k.passive(0,0,i%2?'0402':'0603',{rz:PI/2}));
      // Flex tail from the protection board up to the board's battery socket.
      k.ribbon('flexBlack',[[-22.7,-1.2,-1.95],[-22.7,1.2,-2.05],[-22.2,3.6,-1.3]],2.4,.1,[1,0,0]);
    });
    // ---------- Steel shield over the back of the board ----------
    // Shape from MagicalTux's photo with the NFC film off: a plate over the top half, with its
    // lower-left corner cut away. It stops short of the USB-C socket on the left.
    k.inPart('shield',()=>{
      const D=FLEX_BOARD.toDevice,[h1,h2,h3]=FLEX_BOARD.holes.map(D);
      const plate=[[-13.5,4.6],[21.5,4.6],[21.5,33],[-18.6,33],[-18.6,13.6],[-13.5,13.6]];
      k.slab('shield',plate,[h1,h2].map(([x,y])=>Outline.circle(.65,16,x,y)),-2.52,-2.4);
      k.slab('shield',Outline.circle(2.4,20,h3[0],h3[1]),[Outline.circle(.65,16,h3[0],h3[1])],-2.5,-2.42); // screw ear, bottom left
      k.roundBox('flexBlack',[2,19,-2.385],[30,24,.03],.4,1); // black film on the inside (it faces the board)
      k.roundBox('chip',[-9.8,18,-2.53],[1.2,1.8,.02],.05,1);
    });
    // ---------- Circuit board (flex-board.js), turned and moved to the top ----------
    k.inPart('pcb',()=>k.place(FLEX_BOARD.at,()=>buildFlexBoard(k,T)));
    // ---------- Implant (only in implant mode): a tiny radio board tapping the debug pads ----------
    // It sits on the back of the board, under the steel shield. Same local coordinates as the back side.
    k.inPart('implant',()=>k.place(FLEX_BOARD.at,()=>k.place({at:[0,0,FLEX_BOARD.BOT],ry:PI},()=>{
      k.roundBox('rubber',[-4.3,-8.2,.06],[6,4.6,.12],.1,1);
      k.roundBox('implantBoard',[-4.3,-8.2,.4],[6,4.6,.55],.08,1);
      k.place({at:[-4.3,-8.2,.67]},()=>{k.roundBox('nickel',[-1,0,.22],[2.8,2.8,.44],.06,1);k.passive(1.9,1.2,'0402');k.passive(1.9,-1.2,'0402');k.crystal(1.7,0,{w:1.2,d:.9,h:.4});});
      // Copper wire antenna, zig-zagging across the free space.
      k.tube('copper',[[-7.3,-6.4,.6],[-7.6,-4.6,.25],[-3.4,-4.6,.25],[-3.4,-5.4,.25],[-8.6,-5.4,.25]],.07);
      // Wires to the debug pads: power (3V0), ground and the two data lines (CLK, IO).
      const wire=(mat,a,b)=>k.tube(mat,[a,[(a[0]+b[0])/2,(a[1]+b[1])/2,1.0],[b[0],b[1],.12]],.12);
      wire('wireRed',[-1.6,-10,.6],[6.82,-20.7]);wire('wireBlack',[-2.4,-10.4,.6],[.59,-24.75]);
      wire('wireGold',[-3.4,-10.4,.6],[4.86,-21.47]);wire('wireGold',[-4.4,-10.4,.6],[5.16,-22.5]);
    })));

    // E Ink lock screen, 480 x 600. Black ink on light grey "paper".
    const screen=document.createElement('canvas');screen.width=480;screen.height=600;
    const c=screen.getContext('2d');c.fillStyle='#e7e6e0';c.fillRect(0,0,480,600);c.strokeStyle=c.fillStyle='#16171a';
    c.lineWidth=12;for(const [x,y,dx,dy] of [[150,150,1,1],[330,150,-1,1],[150,330,1,-1],[330,330,-1,-1]]){c.beginPath();c.moveTo(x+dx*55,y);c.lineTo(x,y);c.lineTo(x,y+dy*55);c.stroke();}
    c.beginPath();c.moveTo(212,196);c.lineTo(212,280);c.lineTo(276,280);c.stroke();
    c.textAlign='center';c.font='600 40px Arial, sans-serif';c.fillText('Ledger Flex',240,420);
    c.font='22px Arial, sans-serif';c.fillText('3D REFERENCE',240,462);c.font='20px Arial, sans-serif';c.fillText('Tap to unlock',240,560);

    const parts=['front','frame','chin','back','nfc','battery','shield','pcb','implant'];
    return {name:this.name,...k.build(),atlas:A.canvas,screen:{canvas:screen,px:[480,600],kind:'eink'},
      partIds:makePartIds(parts),pcbParts:['pcb'],center:[5,18,0],startProgress:0,implantProgress:6,
      // Steps: 1 the device turns over (back up), 2 the plastic back cover comes off,
      // 3 the chin slides straight down, 4 the NFC film, then the battery, then the shield,
      // 6 the circuit board. Parts are laid out on the table.
      rig(p){
        const t={},s=i=>rigStep(p,i),f=s(0);
        const F=Mat.mul(Mat.translation(0,0,9*Math.sin(PI*f)),Mat.rotY(PI*f));
        // Moves a part by (dx,dy) and lowers it onto the table. zTop = its highest point before the flip.
        // The flip mirrors x, so a part ends up at (-its x + dx, its y + dy).
        const lay=(v,dx,dy,zTop)=>Mat.mul(Mat.translation(dx*v,dy*v,(-3.85+zTop)*v+14*Math.sin(PI*v)),F);
        t.front=t.frame=F;
        t.back=lay(s(1),60,0,-3.3);
        t.chin=Mat.mul(Mat.translation(0,-22*s(2),0),F); // slides straight off the bottom, no lifting
        t.nfc=lay(s(3),-52,0,-3.19);t.battery=lay(s(3.6),-54,58,.7);
        t.shield=lay(s(4.2),3,62,-2.37);t.pcb=lay(s(5),57,64,.78);t.implant=t.pcb;
        return t;
      }};
  }
};
