
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "rating" | "experience" | "price" | "reviews";

export function ProfessionalDirectory() {
  const [specialty, setSpecialty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['mental-health-professionals', specialty, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('mental_health_professionals')
        .select('*')
        .eq('is_available', true);

      if (specialty) {
        query = query.contains('specialties', [specialty]);
      }

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case "rating":
          query = query.order('rating', { ascending: false });
          break;
        case "experience":
          query = query.order('years_experience', { ascending: false });
          break;
        case "price":
          query = query.order('consultation_fee', { ascending: true });
          break;
        case "reviews":
          query = query.order('reviews_count', { ascending: false });
          break;
      }

      const { data } = await query;
      return data;
    }
  });

  const expertTypes = [
    { value: "mental_health", label: "Mental Health Therapist" },
    { value: "nutrition", label: "Nutritionist" },
    { value: "supplements", label: "Supplement Expert" },
    { value: "fatigue", label: "Fatigue Specialist" },
    { value: "adhd", label: "ADHD Expert" },
    { value: "memory", label: "Memory Specialist" },
    { value: "brain_exercise", label: "Brain Exercise Expert" },
    { value: "dementia", label: "Dementia Specialist" },
    { value: "sleep", label: "Sleep Expert" },
    { value: "anxiety", label: "Anxiety Specialist" },
    { value: "depression", label: "Depression Specialist" },
    { value: "stress", label: "Stress Management Expert" },
    { value: "cognitive_health", label: "Cognitive Health Expert" },
    { value: "mindfulness", label: "Mindfulness Coach" },
    { value: "holistic_health", label: "Holistic Health Expert" },
    { value: "behavioral_therapy", label: "Behavioral Therapist" },
    { value: "energy_management", label: "Energy Management Specialist" },
    { value: "focus_training", label: "Focus Training Expert" },
    { value: "cognitive_rehabilitation", label: "Cognitive Rehabilitation Specialist" },
    { value: "neuroplasticity", label: "Neuroplasticity Expert" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            {expertTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : professionals?.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                {professional.avatar_url && (
                  <img 
                    src={professional.avatar_url} 
                    alt={professional.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle>{professional.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{professional.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Specialties:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {professional.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10"
                    >
                      {expertTypes.find(t => t.value === specialty)?.label || specialty}
                    </span>
                  ))}
                </div>
              </div>
              {professional.bio && (
                <div>
                  <p className="text-sm font-medium">About:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {professional.bio}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Experience:</p>
                <p className="text-sm text-muted-foreground">
                  {professional.years_experience} years
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Rating:</p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {professional.rating.toFixed(1)} ({professional.reviews_count} reviews)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Consultation Fee:</p>
                  <p className="text-sm text-muted-foreground">
                    ${professional.consultation_fee}/session
                  </p>
                </div>
              </div>
              <Button className="w-full">Book Consultation</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
