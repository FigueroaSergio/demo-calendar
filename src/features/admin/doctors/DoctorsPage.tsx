import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { providerRepository } from "../../../application/services";
import type { Provider } from "../../../domain/models/Provider";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Stethoscope,
  Users,
  Activity,
  Clock,
} from "lucide-react";

const SPECIALTIES = [
  "All",
  "Cardiologist",
  "Pediatrician",
  "Neurologist",
  "Dermatologist",
  "Orthopedist",
  "Psychiatrist",
  "Oncologist",
  "General Practitioner",
];

export function DoctorsPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await providerRepository.getAllProviders();
      setProviders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = providers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty =
      specialtyFilter === "All" || p.specialty === specialtyFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && p.isActive !== false) ||
      (statusFilter === "Inactive" && p.isActive === false);
    return matchSearch && matchSpecialty && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await providerRepository.deleteProvider(deleteTarget.id);
      await load();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const stats = {
    total: providers.length,
    active: providers.filter((p) => p.isActive !== false).length,
    withSlotConfig: providers.filter((p) => !!p.slotConfig).length,
    avgRating:
      providers.length > 0
        ? (
            providers.reduce((s, p) => s + p.rating, 0) / providers.length
          ).toFixed(1)
        : "—",
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Doctor Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your medical staff, schedules, and slot configurations.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/doctors/new")}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Doctors", value: stats.total, icon: Users, color: "text-blue-600" },
          { label: "Active", value: stats.active, icon: Activity, color: "text-emerald-600" },
          { label: "Slot Configured", value: stats.withSlotConfig, icon: Clock, color: "text-purple-600" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Doctors</CardTitle>
              <CardDescription>{filtered.length} doctors found</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search name or specialty…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Stethoscope className="w-8 h-8 mx-auto mb-3 animate-pulse" />
              Loading doctors…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
              No doctors match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-6 py-3 font-semibold text-slate-600">Doctor</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Specialty</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Experience</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Rating</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Slot Config</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Doctor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.location}</p>
                          </div>
                        </div>
                      </td>
                      {/* Specialty */}
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-medium">
                          {p.specialty}
                        </Badge>
                      </td>
                      {/* Experience */}
                      <td className="px-6 py-4 text-slate-600">
                        {p.experienceYears} yrs
                      </td>
                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-slate-800">{p.rating}</span>
                          <span className="text-slate-400 text-xs">({p.reviewCount})</span>
                        </div>
                      </td>
                      {/* Slot Config */}
                      <td className="px-6 py-4">
                        {p.slotConfig ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                            <Clock className="w-3 h-3" />
                            {p.slotConfig.slotDurationMinutes}min slots
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Default</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        {p.isActive === false ? (
                          <Badge variant="outline" className="text-slate-500 border-slate-300">
                            Inactive
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-100">
                            Active
                          </Badge>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/admin/doctors/${p.id}/edit`)}
                            title="Edit doctor"
                          >
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50"
                            onClick={() => setDeleteTarget(p)}
                            title="Delete doctor"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the doctor and all their configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
