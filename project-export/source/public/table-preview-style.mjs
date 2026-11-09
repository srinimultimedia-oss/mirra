import {displayCell} from '../src/tables.mjs';
export const tablePreviewDefaults={fontSize:13,textColor:'#17253a',textAlign:'left'};
const fonts={sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'monospace'};
export function tablePreviewStyles(item,measure=(text,size)=>Array.from(text).length*size*.6){
 if(!['fontSize','fontFamily','textColor','textAlign','bold','italic','underline','autoFont'].some(key=>Object.hasOwn(item,key)))return null;
 const base=item.fontSize??13,fontFamily=fonts[item.fontFamily||'sans'],fontStyle=item.italic?'italic':'normal',weight=item.bold?'700':'400',headingWeight=item.bold===false?'400':'700',fields=item.table.fields.filter(f=>!f.hidden).slice(0,5),records=item.table.records.slice(0,5);let scale=1;
 if(item.autoFont){
  const width=Math.max(1,item.w-36),column=Math.max(1,width/Math.max(1,fields.length)-20),sized=(text,size,fontWeight=weight)=>measure(String(text),size,{fontFamily,fontStyle,fontWeight});
  const ratios=[width/Math.max(1,sized(item.text||'Table',base*18/13,headingWeight)),width/Math.max(1,sized(`${item.table.records.length} records · Double-click to edit`,base*5/6))];
  for(const field of fields){ratios.push(column/Math.max(1,sized(field.name,base*11/13,headingWeight)));for(const record of records)ratios.push(column/Math.max(1,sized(displayCell(field,record.cells[field.id])||'—',base)));}
  const height=36+base*(18/13+5/6+11/13+records.length)*1.35+22+(records.length+1)*20;
  scale=Math.min(1,...ratios,Math.max(1,item.h)/height);
 }
 const text={fontFamily,fontStyle,textAlign:item.textAlign||'left',textDecoration:item.underline?'underline':'none',lineHeight:'1.35'},color=item.textColor||tablePreviewDefaults.textColor;
 return{scale,container:{fontFamily,fontSize:base*scale+'px',color,padding:18*scale+'px'},title:{...text,fontSize:base*18/13*scale+'px',fontWeight:headingWeight,color,marginBottom:4*scale+'px'},caption:{...text,fontSize:base*5/6*scale+'px',fontWeight:weight,color:item.textColor||'#5d6f82',marginBottom:18*scale+'px'},header:{...text,fontSize:base*11/13*scale+'px',fontWeight:headingWeight,color,padding:9*scale+'px'},cell:{...text,fontSize:base*scale+'px',fontWeight:weight,color,padding:9*scale+'px'}};
}
