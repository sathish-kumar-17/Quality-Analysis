const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();
const PORT = 3000;
const EXCEL_FILE = 'inspections.xlsx';

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    const timestamp = new Date().toLocaleString();

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(EXCEL_FILE)) {
      await workbook.xlsx.readFile(EXCEL_FILE);
      worksheet = workbook.getWorksheet('Inspecciones');
    } else {
      worksheet = workbook.addWorksheet('Inspecciones');

      const baseHeader = ['Ítem', 'Supervisor', 'Inspector', 'Fecha', 'No', 'Op'];
      const defectHeaders = Array.from({ length: 15 }, (_, i) => `Defecto ${i + 1}`);
      const totalColsHeader = Array.from({ length: 15 }, (_, i) => `Total Col ${i + 1}`);
      const extraHeaders = ['Total Fila', 'Piezas Rechazadas', 'Piezas Inspeccionadas', 'Marca de tiempo'];

      worksheet.addRow([...baseHeader, ...defectHeaders, ...extraHeaders, ...totalColsHeader]);
    }

    for (const row of data.rows) {
      worksheet.addRow([
        data.item,
        data.supervisor,
        data.inspector,
        data.fecha,
        row.no,
        row.op,
        ...row.defectos,
        row.totalFila,
        data.piezasRechazadas,
        data.piezasInspeccionadas,
        timestamp,
        ...data.totalColumnas
      ]);
    }

   

    await workbook.xlsx.writeFile(EXCEL_FILE);
    res.status(200).json({ message: 'Formulario guardado en Excel correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el formulario.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${PORT}`);
});

