"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StudentProfilePage() {
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState("");
  
  // New "Open to Recruiters" states
  const [openToRecruiters, setOpenToRecruiters] = useState(false);
  const [isMigrationRequired, setIsMigrationRequired] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      setProfileLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfileLoading(false);
        return;
      }

      // Try fetching with open_to_recruiters
      const { data, error } = await supabase
        .from("student_profiles")
        .select("phone, location, college_name, degree, branch, graduation_year, cgpa, skills, open_to_recruiters")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        // If PGRST111 / 42703 error (column does not exist) or similar message, fallback
        if (error.code === "42703" || error.message.includes("open_to_recruiters")) {
          setIsMigrationRequired(true);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("student_profiles")
            .select("phone, location, college_name, degree, branch, graduation_year, cgpa, skills")
            .eq("id", user.id)
            .maybeSingle();

          if (!fallbackError && fallbackData) {
            populateFields(fallbackData);
          }
        } else {
          console.error("Error loading profile:", error.message);
        }
      } else if (data) {
        populateFields(data);
        setOpenToRecruiters(!!data.open_to_recruiters);
      }
      setProfileLoading(false);
    }

    function populateFields(data: any) {
      setPhone(data.phone || "");
      setLocation(data.location || "");
      setCollegeName(data.college_name || "");
      setDegree(data.degree || "");
      setBranch(data.branch || "");
      setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
      setCgpa(data.cgpa ? String(data.cgpa) : "");
      setSkills(data.skills ? data.skills.join(", ") : "");
    }

    loadProfile();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const skillList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const payload: any = {
      id: user.id,
      phone,
      location,
      college_name: collegeName,
      degree,
      branch,
      graduation_year: graduationYear ? Number(graduationYear) : null,
      cgpa: cgpa ? Number(cgpa) : null,
      skills: skillList,
      updated_at: new Date().toISOString(),
    };

    // Only include open_to_recruiters if database column exists
    if (!isMigrationRequired) {
      payload.open_to_recruiters = openToRecruiters;
    }

    const { error } = await supabase.from("student_profiles").upsert(payload);

    if (error) {
      if (error.code === "42703" || error.message.includes("open_to_recruiters")) {
        setIsMigrationRequired(true);
        // Retry saving without open_to_recruiters column so the rest of the profile isn't blocked
        delete payload.open_to_recruiters;
        const { error: retryError } = await supabase.from("student_profiles").upsert(payload);
        if (retryError) {
          setMessage(retryError.message);
        } else {
          setMessage("Profile saved (except for 'Open to Recruiters' which requires a SQL migration). 🎉");
        }
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage("Profile saved successfully! 🎉");
    }

    setLoading(false);
  }

  if (profileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Complete your profile so companies can discover you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Contact Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Delhi, India"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Education
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    College / University
                  </label>

                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Your college or university"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Degree
                    </label>

                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="B.Tech"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Branch
                    </label>

                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Science"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Graduation Year
                    </label>

                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2027"
                      min="1900"
                      max="2100"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CGPA
                    </label>

                    <input
                      type="number"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="8.50"
                      min="0"
                      max="10"
                      step="0.01"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Skills
              </h2>

              <label className="block text-sm font-medium text-gray-700">
                Your Skills
              </label>

              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, React, Python, SQL"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <p className="mt-2 text-sm text-gray-500">
                Separate multiple skills with commas.
              </p>
            </section>

            {/* Visibility */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Visibility
              </h2>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 p-4">
                <input
                  type="checkbox"
                  checked={openToRecruiters}
                  onChange={(e) => setOpenToRecruiters(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-700">
                    Open to Recruiters
                  </span>

                  <span className="mt-1 block text-sm text-gray-500">
                    Allow verified companies to discover your profile in candidate search.
                  </span>
                </span>
              </label>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

            {message && (
              <div className="rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
