import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { providerRepository } from '../../application/services';
import type { Provider, ProviderAvailability } from '../../domain/models/Provider';

interface AvailabilityConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider | null;
}

export function AvailabilityConfigDialog({ open, onOpenChange, provider }: AvailabilityConfigDialogProps) {
  const { t } = useTranslation();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', 
    '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleToggleSlot = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await providerRepository.updateAvailability(provider.id, [
        { providerId: provider.id, date: today, slots: selectedSlots }
      ]);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('admin.availability.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.availability.subtitle', { name: provider?.name })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
           <h4 className="text-sm font-medium mb-4">{t('admin.availability.workingSlots')}</h4>
           <div className="grid grid-cols-4 gap-2">
             {allSlots.map(slot => (
               <Badge 
                 key={slot} 
                 variant={selectedSlots.includes(slot) ? "default" : "outline"}
                 className="py-2 cursor-pointer flex justify-center text-xs"
                 onClick={() => handleToggleSlot(slot)}
               >
                 {slot}
               </Badge>
             ))}
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('common.loading') : t('admin.availability.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
