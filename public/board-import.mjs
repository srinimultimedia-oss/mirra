import {Board} from '../src/model.mjs';
export async function prepareBoardImport(file,{getContext,assertWritable,isCurrent=()=>true}){
 const original=getContext(),before=original.board.serialize();assertWritable();
 if(!Number.isFinite(file.size)||file.size<0||file.size>10*1024*1024)throw Error('The board file exceeds 10 MB');
 const text=await file.text();
 if(!isCurrent()){const error=Error('Import was cancelled or superseded');error.name='ImportCancelled';throw error;}
 const current=getContext();if(current.board!==original.board||current.scope!==original.scope)throw Error('The board or account changed. Choose the file again on the intended board.');
 assertWritable();if(current.board.serialize()!==before)throw Error('The board changed while reading the file. Review the latest board before importing again.');
 return Board.parse(text).doc;
}
