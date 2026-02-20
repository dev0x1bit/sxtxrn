import React from 'react';
import { supabase } from '../lib/supabase';

const Login = () => {
    const entrarConGoogle = async () => {
    try {
        // Detectamos si estamos en producción (Vercel) o local
        const urlRedireccion = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Ahora, si estás en el celu, vuelve al link de Vercel
            // Y si estás en la PC, vuelve a localhost
            redirectTo: urlRedireccion 
        }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error de acceso:", error.message);
    }
    };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>[ SATXRN ]</div>
        <h2 style={styles.subtitle}>NÚCLEO DE RESOLUCIONES</h2>
        <p style={styles.description}>
          Identificate para acceder a los parciales, votar soluciones y participar en el hilo.
        </p>
        
        <button onClick={entrarConGoogle} style={styles.button}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            style={styles.icon} 
          />
          ENTRAR CON GOOGLE
        </button>

        <div style={styles.footer}>
          v1.0.26 - ACCESO RESTRINGIDO
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a', // Fondo búnker
    color: '#ffffff',
    fontFamily: 'monospace'
  },
  card: {
    padding: '40px',
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 0 20px rgba(0,255,0,0.05)' // Un brillo verde muy sutil
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    letterSpacing: '4px',
    color: '#e9e9e9', // Verde terminal
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '30px',
    borderBottom: '1px solid #333',
    paddingBottom: '10px'
  },
  description: {
    fontSize: '0.8rem',
    lineHeight: '1.5',
    color: '#aaa',
    marginBottom: '30px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  icon: {
    width: '18px',
    height: '18px'
  },
  footer: {
    marginTop: '30px',
    fontSize: '0.6rem',
    color: '#444'
  }
};

export default Login;