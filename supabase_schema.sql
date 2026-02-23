-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- EVENTS TABLE
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  event_type text not null,
  date_start timestamp with time zone not null,
  date_end timestamp with time zone,
  location text not null,
  status text not null check (status in ('planning', 'active', 'completed', 'cancelled')),
  budget_total numeric not null default 0,
  budget_spent numeric not null default 0,
  description text,
  created_at timestamp with time zone default now()
);

-- TASKS TABLE
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null check (status in ('todo', 'in_progress', 'completed')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  category text not null check (category in ('general', 'content', 'logistics', 'food', 'props', 'sponsors')),
  assigned_to text,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- INVENTORY TABLE
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  quantity integer not null default 0,
  status text not null check (status in ('needed', 'acquired', 'available'))
);

-- BUDGET ITEMS TABLE
create table budget_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  description text not null,
  estimated_cost numeric not null default 0,
  actual_cost numeric not null default 0,
  category text not null
);

-- MEETINGS TABLE
create table meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamp with time zone not null,
  location text not null,
  agenda text,
  minutes text,
  attendees text[] not null default '{}',
  meeting_link text,
  event_id uuid references events(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- CONTENT IDEAS TABLE
create table content_ideas (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  title text not null,
  description text,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'general')),
  status text not null check (status in ('idea', 'planned', 'in_production', 'posted')),
  scheduled_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- VIEW FOR BUDGET AGGREGATES
-- This solves the issue of fetching all budget items just to sum them up on the client
create view event_budget_summary as
select 
  e.id as event_id,
  e.name as event_name,
  e.budget_total as allocated,
  coalesce(sum(b.actual_cost), 0) as spent
from events e
left join budget_items b on e.id = b.event_id
group by e.id, e.name, e.budget_total;

-- RLS POLICIES (Assuming open access for now as per previous "no RBAC" requirement, but tables need policies to be queried from edge if RLS is enabled)
-- Only run these if you enable RLS on the tables.

alter table events enable row level security;
alter table tasks enable row level security;
alter table inventory enable row level security;
alter table budget_items enable row level security;
alter table meetings enable row level security;
alter table content_ideas enable row level security;

create policy "Enable all access for all users" on events for all using (true) with check (true);
create policy "Enable all access for all users" on tasks for all using (true) with check (true);
create policy "Enable all access for all users" on inventory for all using (true) with check (true);
create policy "Enable all access for all users" on budget_items for all using (true) with check (true);
create policy "Enable all access for all users" on meetings for all using (true) with check (true);
create policy "Enable all access for all users" on content_ideas for all using (true) with check (true);
