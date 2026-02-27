import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
        const { data: facu } = await supabase
          .from('tab_facultades')
          .select('id')
          .ilike('nombre', id.replace(/-/g, ' '))
          .single();

        if (facu) {
          const { data: mats } = await supabase
            .from('tab_materias')
            .select('id, nombre')
            .eq('facultad_id', facu.id)
            .order('nombre', { ascending: true });
          
          // 🛡️ Filtro de seguridad: Solo materias con código numérico
          const validas = (mats || []).filter(m => m.nombre && /^\d+/.test(m.nombre.trim()));
          setMaterias(validas);
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
      <Helmet>
        <title>{`Materias de ${tituloFacultad} | SXTXRN`}</title>
      </Helmet>

      <header className="top-bar">
        <div className="search-container">
          {/* Solo queda la navegación y el título */}
          <span className="prompt" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>{'<'}</span>
          <span className="section-title">FAC: /{tituloFacultad}</span>
        </div>
        {/* 🚀 ACÁ ESTABA EL USER-ICON, AHORA ESTÁ FULMINADO */}
      </header>

      <main className="main-content-list">
        <div className="full-screen-menu">
          {cargando ? (
            <div className="full-screen-item">[ ESCANEANDO SISTEMA... ]</div>
          ) : materias.length > 0 ? (
            materias.map((m) => (
              <div 
                key={m.id} 
                className="full-screen-item" 
                onClick={() => navigate(`/materia/${m.id}`)}
              >
                [ {m.nombre.toUpperCase()} ]
              </div>
            ))
          ) : (
            <div className="full-screen-item empty">[ NO HAY REGISTROS ]</div>
          )}
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}> [ ⌂ ] </div>
      </footer>
    </div>
  );
};

export default P2_Facultades;