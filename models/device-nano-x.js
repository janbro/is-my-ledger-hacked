'use strict';
/* Ledger Nano X, rebuilt from Ledger's own photos (support article "Check hardware integrity"):
 *   ledger-genuine/nano-x/front.jpg, back.jpg, disassembled-1.jpg, disassembled-2.jpg,
 *   pcb-rev3-black-front.jpg (chip side) and pcb-rev3-black-back.jpg (button side).
 * Size: 72 x 18.6 x 11.7 mm with the steel swivel (Ledger's spec sheet).
 * Board parts were measured on the rev 3 photos: 0.0646 mm per pixel.
 *
 * Layout: long side along X. USB-C at -X. The swivel pivots at +X, over the right button.
 * The screen faces +Z. Stack from the front: steel swivel, glossy front frame, OLED,
 * circuit board (buttons and display connector on top, chips underneath), battery, rear shell.
 * This is a photo-based reconstruction, not Ledger's CAD. Hidden fits are approximate. */
DEVICE_MODELS.nanoX={
  label:'Nano X',name:'Ledger Nano X',
  note:"Ledger Nano X, rebuilt from Ledger's photos.",
  implantNote:'Illustration: an added board with hand-soldered wires, like the fake Nano X in the game.',
  create(){
    const k=new MeshKit(),A=new Atlas(),PI=Math.PI;
    const PIVOT=23.3,BTN_USB=-26.1,FOLD=-38.65,BODY=Outline.rectFn(69,17.8,3,6,-3,0);
    const TOP=.5,BOT=-.3; // board faces

    // ---------- Printed marks (texture atlas) ----------
    const T={
      logo:A.logo({w:520,h:144,word:'LEDGER',line:9,arm:40}),
      motto:A.text('Resilience by design',{w:1000,h:100,weight:400}),
      marks:A.marks({w:400,h:160}),
      plate:A.text(['Ledger - Nano X','Made in France'],{w:520,h:160,align:'left',weight:700}),
      mcu:A.text(['STM32WB55','CGU6','GQ21Z 9R','CHN GQ 141'],{w:400,h:320}),
      se:A.text(['ST33J2M0','TQ 2E1','CHN 141'],{w:400,h:300}),
      chipA:A.text(['LIS2','DW12'],{w:200,h:160}),chipB:A.text(['L6924','D'],{w:200,h:160}),
      ind:A.text('220',{w:200,h:100,weight:700}),
      silk:A.text(['OC-136','2421','H'],{w:300,h:200,weight:700}),silk2:A.text('e 2.8',{w:200,h:110,weight:700}),
      code:A.matrix(7),
      cell:A.text(['+ LITHIUM POLYMER BATTERY','LP251544P 3.7V 100mAh 0.37Wh','1ICP3/16/44  10/2022','- CAUTION: RISK OF FIRE OR BURNS'],{w:1100,h:300,weight:600}),
      flex:A.text('LT1312P1-A',{w:300,h:60})
    };

    // ---------- Steel swivel (parts coverTop, coverBottom, coverSpine) ----------
    // Plate outline: straight to the fold at -X, half circle round the pivot at +X.
    const plate=ins=>{const r=9.3-ins,p=[[FOLD,-r]];for(let i=0;i<=28;i++){const a=-PI/2+i/28*PI;p.push([PIVOT+r*Math.cos(a),r*Math.sin(a)]);}p.push([FOLD,r]);return p;};
    k.inPart('coverTop',()=>{
      k.slab('steel',plate,[Outline.circle(4.9,48,PIVOT,0)],5.1,5.85,{top:.25,bottom:.25,seg:2,wall:'steelEdge'});
      k.label('etchLight',-29.5,0,5.856,13,3.6,T.logo);
    });
    k.inPart('coverBottom',()=>{
      k.slab('steel',plate,[],-5.85,-5.1,{top:.25,bottom:.25,seg:2,wall:'steelEdge'});
      k.place({at:[-6,0,-5.856],rx:PI},()=>k.label('etchLight',0,0,0,34,3.4,T.motto));
    });
    // The fold: a half tube joining the two plates round the USB end.
    k.inPart('coverSpine',()=>{
      const seg=24,Ro=5.85,Ri=5.1,Y=9.3,P=(r,t,y)=>[FOLD+r*Math.cos(t),y,r*Math.sin(t)],N=t=>[Math.cos(t),0,Math.sin(t)];
      for(let i=0;i<seg;i++){
        const a=PI/2+i/seg*PI,b=PI/2+(i+1)/seg*PI;
        k.quad('steel',P(Ro,a,-Y),P(Ro,b,-Y),P(Ro,b,Y),P(Ro,a,Y),N(a),N(b),N(b),N(a));
        k.quad('steelEdge',P(Ri,a,-Y),P(Ri,b,-Y),P(Ri,b,Y),P(Ri,a,Y),V3.scale(N(a),-1),V3.scale(N(b),-1),V3.scale(N(b),-1),V3.scale(N(a),-1));
        for(const s of [-1,1])k.quad('steelEdge',P(Ri,a,s*Y),P(Ro,a,s*Y),P(Ro,b,s*Y),P(Ri,b,s*Y),[0,s,0]);
      }
    });

    // ---------- Glossy front frame: screen window and two button holes ----------
    k.inPart('front',()=>{
      k.slab('gloss',BODY,[Outline.circle(4.75,48,BTN_USB,0),Outline.circle(4.75,48,PIVOT,0),Outline.rect(26,12.6,.8,4,-1.4,0)],3.75,4.75,{top:.9,seg:4});
      k.slab('gloss',BODY,[Outline.rect(67,15.8,2,6,-3,0)],.9,3.75,{caps:'bottom'});
    });
    // ---------- Matte rear shell: floor, walls, printed marks, the pivot ring, the USB opening ----------
    k.inPart('rear',()=>{
      k.slab('plastic',BODY,[],-4.75,-3.6,{bottom:1,seg:4});
      k.slab('plastic',BODY,[Outline.rect(67,15.8,2,6,-3,0)],-3.6,.9,{top:.15,seg:2,caps:'top'});
      k.slab('plastic',Outline.circle(4.8,40,PIVOT,0),[Outline.circle(4.2,40,PIVOT,0)],-4.82,-4.75);
      k.place({at:[-13,0,-4.752],rx:PI},()=>{k.label('emboss',-9.5,0,0,8.5,3.4,T.marks);k.label('emboss',2.5,0,0,13,4,T.plate);});
      k.place({at:[-37.52,0,-1.93],ry:-PI/2},()=>k.slab('chip',Outline.stadium(3.7,9.4,8),[],0,.06));
    });
    // ---------- Buttons: plastic cap at the USB end, metal cap under the swivel hole ----------
    k.inPart('buttons',()=>{
      for(const [x,cap] of [[BTN_USB,'plastic'],[PIVOT,'aluGray']]){
        k.cyl(cap,[x,0,3.85],4.45,1.05,48,{top:.35});
        k.cyl('plastic',[x,0,3.5],5.1,.25,40);
        k.cyl('plastic',[x,0,1.62],1.4,1.9,20);
      }
    });
    // ---------- OLED module: metal back, glass, 128 x 64 screen, and its flex tail ----------
    k.inPart('display',()=>{
      k.slab('displayBack',Outline.rect(30,14,.3,3,-1.4,0),[],2.55,2.95);
      k.slab('glass',Outline.rect(30,14,.3,3,-1.4,0),[],2.95,3.6,{wall:'displayEdge'});
      k.quad('screen',[-13.9,-6.25,3.605],[11.1,-6.25,3.605],[11.1,6.25,3.605],[-13.9,6.25,3.605],[0,0,1],null,null,null,[0,0],[1,0],[1,1],[0,1]);
    });
    k.inPart('ribbon',()=>{
      k.ribbon('kapton',[[13.2,0,2.75],[14.4,0,2.7],[15.2,0,2.3],[15.6,0,1.85],[16.2,0,1.66],[20.2,0,1.66]],6,.12);
      k.roundBox('nickel',[18.6,0,1.8],[4.2,6.2,.16],.05,1);   // steel stiffener
      k.roundBox('chip',[17.2,.8,1.5],[2.4,5.3,.24],.08,1);     // the socket that plugs onto the board
      k.label('labelInk',18.6,0,1.885,3.6,.72,T.flex,PI/2);
    });

    // ---------- Circuit board (part pcb). Outline from the photos, with its edge notches. ----------
    const bite=[];for(let i=0;i<=8;i++){const a=i/8*PI;bite.push([9.5+.9*Math.cos(a),7.3-.9*Math.sin(a)]);}
    const board=[[-33,-6.5],[-32.2,-7.3],[-9.6,-7.3],[-9.6,-6.5],[-8.3,-6.5],[-8.3,-7.3],[17.6,-7.3],[17.6,-6.6],[19,-6.6],[19,-7.3],[26,-7.3],[26.6,-6.7],[26.6,6.7],[26,7.3],...bite,[-18,7.3],[-18,6.5],[-19,6.5],[-19,7.3],[-32.2,7.3],[-33,6.5]];
    const rnd=seededRandom(31);
    k.inPart('pcb',()=>{
      k.slab('boardNavy',board,[],BOT,TOP);
      // Top face (faces the screen): two push switches, the display socket, gold test pads.
      k.place({at:[0,0,TOP]},()=>{
        k.tactSwitch(BTN_USB,0,{s:3.4});k.tactSwitch(PIVOT,0,{s:3.4});
        k.b2b(17.2,.8,{pins:20,rz:PI/2});
        for(const y of [4,-4])k.roundBox('solder',[-31.5,y,.1],[2.6,1.1,.22],.4,2); // USB socket legs, soldered through
        k.label('laserCode',-29.8,.3,.022,3.3,3.3,T.code);
        k.label('silkYellow',3,-2.1,.022,4.8,3.2,T.silk,-PI/2);k.label('silkYellow',-1.7,-5.6,.022,2.9,1.6,T.silk2,-PI/2);
        k.roundBox('boardBare',[8.6,-3.1,.012],[4.2,4.2,.02],0,0); // antenna keep-out: no copper here
        const tps=[[-21.57,5.81],[-24.67,3.88],[-22.34,2.07],[-19.76,2.45],[-15.95,2.58],[-11.36,3.1],[-17.5,.52],[-13.94,.13],[-11.29,.19],[-24.99,-2.78],[-22.41,-2.39],[-17.5,-2.33],[-13.94,-2.33],[-11.29,-2.13],[-23.5,-5.94],[-20.73,-5.94],[-18.01,-5.94],[-13.94,-5.68],[-6.26,2.58],[-3.8,2.58],[-6.26,-4.91],[-3.8,6.78],[1.04,6.78],[4.6,6.78],[1.04,3.55],[7.18,3.75],[11.19,3.75],[1.04,1.29],[4.6,.78],[7.18,.78],[9.89,.78],[14.29,-3.1],[15.58,-5.17],[19.33,3.88],[21.39,-3.1]];
        const anchors=[[16.1,-1.2],[16.1,0],[16.1,1.2],[16.1,2.4],[18.3,-1.2],[18.3,2.4],[-9,-1],[-9,1.5],[-1.2,-3],[-1.2,1],[-24.3,-1.5],[-24.3,1.5],[21.6,-1.5],[21.6,1.5]];
        for(const t of tps){k.testPoint(t[0],t[1],.5);const a=anchors.reduce((b,c)=>Math.hypot(c[0]-t[0],c[1]-t[1])<Math.hypot(b[0]-t[0],b[1]-t[1])?c:b);k.route('traceNavy',t,a,.15);}
        for(const y of [6.15,5.8,5.45])k.trace('traceNavy',[[-17,y],[-8,y],[-7,y-.9],[12,y-.9]],.13);
        // The via field under the processor: rows of tiny plated holes.
        for(let i=0;i<8;i++)for(let j=0;j<8;j++){const x=-8.8+i*1.0,y=-4.9+j*1.0;if(!tps.some(t=>Math.hypot(t[0]-x,t[1]-y)<.9))k.via(x,y,.22);}
        for(let i=0;i<40;i++){const x=-30+rnd()*55,y=-6.5+rnd()*13;if(!tps.some(t=>Math.hypot(t[0]-x,t[1]-y)<1)&&Math.abs(x-BTN_USB)>2.4&&Math.abs(x-PIVOT)>2.4&&Math.abs(x-17.2)>1.8)k.via(x,y,.2);}
        for(const [x,y,s,rz] of [[13.6,6.5,'0603',PI/2],[13.6,4.4,'0603',PI/2],[13.6,.2,'0603',PI/2],[16.9,-4.7,'0603',0],[18.4,-4.7,'0603',0],[17.6,-5.9,'0402',0],[-24.8,6.9,'0402',0],[-23.4,6.9,'0402',0],[-19.9,6.6,'0603',0],[21.1,-5.3,'0402',0],[24.9,-4.5,'0402',PI/2],[11.6,-5.9,'0402',0]])k.passive(x,y,s,{rz});
      });
      // Bottom face (faces the battery): USB-C, secure element, processor, radio parts, power parts.
      // rx = 180 degrees: local coordinates match the chip-side photo (USB on the left, photo "up" = +y).
      k.place({at:[0,0,BOT],rx:PI},()=>{
        k.usbC(-35.4,0);
        k.pad(-23.1,4.5,2.1,3.9);k.pad(-20.7,4.5,2.1,3.9);k.pad(-21.8,-5.5,4.2,1.9); // battery contact pads
        k.qfn(-21.7,-.65,{w:5,d:4.2,pins:8,label:T.se});
        k.qfn(-16.5,5,{w:3,d:3,pins:5,label:T.chipA});k.qfn(-14.6,-4.7,{w:3,d:3,pins:5,label:T.chipB});
        k.sot23(-12.5,5,{leads:6,rz:PI/2});k.sot23(-13.5,.3,{leads:5,rz:PI/2});
        k.qfn(-5.7,1.6,{w:7,d:7,pins:12,label:T.mcu});
        k.crystal(-1,6,{w:2,d:1.6});k.passive(-.05,2.6,'0805',{mat:'ivory'});
        k.roundBox('ivory',[8.3,6.5,.27],[3.2,1.6,.5],.06,1); // ceramic Bluetooth antenna
        for(let i=0;i<5;i++)k.roundBox('nickel',[7.1+i*.6,6.5,.53],[.25,1.2,.03],0,0);
        k.qfn(5.6,-1.9,{w:4,d:4,pins:6,label:T.chipA,lrz:PI/2});
        k.inductor(21.3,-.9,{s:4,h:1.8,label:T.ind});k.sot23(17.8,3,{leads:6,rz:PI/2});
        for(const [x,y,s,rz,res] of [[-30.4,5.3,'0603',0,1],[-28.2,5.5,'0603',0,1],[-27,5.4,'0402',PI/2],[-25.2,-5.4,'0402',0],[-30.1,-5.4,'0402',0],[-18.4,1,'0402',PI/2],[-18.4,-1,'0402',PI/2],[-18.2,-2.6,'0402',0],[-24.9,-2.6,'0402',PI/2],[-24.9,1.6,'0402',PI/2],[-16.5,2.4,'0402',0],[-14.4,2.4,'0402',0],[-11.7,1.3,'0603',PI/2,1],[-11.4,-1.9,'0603',PI/2],[-11,-4.4,'0402',0],[-12.2,-6,'0402',0],[-17,-6,'0402',0],[-9.9,5.6,'0402',0],[-8.6,6.1,'0402',PI/2],[-3.6,6.2,'0402',0],[-1.4,4,'0402',PI/2],[-1.6,-.6,'0402',PI/2],[-4.9,-3.4,'0603',0],[-7.1,-3.4,'0603',0],[-2.8,-4.6,'0402',0],[-9.5,-3,'0402',PI/2],[1.5,4.8,'0402',PI/2],[3.5,4.6,'0603',0],[3.5,3.4,'0603',0],[4.6,1.9,'0805',PI/2],[1,-3,'0402',0],[1,-4.4,'0402',0],[2.4,-5.4,'0402',PI/2],[-.6,-5.6,'0402',0],[9.3,-.2,'0402',0],[9.6,-4.2,'0402',PI/2],[11,-5.4,'0402',0],[12.6,1.6,'0402',PI/2],[13,-2.5,'0603',0],[18,-4.2,'0603',0],[18.4,-5.6,'0402',0],[15.3,.4,'0402',PI/2],[24.7,3.3,'0402',0],[24.7,2.3,'0402',0],[24.7,1.3,'0402',0],[24.9,-4,'0603',PI/2],[15.8,5.6,'0402',0],[12,5.5,'0603',0,1]])k.passive(x,y,s,{rz,res});
        // Traces between the chips (bundles of parallel lines with 45 degree bends).
        const bus=(a,b,n,sp)=>{for(let i=0;i<n;i++)k.route('traceNavy',[a[0],a[1]+i*sp],[b[0],b[1]+i*sp],.13);};
        bus([-19,-2.4],[-9.4,-1.4],4,.45);bus([-2,-1.6],[3.4,-3.4],4,.45);bus([7.8,-3.4],[19.1,-2.4],3,.5);bus([-27.8,-2],[-24.4,-2],6,.6);bus([-5.4,5.3],[6.5,6.2],2,.4);bus([8,1.2],[16.6,3.4],3,.45);
        for(let i=0;i<30;i++){const x=-27+rnd()*52,y=-6.6+rnd()*13.2;k.via(x,y,.2);}
      });
    });
    // ---------- Battery (part battery): 100 mAh pouch with a green protection board at the USB end ----------
    k.inPart('battery',()=>k.place({at:[-2.5,0,-3.6]},()=>{
      k.place({at:[2,0,0]},()=>k.battery(40,15,2.4,{skin:'foil',label:T.cell}));
      k.roundBox('boardGreen',[-20.2,0,1.1],[4,14.6,.6],.05,1);
      k.sot23(-20.6,3,{leads:6});k.passive(-20.2,-1,'0402');k.passive(-20.2,-3,'0402');
      for(const y of [4.5,-5.5])k.cyl('gold',[-19.6,y,1.4],.9,.06,20);
    }));
    // ---------- Implant (only in implant mode): an added board with hand-soldered wires ----------
    // It sits on the chip side, piggyback on top of the chips, because that side faces up at the end.
    // Same local coordinates as the chip side above (rx = 180 degrees).
    k.inPart('implant',()=>k.place({at:[0,0,BOT],rx:PI},()=>{
      k.roundBox('implantBoard',[-12,1,1.25],[9,6,.6],.08,1);
      k.place({at:[-12,1,1.55]},()=>{k.qfn(0,0,{w:3,d:3,pins:6});k.passive(2.8,1.6,'0402');k.passive(2.8,-1.6,'0402');k.passive(-3,1.8,'0603');k.crystal(-3,-1.5,{w:1.6,d:1.2});});
      // Red and black: power, stolen from the USB socket legs. Copper: tapped onto the data lines near the inductor.
      k.tube('wireRed',[[-16.4,2.6,1.6],[-20,3.6,2.4],[-26,4.3,2.4],[-31.5,4,.3]],.17);
      k.tube('wireBlack',[[-16.4,-.6,1.6],[-21,-2.6,2.3],[-27,-4.3,2.3],[-31.5,-4,.3]],.17);
      k.tube('wireGold',[[-7.6,1.6,1.6],[-2,4.3,2.4],[8,4,2.4],[15.3,1.3,.25]],.13);
    }));

    // OLED image: 128 x 64 white pixels on black, like the real dashboard.
    const screen=document.createElement('canvas');screen.width=128;screen.height=64;
    const c=screen.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,128,64);c.fillStyle='#eef3f4';c.textAlign='center';
    c.font='bold 13px monospace';c.fillText('Ledger Nano X',64,28);c.font='8px monospace';c.fillText('3D REFERENCE',64,46);
    c.font='bold 10px monospace';c.fillText('<',6,38);c.fillText('>',122,38);

    const parts=['coverTop','coverBottom','coverSpine','front','buttons','display','ribbon','pcb','battery','rear','implant'];
    return {name:this.name,...k.build(),atlas:A.canvas,screen:{canvas:screen,px:[128,64],kind:'oled'},
      partIds:makePartIds(parts),pcbParts:['pcb'],center:[15,0,0],startProgress:1,implantProgress:6,
      // Steps: 1 swivel swings open, 2 swivel slides off, 3 rear shell drops and the battery slides out,
      // 4 front frame lifts (buttons follow), 5 OLED lifts off its socket, 6 the board turns over.
      rig(p){
        const t={},s=i=>rigStep(p,i);
        const cover=Mat.mul(Mat.translation(PIVOT+10*s(1),17*s(1),10*s(1)),Mat.mul(Mat.rotZ(-PI*s(0)),Mat.translation(-PIVOT,0,0)));
        const spread=.8*Math.sin(s(1)*PI);
        t.coverTop=Mat.mul(cover,Mat.translation(0,0,spread));t.coverBottom=Mat.mul(cover,Mat.translation(0,0,-spread));t.coverSpine=cover;
        t.rear=Mat.translation(0,0,-16*s(2));t.battery=Mat.translation(0,-24*s(2),-7*s(2));
        t.front=Mat.translation(0,0,22*s(3));t.buttons=Mat.translation(0,0,30*s(3));
        t.display=Mat.translation(22*s(4),0,13*s(4));t.ribbon=t.display;
        t.pcb=Mat.mul(Mat.translation(0,0,.1),Mat.mul(Mat.rotX(PI*s(5)),Mat.translation(0,0,-.1)));t.implant=t.pcb;
        return t;
      }};
  }
};
