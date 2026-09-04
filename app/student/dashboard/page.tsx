"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type StudentProfile = {
  phone: string | null;
  location: string | null;
  college_name: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
  cgpa: number | null;
  skills: string[] | null;
};

export default function StudentDashboard() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] =
    useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      const { data: studentData } = await supabase
        .from("student_profiles")
        .select(
          "phone, location, college_name, degree, branch, graduation_year, cgpa, skills"
        )
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setStudentProfile(studentData);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

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

  const fields = [
    studentProfile?.phone,
    studentProfile?.location,
    studentProfile?.college_name,
    studentProfile?.degree,
    studentProfile?.branch,
    studentProfile?.graduation_year,
    studentProfile?.cgpa,
    studentProfile?.skills?.length
      ? studentProfile.skills.join(", ")
      : null,
  ];

  const completedFields = fields.filter(
    (field) => field !== null && field !== undefined && field !== ""
  ).length;

  const profileCompletion = Math.round(
    (completedFields / fields.length) * 100
  );

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
              {profile?.full_name || "Student"}
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
              href="/student/dashboard"
              className="block rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Dashboard
            </a>

            <a
              href="/student/profile"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              My Profile
            </a>

            <a
              href="#jobs"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Find Jobs
            </a>

            <a
              href="#applications"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Applications
            </a>

            <a
              href="#saved"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Saved Jobs
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="w-full p-6 md:p-10">
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {profile?.full_name || "Student"} 👋
            </h2>

            <p className="mt-2 text-gray-500">
              Manage your profile and discover opportunities.
            </p>
          </div>

          {/* Profile Completion */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Completion
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Complete your profile to improve your chances of being
                  discovered by companies.
                </p>
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {profileCompletion}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <a
              href="/student/profile"
              className="mt-5 inline-block text-sm font-semibold text-black hover:underline"
            >
              Complete / Edit Profile →
            </a>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Recommended Jobs</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Applications</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Saved Jobs</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div
            id="jobs"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Recommended Jobs
            </h3>

            <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-700">
                No job recommendations yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Job recommendations will appear here once companies start
                posting opportunities.
              </p>
            </div>
          </div>

          {/* Applications */}
          <div
            id="applications"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Applications
            </h3>

            <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-700">
                No applications yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Your job applications will appear here.
              </p>
            </div>
          </div>

          {/* Saved Jobs */}
          <div
            id="saved"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Saved Jobs
            </h3>

            <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-700">
                No saved jobs
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Jobs you save will appear here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}