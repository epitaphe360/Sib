import { useState, useEffect } from 'react';

interface EmailSuggestion {
  suggestion: string;
  confidence: number;
}

const commonDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'zoho.com',
];

const commonTLDs = ['.com', '.net', '.org', '.edu', '.gov', '.cm', '.fr', '.ma', '.sn'];

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function getSuggestion(email: string): EmailSuggestion | null {
  if (!email || !email.includes('@')) return null;

  const [, domain] = email.split('@');
  if (!domain) return null;

  let bestMatch = '';
  let minDistance = Infinity;

  for (const commonDomain of commonDomains) {
    const distance = levenshteinDistance(domain.toLowerCase(), commonDomain);
    if (distance < minDistance && distance > 0 && distance <= 2) {
      minDistance = distance;
      bestMatch = commonDomain;
    }
  }

  if (bestMatch) {
    const [localPart] = email.split('@');
    return {
      suggestion: `${localPart}@${bestMatch}`,
      confidence: minDistance === 1 ? 0.9 : 0.7,
    };
  }

  return null;
}

export function useEmailValidation(email: string) {
  const [suggestion, setSuggestion] = useState<EmailSuggestion | null>(null);

  useEffect(() => {
    if (email && email.includes('@')) {
      const emailSuggestion = getSuggestion(email);
      setSuggestion(emailSuggestion);
    } else {
      setSuggestion(null);
    }
  }, [email]);

  return { suggestion };
}
