import React, { useState, useEffect } from 'react';
import './TripPage.css';
import { Aluno, Viagem, Log } from '../types';

interface TripPageProps {
  trip: Viagem;
  onEndTrip: () => void;
}

const TripPage: React.FC<TripPageProps> = ({ trip, onEndTrip }) => {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
    loadExistingLogs();
  }, []);

  const loadStudents = async () => {
    try {
      let url = '/api/alunos';
      
      // For return trips, only show students who embarked in the morning
      if (trip.tipo === 'Volta') {
        url = '/api/alunos/embarcados-manha';
      }

      const response = await fetch(url);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar lista de alunos.');
    }
  };

  const loadExistingLogs = async () => {
    try {
      const response = await fetch(`/api/viagens/${trip.id}/logs`);
      const logs = await response.json();
      
      const statuses: {[key: number]: string} = {};
      logs.forEach((log: Log) => {
        statuses[log.aluno_id] = log.status;
      });
      
      setStudentStatuses(statuses);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setLoading(false);
    }
  };

  const updateStudentStatus = async (alunoId: number, status: string) => {
    try {
      // Create log entry
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viagem_id: trip.id,
          aluno_id: alunoId,
          status: status,
        }),
      });

      // Update local state
      setStudentStatuses(prev => ({
        ...prev,
        [alunoId]: status
      }));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao registrar ação.');
    }
  };

  const getStatusButton = (alunoId: number, status: string, label: string, icon: string, buttonClass: string) => {
    const isActive = studentStatuses[alunoId] === status;
    
    return (
      <button
        className={`btn ${buttonClass} ${isActive ? 'active' : ''}`}
        onClick={() => updateStudentStatus(alunoId, status)}
        disabled={trip.tipo === 'Volta' && status === 'Não Embarcou'}
      >
        {icon} {label}
      </button>
    );
  };

  const getAvailableActions = (alunoId: number) => {
    const currentStatus = studentStatuses[alunoId];
    
    if (trip.tipo === 'Ida') {
      return (
        <div className="student-actions">
          {getStatusButton(alunoId, 'Embarcou', 'Embarcou', '✅', 'btn-success')}
          {getStatusButton(alunoId, 'Não Embarcou', 'Não Embarcou', '🚫', 'btn-danger')}
          {currentStatus === 'Embarcou' && 
            getStatusButton(alunoId, 'Desembarcou', 'Desembarcou', '⬇️', 'btn-info')
          }
        </div>
      );
    } else {
      // For return trips, only show "Embarcou" option
      return (
        <div className="student-actions">
          {getStatusButton(alunoId, 'Embarcou', 'Embarcou no Retorno', '✅', 'btn-success')}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="trip-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-container">
      <div className="container">
        <div className="trip-header">
          <div className="trip-info">
            <h1>🚌 Viagem de {trip.tipo}</h1>
            <p className="trip-date">Data: {new Date(trip.data).toLocaleDateString('pt-BR')}</p>
            <p className="trip-status">Status: {trip.status}</p>
          </div>
          <button 
            className="btn btn-warning"
            onClick={onEndTrip}
          >
            🏁 Encerrar Viagem
          </button>
        </div>

        <div className="students-section">
          <h2>📋 Lista de Alunos ({students.length})</h2>
          
          {trip.tipo === 'Volta' && (
            <div className="info-box">
              <p>ℹ️ Mostrando apenas alunos que embarcaram pela manhã</p>
            </div>
          )}

          <div className="students-list">
            {students.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-info">
                  <h3>{student.nome}</h3>
                  <p className="student-route">🗺️ Rota: {student.rota}</p>
                  {studentStatuses[student.id] && (
                    <p className={`student-status status-${studentStatuses[student.id].toLowerCase().replace(' ', '-')}`}>
                      Status: {studentStatuses[student.id]}
                    </p>
                  )}
                </div>
                <div className="student-actions-container">
                  {getAvailableActions(student.id)}
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && trip.tipo === 'Volta' && (
            <div className="empty-state">
              <p>🤷‍♂️ Nenhum aluno embarcado pela manhã encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPage;