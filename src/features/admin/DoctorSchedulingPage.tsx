import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sun,
  Sunset,
  Moon,
  Coffee,
  Play,
  CheckCircle,
  AlertTriangle,
  CalendarRange,
  Users,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { providerRepository } from "@/application/services";
import { Provider } from "@/domain/models/Provider";

interface RosterSolution {
  roster: string[][];
}

interface SolverResponse {
  status: string;
  model_used: string;
  solve_duration_seconds: number;
  solutions_count: number;
  solutions: RosterSolution[];
  statistics: Record<string, any>;
}

export function DoctorSchedulingPage() {
  const { t } = useTranslation();

  const [numDoctors, setNumDoctors] = useState<number>(7);
  const [numDays, setNumDays] = useState<number>(10);
  const [reqDay, setReqDay] = useState<number>(1);
  const [reqEvening, setReqEvening] = useState<number>(1);
  const [reqNight, setReqNight] = useState<number>(1);
  const [minNight, setMinNight] = useState<number>(1);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProvider] = useState<Provider[]>([]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await providerRepository.getAllProviders();
      setProvider(data);
      setNumDoctors(data.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalRequiredPerDay = reqDay + reqEvening + reqNight;
  const isImpossible = totalRequiredPerDay > numDoctors;

  const handleSolve = async () => {
    if (numDays > 30) {
      setError(t("scheduling.errors.maxDays"));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const doctors = Array.from({ length: numDoctors }, (_, i) => `med${i + 1}`);
    const days = Array.from({ length: numDays }, (_, i) => `D${i + 1}`);

    try {
      const response = await fetch("http://localhost:8000/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nurses: doctors,
          days: days,
          req_day: reqDay,
          req_evening: reqEvening,
          req_night: reqNight,
          min_night: minNight,
          intermediate_solutions: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.detail || `Server error (Status ${response.status})`,
        );
      }

      const data: SolverResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || t("scheduling.errors.serverCommunication"));
    } finally {
      setLoading(false);
    }
  };

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case "d":
        return (
          <Badge className="bg-amber-100 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900 gap-1 font-semibold py-1">
            <Sun className="w-3.5 h-3.5 shrink-0" />
            <span>{t("scheduling.shifts.day")}</span>
          </Badge>
        );
      case "e":
        return (
          <Badge className="bg-orange-100 hover:bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900 gap-1 font-semibold py-1">
            <Sunset className="w-3.5 h-3.5 shrink-0" />
            <span>{t("scheduling.shifts.evening")}</span>
          </Badge>
        );
      case "n":
        return (
          <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-primary/20 gap-1 font-semibold py-1">
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span>{t("scheduling.shifts.night")}</span>
          </Badge>
        );
      case "o":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-muted/50 hover:bg-muted/50 text-muted-foreground border-border gap-1 py-1"
          >
            <Coffee className="w-3.5 h-3.5 shrink-0" />
            <span>{t("scheduling.shifts.off")}</span>
          </Badge>
        );
    }
  };

  return (
    <div className=" mx-auto py-6 px-4  space-y-8 animate-in fade-in duration-500">
      {/* <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 text-primary-foreground shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                MiniZinc Gecode Solver
              </Badge>
              <Badge
                variant="outline"
                className="text-primary-foreground/80 border-primary-foreground/30"
              >
                Evening Shift Variant
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("scheduling.title")}
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base mt-1 max-w-xl">
              {t("scheduling.subtitle")}
            </p>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-md rounded-xl p-3 border border-primary-foreground/10 flex items-center gap-3 self-stretch md:self-auto justify-center">
            <CalendarRange className="text-primary-foreground/80 w-8 h-8" />
            <div className="text-left">
              <div className="text-xs text-primary-foreground/60">
                {t("scheduling.targetRange")}
              </div>
              <div className="text-sm font-semibold">
                {t("scheduling.daysSchedule", { count: numDays })}
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <Card className="shadow-md border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("scheduling.staffParams")}
          </CardTitle>
          <CardDescription>{t("scheduling.staffParamsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="numDays" className="text-foreground">
                {t("scheduling.daysLabel")}
              </Label>
              <Input
                id="numDays"
                type="number"
                min={1}
                max={30}
                value={numDays}
                onChange={(e) => setNumDays(parseInt(e.target.value) || 0)}
                onBlur={() => {
                  setNumDays((prev) => Math.min(30, Math.max(1, prev)));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reqDay"
                className="text-sm font-semibold flex justify-between text-foreground"
              >
                <span>{t("scheduling.reqDayLabel")}</span>
                <span className="text-primary font-bold">
                  {reqDay} {t("scheduling.doc")}
                </span>
              </Label>
              <Input
                id="reqDay"
                type="number"
                min={0}
                value={reqDay}
                onChange={(e) =>
                  setReqDay(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reqEvening"
                className="text-sm font-semibold flex justify-between text-foreground"
              >
                <span>{t("scheduling.reqEveningLabel")}</span>
                <span className="text-primary font-bold">
                  {reqEvening} {t("scheduling.doc")}
                </span>
              </Label>
              <Input
                id="reqEvening"
                type="number"
                min={0}
                value={reqEvening}
                onChange={(e) =>
                  setReqEvening(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reqNight"
                className="text-sm font-semibold flex justify-between text-foreground"
              >
                <span>{t("scheduling.reqNightLabel")}</span>
                <span className="text-primary font-bold">
                  {reqNight} {t("scheduling.doc")}
                </span>
              </Label>
              <Input
                id="reqNight"
                type="number"
                min={0}
                value={reqNight}
                onChange={(e) =>
                  setReqNight(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="minNight"
                className="text-sm font-semibold flex justify-between text-foreground"
              >
                <span>{t("scheduling.minNightLabel")}</span>
                <span className="text-primary font-bold">
                  {minNight} {t("scheduling.shiftsLabel")}
                </span>
              </Label>
              <Input
                id="minNight"
                type="number"
                min={0}
                value={minNight}
                onChange={(e) =>
                  setMinNight(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            {isImpossible && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg flex gap-2.5 text-xs text-amber-800 dark:text-amber-300 flex-1 min-w-[200px]">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <span>
                  {t("scheduling.errors.impossible", {
                    required: totalRequiredPerDay,
                    doctors: numDoctors,
                  })}
                </span>
              </div>
            )}

            <Button
              onClick={handleSolve}
              disabled={loading || isImpossible}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all hover:scale-[1.01] min-w-[180px]"
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  <span>{t("scheduling.solving")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <Play className="w-4 h-4 fill-primary-foreground" />
                  <span>{t("scheduling.generateButton")}</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="w-full space-y-6">
        {!loading && !error && !result && (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border">
            <div className="bg-muted p-4 rounded-full text-muted-foreground mb-4 animate-pulse">
              <CalendarRange className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t("scheduling.noSchedule")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {t("scheduling.noScheduleDesc")}
            </p>
          </Card>
        )}

        {loading && (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-border">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t("scheduling.solving")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 animate-pulse">
              {t("scheduling.solvingDesc", {
                doctors: numDoctors,
                days: numDays,
              })}
            </p>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 p-6 shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-destructive">
                  {t("scheduling.solverError")}
                </h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
                <div className="mt-4 text-xs text-destructive bg-destructive/10 dark:bg-destructive/5 p-2.5 rounded border border-destructive/20 max-w-lg">
                  <strong>{t("scheduling.troubleshooting")}:</strong>{" "}
                  {t("scheduling.verifyServer", {
                    url: "http://localhost:8000",
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground font-semibold uppercase">
                  {t("scheduling.stats.status")}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  {result.status === "SATISFIED" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {t("scheduling.stats.feasible")}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                      <span className="text-sm font-bold text-destructive">
                        {result.status}
                      </span>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground font-semibold uppercase">
                  {t("scheduling.stats.solveTime")}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground">
                    {result.solve_duration_seconds}s
                  </span>
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground font-semibold uppercase">
                  {t("scheduling.stats.model")}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-xs font-semibold truncate text-foreground">
                    {result.model_used.includes("variant")
                      ? t("scheduling.models.variant")
                      : t("scheduling.models.default")}
                  </span>
                </div>
              </Card>
            </div>

            {result.status === "UNSATISFIABLE" && (
              <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 p-6 shadow-sm">
                <div className="flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-amber-800 dark:text-amber-400">
                      {t("scheduling.errors.unfeasibleTitle")}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {t("scheduling.errors.unfeasibleDesc")}
                    </p>
                    <div className="mt-4 text-xs text-amber-600 bg-amber-100/50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200/50 dark:border-amber-900/40 max-w-lg">
                      <strong>{t("scheduling.suggestionsTitle")}:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>{t("scheduling.suggestions.increaseDoctors")}</li>
                        <li>
                          {t("scheduling.suggestions.reduceRequirements")}
                        </li>
                        <li>{t("scheduling.suggestions.lowerMinNight")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            {result.status === "SATISFIED" && result.solutions.length > 0 && (
              <Card className="shadow-md overflow-hidden">
                <CardHeader className="border-b border-border px-6">
                  <CardTitle className="text-base font-bold text-foreground">
                    {t("scheduling.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("scheduling.gridSubtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted border-b border-border">
                          <TableHead className="font-bold text-foreground sticky left-0 bg-muted px-4 py-3 z-10 w-[140px] border-r border-border">
                            {t("scheduling.medico")}
                          </TableHead>
                          {Array.from({ length: numDays }, (_, idx) => (
                            <TableHead
                              key={idx}
                              className="text-center font-bold px-3 text-xs w-[80px] shrink-0 text-foreground"
                            >
                              {t("scheduling.dayLabel")} {idx + 1}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.solutions[0].roster.map(
                          (rowShifts, doctorIdx) => (
                            <TableRow
                              key={doctorIdx}
                              className="hover:bg-muted/20 border-b border-border"
                            >
                              <TableCell className="font-bold text-sm text-foreground sticky left-0 bg-background px-4 py-3 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                {providers[doctorIdx]?.name}
                              </TableCell>
                              {rowShifts.map((shift, dayIdx) => (
                                <TableCell
                                  key={dayIdx}
                                  className="text-center px-2.5 py-3 align-middle shrink-0"
                                >
                                  <div className="flex items-center justify-center h-full">
                                    {getShiftBadge(shift)}
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
