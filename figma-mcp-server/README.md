# Figma MCP Server – Documentation

## Overview

**Figma MCP Server** is a full-stack application that allows users to interact with a code generation agent via a chat interface. Users can send prompts or Figma node links, and the backend (powered by FastAPI and an AI agent) will return generated code or answers, which are displayed in a user-friendly UI.

- **Frontend:** Next.js + React, with a chat UI and a result code viewer.
- **Backend:** FastAPI, with an agent that processes prompts and returns code or information.

## How it works

1. **User Interaction:**  
   The user types a prompt or pastes a Figma node link in the chat and clicks "Send".

2. **API Request:**  
   The frontend sends a POST request to the backend endpoint `/agent` with the user's prompt.

3. **Agent Processing:**  
   The backend agent processes the prompt (using AI, RAG, and Figma tools) and returns a response, usually containing code or an explanation.

4. **Display:**  
   - The chat displays a confirmation message ("Code generated:").
   - The result section shows the full response from the agent (including code blocks, explanations, etc.).

## Example

**User prompt:**
```
https://www.figma.com/design/3YxhVqhNV82LU6qQkUH21p/Example-Design?node-id=123-456
I want the code for this component.
```

**Backend response:**
```
Here is the code for the selected Figma node:

```javascript
import { Button } from '@innovaccer/design-system';
```
You can use this component in your project as shown above.
```

**What you see in the app:**
- The chat shows:  
  `Code generated:`
- The result section shows:  
  ```
  Here is the code for the selected Figma node:

  ```javascript
  import { Button } from '@innovaccer/design-system';
  ```
  You can use this component in your project as shown above.
  ```

## Running the project

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
