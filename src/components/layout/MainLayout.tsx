import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />

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
