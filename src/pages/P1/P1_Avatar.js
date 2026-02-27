import React from 'react';
import { supabase } from '../../lib/supabase';
import './P1_Avatar.css';

const P1_Avatar = ({ session, onClose }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  return (
    <div className="avatar-screen-overlay">
      {/* 🚀 HEADER CORREGIDO: Sin desbordes */}
      <header className="avatar-header">
        <div className="avatar-title">
          SXTXRN // PERFIL_OPERADOR
        </div>
        <div className="close-btn" onClick={onClose}>
          [ X ]
        </div>
      </header>

      <main className="avatar-content">
        <div className="profile-field">
          <label className="profile-label">ID_SESION</label>
          <div className="profile-value">{session?.user?.email}</div>
        </div>

        <div className="profile-field">
          <label className="profile-label">NICKNAME_ACTUAL</label>
          <div className="profile-value-display">
            {session?.user?.user_metadata?.full_name || "SIN_IDENTIDAD"}
          </div>
        </div>

        {/* 🚀 SOLO DESCONECTAR */}
        <div 
          className="profile-action logout-btn" 
          onClick={handleLogout}
        >
          [ DESCONECTAR_SISTEMA ]
        </div>
      </main>

      <footer className="avatar-footer">
        SXTXRN_OS_V.2.6 // ACCESO_RESTRINGIDO
      </footer>
    </div>
  );
};

export default P1_Avatar;