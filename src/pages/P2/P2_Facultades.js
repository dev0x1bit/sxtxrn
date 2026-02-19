import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './P2_Facultades.css';

const P2_Facultades = () => {
  const { id } = useParams(); // Atrapa "ingenieria" de la URL
  const navigate = useNavigate();

  // MOCK DE BASE DE DATOS: Materias falsas para probar la UI
  const materiasFalsas = [
    "ÁLGEBRA", "ANÁLISIS MATEMÁTICO I", "FÍSICA I", 
    "QUÍMICA GENERAL", "PENSAMIENTO CIENTÍFICO",
    "ÁLGEBRA LINEAL", "PROBABILIDAD Y ESTADÍSTICA"
  ];

  // Formateamos el ID para que se vea con facha en el título (ej: "uba-xxi" -> "UBA XXI")
  const tituloFacultad = id ? id.toUpperCase().replace(/-/g, ' ') : 'ERROR';

  return (
    <div className="p2-layout">
      
      {/* BARRA SUPERIOR (Con botón para volver atrás) */}
      <header className="top-bar">
        <div className="search-container">
          <span 
            className="prompt" 
            onClick={() => navigate(-1)} // El "-1" te lleva a la pantalla anterior
            style={{ cursor: 'pointer' }}
          >
            {'<'}
          </span>
          <span className="section-title">
            FAC: /{tituloFacultad}
          </span>
        </div>
        <div className="user-icon">
          [ USUARIO ]
        </div>
      </header>

      {/* CENTRO: LA LISTA DE MATERIAS */}
      <main className="main-content-list">
        <div className="full-screen-menu">
          {materiasFalsas.map((materia, index) => (
            <div 
              key={index} 
              className="full-screen-item"
              onClick={() => {
                // 1. Limpiamos el nombre: Minúsculas, sin tildes y con guiones
                const parametro = materia.toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                  .replace(/ /g, '-'); 
                
                // 2. Disparamos el viaje a la P3
                navigate(`/materia/${parametro}`);
              }}
            >
              [ {materia} ]
            </div>
          ))}
        </div>
      </main>

      {/* BARRA INFERIOR */}
      <footer className="bottom-bar">
        <div 
          className="home-icon" 
          style={{ fontSize: '1.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/')} // Vuelve directo al inicio (P1)
        >
          [ ⌂ ]
        </div>
      </footer>

    </div>
  );
};

export default P2_Facultades;