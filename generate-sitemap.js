const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.trim().split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
      process.env[key.trim()] = value;
    }
  });
}

loadEnv();

/**
 * SLUGIFY PRO: Quita acentos, eñes y caracteres raros.
 */
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')                   // Descompone acentos (á -> a + ´)
    .replace(/[\u0300-\u036f]/g, '')    // Borra los acentos (el palito solo)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')               // Espacios por guiones
    .replace(/[^\w-]+/g, '')            // Borra todo lo que no sea letra, número o guion
    .replace(/--+/g, '-');              // No deja guiones dobles
};

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL || "", process.env.REACT_APP_SUPABASE_ANON_KEY || "");

async function generate() {
  console.log('--- 🚀 Generando Sitemap Jerárquico Limpio ---');
  try {
    // Traemos Ejercicios y Materias
    const { data: ejercicios } = await supabase.from('tab_ejercicios').select('id, tema, materia_id');
    const { data: materias } = await supabase.from('tab_materias').select('id, nombre');

    const materiasMap = Object.fromEntries(materias.map(m => [m.id, m.nombre]));
    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://satxrn.com.ar</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  ${ejercicios ? ejercicios.map(ej => {
    const materiaClean = slugify(materiasMap[ej.materia_id]);
    const temaClean = slugify(ej.tema);
    
    // Armamos la URL: cbc-analisis-matematico-sucesiones-21
    const superSlug = `cbc-${materiaClean}-${temaClean}-${ej.id}`;
    
    return `
  <url>
    <loc>https://satxrn.com.ar/ejercicio/${superSlug}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>`;
  }).join('') : ''}
</urlset>`;

    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log(`✅ ¡Éxito! Sitemap generado sin acentos y con jerarquía.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

generate();