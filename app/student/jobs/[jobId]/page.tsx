"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchJob();
    checkApplication();
  }, [jobId]);

  async function fetchJob() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("status", "active")
      .single();

    if (error) {
      console.error(error);
      setJob(null);
    } else {
      setJob(data);
    }

    setLoading(false);
  }

  async function checkApplication() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setApplied(true);
    }
  }

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

          <a
            href="/student/jobs"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-semibold text-white"
          >
            ← Back to Jobs
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <a
            href="/student/jobs"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Find Jobs
          </a>
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
