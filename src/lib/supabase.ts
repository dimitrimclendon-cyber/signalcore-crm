import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database tables
export interface Contractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  tier: "feed" | "priority" | "executive";
  monthly_fee: number;
  status: "prospect" | "active" | "churned";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  building_sqft: number;
  year_built: number;
  poc_score: number;
  status:
    | "available"
    | "contacted"
    | "qualified"
    | "proposal"
    | "assigned"
    | "sold"
    | "contracted"
    | "dead";
  assigned_to: string | null;
  source: string;
  raw_data: any;
  created_at: string;
  contracted_by?: string | null; // "ours" or contractor name
  dead_reason?: string | null; // Why lead became dead
}

export interface Deal {
  id: string;
  contractor_id: string;
  lead_id: string | null;
  deal_type: "subscription" | "lead_sale" | "success_fee";
  amount: number;
  status: "pending" | "active" | "paid" | "cancelled";
  paid_at: string | null;
  notes: string;
  created_at: string;
}

export interface Activity {
  id: string;
  contractor_id: string | null;
  lead_id: string | null;
  deal_id: string | null;
  action: string;
  details: string;
  created_at: string;
}
