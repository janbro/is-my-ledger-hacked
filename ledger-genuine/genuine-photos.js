'use strict';
/* Official reference photos of GENUINE Ledger hardware.
 * Source: Ledger's "Check hardware integrity" support article (all 38 images).
 * https://support.ledger.com/article/4404382029329-zd
 * Downloaded 13 Oct 2026. The photos belong to Ledger.
 *
 * The quiz uses them two ways:
 *  - As "no, looks genuine" rounds (only photos with opened:true, since the game is about opened devices).
 *  - As a "what genuine looks like" gallery, shown after a wrong answer.
 *
 * Paths are relative to the HTML page. Keep this folder next to the HTML file.
 * opened:false marks outside views (front and back of the closed device).
 * The original Nano S is not in Ledger's article, so it has no entry here.
 */
const GENUINE_SOURCE='https://support.ledger.com/article/4404382029329-zd';

const GENUINE_DEVICES={
 'stax':{name:'Ledger Stax',photos:[
  {file:'stax/front.jpg',caption:'Front of the closed device',opened:false},
  {file:'stax/back.jpg',caption:'Back of the closed device',opened:false},
  {file:'stax/disassembled-1.jpg',caption:'Disassembled view',opened:true},
  {file:'stax/disassembled-2.jpg',caption:'Disassembled view, second angle',opened:true},
  {file:'stax/nfc-antenna-variants.jpg',caption:'The 2 official NFC antenna variants',opened:true},
  {file:'stax/pcb-front.jpg',caption:'Circuit board, front (Rev 4.1)',opened:true},
  {file:'stax/pcb-back.jpg',caption:'Circuit board, back',opened:true}]},
 'flex':{name:'Ledger Flex',photos:[
  {file:'flex/front.jpg',caption:'Front of the closed device',opened:false},
  {file:'flex/back.jpg',caption:'Back of the closed device',opened:false},
  {file:'flex/disassembled-1.jpg',caption:'Disassembled view',opened:true},
  {file:'flex/disassembled-2.jpg',caption:'Disassembled view, second angle',opened:true},
  {file:'flex/frame-removed-front.jpg',caption:'Aluminium frame removed, front',opened:true},
  {file:'flex/frame-removed-back.jpg',caption:'Aluminium frame removed, back',opened:true},
  {file:'flex/pcb-front.jpg',caption:'Circuit board, front',opened:true},
  {file:'flex/pcb-back.jpg',caption:'Circuit board, back',opened:true}]},
 'nano-gen5':{name:'Ledger Nano Gen5',photos:[
  {file:'nano-gen5/front.jpg',caption:'Front of the closed device',opened:false},
  {file:'nano-gen5/back.jpg',caption:'Back of the closed device',opened:false},
  {file:'nano-gen5/disassembled-1.jpg',caption:'Disassembled view',opened:true},
  {file:'nano-gen5/disassembled-2.jpg',caption:'Disassembled view, second angle',opened:true},
  {file:'nano-gen5/pcb-front.jpg',caption:'Circuit board, front',opened:true},
  {file:'nano-gen5/pcb-back.jpg',caption:'Circuit board, back',opened:true}]},
 'nano-x':{name:'Ledger Nano X',photos:[
  {file:'nano-x/front.jpg',caption:'Front of the closed device',opened:false},
  {file:'nano-x/back.jpg',caption:'Back of the closed device',opened:false},
  {file:'nano-x/disassembled-1.jpg',caption:'Disassembled view: guard, case, board, screen, battery',opened:true},
  {file:'nano-x/disassembled-2.jpg',caption:'Disassembled view, second angle',opened:true},
  {file:'nano-x/pcb-rev4-green-front.jpg',caption:'Board revision 4 (green), front',opened:true},
  {file:'nano-x/pcb-rev4-green-back.jpg',caption:'Board revision 4 (green), back',opened:true},
  {file:'nano-x/pcb-rev3-black-front.jpg',caption:'Board revision 3 (black), front',opened:true},
  {file:'nano-x/pcb-rev3-black-back.jpg',caption:'Board revision 3 (black), back',opened:true},
  // Ledger's article only shows the back of revision 2.
  {file:'nano-x/pcb-rev2-black-back.png',caption:'Board revision 2 (black), back',opened:true},
  {file:'nano-x/pcb-rev1-black-front.jpg',caption:'Board revision 1 (black), front',opened:true},
  {file:'nano-x/pcb-rev1-black-back.jpg',caption:'Board revision 1 (black), back',opened:true}]},
 'nano-s-plus':{name:'Ledger Nano S Plus',photos:[
  {file:'nano-s-plus/front.jpg',caption:'Front of the closed device',opened:false},
  {file:'nano-s-plus/back.jpg',caption:'Back of the closed device',opened:false},
  {file:'nano-s-plus/disassembled-1.jpg',caption:'Disassembled view',opened:true},
  {file:'nano-s-plus/disassembled-2.jpg',caption:'Disassembled view, second angle',opened:true},
  {file:'nano-s-plus/pcb-front.jpg',caption:'Circuit board, front',opened:true},
  {file:'nano-s-plus/pcb-back.jpg',caption:'Circuit board, back',opened:true}]}
};
