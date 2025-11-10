# Transporte Escolar - Sistema de Gerenciamento

Sistema web para gerenciamento de transporte escolar, permitindo que motoristas de ônibus escolares controlem o embarque e desembarque de alunos.

## 🚀 Funcionalidades

- **Iniciar Viagem**: Escolha entre viagem de ida (manhã) ou volta (tarde)
- **Gerenciamento de Alunos**: 
  - Para Ida: Marque ✅ Embarcou, 🚫 Não Embarcou, ⬇️ Desembarcou
  - Para Volta: Mostra apenas alunos que embarcaram pela manhã
- **Registro de Logs**: Toda ação é registrada com data e hora
- **Alertas de Segurança**: Aviso se alunos que embarcaram pela manhã não retornaram
- **Resumo da Viagem**: Total de embarcados, não embarcados e desembarcados
- **Design Responsivo**: Interface amigável para dispositivos móveis

## 📋 Estrutura do Banco de Dados

### Tabelas
- **alunos**: id, nome, rota
- **viagens**: id, tipo (Ida/Volta), data, status (Em Andamento/Finalizada)
- **logs**: id, viagem_id, aluno_id, status, data_hora

### Alunos Padrão
- João (Rota A)
- Maria (Rota A)
- Pedro (Rota B)
- Ana (Rota B)
- Carlos (Rota C)

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- SQLite3
- CORS
- Body-parser

### Frontend
- React 18
- TypeScript
- CSS3 com design responsivo
- Axios (para requisições HTTP)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Backend
1. Navegue até a pasta backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o servidor:
   ```bash
   npm start
   ```
   
   O servidor iniciará na porta 3001.

### Frontend
1. Navegue até a pasta frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o aplicativo:
   ```bash
   npm start
   ```
   
   O aplicativo iniciará na porta 3000.

## 🎯 Fluxo de Uso

1. **Tela Inicial**: Clique em "Iniciar Viagem"
2. **Escolher Tipo**: Selecione "Ida" ou "Volta"
3. **Gerenciar Alunos**: Marque o status de cada aluno
4. **Finalizar Viagem**: Clique em "Encerrar Viagem" e confirme o resumo

## 🔧 API Endpoints

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/embarcados-manha` - Alunos que embarcaram pela manhã

### Viagens
- `POST /api/viagens` - Criar nova viagem
- `GET /api/viagens/ativa` - Obter viagem ativa do dia
- `GET /api/viagens/:id` - Obter viagem por ID
- `PUT /api/viagens/:id/status` - Atualizar status da viagem

### Logs
- `POST /api/logs` - Criar novo log
- `GET /api/viagens/:id/logs` - Obter logs de uma viagem

### Relatórios
- `GET /api/viagens/:id/resumo` - Resumo da viagem
- `GET /api/viagens/:id/faltantes` - Alunos faltantes na volta

## 📱 Design Mobile

O sistema foi desenvolvido com foco em dispositivos móveis, pois será utilizado por motoristas em tablets ou smartphones. A interface é totalmente responsiva e adaptável a diferentes tamanhos de tela.

## 🔒 Segurança

Este é um protótipo e não inclui autenticação. Em um ambiente de produção, seria necessário adicionar:
- Sistema de login para motoristas
- Autenticação JWT
- Criptografia de dados sensíveis
- Logs de auditoria

## 📝 Notas Importantes

- O banco de dados SQLite é criado automaticamente na primeira execução
- Os dados dos alunos são inseridos automaticamente se o banco estiver vazio
- Todas as ações são registradas com timestamp para auditoria
- O sistema alerta sobre alunos faltantes na volta para maior segurança

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Este é um projeto educacional desenvolvido para demonstrar habilidades em desenvolvimento web full-stack.