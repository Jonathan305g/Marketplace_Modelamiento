import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js'
dotenv.config();

const supabaseUrl = 'https://wyqalecplkjonggyjvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cWFsZWNwbGtqb25nZ3lqdmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTA0NjMsImV4cCI6MjA4MDUyNjQ2M30.TvBRPtieH-efp9xSihSwpz-oNYNFOrMcKFcH1n3dIu0'
const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Conectado a Supabase");

export { supabase };