import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { providerRepository } from '../../application/services';
import type { Provider, ProviderAvailability } from '../../domain/models/Provider';
import { useAppDispatch } from '../../application/hooks';
import { bookNewAppointment } from '../../application/slices/appointmentSlice';
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle2, List as ListIcon } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

export function BookingWizard() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [availabilities, setAvailabilities] = useState<ProviderAvailability[]>([]);
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  
  useEffect(() => {
    if (!providerId) return;
    
    async function loadData() {
      const p = await providerRepository.getProviderById(providerId!);
      setProvider(p);
      const start = new Date();
      const end = addDays(start, 14);
      const avails = await providerRepository.getAvailability(
        providerId!, 
        start.toISOString().split('T')[0], 
        end.toISOString().split('T')[0]
      );
      setAvailabilities(avails);
    }
    loadData();
  }, [providerId]);

  const handleBook = async () => {
    if (!provider || !selectedDate || !selectedTime) return;
    setStep(4); // Loading
    
    await dispatch(bookNewAppointment({
      patientId: 'patient1', // Hardcoded for demo
      providerId: provider.id,
      date: selectedDate,
      time: selectedTime,
      type: 'INITIAL_CONSULTATION'
    })).unwrap();
    
    setStep(5); // Success
  };
  
  if (!provider) return <div className="p-8 text-center animate-pulse">Loading provider details...</div>;

  const availableDates = availabilities.filter(a => a.slots.length > 0).map(a => parseISO(a.date));

  return (
    <div className="w-full max-w-3xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>
      
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map(i => (
           <div key={i} className={`flex-1 h-2 mx-1 rounded-full ${step >= i && step < 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Select Date</CardTitle>
              <div className="flex bg-slate-100 p-1 rounded-md">
                <Button 
                  variant={viewMode === 'LIST' ? "white" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setViewMode('LIST')}
                >
                  <ListIcon className="w-4 h-4 mr-1" /> List
                </Button>
                <Button 
                  variant={viewMode === 'CALENDAR' ? "white" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setViewMode('CALENDAR')}
                >
                  <CalendarIcon className="w-4 h-4 mr-1" /> Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'LIST' ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {availabilities.map(av => (
                     <div 
                       key={av.date} 
                       className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-colors ${selectedDate === av.date ? 'border-blue-600 bg-blue-50 shadow-sm' : 'hover:border-slate-300'}`}
                       onClick={() => setSelectedDate(av.date)}
                     >
                       <div className="flex items-center gap-3">
                         <CalendarIcon className="text-blue-600 w-5 h-5" />
                         <span className="font-medium text-lg">{format(parseISO(av.date), 'EEEE, MMMM d')}</span>
                       </div>
                       <span className="text-sm text-slate-500">{av.slots.length} slots available</span>
                     </div>
                   ))}
                   {availabilities.length === 0 && <div className="text-center text-slate-500 py-8">No availability found for the requested period.</div>}
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? parseISO(selectedDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        setSelectedDate(dateStr);
                      }
                    }}
                    disabled={(date) => {
                      return date < new Date() || !availableDates.some(availDate => isSameDay(date, availDate));
                    }}
                    className="rounded-md border shadow"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button disabled={!selectedDate} onClick={() => setStep(2)}>Continue</Button>
            </CardFooter>
          </>
        )}
        
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Select Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {availabilities.find(a => a.date === selectedDate)?.slots.map(t => (
                  <Button 
                    key={t}
                    variant={selectedTime === t ? 'default' : 'outline'}
                    className={`h-12 text-md transition-all ${selectedTime === t ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    <Clock className="w-4 h-4 mr-2 opacity-70" /> {t}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!selectedTime} onClick={() => setStep(3)}>Continue</Button>
            </CardFooter>
          </>
        )}
        
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="bg-slate-50 p-6 rounded-lg border">
                 <h3 className="font-semibold text-lg mb-4">Appointment Details</h3>
                 <div className="space-y-3 text-slate-600">
                   <div className="flex justify-between">
                     <span>Provider</span>
                     <span className="font-medium text-slate-900">{provider.name}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Date</span>
                     <span className="font-medium text-slate-900">{selectedDate}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Time</span>
                     <span className="font-medium text-slate-900">{selectedTime}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Service</span>
                     <span className="font-medium text-slate-900">Initial Consultation</span>
                   </div>
                 </div>
               </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleBook} className="w-full sm:w-auto">Confirm Appointment</Button>
            </CardFooter>
          </>
        )}

        {step === 4 && (
          <div className="py-24 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
             <p className="text-lg font-medium text-slate-700 animate-pulse">Securing your appointment...</p>
          </div>
        )}

        {step === 5 && (
          <div className="py-16 flex flex-col items-center text-center space-y-6">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
               <CheckCircle2 className="w-10 h-10" />
             </div>
             <div>
               <h2 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
               <p className="text-slate-500 max-w-md">Your appointment with {provider.name} on {selectedDate} at {selectedTime} has been successfully scheduled.</p>
             </div>
             
             <div className="flex gap-4 pt-4">
               <Button variant="outline" onClick={() => navigate('/')}>Book Another</Button>
               <Button onClick={() => navigate('/patient')}>View My Portal</Button>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
}

