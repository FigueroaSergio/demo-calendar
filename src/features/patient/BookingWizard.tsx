import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { providerRepository } from "../../application/services";
import type {
  Provider,
  ProviderAvailability,
} from "../../domain/models/Provider";
import { useAppDispatch } from "../../application/hooks";
import { bookNewAppointment } from "../../application/slices/appointmentSlice";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  CheckCircle2,
  List as ListIcon,
} from "lucide-react";
import { Calendar } from "../../components/ui/calendar";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export function BookingWizard() {
  const { t } = useTranslation();
  const { providerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [availabilities, setAvailabilities] = useState<ProviderAvailability[]>(
    [],
  );

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");

  useEffect(() => {
    if (!providerId) return;

    async function loadData() {
      const p = await providerRepository.getProviderById(providerId!);
      setProvider(p);
      const start = new Date();
      const end = addDays(start, 14);
      const avails = await providerRepository.getAvailability(
        providerId!,
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0],
      );
      setAvailabilities(avails);
    }
    loadData();
  }, [providerId]);

  const handleBook = async () => {
    if (!provider || !selectedDate || !selectedTime) return;
    setStep(4); // Loading

    await dispatch(
      bookNewAppointment({
        patientId: "patient1", // Hardcoded for demo
        providerId: provider.id,
        date: selectedDate,
        time: selectedTime,
        type: "INITIAL_CONSULTATION",
      }),
    ).unwrap();

    setStep(5); // Success
  };

  if (!provider)
    return (
      <div className="p-8 text-center animate-pulse">
        Loading provider details...
      </div>
    );

  const availableDates = availabilities
    .filter((a) => a.slots.length > 0)
    .map((a) => parseISO(a.date));

  return (
    <div className="w-full max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {t("patient.booking.backToSearch")}
      </Button>

      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-2 mx-1 rounded-full transition-colors duration-500 ${step >= i && step < 4 ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("patient.booking.selectDate")}</CardTitle>
              <div className="flex bg-muted p-1 rounded-md">
                  <Button
                    variant={viewMode === "LIST" ? "white" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setViewMode("LIST")}
                  >
                    <ListIcon className="w-4 h-4 mr-1" /> {t("patient.booking.listView")}
                  </Button>
                  <Button
                    variant={viewMode === "CALENDAR" ? "white" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setViewMode("CALENDAR")}
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" /> {t("patient.booking.calendarView")}
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "LIST" ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {availabilities.map((av) => (
                    <div
                      key={av.date}
                      className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${selectedDate === av.date ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "hover:border-primary/30 hover:bg-muted/50"}`}
                      onClick={() => setSelectedDate(av.date)}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon
                          className={cn(
                            "w-5 h-5",
                            selectedDate === av.date
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium text-lg",
                            selectedDate === av.date
                              ? "text-primary"
                              : "text-foreground",
                          )}
                        >
                          {format(parseISO(av.date), "EEEE, MMMM d")}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {t("patient.booking.slotsAvailable", { count: av.slots.length })}
                      </span>
                    </div>
                  ))}
                  {availabilities.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {t("patient.booking.noSlots")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? parseISO(selectedDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const dateStr = format(date, "yyyy-MM-dd");
                        setSelectedDate(dateStr);
                      }
                    }}
                    disabled={(date) => {
                      return (
                        date < new Date() ||
                        !availableDates.some((availDate) =>
                          isSameDay(date, availDate),
                        )
                      );
                    }}
                    className="rounded-md border shadow"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button disabled={!selectedDate} onClick={() => setStep(2)}>
                {t("common.save")}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>{t("patient.booking.selectTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {availabilities
                  .find((a) => a.date === selectedDate)
                  ?.slots.map((t) => (
                    <Button
                      key={t}
                      variant={selectedTime === t ? "default" : "outline"}
                      className={`h-12 text-md transition-all ${selectedTime === t ? "ring-2 ring-offset-2 ring-primary bg-primary text-primary-foreground" : "hover:border-primary/30"}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      <Clock className="w-4 h-4 mr-2 opacity-70" /> {t}
                    </Button>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                {t("common.back")}
              </Button>
              <Button disabled={!selectedTime} onClick={() => setStep(3)}>
                {t("common.save")}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>{t("patient.booking.confirmBooking")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-6 rounded-lg border border-primary/10">
                <h3 className="font-semibold text-lg mb-4">
                  {t("patient.booking.details")}
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("admin.table.doctor")}</span>
                    <span className="font-medium text-foreground">
                      {provider.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("patient.booking.selectDate")}</span>
                    <span className="font-medium text-foreground">
                      {selectedDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("patient.booking.selectTime")}</span>
                    <span className="font-medium text-foreground">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("patient.booking.service")}</span>
                    <span className="font-medium text-foreground">
                      {t("patient.booking.initialConsult")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                {t("common.back")}
              </Button>
              <Button onClick={handleBook} className="w-full sm:w-auto">
                {t("patient.booking.confirmButton")}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 4 && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
              {t("patient.booking.securing")}
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="py-16 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                {t("patient.booking.confirmed")}
              </h2>
              <p className="text-slate-500 max-w-md">
                {t("patient.booking.successMessage", { 
                  name: provider.name, 
                  date: selectedDate, 
                  time: selectedTime 
                })}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                {t("patient.booking.bookAnother")}
              </Button>
              <Button onClick={() => navigate("/patient")}>
                {t("patient.booking.viewPortal")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
