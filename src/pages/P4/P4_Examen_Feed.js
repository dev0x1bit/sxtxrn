import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LaTeX from 'react-latex-next'; 
import './P4_Examen_Feed.css';

const P4_Examen_Feed = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const tituloExamen = id ? id.toUpperCase().replace(/-/g, ' ') : 'EXAMEN';

  const ejercicios = [
    {
      id: 1,
      tag: "EJERCICIO 1",
      tema: "Sucesiones y Límites",
      enunciado: "Calcular $\\lim_{n\\to\\infty} (\\sqrt[n]{2^n + 5^n}) \\left(\\frac{2n+3}{2n+9}\\right)^n$.",
      resuelto: true,
      votosUp: 45,
      votosDown: 2,
      comentarios: 12
    },
    {
      id: 2,
      tag: "EJERCICIO 2",
      tema: "Derivadas / Recta Tangente",
      enunciado: "Dada $f : (0, \\frac{\\pi}{2}) \\to \\mathbb{R}, f(x) = 3 + \\frac{\\sin x}{2 - \\sqrt{2}\\cos x}$, hallar el punto del gráfico de $f$ tal que la recta tangente en dicho punto es paralela a la recta de ecuación $y = 3$.",
      resuelto: true,
      votosUp: 32,
      votosDown: 1,
      comentarios: 8
    },
    {
      id: 3,
      tag: "EJERCICIO 3",
      tema: "Funciones Partidas / Parámetros",
      enunciado: "Se define $f : [-\\frac{1}{3}, +\\infty) \\to \\mathbb{R}$ por $f(x) = \\begin{cases} \\frac{e^{ax} - a \\ln(x+1) - 1}{\\sqrt{3x+1} - 1} & \\text{si } x \\neq 0 \\\\ 0 & \\text{si } x = 0 \\end{cases}$. Hallar todos los valores de $a \\in \\mathbb{R}$ tales que $f'(0) = 10$.",
      resuelto: false,
      votosUp: 89,
      votosDown: 5,
      comentarios: 24
    }
  ];

  return (
    <div className="p4-layout">
      {/* HEADER: Protegemos al USUARIO para que no se desborde */}
      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">FEED: /{tituloExamen}</span>
        </div>
        <div className="user-icon">[ USUARIO ]</div>
      </header>

      <main className="main-feed">
        <div className="feed-container">
          {ejercicios.map((ej) => (
            <div key={ej.id} className="post-card">
              
              {/* ÁREA CLICKEABLE PARA P5 */}
              <div 
                className="post-clickable-area" 
                onClick={() => navigate(`/ejercicio/${ej.id}`)}
              >
                <div className="post-header">
                  <span className="post-tag">{ej.tag}</span>
                  <span className="post-meta">{ej.resuelto ? '[ RESUELTO ]' : '[ PENDIENTE ]'}</span>
                </div>
                
                <div className="post-content">
                  <h3 className="post-tema">{ej.tema}</h3>
                  <div className="post-text math-render">
                    <LaTeX>{ej.enunciado}</LaTeX>
                  </div>
                </div>
              </div>

              {/* BARRA DE ICONOS (SOCIAL) */}
              <div className="post-footer">
                <div className="footer-left">
                  <div className="stat-group">
                    <span className="icon-btn">▲</span>
                    <span className="vote-count">{ej.votosUp}</span>
                  </div>
                  <div className="stat-group">
                    <span className="icon-btn">▼</span>
                    <span className="vote-count">{ej.votosDown}</span>
                  </div>
                  <div className="stat-group">
                    <span className="icon-btn">💬</span>
                    <span className="vote-count">{ej.comentarios}</span>
                  </div>
                </div>
                
                <div className="footer-right">
                  <span className="icon-btn star-btn">★</span>
                  <span className="icon-btn share-btn">➦</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')}>[ ⌂ ]</div>
      </footer>
    </div>
  );
};

export default P4_Examen_Feed;