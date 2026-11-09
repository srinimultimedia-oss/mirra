// Layout uses an injected text measurer so browser fonts can be measured without
// putting DOM or canvas dependencies in the model/test runtime.
export function wrappedLines(text,width,size,measure){
  let count=0;
  for(const paragraph of text.split('\n')){
    let line='';count++;
    for(const token of paragraph.match(/\S+|\s+/gu)||[]){
      if(measure(line+token,size)<=width){line+=token;continue;}
      if(!token.trim()){if(line)line+=' ';continue;}
      if(line.trim()){count++;line='';}
      for(const char of token){const candidate=line+char;if(line&&measure(candidate,size)>width){count++;line=char;}else line=candidate;}
    }
  }
  return count;
}
export function autoFontSize(text,width,height,measure,{min=2,max=32}={}){
  let lo=min,hi=max,best=min;
  while(lo<=hi){const size=Math.floor((lo+hi)/2);if(wrappedLines(text,Math.max(1,width),size,measure)*size*1.35<=height){best=size;lo=size+1;}else hi=size-1;}
  return best;
}
