"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  full_name: string;
  degree: string | null;
  branch: string | null;
  cgpa: number | null;
  graduation_year: number | null;
  location: string | null;
  skills: string[];
  open_to_recruiters: boolean;
};

type StudentRow = Omit<Student, "full_name"> & {
  profiles:
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null;
};

type SkillCount = {
  name: string;
  count: number;
};

export default function CollegeDashboard() {
  const [supabase] = useState(createClient);
  const router = useRouter();

  const [collegeName, setCollegeName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [recruiterFilter, setRecruiterFilter] = useState("all");

  useEffect(() => {
    async function loadDashboard() {
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

      if (profileError || !profile || profile.role !== "college") {
        setMessage("This dashboard is only available for college accounts.");
        setLoading(false);
        return;
      }

      const { data: collegeAdmin, error: collegeAdminError } = await supabase
        .from("college_admins")
        .select("college_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (collegeAdminError || !collegeAdmin) {
        setMessage(
          "Your account is not linked to a college. Please contact an administrator."
        );
        setLoading(false);
        return;
      }

      const { data: college, error: collegeError } = await supabase
        .from("colleges")
        .select("name")
        .eq("id", collegeAdmin.college_id)
        .single();

      if (collegeError || !college) {
        setMessage("Unable to load your college details right now.");
        setLoading(false);
        return;
      }

      setCollegeName(college.name);

      const { data: studentData, error: studentError } = await supabase
        .from("student_profiles")
        .select(
          "id, degree, branch, cgpa, graduation_year, location, skills, open_to_recruiters, profiles(full_name)"
        )
        .eq("college_id", collegeAdmin.college_id)
        .order("graduation_year", { ascending: true });

      if (studentError) {
        console.error(studentError);
        setMessage("Unable to load students for your college right now.");
        setStudents([]);
      } else {
        const studentRows = (studentData || []) as StudentRow[];

        setStudents(
          studentRows.map((student) => {
            const profileData = Array.isArray(student.profiles)
              ? student.profiles[0]
              : student.profiles;

            return {
              id: student.id,
              full_name: profileData?.full_name || "Student",
              degree: student.degree,
              branch: student.branch,
              cgpa: student.cgpa,
              graduation_year: student.graduation_year,
              location: student.location,
              skills: student.skills || [],
              open_to_recruiters: Boolean(student.open_to_recruiters),
            };
          })
        );
      }

      setLoading(false);
    }

    void loadDashboard();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  const cgpaValues = students
    .map((student) => student.cgpa)
    .filter((cgpa): cgpa is number => cgpa !== null);
  const averageCgpa =
    cgpaValues.length > 0
      ? cgpaValues.reduce((total, cgpa) => total + cgpa, 0) / cgpaValues.length
      : null;
  const studentsOpenToRecruiters = students.filter(
    (student) => student.open_to_recruiters
  ).length;
  const studentsWithSkills = students.filter((student) =>
    student.skills.some((skill) => skill.trim())
  ).length;

  const topSkills = Array.from(
    students
      .flatMap((student) => student.skills)
      .reduce((skills, skill) => {
        const normalizedSkill = skill.trim().toLowerCase();

        if (!normalizedSkill) {
          return skills;
        }

        const existing = skills.get(normalizedSkill);
        skills.set(normalizedSkill, {
          name: existing?.name || skill.trim(),
          count: (existing?.count || 0) + 1,
        });

        return skills;
      }, new Map<string, SkillCount>())
      .values()
  )
    .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name))
    .slice(0, 5);

  const degrees = Array.from(
    new Set(
      students
        .map((student) => student.degree)
        .filter((degree): degree is string => Boolean(degree))
    )
  ).sort();
  const branches = Array.from(
    new Set(
      students
        .map((student) => student.branch)
        .filter((branch): branch is string => Boolean(branch))
    )
  ).sort();

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesDegree =
      degreeFilter === "all" || student.degree === degreeFilter;
    const matchesBranch =
      branchFilter === "all" || student.branch === branchFilter;
    const matchesRecruiterStatus =
      recruiterFilter === "all" ||
      (recruiterFilter === "open" && student.open_to_recruiters) ||
      (recruiterFilter === "not_open" && !student.open_to_recruiters);

    return (
      matchesSearch &&
      matchesDegree &&
      matchesBranch &&
      matchesRecruiterStatus
    );
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading college dashboard...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            College Dashboard
          </h1>
          <p className="mt-3 text-gray-600">{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">CampusBridge</h1>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {collegeName}
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
        <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r bg-white p-5 md:block">
          <nav className="space-y-2">
            <a
              href="/college/dashboard"
              className="block rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Dashboard
            </a>
            <a
              href="#students"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Students
            </a>
            <a
              href="#drives"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Drives
            </a>
            <a
              href="#reports"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Reports
            </a>
            <a
              href="#settings"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
          </nav>
        </aside>

        <section className="w-full p-6 md:p-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {collegeName}
            </h2>
            <p className="mt-2 text-gray-500">
              Monitor your students and their recruiter visibility.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatisticCard label="Total Students" value={students.length} />
            <StatisticCard
              label="Open to Recruiters"
              value={studentsOpenToRecruiters}
            />
            <StatisticCard
              label="Average CGPA"
              value={averageCgpa === null ? "—" : averageCgpa.toFixed(2)}
            />
            <StatisticCard label="Skills Listed" value={studentsWithSkills} />
          </div>

          <div
            id="reports"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Top Skills
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                The most common skills listed by your students.
              </p>
            </div>

            {topSkills.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <p className="text-sm text-gray-500">
                  No student skills have been listed yet.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {topSkills.map((skill) => (
                  <div
                    key={skill.name.toLowerCase()}
                    className="rounded-xl bg-gray-100 p-4"
                  >
                    <p className="font-medium text-gray-900">{skill.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {skill.count} {skill.count === 1 ? "student" : "students"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            id="students"
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Students
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {filteredStudents.length} of {students.length} students shown
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterInput
                label="Search by name"
                value={search}
                onChange={setSearch}
                placeholder="Student name"
              />
              <FilterSelect
                label="Degree"
                value={degreeFilter}
                onChange={setDegreeFilter}
                options={degrees}
              />
              <FilterSelect
                label="Branch"
                value={branchFilter}
                onChange={setBranchFilter}
                options={branches}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recruiter Visibility
                </label>
                <select
                  value={recruiterFilter}
                  onChange={(event) => setRecruiterFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="all">All students</option>
                  <option value="open">Open to recruiters</option>
                  <option value="not_open">Not open to recruiters</option>
                </select>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-700">
                  No students are linked to this college yet.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Students will appear here once their profiles are linked to your college.
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-700">No students found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredStudents.map((student) => (
                  <article
                    key={student.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {student.full_name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {[student.degree, student.branch]
                            .filter(Boolean)
                            .join(" • ") || "Education details not listed"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                          student.open_to_recruiters
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {student.open_to_recruiters
                          ? "Open to Recruiters"
                          : "Not Open to Recruiters"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                      {student.cgpa !== null && (
                        <p>
                          ⭐ <strong>CGPA:</strong> {student.cgpa}
                        </p>
                      )}
                      {student.graduation_year && (
                        <p>
                          📅 <strong>Graduation:</strong>{" "}
                          {student.graduation_year}
                        </p>
                      )}
                      {student.location && (
                        <p>
                          📍 <strong>Location:</strong> {student.location}
                        </p>
                      )}
                    </div>

                    {student.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div id="drives" className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Drives</h3>
            <p className="mt-2 text-sm text-gray-500">
              Campus drive management will be available here soon.
            </p>
          </div>

          <div id="settings" className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
            <p className="mt-2 text-sm text-gray-500">
              College profile settings will be available here soon.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatisticCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
      >
        <option value="all">All {label.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
