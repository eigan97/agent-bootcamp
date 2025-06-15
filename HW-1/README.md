# AI Poem Generator

![AI Poem](frontend/public/poem_image.png)

This project is a web application that generates short poems using artificial intelligence. It consists of a frontend built with Next.js and a backend in FastAPI that uses OpenAI's GPT-4o model to create the poems.

## Project Structure

```
HW-1/
├── frontend/   # User interface (Next.js)
├── backend/    # API and poem generation logic (FastAPI)
```

---

## Frontend (Next.js)

- Allows users to generate and view short poems with the click of a button.
- Uses custom components to display poems in an attractive way.
- Communicates with the backend to fetch new AI-generated poems.
- To start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## Backend (FastAPI)

- Exposes a REST API that generates poems using OpenAI's GPT-4o model.
- Main endpoint: `/agent` (GET) — Returns an AI-generated poem.
- Endpoint `/agent/stream` — Returns the poem in streaming mode.
- To start the backend:

```bash
cd backend/llm
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Cover Image

The following image illustrates the creative spirit of the project:

![AI Poem](frontend/public/poem_image.png)

---

## Requirements
- Node.js and npm for the frontend
- Python 3.10+ and FastAPI for the backend
- An OpenAI API key (set in environment variables)

---

## Credits
- Inspired by the creativity of AI and machine learning. 