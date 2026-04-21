import { Outlet, Link } from "react-router-dom";
import { Calendar, User, LayoutDashboard } from "lucide-react";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-10 w-full border-b bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            St. Glacier Medical
          </h1>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            Book Appointment
          </Link>
          <Link
            to="/patient"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <User className="w-4 h-4" /> My Portal
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <Link
            to="/admin"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <LayoutDashboard className="w-4 h-4" /> Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full bg-inherit">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10 lg:px-12">
          <Outlet />
        </div>
      </main>

      <footer className="w-full border-t bg-white dark:bg-slate-950 py-8 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} St. Glacier Medical. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
