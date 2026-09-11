"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function FindCandidatesPage() {
  const [supabase] = useState(createClient);
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [nameSearch, setNameSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [minimumCgpa, setMinimumCgpa] = useState("");
  const [location, setLocation] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    async function loadCandidates() {
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
        setMessage("Candidate discovery is only available for company accounts.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("student_profiles")
        .select(
          "id, college_name, degree, branch, graduation_year, cgpa, location, skills, profiles!inner(full_name)"
        )
        .eq("open_to_recruiters", true)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error);
        setMessage("Unable to load candidates right now. Please try again.");
        setCandidates([]);
      } else {
        const candidateRows = (data || []) as CandidateRow[];

        setCandidates(
          candidateRows.map((candidate) => {
            const profileData = Array.isArray(candidate.profiles)
              ? candidate.profiles[0]
              : candidate.profiles;

            return {
              id: candidate.id,
              full_name: profileData?.full_name || "Student",
              skills: candidate.skills || [],
              cgpa: candidate.cgpa,
              location: candidate.location,
              college_name: candidate.college_name,
              degree: candidate.degree,
              branch: candidate.branch,
              graduation_year: candidate.graduation_year,
            };
          })
        );
      }

      setLoading(false);
    }

    void loadCandidates();
  }, [router, supabase]);

  function includesText(value: string | null, filter: string) {
    return !filter || value?.toLowerCase().includes(filter.toLowerCase());
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const minimumCgpaValue = Number(minimumCgpa);

    const matchesName = includesText(candidate.full_name, nameSearch);
    const matchesSkill =
      !skill ||
      candidate.skills.some((candidateSkill) =>
        candidateSkill.toLowerCase().includes(skill.toLowerCase())
      );
    const matchesCgpa =
      !minimumCgpa ||
      (candidate.cgpa !== null && candidate.cgpa >= minimumCgpaValue);

    return (
      matchesName &&
      matchesSkill &&
      matchesCgpa &&
      includesText(candidate.location, location) &&
      includesText(candidate.college_name, college) &&
      includesText(candidate.degree, degree) &&
      includesText(candidate.branch, branch)
    );
  });

  function clearFilters() {
    setNameSearch("");
    setSkill("");
    setMinimumCgpa("");
    setLocation("");
    setCollege("");
    setDegree("");
    setBranch("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <a
            href="/company/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Find Candidates
          </h2>

          <p className="mt-2 text-gray-500">
            Discover students who are open to recruiter outreach.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="text-xl font-semibold text-gray-900">Filters</h3>

            <button
              type="button"
              onClick={clearFilters}
              className="w-fit rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FilterInput
              label="Candidate Name"
              value={nameSearch}
              onChange={setNameSearch}
              placeholder="Search by name"
            />
            <FilterInput
              label="Skill"
              value={skill}
              onChange={setSkill}
              placeholder="React, Python..."
            />
            <FilterInput
              label="Minimum CGPA"
              type="number"
              value={minimumCgpa}
              onChange={setMinimumCgpa}
              placeholder="7.5"
            />
            <FilterInput
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="Delhi"
            />
            <FilterInput
              label="College"
              value={college}
              onChange={setCollege}
              placeholder="College or university"
            />
            <FilterInput
              label="Degree"
              value={degree}
              onChange={setDegree}
              placeholder="B.Tech"
            />
            <FilterInput
              label="Branch"
              value={branch}
              onChange={setBranch}
              placeholder="Computer Science"
            />
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Candidates</h3>

          {!loading && (
            <span className="text-sm text-gray-500">
              {filteredCandidates.length} {filteredCandidates.length === 1 ? "candidate" : "candidates"} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Loading candidates...</p>
          </div>
        ) : message ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">{message}</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              No matching candidates found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your filters or check back as more students opt in.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {filteredCandidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h4 className="text-xl font-bold text-gray-900">
                  {candidate.full_name}
                </h4>

                <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  {candidate.cgpa !== null && (
                    <p>
                      ⭐ <strong>CGPA:</strong> {candidate.cgpa}
                    </p>
                  )}
                  {candidate.location && (
                    <p>
                      📍 <strong>Location:</strong> {candidate.location}
                    </p>
                  )}
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
                  {candidate.graduation_year && (
                    <p>
                      📅 <strong>Graduation:</strong> {candidate.graduation_year}
                    </p>
                  )}
                </div>

                {candidate.skills.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((candidateSkill) => (
                        <span
                          key={candidateSkill}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          {candidateSkill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/company/candidates/${candidate.id}`}
                  className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  View Profile
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "number" | "text";
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        max={type === "number" ? "10" : undefined}
        step={type === "number" ? "0.01" : undefined}
        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}
