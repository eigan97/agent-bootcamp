import fs from 'fs';
import path from 'path';
import { ChromaClient } from 'chromadb';

// Extensiones de archivos a indexar
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json'];

// Función para leer archivos recursivamente
type FileEntry = { filePath: string; content: string };
function readFilesRecursively(dir: string): FileEntry[] {
    let results: FileEntry[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(readFilesRecursively(filePath));
        } else {
            if (VALID_EXTENSIONS.includes(path.extname(file))) {
                const content = fs.readFileSync(filePath, 'utf8');
                results.push({ filePath, content });
            }
        }
    });
    return results;
}

// Indexar archivos en ChromaDB
async function indexFilesInChroma(files: FileEntry[]) {
    const client = new ChromaClient();
    const collection = await client.getOrCreateCollection({ name: 'data-files' });
    for (const file of files) {
        await collection.add({
            ids: [file.filePath],
            documents: [file.content],
            metadatas: [{ filePath: file.filePath }],
        });
    }
    console.log('Indexación completada.');
}

// Consultar ChromaDB
async function queryChroma(query: string, topK = 3) {
    const client = new ChromaClient();
    const collection = await client.getOrCreateCollection({ name: 'data-files' });
    const results = await collection.query({
        queryTexts: [query],
        nResults: topK,
    });
    return results;
}

// Ejemplo de uso
async function main() {
    // Obtener el directorio actual de este archivo en ES Modules
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    const dataDir = path.join(__dirname, '../data');
    const files = readFilesRecursively(dataDir);
    await indexFilesInChroma(files);
    // Consulta de ejemplo
    const query = 'button accesibilidad';
    const results = await queryChroma(query);
    console.log('Resultados de la consulta:', JSON.stringify(results, null, 2));
}

// Ejecutar main solo si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
