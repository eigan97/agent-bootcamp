import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# Definir ruta absoluta para persistencia
PERSIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../chroma-data'))
print(f'La base de datos vectorial se guardará en: {PERSIST_DIR}')

# Configuración de ChromaDB local
client = chromadb.Client(Settings(
    persist_directory=PERSIST_DIR,
    is_persistent=True # Carpeta donde se guardan los datos
))

# Extensiones válidas
VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json']

# Leer archivos recursivamente
def read_files_recursively(dir_path):
    files = []
    for root, _, filenames in os.walk(dir_path):
        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if ext in VALID_EXTENSIONS:
                file_path = os.path.join(root, filename)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                files.append({'file_path': file_path, 'content': content})
    return files

# Indexar archivos en ChromaDB
def index_files(files, collection_name='data-files'):
    # Usar SentenceTransformer para embeddings
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    collection = client.get_or_create_collection(collection_name)
    for file in files:
        embedding = embedder.encode(file['content']).tolist()
        collection.add(
            ids=[file['file_path']],
            embeddings=[embedding],
            documents=[file['content']],
            metadatas=[{'file_path': file['file_path']}]
        )
    print('Indexación completada.')

# Consultar ChromaDB
def query_chroma(query, collection_name='data-files', top_k=3):
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    collection = client.get_or_create_collection(collection_name)
    query_embedding = embedder.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results

if __name__ == '__main__':
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
    files = read_files_recursively(data_dir)
    index_files(files)
    # Consulta de ejemplo
    query = 'button accesibilidad'
    results = query_chroma(query)
    print('Resultados de la consulta:')
    print(results)
