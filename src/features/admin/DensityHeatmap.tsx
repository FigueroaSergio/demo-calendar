import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export function DensityHeatmap() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];

  // Mock density data (7 days x 12 time slots)
  const grid = Array.from({ length: 7 }, () => 
    Array.from({ length: 12 }, () => Math.random())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Appointment Density</CardTitle>
          <CardDescription>Weekly volume distribution across operating hours</CardDescription>
        </div>
        <div className="flex gap-2 text-[10px] items-center">
          <span className="text-muted-foreground">LOW</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 bg-primary/10 rounded-[2px]" />
            <div className="w-3 h-3 bg-primary/30 rounded-[2px]" />
            <div className="w-3 h-3 bg-primary/60 rounded-[2px]" />
            <div className="w-3 h-3 bg-primary rounded-[2px]" />
          </div>
          <span className="text-muted-foreground">PEAK</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="space-y-3 min-w-[700px]">
            {days.map((day, dIdx) => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-muted-foreground w-8">{day}</span>
                <div className="flex-1 grid grid-cols-12 gap-1.5">
                  {grid[dIdx].map((val, tIdx) => {
                    let bgColor = "bg-primary/10";
                    if (val > 0.8) bgColor = "bg-primary";
                    else if (val > 0.5) bgColor = "bg-primary/60";
                    else if (val > 0.2) bgColor = "bg-primary/30";
                    
                    return (
                      <div 
                        key={tIdx} 
                        className={`h-6 rounded-[4px] ${bgColor} opacity-90 hover:opacity-100 transition-opacity cursor-help`}
                        title={`${Math.round(val * 100)}% Occupancy`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 pt-4">
              <span className="w-8" />
              <div className="flex-1 flex justify-between px-1">
                {times.map(time => (
                  <span key={time} className="text-[10px] font-medium text-muted-foreground">{time}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
