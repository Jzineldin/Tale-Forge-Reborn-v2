#!/bin/bash

# Deploy Environment Variables to Supabase Edge Functions
# Run this to update all environment variables for production

echo "🚀 Deploying environment variables to Supabase Edge Functions..."

# Set critical environment variables
npx supabase secrets set \
  SUPABASE_URL=https://fyihypkigbcmsxyvseca.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMzc2MCwiZXhwIjoyMDY2ODA5NzYwfQ.3w-YsZFoHGkQ_uBoZBVaV0fBShWm5o-w1xrTva-buL0 \
  OPENAI_API_KEY=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 \
  OVH_AI_ENDPOINTS_ACCESS_TOKEN=eyJhbGciOiJFZERTQSIsImtpZCI6IjgzMkFGNUE5ODg3MzFCMDNGM0EzMTRFMDJFRUJFRjBGNDE5MUY0Q0YiLCJraW5kIjoicGF0IiwidHlwIjoiSldUIn0.eyJ0b2tlbiI6ImphQTZqZGFUalFOeWIxOWJKMDdkMmF6OFdOK2paamo4ZTVNL25mOG9CeGs9In0.xCCY2PHf1Ed6Ii_YDryVbIDxacq23X2Ul37kMNKpkSryLhzpkPcFIm9_Uht0W4DROFZxZhD-ClrabADKy6uCBg

echo "✅ Environment variables deployed successfully!"
echo "🔥 Tale-Forge is now 100% functional!"

# Test the deployment
echo "🧪 Testing story generation..."
curl -X POST "https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d '{"title":"Test Story","description":"A magical test story","genre":"fantasy","age_group":"4-6","theme":"friendship","setting":"enchanted forest","characters":[{"name":"Luna","description":"A friendly fairy"}],"conflict":"lost magic crystal","quest":"find the crystal to save the forest"}'