import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  appointmentRepository,
  providerRepository,
} from "../../application/services";
import type { Appointment } from "../../domain/models/Appointment";
import type { Provider } from "../../domain/models/Provider";
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Settings,
  Stethoscope,
} from "lucide-react";
import { CapacityList } from "./CapacityList";
import { DensityHeatmap } from "./DensityHeatmap";
import { ProviderFormDialog } from "./ProviderFormDialog";
import { AvailabilityConfigDialog } from "./AvailabilityConfigDialog";

export function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAvailOpen, setIsAvailOpen] = useState(false);
  const [activeProviderForAvail, setActiveProviderForAvail] =
    useState<Provider | null>(null);

  const load = async () => {
    const provs = await providerRepository.getAllProviders();
    setProviders(provs);

    let allAppts: Appointment[] = [];
    if (selectedProvider === "ALL") {
      for (const p of provs) {
        allAppts = [
          ...allAppts,
          ...(await appointmentRepository.getAppointmentsByProvider(p.id)),
        ];
      }
    } else {
      allAppts =
        await appointmentRepository.getAppointmentsByProvider(selectedProvider);
    }
    setAppointments(allAppts);
  };

  useEffect(() => {
    load();
  }, [selectedProvider]);

  // Analytics Math
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const noShow = appointments.filter((a) => a.status === "NO_SHOW").length;
  const currPending = appointments.filter(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED",
  ).length;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("admin.dashboard.title")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("admin.dashboard.allProviders")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("admin.dashboard.allProviders")}</SelectItem>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> {t("admin.dashboard.addProvider")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.totalAppts")}
              </p>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {t("admin.dashboard.growth", { value: 12.5 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.completionRate")}
              </p>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">
              {total > 0 ? Math.round((completed / total) * 100) : 0}%
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {t("admin.dashboard.growth", { value: 3.2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.noShowRate")}
              </p>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-3xl font-bold">
              {total > 0 ? Math.round((noShow / total) * 100) : 0}%
            </div>
            <p className="text-xs text-destructive font-medium mt-1">
              +0.8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium uppercase text-muted-foreground">
                {t("admin.dashboard.upcomingToday")}
              </p>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{currPending}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {t("admin.dashboard.densityWarning")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DensityHeatmap />
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {t("admin.dashboard.realTimeSchedule")}
                <Clock className="w-4 h-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 5).map((a) => {
                  const p = providers.find((prov) => prov.id === a.providerId);
                  return (
                    <div
                      key={a.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0 hover:bg-muted/30 transition-colors p-2 rounded-md -mx-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {a.patientId.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {t("portal.nameLabel")} {a.patientId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground">
                          {a.time}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-emerald-600">
                          {a.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {appointments.length === 0 && (
                  <div className="text-sm text-slate-500 py-4 text-center">
                    {t("admin.dashboard.noAppts")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <CapacityList providers={providers} appointments={appointments} />
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.dashboard.quickManagement")}</CardTitle>
              <CardDescription>{t("admin.dashboard.configureStaff")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{p.name}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setActiveProviderForAvail(p);
                      setIsAvailOpen(true);
                    }}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-slate-600 border-slate-200"
                  onClick={() => navigate("/admin/doctors")}
                >
                  <Stethoscope className="w-4 h-4" />
                  {t("admin.dashboard.manageAllDoctors")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProviderFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={load}
      />
      <AvailabilityConfigDialog
        open={isAvailOpen}
        onOpenChange={setIsAvailOpen}
        provider={activeProviderForAvail}
      />
    </div>
  );
}
