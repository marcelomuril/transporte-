import React, { useState } from 'react';
import './Home.css';

interface HomeProps {
  onStartTrip: (tripType: 'Ida' | 'Volta') => void;
}

const Home: React.FC<HomeProps> = ({ onStartTrip }) => {
  const [showModal, setShowModal] = useState(false);

  const handleStartTrip = (tripType: 'Ida' | 'Volta') => {
    setShowModal(false);
    onStartTrip(tripType);
  };

  return (
    <div className="home-container">
      <div className="container">
        <div className="header">
          <h1>🚌 Transporte Escolar</h1>
          <p className="subtitle">Gerenciamento de transporte escolar</p>
        </div>

        <div className="card text-center">
          <h2>Bem-vindo!</h2>
          <p className="mb-4">
            Clique no botão abaixo para iniciar uma nova viagem
          </p>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => setShowModal(true)}
          >
            🚀 Iniciar Viagem
          </button>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>📋 Instruções</h3>
            <ul>
              <li>Clique em "Iniciar Viagem" para começar</li>
              <li>Escolha entre "Ida" ou "Volta"</li>
              <li>Marque a presença dos alunos</li>
              <li>Finalize a viagem ao terminar</li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Escolher Tipo de Viagem</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Selecione o tipo de viagem que deseja iniciar:</p>
              <div className="trip-type-buttons">
                <button 
                  className="btn btn-success btn-trip-type"
                  onClick={() => handleStartTrip('Ida')}
                >
                  🌅 Ida (Manhã)
                </button>
                <button 
                  className="btn btn-warning btn-trip-type"
                  onClick={() => handleStartTrip('Volta')}
                >
                  🌙 Volta (Tarde)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;