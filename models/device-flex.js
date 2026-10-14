'use strict';
/* Ledger Flex, rebuilt from Ledger's own photos (support article "Check hardware integrity"):
 *   ledger-genuine/flex/front.jpg, back.jpg, disassembled-1.jpg, disassembled-2.jpg,
 *   frame-removed-front.jpg, frame-removed-back.jpg, pcb-front.jpg, pcb-back.jpg.
 * Size: 78.4 x 56.5 x 7.7 mm, 480 x 600 E Ink touchscreen (Ledger's spec sheet).
 *
 * Layout: the device stands upright. X = width, Y = height (USB-C at the bottom, -Y), Z = thickness.
 * The screen faces +Z. Stack from the front: glass and E Ink screen, black mid-frame (with the
 * orange display flex), circuit board (see flex-board.js), steel shield, battery, NFC antenna film,
 * plastic back cover. A brushed aluminium "chin" clips over the bottom and holds it all together.
 * Hidden fits are approximate: this is a photo-based reconstruction, not Ledger's CAD. */

DEVICE_MODELS.flex={
  label:'Flex',name:'Ledger Flex',
  note:"Ledger Flex, rebuilt from Ledger's photos.",
  implantNote:'Illustration: an added radio board wired to the debug pads, hidden under the shield. Not a real Flex implant.',
  create(){
    const k=new MeshKit(),A=new Atlas(),PI=Math.PI;
    const W=56.5,H=78.4,CHIN=-26.5; // the chin covers everything below y = -26.5
    const BODY=Outline.rectFn(W,H,[2,2,6.5,6.5],8);
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
      bt:A.text(['BT','RF'],{w:120,h:120,weight:700})
    };

    // ---------- Frame (part frame, stays): dark aluminium band, side button, black mid-frame ----------
    k.inPart('frame',()=>{
      k.slab('aluDark',BODY,[Outline.rect(W-2,H-2,[1,1,5.5,5.5],8)],-3.4,3.4,{top:.8,bottom:.8,seg:3});
      k.roundBox('aluSilver',[28.4,22,0],[.8,10,2.2],.35,2); // side button
      k.slab('plastic',Outline.rect(W-2.1,H-2.1,[.9,.9,5.4,5.4],8),[],1.05,2.35);
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
        for(const [x,y] of [[-19.25,23.4],[0,11.6],[13.75,31.6],[14.6,6.5]]){k.cyl('aluSilver',[x,y,0],1.1,.3,20);k.disc('chip',x,y,.305,.45,12);}
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
    // ---------- Aluminium chin: wraps the bottom. [L] etched on the front, USB-C opening below ----------
    k.inPart('chin',()=>{
      k.slab('aluSilver',Outline.rectFn(W+.3,12.85,[2.15,2.15,0,0],8,0,-32.925),[],-3.95,3.95,{top:1.2,bottom:1.2,seg:4});
      k.label('etch',-20.75,-32.9,3.956,5.3,5.3,T.lLogo);
      k.place({at:[0,-39.35,0],rx:PI/2},()=>k.slab('chip',Outline.stadium(9.2,3.5,8),[],0,.04));
    });
    // ---------- Plastic back cover with the big [L] logo ----------
    k.inPart('back',()=>{
      k.slab('backPlastic',FACE,[],-3.85,-3.3,{bottom:.3,seg:3});
      k.place({at:[0,5.7,-3.856],ry:PI},()=>k.label('labelInk',0,0,0,12.5,12.5,T.lLogo));
    });
    // ---------- NFC antenna: black film with a printed coil, glued under the back cover ----------
    k.inPart('nfc',()=>{
      k.slab('flexBlack',Outline.rect(34,44,1.5,4,0,6),[],-3.29,-3.19);
      k.place({at:[0,0,-3.29],ry:PI},()=>{
        k.coilRect(0,6,0,32.6,42.6,6,.55,'flexTrace',.3);
        for(const x of [-4.5,4.5])for(const y of [17,6,-5])k.disc('flexTrace',x,y,.012,1.2,20);
        k.label('silkLabel',9,4,.015,8.4,6,T.nfc,-PI/2);
      });
      // The tail that plugs into the board, with "SPD" printed on it.
      k.ribbon('flexBlack',[[-15.5,-14,-3.24],[-14.6,-12,-3.0],[-14.4,-6,-2.4],[-14.4,-1.5,-2.25]],2.6,.1,[1,0,0]);
      k.place({at:[-15.2,-13,-3.297],ry:PI},()=>k.label('silkLabel',0,0,0,2.4,1.2,T.spd,PI/2));
    });
    // ---------- Battery: soft pouch in yellow tape, protection board and flex tail ----------
    k.inPart('battery',()=>{
      k.place({at:[2,23,-3.15]},()=>k.battery(36,26.5,3.85,{skin:'pouchYellow'}));
      k.roundBox('boardGreen',[2,8.6,-1.6],[26,2.2,.6],.08,1);
      for(let i=0;i<6;i++)k.place({at:[-8+i*3.6,8.6,-1.9],rx:PI},()=>k.passive(0,0,i%2?'0402':'0603'));
      k.ribbon('flexBlack',[[14.6,8.6,-1.95],[14.8,6.5,-2.05],[14.8,4.2,-2.25]],2.4,.1,[1,0,0]);
    });
    // ---------- Steel shield over the back of the board, with a black film ----------
    k.inPart('shield',()=>{
      const plate=[[-16,-27],[10,-27],[10,-20],[22,-20],[22,-1],[-16,-1]];
      k.slab('shield',plate,[],-2.52,-2.4);
      for(const [x,y] of [[-17.4,-25.6],[-17.4,-2.4],[23.4,-2.4],[23.4,-18.6]])k.slab('shield',Outline.circle(1.5,20,x,y),[Outline.circle(.65,16,x,y)],-2.5,-2.42);
      k.place({at:[0,0,-2.52],ry:PI},()=>{k.roundBox('flexBlack',[-2.5,-12.5,.02],[28,17,.04],.4,1);k.roundBox('flexBlack',[12.5,-23.5,.02],[6,5,.04],.3,1);});
    });
    // ---------- Circuit board (flex-board.js) ----------
    k.inPart('pcb',()=>buildFlexBoard(k,T));
    // ---------- Implant (only in implant mode): a tiny radio board tapping the debug pads ----------
    // It sits on the back of the board, under the steel shield. Same local coordinates as the back side.
    k.inPart('implant',()=>k.place({at:[0,0,FLEX_BOARD.BOT],ry:PI},()=>{
      k.roundBox('rubber',[-4.3,-8.2,.06],[6,4.6,.12],.1,1);
      k.roundBox('implantBoard',[-4.3,-8.2,.4],[6,4.6,.55],.08,1);
      k.place({at:[-4.3,-8.2,.67]},()=>{k.roundBox('nickel',[-1,0,.22],[2.8,2.8,.44],.06,1);k.passive(1.9,1.2,'0402');k.passive(1.9,-1.2,'0402');k.crystal(1.7,0,{w:1.2,d:.9,h:.4});});
      // Copper wire antenna, zig-zagging across the free space.
      k.tube('copper',[[-7.3,-6.4,.6],[-7.6,-4.6,.25],[-3.4,-4.6,.25],[-3.4,-5.4,.25],[-8.6,-5.4,.25]],.07);
      // Wires to the debug pads: power (3V0), ground and the two data lines (CLK, IO).
      const wire=(mat,a,b)=>k.tube(mat,[a,[(a[0]+b[0])/2,(a[1]+b[1])/2,1.0],[b[0],b[1],.12]],.12);
      wire('wireRed',[-1.6,-10,.6],[6.82,-20.7]);wire('wireBlack',[-2.4,-10.4,.6],[.59,-24.75]);
      wire('wireGold',[-3.4,-10.4,.6],[4.86,-21.47]);wire('wireGold',[-4.4,-10.4,.6],[5.16,-22.5]);
    }));

    // E Ink lock screen, 480 x 600. Black ink on light grey "paper".
    const screen=document.createElement('canvas');screen.width=480;screen.height=600;
    const c=screen.getContext('2d');c.fillStyle='#e7e6e0';c.fillRect(0,0,480,600);c.strokeStyle=c.fillStyle='#16171a';
    c.lineWidth=12;for(const [x,y,dx,dy] of [[150,150,1,1],[330,150,-1,1],[150,330,1,-1],[330,330,-1,-1]]){c.beginPath();c.moveTo(x+dx*55,y);c.lineTo(x,y);c.lineTo(x,y+dy*55);c.stroke();}
    c.beginPath();c.moveTo(212,196);c.lineTo(212,280);c.lineTo(276,280);c.stroke();
    c.textAlign='center';c.font='600 40px Arial, sans-serif';c.fillText('Ledger Flex',240,420);
    c.font='22px Arial, sans-serif';c.fillText('3D REFERENCE',240,462);c.font='20px Arial, sans-serif';c.fillText('Tap to unlock',240,560);

    const parts=['front','frame','chin','back','nfc','battery','shield','pcb','implant'];
    return {name:this.name,...k.build(),atlas:A.canvas,screen:{canvas:screen,px:[480,600],kind:'eink'},
      partIds:makePartIds(parts),pcbParts:['pcb'],center:[7,11,0],startProgress:0,implantProgress:6,
      // Steps: 1 the device turns over (back up), 2 the chin slides off, 3 the back cover comes off,
      // 4 the NFC film, then the battery, then the shield, 6 the circuit board. Parts are laid out on the table.
      rig(p){
        const t={},s=i=>rigStep(p,i),f=s(0);
        const F=Mat.mul(Mat.translation(0,0,9*Math.sin(PI*f)),Mat.rotY(PI*f));
        // Moves a part by (dx,dy) and lowers it onto the table. zTop = its highest point before the flip.
        const lay=(v,dx,dy,zTop)=>Mat.mul(Mat.translation(dx*v,dy*v,(-3.85+zTop)*v+14*Math.sin(PI*v)),F);
        t.front=t.frame=F;
        t.chin=lay(s(1),0,-24,3.95);t.back=lay(s(2),60,0,-3.3);t.nfc=lay(s(3),-52,0,-3.19);
        t.battery=lay(s(3.6),-54,28,.7);t.shield=lay(s(4.2),3,72,-2.4);t.pcb=lay(s(5),55,80,.78);t.implant=t.pcb;
        return t;
      }};
  }
};
