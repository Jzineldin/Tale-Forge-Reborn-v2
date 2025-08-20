# Tale Forge Environment Setup Guide

This guide will help you set up all the required environment variables for Tale Forge.

## 🚀 Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in the required values** (see sections below)

3. **Restart your development server** after making changes

## 📋 Required Configuration

### 🗄️ Supabase (Required)

Tale Forge uses Supabase for authentication, database, and storage.

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project details** from the project dashboard:
   - Go to Settings → API
   - Copy the Project URL and anon public key

```env
# Backend configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend configuration (same values with VITE_ prefix)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 🤖 OpenAI (Required for Story Generation)

1. **Get an API key** from [OpenAI](https://platform.openai.com/api-keys)
2. **Add to your .env:**

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

## 🔧 Optional Configuration

### 🎨 OVH AI (For Image Generation)

```env
OVH_API_KEY=your_ovh_api_key_here
```

### 🔊 ElevenLabs (For Audio Narration)

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 💳 Stripe (For Payments)

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🌐 Application URLs

Update these if you're running on different ports:

```env
BASE_URL=http://localhost:3000
VITE_BASE_URL=http://localhost:3000
```

## 🔒 Security Notes

- **Never commit your .env file** to version control
- **Use different keys** for development and production
- **Keep service role keys secure** - they have admin access
- **VITE_ prefixed variables** are exposed to the browser

## ✅ Verification

After setting up your environment:

1. **Check Supabase connection:**
   - Start the development server
   - Check browser console for any Supabase errors

2. **Test authentication:**
   - Try to sign up/sign in
   - Check Supabase dashboard for new users

3. **Verify API keys:**
   - Check that story generation works (requires OpenAI)
   - Test other features as needed

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing VITE_SUPABASE_URL" error:**
   - Make sure you have VITE_ prefixed variables in .env
   - Restart your development server

2. **Authentication not working:**
   - Check that your Supabase URL and keys are correct
   - Verify your Supabase project is active

3. **CORS errors:**
   - Check your Supabase project settings
   - Ensure your domain is allowed in Supabase auth settings

## 📞 Need Help?

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [OpenAI API documentation](https://platform.openai.com/docs)
- Create an issue in the project repository
