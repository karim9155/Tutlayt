# Deployment Guide for Vercel

Your application is built with Next.js and Supabase, making it perfect for deployment on Vercel.

## Prerequisites

1.  **GitHub Repository**: Your code is already pushed to GitHub.
2.  **Vercel Account**: You need an account at [vercel.com](https://vercel.com).
3.  **Supabase Project**: You already have this connected.

## Steps to Deploy

1.  **Log in to Vercel**: Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**:
    *   Find your repository `Tutlayt` in the list.
    *   Click **"Import"**.
4.  **Configure Project**:
    *   **Framework Preset**: It should automatically detect **Next.js**.
    *   **Root Directory**: Leave as `./`.
    *   **Build and Output Settings**: Leave default.
5.  **Environment Variables** (Crucial Step):
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables (copy values from your `.env.local` file):
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6.  **Deploy**: Click **"Deploy"**.

## Post-Deployment

*   Vercel will build your application.
*   Once finished, you will get a live URL (e.g., `tutlayt.vercel.app`).
*   **Update Supabase Auth Settings**:
    *   Go to your Supabase Dashboard -> Authentication -> URL Configuration.
    *   Add your new Vercel URL to the **Site URL** and **Redirect URLs**.
    *   This ensures login/signup redirects work correctly on the live site.
