import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LaTeX from 'react-latex-next';
import './P5_Ejercicio_Detalle.css';

const P5_Ejercicio_Detalle = () => {
  const { id } = useParams(); // ID del ejercicio (proviene de la URL)
  const navigate = useNavigate();
  
  const [ejercicio, setEjercicio] = useState(null);
  const [hilo, setHilo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [childrenHidden, setChildrenHidden] = useState({});
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);

  useEffect(() => {
    const fetchFullDetalle = async () => {
      try {
        setCargando(true);
        
        // 1. OBTENER INFO BÁSICA DEL EJERCICIO
        const { data: ejData, error: errEj } = await supabase
          .from('tab_ejercicios')
          .select('tag, enunciado')
          .eq('id', id)
          .single();

        if (errEj) throw errEj;
        setEjercicio(ejData);

        // 2. OBTENER LAS RESOLUCIONES OFICIALES
        const { data: resData, error: errRes } = await supabase
          .from('tab_resoluciones')
          .select('*')
          .eq('ejercicio_id', id)
          .order('orden', { ascending: true });

        if (errRes) throw errRes;

        // 3. OBTENER COMENTARIOS (MANUAL JOIN)
        let finalHilo = [];
        
        if (resData && resData.length > 0) {
          const idsResoluciones = resData.map(r => r.id);
          
          // Intentamos traer comentarios. Si la columna aún no existe en DB, 
          // fallará pero no romperá la vista de la resolución.
          try {
            const { data: comData, error: errCom } = await supabase
              .from('tab_comentarios')
              .select('*')
              .in('resolucion_id', idsResoluciones);

            if (errCom) throw errCom;

            // Juntamos resoluciones con sus respectivos comentarios
            finalHilo = resData.map(res => ({
              ...res,
              tab_comentarios: comData ? comData.filter(c => c.resolucion_id === res.id) : []
            }));
          } catch (errorCom) {
            console.warn("⚠️ Advertencia: No se pudieron vincular comentarios (posible columna faltante):", errorCom.message);
            // Si fallan los comentarios, mostramos solo las resoluciones
            finalHilo = resData.map(res => ({ ...res, tab_comentarios: [] }));
          }
        }

        setHilo(finalHilo);

      } catch (err) {
        console.error("❌ ERROR CRÍTICO EN P5_SXTXRN:", err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchFullDetalle();
  }, [id]);

  const toggleChildren = (resId) => {
    setChildrenHidden(prev => ({ ...prev, [resId]: !prev[resId] }));
  };

  const handleGlobalToggle = () => {
    if (isAllCollapsed) {
      setChildrenHidden({});
      setIsAllCollapsed(false);
    } else {
      const allIds = {};
      hilo.forEach(item => { allIds[item.id] = true; });
      setChildrenHidden(allIds);
      setIsAllCollapsed(true);
    }
  };

  if (cargando) return <div className="p5-layout">[ ACCEDIENDO AL NÚCLEO DE DATOS... ]</div>;
  if (!ejercicio) return <div className="p5-layout">[ ERROR: EL EJERCICIO NO EXISTE EN LA DB ]</div>;

  return (
    <div className="p5-layout">
      {/* HEADER: ENUNCIADO DEL EJERCICIO */}
      <header className="p5-header">
        <div className="p5-nav">
           <span className="back-btn" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
             {'<'} VOLVER AL FEED
           </span>
           <span className="user-id">[ {ejercicio.tag || 'EJERCICIO'} ]</span>
        </div>
        <div className="op-enunciado math-render">
          <LaTeX>{ejercicio.enunciado}</LaTeX>
        </div>
        
        <div className="global-controls">
          <span className="control-btn" onClick={handleGlobalToggle} style={{ cursor: 'pointer' }}>
            {isAllCollapsed ? '[ EXPANDIR TODO ]' : '[ CONTRAER TODO ]'}
          </span>
        </div>
      </header>

      {/* MAIN: HILO DE RESOLUCIÓN */}
      <main className="p5-thread">
        {hilo.map((bloque) => {
          const areChildrenHidden = childrenHidden[bloque.id];
          const respuestas = bloque.tab_comentarios || [];

          return (
            <div key={bloque.id} className="comment-group">
              {/* BLOQUE OFICIAL (SXTXRN_SYS) */}
              <div className="comment-parent">
                <div className="comment-meta">
                  <span className="author-sys">{bloque.autor || 'SXTXRN_SYS'}</span> • verificado
                </div>
                <div className="comment-body math-render">
                  <div className="math-block">
                    <LaTeX>{bloque.math_block}</LaTeX>
                  </div>
                  <div className="text-block">
                    <LaTeX>{bloque.text_block}</LaTeX>
                  </div>
                </div>
                <div className="comment-actions">
                  <span className="votes">▲ {bloque.votos || 0} ▼</span>
                  <span className="action-link">Responder</span>
                  {respuestas.length > 0 && (
                    <span className="action-link toggle-btn" onClick={() => toggleChildren(bloque.id)}>
                      {areChildrenHidden ? `[ + ] Mostrar ${respuestas.length}` : '[ - ] Contraer'}
                    </span>
                  )}
                </div>
              </div>

              {/* HILO DE COMENTARIOS DE USUARIOS */}
              {!areChildrenHidden && respuestas.map((com) => (
                <div key={com.id} className="comment-child">
                  <div className="thread-line"></div>
                  <div className="child-content">
                    <div className="comment-meta">
                      <span className="author-user">{com.autor || 'anon_user'}</span>
                    </div>
                    <div className="comment-body math-render">
                      <LaTeX>{com.texto}</LaTeX>
                    </div>
                    <div className="comment-actions">
                      <span className="votes">▲ {com.votos || 0} ▼</span>
                      <span className="action-link">Responder</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </main>

      {/* FOOTER: INPUT DE DUDA */}
      <footer className="p5-footer">
        <div className="input-wrapper">
          <input type="text" placeholder="Escribe una duda sobre este paso..." disabled />
        </div>
      </footer>
    </div>
  );
};

export default P5_Ejercicio_Detalle;