export const MAX_REQUEST_BYTES=4_000_000;
const fault=(status:number,message:string)=>Object.assign(new Error(message),{status});

export async function readJSONObject(request:Request,{limit=MAX_REQUEST_BYTES}:{limit?:number}={}){
  if(!Number.isSafeInteger(limit)||limit<=0||limit>MAX_REQUEST_BYTES)throw Error('Invalid request byte limit');
  let reader:ReadableStreamDefaultReader<Uint8Array>|undefined;
  try{reader=request.body?.getReader();}catch{throw fault(400,'Request body could not be read');}
  if(!reader)throw fault(400,'Invalid JSON');
  const decoder=new TextDecoder('utf-8',{fatal:true}),parts:string[]=[],tooLarge=fault(413,'Request exceeds 4 MB');let bytes=0;
  try{
    for(;;){
      const chunk=await reader.read();if(chunk.done)break;
      bytes+=chunk.value.byteLength;
      if(bytes>limit)throw tooLarge;
      parts.push(decoder.decode(chunk.value,{stream:true}));
    }
    parts.push(decoder.decode());
  }catch(error){
    // Do not wait on a peer's cancellation handler before returning an error.
    void reader.cancel().catch(()=>{});
    if(error===tooLarge)throw tooLarge;
    throw fault(400,'Invalid or interrupted UTF-8 request body');
  }finally{reader.releaseLock();}
  let value;try{value=JSON.parse(parts.join(''));}catch{throw fault(400,'Invalid JSON');}
  if(!value||typeof value!=='object'||Array.isArray(value))throw fault(400,'Expected a JSON object');
  return value;
}
