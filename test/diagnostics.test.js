import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyProviderFailure,diagnosticEvent} from '../src/diagnostics.js';

test('diagnostics distinguish upstream refusals from transport failures',()=>{
 for(const [message,category] of [
  ['Incomplete response returned, reason: content_filter','content_filter'],
  ['rate limit exceeded: Sol in eastus2 exceeded token rate limit','rate_limit'],
  ['HTTP 401 Unauthorized','authentication'],['402 insufficient balance','quota'],
  ['stream disconnected before completion','connection'],['request timed out','timeout']
 ])assert.equal(classifyProviderFailure(message),category);
});
test('private diagnostics never copy arbitrary errors, credentials, documents or headers',()=>{
 const privateValue='sk-test-credential-and-private-document';
 const entry=diagnosticEvent('job_failed',{
  jobId:privateValue,durationMs:23,error:{code:privateValue,providerFailure:privateValue,message:privateValue,stack:privateValue,headers:{Authorization:privateValue}},document:privateValue
 });
 assert.equal(entry.code,'unknown');assert.equal(entry.providerFailure,'unknown');
 assert.equal(entry.durationMs,23);assert.ok(!JSON.stringify(entry).includes(privateValue));
 assert.ok(!('jobId' in entry));assert.ok(!('document' in entry));
});
test('worker events correlate a failure and a completed failure notification without calling it an edit',()=>{
 const jobId='11111111-1111-4111-8111-111111111111';
 const failure=diagnosticEvent('job_failed',{jobId,error:{code:'client_request_failed',providerFailure:'rate_limit'}});
 const delivered=diagnosticEvent('job_delivered',{jobId,failed:true});
 assert.equal(failure.jobId,delivered.jobId);assert.equal(failure.providerFailure,'rate_limit');
 assert.equal(delivered.failed,true);assert.ok(!('suggestion' in delivered));
 const transport=diagnosticEvent('delivery_failed',{jobId,error:{code:'worker_http_failed',status:409}});
 assert.equal(transport.httpStatus,409);assert.equal(transport.code,'worker_http_failed');
});
