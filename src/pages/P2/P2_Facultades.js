import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import './P2_Facultades.css';

const P2_Facultades = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const traerMateriasReal = async () => {
      if (!id) return;

      try {
        setCargando(true);

        // 1. Buscamos la facultad por nombre (slug)
        const { data: facu, error: errorFacu } = await supabase
          .from('tab_facultades')
          .select('id')
          .ilike('nombre', id.replace(/-/g, ' '))
          .single();

        if (errorFacu) throw errorFacu;

        if (facu) {
          // 2. IMPORTANTE: Traemos el ID y el NOMBRE de la materia
          const { data: mats, error: errorMats } = await supabase
            .from('tab_materias')
            .select('id, nombre') // <-- Traemos el ID para la navegación
            .eq('facultad_id', facu.id)
            .order('nombre', { ascending: true });

          if (errorMats) throw errorMats;
          
          // Guardamos el objeto completo (id y nombre)
          setMaterias(mats);
        }
      } catch (err) {
        console.error("Error en el búnker P2:", err.message);
      } finally {
        setCargando(false);
      }
    };

    traerMateriasReal();
  }, [id]);

  const tituloFacultad = id ? id.toUpperCase().replace(/-/g, ' ') : 'SXTXRN';

  return (
    <div className="p2-layout">
      <header className="top-bar">
        <div className="search-container">
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">FAC: /{tituloFacultad}</span>
        </div>
        <div className="user-icon">[ USUARIO ]</div>
      </header>

      <main className="main-content-list">
        <div className="full-screen-menu">
          {cargando ? (
            <div className="full-screen-item">[ ACCEDIENDO AL SISTEMA... ]</div>
          ) : materias.length > 0 ? (
            materias.map((m) => (
              <div 
                key={m.id} 
                className="full-screen-item"
                onClick={() => {
                  // NAVEGACIÓN POR ID: Esto es lo que la P3 espera
                  console.log(`Navegando a materia ID: ${m.id} (${m.nombre})`);
                  navigate(`/materia/${m.id}`);
                }}
              >
                [ {m.nombre.toUpperCase()} ]
              </div>
            ))
          ) : (
            <div className="full-screen-item">[ SECCIÓN SIN REGISTROS ]</div>
          )}
        </div>
      </main>

      <footer className="bottom-bar">
        <div 
          className="home-icon" 
          style={{ fontSize: '1.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          [ ⌂ ]
        </div>
      </footer>
    </div>
  );
};

export default P2_Facultades;