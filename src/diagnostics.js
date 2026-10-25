const providerCategories=new Set(['content_filter','rate_limit','authentication','quota','timeout','connection','unknown']);
const errorCodes=new Set(['client_request_failed','client_unavailable','provider_timeout','invalid_output','invalid_model','provider','offline','allowance','configuration','shape','document','context','protected','rejected','proposal','patch','anchor','numbers','stale','worker_http_failed']);
const events=new Set(['job_started','job_failed','job_delivered','delivery_failed']);

// Classification only: raw provider messages must never cross the diagnostic boundary.
export function classifyProviderFailure(message){
 const text=String(message??'');
 if(/content_filter/i.test(text))return 'content_filter';
 if(/rate[\s_-]*limit|\b429\b/i.test(text))return 'rate_limit';
 if(/unauthori[sz]ed|authentication|permission denied|\b40[13]\b/i.test(text))return 'authentication';
 if(/insufficient|balance|quota|\b402\b/i.test(text))return 'quota';
 if(/timed?\s*out|timeout/i.test(text))return 'timeout';
 if(/connection|stream disconnected/i.test(text))return 'connection';
 return 'unknown';
}
export function failureDetails(error){
 const result={code:errorCodes.has(error?.code)?error.code:'unknown',providerFailure:providerCategories.has(error?.providerFailure)?error.providerFailure:'unknown'};
 const status=error?.status??error?.httpStatus;
 if(result.code==='worker_http_failed'&&Number.isInteger(status)&&status>=400&&status<=599)result.httpStatus=status;
 return result;
}
export function diagnosticEvent(event,{jobId,durationMs,error,failed}={}){
 if(!events.has(event))throw Error('Unknown diagnostic event.');
 const result={at:new Date().toISOString(),event};
 if(typeof jobId==='string'&&/^[a-f0-9-]{36}$/.test(jobId))result.jobId=jobId;
 if(Number.isSafeInteger(durationMs)&&durationMs>=0)result.durationMs=durationMs;
 if(typeof failed==='boolean')result.failed=failed;
 if(error)Object.assign(result,failureDetails(error));
 return result;
}
