import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LaTeX from 'react-latex-next';
import P5_ReplyDrawer from './P5_ReplyDrawer';
import './P5_Ejercicio_Detalle.css';

const P5_Ejercicio_Detalle = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ejercicio, setEjercicio] = useState(null);
  const [hilo, setHilo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [childrenHidden, setChildrenHidden] = useState({});
  const [isAllCollapsed, setIsAllCollapsed] = useState(true); // Arrancamos asumiendo que todo está cerrado
  const [votosUsuario, setVotosUsuario] = useState({}); 
  const [replyTarget, setReplyTarget] = useState(null); 

  // --- VOTOS BLINDADOS ---
  const handleVote = async (idDestino, tipoEntidad, type) => {
    if (!session) return alert("Debes entrar al búnker.");
    const userId = session.user.id;
    const key = `${tipoEntidad}_${idDestino}`; 
    const currentVote = votosUsuario[key];
    const nuevoVoto = currentVote === type ? null : type;

    setHilo(prev => prev.map(res => {
      const updateObj = (obj) => {
        let { votos_up = 0, votos_down = 0 } = obj;
        if (currentVote === 'up') votos_up = Math.max(0, votos_up - 1);
        if (currentVote === 'down') votos_down = Math.max(0, votos_down - 1);
        if (nuevoVoto === 'up') votos_up++;
        if (nuevoVoto === 'down') votos_down++;
        return { ...obj, votos_up, votos_down };
      };
      if (tipoEntidad === 'resolucion' && Number(res.id) === Number(idDestino)) return updateObj(res);
      if (tipoEntidad === 'comentario' && res.tab_comentarios) {
        return { ...res, tab_comentarios: res.tab_comentarios.map(c => Number(c.id) === Number(idDestino) ? updateObj(c) : c) };
      }
      return res;
    }));

    setVotosUsuario(prev => ({ ...prev, [key]: nuevoVoto }));

    try {
      const fkCol = tipoEntidad === 'resolucion' ? 'resolucion_id' : 'comentario_id';
      const tabla = tipoEntidad === 'resolucion' ? 'tab_resoluciones' : 'tab_comentarios';
      await supabase.from('tab_votos').delete().match({ user_id: userId, [fkCol]: idDestino });
      if (nuevoVoto) await supabase.from('tab_votos').insert({ user_id: userId, [fkCol]: idDestino, tipo_voto: type });
      
      const { data: current } = await supabase.from(tabla).select('votos_up, votos_down').eq('id', idDestino).single();
      if (current) {
        let upVal = current.votos_up || 0;
        let downVal = current.votos_down || 0;
        if (currentVote === type) { type === 'up' ? upVal-- : downVal--; } 
        else {
          if (currentVote === 'up') upVal--;
          if (currentVote === 'down') downVal--;
          type === 'up' ? upVal++ : downVal++;
        }
        await supabase.from(tabla).update({ votos_up: Math.max(0, upVal), votos_down: Math.max(0, downVal) }).eq('id', idDestino);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchFullDetalle = async () => {
      try {
        setCargando(true);
        const { data: ej } = await supabase.from('tab_ejercicios').select('enunciado').eq('id', id).single();
        setEjercicio(ej);
        const { data: res } = await supabase.from('tab_resoluciones').select('*').eq('ejercicio_id', id).order('orden', { ascending: true });
        
        if (res) {
          const ids = res.map(r => r.id);
          const { data: coms } = await supabase.from('tab_comentarios').select('*').in('resolucion_id', ids);
          
          const finalHilo = res.map(r => ({ 
            ...r, 
            tab_comentarios: coms ? coms.filter(c => Number(c.resolucion_id) === Number(r.id)) : [] 
          }));
          
          setHilo(finalHilo);

          // 🚀 MAGIA: INICIALIZAR TODO COLAPSADO
          // Solo metemos las resoluciones (los padres) en el estado de "ocultos"
          const initialState = {};
          finalHilo.forEach(r => {
            initialState[`res_${r.id}`] = true;
          });
          setChildrenHidden(initialState);
          setIsAllCollapsed(true);

          if (session) {
            const { data: v } = await supabase.from('tab_votos').select('*').eq('user_id', session.user.id);
            const mapa = {};
            v?.forEach(item => {
              if (item.resolucion_id) mapa[`resolucion_${item.resolucion_id}`] = item.tipo_voto;
              if (item.comentario_id) mapa[`comentario_${item.comentario_id}`] = item.tipo_voto;
            });
            setVotosUsuario(mapa);
          }
        }
      } catch (err) { console.error(err); } finally { setCargando(false); }
    };
    fetchFullDetalle();
  }, [id, session]);

  // --- LOGICA DE EXPANDIR/CONTRAER ---
  const handleGlobalToggle = () => {
    if (isAllCollapsed) {
      setChildrenHidden({}); // Al vaciarlo, todo se expande
      setIsAllCollapsed(false);
    } else {
      const allIds = {};
      hilo.forEach(res => {
        allIds[`res_${res.id}`] = true;
      });
      setChildrenHidden(allIds);
      setIsAllCollapsed(true);
    }
  };

  const countDescendants = (list, pid) => {
    return list.filter(c => Number(c.parent_id) === Number(pid)).reduce((acc, child) => acc + 1 + countDescendants(list, child.id), 0);
  };

  const renderTree = (list, pid, resId) => {
    const hijos = list.filter(c => Number(c.parent_id) === Number(pid));
    return hijos.map(com => {
      // Como no metemos los comentarios en childrenHidden al inicio,
      // isHidden será undefined (false), por lo tanto se verán siempre.
      const isHidden = childrenHidden[`com_${com.id}`];
      const totalHijos = countDescendants(list, com.id);
      const userVote = votosUsuario[`comentario_${com.id}`];
      return (
        <div key={com.id} className="comment-child">
          <div className="thread-line"></div>
          <div className="child-content">
            <div className="comment-meta"><span className="author-user">user_{com.usuario_id?.substring(0,4)}</span></div>
            <div className="comment-body math-render"><LaTeX>{com.contenido_latex || ''}</LaTeX></div>
            <div className="comment-actions">
              <span className="vote-btns">
                <span className={`v-up ${userVote === 'up' ? 'active' : ''}`} onClick={() => handleVote(com.id, 'comentario', 'up')}>▲ {com.votos_up || 0}</span>
                <span className={`v-down ${userVote === 'down' ? 'active' : ''}`} onClick={() => handleVote(com.id, 'comentario', 'down')}>▼ {com.votos_down || 0}</span>
              </span>
              <span className="msg-counter"><span className="msg-icon">💬</span> {totalHijos}</span>
              <span className="action-link" onClick={() => setReplyTarget({ id: com.id, tipo: 'comentario', autor: 'User', texto: com.contenido_latex, resolucionId: resId })}>Responder</span>
              
              {/* Solo mostramos el botón de ocultar si queremos contraer una rama específica */}
              {totalHijos > 0 && (
                <span className="action-link toggle-btn" onClick={() => setChildrenHidden(p => ({...p, [`com_${com.id}`]: !p[`com_${com.id}`]}))}>
                  {isHidden ? `[ + ] Ver ${totalHijos}` : '[ - ] Ocultar'}
                </span>
              )}
            </div>
            {!isHidden && renderTree(list, com.id, resId)}
          </div>
        </div>
      );
    });
  };

  const submitReply = async (text) => {
    if (!text.trim()) return;
    const nuevo = {
      ejercicio_id: id, resolucion_id: replyTarget.resolucionId,
      usuario_id: session.user.id, contenido_latex: text,
      parent_id: replyTarget.tipo === 'comentario' ? replyTarget.id : null,
      votos_up: 0, votos_down: 0
    };
    const { data } = await supabase.from('tab_comentarios').insert([nuevo]).select();
    if (data) setHilo(prev => prev.map(r => Number(r.id) === Number(replyTarget.resolucionId) ? { ...r, tab_comentarios: [...r.tab_comentarios, data[0]] } : r));
    setReplyTarget(null);
  };

  if (cargando) return <div className="p5-layout">[ ACCEDIENDO... ]</div>;

  return (
    <div className="p5-layout">
      <header className="p5-header">
        <div className="p5-nav"><span onClick={() => navigate(-1)} style={{cursor:'pointer'}}>{'<'} VOLVER</span><div>{session ? "U" : "LOGIN"}</div></div>
        <div className="op-enunciado math-render"><LaTeX>{ejercicio?.enunciado || ''}</LaTeX></div>
        <div className="global-controls">
          <span className="control-btn" onClick={handleGlobalToggle}>
            {isAllCollapsed ? '[ EXPANDIR TODO ]' : '[ CONTRAER TODO ]'}
          </span>
        </div>
      </header>
      <main className="p5-thread">
        {hilo.map(res => {
          const isHidden = childrenHidden[`res_${res.id}`];
          const totalMsg = res.tab_comentarios?.length || 0;
          const userVote = votosUsuario[`resolucion_${res.id}`];
          return (
            <div key={res.id} className="comment-group">
              <div className="comment-parent">
                <div className="comment-meta"><span className="author-sys">SXTXRN_SYS</span></div>
                <div className="comment-body math-render">
                  <div className="math-block"><LaTeX>{res.math_block || ''}</LaTeX></div>
                  <div className="text-block"><LaTeX>{res.text_block || ''}</LaTeX></div>
                </div>
                <div className="comment-actions">
                  <span className="vote-btns">
                    <span className={`v-up ${userVote === 'up' ? 'active' : ''}`} onClick={() => handleVote(res.id, 'resolucion', 'up')}>▲ {res.votos_up || 0}</span>
                    <span className={`v-down ${userVote === 'down' ? 'active' : ''}`} onClick={() => handleVote(res.id, 'resolucion', 'down')}>▼ {res.votos_down || 0}</span>
                  </span>
                  <span className="msg-counter"><span className="msg-icon">💬</span> {totalMsg}</span>
                  <span className="action-link" onClick={() => setReplyTarget({ id: res.id, tipo: 'resolucion', autor: 'SYS', texto: res.text_block, resolucionId: res.id })}>Responder</span>
                  {totalMsg > 0 && (
                    <span className="action-link toggle-btn" onClick={() => setChildrenHidden(p => ({...p, [`res_${res.id}`]: !p[`res_${res.id}`]}))}>
                      {isHidden ? `[ + ] Ver ${totalMsg}` : '[ - ] Ocultar'}
                    </span>
                  )}
                </div>
              </div>
              {/* Si abrimos la resolución, renderTree mostrará todo porque los hijos no están en childrenHidden */}
              {!isHidden && renderTree(res.tab_comentarios || [], null, res.id)}
            </div>
          );
        })}
      </main>
      <P5_ReplyDrawer isOpen={!!replyTarget} target={replyTarget} onClose={() => setReplyTarget(null)} onSubmit={submitReply} />
    </div>
  );
};

export default P5_Ejercicio_Detalle;