/**
 * The Moroccan national structure template (BEH-ZS-051): the cycles, levels,
 * upper-secondary tracks, and default subject coefficients a school gets when
 * it instantiates the "national" template. Every value here is a default —
 * the school freely renames, adds, or removes afterward (BEH-ZS-051) without
 * breaking already-created links.
 */

export type CycleCode = "preschool" | "primary" | "middle" | "upper_secondary"

export interface TrackDefinition {
  readonly code: string
  readonly name: string
}

export interface SubjectCoefficient {
  readonly code: string
  readonly name: string
  readonly coefficient: number
  readonly teachingLanguage: string
  readonly isMandatory: boolean
}

export interface LevelDefinition {
  readonly code: string
  readonly name: string
  readonly tracks: ReadonlyArray<TrackDefinition>
  readonly subjects: ReadonlyArray<SubjectCoefficient>
}

export interface CycleDefinition {
  readonly code: CycleCode
  readonly name: string
  readonly levels: ReadonlyArray<LevelDefinition>
}

const commonCoreSubjects: ReadonlyArray<SubjectCoefficient> = [
  { code: "AR", name: "Arabe", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
  { code: "FR", name: "Français", coefficient: 3, teachingLanguage: "French", isMandatory: true },
  { code: "MATH", name: "Mathématiques", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
  { code: "ISL", name: "Éducation islamique", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "EPS", name: "Éducation physique", coefficient: 1, teachingLanguage: "Arabic", isMandatory: true }
]

const primarySubjects: ReadonlyArray<SubjectCoefficient> = [
  ...commonCoreSubjects,
  { code: "SCI", name: "Activités scientifiques", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "ART", name: "Éducation artistique", coefficient: 1, teachingLanguage: "Arabic", isMandatory: true }
]

const middleSubjects: ReadonlyArray<SubjectCoefficient> = [
  { code: "AR", name: "Arabe", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
  { code: "FR", name: "Français", coefficient: 4, teachingLanguage: "French", isMandatory: true },
  { code: "EN", name: "Anglais", coefficient: 2, teachingLanguage: "English", isMandatory: true },
  { code: "MATH", name: "Mathématiques", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
  {
    code: "SVT",
    name: "Sciences de la Vie et de la Terre",
    coefficient: 2,
    teachingLanguage: "Arabic",
    isMandatory: true
  },
  { code: "PC", name: "Physique-Chimie", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "HG", name: "Histoire-Géographie", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "ISL", name: "Éducation islamique", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "EPS", name: "Éducation physique", coefficient: 1, teachingLanguage: "Arabic", isMandatory: true },
  { code: "INFO", name: "Informatique", coefficient: 1, teachingLanguage: "French", isMandatory: false }
]

const truncCommunSubjects: ReadonlyArray<SubjectCoefficient> = [
  ...middleSubjects.filter((s) => s.code !== "INFO"),
  { code: "PHILO", name: "Philosophie", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true }
]

const baseTerminaleSubjects: ReadonlyArray<SubjectCoefficient> = [
  { code: "AR", name: "Arabe", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "FR", name: "Français", coefficient: 2, teachingLanguage: "French", isMandatory: true },
  { code: "EN", name: "Anglais", coefficient: 2, teachingLanguage: "English", isMandatory: true },
  { code: "PHILO", name: "Philosophie", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "ISL", name: "Éducation islamique", coefficient: 2, teachingLanguage: "Arabic", isMandatory: true },
  { code: "EPS", name: "Éducation physique", coefficient: 1, teachingLanguage: "Arabic", isMandatory: true }
]

const trackSpecialtySubjects: Record<string, ReadonlyArray<SubjectCoefficient>> = {
  math_sciences_a: [
    { code: "MATH", name: "Mathématiques", coefficient: 7, teachingLanguage: "French", isMandatory: true },
    { code: "PC", name: "Physique-Chimie", coefficient: 5, teachingLanguage: "French", isMandatory: true },
    {
      code: "SVT",
      name: "Sciences de la Vie et de la Terre",
      coefficient: 3,
      teachingLanguage: "French",
      isMandatory: true
    }
  ],
  math_sciences_b: [
    { code: "MATH", name: "Mathématiques", coefficient: 9, teachingLanguage: "French", isMandatory: true },
    { code: "PC", name: "Physique-Chimie", coefficient: 7, teachingLanguage: "French", isMandatory: true },
    {
      code: "SVT",
      name: "Sciences de la Vie et de la Terre",
      coefficient: 1,
      teachingLanguage: "French",
      isMandatory: true
    }
  ],
  physical_sciences: [
    { code: "PC", name: "Physique-Chimie", coefficient: 7, teachingLanguage: "French", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 5, teachingLanguage: "French", isMandatory: true },
    {
      code: "SVT",
      name: "Sciences de la Vie et de la Terre",
      coefficient: 2,
      teachingLanguage: "French",
      isMandatory: true
    }
  ],
  life_earth_sciences: [
    {
      code: "SVT",
      name: "Sciences de la Vie et de la Terre",
      coefficient: 7,
      teachingLanguage: "French",
      isMandatory: true
    },
    { code: "PC", name: "Physique-Chimie", coefficient: 5, teachingLanguage: "French", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 3, teachingLanguage: "French", isMandatory: true }
  ],
  humanities: [
    { code: "AR_LIT", name: "Arabe (littéraire)", coefficient: 6, teachingLanguage: "Arabic", isMandatory: true },
    { code: "PHILO", name: "Philosophie", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
    { code: "HG", name: "Histoire-Géographie", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true }
  ],
  social_sciences: [
    { code: "HG", name: "Histoire-Géographie", coefficient: 5, teachingLanguage: "Arabic", isMandatory: true },
    { code: "PHILO", name: "Philosophie", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
    {
      code: "ECO",
      name: "Économie générale et statistique",
      coefficient: 4,
      teachingLanguage: "Arabic",
      isMandatory: true
    }
  ],
  economics: [
    {
      code: "ECO",
      name: "Économie générale et statistique",
      coefficient: 6,
      teachingLanguage: "Arabic",
      isMandatory: true
    },
    { code: "MATH", name: "Mathématiques", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
    { code: "COMPTA", name: "Comptabilité", coefficient: 3, teachingLanguage: "Arabic", isMandatory: true }
  ],
  accounting_management: [
    { code: "COMPTA", name: "Comptabilité", coefficient: 6, teachingLanguage: "Arabic", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 4, teachingLanguage: "Arabic", isMandatory: true },
    {
      code: "ECO",
      name: "Économie générale et statistique",
      coefficient: 3,
      teachingLanguage: "Arabic",
      isMandatory: true
    }
  ],
  science_technology: [
    { code: "TECH", name: "Sciences de l'ingénieur", coefficient: 7, teachingLanguage: "French", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 5, teachingLanguage: "French", isMandatory: true },
    { code: "PC", name: "Physique-Chimie", coefficient: 4, teachingLanguage: "French", isMandatory: true }
  ],
  international_option_fr: [
    { code: "FR", name: "Français", coefficient: 5, teachingLanguage: "French", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 6, teachingLanguage: "French", isMandatory: true }
  ],
  international_option_en: [
    { code: "EN", name: "Anglais", coefficient: 5, teachingLanguage: "English", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 6, teachingLanguage: "English", isMandatory: true }
  ],
  international_option_es: [
    { code: "ES", name: "Espagnol", coefficient: 5, teachingLanguage: "Spanish", isMandatory: true },
    { code: "MATH", name: "Mathématiques", coefficient: 6, teachingLanguage: "Spanish", isMandatory: true }
  ]
}

const upperSecondaryTracks: ReadonlyArray<TrackDefinition> = [
  { code: "math_sciences_a", name: "Mathematical Sciences A" },
  { code: "math_sciences_b", name: "Mathematical Sciences B" },
  { code: "physical_sciences", name: "Physical Sciences" },
  { code: "life_earth_sciences", name: "Life and Earth Sciences" },
  { code: "humanities", name: "Humanities" },
  { code: "social_sciences", name: "Social Sciences" },
  { code: "economics", name: "Economics" },
  { code: "accounting_management", name: "Accounting Management Sciences" },
  { code: "science_technology", name: "Science and Technology" },
  { code: "international_option_fr", name: "International Option (French)" },
  { code: "international_option_en", name: "International Option (English)" },
  { code: "international_option_es", name: "International Option (Spanish)" }
]

/**
 * A tracked level's per-track subject list is the base terminale set plus
 * that track's specialties, merged by subject code — a specialty entry
 * overrides the base one rather than duplicating it (e.g. Humanities and
 * Social Sciences both give Philosophy a higher coefficient than the base
 * set does; without the merge, "PHILO" would appear twice for the same
 * (level, track) pair and violate `subject_level_configs`'s uniqueness).
 */
const forTrack = (trackCode: string): ReadonlyArray<SubjectCoefficient> => {
  const byCode = new Map(baseTerminaleSubjects.map((s) => [s.code, s]))
  for (const specialty of trackSpecialtySubjects[trackCode] ?? []) {
    byCode.set(specialty.code, specialty)
  }
  return [...byCode.values()]
}

export const nationalTemplate: ReadonlyArray<CycleDefinition> = [
  {
    code: "preschool",
    name: "Préscolaire",
    levels: [
      { code: "PS", name: "Petite Section", tracks: [], subjects: [] },
      { code: "MS", name: "Moyenne Section", tracks: [], subjects: [] },
      { code: "GS", name: "Grande Section", tracks: [], subjects: [] }
    ]
  },
  {
    code: "primary",
    name: "Primaire",
    levels: [
      { code: "1AP", name: "1ère Année Primaire", tracks: [], subjects: primarySubjects },
      { code: "2AP", name: "2ème Année Primaire", tracks: [], subjects: primarySubjects },
      { code: "3AP", name: "3ème Année Primaire", tracks: [], subjects: primarySubjects },
      { code: "4AP", name: "4ème Année Primaire", tracks: [], subjects: primarySubjects },
      { code: "5AP", name: "5ème Année Primaire", tracks: [], subjects: primarySubjects },
      { code: "6AP", name: "6ème Année Primaire", tracks: [], subjects: primarySubjects }
    ]
  },
  {
    code: "middle",
    name: "Collège",
    levels: [
      { code: "1AC", name: "1ère Année Collège", tracks: [], subjects: middleSubjects },
      { code: "2AC", name: "2ème Année Collège", tracks: [], subjects: middleSubjects },
      { code: "3AC", name: "3ème Année Collège", tracks: [], subjects: middleSubjects }
    ]
  },
  {
    code: "upper_secondary",
    name: "Lycée",
    levels: [
      { code: "TC", name: "Tronc Commun", tracks: [], subjects: truncCommunSubjects },
      {
        code: "1BAC",
        name: "1ère Année Baccalauréat",
        tracks: upperSecondaryTracks,
        subjects: baseTerminaleSubjects
      },
      {
        code: "2BAC",
        name: "2ème Année Baccalauréat",
        tracks: upperSecondaryTracks,
        subjects: baseTerminaleSubjects
      }
    ]
  }
]

/** The full subject list for a (level, track) pair — the base subjects plus, on a tracked level, that track's specialties. */
export const subjectsForLevel = (
  level: LevelDefinition,
  trackCode: string | undefined
): ReadonlyArray<SubjectCoefficient> => trackCode === undefined ? level.subjects : forTrack(trackCode)

export const defaultEvaluationPeriods = [
  { code: "S1", name: "Semester 1", sequence: 1 },
  { code: "S2", name: "Semester 2", sequence: 2 }
] as const

export const defaultGradingScale = {
  maxScore: 20,
  decimals: 2,
  rounding: "half_up"
} as const
