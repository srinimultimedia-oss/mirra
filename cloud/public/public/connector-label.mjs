const fonts={sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'monospace'};
export function connectorLabelStyle(item,geometry,measure){
 const chosen=item.fontSize??14,fontFamily=fonts[item.fontFamily||'sans'],fontWeight=item.bold?'700':'400',fontStyle=item.italic?'italic':'normal';let size=chosen;
 if(item.autoFont){const available=Math.max(1,Math.hypot(geometry.b.x-geometry.a.x,geometry.b.y-geometry.a.y)),width=measure(item.text.replace(/\s+/gu,' '),size,{fontFamily,fontWeight,fontStyle});if(width>available)size*=available/width;}
 return{fontSize:size+'px',fontFamily,fontWeight,fontStyle,textDecoration:item.underline?'underline':'none',fill:item.textColor||'#22372f',textAnchor:item.textAlign==='left'?'start':item.textAlign==='right'?'end':'middle',strokeWidth:String(size<chosen?4*size/chosen:4)};
}
