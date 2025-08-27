#!/bin/bash

# Deploy via Supabase management API
echo "🛡️ Deploying via Supabase Management API..."

PROJECT_REF="fyihypkigbcmsxyvseca"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-YOUR_SUPABASE_ACCESS_TOKEN_HERE}"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMzc2MCwiZXhwIjoyMDY2ODA5NzYwfQ.3w-YsZFoHGkQ_uBoZBVaV0fBShWm5o-w1xrTva-buL0"

# First, let's try to create the first safety table via PostgREST
echo "📊 Creating safety_violations table..."

curl -X POST "https://fyihypkigbcmsxyvseca.supabase.co/rest/v1/rpc/create_safety_violations_table" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "✅ Basic table creation attempted!"
echo ""
echo "📋 MANUAL STEPS REQUIRED:"
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql"
echo "2. Copy and paste contents of 'deploy-safety.sql'"
echo "3. Click 'Run' to execute"
echo ""
echo "This will create all the safety monitoring tables!"