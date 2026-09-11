"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Candidate = {
  id: string;
  full_name: string;
  skills: string[];
  cgpa: number | null;
  location: string | null;
  college_name: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
};

type CandidateRow = Omit<Candidate, "full_name"> & {
  profiles: { full_name: string | null } | { full_name: string | null }[];
};

export default function CandidateProfilePage() {
  const [supabase] = useState(createClient);
  const router = useRouter();
  const params = useParams<{ candidateId: string }>();
  const candidateId = params.candidateId;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCandidate() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "company") {
        setMessage("You are not authorized to view candidate profiles.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("student_profiles")
        .select(
          "id, college_name, degree, branch, graduation_year, cgpa, location, skills, profiles!inner(full_name)"
        )
        .eq("id", candidateId)
        .eq("open_to_recruiters", true)
        .maybeSingle();

      if (error) {
        console.error(error);
        setMessage("Unable to load this candidate right now. Please try again.");
        setLoading(false);
        return;
      }

      if (!data) {
        setMessage(
          "Candidate not found or no longer open to recruiter discovery."
        );
        setLoading(false);
        return;
      }

      const candidateRow = data as CandidateRow;
      const profileData = Array.isArray(candidateRow.profiles)
        ? candidateRow.profiles[0]
        : candidateRow.profiles;

      setCandidate({
        id: candidateRow.id,
        full_name: profileData?.full_name || "Student",
        skills: candidateRow.skills || [],
        cgpa: candidateRow.cgpa,
        location: candidateRow.location,
        college_name: candidateRow.college_name,
        degree: candidateRow.degree,
        branch: candidateRow.branch,
        graduation_year: candidateRow.graduation_year,
      });
      setLoading(false);
    }

    void loadCandidate();
  }, [candidateId, router, supabase]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <Link
            href="/company/candidates"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back to Candidates
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Loading candidate profile...</p>
          </div>
        ) : message ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Candidate unavailable
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        ) : candidate ? (
          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Candidate Profile
                </p>
                <h2 className="mt-1 text-3xl font-bold text-gray-900">
                  {candidate.full_name}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Open to Recruiters
              </span>
            </div>

            <section className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Education & Details
              </h3>

              <div className="mt-5 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                {candidate.college_name && (
                  <p>
                    🎓 <strong>College:</strong> {candidate.college_name}
                  </p>
                )}
                {candidate.degree && (
                  <p>
                    📚 <strong>Degree:</strong> {candidate.degree}
                  </p>
                )}
                {candidate.branch && (
                  <p>
                    💻 <strong>Branch:</strong> {candidate.branch}
                  </p>
                )}
                {candidate.cgpa !== null && (
                  <p>
                    ⭐ <strong>CGPA:</strong> {candidate.cgpa}
                  </p>
                )}
                {candidate.graduation_year && (
                  <p>
                    📅 <strong>Graduation Year:</strong>{" "}
                    {candidate.graduation_year}
                  </p>
                )}
                {candidate.location && (
                  <p>
                    📍 <strong>Location:</strong> {candidate.location}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900">Skills</h3>

              {candidate.skills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  No skills listed yet.
                </p>
              )}
            </section>
          </article>
        ) : null}
      </div>
    </main>
  );
}
