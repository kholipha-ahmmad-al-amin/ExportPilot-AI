export interface RedactedEntity {
  type: string;
  replacement: string;
}

export interface RedactionResult {
  redacted_text: string;
  total_redactions: number;
  detected_entities: RedactedEntity[];
}

// Entries marked keepPrefix capture a keyword label (NID:, BIN:) in group 1 so
// the label survives in the output text and only the digits are replaced.
const patterns: Array<[string, RegExp, string, boolean]> = [
  ['IBAN', /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g, '[REDACTED_IBAN]', false],
  ['BD_BIN', /\b\d{9}-\d{4}\b/g, '[REDACTED_BIN]', false],
  ['BD_BIN_KEYWORD', /(\bBIN\b[\s:#-]*|বিআইএন[\s:#-]*)\d{9,11}\b/g, '[REDACTED_BIN]', true],
  ['BD_NID_17', /\b(?:19|20)\d{15}\b/g, '[REDACTED_BD_NID]', false],
  ['BD_PHONE', /(?:\+8801|8801|01)[3-9]\d{8}\b/g, '[REDACTED_BD_PHONE]', false],
  ['BD_PHONE_LOCAL', /\b1[3-9]\d{8}\b/g, '[REDACTED_BD_PHONE]', false],
  ['BD_NID_13', /\b\d{13}\b/g, '[REDACTED_BD_NID]', false],
  ['BD_TIN_12', /\b\d{12}\b/g, '[REDACTED_TIN]', false],
  ['BD_SMART_NID_10', /((?:NID|Smart|কার্ড|নম্বর)\s*[:#-]?\s*)\b\d{10}\b/gi, '[REDACTED_BD_NID]', true],
  ['BANK_ACCOUNT', /\b\d{13,16}\b/g, '[REDACTED_BANK_ACCOUNT]', false],
  ['BD_NID_10', /\b\d{10}\b/g, '[REDACTED_BD_NID]', false],
];

const banglaDigits = '০১২৩৪৫৬৭৮৯';

// Session-wide count of values masked in this browser before any request left.
// Displayed by the Sovereign Data Shield badge as visible proof of operation.
let totalClientRedactions = 0;

export function getClientRedactionCount(): number {
  return totalClientRedactions;
}

export function redactBangladeshPii(value: string): RedactionResult {
  // Bengali numerals are normalized to ASCII digits so every pattern can match
  // both scripts. The redacted text is intended for downstream tools, where
  // ASCII digits are the expected form.
  let redacted = value.replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)));
  const detected_entities: RedactedEntity[] = [];

  for (const [type, pattern, replacement, keepPrefix] of patterns) {
    redacted = redacted.replace(pattern, (...args: unknown[]) => {
      detected_entities.push({ type, replacement });
      totalClientRedactions += 1;
      const label = typeof args[1] === 'string' ? (args[1] as string) : '';
      return keepPrefix ? label + replacement : replacement;
    });
  }

  return {
    redacted_text: redacted,
    total_redactions: detected_entities.length,
    detected_entities,
  };
}
