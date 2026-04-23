import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { providerRepository } from "../../application/services";
import type { Provider } from "../../domain/models/Provider";
import { Search, Star, MapPin } from "lucide-react";

export function ProviderSearch() {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      const data = await providerRepository.searchProviders(
        searchTerm,
        specialty === "ALL" ? undefined : specialty,
      );
      setProviders(data);
      setLoading(false);
    }
    fetchProviders();
  }, [searchTerm, specialty]);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">
            {t("patient.search.title")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder={t("patient.search.placeholder")}
              className="pl-9 bg-background focus-visible:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-medium">
            {t("patient.search.specialty")}
          </label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder={t("patient.search.specialty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("patient.search.allSpecialties")}
              </SelectItem>
              <SelectItem value="Cardiologist">
                {t("admin.table.specialty")} - Cardiologist
              </SelectItem>
              <SelectItem value="Pediatrician">
                {t("admin.table.specialty")} - Pediatrician
              </SelectItem>
              <SelectItem value="Neurologist">
                {t("admin.table.specialty")} - Neurologist
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-64"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className="cursor-pointer hover:border-primary transition-colors flex flex-col group"
              onClick={() => navigate(`/book/${provider.id}`)}
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={provider.avatarUrl} />
                  <AvatarFallback>
                    {provider.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {provider.name}
                  </CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {t(`common.specialties.${provider.specialty}`)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((l) => (
                    <Badge key={l} variant="secondary">
                      {l}
                    </Badge>
                  ))}
                </div>
                {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {provider.rating} ({provider.reviewCount} reviews)
                  </span>
                </div> */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {provider.location} &bull; {provider.experienceYears}y exp.
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/book/${provider.id}`)}
                >
                  {t("patient.search.bookButton")}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {providers.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {t("patient.search.noResults")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
