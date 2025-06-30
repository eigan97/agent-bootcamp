import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.FIRECRAWL_API_KEY || '';
const START_URL = 'https://design.innovaccer.com/components/overview/all-components/';
const MAX_DEPTH = 20;
const MARKDOWN_DIR = path.join(__dirname, '../markdown');

interface ScrapedData {
    titulo: string | null;
    descripcion: string | null;
    url: string;
}

const app = new FirecrawlApp({ apiKey: API_KEY });
const visited = new Set<string>();
const resultados: ScrapedData[] = [];

// Crear la carpeta markdown si no existe
if (!fs.existsSync(MARKDOWN_DIR)) {
    fs.mkdirSync(MARKDOWN_DIR, { recursive: true });
}

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function crawl(url: string, depth: number) {
    if (visited.has(url) || depth > MAX_DEPTH) return;
    visited.add(url);

    try {
        const res = await app.scrapeUrl(url, { formats: ['html', 'markdown'] });
        if (!res.success) {
            console.error(`Error al scrappear ${url}:`, res.error);
            return;
        }
        const html = res.html || '';
        const markdown = res.markdown || '';
        const urlFinal = res.metadata?.sourceURL || url;

        // Extraer título y descripción del HTML
        const titulo = html.match(/<title>(.*?)<\/title>/i)?.[1] || null;
        const descripcion = html.match(/<meta name="description" content="(.*?)"/i)?.[1] || null;

        resultados.push({ titulo, descripcion, url: urlFinal });

        // Guardar el markdown en un archivo
        let fileName = titulo ? slugify(titulo) : slugify(urlFinal);
        if (!fileName) fileName = `page-${Date.now()}`;
        const filePath = path.join(MARKDOWN_DIR, `${fileName}.md`);
        fs.writeFileSync(filePath, markdown, 'utf-8');

        // Extraer enlaces
        const enlaces = Array.from(html.matchAll(/<a [^>]*href=["']([^"'#]+)["']/gi)).map((m: RegExpMatchArray) => m[1]);
        for (const enlace of enlaces) {
            let nextUrl = enlace;
            if (nextUrl.startsWith('/')) {
                // Convertir a URL absoluta
                const base = new URL(urlFinal);
                nextUrl = base.origin + nextUrl;
            }
            if (nextUrl.startsWith('http')) {
                await crawl(nextUrl, depth + 1);
            }
        }
    } catch (error) {
        console.error(`Error al crawlear ${url}:`, error);
    }
}

(async () => {
    await crawl(START_URL, 0);
    console.log('Datos extraídos:', resultados);
    fs.writeFileSync('resultados.json', JSON.stringify(resultados, null, 2));
})();
