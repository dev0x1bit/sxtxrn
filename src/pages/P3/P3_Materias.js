import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import './P3_Materias.css';

const P3_Materias = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [carpetaAbierta, setCarpetaAbierta] = useState(null);
  const [carpetasReales, setCarpetasReales] = useState([]);
  const [nombreMateria, setNombreMateria] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      if (!id || isNaN(id)) return;

      try {
        setCargando(true);

        const { data: materiaInfo } = await supabase
          .from('tab_materias')
          .select('nombre')
          .eq('id', id)
          .single();
        
        if (materiaInfo) setNombreMateria(materiaInfo.nombre);

        const { data: logs, error } = await supabase
          .from('tab_recursos')
          .select('id, nombre, categoria') 
          .eq('materia_id', parseInt(id))
          .order('id', { ascending: true });

        if (error) throw error;

        if (logs && logs.length > 0) {
          const agrupado = logs.reduce((acc, curr) => {
            const cat = curr.categoria || "GENERAL";
            if (!acc[cat]) {
              acc[cat] = { titulo: cat, archivos: [] };
            }
            acc[cat].archivos.push({ id: curr.id, nombre: curr.nombre });
            return acc;
          }, {});

          setCarpetasReales(Object.values(agrupado));
        }
      } catch (err) {
        console.error("Error en P3:", err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchContenido();
  }, [id]);

  const displayTitle = nombreMateria || id;

  return (
    <div className="p3-layout">
      <Helmet>
        <title>{`Recursos de ${displayTitle.toUpperCase()} | SXTXRN`}</title>
        <meta 
          name="description" 
          content={`Descargá parciales y guías de ${displayTitle} en SXTXRN.`} 
        />
        <link rel="canonical" href={`https://satxrn.com.ar/materia/${id}`} />
      </Helmet>

      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">DB_ENTRY: /{displayTitle.toUpperCase()}</span>
        </div>
        {/* 🚀 ELIMINADO: El icono de usuario y lógica de sesión ya no existen aquí */}
      </header>

      <main className="main-content-list">
        <div className="full-screen-menu">
          {cargando ? (
            <div className="full-screen-item">[ ESCANEANDO TAB_RECURSOS... ]</div>
          ) : carpetasReales.length > 0 ? (
            carpetasReales.map((carpeta, index) => {
              const estaAbierta = carpetaAbierta === index;
              return (
                <div key={index} className="carpeta-container">
                  <div 
                    className={`document-item ${estaAbierta ? 'active' : ''}`}
                    onClick={() => setCarpetaAbierta(estaAbierta ? null : index)}
                  >
                    <div className="doc-title">
                      {estaAbierta ? 'v' : '>'} [ {carpeta.titulo} ]
                    </div>
                    <div className="doc-meta">{carpeta.archivos.length} ARCHIVOS</div>
                  </div>

                  {estaAbierta && (
                    <div className="sub-menu">
                      {carpeta.archivos.map((archivo, i) => (
                        <div 
                          key={i} 
                          className="sub-item"
                          onClick={() => navigate(`/visor/${archivo.id}`)}
                        >
                          - {archivo.nombre.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="full-screen-item empty">[ NO HAY RECURSOS PARA {displayTitle} ]</div>
          )}
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}> [ ⌂ ] </div>
      </footer>
    </div>
  );
};

export default P3_Materias;