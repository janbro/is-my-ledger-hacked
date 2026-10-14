'use strict';
/* Ledger Stax, rebuilt from Ledger's own photos (support article "Check hardware integrity"):
 *   ledger-genuine/stax/front.jpg, back.jpg, disassembled-1.jpg, disassembled-2.jpg,
 *   nfc-antenna-variants.jpg, pcb-front.jpg, pcb-back.jpg.
 * Size: 85 x 54 x 6 mm (credit-card size). Curved 400 x 672 E Ink screen. Qi wireless charging.
 *
 * Layout: X = width, Y = height (USB-C at the bottom, -Y), Z = thickness, screen facing +Z.
 * The E Ink screen wraps round the left edge (the "spine", a half circle of radius 3 mm at x = -24)
 * and shows a thin strip on the back. Stack from the front: E Ink screen, aluminium chassis,
 * circuit board (stax-board.js), steel bracket, battery, charging coil, back cover.
 * Hidden fits are approximate: this is a photo-based reconstruction, not Ledger's CAD. */
DEVICE_MODELS.stax={
  label:'Stax',name:'Ledger Stax',
  note:"Ledger Stax, rebuilt from Ledger's photos.",
  implantNote:"Modelled on MagicalTux's photos of a real implanted Stax: a second board with a chip and a modem can on the board's screen side, a black flex tapping the battery, and an antenna patch inside the back cover. The fit is approximate.",
  create(){
    const k=new MeshKit(),A=new Atlas(),PI=Math.PI;
    // The screen image is one strip, unrolled: back strip (1.4 mm), spine (half circle), front (49.6 mm).
    const R=3,XS=-24,YH=41,BACKX=-22.6,LEN=1.4+PI*R+49.6,u=s=>s/LEN,v=y=>(y+YH)/(2*YH);
    const BODY=Outline.rectFn(51,85,[0,4,5.5,0],8,1.5,0),FRONT=Outline.rect(49.6,2*YH,[0,2.8,4.3,0],6,.8,0);
    const t=(s,w,h,o={})=>A.text(s,{w,h,weight:700,...o});
    const T={
      lLogo:A.logo({w:256,h:256}),ledgerWord:A.logo({w:740,h:235,word:'LEDGER',line:12,arm:52}),rev:t('Rev. 4.1',400,100),
      ul:t(['⚠  1523','UL  S WH-1','94V-0 E170968','BEH11 0620981M','30.1'],534,444,{align:'left'}),qrBoard:A.qrLabel(51,{w:220,h:208,text:'5103016000000005'}),
      sDisplay:t('Display',400,108),sBattery:t('Battery',400,108),sOnOff:t('ON/OFF',400,108),sNfc:t('NFC',400,108),sTouch:t('TOUCH',400,108),sBt:t('BT',120,80),sPlus:t('+',90,60),
      tp300:t('TP300',260,70),tp409:t('TP409',260,70),tp101:t('TP101',260,70),tp702:t('TP702',260,70),tp601:t('TP601',260,70),tp700:t('TP700',260,70),tp100:t('TP100',260,70),tp105:t('TP105',260,70),
      r416:t(['R416','R417'],240,160),xtal:t('T320',160,60),
      // The processor marking is not readable on Ledger's photo. This is placeholder text.
      mcu:A.text(['ST','32WB55','PHL 342'],{w:400,h:302}),
      backText:A.text(['LEDGER STAX - 2024','SN: 0UF442F007','Model: 2103 - Made in Vietnam'],{w:708,h:176,align:'left',weight:500}),
      marks:A.marks({w:480,h:150,ukca:true}),qrYellow:A.qrLabel(52,{w:200,h:212,text:'STX-24'}),
      cell:A.text(['+ 1ICP4/39/45','LP453945PPI  3.8V','200mAh  0.76Wh'],{w:640,h:240,weight:600})
    };

    // ---------- Frame (part frame, stays): aluminium band, spine end caps, side button, chassis ----------
    k.inPart('frame',()=>{
      // The cut-out must stay inside the face after the 0.45 mm edge rounding. On the spine side
      // (x = -24) it starts at x = -23.2. A thinner wall broke the face fill into one huge stray triangle.
      k.slab('aluGray',BODY,[Outline.rect(49,82.6,[0,2.8,4.3,0],8,1.3,0)],-2.95,2.95,{top:.45,bottom:.45,seg:3});
      const half=[];for(let i=0;i<=16;i++){const a=PI/2+i/16*PI;half.push([R*Math.cos(a),R*Math.sin(a)]);}
      for(const s of [1,-1])k.place({at:[XS,s*42.5,0],rx:s*PI/2},()=>k.slab('aluGray',half,[],0,1.2));
      k.roundBox('aluGray',[27.3,28,0],[.8,12,2.2],.35,2); // side button
      k.slab('aluSilver',Outline.rect(49.2,74.3,[0,2.6,4.1,0],6,.9,4.15),[],1.1,2.38);
      // Parts on the back of the chassis (photo disassembled-2.jpg, seen from the back). D() turns photo pixels into mm.
      const D=(px,py)=>[(px-595)*.214,42.5-(py-345)*.2125];
      k.place({at:[0,0,1.1],ry:PI},()=>{
        const box=(mat,p,w,h,z,th)=>k.roundBox(mat,[p[0],p[1],z],[w,h,th],.2,1);
        box('kapton',D(580,567),30,30.8,.03,.06);box('flexBlack',D(600,547),6.4,22.3,.07,.04); // E Ink flex and its black stiffener
        box('kapton',D(582,640),9.6,8.4,.03,.06);box('chip',D(582,642),4,4,.25,.4);           // the screen driver chip on its flex
        for(const p of [D(515,356),D(615,356)]){box('chip',p,6.4,2.6,.3,.6);k.roundBox('nickel',[p[0],p[1],.62],[5.6,1.8,.04],.1,1);} // magnets
        const disc=D(535,410);k.cyl('nickel',[disc[0],disc[1],0],3.8,.3,32);
        const q=D(626,435);box('pouchYellow',q,6,6.4,.03,.06);k.label('labelInk',q[0],q[1],.065,5.4,5.7,T.qrYellow);
        box('rubber',D(487,425),3.2,19.1,.3,.6);                                                 // gasket behind the side button
      });
    });
    // ---------- Curved E Ink screen (part display, stays) ----------
    k.inPart('display',()=>{
      k.slab('displayBack',FRONT,[],2.4,2.995);
      k.screen('eink',FRONT,3,(x,y)=>[u(1.4+PI*R+(x-XS)),v(y)]);
      const N=28,O=(a,y,r)=>[XS+r*Math.cos(a),y,r*Math.sin(a)],n=(a,s=1)=>[s*Math.cos(a),0,s*Math.sin(a)];
      for(let i=0;i<N;i++){
        const a0=PI/2+i/N*PI,a1=PI/2+(i+1)/N*PI,s0=1.4+(1.5*PI-a0)*R,s1=1.4+(1.5*PI-a1)*R;
        k.quad('eink',O(a0,-YH,R),O(a1,-YH,R),O(a1,YH,R),O(a0,YH,R),n(a0),n(a1),n(a1),n(a0),[u(s0),v(-YH)],[u(s1),v(-YH)],[u(s1),v(YH)],[u(s0),v(YH)]);
        k.quad('displayBack',O(a0,-YH,2.4),O(a1,-YH,2.4),O(a1,YH,2.4),O(a0,YH,2.4),n(a0,-1),n(a1,-1),n(a1,-1),n(a0,-1));
        for(const s of [-1,1])k.quad('displayBack',O(a0,s*YH,2.4),O(a1,s*YH,2.4),O(a1,s*YH,R),O(a0,s*YH,R),[0,s,0]);
      }
      // The strip of screen that shows on the back, then the dark band next to it.
      k.quad('eink',[XS,-YH,-3],[BACKX,-YH,-3],[BACKX,YH,-3],[XS,YH,-3],[0,0,-1],null,null,null,[u(1.4),v(-YH)],[u(0),v(-YH)],[u(0),v(YH)],[u(1.4),v(YH)]);
      k.slab('displayBack',Outline.rect(1.4,2*YH,0,1,(XS+BACKX)/2,0),[],-2.995,-2.4);
      k.slab('displayEdge',Outline.rect(6.2,2*YH,0,1,(BACKX-16.4)/2,0),[],-3,-2.4);
    });
    // ---------- Back cover: [L] logo, printed details and regulatory marks ----------
    k.inPart('back',()=>{
      k.slab('backPlastic',Outline.rectFn(42.2,82.6,[0,2.8,4.3,0],8,4.7,0),[],-3,-2.4,{bottom:.25,seg:2});
      k.place({at:[0,0,-3.006],ry:PI},()=>{k.label('labelInk',-17.7,33.3,0,9.7,9.7,T.lLogo);k.label('etchLight',-12.85,-29.8,0,17.7,4.4,T.backText);k.label('etchLight',-11.5,-34.6,0,15.4,4.8,T.marks);});
    });
    // ---------- Qi charging coil: orange film, copper spiral, black ferrite sheet, flat tail ----------
    k.inPart('coil',()=>{
      k.slab('kapton',Outline.circle(19,64,1.5,14),[],-2.4,-2.34);k.slab('ferrite',Outline.circle(17.5,64,1.5,14),[],-2.34,-2.24);
      k.place({at:[0,0,-2.4],ry:PI},()=>{k.coilRound(-1.5,14,0,4.5,18.5,13,'copper');for(const dx of [-1.2,1.2])k.cyl('copper',[-1.5+dx,14,0],.8,.05,16);});
      k.strip('kapton',[[-10.5,-1],[-13,-5],[-13,-14],[-15.5,-16.5]],3.2,-2.4,.06);
      k.roundBox('nickel',[-15.5,-16.5,-2.3],[3.4,3,.12],.1,1);
    });
    // ---------- Battery: yellow pouch (200 mAh), printed label on the back, black protection board ----------
    k.inPart('battery',()=>{
      k.place({at:[1.5,25,-2.2]},()=>k.battery(37,28,3.2,{skin:'pouchYellow'}));
      // Local +z points out of the battery's back face here. The QR is printed flat, so it does not touch the coil.
      k.place({at:[1.5,25,-2.2],ry:PI},()=>{k.label('labelInk',3,1,.012,22,8.25,T.cell);k.roundBox('paper',[-11.5,0,.01],[5.5,5.8,.02],0,0);k.label('labelInk',-11.5,0,.025,4.9,5.2,T.qrYellow);});
      k.roundBox('flexBlack',[1.5,10.3,.2],[30,1.4,.6],.1,1);for(const x of [-8,-4,8])k.roundBox('gold',[x,10.3,.52],[1.6,.9,.04],0,0);
      k.ribbon('flexBlack',[[-12,10.3,.45],[-13,9,.9],[-13.04,7.5,1],[-13.04,6.4,.98]],2.4,.1,[1,0,0]);
    });
    // ---------- Steel bracket over the board's shield frame ----------
    k.inPart('bracket',()=>{
      k.slab('zinc',[[-14.5,-21.8],[18,-21.8],[18,6.2],[-3.8,6.2],[-3.8,3.4],[-14.5,3.4]],[Outline.circle(1.5,24,4.45,-15.97)],-2.2,-1.95);
      for(const [x,y,r] of [[-6.6,6.85,1.25],[18.2,6.32,.6],[17,-25.6,.6]])k.slab('zinc',Outline.circle(r+1.1,24,x,y),[Outline.circle(r,20,x,y)],-2.18,-1.97);
      k.place({at:[0,0,-2.2],ry:PI},()=>{k.roundBox('aluDark',[-4,-7.5,.04],[20,18,.08],.6,1);k.roundBox('aluSilver',[8.5,-1,.03],[6,8,.06],.2,1);});
    });
    // ---------- Circuit board (stax-board.js) ----------
    k.inPart('pcb',()=>buildStaxBoard(k,T));
    // ---------- Implant (only in implant mode), from MagicalTux's photos (see models/implants.js) ----------
    // A second board on the screen side of the circuit board, and an antenna patch inside the back cover.
    // The old made-up modem on the back side was replaced by this real design.
    k.inPart('implant',()=>k.place({at:[0,0,STAX_BOARD.TOP]},()=>buildStaxImplant(k)));
    k.inPart('implantCover',()=>buildStaxImplantCover(k,A));

    // E Ink screen image (512 x 695): back strip, spine with the device name, front with Ledger's onboarding text.
    const screen=document.createElement('canvas');screen.width=512;screen.height=695;
    const c=screen.getContext('2d'),X=s=>u(s)*512,front=X(1.4+PI*R);c.fillStyle='#dcdcd6';c.fillRect(0,0,512,695);
    c.save();c.translate((X(1.4)+front)/2,348);c.rotate(-PI/2);c.fillStyle='#2b2c2e';c.font='600 26px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Ledger Stax',0,0);c.restore();
    c.fillStyle='#55565a';c.font='34px Arial, sans-serif';c.textAlign='left';c.fillText('←',front+28,60);
    c.font='29px Arial, sans-serif';['Your crypto and other','digital assets are','stored on the','blockchain.'].forEach((l,i)=>c.fillText(l,front+28,150+i*36));
    c.fillStyle='#141517';['To own and manage','these assets, you need','the private keys linked','to them.'].forEach((l,i)=>c.fillText(l,front+28,350+i*36));
    c.fillStyle='#6a6b6e';c.font='22px Arial, sans-serif';c.textAlign='center';c.fillText('Tap to continue',(front+512)/2,660);

    const parts=['display','frame','back','coil','battery','bracket','pcb','implant','implantCover'];
    return {name:this.name,...k.build(),atlas:A.canvas,screen:{canvas:screen,px:[512,695],kind:'eink'},
      partIds:makePartIds(parts),pcbParts:['pcb'],center:[4,25,0],startProgress:0,implantProgress:6,
      // Steps: 1 the device turns over (back up), 2 the back cover opens like a book, 3 the charging coil,
      // 4 the battery, 5 the bracket, 6 the circuit board lifts out (it stays back side up). Parts are laid out on the table.
      rig(p){
        const t={},s=i=>rigStep(p,i),f=s(0);
        const F=Mat.mul(Mat.translation(0,0,8*Math.sin(PI*f)),Mat.rotY(PI*f));
        // Moves a part by (dx,dy) and lowers it onto the table. zTop = its highest point before the flip.
        const lay=(v,dx,dy,zTop)=>Mat.mul(Mat.translation(dx*v,dy*v,(-3+zTop)*v+14*Math.sin(PI*v)),F);
        // The back cover swings open over the side button edge (a hinge line at x = -29, z = 3 after the flip),
        // like a book page, so its inside faces up. Then it drops 6 mm onto the table.
        // The antenna cable runs to that edge, as in MagicalTux's photo.
        const book=v=>Mat.mul(Mat.translation(-29,0,3-6*v),Mat.mul(Mat.rotY(-PI*v),Mat.mul(Mat.translation(29,0,-3),F)));
        t.display=t.frame=F;
        // The coil moved to the other side of the table: the open cover now lies where it was.
        t.back=t.implantCover=book(s(1));t.coil=lay(s(2),55.5,-4,-2.24);t.battery=lay(s(3),-50.5,34,1);
        t.bracket=lay(s(4),1.75,69.8,-1.95);
        // The board keeps its stock orientation: back side up, just as it sits under the back cover.
        // The implant board is on the screen side, so it ends up underneath. Spin the model to see it.
        // zTop 2.3 is the top of the implant's metal can, so the implant does not sink into the table.
        t.pcb=t.implant=lay(s(5),55.6,83,2.3);
        return t;
      }};
  }
};
