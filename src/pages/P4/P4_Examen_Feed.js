import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; //
import { supabase } from '../../lib/supabase';
import LaTeX from 'react-latex-next'; 
import './P4_Examen_Feed.css';

const P4_Examen_Feed = ({ session }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [ejercicios, setEjercicios] = useState([]);
  const [nombreRecurso, setNombreRecurso] = useState(''); // Nuevo: para el <title>
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchEjerciciosYConteos = async () => {
      if (!id) return;
      try {
        setCargando(true);
        let recursoIdFinal = id;
        
        // 🚀 Buscamos el nombre del recurso para el SEO
        if (!isNaN(id)) {
          const { data: recName } = await supabase.from('tab_recursos').select('nombre').eq('id', id).single();
          if (recName) setNombreRecurso(recName.nombre);
        }

        if (isNaN(id)) {
          const { data: rec } = await supabase.from('tab_recursos').select('id, nombre').ilike('nombre', id.replace(/-/g, ' ')).maybeSingle();
          if (rec) {
            recursoIdFinal = rec.id;
            setNombreRecurso(rec.nombre);
          }
        }

        const { data: ejData, error: ejError } = await supabase.from('tab_ejercicios').select('*').eq('recurso_id', parseInt(recursoIdFinal)).order('id', { ascending: true });
        if (ejError) throw ejError;

        if (ejData && ejData.length > 0) {
          const idsEjercicios = ejData.map(e => e.id);
          const [resPromise, comPromise] = [
            supabase.from('tab_resoluciones').select('ejercicio_id, votos_up, votos_down').in('ejercicio_id', idsEjercicios),
            supabase.from('tab_comentarios').select('ejercicio_id, votos_up, votos_down').in('ejercicio_id', idsEjercicios)
          ];
          const [{ data: resData }, { data: comData }] = await Promise.all([resPromise, comPromise]);

          const ejerciciosConTotales = ejData.map(ej => {
            const misResoluciones = resData ? resData.filter(r => Number(r.ejercicio_id) === Number(ej.id)) : [];
            const misComentarios = comData ? comData.filter(c => Number(c.ejercicio_id) === Number(ej.id)) : [];
            const totalUp = misResoluciones.reduce((acc, curr) => acc + (curr.votos_up || 0), 0) + misComentarios.reduce((acc, curr) => acc + (curr.votos_up || 0), 0);
            const totalDown = misResoluciones.reduce((acc, curr) => acc + (curr.votos_down || 0), 0) + misComentarios.reduce((acc, curr) => acc + (curr.votos_down || 0), 0);
            return { ...ej, real_up: totalUp, real_down: totalDown, real_comments: misComentarios.length };
          });
          setEjercicios(ejerciciosConTotales);
        } else { setEjercicios([]); }
      } catch (err) { console.error("Error P4:", err.message); } finally { setCargando(false); }
    };
    fetchEjerciciosYConteos();
  }, [id]);

  const tituloExamen = nombreRecurso || id;

  return (
    <div className="p4-layout">
      {/* 🚀 SEO DINÁMICO: Título específico del examen */}
      <Helmet>
        <title>{`Ejercicios de ${tituloExamen.toUpperCase()} | SXTXRN`}</title>
        <meta 
          name="description" 
          content={`Lista de ejercicios resueltos de ${tituloExamen}. Mirá las resoluciones verificadas y comentarios de la comunidad en el búnker.`} 
        />
        <link rel="canonical" href={`https://satxrn.com.ar/visor/${id}`} />
      </Helmet>

      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">FEED: /{tituloExamen.toUpperCase()}</span>
        </div>
        <div className="user-icon" onClick={() => !session && navigate('/login')} style={{ cursor: 'pointer' }}>
          {session ? (
            <img src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} alt="u" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #00ff41', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=U&background=00ff41&color=000"; }} />
          ) : "[ LOGIN ]"}
        </div>
      </header>

      <main className="main-feed">
        <div className="feed-container">
          {cargando ? (
            <div className="full-screen-item">[ ESCANEANDO NÚCLEO... ]</div>
          ) : ejercicios.length > 0 ? (
            ejercicios.map((ej) => (
              <div key={ej.id} className="post-card">
                <div className="post-clickable-area" onClick={() => navigate(`/ejercicio/${ej.id}`)}>
                  <div className="post-header">
                    <span className="post-tag">{ej.tag || `ID_${ej.id}`}</span>
                    <span className={`post-meta ${ej.resuelto ? 'resuelto' : ''}`}>{ej.resuelto ? '● VERIFICADO' : '○ PENDIENTE'}</span>
                  </div>
                  <div className="post-content">
                    <h3 className="post-tema">{ej.tema || 'SIN TEMA'}</h3>
                    <div className="post-text math-render"><LaTeX>{ej.enunciado}</LaTeX></div>
                  </div>
                </div>

                <div className="post-footer">
                  <div className="footer-left">
                    <div className={`stat-group ${ej.real_up > ej.real_down ? 'score-up' : ''}`}>
                      <span className="stat-icon">▲</span>
                      <span className="stat-value">{ej.real_up || 0}</span>
                    </div>
                    <div className={`stat-group ${ej.real_down > ej.real_up ? 'score-down' : ''}`}>
                      <span className="stat-icon">▼</span>
                      <span className="stat-value">{ej.real_down || 0}</span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-icon">💬</span>
                      <span className="stat-value">{ej.real_comments || 0}</span>
                    </div>
                  </div>
                  <div className="footer-right">
                    <span className="icon-btn">★</span>
                    <span className="icon-btn">➦</span>
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