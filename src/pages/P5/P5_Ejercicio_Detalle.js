import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LaTeX from 'react-latex-next';
import './P5_Ejercicio_Detalle.css';

const P5_Ejercicio_Detalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [childrenHidden, setChildrenHidden] = useState({});
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);

  // RESOLUCIÓN COMPLETA DEL EJERCICIO 1
  const ejercicioData = {
    tag: "EJERCICIO 1",
    enunciado: "Calcular $\\lim_{n\\to\\infty} (\\sqrt[n]{2^n + 5^n}) \\left(\\frac{2n+3}{2n+9}\\right)^n$.",
    hilo: [
      {
        id: "step1",
        autor: "SXTXRN_SYS",
        math: "$1. \\text{ Análisis de la raíz } \\sqrt[n]{2^n + 5^n}:$",
        texto: "Sacamos factor común el término dominante $5^n$: $\\sqrt[n]{5^n ((\\frac{2}{5})^n + 1)}$. Por propiedad: $5 \\cdot \\sqrt[n]{(\\frac{2}{5})^n + 1}$. Como $(\\frac{2}{5})^n \\to 0$, la raíz tiende a $1$. Resultado parcial: $5$.",
        votos: 124,
        respuestas: [
          { id: "h1", autor: "el_pibe_analisis", texto: "Clave sacar el $5^n$, yo siempre me trababa ahí.", votos: 15 },
          { id: "h2", autor: "mat_lover", texto: "Recordá que esto vale porque $5 > 2$.", votos: 8 }
        ]
      },
      {
        id: "step2",
        autor: "SXTXRN_SYS",
        math: "$2. \\text{ Forma del número } e \\text{ en } (\\frac{2n+3}{2n+9})^n:$",
        texto: "Sumamos y restamos $1$ para llevarlo a la forma $(1 + \\frac{1}{x})$. Nos queda: $[1 + \\frac{-6}{2n+9}]^n$.",
        votos: 98,
        respuestas: [
          { id: "h3", autor: "duda_guy", texto: "¿De dónde salió el $-6$?", votos: 2 },
          { id: "h4", autor: "pro_helper", texto: "Hizo $(2n+3) - (2n+9) = -6$, es un truco para no hacer división de polinomios.", votos: 22 }
        ]
      },
      {
        id: "step3",
        autor: "SXTXRN_SYS",
        math: "$3. \\text{ Cálculo del exponente:}$",
        texto: "Llevamos el límite al exponente: $e^{\\lim_{n\\to\\infty} n \\cdot (\\frac{-6}{2n+9})}$. El límite de $\\frac{-6n}{2n+9}$ es $-3$. Por lo tanto, esta parte tiende a $e^{-3}$.",
        votos: 156,
        respuestas: []
      },
      {
        id: "step4",
        autor: "SXTXRN_SYS",
        math: "$\\text{RESULTADO FINAL:}$",
        texto: "Juntando ambas partes: $5 \\cdot e^{-3} = \\frac{5}{e^3}$.",
        votos: 340,
        respuestas: [
          { id: "h5", autor: "ingeniero_2026", texto: "¡Excelente! Me dio lo mismo en el simulacro.", votos: 45 }
        ]
      }
    ]
  };

  const toggleChildren = (commentId) => {
    setChildrenHidden(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleGlobalToggle = () => {
    if (isAllCollapsed) {
      setChildrenHidden({});
      setIsAllCollapsed(false);
    } else {
      const allIds = {};
      ejercicioData.hilo.forEach(item => { allIds[item.id] = true; });
      setChildrenHidden(allIds);
      setIsAllCollapsed(true);
    }
  };

  return (
    <div className="p5-layout">
      <header className="p5-header">
        <div className="p5-nav">
           <span className="back-btn" onClick={() => navigate(-1)}>{'<'} VOLVER AL FEED</span>
           <span className="user-id">[ {ejercicioData.tag} ]</span>
        </div>
        <div className="op-enunciado math-render">
          <LaTeX>{ejercicioData.enunciado}</LaTeX>
        </div>
        
        <div className="global-controls">
          <span className="control-btn" onClick={handleGlobalToggle}>
            {isAllCollapsed ? '[ EXPANDIR TODO ]' : '[ CONTRAER TODO ]'}
          </span>
        </div>
      </header>

      <main className="p5-thread">
        {ejercicioData.hilo.map((comentario) => {
          const areChildrenHidden = childrenHidden[comentario.id];
          return (
            <div key={comentario.id} className="comment-group">
              <div className="comment-parent">
                <div className="comment-meta">
                  <span className="author-sys">{comentario.autor}</span> • verificado
                </div>
                <div className="comment-body math-render">
                  <div className="math-block"><LaTeX>{comentario.math}</LaTeX></div>
                  <div className="text-block"><LaTeX>{comentario.texto}</LaTeX></div>
                </div>
                <div className="comment-actions">
                  <span className="votes">▲ {comentario.votos} ▼</span>
                  <span className="action-link">Responder</span>
                  <span className="action-link toggle-btn" onClick={() => toggleChildren(comentario.id)}>
                    {areChildrenHidden ? `[ + ] Mostrar ${comentario.respuestas.length}` : '[ - ] Contraer'}
                  </span>
                </div>
              </div>

              {!areChildrenHidden && comentario.respuestas.map((hijo) => (
                <div key={hijo.id} className="comment-child">
                  <div className="thread-line"></div>
                  <div className="child-content">
                    <div className="comment-meta">
                      <span className="author-user">{hijo.autor}</span>
                    </div>
                    <div className="comment-body math-render">
                      <LaTeX>{hijo.texto}</LaTeX>
                    </div>
                    <div className="comment-actions">
                      <span className="votes">▲ {hijo.votos} ▼</span>
                      <span className="action-link">Responder</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </main>

      <footer className="p5-footer">
        <div className="input-wrapper">
          <input type="text" placeholder="Escribe una duda general..." disabled />
        </div>
      </footer>
    </div>
  );
};

export default P5_Ejercicio_Detalle;