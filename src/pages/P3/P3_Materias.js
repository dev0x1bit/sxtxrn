import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './P3_Materias.css';

const P3_Materias = ({ session }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [carpetaAbierta, setCarpetaAbierta] = useState(null);
  const [carpetasReales, setCarpetasReales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      if (!id || isNaN(id)) {
        console.error("ID recibido no es numérico:", id);
        return;
      }

      try {
        setCargando(true);
        // FIX 1: Incluimos el 'id' en el select para poder navegar correctamente
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
            // FIX 2: Guardamos el objeto completo (id y nombre) en lugar de solo el string
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

  return (
    <div className="p3-layout">
      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">DB_ENTRY: /{id}</span>
        </div>

        <div 
          className="user-icon" 
          onClick={() => !session && navigate('/login')} 
          style={{ cursor: 'pointer' }}
        >
          {session ? (
            <img 
              src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} 
              alt="u" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #00ff41' }} 
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=U&background=00ff41&color=000"; }}
            />
          ) : (
            "[ LOGIN ]"
          )}
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
                            // FIX 3: Navegamos usando el ID numérico real
                            // Esto garantiza que la P4 reciba el recurso_id correcto
                            navigate(`/visor/${archivo.id}`); 
                          }}
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
            <div className="full-screen-item">[ NO HAY RECURSOS PARA EL ID {id} ]</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default P3_Materias;