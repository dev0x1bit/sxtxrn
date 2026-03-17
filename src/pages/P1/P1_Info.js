import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './P1_Info.css'; 

const P1_Info = () => {
  const navigate = useNavigate();
  
  const numeroWhatsApp = "5491163954624"; 
  const mensajeWa = "¡Hola ancientDEV! ...";
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWa)}`;

  return (
    <div className="info-layout">
      <Helmet>
        <title>SATXRN | [ INFO_SISTEMA ]</title>
      </Helmet>

      <div className="content-wrapper">
        <main className="info-content">
          <h1 className="white-title">
            [ memory ]
          </h1>
          
          <div className="info-box">

            <br />
            
            <div className="white-text">
              <p> <strong>FOUNDER:</strong> ancientDEV ∴</p>
              <p> <strong>ESTADO:</strong> EN DESARROLLO.</p>
            </div>
            <br />
            
            <div className="white-text multiline">
              <p className="cita-moreno">
                "Si los pueblos no se ilustran, si no se vulgarizan sus derechos, si cada hombre no conoce lo que vale, lo que puede y lo que se le debe, nuevas ilusiones sucederán a las antiguas, y después de vacilar algún tiempo entre mil incertidumbres, será tal vez nuestra suerte cambiar de tiranos sin destruir la tiranía."
              </p>
              <p className="firma-moreno">- Mariano Moreno</p>
            </div>
            
            <div className="fade-in">
              <br />
              <hr className="white-divider" />
              <br />
              <p className="white-text"> RED DE CONTACTO:</p>
              <div className="links-network">
                <a href="https://www.linkedin.com/in/matias-soraire-11769bb7/" target="_blank" rel="noopener noreferrer" className="white-link">
                  [ CONECTAR_LINKEDIN ]
                </a>
                <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="white-link">
                  [ TRANSMISIÓN_WHATSAPP ]
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="bottom-bar">
        <div className="home-icon" onClick={() => navigate('/')}> 
          [ ⌂ ] 
        </div>
        <div className="home-icon" onClick={() => navigate('/info')}> 
          [ m ] 
        </div>
      </footer>
    </div>
  );
};

export default P1_Info;