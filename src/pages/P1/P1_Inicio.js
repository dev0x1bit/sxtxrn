import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // Importa tu conexión
import './P1_Inicio.css'; 

const P1_Inicio = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [facultades, setFacultades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // EFECTO: Traer la data real de Supabase
  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        setCargando(true);
        // Usamos 'tab_facultades' y pedimos la columna 'nombre'
        const { data, error } = await supabase
          .from('tab_facultades') 
          .select('*')
          .order('nombre', { ascending: true });

        if (error) throw error;
        setFacultades(data || []);
      } catch (error) {
        console.error("Error conectando con el búnker:", error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchFacultades();
  }, []);

  // FILTRADO: Filtramos sobre la columna 'nombre' de tu tabla
  const resultadosFiltrados = facultades.filter(f => 
    f.nombre && f.nombre.toLowerCase().includes(busqueda.toLowerCase())
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
            placeholder={cargando ? "CONECTANDO..." : "BUSCAR SECCIÓN..."} 
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
            {cargando ? (
              <div className="full-screen-item">[ ACCEDIENDO A LA DB... ]</div>
            ) : resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((item) => (
                <div 
                  key={item.id} 
                  className="full-screen-item"
                  onClick={() => {
                    // Navegamos usando el nombre formateado
                    const parametro = item.nombre.toLowerCase().replace(/ /g, '-');
                    navigate(`/facultad/${parametro}`);
                  }}
                >
                  [ {item.nombre.toUpperCase()} ]
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