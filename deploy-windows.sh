#!/bin/bash

# Tale-Forge Safety Infrastructure Deployment Script for Windows
echo "🛡️ Deploying Tale-Forge Safety Infrastructure on Windows..."

# Set PostgreSQL path
PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"

# Database connection details
PROJECT_REF="fyihypkigbcmsxyvseca"
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMzc2MCwiZXhwIjoyMDY2ODA5NzYwfQ.3w-YsZFoHGkQ_uBoZBVaV0fBShWm5o-w1xrTva-buL0"

# Connection string
DB_URL="postgresql://postgres:${SERVICE_ROLE_KEY}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

echo "📊 Deploying database schema using psql..."

# Execute the safety infrastructure SQL
"${PSQL_PATH}" "${DB_URL}" -f deploy-safety.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema deployed successfully!"
else
    echo "❌ Database deployment failed!"
    exit 1
fi

echo "🎉 Safety infrastructure deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy edge functions via Supabase dashboard"
echo "2. Update your frontend to use the new safe endpoints"
echo "3. Configure alert webhooks"
echo "4. Test the safety monitoring dashboard"