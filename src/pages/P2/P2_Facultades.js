import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import './P2_Facultades.css';

const P2_Facultades = ({ session }) => { // <-- RECIBE LA SESIÓN AQUÍ
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
          setMaterias(mats);
        }
      } catch (err) {
        console.error("Error:", err.message);
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
        
        {/* ÍCONO DE USUARIO SINCRONIZADO */}
        <div className="user-icon" onClick={() => !session && navigate('/login')} style={{ cursor: 'pointer' }}>
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

      <main className="main-content-list">
        <div className="full-screen-menu">
          {cargando ? (
            <div className="full-screen-item">[ ACCEDIENDO AL SISTEMA... ]</div>
          ) : materias.map((m) => (
            <div key={m.id} className="full-screen-item" onClick={() => navigate(`/materia/${m.id}`)}>
              [ {m.nombre.toUpperCase()} ]
            </div>
          ))}
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}> [ ⌂ ] </div>
      </footer>
    </div>
  );
};

export default P2_Facultades;