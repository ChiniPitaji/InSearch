export type MatchJob = {
  skills: string[] | null;
  minimum_cgpa: number | null;
};

export type MatchStudentProfile = {
  skills: string[] | null;
  cgpa: number | null;
};

export type CgpaMatchStatus =
  | "not_applicable"
  | "cannot_evaluate"
  | "met"
  | "not_met";

export type JobMatch = {
  score: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequiredSkills: number;
  cgpaStatus: CgpaMatchStatus;
};

const SKILLS_WEIGHT = 70;
const CGPA_WEIGHT = 30;

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase();
}

export function calculateJobMatch(
  job: MatchJob,
  student: MatchStudentProfile
): JobMatch {
  const requiredSkills = Array.from(
    new Map(
      (job.skills || [])
        .map((skill) => ({ label: skill.trim(), normalized: normalizeSkill(skill) }))
        .filter((skill) => skill.normalized)
        .map((skill) => [skill.normalized, skill.label])
    ).values()
  );
  const studentSkills = new Set(
    (student.skills || []).map(normalizeSkill).filter(Boolean)
  );

  const matchedSkills = requiredSkills.filter((skill) =>
    studentSkills.has(normalizeSkill(skill))
  );
  const missingSkills = requiredSkills.filter(
    (skill) => !studentSkills.has(normalizeSkill(skill))
  );

  const hasSkillRequirement = requiredSkills.length > 0;
  const cgpaStatus: CgpaMatchStatus =
    job.minimum_cgpa === null
      ? "not_applicable"
      : student.cgpa === null
        ? "cannot_evaluate"
        : student.cgpa >= job.minimum_cgpa
          ? "met"
          : "not_met";

  const scoreParts: Array<{ weight: number; value: number }> = [];

  if (hasSkillRequirement) {
    scoreParts.push({
      weight: SKILLS_WEIGHT,
      value: matchedSkills.length / requiredSkills.length,
    });
  }

  if (cgpaStatus === "met" || cgpaStatus === "not_met") {
    scoreParts.push({
      weight: CGPA_WEIGHT,
      value: cgpaStatus === "met" ? 1 : 0,
    });
  }

  const totalWeight = scoreParts.reduce((total, part) => total + part.weight, 0);
  const score =
    totalWeight === 0
      ? null
      : Math.round(
          (scoreParts.reduce(
            (total, part) => total + part.weight * part.value,
            0
          ) /
            totalWeight) *
            100
        );

  return {
    score,
    matchedSkills,
    missingSkills,
    totalRequiredSkills: requiredSkills.length,
    cgpaStatus,
  };
}
