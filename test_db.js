const sqlite3 = require('sqlite3').verbose();

// Test database connection and basic functionality
const db = new sqlite3.Database('./test_transporte.db');

console.log('🚀 Testando banco de dados SQLite...');

// Create tables
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

  console.log('✅ Tabelas criadas com sucesso!');

  // Insert test data
  const alunos = [
    { nome: 'João', rota: 'Rota A' },
    { nome: 'Maria', rota: 'Rota A' },
    { nome: 'Pedro', rota: 'Rota B' },
    { nome: 'Ana', rota: 'Rota B' },
    { nome: 'Carlos', rota: 'Rota C' }
  ];

  const stmt = db.prepare("INSERT INTO alunos (nome, rota) VALUES (?, ?)");
  alunos.forEach(aluno => {
    stmt.run(aluno.nome, aluno.rota);
  });
  stmt.finalize();

  console.log('✅ Dados de teste inseridos!');

  // Test queries
  db.all("SELECT * FROM alunos ORDER BY nome", (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar alunos:', err);
    } else {
      console.log('📋 Alunos encontrados:', rows.length);
      rows.forEach(aluno => {
        console.log(`  - ${aluno.nome} (${aluno.rota})`);
      });
    }
  });

  // Test creating a trip
  const today = new Date().toISOString().split('T')[0];
  db.run("INSERT INTO viagens (tipo, data) VALUES (?, ?)", ['Ida', today], function(err) {
    if (err) {
      console.error('❌ Erro ao criar viagem:', err);
    } else {
      console.log('✅ Viagem criada com ID:', this.lastID);
      
      // Test creating a log
      db.run("INSERT INTO logs (viagem_id, aluno_id, status, data_hora) VALUES (?, ?, ?, ?)", 
        [this.lastID, 1, 'Embarcou', new Date().toISOString()], function(err) {
        if (err) {
          console.error('❌ Erro ao criar log:', err);
        } else {
          console.log('✅ Log criado com sucesso!');
        }
      });
    }
  });
});

setTimeout(() => {
  db.all("SELECT v.*, COUNT(l.id) as log_count FROM viagens v LEFT JOIN logs l ON v.id = l.viagem_id GROUP BY v.id", (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar viagens:', err);
    } else {
      console.log('🚌 Viagens encontradas:', rows.length);
      rows.forEach(viagem => {
        console.log(`  - Viagem ${viagem.id}: ${viagem.tipo} em ${viagem.data} (${viagem.log_count} logs)`);
      });
    }
    
    console.log('✅ Testes concluídos!');
    db.close();
  });
}, 1000);