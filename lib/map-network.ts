// A connected, sparse network: unlike nearest-neighbour pairs, no island is left out.
export function spanningLinks(points: {x:number;y:number}[]): [number,number][] {
  if(points.length<2)return [];
  const included=new Set([0]),best=points.map(()=>Infinity),parent=points.map(()=>0);
  const edges:[number,number][]=[];
  let last=0;
  while(included.size<points.length){
    for(let i=0;i<points.length;i++)if(!included.has(i)){
      const distance=(points[i].x-points[last].x)**2+(points[i].y-points[last].y)**2;
      if(distance<best[i]){best[i]=distance;parent[i]=last;}
    }
    let next=-1;
    for(let i=0;i<points.length;i++)if(!included.has(i)&&(next<0||best[i]<best[next]))next=i;
    edges.push([parent[next],next]);included.add(next);last=next;
  }
  return edges;
}
