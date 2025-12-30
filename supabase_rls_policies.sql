-- RLS Policies for SignalCore CRM
-- Run this in Supabase SQL Editor to allow anon reads

-- LEADS: Allow public read
CREATE POLICY "Leads are viewable by everyone"
  ON leads FOR SELECT
  USING (true);

-- LEADS: Allow inserts (for import scripts)
CREATE POLICY "Leads can be inserted"
  ON leads FOR INSERT
  WITH CHECK (true);

-- LEADS: Allow updates (for lead assignment)
CREATE POLICY "Leads can be updated"
  ON leads FOR UPDATE
  USING (true);

-- CONTRACTORS: Allow public read
CREATE POLICY "Contractors are viewable by everyone"
  ON contractors FOR SELECT
  USING (true);

-- CONTRACTORS: Allow inserts
CREATE POLICY "Contractors can be inserted"
  ON contractors FOR INSERT
  WITH CHECK (true);

-- CONTRACTORS: Allow updates
CREATE POLICY "Contractors can be updated"
  ON contractors FOR UPDATE
  USING (true);

-- DEALS: Allow public read
CREATE POLICY "Deals are viewable by everyone"
  ON deals FOR SELECT
  USING (true);

-- DEALS: Allow inserts
CREATE POLICY "Deals can be inserted"
  ON deals FOR INSERT
  WITH CHECK (true);

-- DEALS: Allow updates
CREATE POLICY "Deals can be updated"
  ON deals FOR UPDATE
  USING (true);

-- ACTIVITIES: Allow public read
CREATE POLICY "Activities are viewable by everyone"
  ON activities FOR SELECT
  USING (true);

-- ACTIVITIES: Allow inserts
CREATE POLICY "Activities can be inserted"
  ON activities FOR INSERT
  WITH CHECK (true);
