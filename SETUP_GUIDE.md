# Glitch NFT Studio - Complete Setup Guide

## 🚀 Getting Started with Vercel (New Users)

If you're new to Vercel, follow these steps to create an account and deploy your app:

### Step 1: Create a Vercel Account

1. **Visit Vercel's website**
   - Go to [https://vercel.com](https://vercel.com)
   
2. **Sign Up**
   - Click the "Sign Up" button in the top right corner
   - Choose one of the following sign-up methods:
     - **GitHub** (recommended for developers)
     - **GitLab**
     - **Bitbucket**
     - **Email** (will require email verification)
   
3. **Complete Registration**
   - Follow the prompts to authorize Vercel with your chosen provider
   - If using email, check your inbox for a verification link
   - Fill in any required profile information

4. **Welcome to Vercel!**
   - You'll be redirected to your Vercel dashboard
   - You're now ready to create your first project

---

### Step 2: Create a New Project on Vercel

There are two ways to deploy your Glitch NFT Studio app:

#### Option A: Deploy from Git Repository (Recommended)

1. **Push your code to a Git provider**
   - Create a new repository on GitHub, GitLab, or Bitbucket
   - Push your Glitch NFT Studio code to the repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Import the repository to Vercel**
   - On your Vercel dashboard, click "Add New..."
   - Select "Project"
   - Click "Import Git Repository"
   - Authorize Vercel to access your Git provider if you haven't already
   - Select your Glitch NFT Studio repository from the list

3. **Configure your project**
   - **Project Name**: Give it a name (e.g., "glitch-nft-studio")
   - **Framework Preset**: Vercel should auto-detect "Next.js"
   - **Root Directory**: Leave as "./" (default)
   - **Build Command**: Leave as default (`next build`)
   - **Output Directory**: Leave as default (`.next`)
   
4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

#### Option B: Deploy Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate

3. **Deploy from your project directory**
   ```bash
   cd /path/to/glitch-nft-studio
   vercel
   ```
   - Answer the setup questions:
     - Set up and deploy? **Y**
     - Which scope? Select your account
     - Link to existing project? **N**
     - What's your project's name? **glitch-nft-studio** (or your preferred name)
     - In which directory is your code located? **./** (default)
   
4. **Production deployment**
   ```bash
   vercel --prod
   ```

---

### Step 3: Configure Vercel Blob Storage

Your app requires Vercel Blob storage to enable these features:
- 🎨 **NFT Minting**: Upload images and metadata for NFTs
- 🌐 **Share on Based**: Upload images to share on the Based network
- 💬 **Share on Warpcast**: Upload images to share on Warpcast
- 🌍 **Open in Browser**: Transfer images from embedded webview to browser

#### Creating a Blob Store:

1. **Navigate to your project**
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your "glitch-nft-studio" project

2. **Open the Storage tab**
   - In your project dashboard, click on the "Storage" tab in the top navigation

3. **Create a new Blob store**
   - Click the "Create Database" button (or "Connect Store" if you see that instead)
   - Select "Blob" from the storage options
   - Click "Continue"
   
4. **Name your Blob store**
   - Enter a name like "glitch-images" or "nft-storage"
   - Select the region closest to your users (or leave as default)
   - Click "Create"

5. **Connect to your project**
   - Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project
   - You should see a success message confirming the connection

6. **Verify the environment variable**
   - Go to your project Settings → Environment Variables
   - Confirm that `BLOB_READ_WRITE_TOKEN` is listed
   - It should be available in all environments (Production, Preview, Development)

7. **Redeploy your app**
   - Go to the "Deployments" tab
   - Click the three dots (...) on your latest deployment
   - Select "Redeploy"
   - Or simply push a new commit to your Git repository to trigger a redeploy

---

### Step 4: Configure OnchainKit & Farcaster (Already Set Up)

Good news! Your app already has the following integrations configured:

✅ **Farcaster Mini-App SDK** - Enables your app to run inside Farcaster
✅ **OnchainKit** - Provides wallet connection and NFT minting on Base network

These are pre-configured and ready to use. No additional setup needed!

---

## 🔧 Advanced Configuration

### Manual Environment Variable Setup

If you need to manually add or update environment variables:

1. **Go to your project settings**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project
   - Click "Settings" in the top navigation

2. **Navigate to Environment Variables**
   - Click "Environment Variables" in the left sidebar

3. **Add a new variable**
   - Click "Add New"
   - Enter the variable details:
     - **Key**: Variable name (e.g., `BLOB_READ_WRITE_TOKEN`)
     - **Value**: The secret value
     - **Environments**: Select which environments need this variable
       - ✅ Production
       - ✅ Preview
       - ✅ Development (if you're testing locally)
   - Click "Save"

4. **Redeploy to apply changes**
   - Environment variable changes require a redeploy to take effect
   - Go to Deployments → Redeploy, or push a new commit

---

## ✅ What's Working in Your App

### 1. Farcaster Integration
- ✅ Splash screen properly hides when app is ready
- ✅ SDK initializes correctly using `sdk.actions.ready()`
- ✅ Works seamlessly in Farcaster Mini App environment

### 2. Image Upload & Transfer
- ✅ Browser transfer works: images upload to Blob and open in new browser tab
- ✅ Image URLs passed as parameters between webview and browser
- ✅ Full-size images maintained during display and download

### 3. Error Handling
- ✅ Clear error messages guide users to solutions
- ✅ Emoji-based logging for easy debugging (📤 ☁️ ✅ ❌)
- ✅ Automatic detection of missing Blob storage configuration

### 4. NFT Minting & Sharing
- ✅ Mint NFTs on Base network using OnchainKit
- ✅ Share on Based and Warpcast
- ✅ Scrollable minting modal for embedded webviews

---

## 📝 Common Issues & Solutions

### Issue: "Failed to upload NFT metadata" or similar errors

**Solution**: This means Vercel Blob is not configured yet.
- Follow Step 3 above to create and connect a Blob store
- Redeploy your app after adding the environment variable
- Clear your browser cache and try again

### Issue: "BLOB_READ_WRITE_TOKEN is not defined"

**Solution**: The environment variable is missing or not deployed.
- Go to Settings → Environment Variables
- Verify `BLOB_READ_WRITE_TOKEN` exists
- Make sure it's enabled for all environments
- Redeploy the app

### Issue: App works locally but not in production

**Solution**: Environment variables are different between environments.
- Verify the token exists in the "Production" environment
- Redeploy to production specifically
- Check the deployment logs for any errors

### Issue: Splash screen still showing in Farcaster

**Solution**: Clear the Farcaster app cache.
- Close the Farcaster app completely
- Reopen Farcaster
- Navigate to your mini app again

---

## 🌐 Accessing Your Deployed App

After deployment, your app will be available at:

- **Production URL**: `https://your-project-name.vercel.app`
- **Custom Domain** (optional): You can add a custom domain in Project Settings → Domains

### Sharing Your App:

1. **As a Farcaster Mini App**
   - Users can add it from within Farcaster
   - Share the app URL in casts on Farcaster

2. **As a Regular Web App**
   - Share the Vercel URL directly
   - Users can access it in any browser

3. **Embedding**
   - The app is webview-compatible
   - Works in embedded contexts (iframes, mobile apps, etc.)

---

## 🎨 How to Use the App

1. **Upload or capture an image**
   - Use the camera button or file upload
   - Supports JPG, PNG, and other common image formats

2. **Apply glitch effects**
   - Use the control sliders to adjust:
     - Glitch intensity
     - Color shift
     - Distortion effects
   - See real-time preview of your glitch art

3. **Mint as NFT**
   - Click "Mint NFT" button
   - Connect your wallet (uses OnchainKit on Base network)
   - Enter NFT name and description
   - Confirm the transaction
   - Your glitch art becomes an NFT!

4. **Share your creation**
   - **Share on Based**: Post to the Based network
   - **Share on Warpcast**: Share on Farcaster/Warpcast
   - **Download**: Save locally (or "Open in Browser" in embedded apps)

5. **View wallet info**
   - See your connected wallet address
   - Check your ETH balance
   - View your NFT collection

---

## 🆘 Still Having Issues?

### Debugging Steps:

1. **Check browser console**
   - Open Developer Tools (F12 or Right-click → Inspect)
   - Go to the "Console" tab
   - Look for emoji markers: 📤 ☁️ ✅ ❌
   - Take note of any red error messages

2. **Verify environment variables**
   - Project Settings → Environment Variables
   - Confirm `BLOB_READ_WRITE_TOKEN` exists
   - Check it's enabled for all environments

3. **Check deployment logs**
   - Go to Deployments tab
   - Click on your latest deployment
   - Scroll down to view the build logs
   - Look for any errors during build or deployment

4. **Test in different environments**
   - Try in a regular browser (not embedded)
   - Try in Farcaster Mini App
   - Try in a private/incognito window

5. **Clear caches**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Restart Farcaster app if using Mini App

### Getting Help:

If you're still stuck after trying the above:

1. **Check the Vercel documentation**
   - [Vercel Blob Storage Docs](https://vercel.com/docs/storage/vercel-blob)
   - [Next.js Deployment Guide](https://vercel.com/docs/frameworks/nextjs)

2. **Review error logs**
   - Collect error messages from the browser console
   - Note which feature is failing (upload, mint, share, etc.)
   - Check the deployment logs in Vercel dashboard

3. **Contact support**
   - Include your Vercel project URL
   - Share the error messages you're seeing
   - Mention which steps you've already tried

---

## 🎉 Success!

Once everything is set up, you should be able to:

✅ Create stunning glitch art effects  
✅ Mint your artwork as NFTs on Base  
✅ Share your creations on Based and Warpcast  
✅ Download your glitch art  
✅ Use the app in Farcaster or any browser  

Enjoy creating glitch art! 🎨⚡✨
