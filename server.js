const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// If you want to debug or log frontend payloads temporarily
// app.post('/submit', (req, res) => {
//   console.log('Received data:', req.body);
//   res.status(200).json({ message: 'Datos recibidos en el backend (no almacenados).' });
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${PORT}`);
});
