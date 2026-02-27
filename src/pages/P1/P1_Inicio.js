import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase'; 
import './P1_Inicio.css'; 

const P1_Inicio = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [datosBunker, setDatosBunker] = useState([]); 
  const [cargando, setCargando] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

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
        console.error("Error en el búnker:", error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  // 1. Filtrado inteligente (Busca en materia o facultad)
  const resultadosFiltrados = datosBunker.filter(item => {
    const query = busqueda.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(query) || 
      item.nombreFacultad.toLowerCase().includes(query)
    );
  });

  // 2. Agrupamiento por Facultad
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
          <span className="prompt" onClick={() => setMenuAbierto(false)}>{menuAbierto ? '<' : '>'}</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder={cargando ? "ESCANEANDO..." : "BUSCAR MATERIA O FACULTAD..."} 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setMenuAbierto(true)} 
          />
        </div>
        <div className="user-icon" onClick={() => !session ? navigate('/login') : null}>
          {session ? "PERFIL" : "[ LOGIN ]"}
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
                  {/* TÍTULO DE GRUPO: Grande y blanco via CSS */}
                  <div className="group-header">
                    {facuNombre.toUpperCase()}
                  </div>

                  {/* LISTA DE MATERIAS BAJO ESE TÍTULO */}
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
    </div>
  );
};

export default P1_Inicio;