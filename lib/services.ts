export const SERVICES = [
  { value: "interpretation", label: "Interpretation" },
  { value: "translation", label: "Translation" },
  { value: "sworn_translation", label: "Sworn Translation" },
  { value: "subtitling", label: "Subtitling" },
  { value: "transcription", label: "Transcription" },
  { value: "proofreading", label: "Proofreading" },
  { value: "mtpe", label: "Machine Translation Post-Editing (MTPE)" },
  { value: "localization", label: "Localization" },
  { value: "voice_over", label: "Voice-over" },
  { value: "dubbing_script_adaptation", label: "Dubbing Script Adaptation" },
  { value: "multilingual_copywriting", label: "Multilingual Copywriting" },
  { value: "transcreation", label: "Transcreation" },
  { value: "language_consulting", label: "Language Consulting" },
] as const

export type ServiceValue = typeof SERVICES[number]["value"]
