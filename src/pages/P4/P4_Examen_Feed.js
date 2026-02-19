import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LaTeX from 'react-latex-next'; 
import './P4_Examen_Feed.css';

const P4_Examen_Feed = () => {
  const { id } = useParams(); // ID del recurso (ej: 14)
  const navigate = useNavigate();
  
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchEjercicios = async () => {
      if (!id) return;
      try {
        setCargando(true);
        
        let recursoIdFinal = id;
        // Escudo por si la P3 manda el nombre en vez del ID
        if (isNaN(id)) {
          const { data: rec } = await supabase
            .from('tab_recursos')
            .select('id')
            .ilike('nombre', id.replace(/-/g, ' '))
            .maybeSingle();
          if (rec) recursoIdFinal = rec.id;
        }

        const { data, error } = await supabase
          .from('tab_ejercicios')
          .select('*')
          .eq('recurso_id', parseInt(recursoIdFinal))
          .order('id', { ascending: true });

        if (error) throw error;
        setEjercicios(data || []);
      } catch (err) {
        console.error("Error P4:", err.message);
      } finally {
        setCargando(false);
      }
    };
    fetchEjercicios();
  }, [id]);

  const tituloExamen = id ? `EXAMEN_${id}` : 'EXAMEN';

  return (
    <div className="p4-layout">
      {/* HEADER ORIGINAL */}
      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">FEED: /{tituloExamen}</span>
        </div>
        <div className="user-icon">[ USUARIO ]</div>
      </header>

      <main className="main-feed">
        <div className="feed-container">
          {cargando ? (
            <div className="full-screen-item">[ ESCANEANDO EJERCICIOS... ]</div>
          ) : ejercicios.length > 0 ? (
            ejercicios.map((ej) => (
              <div key={ej.id} className="post-card">
                
                {/* ÁREA CLICKEABLE PARA P5 */}
                <div 
                  className="post-clickable-area" 
                  onClick={() => navigate(`/ejercicio/${ej.id}`)}
                >
                  <div className="post-header">
                    <span className="post-tag">{ej.tag || `EJERCICIO ${ej.id}`}</span>
                    <span className="post-meta">{ej.resuelto ? '[ RESUELTO ]' : '[ PENDIENTE ]'}</span>
                  </div>
                  
                  <div className="post-content">
                    <h3 className="post-tema">{ej.tema}</h3>
                    <div className="post-text math-render">
                      <LaTeX>{ej.enunciado}</LaTeX>
                    </div>
                  </div>
                </div>

                {/* BARRA DE ICONOS (SOCIAL) - RESTAURADA */}
                <div className="post-footer">
                  <div className="footer-left">
                    <div className="stat-group">
                      <span className="icon-btn">▲</span>
                      <span className="vote-count">{ej.votos_up || 0}</span>
                    </div>
                    <div className="stat-group">
                      <span className="icon-btn">▼</span>
                      <span className="vote-count">{ej.votos_down || 0}</span>
                    </div>
                    <div className="stat-group">
                      <span className="icon-btn">💬</span>
                      <span className="vote-count">{ej.comentarios_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="footer-right">
                    <span className="icon-btn star-btn">★</span>
                    <span className="icon-btn share-btn">➦</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="full-screen-item">[ NO HAY REGISTROS ]</div>
          )}
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>[ ⌂ ]</div>
      </footer>
    </div>
  );
};

export default P4_Examen_Feed;