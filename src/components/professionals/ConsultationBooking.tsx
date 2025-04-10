import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Professional, Consultation, InsuranceClaim } from '@/types/professionals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays } from 'date-fns';
import { Video, Phone, MessageCircle, Clock, DollarSign, Shield } from 'lucide-react';

interface BookingProps {
  professionalId: string;
}

export const ConsultationBooking = ({ professionalId }: BookingProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [consultationType, setConsultationType] = useState<'initial' | 'follow_up'>('initial');
  const [consultationMode, setConsultationMode] = useState<'video' | 'audio' | 'chat'>('video');
  const [useInsurance, setUseInsurance] = useState(false);
  const [insuranceDetails, setInsuranceDetails] = useState({
    provider: '',
    policyNumber: ''
  });

  // Fetch professional details
  const { data: professional } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals.professionals')
        .select('*')
        .eq('id', professionalId)
        .single();

      if (error) throw error;
      return data as Professional;
    }
  });

  // Fetch available slots
  const { data: availableSlots } = useQuery({
    queryKey: ['availableSlots', professionalId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];

      const { data, error } = await supabase
        .from('professionals.availability')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('day_of_week', selectedDate.getDay())
        .eq('is_available', true);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate
  });

  // Book consultation mutation
  const bookConsultation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !professional) return;

      const consultationData = {
        professional_id: professionalId,
        type: consultationType,
        status: 'scheduled',
        scheduled_at: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`,
        duration_minutes: 60,
        consultation_mode: consultationMode,
        consultation_fee: professional.consultation_fee,
        insurance_claim: useInsurance ? {
          provider: insuranceDetails.provider,
          policy_number: insuranceDetails.policyNumber,
          status: 'pending'
        } : null
      };

      const { data: consultation, error: consultationError } = await supabase
        .from('professionals.consultations')
        .insert([consultationData])
        .select()
        .single();

      if (consultationError) throw consultationError;

      if (useInsurance) {
        const insuranceClaimData = {
          consultation_id: consultation.id,
          provider: insuranceDetails.provider,
          policy_number: insuranceDetails.policyNumber,
          claim_amount: professional.consultation_fee,
          status: 'pending',
          submitted_at: new Date().toISOString()
        };

        const { error: insuranceError } = await supabase
          .from('professionals.insurance_claims')
          .insert([insuranceClaimData]);

        if (insuranceError) throw insuranceError;
      }

      return consultation;
    },
    onSuccess: () => {
      toast({
        title: 'Consultation Booked',
        description: 'Your consultation has been successfully scheduled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Booking Failed',
        description: 'Failed to book consultation. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select both date and time for your consultation.',
        variant: 'destructive'
      });
      return;
    }

    bookConsultation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Book Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Professional Info */}
            {professional && (
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div>
                  <h3 className="font-semibold">{professional.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{professional.title}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-lg font-semibold">${professional.consultation_fee}</p>
                  <p className="text-sm text-muted-foreground">per session</p>
                </div>
              </div>
            )}

            {/* Consultation Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Consultation Type</label>
              <Select
                value={consultationType}
                onValueChange={(value: 'initial' | 'follow_up') => setConsultationType(value)}
              >
                <option value="initial">Initial Consultation</option>
                <option value="follow_up">Follow-up Session</option>
              </Select>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Consultation Mode</label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={consultationMode === 'video' ? 'default' : 'outline'}
                  onClick={() => setConsultationMode('video')}
                  className="flex items-center justify-center space-x-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </Button>
                <Button
                  variant={consultationMode === 'audio' ? 'default' : 'outline'}
                  onClick={() => setConsultationMode('audio')}
                  className="flex items-center justify-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Audio</span>
                </Button>
                <Button
                  variant={consultationMode === 'chat' ? 'default' : 'outline'}
                  onClick={() => setConsultationMode('chat')}
                  className="flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </Button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && availableSlots && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.start_time}
                      variant={selectedTime === slot.start_time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(slot.start_time)}
                      className="text-sm"
                    >
                      {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={useInsurance}
                  onCheckedChange={(checked) => setUseInsurance(checked as boolean)}
                />
                <label className="text-sm font-medium">Use Insurance</label>
              </div>

              {useInsurance && (
                <div className="space-y-4 pl-6">
                  <Input
                    placeholder="Insurance Provider"
                    value={insuranceDetails.provider}
                    onChange={(e) => setInsuranceDetails(prev => ({
                      ...prev,
                      provider: e.target.value
                    }))}
                  />
                  <Input
                    placeholder="Policy Number"
                    value={insuranceDetails.policyNumber}
                    onChange={(e) => setInsuranceDetails(prev => ({
                      ...prev,
                      policyNumber: e.target.value
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Booking Button */}
            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || bookConsultation.isPending}
              className="w-full"
            >
              {bookConsultation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
