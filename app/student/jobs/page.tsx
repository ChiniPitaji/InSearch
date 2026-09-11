"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateJobMatch } from "@/lib/matching";

type Job = {
  id: string;
  company_name: string;
  title: string;
  description: string;
  location: string | null;
  job_type: "internship" | "full-time";
  experience_required: number;
  salary: string | null;
  skills: string[];
  minimum_cgpa: number | null;
  application_deadline: string | null;
  created_at: string;
};

type StudentProfile = {
  skills: string[] | null;
  cgpa: number | null;
};

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [studentProfile, setStudentProfile] =
    useState<StudentProfile | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");

  const [supabase] = useState(createClient);

  useEffect(() => {
    async function loadJobsAndProfile() {
      setLoading(true);

      const [
        { data: jobsData, error: jobsError },
        {
          data: { user },
        },
      ] = await Promise.all([
        supabase
          .from("jobs")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      if (jobsError) {
        console.error(jobsError);
        setJobs([]);
      } else {
        setJobs(jobsData || []);
      }

      if (user) {
        setStudentId(user.id);

        const { data: profileData, error: profileError } = await supabase
          .from("student_profiles")
          .select("skills, cgpa")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(profileError);
          setStudentProfile(null);
        } else {
          setStudentProfile(profileData);
        }
      }

      setLoading(false);
    }

    void loadJobsAndProfile();
  }, [supabase]);

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      job.title.toLowerCase().includes(searchText) ||
      job.company_name.toLowerCase().includes(searchText) ||
      job.description.toLowerCase().includes(searchText);

    const matchesType = jobType === "all" || job.job_type === jobType;

    const matchesLocation =
      !location ||
      (job.location &&
        job.location.toLowerCase().includes(location.toLowerCase()));

    const matchesSkill =
      !skill ||
      job.skills.some((jobSkill) =>
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      );

    return matchesSearch && matchesType && matchesLocation && matchesSkill;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <a
            href="/student/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Find Jobs</h2>

          <p className="mt-2 text-gray-500">
            Discover internships and full-time opportunities.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Frontend Developer..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Type
              </label>

              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
              >
                <option value="all">All Types</option>
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Delhi, Remote..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* Skill */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skill
              </label>

              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="React, Python..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Job Results */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Available Jobs
            </h3>

            <span className="text-sm text-gray-500">
              {filteredJobs.length} jobs found
            </span>
          </div>

          {studentId && !studentProfile && !loading && (
            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
              Complete your profile to see match scores for each job.
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            /* No Jobs */
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-900">
                No jobs found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            /* Job Cards */
            <div className="space-y-5">
              {filteredJobs.map((job) => {
                const match = studentProfile
                  ? calculateJobMatch(job, studentProfile)
                  : null;

                return (
                  <div
                    key={job.id}
                    className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                  {/* Job Title + Type */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h4>

                      <p className="mt-1 font-medium text-gray-600">
                        {job.company_name}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {match?.score !== null && match && (
                        <span className="h-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          {match.score}% Match
                        </span>
                      )}

                      {match?.score === null && match && (
                        <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                          Match unavailable
                        </span>
                      )}

                      <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
                        {job.job_type}
                      </span>
                    </div>
                  </div>

                  {/* Job Information */}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                    {job.location && <span>📍 {job.location}</span>}

                    <span>💼 {job.experience_required} years experience</span>

                    {job.salary && <span>💰 {job.salary}</span>}

                    {job.minimum_cgpa !== null && (
                      <span>🎓 CGPA {job.minimum_cgpa}+</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((jobSkill) => (
                      <span
                        key={jobSkill}
                        className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium"
                      >
                        {jobSkill}
                      </span>
                    ))}
                  </div>

                  {/* View Job Button */}
                  <div className="mt-6">
                    <a
                      href={`/student/jobs/${job.id}`}
                      className="inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      View Job
                    </a>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
