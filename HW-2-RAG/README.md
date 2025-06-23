# RAG and Agent API

This project is a Python backend built with FastAPI that provides functionalities for Retrieval-Augmented Generation (RAG) and an AI agent powered by OpenAI's models.

## Features

- **Document Retrieval**: Retrieve relevant documents from a Vectorize.io vector store based on a user's query.
- **RAG Chat**: Engage in a conversation with an AI that uses the retrieved documents as a knowledge base to answer questions.
- **AI Agent**: Interact with an intelligent agent that can perform two main tasks:
    1.  Answer questions using the RAG pipeline.
    2.  Fetch the current weather for a specific location.

## Project Structure

The main logic is contained within `HW-2-RAG/backend/main.py`.

-   `main.py`: Contains the FastAPI application, including all endpoint definitions and agent logic.
-   `pyproject.toml`: Lists the project dependencies.

## Setup and Installation

1.  **Navigate to the backend directory**:
    ```bash
    cd HW-2-RAG/backend
    ```

2.  **Install dependencies**:
    It's recommended to use a virtual environment. The project uses `uv` for package management.
    ```bash
    uv pip install -r requirements.txt 
    # or based on pyproject.toml
    uv pip install fastapi pydantic uvicorn vectorize-client openai python-dotenv litellm
    ```

3.  **Create a `.env` file**:
    Create a `.env` file in the `HW-2-RAG/backend` directory and add the following environment variables:
    ```
    OPENAI_API_KEY="your_openai_api_key"
    VECTORIZE_TOKEN="your_vectorize_token"
    ORG_ID="your_vectorize_org_id"
    PIPE_ID="your_vectorize_pipe_id"
    ```

## Running the Application

To run the FastAPI server, execute the following command in the `HW-2-RAG/backend` directory:

```bash
uvicorn main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

## API Endpoints

The application exposes the following POST endpoints:

### 1. `/retrieve`

Retrieves documents relevant to the user's question.

-   **Request Body**:
    ```json
    {
      "question": "What is the capital of France?"
    }
    ```

### 2. `/rag`

Provides an answer to a question based on a set of retrieved documents.

-   **Request Body**:
    ```json
    {
      "question": "What is the main topic of the provided context?"
    }
    ```

### 3. `/agent`

An intelligent agent that can decide whether to use the weather tool or the document retrieval tool to answer a user's question.

-   **Request Body (Weather Example)**:
    ```json
    {
      "question": "what is the weather in tokyo?"
    }
    ```
-   **Request Body (RAG Example)**:
    ```json
    {
      "question": "summarize the document about AI"
    }
    ``` 