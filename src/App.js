import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos todas las páginas de nuestro flujo SXTXRN
import P1_Inicio from './pages/P1/P1_Inicio';
import P2_Facultades from './pages/P2/P2_Facultades';
import P3_Materias from './pages/P3/P3_Materias';
import P4_Examen_Feed from './pages/P4/P4_Examen_Feed';
import P5_Ejercicio_Detalle from './pages/P5/P5_Ejercicio_Detalle'; // <-- La nueva P5

function App() {
  return (
    <Router>
      <Routes>
        {/* P1: Buscador Principal (Home) */}
        <Route path="/" element={<P1_Inicio />} />
        
        {/* P2: Lista de Materias filtradas por Facultad */}
        <Route path="/facultad/:id" element={<P2_Facultades />} />
        
        {/* P3: Selección de Año/Carpeta (Sistema de Acordeón) */}
        <Route path="/materia/:id" element={<P3_Materias />} />
        
        {/* P4: Feed de Ejercicios del Parcial (Estilo Reddit) */}
        <Route path="/visor/:id" element={<P4_Examen_Feed />} />

        {/* P5: Detalle del Ejercicio, Resolución y Comentarios */}
        <Route path="/ejercicio/:id" element={<P5_Ejercicio_Detalle />} />
      </Routes>
    </Router>
  );
}

export default App;