CREATE TABLE public.project_node_marks (
  id uuid primary key default gen_random_uuid(),
  project_code text not null,
  node_id uuid not null references public.project_nodes(id) on delete cascade,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  unique (node_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_node_marks TO anon, authenticated;
GRANT ALL ON public.project_node_marks TO service_role;

ALTER TABLE public.project_node_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public project node marks are readable"
  ON public.project_node_marks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public project node marks are insertable"
  ON public.project_node_marks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public project node marks are updatable"
  ON public.project_node_marks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public project node marks are deletable"
  ON public.project_node_marks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.project_node_changes (
  id uuid primary key default gen_random_uuid(),
  project_code text not null,
  node_id uuid not null references public.project_nodes(id) on delete cascade,
  node_title text not null default '',
  root_title text not null default '',
  old_text text not null default '',
  new_text text not null default '',
  changed_by text not null default '',
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_node_changes TO anon, authenticated;
GRANT ALL ON public.project_node_changes TO service_role;

ALTER TABLE public.project_node_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public project node changes are readable"
  ON public.project_node_changes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public project node changes are insertable"
  ON public.project_node_changes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public project node changes are updatable"
  ON public.project_node_changes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public project node changes are deletable"
  ON public.project_node_changes FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX project_node_changes_project_idx ON public.project_node_changes (project_code, created_at DESC);