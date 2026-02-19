import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase'; // Importante tener tu cliente de supabase
import Login from './components/Login';

// Importamos todas las páginas de nuestro flujo SXTXRN
import P1_Inicio from './pages/P1/P1_Inicio';
import P2_Facultades from './pages/P2/P2_Facultades';
import P3_Materias from './pages/P3/P3_Materias';
import P4_Examen_Feed from './pages/P4/P4_Examen_Feed';
import P5_Ejercicio_Detalle from './pages/P5/P5_Ejercicio_Detalle';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Ahora todas las rutas son accesibles sin chequear sesión acá */}
        <Route path="/" element={<P1_Inicio />} />
        <Route path="/facultad/:id" element={<P2_Facultades />} />
        <Route path="/materia/:id" element={<P3_Materias />} />
        <Route path="/visor/:id" element={<P4_Examen_Feed />} />
        <Route path="/ejercicio/:id" element={<P5_Ejercicio_Detalle />} />
        
        {/* La página de login solo se ve si vas a /login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;