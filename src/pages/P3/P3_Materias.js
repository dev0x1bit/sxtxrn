import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './P3_Materias.css';

const P3_Materias = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [carpetaAbierta, setCarpetaAbierta] = useState(null);

  const tituloMateria = id ? id.toUpperCase().replace(/-/g, ' ') : 'ERROR';

  const carpetasFalsas = [
    { 
      anio: "2023", tipo: "PARCIALES", 
      archivos: ["1er Parcial - Tema A (Resuelto)", "1er Parcial - Tema B", "2do Parcial - Tema A"] 
    },
    { 
      anio: "2023", tipo: "FINALES", 
      archivos: ["Final Diciembre - Regular", "Final Julio - Libre"] 
    },
    { 
      anio: "2022", tipo: "PARCIALES", 
      archivos: ["1er Parcial - Sede Paternal", "2do Parcial - Sede Drago"] 
    }
  ];

  return (
    <div className="p3-layout">
      
      <header className="top-bar">
        <div className="search-container">
          <span 
            className="prompt" 
            onClick={() => navigate(-1)} 
            style={{ cursor: 'pointer' }}
          >
            {'<'}
          </span>
          <span className="section-title">
            MAT: /{tituloMateria}
          </span>
        </div>
        <div className="user-icon">
          [ USUARIO ]
        </div>
      </header>

      <main className="main-content-list">
        <div className="full-screen-menu">
          {carpetasFalsas.map((carpeta, index) => {
            const estaAbierta = carpetaAbierta === index;

            return (
              <div key={index} className="carpeta-container">
                <div 
                  className={`document-item ${estaAbierta ? 'active' : ''}`}
                  onClick={() => setCarpetaAbierta(estaAbierta ? null : index)}
                >
                  <div className="doc-title">
                    {estaAbierta ? 'v' : '>'} [ {carpeta.anio} - {carpeta.tipo} ]
                  </div>
                  <div className="doc-meta">
                    {carpeta.archivos.length} ARCHIVOS ENCONTRADOS
                  </div>
                </div>

                {estaAbierta && (
                  <div className="sub-menu">
                    {carpeta.archivos.map((archivo, i) => (
                      <div 
                        key={i} 
                        className="sub-item"
                        onClick={() => navigate(`/visor/${archivo.toLowerCase().replace(/ /g, '-')}`)}
                      >
                        - {archivo}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bottom-bar">
        <div 
          className="home-icon" 
          onClick={() => navigate('/')} 
        >
          [ ⌂ ]
        </div>
      </footer>

    </div>
  );
};

export default P3_Materias;