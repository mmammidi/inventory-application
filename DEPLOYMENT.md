# Deployment Guide for Inventory Management Frontend

This guide will help you deploy the Inventory Management Frontend to Render and connect it to the production API.

## Prerequisites

- A Render account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- The production API running at: https://inventory-management-api-r40f.onrender.com

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository with the following files:
- `render.yaml` - Render configuration
- `package.json` - Dependencies and build scripts
- `vite.config.ts` - Vite configuration
- `env.production` - Production environment variables

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` configuration
5. The deployment will use the settings from `render.yaml`:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
   - **Environment Variables**: 
     - `VITE_API_BASE_URL=https://inventory-management-api-r40f.onrender.com`

#### Option B: Manual Configuration

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Configure the following settings:
   - **Name**: `inventory-frontend` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://inventory-management-api-r40f.onrender.com`

### 3. Environment Variables

The application is configured to connect to the production API. The following environment variable is set:

```
VITE_API_BASE_URL=https://inventory-management-api-r40f.onrender.com
```

### 4. Build Process

The build process will:
1. Install all dependencies (`npm install`)
2. Run TypeScript compilation (`tsc -b`)
3. Build the Vite application (`vite build`)
4. Output the production files to the `dist` directory

### 5. Routing Configuration

The application uses React Router for client-side routing. The following configurations ensure proper routing:

- **render.yaml**: Includes rewrite rules for SPA routing
- **vercel.json**: Fallback routing for all paths to `index.html`

### 6. Security Headers

The `render.yaml` includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Post-Deployment

### 1. Verify Deployment

After deployment, verify that:
- The application loads correctly
- All pages are accessible
- API calls are working (check browser Network tab)
- Data is loading from the production API

### 2. Test Functionality

Test the following features:
- **Items Management**: View, create, edit, delete items
- **Categories Management**: View, create, edit, delete categories
- **Suppliers Management**: View, create, edit, delete suppliers
- **Users Management**: View, create, edit, delete users
- **Movements Management**: View, create, edit, delete movements

### 3. Monitor Performance

- Check Render dashboard for deployment status
- Monitor build logs for any errors
- Verify API response times

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation passes locally
   - Check build logs in Render dashboard

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check that the production API is running
   - Test API endpoints directly

3. **Routing Issues**
   - Ensure `render.yaml` includes proper rewrite rules
   - Check that `vercel.json` has fallback routing

4. **Environment Variables**
   - Verify environment variables are set in Render dashboard
   - Check that variables start with `VITE_` for Vite to include them

### Debugging

1. **Check Build Logs**: View build logs in Render dashboard
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Verify API calls are being made correctly
4. **API Health**: Test https://inventory-management-api-r40f.onrender.com/api/v1/health

## Production API Information

The application connects to the production API at:
- **Base URL**: https://inventory-management-api-r40f.onrender.com
- **Health Check**: https://inventory-management-api-r40f.onrender.com/api/v1/health
- **API Documentation**: https://inventory-management-api-r40f.onrender.com/api-docs

## Support

If you encounter issues:
1. Check the Render deployment logs
2. Verify the production API is running
3. Test the application locally with the production API
4. Check browser console for errors

## Cost

Render offers a free tier for static sites with:
- 750 build minutes per month
- 100GB bandwidth per month
- Automatic deployments from Git

For higher usage, consider upgrading to a paid plan.
