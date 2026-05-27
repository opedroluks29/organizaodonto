/**
 * routes/appointments.js — Organiza Odonto
 * CRUD completo + encaixe + confirmações de presença.
 */

const express = require('express');
const router  = express.Router();
const { queryAll, queryGet, run } = require('../database');

// ── GET /api/appointments ──────────────────────────────────────
// Filtros: ?search= ?status= ?date= ?encaixe=0|1
router.get('/', (req, res) => {
  try {
    const { search, status, date, encaixe } = req.query;
    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const p = [];

    if (search?.trim())              { sql += ' AND patient_name LIKE ?'; p.push(`%${search.trim()}%`); }
    if (status && status !== 'todos'){ sql += ' AND status = ?';          p.push(status); }
    if (date?.trim())                { sql += ' AND date = ?';            p.push(date.trim()); }
    if (encaixe !== undefined && encaixe !== 'todos') {
      sql += ' AND encaixe = ?';
      p.push(encaixe === '1' || encaixe === 'sim' ? 1 : 0);
    }

    sql += ' ORDER BY date ASC, time ASC';
    res.json(queryAll(sql, p));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar atendimentos.' });
  }
});

// ── GET /api/appointments/stats ────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const total     = queryGet('SELECT COUNT(*) as c FROM appointments').c;
    const pendentes = queryGet("SELECT COUNT(*) as c FROM appointments WHERE status='pendente'").c;
    const concluidos= queryGet("SELECT COUNT(*) as c FROM appointments WHERE status='concluido'").c;
    const encaixes  = queryGet('SELECT COUNT(*) as c FROM appointments WHERE encaixe=1').c;
    const hoje      = new Date().toISOString().split('T')[0];
    const hoje_c    = queryGet('SELECT COUNT(*) as c FROM appointments WHERE date=?', [hoje]).c;
    res.json({ total, pendentes, concluidos, hoje: hoje_c, encaixes });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

// ── GET /api/appointments/tomorrow ────────────────────────────
// Retorna todos os atendimentos do dia seguinte (para confirmações)
router.get('/tomorrow', (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const rows = queryAll(
      "SELECT * FROM appointments WHERE date=? AND status='pendente' ORDER BY time ASC",
      [dateStr]
    );
    res.json({ date: dateStr, appointments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pacientes de amanhã.' });
  }
});

// ── GET /api/appointments/:id ──────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const row = queryGet('SELECT * FROM appointments WHERE id=?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ error: 'Atendimento não encontrado.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar atendimento.' });
  }
});

// ── POST /api/appointments ─────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { patient_name, procedure, date, time, notes, status, encaixe } = req.body;

    if (!patient_name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
    if (!procedure?.trim())    return res.status(400).json({ error: 'Procedimento é obrigatório.' });
    if (!date)                 return res.status(400).json({ error: 'Data é obrigatória.' });
    if (!time)                 return res.status(400).json({ error: 'Hora é obrigatória.' });

    const result = run(
      `INSERT INTO appointments (patient_name, procedure, date, time, notes, status, encaixe)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_name.trim(),
        procedure.trim(),
        date, time,
        notes?.trim() || '',
        status || 'pendente',
        encaixe ? 1 : 0,
      ]
    );

    res.status(201).json(queryGet('SELECT * FROM appointments WHERE id=?', [result.lastInsertRowid]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar atendimento.' });
  }
});

// ── PUT /api/appointments/:id ──────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const ex = queryGet('SELECT * FROM appointments WHERE id=?', [id]);
    if (!ex) return res.status(404).json({ error: 'Atendimento não encontrado.' });

    const { patient_name, procedure, date, time, notes, status, encaixe } = req.body;

    run(
      `UPDATE appointments
       SET patient_name=?, procedure=?, date=?, time=?, notes=?, status=?, encaixe=?,
           updated_at=datetime('now','localtime')
       WHERE id=?`,
      [
        (patient_name || ex.patient_name).trim(),
        (procedure    || ex.procedure).trim(),
        date          || ex.date,
        time          || ex.time,
        notes !== undefined ? notes.trim() : ex.notes,
        status        || ex.status,
        encaixe !== undefined ? (encaixe ? 1 : 0) : ex.encaixe,
        id,
      ]
    );

    res.json(queryGet('SELECT * FROM appointments WHERE id=?', [id]));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar atendimento.' });
  }
});

// ── PATCH /api/appointments/:id/status ────────────────────────
router.patch('/:id/status', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['pendente', 'concluido'].includes(status))
      return res.status(400).json({ error: 'Status inválido.' });

    const ex = queryGet('SELECT * FROM appointments WHERE id=?', [id]);
    if (!ex) return res.status(404).json({ error: 'Atendimento não encontrado.' });

    run(`UPDATE appointments SET status=?, updated_at=datetime('now','localtime') WHERE id=?`, [status, id]);
    res.json(queryGet('SELECT * FROM appointments WHERE id=?', [id]));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// ── PATCH /api/appointments/:id/confirmacao ────────────────────
// Atualiza confirmação de presença: 'pendente' | 'confirmado' | 'nao_ira'
router.patch('/:id/confirmacao', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { confirmacao } = req.body;

    if (!['pendente', 'confirmado', 'nao_ira'].includes(confirmacao))
      return res.status(400).json({ error: 'Confirmação inválida.' });

    const ex = queryGet('SELECT * FROM appointments WHERE id=?', [id]);
    if (!ex) return res.status(404).json({ error: 'Atendimento não encontrado.' });

    run(`UPDATE appointments SET confirmacao=?, updated_at=datetime('now','localtime') WHERE id=?`,
        [confirmacao, id]);
    res.json(queryGet('SELECT * FROM appointments WHERE id=?', [id]));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar confirmação.' });
  }
});

// ── DELETE /api/appointments/:id ───────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const ex = queryGet('SELECT * FROM appointments WHERE id=?', [id]);
    if (!ex) return res.status(404).json({ error: 'Atendimento não encontrado.' });

    run('DELETE FROM appointments WHERE id=?', [id]);
    res.json({ message: 'Excluído com sucesso.', id });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir atendimento.' });
  }
});

module.exports = router;
