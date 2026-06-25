import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, Building2, BookOpen,
  ClipboardList, FileBarChart, FlaskConical, FolderKanban, CalendarDays,
  Megaphone, UserCircle, Settings as SettingsIcon, School, ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type Role } from "@/lib/auth";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Management",
    items: [
      { to: "/users", label: "User Management", icon: UserCog, roles: ["admin"] },
      { to: "/students", label: "Students", icon: GraduationCap, roles: ["admin", "faculty"] },
      { to: "/faculty", label: "Faculty", icon: Users, roles: ["admin"] },
      { to: "/departments", label: "Departments", icon: Building2, roles: ["admin"] },
      { to: "/classes", label: "Classes", icon: School, roles: ["admin", "faculty"] },
      { to: "/subjects", label: "Subjects", icon: BookOpen },
    ],
  },
  {
    section: "Academics",
    items: [
      { to: "/attendance", label: "Attendance", icon: ClipboardList },
      { to: "/results", label: "Results", icon: FileBarChart },
      { to: "/practical-manuals", label: "Practical Manuals", icon: FlaskConical },
      { to: "/project-marks", label: "Project Marks", icon: FolderKanban },
      { to: "/timetable", label: "Timetable", icon: CalendarDays },
      { to: "/notices", label: "Notices", icon: Megaphone },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: UserCircle },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out",
          collapsed ? "w-[76px]" : "w-64",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-sm">
            <School className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold leading-tight text-sidebar-foreground">
                Zeal Polytechnic
              </div>
              <div className="truncate text-[11px] font-medium text-muted-foreground">
                DeptDesk ERP
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => {
            const visible = group.items.filter(
              (i) => !i.roles || (user && i.roles.includes(user.role)),
            );
            if (visible.length === 0) return null;
            return (
              <div key={group.section} className="mb-5">
                {!collapsed && (
                  <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.section}
                  </div>
                )}
                <ul className="space-y-1">
                  {visible.map((item) => {
                    const active = pathname === item.to || pathname.startsWith(item.to + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={onMobileClose}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-sm"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            collapsed && "justify-center px-2",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={onToggle}
          className="m-3 hidden items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground md:flex"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
