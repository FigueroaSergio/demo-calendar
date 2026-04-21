import { Calendar, User, LayoutDashboard, Stethoscope } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  i18nKey: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Book Appointment",
    href: "/",
    icon: Calendar,
    i18nKey: "nav.book",
  },
  {
    label: "My Portal",
    href: "/patient",
    icon: User,
    i18nKey: "nav.portal",
  },
  {
    label: "Admin",
    href: "/admin",
    icon: LayoutDashboard,
    i18nKey: "nav.admin",
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: Stethoscope,
    i18nKey: "nav.doctors",
  },
];
