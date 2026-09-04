import Header from "@/components/Header";

const audiences = [
  {
    title: "Students",
    description:
      "Find internships and jobs that match your skills, course, and career goals.",
    points: ["Browse verified openings", "Build a simple profile", "Apply in a few clicks"],
  },
  {
    title: "Companies",
    description:
      "Reach campus talent faster with a clear way to post roles and review applicants.",
    points: ["Post internships and jobs", "Discover campus talent", "Track applications"],
  },
  {
    title: "Colleges",
    description:
      "Support placements with one place for students, recruiters, and opportunity updates.",
    points: ["Share campus opportunities", "Support student placements", "Connect with recruiters"],
  },
];

const steps = [
  {
    number: "01",
    title: "Create your space",
    description: "Students, companies, and colleges will each have a simple starting point.",
  },
  {
    number: "02",
    title: "Share or discover roles",
    description: "Companies post openings. Students explore internships and jobs. Colleges support the process.",
  },
  {
    number: "03",
    title: "Move toward placement",
    description: "Applications, shortlists, and campus hiring will live in one professional platform.",
  },
];

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                Jobs · Internships · Campus placements
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Connecting students, companies, and colleges.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                CampusBridge is a professional platform for internships, jobs, and
                campus recruitment. This is the first version: a clean starting
                page. Sign-in, databases, and AI will come later.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#audiences"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Explore the platform
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-400"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Coming next</p>
              <h2 className="mt-2 text-xl font-semibold">A shared hiring workspace</h2>
              <ul className="mt-6 space-y-4">
                <li className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">Student applications</p>
                  <p className="mt-1 text-sm text-slate-600">
                    One place to find roles and keep track of internships and jobs.
                  </p>
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">Recruiter pipelines</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Companies will post openings and review campus talent.
                  </p>
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">College placements</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Placement cells will support students and hiring partners.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="audiences" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">Built for three groups</h2>
              <p className="mt-3 text-slate-600">
                The platform will serve students, companies, and colleges — without mixing their needs into one confusing screen.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {audiences.map((audience) => (
                <article
                  key={audience.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="text-xl font-semibold">{audience.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {audience.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {audience.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">How it will work</h2>
            <p className="mt-3 text-slate-600">
              We are starting with the website shell. These three steps describe the product we will build next.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-400">{step.number}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-600">
            CampusBridge — a starting point for campus hiring.
          </p>
          <p className="text-sm text-slate-500">
            Authentication, database, and AI are not included yet.
          </p>
        </div>
      </footer>
    </div>
  );
}
