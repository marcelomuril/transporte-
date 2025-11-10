import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import TripPage from './components/TripPage';
import { Aluno, Viagem } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'trip'>('home');
  const [currentTrip, setCurrentTrip] = useState<Viagem | null>(null);

  const startTrip = (tripType: 'Ida' | 'Volta') => {
    // Create new trip
    fetch('/api/viagens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo: tripType }),
    })
      .then(response => response.json())
      .then(data => {
        setCurrentTrip(data);
        setCurrentPage('trip');
      })
      .catch(error => {
        console.error('Erro ao iniciar viagem:', error);
        alert('Erro ao iniciar viagem. Tente novamente.');
      });
  };

  const endTrip = () => {
    if (!currentTrip) return;

    // Get trip summary
    fetch(`/api/viagens/${currentTrip.id}/resumo`)
      .then(response => response.json())
      .then(summary => {
        let message = 'Resumo da Viagem:\n\n';
        message += `✅ Embarcados: ${summary.embarcados}\n`;
        message += `🚫 Não Embarcados: ${summary.nao_embarcados}\n`;
        if (currentTrip.tipo === 'Ida') {
          message += `⬇️ Desembarcados: ${summary.desembarcados}\n`;
        }

        // Check for missing students in return trip
        if (currentTrip.tipo === 'Volta') {
          return fetch(`/api/viagens/${currentTrip.id}/faltantes`)
            .then(response => response.json())
            .then(missing => {
              if (missing.length > 0) {
                message += `\n⚠️ ATENÇÃO: ${missing.length} aluno(s) que embarcaram pela manhã não retornaram:\n`;
                missing.forEach((student: Aluno) => {
                  message += `- ${student.nome} (${student.rota})\n`;
                });
              }
              return message;
            });
        }
        return message;
      })
      .then(message => {
        if (window.confirm(message + '\n\nDeseja finalizar a viagem?')) {
          // Update trip status to finished
          fetch(`/api/viagens/${currentTrip.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Finalizada' }),
          })
            .then(() => {
              setCurrentTrip(null);
              setCurrentPage('home');
              alert('Viagem finalizada com sucesso!');
            })
            .catch(error => {
              console.error('Erro ao finalizar viagem:', error);
              alert('Erro ao finalizar viagem.');
            });
        }
      })
      .catch(error => {
        console.error('Erro ao obter resumo:', error);
        alert('Erro ao obter resumo da viagem.');
      });
  };

  // Check for active trip on component mount
  useEffect(() => {
    fetch('/api/viagens/ativa')
      .then(response => response.json())
      .then(data => {
        if (data) {
          setCurrentTrip(data);
          setCurrentPage('trip');
        }
      })
      .catch(error => {
        console.error('Erro ao verificar viagem ativa:', error);
      });
  }, []);

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Home onStartTrip={startTrip} />
      )}
      {currentPage === 'trip' && currentTrip && (
        <TripPage 
          trip={currentTrip} 
          onEndTrip={endTrip}
        />
      )}
    </div>
  );
}

export default App;