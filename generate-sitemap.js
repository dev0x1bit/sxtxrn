const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ ERROR: No se encontró el archivo .env en: ' + envPath);
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Limpiamos la línea de espacios y posibles retornos de carro (\r)
    const [key, ...valueParts] = line.trim().split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Quitamos comillas si tiene
      process.env[key.trim()] = value.trim();
    }
  });
}

loadEnv();

// --- DEBUG: Chequeo de variables ---
console.log('📡 URL:', process.env.REACT_APP_SUPABASE_URL ? 'Cargada ✅' : 'VACÍA ❌');
console.log('🔑 KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Cargada ✅' : 'VACÍA ❌');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "", 
  process.env.REACT_APP_SUPABASE_ANON_KEY || ""
);

async function generate() {
  try {
    console.log('--- 🔍 Consultando tab_ejercicios... ---');
    
    const { data: ejercicios, error } = await supabase
      .from('tab_ejercicios') // Nombre real según tu query
      .select('id'); 

    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      return;
    }

    console.log(`📊 Datos recibidos: ${ejercicios?.length || 0} ejercicios.`);

    const staticRoutes = ['', '/quimica', '/analisis-matematico']; 

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>https://satxrn.com.ar${route}</loc>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${ejercicios && ejercicios.length > 0 ? ejercicios.map(ej => `
  <url>
    <loc>https://satxrn.com.ar/ejercicio/${ej.id}</loc>
    <priority>0.6</priority>
  </url>`).join('') : ''}
</urlset>`;

    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('💾 Archivo guardado en public/sitemap.xml');
    
  } catch (err) {
    console.error('💥 Error crítico:', err.message);
  }
}

generate();