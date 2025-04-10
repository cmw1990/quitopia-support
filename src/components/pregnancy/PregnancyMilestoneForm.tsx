import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Camera, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/supabase-client"

const milestoneFormSchema = z.object({
  milestone_type: z.string().min(2, { message: "Milestone type is required" }),
  custom_title: z.string().optional(),
  description: z.string().optional(),
  achieved_at: z.date(),
  week_number: z.number().min(1).max(42).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
})

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>

interface PregnancyMilestoneFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (values: MilestoneFormValues) => void;
  isPending?: boolean; // Changed from isLoading to match React Query v5
}

const CATEGORIES = [
  "Medical",
  "Development",
  "Personal",
  "Family",
  "Shopping",
  "Other"
]

export function PregnancyMilestoneForm({ 
  open, 
  onOpenChange, 
  onSubmit,
  isPending = false 
}: PregnancyMilestoneFormProps) {
  const [uploading, setUploading] = useState(false)
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      milestone_type: "",
      achieved_at: new Date(),
      photo_urls: [],
    },
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('pregnancy-milestones')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const photoUrl = data.path
      const currentUrls = form.getValues('photo_urls') || []
      form.setValue('photo_urls', [...currentUrls, photoUrl])

    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (values: MilestoneFormValues) => {
    onSubmit(values)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="milestone_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Type</FormLabel>
                  <FormControl>
                    <Input placeholder="First kick, ultrasound, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full border rounded px-3 py-2"
                      {...field}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="custom_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="A special name for this milestone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="achieved_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Achieved</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="week_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={42}
                      placeholder="Enter week number" 
                      {...field}
                      onChange={event => field.onChange(event.target.value ? parseInt(event.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add some details about this milestone"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photos</FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          disabled={uploading}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Add Photo"}
                        </Button>
                      </label>
                      {field.value && field.value.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {field.value.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Milestone'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
