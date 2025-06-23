from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import vectorize_client as v
import os
from typing import List
import litellm
import openai
import json

load_dotenv()
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia esto por el dominio de tu frontend si lo prefieres
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI()


def get_current_weather(location: str, unit: str = "fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})


def retrieve_documents_for_agent(question: str, num_results: int = 5):
    """Retrieve documents from Vectorize"""
    try:
        api = v.ApiClient(
            v.Configuration(
                access_token=os.environ.get("VECTORIZE_TOKEN"),
                host="https://api.vectorize.io/v1",
            )
        )
        pipelines = v.PipelinesApi(api)
        response = pipelines.retrieve_documents(
            os.environ.get("ORG_ID"),
            os.environ.get("PIPE_ID"),
            v.RetrieveDocumentsRequest(
                question=question,
                num_results=num_results,
            ),
        )
        return [d.to_dict() for d in response.documents]
    except Exception as e:
        print(f"ERROR: Exception in retrieve_documents_for_agent: {e}")
        return []


# litellm will automatically use the OPENAI_API_KEY from the environment
class QuestionRequest(BaseModel):
    question: str


@app.post("/retrieve")
def retrieve_documents(request: QuestionRequest):
    try:
        documents = retrieve_documents_for_agent(request.question)
        return JSONResponse(content={"documents": documents})
    except Exception as e:
        print(f"ERROR: Exception in /retrieve: {e}")
        return JSONResponse(
            content={"error": "Failed to process request"}, status_code=500
        )


@app.post("/agent")
async def agent(request: QuestionRequest):
    try:
        user_message = request.question

        if not user_message:
            raise HTTPException(status_code=400, detail="Question cannot be empty.")

        messages = [
            {"role": "system", "content": "You are a powerful assistant that uses tools to answer user questions. After using a tool, you MUST formulate a response to the user. CRITICAL INSTRUCTION: Your final response to the user MUST be in the exact same language as the user's original question."},
            {"role": "user", "content": user_message}
        ]
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_current_weather",
                    "description": "Get the current weather in a given location and optionally specify the temperature unit",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA",
                            },
                            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                        },
                        "required": ["location"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "retrieve_documents_for_agent",
                    "description": "Retrieve documents to answer questions about specific topics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "question": {
                                "type": "string",
                                "description": "The question to retrieve documents for",
                            },
                            "num_results": {
                                "type": "integer",
                                "description": "The number of documents to retrieve",
                            },
                        },
                        "required": ["question"],
                    },
                },
            },
        ]

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            available_functions = {
                "get_current_weather": get_current_weather,
                "retrieve_documents_for_agent": retrieve_documents_for_agent,
            }
            messages.append(response_message)

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions[function_name]
                function_args = json.loads(tool_call.function.arguments)
                function_response = function_to_call(**function_args)
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": str(function_response),
                    }
                )

            second_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
            )
            response_message = second_response.choices[0].message

        return JSONResponse(
            content={
                "role": "assistant",
                "content": response_message.content,
            }
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERROR: Exception in /agent: {e}")
        return JSONResponse(
            content={"error": "Failed to process request"}, status_code=500
        )


@app.post("/rag")
async def get_answer(request: QuestionRequest):
    try:
        user_message = request.question

        if not user_message:
            raise HTTPException(status_code=400, detail="Question cannot be empty.")

        # Retrieve documents from Vectorize
        documents = retrieve_documents_for_agent(user_message)
        sources = documents
        context_documents = "\n\n".join([doc["text"] for doc in documents])

        system_prompt = f"""You are a helpful AI assistant that specializes in answering questions user have based on sources.

When answering questions, use the following context documents to provide accurate and relevant information:

=== CONTEXT DOCUMENTS ===
{context_documents}
=== END CONTEXT DOCUMENTS ===

Please base your responses on the context provided above when relevant. If the context doesn't contain information to answer the question, acknowledge this and provide general knowledge while being clear about what information comes from the context vs. your general knowledge.
Keep your answer to less than 10 sentences answer in spanish."""

        messages_for_openai = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

        # Call the model using litellm
        completion = litellm.completion(
            model="gpt-4o-mini",
            messages=messages_for_openai,
        )

        response_text = completion.choices[0].message.content

        return JSONResponse(
            content={
                "role": "assistant",
                "content": response_text,
                "sources": sources,
            }
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERROR: Exception in /rag: {e}")
        return JSONResponse(
            content={"error": "Failed to process request"}, status_code=500
        )
