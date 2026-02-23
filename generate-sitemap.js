const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

/**
 * 1. CARGA MANUAL DE VARIABLES DE ENTORNO
 * Lee el archivo .env de tu PC y extrae las keys para usarlas en Node.
 */
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ No se encontró archivo .env local (Vercel usará sus propias variables).');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
}

loadEnv();

/**
 * 2. CONEXIÓN A SUPABASE
 */
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "", 
  process.env.REACT_APP_SUPABASE_ANON_KEY || ""
);

async function generate() {
  console.log('--- 🚀 Iniciando Generación de Sitemap ---');
  
  try {
    // 3. EXTRACCIÓN DE DATOS (Usando tus nombres reales de tablas)
    // Buscamos los IDs de los ejercicios en 'tab_ejercicios'
    const { data: ejercicios, error } = await supabase
      .from('tab_ejercicios') 
      .select('id'); 

    if (error) throw error;

    // Rutas fijas de tu búnker
    const staticRoutes = ['', '/quimica', '/analisis-matematico']; 

    /**
     * 4. TRANSFORMACIÓN A XML
     * Mapeamos cada registro de la DB a una URL del sitemap.
     */
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>https://satxrn.com.ar${route}</loc>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${ejercicios ? ejercicios.map(ej => `
  <url>
    <loc>https://satxrn.com.ar/ejercicio/${ej.id}</loc>
    <priority>0.6</priority>
  </url>`).join('') : ''}
</urlset>`;

    // 5. CARGA (Escritura del archivo en la carpeta public)
    fs.writeFileSync('public/sitemap.xml', sitemap);
    
    console.log(`✅ ¡Éxito! El sitemap ahora tiene ${ejercicios?.length + staticRoutes.length} URLs indexables.`);
    
  } catch (err) {
    console.error('❌ Error en el proceso:', err.message);
  }
}

generate();