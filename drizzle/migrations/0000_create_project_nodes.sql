CREATE TABLE public.project_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code text NOT NULL,
  parent_id uuid REFERENCES public.project_nodes(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'select', 'file', 'image')),
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_nodes TO anon, authenticated;
GRANT ALL ON public.project_nodes TO service_role;

ALTER TABLE public.project_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public project nodes are readable"
ON public.project_nodes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public project nodes are insertable"
ON public.project_nodes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public project nodes are editable"
ON public.project_nodes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public project nodes are deletable"
ON public.project_nodes FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX project_nodes_project_parent_sort_idx
ON public.project_nodes(project_code, parent_id, sort_order);

CREATE OR REPLACE FUNCTION public.set_project_node_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_nodes_set_updated_at
BEFORE UPDATE ON public.project_nodes
FOR EACH ROW EXECUTE FUNCTION public.set_project_node_updated_at();

CREATE POLICY "Public project files are readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'project-files');
CREATE POLICY "Public project files are uploadable"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Public project files are editable"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'project-files') WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Public project files are deletable"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'project-files');