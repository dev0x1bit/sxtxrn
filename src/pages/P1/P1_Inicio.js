import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import './P1_Inicio.css'; 

const P1_Inicio = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [facultades, setFacultades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [session, setSession] = useState(null); // <-- NUEVO ESTADO
  const navigate = useNavigate();

  useEffect(() => {
    // CHEQUEO DE SESIÓN
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const fetchFacultades = async () => {
      try {
        setCargando(true);
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
    return () => subscription.unsubscribe();
  }, []);

  const resultadosFiltrados = facultades.filter(f => 
    f.nombre && f.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p1-layout">
      <header className="top-bar">
        <div className="search-container">
          <span 
            className="prompt" 
            onClick={() => menuAbierto && setMenuAbierto(false)}
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

        {/* BOTÓN DE USUARIO DINÁMICO */}
        <div 
          className="user-icon" 
          onClick={() => !session ? navigate('/login') : console.log("Ir al perfil")}
          style={{ cursor: 'pointer' }}
        >
          {session ? (
            <img 
              src={session.user.user_metadata.avatar_url} 
              alt="avatar" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #00ff41' }} 
            />
          ) : (
            "[ LOGIN ]"
          )}
        </div>
      </header>

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
            <h1>SXTXRN</h1>
            <p>... SITIO EN CONSTRUCCION ...</p>
            <p></p>
            <p>... PARCIALES ...</p>
            <p>... EJERCICIOS RESUELTOS ...</p>
            <p>... CBC UBA ...</p>
          </>
        )}
      </main>

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