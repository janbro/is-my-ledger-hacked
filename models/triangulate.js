'use strict';
/* Triangulate: turns a flat outline (with optional holes) into triangles.
 * Used for circuit boards with screw holes, cases with button holes, screens with round corners.
 *
 * How it works ("ear clipping"):
 *  1. Each hole is joined to the outline by a thin cut (a "bridge").
 *     After that the shape is one single polygon.
 *  2. A corner whose triangle contains no other point is an "ear".
 *     We cut ears off one by one until only one triangle is left.
 *
 * Input: outer = [[x,y],...], holes = [[[x,y],...], ...].
 * Output: a list of triangles, each [[x,y],[x,y],[x,y]]. */
const Triangulate=(()=>{
  const area=p=>{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a/2;};
  const same=(a,b)=>Math.abs(a[0]-b[0])<1e-7&&Math.abs(a[1]-b[1])<1e-7;
  // Removes repeated neighbour points (rounded-corner outlines with radius 0 contain them).
  const clean=p=>p.filter((q,i)=>!same(q,p[(i+1)%p.length]));
  // > 0 when a -> b -> c turns left (counter-clockwise).
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const dist2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
  // True only when the two segments really cross (touching at an end does not count).
  function crosses(a,b,c,d){
    const d1=cross(c,d,a),d2=cross(c,d,b),d3=cross(a,b,c),d4=cross(a,b,d);
    return (d1>0&&d2<0||d1<0&&d2>0)&&(d3>0&&d4<0||d3<0&&d4>0);
  }
  const hitsEdges=(M,P,poly)=>{for(let j=0;j<poly.length;j++)if(crosses(M,P,poly[j],poly[(j+1)%poly.length]))return true;return false;};

  // Joins one hole to the polygon with a bridge from the hole's rightmost point
  // to the closest polygon point that can be reached without crossing any edge.
  function bridge(poly,hole,others){
    let m=0;for(let i=1;i<hole.length;i++)if(hole[i][0]>hole[m][0])m=i;
    const M=hole[m],order=poly.map((p,i)=>i).sort((a,b)=>dist2(poly[a],M)-dist2(poly[b],M));
    let pick=order[0];
    for(const i of order){
      const P=poly[i];
      if(!hitsEdges(M,P,poly)&&!hitsEdges(M,P,hole)&&!others.some(h=>hitsEdges(M,P,h))){pick=i;break;}
    }
    // The new polygon walks to P, around the whole hole (starting and ending at M), then back to P.
    const loop=[...hole.slice(m),...hole.slice(0,m+1)];
    return [...poly.slice(0,pick+1),...loop,...poly.slice(pick)];
  }

  // A point inside (or on the edge of) the counter-clockwise triangle a, b, c.
  const inside=(p,a,b,c)=>cross(a,b,p)>=0&&cross(b,c,p)>=0&&cross(c,a,p)>=0;

  function earClip(points){
    const pts=points.slice(),out=[];let i=0,misses=0;
    while(pts.length>3){
      if(misses>pts.length){
        // No clean ear found (bad input). Cut a corner anyway so we never loop forever.
        out.push([pts[pts.length-1],pts[0],pts[1]]);pts.splice(0,1);misses=0;continue;
      }
      i%=pts.length;
      const a=pts[(i+pts.length-1)%pts.length],b=pts[i],c=pts[(i+1)%pts.length],k=cross(a,b,c);
      // A straight (or folded-back) corner adds no area. Just drop the middle point.
      if(Math.abs(k)<1e-10){pts.splice(i,1);misses=0;continue;}
      let ear=k>0;
      if(ear)for(const q of pts){
        // Skip the corners themselves, and their twins (bridges repeat two points).
        if(q===a||q===b||q===c||same(q,a)||same(q,b)||same(q,c))continue;
        if(inside(q,a,b,c)){ear=false;break;}
      }
      if(ear){out.push([a,b,c]);pts.splice(i,1);misses=0;}
      else{i++;misses++;}
    }
    if(pts.length===3)out.push(pts);
    return out;
  }

  function run(outer,holes=[]){
    let poly=clean(outer);if(area(poly)<0)poly.reverse();          // outline: counter-clockwise
    const hs=holes.map(h=>{const c=clean(h);if(area(c)>0)c.reverse();return c;}) // holes: clockwise
      .sort((a,b)=>Math.max(...b.map(p=>p[0]))-Math.max(...a.map(p=>p[0])));
    hs.forEach((h,i)=>{poly=bridge(poly,h,hs.slice(i+1));});
    return earClip(poly);
  }
  return {run,area};
})();
