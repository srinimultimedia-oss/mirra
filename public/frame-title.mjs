export const frameTitleDefaults={fontSize:16,textColor:'#4d665c',textAlign:'left'};
const fonts={sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'monospace'};
export function frameTitleStyle(item,measure){
 const family=fonts[item.fontFamily||'sans'],weight=item.bold?'700':'400',fontStyle=item.italic?'italic':'normal';
 let size=item.fontSize??frameTitleDefaults.fontSize;
 if(item.autoFont){const text=(item.text||'Frame').replace(/\s+/gu,' '),width=measure(text,size,{fontFamily:family,fontWeight:weight,fontStyle});if(width>item.w)size*=item.w/width;}
 const alignment=item.textAlign||frameTitleDefaults.textAlign;
 return{x:alignment==='right'?item.w:alignment==='center'?item.w/2:0,textAnchor:alignment==='right'?'end':alignment==='center'?'middle':'start',fontSize:size+'px',fontFamily:family,fontWeight:weight,fontStyle,textDecoration:item.underline?'underline':'none',fill:item.textColor||frameTitleDefaults.textColor};
}
