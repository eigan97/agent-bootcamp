from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from figma_agent import figma_agent

app = FastAPI()

# Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir a ["http://localhost:3000"] si lo prefieres
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definir ruta absoluta para persistencia
PERSIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../chroma-data'))

# Configuración de ChromaDB local
client = chromadb.Client(Settings(
    persist_directory=PERSIST_DIR,
    is_persistent=True
))

def query_chroma(query, collection_name='data-files', top_k=3):
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    collection = client.get_or_create_collection(collection_name)
    query_embedding = embedder.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results

@app.post('/query')
async def query_endpoint(request: Request):
    try:
        data = await request.json()
        q = data.get('q')
        if not q:
            raise HTTPException(status_code=400, detail="Falta el parámetro 'q' en el body")
        results = query_chroma(q)
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PromptRequest(BaseModel):
    prompt: str

@app.on_event("startup")
async def startup_event():
    await figma_agent.initialize()  # Solo una vez al iniciar el servidor

@app.post("/agent")
async def run_agent(request: PromptRequest):
    result = await figma_agent.run(request.prompt)
    return {"respuesta": result}

# Para correr el servidor:
# uvicorn rag.api:app --reload 