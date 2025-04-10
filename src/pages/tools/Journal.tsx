import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { BookOpen, Calendar as CalendarIcon, PenLine, Search, Tag } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(),
    content: 'Today was a productive day. I managed to complete all my tasks and had time for self-care.',
    mood: 'great',
    tags: ['productivity', 'self-care'],
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000),
    content: 'Feeling a bit stressed about upcoming deadlines, but managing well with meditation.',
    mood: 'neutral',
    tags: ['stress', 'meditation'],
  },
];

export default function Journal() {
  const [entries] = useState<JournalEntry[]>(mockEntries);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newEntry, setNewEntry] = useState('');

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great':
        return '😊';
      case 'good':
        return '🙂';
      case 'neutral':
        return '😐';
      case 'bad':
        return '😕';
      case 'terrible':
        return '😢';
      default:
        return '😐';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Wellness Journal</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* New Entry */}
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>Record your thoughts and feelings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                </span>
              </div>

              <Textarea
                placeholder="How are you feeling today?"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="min-h-[200px]"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Mood</label>
                <div className="flex space-x-2">
                  {['great', 'good', 'neutral', 'bad', 'terrible'].map((mood) => (
                    <Button
                      key={mood}
                      variant="outline"
                      className="flex-1"
                    >
                      {getMoodEmoji(mood)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                </div>
              </div>

              <Button className="w-full">
                <PenLine className="h-4 w-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar & History */}
        <Card>
          <CardHeader>
            <CardTitle>Journal History</CardTitle>
            <CardDescription>View and manage your entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="entries">Entries</TabsTrigger>
              </TabsList>
              <TabsContent value="calendar" className="mt-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </TabsContent>
              <TabsContent value="entries" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <Card key={entry.id}>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {format(entry.date, 'PPP')}
                            </div>
                            <div>{getMoodEmoji(entry.mood)}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm">{entry.content}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Journal Insights</CardTitle>
            <CardDescription>Track your wellness journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Mood Trends</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Coming soon: Visual representation of your mood patterns over time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Common Themes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Coming soon: Analysis of frequently mentioned topics and patterns.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Coming soon: Personalized wellness recommendations based on your entries.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
