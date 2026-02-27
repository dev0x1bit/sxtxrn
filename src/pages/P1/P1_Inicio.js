import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase'; 
import './P1_Inicio.css'; 
import P1_Avatar from './P1_Avatar'; 

const P1_Inicio = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false); 
  const [datosBunker, setDatosBunker] = useState([]); 
  const [cargando, setCargando] = useState(true);
  const [session, setSession] = useState(null); // 🛡️ Sesión independiente
  const navigate = useNavigate();

  // 1. Detección de sesión (Independiente de App.js)
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // 2. Carga de datos del radar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const [resMaterias, resFacultades] = await Promise.all([
          supabase.from('tab_materias').select('*'),
          supabase.from('tab_facultades').select('*')
        ]);

        if (resMaterias.error) throw resMaterias.error;
        if (resFacultades.error) throw resFacultades.error;

        const combinados = resMaterias.data.map(m => {
          const f = resFacultades.data.find(facu => facu.id === m.facultad_id);
          return {
            ...m,
            nombreFacultad: f ? f.nombre : 'SXTXRN'
          };
        });

        setDatosBunker(combinados);
      } catch (error) {
        console.error("Error en el radar:", error.message);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // 3. Lógica de Filtrado y Agrupamiento
  const resultadosFiltrados = datosBunker.filter(item => {
    const query = busqueda.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(query) || 
      item.nombreFacultad.toLowerCase().includes(query)
    );
  });

  const grupos = resultadosFiltrados.reduce((acc, item) => {
    if (!acc[item.nombreFacultad]) {
      acc[item.nombreFacultad] = [];
    }
    acc[item.nombreFacultad].push(item);
    return acc;
  }, {});

  return (
    <div className="p1-layout">
      <Helmet>
        <title>SXTXRN | Inicio - El Búnker del CBC</title>
      </Helmet>

      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => menuAbierto && setMenuAbierto(false)} style={{ cursor: 'pointer' }}>
            {menuAbierto ? '<' : '>'}
          </span>
          <input 
            type="text" 
            className="search-input" 
            placeholder={cargando ? "ESCANEANDO..." : "BUSCAR MATERIA O FACULTAD..."} 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setMenuAbierto(true)} 
          />
        </div>

        <div 
          className="user-icon" 
          onClick={() => !session ? navigate('/login') : setModalUsuario(true)} 
          style={{ cursor: 'pointer' }}
        >
          {session ? (
            <img 
              src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} 
              alt="u" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #00ff41' }} 
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=U&background=00ff41&color=000"; }}
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
              <div className="full-screen-item">[ ACCEDIENDO... ]</div>
            ) : Object.keys(grupos).length > 0 ? (
              Object.keys(grupos).map((facuNombre) => (
                <div key={facuNombre} style={{ width: '100%' }}>
                  <div className="group-header">
                    {facuNombre.toUpperCase()}
                  </div>
                  {grupos[facuNombre].map((materia) => (
                    <div 
                      key={materia.id} 
                      className="full-screen-item"
                      onClick={() => navigate(`/materia/${materia.id}`)}
                    >
                      <span>[ {materia.nombre.toUpperCase()} ]</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="full-screen-item empty">[ SIN RESULTADOS ]</div>
            )}
          </div>
        ) : (
          <div className="main-content">
            <h1>SATXRN</h1>
            <p>... SITIO EN CONSTRUCCION ...</p>
            <p></p>
            <p>... PARCIALES ...</p>
            <p>... EJERCICIOS RESUELTOS ...</p>
            <p>... CBC UBA ...</p>
          </div>
        )}
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => { setMenuAbierto(false); setBusqueda(''); }}> [ ⌂ ] </div>
      </footer>

      {modalUsuario && (
        <P1_Avatar 
          session={session} 
          onClose={() => setModalUsuario(false)} 
        />
      )}
    </div>
  );
};

export default P1_Inicio;