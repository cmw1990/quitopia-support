create table if not exists focus_sessions8 (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration_seconds integer,
  focus_type text not null check (focus_type in ('pomodoro', 'deep_work', 'flow')),
  completed boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create RLS policies
alter table focus_sessions8 enable row level security;

create policy "Users can view their own focus sessions"
  on focus_sessions8 for select
  using (auth.uid() = user_id);

create policy "Users can insert their own focus sessions"
  on focus_sessions8 for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own focus sessions"
  on focus_sessions8 for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create indexes
create index focus_sessions8_user_id_idx on focus_sessions8 (user_id);
create index focus_sessions8_start_time_idx on focus_sessions8 (start_time desc);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_focus_sessions8_updated_at
  before update on focus_sessions8
  for each row
  execute function update_updated_at_column(); 