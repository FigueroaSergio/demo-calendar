import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Menu, X, ChevronRight, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NAVIGATION_ITEMS } from "../../config/navigation";
import { cn } from "../../lib/utils";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-2.5 md:py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
        >
          <div className="p-1.5 bg-primary rounded-lg shadow-sm group-hover:bg-primary/90 transition-colors shrink-0">
            <Calendar className="size-4 md:size-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
            {t("common.appName")}
          </h1>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:hidden">
            SGM
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAVIGATION_ITEMS.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:text-white dark:hover:bg-slate-900",
                )}
              >
                <ActiveIcon
                  className={cn(
                    "w-4 h-4",
                    active ? "text-primary" : "text-muted-foreground/60",
                  )}
                />
                {t(item.i18nKey)}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Languages className="h-4 w-4" />
                <span className="sr-only">Toggle language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={i18n.language === "en"}
                onCheckedChange={() => changeLanguage("en")}
              >
                English {i18n.language === "en" && "✓"}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={i18n.language === "es"}
                onCheckedChange={() => changeLanguage("es")}
              >
                Español {i18n.language === "es" && "✓"}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={i18n.language === "it"}
                onCheckedChange={() => changeLanguage("it")}
              >
                Italian
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent
              className="fixed inset-y-0 right-0 left-auto top-0 translate-x-0 translate-y-0 h-full w-[280px] border-l bg-white dark:bg-slate-950 p-0 shadow-2xl duration-300 rounded-none border-none outline-none dark:ring-slate-800 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
              showCloseButton={false}
            >
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary rounded-lg shadow-sm group-hover:bg-primary/90 transition-colors shrink-0">
                      <Calendar className="size-4 md:size-5 text-primary-foreground" />
                    </div>

                    <span className="font-bold text-lg">
                      {t("common.menu")}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {t("common.menuDescription")}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <div className="flex flex-col gap-2">
                    {NAVIGATION_ITEMS.map((item) => {
                      const ActiveIcon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl transition-all border",
                            active
                              ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/40 dark:text-primary-foreground"
                              : "border-transparent text-foreground hover:bg-muted dark:text-slate-300 dark:hover:bg-slate-900",
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                active
                                  ? "bg-primary/20 dark:bg-primary/30"
                                  : "bg-muted dark:bg-slate-900",
                              )}
                            >
                              <ActiveIcon
                                className={cn(
                                  "w-5 h-5",
                                  active
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                            <span className="font-semibold">
                              {t(item.i18nKey)}
                            </span>
                          </div>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 opacity-50",
                              active ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-t bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-xs text-center text-slate-400 italic">
                    {t("common.appName")} Group
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
