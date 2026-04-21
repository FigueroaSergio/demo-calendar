import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import type { Provider } from '../../domain/models/Provider';

interface CapacityListProps {
  providers: Provider[];
  appointments: any[];
}

export function CapacityList({ providers, appointments }: CapacityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacity Management</CardTitle>
        <CardDescription>Real-time clinical staff distribution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {providers.map((p) => {
          const apptCount = appointments.filter(a => a.providerId === p.id).length;
          // Mocking utilization based on appt count (max 25 for this demo)
          const utilization = Math.min(Math.round((apptCount / 24) * 100) + Math.floor(Math.random() * 20), 100);
          
          let status = "AVAILABLE";
          let badgeVariant: any = "secondary";
          
          if (utilization > 85) {
            status = "PEAK DEMAND";
            badgeVariant = "destructive";
          } else if (utilization > 65) {
            status = "MODERATE";
            badgeVariant = "default";
          } else if (utilization > 40) {
            status = "EFFICIENT";
            badgeVariant = "outline";
          }

          return (
            <div key={p.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">{p.name}</span>
                <Badge variant={badgeVariant} className="text-[10px] py-0 px-2">
                  {status}
                </Badge>
              </div>
              <Progress value={utilization} className="h-2" />
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{apptCount} Appointments</span>
                <span>{utilization}% Utilization</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
