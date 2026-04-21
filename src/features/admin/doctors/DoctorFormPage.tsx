import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { providerRepository } from "../../../application/services";
import type {
  CreateProviderDTO,
  SlotConfig,
  DaySchedule,
  BreakPeriod,
} from "../../../domain/models/Provider";
import { DEFAULT_SLOT_CONFIG } from "../../../domain/models/Provider";
import {
  ArrowLeft,
  Save,
  User,
  Clock,
  Settings2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SPECIALTIES = [
  "Cardiologist",
  "Pediatrician",
  "Neurologist",
  "Dermatologist",
  "Orthopedist",
  "Psychiatrist",
  "Oncologist",
  "General Practitioner",
  "Radiologist",
  "Endocrinologist",
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const LANGUAGES_LIST = [
  "English", "Spanish", "French", "Mandarin", "Portuguese",
  "German", "Arabic", "Italian", "Russian", "Japanese",
];
const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60];
const BUFFER_TIMES = [0, 5, 10, 15, 20];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type FormStep = "profile" | "slots" | "advanced";

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

interface FormProfile {
  name: string;
  specialty: string;
  location: string;
  experienceYears: string;
  gender: string;
  avatarUrl: string;
  languages: string[];
  isActive: boolean;
}

const defaultProfile: FormProfile = {
  name: "",
  specialty: "",
  location: "St. Glacier Medical",
  experienceYears: "0",
  gender: "Male",
  avatarUrl: "https://i.pravatar.cc/150?img=3",
  languages: ["English"],
  isActive: true,
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? "bg-primary" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function StepIndicator({
  step,
  current,
  label,
  icon: Icon,
}: {
  step: FormStep;
  current: FormStep;
  label: string;
  icon: React.ElementType;
}) {
  const steps: FormStep[] = ["profile", "slots", "advanced"];
  const currentIdx = steps.indexOf(current);
  const stepIdx = steps.indexOf(step);
  const isDone = stepIdx < currentIdx;
  const isActive = step === current;

  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : isDone
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {isDone ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}

export function DoctorFormPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState<FormStep>("profile");
  const [saving, setSaving] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<FormProfile>(defaultProfile);
  const [langInput, setLangInput] = useState("");

  // Slot config state
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_SLOT_CONFIG);

  // Advanced panel expand per day
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(["MON"]));

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const doc = await providerRepository.getProviderById(id!);
        if (!doc) { navigate("/admin/doctors"); return; }
        setProfile({
          name: doc.name,
          specialty: doc.specialty,
          location: doc.location,
          experienceYears: String(doc.experienceYears),
          gender: doc.gender,
          avatarUrl: doc.avatarUrl,
          languages: doc.languages,
          isActive: doc.isActive !== false,
        });
        if (doc.slotConfig) setSlotConfig(doc.slotConfig);
      } finally {
        setLoadingDoctor(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ── Profile helpers ──────────────────────────────────────────────
  const setField = (k: keyof FormProfile, v: any) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const addLanguage = (lang: string) => {
    if (!lang || profile.languages.includes(lang)) return;
    setField("languages", [...profile.languages, lang]);
    setLangInput("");
  };

  const removeLanguage = (lang: string) =>
    setField("languages", profile.languages.filter((l) => l !== lang));

  // ── Slot config helpers ──────────────────────────────────────────
  const setSlotField = <K extends keyof SlotConfig>(k: K, v: SlotConfig[K]) =>
    setSlotConfig((c) => ({ ...c, [k]: v }));

  const setDayField = <K extends keyof DaySchedule>(
    day: string,
    k: K,
    v: DaySchedule[K]
  ) =>
    setSlotConfig((c) => ({
      ...c,
      schedule: {
        ...c.schedule,
        [day]: { ...c.schedule[day], [k]: v },
      },
    }));

  const addBreak = (day: string) =>
    setSlotConfig((c) => ({
      ...c,
      schedule: {
        ...c.schedule,
        [day]: {
          ...c.schedule[day],
          breaks: [
            ...c.schedule[day].breaks,
            { label: "Break", start: "12:00", end: "13:00" },
          ],
        },
      },
    }));

  const updateBreak = (
    day: string,
    bIdx: number,
    field: keyof BreakPeriod,
    value: string
  ) =>
    setSlotConfig((c) => ({
      ...c,
      schedule: {
        ...c.schedule,
        [day]: {
          ...c.schedule[day],
          breaks: c.schedule[day].breaks.map((b, i) =>
            i === bIdx ? { ...b, [field]: value } : b
          ),
        },
      },
    }));

  const removeBreak = (day: string, bIdx: number) =>
    setSlotConfig((c) => ({
      ...c,
      schedule: {
        ...c.schedule,
        [day]: {
          ...c.schedule[day],
          breaks: c.schedule[day].breaks.filter((_, i) => i !== bIdx),
        },
      },
    }));

  const toggleDayExpand = (day: string) =>
    setExpandedDays((s) => {
      const n = new Set(s);
      n.has(day) ? n.delete(day) : n.add(day);
      return n;
    });

  // ── Submit ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setError(null);
    if (!profile.name.trim()) { setError(t("doctorForm.messages.errorName")); return; }
    if (!profile.specialty) { setError(t("doctorForm.messages.errorSpecialty")); return; }

    setSaving(true);
    try {
      const dto: CreateProviderDTO = {
        name: profile.name.trim(),
        specialty: profile.specialty,
        location: profile.location,
        experienceYears: Number(profile.experienceYears),
        gender: profile.gender,
        avatarUrl: profile.avatarUrl,
        languages: profile.languages,
        slotConfig,
      };

      if (isEdit) {
        await providerRepository.updateProvider(id!, { ...dto, isActive: profile.isActive });
      } else {
        await providerRepository.createProvider(dto);
      }

      setSuccess(true);
      setTimeout(() => navigate("/admin/doctors"), 1200);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400">
        {t("doctorForm.messages.loading")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/doctors")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? t("doctorForm.titleEdit") : t("doctorForm.titleAdd")}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEdit 
              ? t("doctorForm.subtitleEdit", { name: profile.name }) 
              : t("doctorForm.subtitleAdd")}
          </p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
        <StepIndicator
          step="profile"
          current={step}
          label={t("doctorForm.stepProfile")}
          icon={User}
        />
        <StepIndicator
          step="slots"
          current={step}
          label={t("doctorForm.stepSlots")}
          icon={Clock}
        />
        <StepIndicator
          step="advanced"
          current={step}
          label={t("doctorForm.stepAdvanced")}
          icon={Settings2}
        />
      </div>

      {/* ── STEP: Profile ────────────────────────────────────────── */}
      {step === "profile" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("doctorForm.sections.basic")}</CardTitle>
              <CardDescription>{t("doctorForm.sections.basicSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.fullName")} *</label>
                  <Input
                    placeholder={t("doctorForm.placeholders.fullName")}
                    value={profile.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.specialty")} *</label>
                  <Select value={profile.specialty} onValueChange={(v) => setField("specialty", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("doctorForm.placeholders.specialty")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{t(`common.specialties.${s}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.location")}</label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setField("location", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.experience")}</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={profile.experienceYears}
                    onChange={(e) => setField("experienceYears", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.gender")}</label>
                  <Select value={profile.gender} onValueChange={(v) => setField("gender", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>{t(`common.genders.${g}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.avatar")}</label>
                  <div className="flex gap-2 items-center">
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <Input
                      value={profile.avatarUrl}
                      onChange={(e) => setField("avatarUrl", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.languages")}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.languages.map((l) => (
                    <Badge
                      key={l}
                      variant="secondary"
                      className="gap-1 cursor-pointer pr-1.5"
                      onClick={() => removeLanguage(l)}
                    >
                      {l}
                      <span className="text-slate-400 hover:text-red-500 leading-none">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={langInput} onValueChange={(v) => { addLanguage(v); setLangInput(""); }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("doctorForm.placeholders.addLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES_LIST.filter((l) => !profile.languages.includes(l)).map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active toggle (edit only) */}
              {isEdit && (
                <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-slate-50">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{t("doctorForm.labels.activeStatus")}</p>
                    <p className="text-xs text-slate-500">{t("doctorForm.labels.activeStatusSubtitle")}</p>
                  </div>
                  <Toggle checked={profile.isActive} onChange={(v) => setField("isActive", v)} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep("slots")} className="gap-2">
              {t("doctorForm.buttons.nextSlots")}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP: Time Slots ─────────────────────────────────────── */}
      {step === "slots" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("doctorForm.sections.slots")}</CardTitle>
              <CardDescription>{t("doctorForm.sections.slotsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.slotDuration")}</label>
                  <Select
                    value={String(slotConfig.slotDurationMinutes)}
                    onValueChange={(v) => setSlotField("slotDurationMinutes", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>{t("doctorForm.labels.minutes", { count: d })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buffer */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.buffer")}</label>
                  <Select
                    value={String(slotConfig.bufferMinutes)}
                    onValueChange={(v) => setSlotField("bufferMinutes", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_TIMES.map((b) => (
                        <SelectItem key={b} value={String(b)}>
                          {b === 0 ? t("doctorForm.labels.noBuffer") : t("doctorForm.labels.minutes", { count: b })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Max patients */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.maxPatients")}</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={slotConfig.maxPatientsPerSlot}
                    onChange={(e) => setSlotField("maxPatientsPerSlot", Number(e.target.value))}
                  />
                </div>

                {/* Advanced booking */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.advanceBooking")}</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={slotConfig.advancedBookingDays}
                    onChange={(e) => setSlotField("advancedBookingDays", Number(e.target.value))}
                  />
                </div>

                {/* Min notice */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.minNotice")}</label>
                  <Input
                    type="number"
                    min={0}
                    max={72}
                    value={slotConfig.minNoticeHours}
                    onChange={(e) => setSlotField("minNoticeHours", Number(e.target.value))}
                  />
                </div>

                {/* Auto confirm */ }
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("doctorForm.labels.autoConfirm")}</label>
                  <div className="flex items-center gap-3 h-10 px-3 border rounded-md bg-white">
                    <Toggle
                      checked={slotConfig.autoConfirm}
                      onChange={(v) => setSlotField("autoConfirm", v)}
                    />
                    <span className="text-sm text-slate-600">
                      {slotConfig.autoConfirm ? t("doctorForm.labels.enabled") : t("doctorForm.labels.disabled")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-blue-800 mb-1">{t("doctorForm.preview.title")}</p>
              <p className="text-xs text-blue-600">
                {t("doctorForm.preview.text", {
                  duration: slotConfig.slotDurationMinutes,
                  buffer: slotConfig.bufferMinutes,
                  total: slotConfig.slotDurationMinutes + slotConfig.bufferMinutes,
                  slots: Math.floor((8 * 60) / (slotConfig.slotDurationMinutes + slotConfig.bufferMinutes))
                })}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("profile")}>{t("doctorForm.buttons.back")}</Button>
            <Button onClick={() => setStep("advanced")} className="gap-2">
              {t("doctorForm.buttons.nextSchedule")}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP: Advanced (Day Schedule) ────────────────────────── */}
      {step === "advanced" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("doctorForm.sections.schedule")}</CardTitle>
              <CardDescription>
                {t("doctorForm.sections.scheduleSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAYS.map((day) => {
                const ds: DaySchedule = slotConfig.schedule[day] ?? {
                  enabled: false, workStart: "09:00", workEnd: "17:00", breaks: [],
                };
                const expanded = expandedDays.has(day);

                return (
                  <div
                    key={day}
                    className={`rounded-xl border transition-all ${
                      ds.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {/* Day header row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Toggle
                        checked={ds.enabled}
                        onChange={(v) => setDayField(day, "enabled", v)}
                      />
                      <span
                        className={`font-semibold text-sm w-24 ${
                          ds.enabled ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {t(`common.days.${day}`)}
                      </span>

                      {ds.enabled ? (
                        <>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Select
                              value={ds.workStart}
                              onValueChange={(v) => setDayField(day, "workStart", v)}
                            >
                              <SelectTrigger className="h-8 w-[100px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-slate-400">→</span>
                            <Select
                              value={ds.workEnd}
                              onValueChange={(v) => setDayField(day, "workEnd", v)}
                            >
                              <SelectTrigger className="h-8 w-[100px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Badge variant="outline" className="text-xs ml-auto">
                            {t(ds.breaks.length === 1 ? "doctorForm.messages.breaksCount" : "doctorForm.messages.breaksCount_plural", { count: ds.breaks.length })}
                          </Badge>

                          <button
                            type="button"
                            onClick={() => toggleDayExpand(day)}
                            className="text-slate-400 hover:text-slate-600 transition-colors ml-1"
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic ml-auto">{t("doctorForm.labels.dayOff")}</span>
                      )}
                    </div>

                    {/* Breaks section */}
                    {ds.enabled && expanded && (
                      <div className="border-t px-4 py-3 space-y-2 bg-slate-50/50 rounded-b-xl">
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide">
                          {t("doctorForm.labels.breakPeriods")}
                        </p>
                        {ds.breaks.length === 0 && (
                          <p className="text-xs text-slate-400 italic">{t("doctorForm.messages.noBreaks")}</p>
                        )}
                        {ds.breaks.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                            <Input
                              className="h-7 text-xs w-24 border-0 bg-transparent p-0 font-medium focus-visible:ring-0"
                              value={b.label}
                              onChange={(e) => updateBreak(day, bIdx, "label", e.target.value)}
                              placeholder={t("doctorForm.placeholders.breakPlaceholder")}
                            />
                            <span className="text-slate-300">|</span>
                            <Select
                              value={b.start}
                              onValueChange={(v) => updateBreak(day, bIdx, "start", v)}
                            >
                              <SelectTrigger className="h-7 w-[90px] text-xs border-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-slate-400 text-xs">{t("doctorForm.labels.to")}</span>
                            <Select
                              value={b.end}
                              onValueChange={(v) => updateBreak(day, bIdx, "end", v)}
                            >
                              <SelectTrigger className="h-7 w-[90px] text-xs border-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => removeBreak(day, bIdx)}
                              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors py-1"
                          onClick={() => addBreak(day)}
                        >
                          <Plus className="w-3.5 h-3.5" /> {t("doctorForm.buttons.addBreak")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Error / success banners */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {t("doctorForm.messages.successSave")}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("slots")}>{t("doctorForm.buttons.back")}</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? t("common.loading") : isEdit ? t("common.save") : t("admin.dashboard.addProvider")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
