const line=item=>item.type==='connector'||item.type==='pen';
export function selectionColor(item){return line(item)?item.stroke||item.fill:item.fill;}
export function applySelectionColor(board,ids,color){const selected=new Set(ids);return board.transact(doc=>{for(const item of doc.items)if(selected.has(item.id)&&!item.locked){item.fill=color;if(line(item))item.stroke=color;if(item.type==='text')item.background=true;}});}
