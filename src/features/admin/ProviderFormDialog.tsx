import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { providerRepository } from '../../application/services';
import type { CreateProviderDTO } from '../../domain/models/Provider';

interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProviderFormDialog({ open, onOpenChange, onSuccess }: ProviderFormDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateProviderDTO>>({
    name: '',
    specialty: 'Cardiologist',
    location: 'St. Glacier Medical',
    languages: ['English'],
    experienceYears: 5,
    gender: 'Male',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await providerRepository.createProvider(formData as CreateProviderDTO);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('admin.provider.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('admin.provider.addSubtitle')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t('admin.provider.name')}</Label>
              <Input 
                id="name" 
                className="col-span-3" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right">{t('admin.provider.specialty')}</Label>
              <Select 
                value={formData.specialty} 
                onValueChange={v => setFormData({...formData, specialty: v})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiologist">{t('admin.table.specialty')} - Cardiologist</SelectItem>
                  <SelectItem value="Pediatrician">{t('admin.table.specialty')} - Pediatrician</SelectItem>
                  <SelectItem value="Neurologist">{t('admin.table.specialty')} - Neurologist</SelectItem>
                  <SelectItem value="Dermatologist">{t('admin.table.specialty')} - Dermatologist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">{t('admin.provider.experience')}</Label>
              <Input 
                id="experience" 
                type="number" 
                className="col-span-3" 
                value={formData.experienceYears}
                onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">{t('admin.provider.gender')}</Label>
              <Select 
                value={formData.gender} 
                onValueChange={v => setFormData({...formData, gender: v})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">{t('admin.provider.male')}</SelectItem>
                  <SelectItem value="Female">{t('admin.provider.female')}</SelectItem>
                  <SelectItem value="Non-binary">{t('admin.provider.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('admin.provider.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
