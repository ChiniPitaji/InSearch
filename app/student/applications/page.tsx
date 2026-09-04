"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Application = {
  id: string;
  job_id: string;
  status: "applied" | "shortlisted" | "rejected" | "selected";
  applied_at: string;
};

type Job = {
  id: string;
  title: string;
  company_name: string;
  job_type: "internship" | "full-time";
  location: string | null;
  salary: string | null;
  application_deadline: string | null;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    // Fetch student's applications
    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select("id, job_id, status, applied_at")
      .eq("student_id", user.id)
      .order("applied_at", { ascending: false });

    if (applicationError) {
      console.error(applicationError);
      setLoading(false);
      return;
    }

    const apps = applicationData || [];
    setApplications(apps);

    // Get job IDs
    const jobIds = apps.map((application) => application.job_id);

    if (jobIds.length > 0) {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select(
          "id, title, company_name, job_type, location, salary, application_deadline"
        )
        .in("id", jobIds);

      if (jobError) {
        console.error(jobError);
      } else {
        const jobMap: Record<string, Job> = {};

        (jobData || []).forEach((job) => {
          jobMap[job.id] = job;
        });

        setJobs(jobMap);
      }
    }

    setLoading(false);
  }

  function getStatusClass(status: string) {
    if (status === "selected") {
      return "bg-green-100 text-green-700";
    }

    if (status === "shortlisted") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

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

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>

          <p className="mt-2 text-gray-500">
            Track the jobs and internships you have applied for.
          </p>
        </div>

        {/* Count */}
        <div className="mt-6">
          <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            {applications.length}{" "}
            {applications.length === 1 ? "Application" : "Applications"}
          </span>
        </div>

        {/* Applications */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">📄</div>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No applications yet
              </h3>

              <p className="mt-2 text-gray-500">
                You haven't applied to any jobs yet.
              </p>

              <a
                href="/student/jobs"
                className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Find Jobs
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((application) => {
                const job = jobs[application.job_id];

                return (
                  <div
                    key={application.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    {job ? (
                      <>
                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {job.title}
                            </h3>

                            <p className="mt-1 font-medium text-gray-600">
                              {job.company_name}
                            </p>
                          </div>

                          <span
                            className={`h-fit w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>
                            💼{" "}
                            {job.job_type === "full-time"
                              ? "Full-time"
                              : "Internship"}
                          </span>

                          {job.location && <span>📍 {job.location}</span>}

                          {job.salary && <span>💰 {job.salary}</span>}

                          <span>
                            📅 Applied {formatDate(application.applied_at)}
                          </span>
                        </div>

                        <div className="mt-6">
                          <a
                            href={`/student/jobs/${job.id}`}
                            className="inline-block rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                          >
                            View Job
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Job no longer available
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Applied on {formatDate(application.applied_at)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>
                        </div>
                      </>
                    )}
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
