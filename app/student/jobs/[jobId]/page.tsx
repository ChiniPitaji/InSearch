"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
};

type StudentProfile = {
  skills: string[] | null;
  cgpa: number | null;
};

export default function JobDetailsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [studentProfile, setStudentProfile] =
    useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");

  const [supabase] = useState(createClient);

  useEffect(() => {
    async function loadJobPage() {
      setLoading(true);

      const [
        { data: jobData, error: jobError },
        {
          data: { user },
        },
      ] = await Promise.all([
        supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .eq("status", "active")
          .single(),
        supabase.auth.getUser(),
      ]);

      if (jobError) {
        console.error(jobError);
        setJob(null);
      } else {
        setJob(jobData);
      }

      if (user) {
        const [applicationResult, profileResult] = await Promise.all([
          supabase
            .from("applications")
            .select("id")
            .eq("job_id", jobId)
            .eq("student_id", user.id)
            .maybeSingle(),
          supabase
            .from("student_profiles")
            .select("skills, cgpa")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        if (applicationResult.error) {
          console.error(applicationResult.error);
        } else {
          setApplied(Boolean(applicationResult.data));
        }

        if (profileResult.error) {
          console.error(profileResult.error);
        } else {
          setStudentProfile(profileResult.data);
        }
      }

      setLoading(false);
    }

    void loadJobPage();
  }, [jobId, supabase]);

  async function handleApply() {
    setApplying(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setApplying(false);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      student_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        setApplied(true);
        setMessage("You have already applied for this job.");
      } else {
        console.error(error);
        setMessage(error.message);
      }
    } else {
      setApplied(true);
      setMessage("Application submitted successfully! 🎉");
    }

    setApplying(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center">
          Loading job...
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>

          <p className="mt-2 text-gray-500">
            This job may have been closed or removed.
          </p>

          <Link
            href="/student/jobs"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-semibold text-white"
          >
            ← Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const match = studentProfile ? calculateJobMatch(job, studentProfile) : null;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <Link
            href="/student/jobs"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Find Jobs
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Job Header */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{job.title}</h2>

              <p className="mt-2 text-lg font-medium text-gray-600">
                {job.company_name}
              </p>
            </div>

            <span className="h-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold capitalize">
              {job.job_type}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
            {job.location && <span>📍 {job.location}</span>}

            <span>💼 {job.experience_required} years experience</span>

            {job.salary && <span>💰 {job.salary}</span>}

            {job.minimum_cgpa !== null && (
              <span>🎓 CGPA {job.minimum_cgpa}+</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Job Description</h3>

          <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Required Skills</h3>

          <div className="mt-4 flex flex-wrap gap-3">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Your Match */}
        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Your Match</h3>

          {!match ? (
            <p className="mt-3 text-gray-600">
              Complete your profile with skills and CGPA to see your match for
              this job.
            </p>
          ) : (
            <div className="mt-4 space-y-5 text-sm text-gray-600">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {match.score === null ? "Match unavailable" : `${match.score}% Match`}
                </p>
                {match.score === null && (
                  <p className="mt-1">
                    This job has no requirements that can be scored yet.
                  </p>
                )}
              </div>

              <div>
                <p className="font-semibold text-gray-900">Skills</p>
                {match.totalRequiredSkills === 0 ? (
                  <p className="mt-1">This job has no required skills.</p>
                ) : (
                  <>
                    <p className="mt-1">
                      {match.matchedSkills.length}/{match.totalRequiredSkills} skills matched
                    </p>

                    {match.matchedSkills.length > 0 && (
                      <p className="mt-1">
                        <strong>Matched:</strong> {match.matchedSkills.join(", ")}
                      </p>
                    )}

                    {match.missingSkills.length > 0 && (
                      <p className="mt-1">
                        <strong>Missing:</strong> {match.missingSkills.join(", ")}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <p className="font-semibold text-gray-900">CGPA</p>
                {match.cgpaStatus === "not_applicable" && (
                  <p className="mt-1">
                    This job has no minimum CGPA requirement.
                  </p>
                )}
                {match.cgpaStatus === "cannot_evaluate" && (
                  <p className="mt-1">
                    Add your CGPA to your profile to check this requirement.
                  </p>
                )}
                {match.cgpaStatus === "met" && (
                  <p className="mt-1">
                    CGPA requirement met (minimum {job.minimum_cgpa}).
                  </p>
                )}
                {match.cgpaStatus === "not_met" && (
                  <p className="mt-1">
                    CGPA requirement not met (minimum {job.minimum_cgpa}).
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Deadline */}
        {job.application_deadline && (
          <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Application Deadline
            </h3>

            <p className="mt-3 text-gray-600">
              📅{" "}
              {new Date(job.application_deadline).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Apply */}
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900">
            Interested in this opportunity?
          </h3>

          <p className="mt-2 text-gray-500">
            Apply now and take the next step in your career.
          </p>

          <button
            type="button"
            onClick={handleApply}
            disabled={applying || applied}
            className="mt-6 rounded-lg bg-black px-8 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {applying ? "Applying..." : applied ? "✓ Applied" : "🚀 Apply Now"}
          </button>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
