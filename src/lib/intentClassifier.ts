export type IntentRisk = 'safe' | 'suspicious' | 'critical';

const SUSPICIOUS_KEYWORDS = [
  // urgency / panic
  'quick',
  'hurry',
  'now',
  'urgent',
  'immediately',

  // uncertainty
  'not sure',
  'maybe',
  'try',
  'attempt',
  'guess',

  // repeated access / anxiety
  'again',
  'retry',
  'why not working',
  'failed',
  'error',

  // forced behavior
  'force',
  'skip',
  'ignore',
  'override check',

  // abnormal system probing
  'scan system',
  'check permissions',
  'test access',

  //Attacker
  'hack',
  'breach',
  'exploit',
  'disable security',
  'bypass authentication',
  'shutdown system',
  'wipe data',
  'inject payload',
  'root access',
  'privilege escalation',
];

const CRITICAL_KEYWORDS = [
  // physical impairment
  'hand injured',
  'finger injured',
  'can’t type',
  'typing difficult',
  'hands shaking',

  // visual impairment
  'can’t see clearly',
  'eye pain',
  'vision blurred',
  'screen hurts',
  'eye strain',

  // cognitive impairment
  'headache',
  'migraine',
  'feeling dizzy',
  'confused',
  'can’t focus',

  // medical / fatigue
  'sick',
  'fever',
  'tired',
  'medication',
  'post surgery',

  // assistance intent
  'need help',
  'assist mode',
  'accessibility',
  'adaptive mode',
  'shaking',
  'tremor',
  'injured',
  'pain',
  'dizzy',
  'blurred',
  'cannot see',
  'cant see',
  'cannot type',
  'cant type',
  'hand pain',
  'eye strain',
  'headache',
  'nauseous',
  'weak',
  'assist mode',
  'help me type'
];

export function classifyIntent(command: string): IntentRisk {
  const text = command.toLowerCase();

  if (CRITICAL_KEYWORDS.some(k => text.includes(k))) {
    return 'critical';
  }

  if (SUSPICIOUS_KEYWORDS.some(k => text.includes(k))) {
    return 'suspicious';
  }

  return 'safe';
}
