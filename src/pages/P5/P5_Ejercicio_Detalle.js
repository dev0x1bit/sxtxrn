import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LaTeX from 'react-latex-next';
import './P5_Ejercicio_Detalle.css';

const P5_Ejercicio_Detalle = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ejercicio, setEjercicio] = useState(null);
  const [hilo, setHilo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [childrenHidden, setChildrenHidden] = useState({});
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);
  
  // Guardamos los votos con una clave compuesta: "resolucion_1", "comentario_5", etc.
  const [votosUsuario, setVotosUsuario] = useState({}); 

  // FUNCIÓN MAESTRA DE VOTOS
  const handleVote = async (idDestino, tipoEntidad, type) => {
    if (!session) {
      alert("Debes entrar al búnker para votar.");
      navigate('/login');
      return;
    }

    const userId = session.user.id;
    const key = `${tipoEntidad}_${idDestino}`; 
    const column = type === 'up' ? 'votos_up' : 'votos_down';
    const columnOpposite = type === 'up' ? 'votos_down' : 'votos_up';
    const currentVote = votosUsuario[key];

    const tablaDestino = tipoEntidad === 'resolucion' ? 'tab_resoluciones' : 'tab_comentarios';
    const columnaFk = tipoEntidad === 'resolucion' ? 'resolucion_id' : 'comentario_id';

    // 1. ACTUALIZACIÓN OPTIMISTA (Interfaz instantánea)
    setHilo(prev => prev.map(res => {
      if (tipoEntidad === 'resolucion' && res.id === idDestino) {
        let update = { ...res };
        if (currentVote === type) { 
          update[column] = Math.max(0, (res[column] || 0) - 1);
        } else { 
          update[column] = (res[column] || 0) + 1;
          if (currentVote) update[columnOpposite] = Math.max(0, (res[columnOpposite] || 0) - 1);
        }
        return update;
      } 
      else if (tipoEntidad === 'comentario' && res.tab_comentarios) {
        const updatedComs = res.tab_comentarios.map(com => {
          if (com.id === idDestino) {
            let updateCom = { ...com };
            if (currentVote === type) { 
              updateCom[column] = Math.max(0, (com[column] || 0) - 1);
            } else { 
              updateCom[column] = (com[column] || 0) + 1;
              if (currentVote) updateCom[columnOpposite] = Math.max(0, (com[columnOpposite] || 0) - 1);
            }
            return updateCom;
          }
          return com;
        });
        return { ...res, tab_comentarios: updatedComs };
      }
      return res;
    }));

    // 2. ESTADO LOCAL DEL BOTÓN
    setVotosUsuario(prev => {
      const nuevosVotos = { ...prev };
      if (currentVote === type) delete nuevosVotos[key]; 
      else nuevosVotos[key] = type; 
      return nuevosVotos;
    });

    // 3. IMPACTO REAL EN DB (Corregido para evitar fallos de Index)
    try {
      if (currentVote === type) {
        // Quitar voto por completo
        await supabase.from('tab_votos').delete().match({ user_id: userId, [columnaFk]: idDestino });
        
        const { data: current } = await supabase.from(tablaDestino).select(column).eq('id', idDestino).single();
        await supabase.from(tablaDestino).update({ [column]: Math.max(0, (current[column] || 0) - 1) }).eq('id', idDestino);
      } else {
        // Voto nuevo o cambio de opinión: Borramos viejo por las dudas y creamos limpio
        await supabase.from('tab_votos').delete().match({ user_id: userId, [columnaFk]: idDestino });
        
        const payloadVoto = { user_id: userId, tipo_voto: type };
        payloadVoto[columnaFk] = idDestino;
        const { error: insertErr } = await supabase.from('tab_votos').insert(payloadVoto);
        if (insertErr) console.error("Error guardando voto en DB:", insertErr.message);

        const { data: current } = await supabase.from(tablaDestino).select(`${column}, ${columnOpposite}`).eq('id', idDestino).single();
        let updates = { [column]: (current[column] || 0) + 1 };
        if (currentVote) updates[columnOpposite] = Math.max(0, (current[columnOpposite] || 0) - 1);
        await supabase.from(tablaDestino).update(updates).eq('id', idDestino);
      }
    } catch (err) {
      console.error("Error general al votar:", err.message);
    }
  };

  useEffect(() => {
    const fetchFullDetalle = async () => {
      try {
        setCargando(true);
        const { data: ejData, error: errEj } = await supabase.from('tab_ejercicios').select('tag, enunciado').eq('id', id).single();
        if (errEj) throw errEj;
        setEjercicio(ejData);

        const { data: resData, error: errRes } = await supabase.from('tab_resoluciones').select('*').eq('ejercicio_id', id).order('orden', { ascending: true });
        if (errRes) throw errRes;

        let finalHilo = [];
        let idsResoluciones = [];
        let idsComentarios = [];

        if (resData && resData.length > 0) {
          idsResoluciones = resData.map(r => r.id);
          let comData = [];

          try {
            const { data: cData } = await supabase.from('tab_comentarios').select('*').in('resolucion_id', idsResoluciones);
            if (cData) {
              comData = cData;
              idsComentarios = cData.map(c => c.id);
            }
          } catch (e) { console.warn("Sin comentarios", e); }

          finalHilo = resData.map(res => ({
            ...res,
            tab_comentarios: comData.filter(c => c.resolucion_id === res.id)
          }));
        }

        // 🚀 EL ESCÁNER: Cargar los votos de ESTE usuario antes de renderizar
        if (session && (idsResoluciones.length > 0 || idsComentarios.length > 0)) {
          const mapaVotos = {};

          if (idsResoluciones.length > 0) {
            const { data: votosRes, error: eRes } = await supabase
              .from('tab_votos')
              .select('resolucion_id, tipo_voto')
              .eq('user_id', session.user.id)
              .in('resolucion_id', idsResoluciones);
            
            if (!eRes && votosRes) {
              votosRes.forEach(v => mapaVotos[`resolucion_${v.resolucion_id}`] = v.tipo_voto);
            }
          }
          
          if (idsComentarios.length > 0) {
            const { data: votosCom, error: eCom } = await supabase
              .from('tab_votos')
              .select('comentario_id, tipo_voto')
              .eq('user_id', session.user.id)
              .in('comentario_id', idsComentarios);

            if (!eCom && votosCom) {
              votosCom.forEach(v => mapaVotos[`comentario_${v.comentario_id}`] = v.tipo_voto);
            }
          }

          setVotosUsuario(mapaVotos); // Pintamos los botones al instante
        }

        setHilo(finalHilo);
      } catch (err) {
        console.error("❌ ERROR P5:", err.message);
      } finally {
        setCargando(false);
      }
    };
    fetchFullDetalle();
  }, [id, session]);

  const toggleChildren = (resId) => setChildrenHidden(prev => ({ ...prev, [resId]: !prev[resId] }));

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

  if (cargando) return <div className="p5-layout">[ ACCEDIENDO AL NÚCLEO... ]</div>;
  if (!ejercicio) return <div className="p5-layout">[ ERROR: EJERCICIO NO ENCONTRADO ]</div>;

  return (
    <div className="p5-layout">
      <header className="p5-header">
        <div className="p5-nav">
           <span className="back-btn" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'} VOLVER</span>
           <div className="user-icon-p5" onClick={() => !session && navigate('/login')} style={{ cursor: 'pointer' }}>
              {session ? (
                <img 
                  src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} 
                  alt="u" 
                  style={{ width: '24px', borderRadius: '50%', border: '1px solid #00ff41', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=U&background=00ff41&color=000"; }}
                />
              ) : "[ LOGIN ]"}
           </div>
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

      <main className="p5-thread">
        {hilo.map((bloque) => {
          const areChildrenHidden = childrenHidden[bloque.id];
          const respuestas = bloque.tab_comentarios || [];
          
          // LECTURA DEL ESTADO (Bloquea botones en base al escáner inicial)
          const isUpActiveRes = votosUsuario[`resolucion_${bloque.id}`] === 'up';
          const isDownActiveRes = votosUsuario[`resolucion_${bloque.id}`] === 'down';

          return (
            <div key={bloque.id} className="comment-group">
              <div className="comment-parent">
                <div className="comment-meta">
                  <span className="author-sys">{bloque.autor || 'SXTXRN_SYS'}</span> • verificado
                </div>
                <div className="comment-body math-render">
                  <div className="math-block"><LaTeX>{bloque.math_block}</LaTeX></div>
                  <div className="text-block"><LaTeX>{bloque.text_block}</LaTeX></div>
                </div>
                
                <div className="comment-actions">
                  <span className="vote-btns">
                    <span className={`v-up ${isUpActiveRes ? 'active' : ''}`} onClick={() => handleVote(bloque.id, 'resolucion', 'up')} style={{ cursor: 'pointer', marginRight: '10px' }}>
                      ▲ {bloque.votos_up || 0}
                    </span>
                    <span className={`v-down ${isDownActiveRes ? 'active' : ''}`} onClick={() => handleVote(bloque.id, 'resolucion', 'down')} style={{ cursor: 'pointer' }}>
                      ▼ {bloque.votos_down || 0}
                    </span>
                  </span>
                  
                  <span className="action-link" onClick={() => !session ? alert("Inicia sesión para responder") : console.log("Input activo")}>
                    Responder
                  </span>
                  
                  {respuestas.length > 0 && (
                    <span className="action-link" onClick={() => toggleChildren(bloque.id)}>
                      {areChildrenHidden ? `[ + ] Ver ${respuestas.length}` : '[ - ] Ocultar'}
                    </span>
                  )}
                </div>
              </div>

              {!areChildrenHidden && respuestas.map((com) => {
                const isUpActiveCom = votosUsuario[`comentario_${com.id}`] === 'up';
                const isDownActiveCom = votosUsuario[`comentario_${com.id}`] === 'down';

                return (
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
                        <span className="vote-btns">
                          <span className={`v-up ${isUpActiveCom ? 'active' : ''}`} onClick={() => handleVote(com.id, 'comentario', 'up')} style={{ cursor: 'pointer', marginRight: '10px' }}>
                            ▲ {com.votos_up || 0}
                          </span>
                          <span className={`v-down ${isDownActiveCom ? 'active' : ''}`} onClick={() => handleVote(com.id, 'comentario', 'down')} style={{ cursor: 'pointer' }}>
                            ▼ {com.votos_down || 0}
                          </span>
                        </span>
                        <span className="action-link">Responder</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </main>

      <footer className="p5-footer">
        <div className="input-wrapper">
          <input type="text" placeholder={session ? "Escribe una duda..." : "Inicia sesión para preguntar"} disabled={!session} />
        </div>
      </footer>
    </div>
  );
};

export default P5_Ejercicio_Detalle;