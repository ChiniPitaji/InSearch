"use client";

import { useState } from "react";
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

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

    const { error } = await supabase.from("student_profiles").upsert({
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
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved successfully! 🎉");
    }

    setLoading(false);
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
