import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import type { Provider } from '../../domain/models/Provider';

interface CapacityListProps {
  providers: Provider[];
  appointments: any[];
}

export function CapacityList({ providers, appointments }: CapacityListProps) {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.capacity.title')}</CardTitle>
        <CardDescription>{t('admin.capacity.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {providers.map((p) => {
          const apptCount = appointments.filter(a => a.providerId === p.id).length;
          // Mocking utilization based on appt count (max 25 for this demo)
          const utilization = Math.min(Math.round((apptCount / 24) * 100) + Math.floor(Math.random() * 20), 100);
          
          let statusKey = "available";
          let badgeVariant: any = "secondary";
          
          if (utilization > 85) {
            statusKey = "peak";
            badgeVariant = "destructive";
          } else if (utilization > 65) {
            statusKey = "moderate";
            badgeVariant = "default";
          } else if (utilization > 40) {
            statusKey = "efficient";
            badgeVariant = "outline";
          }

          return (
            <div key={p.id} className="space-y-3 font-theme">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">{p.name}</span>
                <Badge variant={badgeVariant} className="text-[10px] py-0 px-2">
                  {t(`admin.capacity.${statusKey}`)}
                </Badge>
              </div>
              <Progress value={utilization} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{t('admin.capacity.appointments', { count: apptCount })}</span>
                <span>{t('admin.capacity.utilization', { value: utilization })}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
