#!/bin/bash

# Tale-Forge Safety Infrastructure Deployment Script
# Deploys safety monitoring tables and edge functions

echo "🛡️ Deploying Tale-Forge Safety Infrastructure..."

# Database connection details
PROJECT_REF="fyihypkigbcmsxyvseca"
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMzc2MCwiZXhwIjoyMDY2ODA5NzYwfQ.3w-YsZFoHGkQ_uBoZBVaV0fBShWm5o-w1xrTva-buL0"

# Connection string
DB_URL="postgresql://postgres:${SERVICE_ROLE_KEY}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

echo "📊 Deploying database schema..."

# Execute the safety infrastructure SQL
if command -v psql &> /dev/null; then
    echo "Using psql to deploy schema..."
    psql "${DB_URL}" -f deploy-safety.sql
else
    echo "❌ psql not found. Please install PostgreSQL client tools or use Supabase dashboard to run deploy-safety.sql"
fi

echo "🔧 Deploying edge functions..."

# Deploy edge functions
if command -v supabase &> /dev/null; then
    echo "Deploying generate-story-seeds-safe function..."
    supabase functions deploy generate-story-seeds-safe
    
    echo "Deploying safety-monitor function..."
    supabase functions deploy safety-monitor
else
    echo "❌ Supabase CLI not configured. Please deploy edge functions manually:"
    echo "   supabase functions deploy generate-story-seeds-safe"
    echo "   supabase functions deploy safety-monitor"
fi

echo "✅ Safety infrastructure deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your frontend to use the new safe endpoints"
echo "2. Configure alert webhooks in your edge function environment variables"
echo "3. Test the safety monitoring dashboard"
echo "4. Run the safety test suite: npm run test:safety"