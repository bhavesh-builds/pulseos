# GitHub Repository Setup Guide

Follow these steps to create a GitHub repository and push your PulseOS code.

## Step 1: Create Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `pulseos` (or your preferred name)
   - **Description**: "PulseOS - Consolidated updates app with social integration"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Copy Repository URL

After creating the repository, GitHub will show you the repository URL. It will look like:
- HTTPS: `https://github.com/YOUR_USERNAME/pulseos.git`
- SSH: `git@github.com:YOUR_USERNAME/pulseos.git`

Copy the HTTPS URL (recommended for first-time setup).

## Step 3: Add Remote and Push

Once you have the repository URL, run these commands:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pulseos.git

# Push your code to GitHub
git push -u origin main
```

If you're using SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/pulseos.git
git push -u origin main
```

## Step 4: Verify

1. Go back to your GitHub repository page
2. Refresh the page
3. You should see all your files and commits

## Authentication

If you're prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Generate a new token with `repo` scope
  - Use this token as your password

## Alternative: Using GitHub CLI (If Installed)

If you install GitHub CLI (`gh`), you can create the repo directly:

```bash
# Install GitHub CLI (macOS)
brew install gh

# Authenticate
gh auth login

# Create and push in one command
gh repo create pulseos --public --source=. --remote=origin --push
```

---

That's it! Your code is now on GitHub. 🚀
