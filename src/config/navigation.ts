import { Calendar, User, LayoutDashboard, Stethoscope } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Book Appointment",
    href: "/",
    icon: Calendar,
  },
  {
    label: "My Portal",
    href: "/patient",
    icon: User,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
];
