require('dotenv').config();
const express            = require('express');
const cors               = require('cors');
const { initDB }         = require('./database');
const appointmentsRouter = require('./routes/appointments');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());
app.use((req, _res, next) => { console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ${req.method} ${req.path}`); next(); });

app.use('/api/appointments', appointmentsRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Organiza Odonto 🦷' }));
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

initDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n🦷 Organiza Odonto API iniciada!');
    console.log(`📡 http://localhost:${PORT}\n`);
  });
}).catch(err => { console.error('❌ Erro:', err); process.exit(1); });
