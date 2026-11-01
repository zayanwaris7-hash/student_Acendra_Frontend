
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  MessageCircle,
  UserRound,
  UserSearch,
  FolderKanban,
  Users,
  Settings,
  GraduationCap,
  ClipboardList,
  ChevronRight,
  Trophy,
  Compass,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/themeToggle";

const menuItems = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Requests",
    href: "/student/requests",
    icon: ClipboardList,
  },
   {
    title: "Other Profiles",
    href: "/student/other-profiles",
    icon: UserSearch,
  },
  {
    title: "Communication",
    href: "/student/communication",
    icon: MessageCircle,
  },
  {
    title: "My Profile",
    href: "/student/profile",
    icon: UserRound,
  },
  {
    title: "My Projects",
    href: "/student/projects",
    icon: FolderKanban,
  },
  {
    title: "Explore Projects",
    href: "/student/explore",
    icon: Compass,
  },
  {
    title: "Community",
    href: "/student/community",
    icon: Users,
  },
  {
    title: "Leaderboard",
    href: "/student/leaderboard",
    icon: Trophy,
  },
  {
    title: "Settings",
    href: "/student/settings",
    icon: Settings,
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-colors duration-200">

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <GraduationCap size={23} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Acendra
          </h1>
          <p className="text-xs text-muted-foreground">
            Student Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground transition-colors group-hover:text-accent-foreground"
                  }
                />

                {item.title}
              </span>

              {isActive && (
                <ChevronRight
                  size={16}
                  className="text-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-border p-4">

        {/* Theme Toggle */}
        <div className="flex items-center justify-between rounded-xl bg-muted p-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Appearance
            </p>
            <p className="text-xs text-muted-foreground">
              Change your theme
            </p>
          </div>

          <ThemeToggle />
        </div>

        {/* Student Account */}
        <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              Student Account
            </p>
            <p className="text-xs text-muted-foreground">
              Acendra Student
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
