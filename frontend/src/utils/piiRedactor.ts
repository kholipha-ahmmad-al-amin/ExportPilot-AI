export interface RedactedEntity {
  type: string;
  replacement: string;
}

export interface RedactionResult {
  redacted_text: string;
  total_redactions: number;
  detected_entities: RedactedEntity[];
}

const patterns: Array<[string, RegExp, string]> = [
  ['IBAN', /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g, '[REDACTED_IBAN]'],
  ['BD_BIN', /\b\d{9}-\d{4}\b/g, '[REDACTED_BIN]'],
  ['BD_NID_17', /\b(?:19|20)\d{15}\b/g, '[REDACTED_BD_NID]'],
  ['BD_PHONE', /(?:\+8801|8801|01)[3-9]\d{8}\b/g, '[REDACTED_BD_PHONE]'],
  ['BD_NID_13', /\b\d{13}\b/g, '[REDACTED_BD_NID]'],
  ['BD_TIN_12', /\b\d{12}\b/g, '[REDACTED_TIN]'],
  ['BD_SMART_NID_10', /(?:NID|Smart|কার্ড|নম্বর)\s*[:#-]?\s*\b\d{10}\b/gi, '[REDACTED_BD_NID]'],
  ['BANK_ACCOUNT', /\b\d{13,16}\b/g, '[REDACTED_BANK_ACCOUNT]'],
];

const banglaDigits = '০১২৩৪৫৬৭৮৯';

export function redactBangladeshPii(value: string): RedactionResult {
  let redacted = value.replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)));
  const detected_entities: RedactedEntity[] = [];

  for (const [type, pattern, replacement] of patterns) {
    redacted = redacted.replace(pattern, () => {
      detected_entities.push({ type, replacement });
      return replacement;
    });
  }

  return {
    redacted_text: redacted,
    total_redactions: detected_entities.length,
    detected_entities,
  };
}
