import {readFileSync,writeFileSync,appendFileSync,existsSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import {editor} from './src/ai.js';
import {diagnosticEvent} from './src/diagnostics.js';

mkdirSync('data',{recursive:true});
if(!existsSync('data/worker-token'))writeFileSync('data/worker-token',randomBytes(32).toString('hex'),{mode:0o600});
const token=readFileSync('data/worker-token','utf8').trim();
const base=process.env.IMPRINT_SITE_URL||'https://imprint-editing-desk.choggyacc.chatgpt.site';
if(base!=='https://imprint-editing-desk.choggyacc.chatgpt.site'&&!/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw Error('Unapproved site.');
const edit=editor(resolve('data/ai'));
function diagnostic(event,fields){
 const line=JSON.stringify(diagnosticEvent(event,fields));console.log(line);
 try{appendFileSync('data/worker-diagnostics.jsonl',line+'\n',{mode:0o600});}
 catch{console.log('Private diagnostic file unavailable.');}
}
async function remote(path,data){
 const r=await fetch(base+'/api/worker/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(data),redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Object.assign(Error('Worker request refused.'),{code:'worker_http_failed',status:r.status});
 return r.json();
}
let stop=false,connected=false;
const timer=setInterval(()=>remote('ping',{}).catch(()=>{}),5000);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stop=true;clearInterval(timer);});
console.log('Imprint worker connecting.');
while(!stop){
 try{
  const {job}=await remote('claim',{});
  if(!connected){console.log('Imprint worker connected.');connected=true;}
  if(job){
   const started=Date.now();diagnostic('job_started',{jobId:job.id});
   let completion;
   try{completion={jobId:job.id,failed:false,data:await edit(job.command)};}
   catch(error){
    diagnostic('job_failed',{jobId:job.id,durationMs:Date.now()-started,error});
    completion={jobId:job.id,failed:true};
   }
   try{
    await remote('complete',completion);
    diagnostic('job_delivered',{jobId:job.id,durationMs:Date.now()-started,failed:completion.failed});
   }catch(error){diagnostic('delivery_failed',{jobId:job.id,durationMs:Date.now()-started,failed:completion.failed,error});}
   job.command=null;completion=null;
  }
 }catch{if(connected){connected=false;console.log('Connection interrupted; reconnecting.');}}
 if(!stop)await new Promise(resolve=>setTimeout(resolve,1200));
}
edit.close();
