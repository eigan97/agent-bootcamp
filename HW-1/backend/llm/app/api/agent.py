from fastapi import APIRouter
from litellm import completion
import os
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse

load_dotenv()

router = APIRouter()

@router.get("/", summary="Obtener información del agente")
def get_agent():
    try:
        print(os.getenv("OPENAI_API_KEY"))
        response = completion(
            model="openai/gpt-4o",
            messages=[{"content": "Create a  a short poem 4 lines is the maximum about a AI bootcamp", "role": "user"}],
        )
        print(response.choices[0].message.content)
        return {"message": response.choices[0].message.content}
    except Exception as e:
        print("Error:", e)
        return {"error": str(e)}

@router.get("/stream", summary="Obtener información del agente en streaming")
def get_agent_stream():
    try:
        print(os.getenv("OPENAI_API_KEY"))
        # El generador que produce los fragmentos de texto
        def event_generator():
            try:
                response = completion(
                    model="openai/gpt-4o",
                    messages=[{"content": "Create a  a short poem 4 lines is the maximum", "role": "user"}],
                    stream=True
                )
                for chunk in response:
                    print(chunk)  # Para depuración
                    if hasattr(chunk.choices[0], "delta") and "content" in chunk.choices[0].delta:
                        content = chunk.choices[0].delta["content"]
                        if content is not None:
                            yield content.encode("utf-8")
            except Exception as e:
                print("Error en el generador:", e)
                yield f"Error: {str(e)}".encode("utf-8")

        return StreamingResponse(event_generator(), media_type="text/plain")
    except Exception as e:
        print("Error:", e)
        return {"error": str(e)}