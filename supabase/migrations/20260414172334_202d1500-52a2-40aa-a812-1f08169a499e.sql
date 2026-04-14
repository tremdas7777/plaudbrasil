CREATE POLICY "Anon can update cloaker_config"
ON public.cloaker_config
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);