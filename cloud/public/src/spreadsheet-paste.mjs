export const MAX_SHEET_ROWS=50,MAX_SHEET_COLUMNS=100,MAX_SHEET_CELLS=5000,MAX_CELL_CHARACTERS=6000;
export const spreadsheetHint=(text,html='')=>/[\t\r\n]/.test(text)||/<table(?:\s|>)/i.test(html);
export function validateCellGrid(rows){
  if(!Array.isArray(rows)||!rows.length||rows.length>MAX_SHEET_ROWS||rows.some(row=>!Array.isArray(row)))throw Error('Paste 1–50 spreadsheet rows');
  const columns=rows[0]?.length;if(!columns||columns>MAX_SHEET_COLUMNS||rows.length*columns>MAX_SHEET_CELLS)throw Error('Paste up to 100 columns and 5,000 cells');
  for(const row of rows){if(row.length!==columns)throw Error('Spreadsheet rows must have the same number of columns');for(const cell of row)if(typeof cell!=='string'||[...cell].length>MAX_CELL_CHARACTERS)throw Error('Each cell can contain up to 6,000 characters');}return rows;
}
export function spreadsheetCells(text){
  if(typeof text!=='string'||!text.length)throw Error('Paste spreadsheet cells first');if(text.length>MAX_SHEET_CELLS*(MAX_CELL_CHARACTERS*2+4))throw Error('The pasted spreadsheet is too large');
  const rows=[];let row=[],cell='',length=0,quoted=false,closed=false;
  const append=value=>{if(++length>MAX_CELL_CHARACTERS)throw Error('Each cell can contain up to 6,000 characters');cell+=value;};
  const field=()=>{row.push(cell);if(row.length>MAX_SHEET_COLUMNS)throw Error('Paste up to 100 columns');cell='';length=0;closed=false;};
  const record=()=>{rows.push(row);if(rows.length>MAX_SHEET_ROWS)throw Error('Paste up to 50 rows');row=[];};
  for(let i=0;i<text.length;){let value=String.fromCodePoint(text.codePointAt(i));i+=value.length;
    if(quoted){if(value==='"'){if(text[i]==='"'){append('"');i++;}else{quoted=false;closed=true;}}else{if(value==='\r'){if(text[i]==='\n')i++;value='\n';}append(value);}continue;}
    if(value==='\t'){field();continue;}if(value==='\r'||value==='\n'){if(value==='\r'&&text[i]==='\n')i++;field();record();continue;}
    if(closed)throw Error('A quoted cell must end before the next separator');if(value==='"'&&!cell.length){quoted=true;continue;}append(value);
  }
  if(quoted)throw Error('Close the quoted cell before pasting notes');if(row.length||cell.length||closed||!/[\r\n]$/.test(text)){field();record();}
  const columns=Math.max(...rows.map(row=>row.length));for(const row of rows)while(row.length<columns)row.push('');validateCellGrid(rows);return rows;
}
