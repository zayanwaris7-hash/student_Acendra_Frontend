
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Building2,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import CurrentYear from "./cuurentYear";

const platforms = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Showcase your skills",
  },
  {
    icon: Building2,
    title: "Universities",
    description: "Discover student talent",
  },
  {
    icon: BriefcaseBusiness,
    title: "Clients",
    description: "Find emerging talent",
  },
];

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">

      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
            <Sparkles size={32} />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Acendra<span className="text-primary">.</span>
          </h1>

          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Where talent meets opportunity.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-border bg-card/90 p-7 shadow-2xl backdrop-blur-xl sm:p-10">

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Welcome to Acendra
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your journey towards growth, collaboration,
              and new opportunities starts here.
            </p>
          </div>

          {/* Authentication actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Login to your account
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border border-border bg-background px-6 py-4 text-sm font-semibold transition hover:border-primary/50 hover:bg-muted"
            >
              Create a new account
            </Link>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              ONE CONNECTED ECOSYSTEM
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Platform information */}
          <div className="space-y-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;

              return (
                <div
                  key={platform.title}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      {platform.title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {platform.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
           © <CurrentYear /> Acendra. All rights reserved.
        </p>
      </div>
    </main>
  );
}
