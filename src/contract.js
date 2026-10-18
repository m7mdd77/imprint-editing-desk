export class DomainError extends Error {constructor(code,message){super(message);this.code=code;}}
export function requireValue(value,code,message){if(!value)throw new DomainError(code,message);}
export function exactKeys(value,keys){requireValue(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('|')===[...keys].sort().join('|'),'shape','An unexpected field was refused.');}
export const DIRECTIONS=['clarity','rhythm','voice'];
export function validateCommand(c){
  exactKeys(c,['op','text','version','direction','protectedText','rejected']);
  requireValue(c.op==='suggest'&&typeof c.text==='string'&&c.text.trim().length>=80&&c.text.length<=6000,'document','Use a document between 80 and 6,000 characters.');
  requireValue(Number.isSafeInteger(c.version)&&c.version>=1&&DIRECTIONS.includes(c.direction),'context','The editing context is invalid.');
  requireValue(Array.isArray(c.protectedText)&&c.protectedText.length<=8&&c.protectedText.every(q=>typeof q==='string'&&q.length>=4&&q.length<=1000&&c.text.includes(q)),'protected','Protected wording must match the document exactly.');
  requireValue(Array.isArray(c.rejected)&&c.rejected.length<=8&&c.rejected.every(q=>typeof q==='string'&&q.length<=800),'rejected','Revision history is too large.');
  return c;
}
export function validateSuggestion(s,c){
  validateCommand(c);exactKeys(s,['decision','before','after','reason','inferredIntent']);
  requireValue(['edit','done'].includes(s.decision)&&typeof s.reason==='string'&&s.reason.length>=5&&s.reason.length<=300&&typeof s.inferredIntent==='string'&&s.inferredIntent.length>=5&&s.inferredIntent.length<=200,'proposal','The editorial note is invalid.');
  if(s.decision==='done'){requireValue(s.before===null&&s.after===null,'proposal','A finished proof cannot include a patch.');return s;}
  requireValue(typeof s.before==='string'&&s.before.length>=12&&s.before.length<=800&&typeof s.after==='string'&&s.after.trim().length>=5&&s.after.length<=1000&&s.before!==s.after,'patch','The proposed edit is invalid.');
  const at=c.text.indexOf(s.before);requireValue(at>=0&&c.text.indexOf(s.before,at+1)===-1,'anchor','The quoted passage must occur exactly once.');
  requireValue(!c.rejected.includes(s.before),'rejected','That passage was already kept by the editor.');
  for(const q of c.protectedText){let pos=-1;while((pos=c.text.indexOf(q,pos+1))!==-1)requireValue(at+s.before.length<=pos||at>=pos+q.length,'protected','The suggestion touches protected wording.');}
  // Numbers must survive an edit verbatim; literary meaning still needs human review.
  const numbers=x=>(x.match(/\d+(?:[.,]\d+)*/g)||[]).sort().join('|');
  requireValue(numbers(s.before)===numbers(s.after),'numbers','The suggestion changes a number. Review that passage manually.');
  return s;
}
export function applyEdit(doc,proposal){
  requireValue(proposal.version===doc.version&&proposal.baseText===doc.text,'stale','The document changed. This suggestion has been set aside.');
  const c={op:'suggest',text:doc.text,version:doc.version,direction:doc.direction,protectedText:doc.protectedText,rejected:doc.rejected};validateSuggestion(proposal.suggestion,c);
  requireValue(proposal.suggestion.decision==='edit','patch','There is no edit to apply.');
  const{before,after}=proposal.suggestion,at=doc.text.indexOf(before);
  return{...doc,text:doc.text.slice(0,at)+after+doc.text.slice(at+before.length),version:doc.version+1};
}
