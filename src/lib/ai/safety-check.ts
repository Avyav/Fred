export const CRISIS_KEYWORDS = [
  "kill myself",
  "end my life",
  "commit suicide",
  "want to die",
  "better off dead",
  "end it all",
  "self harm",
  "hurt myself",
  "cut myself",
  "overdose",
  "jump off",
  "hang myself",
  "no reason to live",
  "can't go on",
];

export const CRISIS_PATTERNS = [
  /suicid(e|al)/i,
  /kill.{0,20}myself/i,
  /(end|take).{0,20}(my )?life/i,
  /better off dead/i,
  /want.{0,20}to die/i,
  /no.{0,20}reason.{0,20}to live/i,
];

export function detectCrisis(message: string): {
  isCrisis: boolean;
  severity: "high" | "medium" | "low";
  indicators: string[];
} {
  const lowerMessage = message.toLowerCase();
  const indicators: string[] = [];

  // Check keywords
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      indicators.push(keyword);
    }
  }

  // Check patterns
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(message)) {
      indicators.push(pattern.toString());
    }
  }

  const isCrisis = indicators.length > 0;

  // Severity based on specificity and urgency
  let severity: "high" | "medium" | "low" = "low";
  if (
    indicators.length >= 3 ||
    lowerMessage.includes("tonight") ||
    lowerMessage.includes("right now") ||
    lowerMessage.includes("have a plan")
  ) {
    severity = "high";
  } else if (indicators.length >= 2) {
    severity = "medium";
  }

  return { isCrisis, severity, indicators };
}

export function shouldBlockResponse(response: string): {
  blocked: boolean;
  reason?: string;
} {
  // Block if AI is diagnosing
  const diagnosisPatterns = [
    /you (have|are suffering from|may have) (depression|anxiety|bipolar|schizophrenia|ptsd)/i,
    /this (is|sounds like) (depression|anxiety|bipolar|schizophrenia|ptsd)/i,
    /I (diagnose|think you have)/i,
  ];

  for (const pattern of diagnosisPatterns) {
    if (pattern.test(response)) {
      return {
        blocked: true,
        reason: "Response contains diagnosis language",
      };
    }
  }

  // Block if AI is recommending medication
  const medicationPatterns = [
    /(you should|I recommend|try|take) (antidepressants|ssri|medication|pills|prozac|zoloft)/i,
    /talk to.{0,20}doctor about.{0,20}(medication|prescription)/i,
  ];

  for (const pattern of medicationPatterns) {
    if (pattern.test(response)) {
      return {
        blocked: true,
        reason: "Response contains medication recommendations",
      };
    }
  }

  return { blocked: false };
}
