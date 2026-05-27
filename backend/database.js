/**
 * database.js — Organiza Odonto
 * sql.js: SQLite 100% JavaScript, sem compilação nativa.
 * Suporta migração automática para adicionar novas colunas.
 */

const path = require('path');
const fs   = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'agenda.db');
let db = null;

// ── Persiste o banco em disco após cada escrita ────────────────
function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Helpers de query ───────────────────────────────────────────

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryGet(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

function run(sql, params = []) {
  db.run(sql, params);
  const rowid   = queryGet('SELECT last_insert_rowid() as id').id;
  const changes = db.getRowsModified();
  saveDB();
  return { lastInsertRowid: rowid, changes };
}

// ── Inicialização assíncrona ───────────────────────────────────
async function initDB() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
    console.log('✅ Banco carregado:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Novo banco criado:', DB_PATH);
  }

  // Cria tabela principal
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT    NOT NULL,
      procedure    TEXT    NOT NULL,
      date         TEXT    NOT NULL,
      time         TEXT    NOT NULL,
      notes        TEXT    DEFAULT '',
      status       TEXT    DEFAULT 'pendente',
      encaixe      INTEGER DEFAULT 0,
      confirmacao  TEXT    DEFAULT 'pendente',
      created_at   TEXT    DEFAULT (datetime('now', 'localtime')),
      updated_at   TEXT    DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Migração: adiciona colunas novas em bancos antigos
  const cols = queryAll('PRAGMA table_info(appointments)').map(c => c.name);
  if (!cols.includes('encaixe')) {
    db.run('ALTER TABLE appointments ADD COLUMN encaixe INTEGER DEFAULT 0');
    console.log('🔄 Migração: coluna encaixe adicionada');
  }
  if (!cols.includes('confirmacao')) {
    db.run("ALTER TABLE appointments ADD COLUMN confirmacao TEXT DEFAULT 'pendente'");
    console.log('🔄 Migração: coluna confirmacao adicionada');
  }

  db.run('CREATE INDEX IF NOT EXISTS idx_name   ON appointments(patient_name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_date   ON appointments(date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_status ON appointments(status)');

  saveDB();
}

module.exports = { initDB, queryAll, queryGet, run };
