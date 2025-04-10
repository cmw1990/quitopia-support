
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, Lock, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SupportGroups() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    max_participants: 10,
    meeting_frequency: "",
    meeting_day: "",
    meeting_time: "",
    duration_minutes: 60,
    is_private: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ['support-groups'],
    queryFn: async () => {
      const { data } = await supabase
        .from('support_groups')
        .select(`
          *,
          facilitator:facilitator_id (
            full_name
          ),
          memberships:group_memberships(count)
        `)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: myMemberships } = useQuery({
    queryKey: ['my-group-memberships', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', session?.user?.id);
      return new Set(data?.map(m => m.group_id));
    },
    enabled: !!session?.user?.id
  });

  const createGroup = useMutation({
    mutationFn: async (groupData: typeof newGroup) => {
      const { data, error } = await supabase
        .from('support_groups')
        .insert([{
          ...groupData,
          facilitator_id: session?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-groups'] });
      setNewGroup({
        name: "",
        description: "",
        max_participants: 10,
        meeting_frequency: "",
        meeting_day: "",
        meeting_time: "",
        duration_minutes: 60,
        is_private: false
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Support group created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create support group",
        variant: "destructive"
      });
      console.error('Group creation error:', error);
    }
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { data, error } = await supabase
        .from('group_memberships')
        .insert([{
          group_id: groupId,
          user_id: session?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-group-memberships'] });
      toast({
        title: "Success",
        description: "Successfully joined the group"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
      console.error('Join group error:', error);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Support Groups</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createGroup.mutate(newGroup);
            }} className="space-y-4">
              <Input
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Max Participants"
                  value={newGroup.max_participants}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  required
                />
                <Input
                  placeholder="Frequency (e.g., Weekly)"
                  value={newGroup.meeting_frequency}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_frequency: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Meeting Day"
                  value={newGroup.meeting_day}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_day: e.target.value }))}
                  required
                />
                <Input
                  type="time"
                  value={newGroup.meeting_time}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_time: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={newGroup.is_private}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, is_private: e.target.checked }))}
                />
                <label htmlFor="is_private">Private Group</label>
              </div>
              <Button type="submit" className="w-full" disabled={createGroup.isPending}>
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    {group.is_private && <Lock className="h-4 w-4" />}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Facilitated by {group.facilitator?.full_name}
                  </p>
                </div>
                {group.is_private && <Badge>Private</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{group.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.memberships?.[0]?.count || 0}/{group.max_participants} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{group.meeting_frequency} on {group.meeting_day}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{group.meeting_time} ({group.duration_minutes} minutes)</span>
                </div>
              </div>
              {session?.user?.id !== group.facilitator_id && !myMemberships?.has(group.id) && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => joinGroup.mutate(group.id)}
                  disabled={joinGroup.isPending}
                >
                  Join Group
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
