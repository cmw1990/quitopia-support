import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  timezone: z.string().min(1, "Please select a timezone."),
  preferredFocusTime: z.string().min(1, "Please select your preferred focus time."),
  dailyGoalHours: z.number().min(0).max(24),
  notifications: z.boolean(),
});

const timezones = Intl.supportedValuesOf('timeZone');
const focusTimes = [
  "Early Morning (5AM-9AM)",
  "Morning (9AM-12PM)",
  "Afternoon (12PM-5PM)",
  "Evening (5PM-9PM)",
  "Night (9PM-12AM)",
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredFocusTime: "",
      dailyGoalHours: 4,
      notifications: true,
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabaseRequest({
          method: 'GET',
          tableName: `/rest/v1/user_profiles?user_id=eq.${user.id}`,
        });

        if (error) throw error;

        if (data?.[0]) {
          form.reset({
            displayName: data[0].display_name || "",
            timezone: data[0].timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferredFocusTime: data[0].preferred_focus_time || "",
            dailyGoalHours: data[0].daily_goal_hours || 4,
            notifications: data[0].notifications !== false,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Could not load your profile information. Please try again.",
        });
      }
    };

    loadProfile();
  }, [user, form, toast]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabaseRequest({
        method: 'POST',
        tableName: `/rest/v1/user_profiles`,
        data: {
          user_id: user.id,
          display_name: values.displayName,
          timezone: values.timezone,
          preferred_focus_time: values.preferredFocusTime,
          daily_goal_hours: values.dailyGoalHours,
          notifications: values.notifications,
        },
        options: {
          headers: {
            'Prefer': 'resolution=merge-duplicates',
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: "Could not save your profile information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage alt="User avatar" src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile and preferences for a personalized experience
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how you'll appear to other users in the community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Used to customize your schedule and notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredFocusTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Focus Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred focus time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {focusTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      When you're most productive and prefer to focus.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyGoalHours"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Daily Focus Goal (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your target hours of focused work per day.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}