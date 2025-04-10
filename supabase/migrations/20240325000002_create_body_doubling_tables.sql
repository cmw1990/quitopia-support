-- Create body doubling sessions table
create table if not exists body_doubling_sessions8 (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null check (category in ('work', 'study', 'creative', 'chores', 'wellness')),
  host_id uuid references auth.users(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  duration_minutes integer not null,
  has_video boolean default true not null,
  has_audio boolean default true not null,
  is_public boolean default true not null,
  status text not null check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create body doubling participants table
create table if not exists body_doubling_participants8 (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references body_doubling_sessions8(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  join_time timestamp with time zone default now() not null,
  leave_time timestamp with time zone,
  shared_goals text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(session_id, user_id)
);

-- Create body doubling templates table
create table if not exists body_doubling_templates8 (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  category text not null check (category in ('work', 'study', 'creative', 'chores', 'wellness')),
  duration_minutes integer not null,
  activity_level text not null check (activity_level in ('quiet', 'moderate', 'active')),
  suitable_for text[] not null,
  structure jsonb not null,
  benefits text[] not null,
  tips text[] not null,
  icon text not null,
  is_custom boolean default false not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create body doubling messages table
create table if not exists body_doubling_messages8 (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references body_doubling_sessions8(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default now() not null
);

-- Create body doubling achievements table
create table if not exists body_doubling_achievements8 (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_type text not null check (achievement_type in ('first_session', 'host_session', 'marathon_session', 'streak', 'diverse_categories', 'social_butterfly')),
  achievement_data jsonb not null,
  unlocked_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table body_doubling_sessions8 enable row level security;
alter table body_doubling_participants8 enable row level security;
alter table body_doubling_templates8 enable row level security;
alter table body_doubling_messages8 enable row level security;
alter table body_doubling_achievements8 enable row level security;

-- Sessions policies
create policy "Anyone can view public sessions"
  on body_doubling_sessions8 for select
  using (is_public = true or auth.uid() = host_id);

create policy "Users can create sessions"
  on body_doubling_sessions8 for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update their sessions"
  on body_doubling_sessions8 for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Hosts can delete their sessions"
  on body_doubling_sessions8 for delete
  using (auth.uid() = host_id);

-- Participants policies
create policy "Users can view participants in their sessions"
  on body_doubling_participants8 for select
  using (
    auth.uid() in (
      select host_id from body_doubling_sessions8 where id = session_id
    ) or
    auth.uid() in (
      select user_id from body_doubling_participants8 where session_id = body_doubling_participants8.session_id
    )
  );

create policy "Users can join sessions as participants"
  on body_doubling_participants8 for insert
  with check (auth.uid() = user_id);

create policy "Users can update their participant info"
  on body_doubling_participants8 for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can leave sessions"
  on body_doubling_participants8 for delete
  using (auth.uid() = user_id);

-- Templates policies
create policy "Anyone can view public templates"
  on body_doubling_templates8 for select
  using (is_custom = false or auth.uid() = user_id);

create policy "Authenticated users can create custom templates"
  on body_doubling_templates8 for insert
  with check (auth.uid() = user_id and is_custom = true);

create policy "Template creators can update their templates"
  on body_doubling_templates8 for update
  using (auth.uid() = user_id and is_custom = true)
  with check (auth.uid() = user_id and is_custom = true);

create policy "Template creators can delete their templates"
  on body_doubling_templates8 for delete
  using (auth.uid() = user_id and is_custom = true);

-- Messages policies
create policy "Session participants can view messages"
  on body_doubling_messages8 for select
  using (
    auth.uid() in (
      select host_id from body_doubling_sessions8 where id = session_id
    ) or
    auth.uid() in (
      select user_id from body_doubling_participants8 where session_id = body_doubling_messages8.session_id
    )
  );

create policy "Session participants can add messages"
  on body_doubling_messages8 for insert
  with check (
    auth.uid() = user_id and (
      auth.uid() in (
        select host_id from body_doubling_sessions8 where id = session_id
      ) or
      auth.uid() in (
        select user_id from body_doubling_participants8 where session_id = body_doubling_messages8.session_id
      )
    )
  );

create policy "Message creators can delete their messages"
  on body_doubling_messages8 for delete
  using (auth.uid() = user_id);

-- Achievements policies
create policy "Users can view their own achievements"
  on body_doubling_achievements8 for select
  using (auth.uid() = user_id);

create policy "System can create achievements"
  on body_doubling_achievements8 for insert
  with check (auth.uid() = user_id);

-- Add indexes for performance
create index body_doubling_sessions8_host_id_idx on body_doubling_sessions8 (host_id);
create index body_doubling_sessions8_start_time_idx on body_doubling_sessions8 (start_time);
create index body_doubling_sessions8_status_idx on body_doubling_sessions8 (status);
create index body_doubling_participants8_session_id_idx on body_doubling_participants8 (session_id);
create index body_doubling_participants8_user_id_idx on body_doubling_participants8 (user_id);
create index body_doubling_messages8_session_id_idx on body_doubling_messages8 (session_id);
create index body_doubling_achievements8_user_id_idx on body_doubling_achievements8 (user_id);

-- Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_body_doubling_sessions8_updated_at
  before update on body_doubling_sessions8
  for each row
  execute function update_updated_at_column();

create trigger update_body_doubling_participants8_updated_at
  before update on body_doubling_participants8
  for each row
  execute function update_updated_at_column();

create trigger update_body_doubling_templates8_updated_at
  before update on body_doubling_templates8
  for each row
  execute function update_updated_at_column();

-- Insert some default templates
insert into body_doubling_templates8 (
  name, 
  description, 
  category, 
  duration_minutes, 
  activity_level, 
  suitable_for, 
  structure, 
  benefits, 
  tips, 
  icon,
  is_custom
) values 
(
  'Deep Work Session',
  'Focused work time with virtual accountability and structured breaks.',
  'work',
  90,
  'quiet',
  ARRAY['Complex projects', 'Writing tasks', 'Analysis work', 'Strategic planning'],
  '{"setup": ["Set clear session goal", "Prepare workspace", "Minimize distractions", "Check tools and resources"], "process": ["Brief check-in every 25 minutes", "Shared focus periods", "Silent progress tracking", "Optional ambient sounds"], "completion": ["Review accomplishments", "Share key takeaways", "Plan next session", "Celebrate progress"]}',
  ARRAY['Enhanced accountability', 'Reduced procrastination', 'Improved focus duration', 'Structured workflow'],
  ARRAY['Use video if comfortable', 'Keep regular schedule', 'Share session goals', 'Stay within timeframe'],
  '💼',
  false
),
(
  'Study Group Flow',
  'Collaborative learning environment with shared focus and discussion periods.',
  'study',
  120,
  'moderate',
  ARRAY['Exam preparation', 'Research work', 'Skill learning', 'Reading sessions'],
  '{"setup": ["Share study objectives", "Review materials needed", "Set milestone points", "Agree on break times"], "process": ["Silent study blocks", "Brief concept sharing", "Progress check-ins", "Question rounds"], "completion": ["Summarize learnings", "Plan next topics", "Share resources", "Set next goals"]}',
  ARRAY['Peer motivation', 'Knowledge sharing', 'Consistent schedule', 'Better retention'],
  ARRAY['Use study timer', 'Take coordinated breaks', 'Share study tips', 'Maintain quiet focus'],
  '📚',
  false
),
(
  'Creative Co-Working',
  'Supportive environment for artistic and creative endeavors.',
  'creative',
  60,
  'moderate',
  ARRAY['Art projects', 'Writing sessions', 'Design work', 'Brainstorming'],
  '{"setup": ["Share project goals", "Prepare materials", "Set inspiration mood", "Plan sharing points"], "process": ["Independent creation", "Optional sharing", "Feedback rounds", "Inspiration breaks"], "completion": ["Share progress", "Collect feedback", "Document ideas", "Plan next session"]}',
  ARRAY['Creative motivation', 'Shared inspiration', 'Regular practice', 'Constructive feedback'],
  ARRAY['Stay open to ideas', 'Share challenges', 'Take inspiration breaks', 'Document progress'],
  '🎨',
  false
),
(
  'Home Task Sprint',
  'Structured approach to completing household tasks and chores.',
  'chores',
  45,
  'active',
  ARRAY['Cleaning tasks', 'Organization', 'Meal prep', 'Home maintenance'],
  '{"setup": ["List specific tasks", "Gather supplies", "Set task order", "Check timing"], "process": ["Task-by-task focus", "Progress sharing", "Movement breaks", "Quick wins first"], "completion": ["Check off completed tasks", "Plan next chore session", "Take final break", "Reward progress"]}',
  ARRAY['Increased motivation', 'Accountable environment', 'Less procrastination', 'More enjoyable chores'],
  ARRAY['Play energetic music', 'Set timers for tasks', 'Share before/after', 'Celebrate progress'],
  '🧹',
  false
),
(
  'Wellness Break',
  'Mindful relaxation and recovery session with accountability.',
  'wellness',
  30,
  'quiet',
  ARRAY['Meditation practice', 'Stretching routines', 'Breathing exercises', 'Mindfulness practice'],
  '{"setup": ["Set wellness intention", "Prepare comfortable space", "Minimize distractions", "Choose specific practice"], "process": ["Guided meditation/movement", "Reflective moments", "Gentle accountability", "Present-moment focus"], "completion": ["Share experience", "Note physical/mental shifts", "Express gratitude", "Plan next practice"]}',
  ARRAY['Consistent wellbeing routine', 'Reduced stress', 'Community support', 'Mindfulness skill-building'],
  ARRAY['Use gentle background sounds', 'Focus on breathing', 'Be present', 'Practice non-judgment'],
  '🧘‍♀️',
  false
); 