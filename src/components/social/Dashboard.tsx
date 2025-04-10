import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SocialInteraction, Relationship } from '@/types/wellness';
import { useUser } from '@/lib/auth';

export function Dashboard() {
  const { user } = useUser();
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent social interactions recorded</p>
                <Button variant="outline" className="mt-4">
                  Log New Interaction
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <Card key={interaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex -space-x-2">
                          {interaction.participants.slice(0, 3).map((participant, index) => (
                            <Avatar key={index}>
                              <AvatarFallback>{participant[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium">{interaction.type}</p>
                          <p className="text-sm text-gray-500">
                            Duration: {interaction.duration} minutes
                          </p>
                          {interaction.mood && (
                            <p className="text-sm text-gray-500">Mood: {interaction.mood}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : relationships.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No relationships added yet</p>
                <Button variant="outline" className="mt-4">
                  Add Relationship
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {relationships.map((relationship) => (
                  <Card key={relationship.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{relationship.name}</h3>
                          <p className="text-sm text-gray-500">{relationship.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Quality: {relationship.quality}/10
                          </p>
                          <p className="text-xs text-gray-500">
                            Last interaction: {new Date(relationship.lastInteraction).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
