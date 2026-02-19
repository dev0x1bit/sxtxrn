import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos la herramienta de viaje
import './P1_Inicio.css'; 

const P1_Inicio = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate(); // 2. Inicializamos el navegador

  const secciones = [
    "CBC", "UBA XXI", "AGRONOMÍA", "FILOSOFÍA Y LETRAS",
    "ARQUITECTURA, DISEÑO Y URB", "INGENIERÍA", "DERECHO", "MEDICINA",
    "ECONÓMICAS", "PSICOLOGÍA", "EXACTAS", "SOCIALES",
    "FARMACIA Y BIOQUÍMICA", "VETERINARIA"
  ];

  const resultadosFiltrados = secciones.filter(sec => 
    sec.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p1-layout">
      
      {/* BARRA SUPERIOR */}
      <header className="top-bar">
        <div className="search-container">
          <span 
            className="prompt" 
            onClick={() => {
              if (menuAbierto) setMenuAbierto(false);
            }}
            style={{ cursor: menuAbierto ? 'pointer' : 'default' }}
          >
            {menuAbierto ? '<' : '>'}
          </span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="BUSCAR SECCIÓN..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setMenuAbierto(true)} 
          />
        </div>
        <div className="user-icon">
          [ USUARIO ]
        </div>
      </header>

      {/* CENTRO: CONDICIONAL */}
      <main className={menuAbierto ? "main-content-list" : "main-content"}>
        {menuAbierto ? (
          <div className="full-screen-menu">
            {resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((item, index) => (
                <div 
                  key={index} 
                  className="full-screen-item"
                  onClick={() => {
                    // 3. LA MAGIA DEL CLICK: 
                    // Pasa todo a minúsculas y cambia los espacios por guiones medios
                    const parametro = item.toLowerCase().replace(/ /g, '-');
                    
                    // Viajamos a la P2!
                    navigate(`/facultad/${parametro}`);
                  }}
                >
                  [ {item} ]
                </div>
              ))
            ) : (
              <div className="full-screen-item empty">[ SIN RESULTADOS ]</div>
            )}
          </div>
        ) : (
          <>
            <h1>SXTXRN_V1</h1>
            <p>SISTEMA EN LÍNEA. ESPERANDO COMANDO...</p>
          </>
        )}
      </main>

      {/* BARRA INFERIOR */}
      <footer className="bottom-bar">
        <div 
          className="home-icon" 
          style={{ fontSize: '1.5rem', cursor: 'pointer' }}
          onClick={() => {
            setMenuAbierto(false); 
            setBusqueda('');       
          }}
        >
          [ ⌂ ]
        </div>
      </footer>

    </div>
  );
};

export default P1_Inicio;