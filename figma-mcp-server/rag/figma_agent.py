# figma_agent.py

from agents import Agent, Runner, function_tool
from dotenv import load_dotenv
import os
import sys
import openai
from index import query_chroma
from agents.mcp import MCPServerSse

sys.path.append(os.path.dirname(__file__))
load_dotenv()

class FigmaAgent:
    def __init__(self):
        self.agent = None  # Se inicializa después
        self.mcp_server = None

    async def initialize(self):
        # Cargar API key
        openai.api_key = os.getenv("OPENAI_API_KEY")

        # Crear y conectar el MCP server
        self.mcp_server = MCPServerSse(
            name="Figma MCP Server",
            params={"url": "http://127.0.0.1:3845/sse"},
            client_session_timeout_seconds=200,
            cache_tools_list=True,
        )
        await self.mcp_server.connect()

        # Herramienta local con RAG + LLM
        @function_tool(name_override="get_information_tool") 
        def get_information_tool(input_text: str) -> str:
            """
            Recupera información del diseño del sistema @innovaccer/design-system enriquecida con un modelo LLM
            """
            try:
                results = query_chroma(input_text)
                if not results or not results.get('documents'):
                    return 'No se encontraron resultados relevantes.'

                docs = results['documents'][0]
                metadatas = results.get('metadatas', [[]])[0]
                context = "\n".join([
                    f"Archivo: {meta.get('file_path', 'desconocido')}\n{doc[:1000]}"
                    for doc, meta in zip(docs, metadatas)
                ])
                prompt = f"""
                Eres un experto en design systems. Usando solo la siguiente información de contexto, responde de forma clara y precisa a la consulta del usuario. 
                Si el contexto no es suficiente, indica que no hay suficiente información.\n\nContexto:\n{context}\n\nConsulta del usuario: {input_text}\n\nRespuesta:
                """

                response = openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Eres un experto en design systems."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.2
                )
                return response["choices"][0]["message"]["content"].strip()
            except Exception as e:
                return f"Error al obtener información: {str(e)}"

        # Crear el agente
        self.agent = Agent(
            name="Assistant",
            instructions="Eres un asistente útil. Usa herramientas RAG y del servidor MCP para responder.",
            model="gpt-4o-mini",
            tools=[get_information_tool],
            mcp_servers=[self.mcp_server]
        )

    async def run(self, prompt: str) -> str:
        if not self.agent:
            raise RuntimeError("Agente no inicializado. Llama primero a `await figma_agent.initialize()`.")
        result = await Runner.run(self.agent, prompt)
        return result.final_output

# Instancia global
figma_agent = FigmaAgent()
