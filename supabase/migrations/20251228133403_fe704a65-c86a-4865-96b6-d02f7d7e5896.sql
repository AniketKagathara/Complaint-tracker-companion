-- Add policy for categories management (insert and delete)
CREATE POLICY "Public insert for categories" ON public.categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete for categories" ON public.categories
  FOR DELETE USING (is_default = false);