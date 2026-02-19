import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './P3_Materias.css';

const P3_Materias = () => {
  const { id } = useParams(); // Recibe el "3" directamente
  const navigate = useNavigate();
  
  const [carpetaAbierta, setCarpetaAbierta] = useState(null);
  const [carpetasReales, setCarpetasReales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      // Validamos que el ID sea el número que vimos en la captura
      if (!id || isNaN(id)) {
        console.error("ID recibido no es numérico:", id);
        return;
      }

      try {
        setCargando(true);

        // QUERY LIMPIA: Traeme todo de tab_recursos donde materia_id sea 3
        const { data: logs, error } = await supabase
          .from('tab_recursos')
          .select('nombre, categoria')
          .eq('materia_id', parseInt(id)); 

        if (error) throw error;

        if (logs && logs.length > 0) {
          // Agrupamos por la columna 'categoria' ("2024 - PARCIALES")
          const agrupado = logs.reduce((acc, curr) => {
            const cat = curr.categoria || "GENERAL";
            if (!acc[cat]) {
              acc[cat] = { titulo: cat, archivos: [] };
            }
            acc[cat].archivos.push(curr.nombre);
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

  return (
    <div className="p3-layout">
      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">DB_ENTRY: /{id}</span>
        </div>
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
                          onClick={() => {
                            const slug = archivo.toLowerCase().replace(/ /g, '-');
                            navigate(`/visor/${slug}`);
                          }}
                        >
                          - {archivo.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="full-screen-item">[ NO HAY RECURSOS PARA EL ID {id} ]</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default P3_Materias;