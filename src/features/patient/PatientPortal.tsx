import React, { useEffect } from "react";
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
import { useAppDispatch, useAppSelector } from "../../application/hooks";
import {
  fetchPatientAppointments,
  cancelExistingAppointment,
} from "../../application/slices/appointmentSlice";
import { Calendar, Clock, Video, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PatientPortal() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { appointments, loading } = useAppSelector(
    (state) => state.appointments,
  );

  useEffect(() => {
    dispatch(fetchPatientAppointments("patient1"));
  }, [dispatch]);

  const upcoming = appointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED",
  );

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("patient.portal.title")}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t("patient.portal.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold mb-4">
            {t("patient.portal.upcoming")}
          </h3>

          {loading && <p className="animate-pulse">{t("common.loading")}</p>}
          {!loading && upcoming.length === 0 && (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-12 text-center text-slate-500">
                {t("patient.portal.noUpcoming")}
                <div className="mt-4">
                  <Button onClick={() => navigate("/")}>
                    {t("patient.portal.bookNow")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {upcoming.map((appt) => (
            <Card
              key={appt.id}
              className="overflow-hidden border-blue-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-blue-900">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">
                    {new Date(appt.date).toLocaleDateString(i18n.language, {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-slate-400 mx-2">&bull;</span>
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-600">
                    {appt.time}
                  </span>
                </div>
                <Badge
                  variant={
                    appt.status === "CONFIRMED" ? "default" : "secondary"
                  }
                >
                  {t(`patient.portal.appointmentStatus.${appt.status}`)}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">
                        {t("admin.table.doctor")} ID: {appt.providerId}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {t(`patient.appointmentType.${appt.type}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                        <Video className="w-4 h-4" />{" "}
                        {t("patient.portal.telehealth")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t("patient.portal.cancelConfirm"))) {
                          dispatch(
                            cancelExistingAppointment({
                              id: appt.id,
                              reason: "Patient requested",
                            }),
                          );
                        }
                      }}
                    >
                      {t("patient.portal.cancelButton")}
                    </Button>
                    <Button variant="secondary">
                      {t("patient.portal.reschedule")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("patient.portal.profileInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("patient.portal.nameLabel")}
                </p>
                <p className="font-medium">Jane Doe</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("patient.portal.emailLabel")}
                </p>
                <p className="font-medium">jane@example.com</p>
              </div>
              <Button variant="outline" className="w-full mt-2">
                {t("patient.portal.editProfile")}
              </Button>
            </CardContent>
          </Card>

          {past.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("patient.portal.pastVisits")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {past.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(a.date).toLocaleDateString(i18n.language)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(`patient.portal.appointmentType.${a.type}`)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === "COMPLETED" ? "outline" : "destructive"
                      }
                      className="text-xs"
                    >
                      {t(`patient.aportal.appointmentStatus.${a.status}`)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
