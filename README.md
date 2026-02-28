# GovGuide AI: SNAP Application Assistant

A powerful browser extension that simplifies government forms with AI-powered explanations, interactive checklists, and interview preparation assistance.

## Features

- **AI-Powered Explanations**: Get instant, easy-to-understand explanations for SNAP application questions
- **Interactive Checklists**: Track required documents and preparation steps for SNAP eligibility
- **Interview Prep**: Prepare for SNAP interviews with AI-guided assistance
- **Browser Extension**: Seamless overlay that works directly on SNAP application forms

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gemini API key

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Gemini API key:**
   Create a `.env.local` file in the root directory and add:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build the extension for production
- `npm run preview` - Preview production build locally
- `npm run clean` - Remove the dist directory
- `npm run lint` - Check TypeScript types

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Google Genai** - AI integration
- **Lucide React** - Icons
- **Motion** - Animations
