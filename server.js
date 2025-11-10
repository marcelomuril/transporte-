const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./transporte_escolar.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

// Create tables
const createTables = () => {
  db.serialize(() => {
    // Tabela de alunos
    db.run(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        rota TEXT NOT NULL
      )
    `);

    // Tabela de viagens
    db.run(`
      CREATE TABLE IF NOT EXISTS viagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT CHECK(tipo IN ('Ida', 'Volta')) NOT NULL,
        data TEXT NOT NULL,
        status TEXT CHECK(status IN ('Em Andamento', 'Finalizada')) DEFAULT 'Em Andamento'
      )
    `);

    // Tabela de logs
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        viagem_id INTEGER NOT NULL,
        aluno_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('Embarcou', 'Não Embarcou', 'Desembarcou')) NOT NULL,
        data_hora TEXT NOT NULL,
        FOREIGN KEY (viagem_id) REFERENCES viagens(id),
        FOREIGN KEY (aluno_id) REFERENCES alunos(id)
      )
    `);
  });
};

// Seed initial data
const seedData = () => {
  const alunos = [
    { nome: 'João', rota: 'Rota A' },
    { nome: 'Maria', rota: 'Rota A' },
    { nome: 'Pedro', rota: 'Rota B' },
    { nome: 'Ana', rota: 'Rota B' },
    { nome: 'Carlos', rota: 'Rota C' }
  ];

  db.get("SELECT COUNT(*) as count FROM alunos", (err, row) => {
    if (err) {
      console.error('Erro ao verificar dados existentes:', err);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO alunos (nome, rota) VALUES (?, ?)");
      alunos.forEach(aluno => {
        stmt.run(aluno.nome, aluno.rota);
      });
      stmt.finalize();
      console.log('Dados iniciais inseridos com sucesso');
    }
  });
};

// Initialize database
createTables();
seedData();

// API Routes

// Get all students
app.get('/api/alunos', (req, res) => {
  db.all("SELECT * FROM alunos ORDER BY nome", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get students who embarked in the morning trip
app.get('/api/alunos/embarcados-manha', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT DISTINCT a.* 
    FROM alunos a
    JOIN logs l ON a.id = l.aluno_id
    JOIN viagens v ON l.viagem_id = v.id
    WHERE v.tipo = 'Ida' 
      AND v.data = ? 
      AND l.status = 'Embarcou'
    ORDER BY a.nome
  `;
  
  db.all(query, [today], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new trip
app.post('/api/viagens', (req, res) => {
  const { tipo } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  db.run("INSERT INTO viagens (tipo, data) VALUES (?, ?)", [tipo, today], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, tipo, data: today, status: 'Em Andamento' });
  });
});

// Get active trip
app.get('/api/viagens/ativa', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.get("SELECT * FROM viagens WHERE data = ? AND status = 'Em Andamento'", [today], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Get trip by ID
app.get('/api/viagens/:id', (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM viagens WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Viagem não encontrada' });
      return;
    }
    res.json(row);
  });
});

// Update trip status
app.put('/api/viagens/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run("UPDATE viagens SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Status da viagem atualizado com sucesso' });
  });
});

// Get logs for a trip
app.get('/api/viagens/:id/logs', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT l.*, a.nome as aluno_nome, a.rota
    FROM logs l
    JOIN alunos a ON l.aluno_id = a.id
    WHERE l.viagem_id = ?
    ORDER BY l.data_hora DESC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create log entry
app.post('/api/logs', (req, res) => {
  const { viagem_id, aluno_id, status } = req.body;
  const now = new Date().toISOString();
  
  db.run("INSERT INTO logs (viagem_id, aluno_id, status, data_hora) VALUES (?, ?, ?, ?)", 
    [viagem_id, aluno_id, status, now], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, viagem_id, aluno_id, status, data_hora: now });
  });
});

// Get trip summary
app.get('/api/viagens/:id/resumo', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      status,
      COUNT(*) as quantidade
    FROM logs
    WHERE viagem_id = ?
    GROUP BY status
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const summary = {
      embarcados: 0,
      nao_embarcados: 0,
      desembarcados: 0
    };
    
    rows.forEach(row => {
      if (row.status === 'Embarcou') summary.embarcados = row.quantidade;
      if (row.status === 'Não Embarcou') summary.nao_embarcados = row.quantidade;
      if (row.status === 'Desembarquou') summary.desembarcados = row.quantidade;
    });
    
    res.json(summary);
  });
});

// Get students missing from return trip
app.get('/api/viagens/:id/faltantes', (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT a.*
    FROM alunos a
    WHERE a.id IN (
      SELECT l.aluno_id
      FROM logs l
      JOIN viagens v ON l.viagem_id = v.id
      WHERE v.tipo = 'Ida' 
        AND v.data = ? 
        AND l.status = 'Embarcou'
    )
    AND a.id NOT IN (
      SELECT l.aluno_id
      FROM logs l
      WHERE l.viagem_id = ? 
        AND l.status = 'Embarcou'
    )
    ORDER BY a.nome
  `;
  
  db.all(query, [today, id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;