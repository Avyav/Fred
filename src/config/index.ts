export const APP_NAME = "MindSupport Victoria";
export const APP_DESCRIPTION =
  "Free, confidential AI-powered mental health support for Victorian adults.";

export const CRISIS_RESOURCES = {
  emergency: { name: "Emergency Services", phone: "000" },
  lifeline: { name: "Lifeline", phone: "13 11 14" },
  lifelineText: { name: "Lifeline Text", phone: "0477 13 11 14" },
  beyondBlue: { name: "Beyond Blue", phone: "1300 22 4636" },
  victorianCrisis: {
    name: "Victorian Mental Health Crisis Line",
    phone: "1300 842 747",
  },
} as const;

export const LIMITS = {
  DAILY_MESSAGE_LIMIT: parseInt(
    process.env.DAILY_MESSAGE_LIMIT || "20",
    10
  ),
  WEEKLY_CONVERSATION_LIMIT: parseInt(
    process.env.WEEKLY_CONVERSATION_LIMIT || "5",
    10
  ),
  MAX_MESSAGE_LENGTH: 2000,
  MAX_CONTEXT_MESSAGES: 10,
  SUMMARIZATION_THRESHOLD: 20,
} as const;
