import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Professional } from '@/types/professionals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Star, Calendar, Clock, DollarSign, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface SearchFilters {
  type?: string;
  specializations?: string[];
  minRating?: number;
  insuranceNetwork?: string;
}

export const ProfessionalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', searchTerm, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_professionals', {
        search_term: searchTerm,
        professional_type: filters.type,
        specializations: filters.specializations,
        min_rating: filters.minRating,
        insurance_network: filters.insuranceNetwork
      });

      if (error) throw error;
      return data as Professional[];
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1"
          />
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
            placeholder="Professional Type"
          >
            <option value="therapist">Therapist</option>
            <option value="nutritionist">Nutritionist</option>
            <option value="dietitian">Dietitian</option>
          </Select>
          <Select
            value={filters.insuranceNetwork}
            onValueChange={(value) => handleFilterChange('insuranceNetwork', value)}
            placeholder="Insurance Network"
          >
            {/* Add insurance networks dynamically */}
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : professionals?.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                <Avatar
                  src={professional.profile_image}
                  alt={professional.full_name}
                  className="h-16 w-16"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {professional.full_name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {professional.title}
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm">
                      {professional.rating} ({professional.review_count} reviews)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {professional.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {professional.years_of_experience}+ years
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${professional.consultation_fee}/session
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Next available today
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Insurance accepted
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button className="flex-1">
                      Book Consultation
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
