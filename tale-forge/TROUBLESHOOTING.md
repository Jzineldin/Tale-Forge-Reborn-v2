# Tale Forge - Troubleshooting Guide

This guide provides solutions to common issues you might encounter when setting up and running Tale Forge locally.

## Common Setup Issues

### 1. Environment Variables Not Loading
**Problem**: The application doesn't seem to recognize your API keys or configuration settings.

**Solution**:
- Ensure you've created a `.env` file from `.env.example` in the `tale-forge` directory
- Verify all required variables are filled in with valid values
- Restart the development server after making changes
- Check that there are no extra spaces or quotes around your values

### 2. Node.js Version Issues
**Problem**: Dependency installation fails or the application doesn't start.

**Solution**:
- Verify you're using Node.js v16 or higher
- Check your Node.js version with `node --version`
- If needed, update Node.js or use a version manager like nvm

### 3. Port Conflicts
**Problem**: The development server fails to start because the port is already in use.

**Solution**:
- Check if another process is running on port 3000
- Kill the conflicting process or configure a different port in your vite.config.ts

## API Integration Issues

### 1. Story Generation Failures
**Problem**: Stories aren't being generated or the process fails.

**Solution**:
- Check your OpenAI API key in the `.env` file
- Verify you have quota available in your OpenAI account
- Ensure your API key has the necessary permissions
- Check the browser console and backend logs for specific error messages

### 2. Image Generation Problems
**Problem**: Story images aren't being generated or show placeholders.

**Solution**:
- Verify your OVH AI API key is correct
- Check that you have quota available for image generation
- Ensure the image generation service is properly configured
- Check network connectivity to the OVH AI endpoints

### 3. Audio Narration Issues
**Problem**: Audio files aren't being generated or played.

**Solution**:
- Confirm your ElevenLabs API key is valid
- Check your ElevenLabs account quota
- Verify the selected voice is available in your account
- Ensure the audio generation function is properly deployed

### 4. Payment Processing Errors
**Problem**: Stripe checkout or billing features don't work.

**Solution**:
- Verify both your publishable and secret Stripe keys
- Ensure your Stripe account is properly configured
- Check that webhook signing secrets match
- Confirm your Stripe account is not in restricted mode

## Database and Authentication Issues

### 1. Supabase Connection Failures
**Problem**: Authentication fails or data doesn't load.

**Solution**:
- Double-check your Supabase URL and keys in `.env`
- Ensure your Supabase project is properly configured
- Verify network connectivity to Supabase
- Check Supabase service status if issues persist

### 2. Authentication Problems
**Problem**: Unable to sign in or sign up.

**Solution**:
- Verify Supabase Auth is enabled in your project
- Check that email authentication is configured
- Ensure your redirect URLs are properly set in Supabase
- Check browser console for CORS-related issues

## Frontend Development Issues

### 1. Hot Module Replacement (HMR) Not Working
**Problem**: Changes to code don't reflect in the browser automatically.

**Solution**:
- Restart the development server
- Check for TypeScript compilation errors
- Ensure your IDE is not locking files
- Verify Vite configuration in `vite.config.ts`

### 2. CSS/Tailwind Not Applying
**Problem**: Styles don't appear to be working or components look unstyled.

**Solution**:
- Check that Tailwind CSS is properly configured
- Verify `tailwind.config.js` and `postcss.config.js` exist
- Ensure Tailwind directives are included in your CSS
- Restart the development server

## Backend/Edge Functions Issues

### 1. Edge Functions Not Deploying
**Problem**: Backend functions aren't working or returning errors.

**Solution**:
- Ensure you have the Supabase CLI installed
- Check that functions are properly structured
- Verify environment variables are set in Supabase dashboard
- Check Supabase function logs for specific errors

### 2. CORS Errors
**Problem**: API requests fail due to CORS issues.

**Solution**:
- Check your Supabase URL configuration
- Ensure your frontend URL is added to Supabase CORS settings
- Verify Authorization headers are properly set

## Performance Issues

### 1. Slow Loading Times
**Problem**: Pages or features take too long to load.

**Solution**:
- Check network connectivity to all services
- Optimize image sizes in your public directory
- Implement proper loading states in your components
- Check for unnecessary re-renders in React components

### 2. Memory Leaks
**Problem**: Application becomes slow or crashes over time.

**Solution**:
- Check for proper cleanup of event listeners and subscriptions
- Ensure components unmount correctly
- Verify React Query cache settings
- Monitor browser memory usage in developer tools

## Testing Issues

### 1. Tests Not Running
**Problem**: Test suite fails to execute or hangs.

**Solution**:
- Ensure all test dependencies are installed
- Check that test environment variables are set
- Verify test database configuration if applicable
- Restart the test runner

## Deployment Issues

### 1. Production Build Failures
**Problem**: `npm run build` fails or produces errors.

**Solution**:
- Check for TypeScript compilation errors
- Ensure all environment variables are properly set for production
- Verify all dependencies are correctly listed in package.json
- Check for issues with code splitting or dynamic imports

### 2. Runtime Errors in Production
**Problem**: Application works in development but fails in production.

**Solution**:
- Check browser console for runtime errors
- Verify environment variables are correctly set in production
- Ensure all API endpoints use HTTPS in production
- Check for issues with minification or tree shaking

## Additional Resources

If you're still experiencing issues:

1. **Check the Console**: Both browser and terminal consoles often contain specific error messages that can help identify the problem.

2. **Review Documentation**: 
   - [TALE_FORGE_PRD_2025.md](TALE_FORGE_PRD_2025.md) - Complete feature specifications
   - [OPTIMIZED_ROUTING_SKELETON.md](OPTIMIZED_ROUTING_SKELETON.md) - Navigation structure
   - [README_FOR_REBUILD.md](README_FOR_REBUILD.md) - Implementation strategy

3. **Community Support**: 
   - Check GitHub issues for similar problems
   - Consult Supabase, React, and other documentation for framework-specific issues

4. **Contact Support**:
   - For issues with third-party services (OpenAI, Stripe, etc.), contact their respective support teams
   - For project-specific issues, reach out to the Tale Forge development team

## Reporting Issues

If you encounter a bug or issue not covered in this guide:

1. **Check Existing Issues**: Search through existing GitHub issues to see if your problem has already been reported.

2. **Create a New Issue**: Include the following information:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment information (Node.js version, OS, browser)
   - Error messages from console or logs

3. **Provide Context**: Include information about:
   - What you were trying to accomplish
   - What steps you took
   - What went wrong
   - Any recent changes to your setup

This troubleshooting guide will be updated regularly as new issues are discovered and resolved.