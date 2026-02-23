import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; //
import { supabase } from './lib/supabase'; //
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
    <HelmetProvider> {/* 👈 Este es el motor que permite cambiar los títulos dinámicamente */}
      <Router>
        <Routes>
          <Route path="/" element={<P1_Inicio session={session} />} />
          <Route path="/facultad/:id" element={<P2_Facultades session={session} />} />
          <Route path="/materia/:id" element={<P3_Materias session={session} />} />
          <Route path="/visor/:id" element={<P4_Examen_Feed session={session} />} />
          
          {/* IMPORTANTE: Si en el Sitemap usamos URLs como /ejercicio/cbc-analisis-limites-21,
            el ":id" ahora va a recibir todo ese texto largo (el slug).
          */}
          <Route path="/ejercicio/:id" element={<P5_Ejercicio_Detalle session={session} />} />
          
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;