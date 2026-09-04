"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: "internship" | "full-time";
  experience_required: number;
  salary: string | null;
  skills: string[];
  minimum_cgpa: number | null;
  application_deadline: string | null;
  status: "active" | "closed";
  created_at: string;
};

export default function CompanyDashboard() {
  const supabase = createClient();

  const [companyName, setCompanyName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<"internship" | "full-time">(
    "internship"
  );
  const [experience, setExperience] = useState("0");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [minimumCgpa, setMinimumCgpa] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    loadCompanyDashboard();
  }, []);

  async function loadCompanyDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "company") {
      setMessage("This dashboard is only available for company accounts.");
      setLoading(false);
      return;
    }

    setCompanyName(profile.full_name || "Company");

    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setJobs(jobsData || []);
    }

    setLoading(false);
  }

  async function handleCreateJob(e: FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setSaving(false);
      return;
    }

    const skillList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const { error } = await supabase.from("jobs").insert({
      created_by: user.id,
      company_name: companyName,
      title,
      description,
      location: location || null,
      job_type: jobType,
      experience_required: Number(experience),
      salary: salary || null,
      skills: skillList,
      minimum_cgpa: minimumCgpa ? Number(minimumCgpa) : null,
      application_deadline: deadline || null,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Job posted successfully! 🎉");

      setTitle("");
      setDescription("");
      setLocation("");
      setJobType("internship");
      setExperience("0");
      setSalary("");
      setSkills("");
      setMinimumCgpa("");
      setDeadline("");

      await loadCompanyDashboard();
    }

    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">
            CampusBridge
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {companyName}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r bg-white p-5 md:block">
          <nav className="space-y-2">
            <a
              href="/company/dashboard"
              className="block rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Dashboard
            </a>

            <a
              href="#post-job"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Post a Job
            </a>

            <a
              href="#my-jobs"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              My Jobs
            </a>

            <a
              href="#candidates"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Candidates
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="w-full p-6 md:p-10">
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {companyName} 👋
            </h2>

            <p className="mt-2 text-gray-500">
              Post opportunities and discover talented students.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="mt-2 text-3xl font-bold">
                {jobs.filter((job) => job.status === "active").length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Candidates</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>
          </div>

          {/* Post Job */}
          <div
            id="post-job"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900">
              Post a New Job
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create an internship or full-time opportunity for students.
            </p>

            <form
              onSubmit={handleCreateJob}
              className="mt-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Frontend Developer Intern"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  placeholder="Describe the role, responsibilities and requirements..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Delhi / Remote"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Type
                  </label>

                  <select
                    value={jobType}
                    onChange={(e) =>
                      setJobType(
                        e.target.value as "internship" | "full-time"
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Required (years)
                  </label>

                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    min="0"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salary / Stipend
                  </label>

                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="₹20,000/month"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Required Skills
                </label>

                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, JavaScript, TypeScript, Git"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Separate skills with commas.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum CGPA
                  </label>

                  <input
                    type="number"
                    value={minimumCgpa}
                    onChange={(e) => setMinimumCgpa(e.target.value)}
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="7.5"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Application Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Posting..." : "Post Job"}
              </button>
            </form>

            {message && (
              <div className="mt-5 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">
                {message}
              </div>
            )}
          </div>

          {/* My Jobs */}
          <div
            id="my-jobs"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900">
              My Jobs
            </h3>

            {jobs.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-700">
                  You haven't posted any jobs yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Your posted opportunities will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {job.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          {job.job_type === "internship"
                            ? "Internship"
                            : "Full-time"}
                          {job.location
                            ? ` • ${job.location}`
                            : ""}
                        </p>
                      </div>

                      <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {job.status}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>

                    {job.skills?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Candidates Placeholder */}
          <div
            id="candidates"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900">
              Candidates
            </h3>

            <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-700">
                Candidate search is coming next.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Soon you will be able to search students by skills,
                college, CGPA and experience.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}