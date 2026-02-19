-- Create medications table
create table public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  dosage numeric not null,
  unit text not null,
  times text[] not null,
  start_date date not null,
  end_date date,
  instructions text,
  condition text,
  prescribed_by text,
  frequency text default 'daily',
  selected_days text[],
  created_at timestamptz default now()
);

-- Enable RLS for medications
alter table public.medications enable row level security;

-- Create policies for medications
create policy "Users can view their own medications"
  on public.medications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own medications"
  on public.medications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own medications"
  on public.medications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own medications"
  on public.medications for delete
  using (auth.uid() = user_id);


-- Create dose_history table
create table public.dose_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  medication_id uuid references public.medications(id) on delete cascade not null,
  scheduled_time text not null,
  taken_at timestamptz not null,
  date date not null,
  status text check (status in ('taken', 'missed')),
  created_at timestamptz default now()
);

-- Enable RLS for dose_history
alter table public.dose_history enable row level security;

-- Create policies for dose_history
create policy "Users can view their own dose history"
  on public.dose_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dose history"
  on public.dose_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dose history"
  on public.dose_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own dose history"
  on public.dose_history for delete
  using (auth.uid() = user_id);
