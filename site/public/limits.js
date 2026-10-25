// A slow provider must finish before its queue lease and browser request expire.
export const INFERENCE_TIMEOUT_MS=90000;
export const JOB_LEASE_MS=INFERENCE_TIMEOUT_MS+10000;
export const HOSTED_WAIT_MS=JOB_LEASE_MS+5000;
export const BROWSER_WAIT_MS=HOSTED_WAIT_MS+10000;
