function autoExpandInput(input) {
  input.style.width = '5ch';
  const extraPadding = input.hasAttribute('readonly') ? 10 : 5;
  input.style.width = (input.scrollWidth + extraPadding) + 'px';
}

function calculateRowTotal(row) {
  const inputs = row.querySelectorAll('td input[type="text"]:not([readonly]):not([data-no-arrows])');
  let sum = 0;
  inputs.forEach(input => {
    const val = parseInt(input.value) || 0;
    sum += val;
  });
  const totalCell = row.querySelector('.total-cell');
  if (totalCell) {
    totalCell.value = sum;
    autoExpandInput(totalCell);
  }
}

function calculateColumnTotals() {
  const colTotals = new Array(15).fill(0);
  let totalSum = 0;
  const rows = document.querySelectorAll('#data-body tr.data-row');

  rows.forEach(row => {
    const inputs = row.querySelectorAll('td input[type="text"]:not([readonly]):not([data-no-arrows])');
    inputs.forEach((input, i) => {
      colTotals[i] += parseInt(input.value) || 0;
    });

    const rowTotal = row.querySelector('.total-cell');
    totalSum += parseInt(rowTotal?.value) || 0;
  });

  const totalInputs = document.querySelectorAll('#column-total-row input');
  totalInputs.forEach((input, i) => {
    input.value = colTotals[i] || 0;
    autoExpandInput(input);
  });

  const piezasInput = document.querySelector('#piezas-rechazadas');
  if (piezasInput) {
    piezasInput.value = totalSum;
    autoExpandInput(piezasInput);
  }
}

function attachInputEvents(input) {
  if (input.hasAttribute('data-no-arrows') || input.hasAttribute('readonly')) return;
  if (input.parentNode && input.parentNode.classList.contains('input-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'input-wrapper';

  const downBtn = document.createElement('div');
  downBtn.className = 'input-arrow-down';
  downBtn.textContent = '▼';

  const upBtn = document.createElement('div');
  upBtn.className = 'input-arrow-up';
  upBtn.textContent = '▲';

  downBtn.onclick = () => {
    let val = parseInt(input.value) || 0;
    input.value = Math.max(val - 1, 0);
    calculateRowTotal(input.closest('tr'));
    calculateColumnTotals();
  };

  upBtn.onclick = () => {
    let val = parseInt(input.value) || 0;
    input.value = val + 1;
    calculateRowTotal(input.closest('tr'));
    calculateColumnTotals();
  };

  input.addEventListener('input', () => {
    if (parseInt(input.value) < 0 || isNaN(input.value)) input.value = 0;
    calculateRowTotal(input.closest('tr'));
    calculateColumnTotals();
  });

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(downBtn);
  wrapper.appendChild(input);
  wrapper.appendChild(upBtn);
}

function createRow(index) {
  const row = document.createElement('tr');
  row.classList.add('data-row');
  row.innerHTML = `
    <td>${index}</td>
    <td><input type="text" data-no-arrows class="op-input" /></td>
    ${Array.from({ length: 15 }, () => `<td><input type="text" /></td>`).join('')}
    <td><input type="text" readonly data-no-arrows class="total-cell" /></td>
  `;

  row.querySelectorAll('input[type="text"]:not([readonly]):not([data-no-arrows])')
    .forEach(attachInputEvents);

  row.querySelectorAll('.op-input').forEach(input => {
    autoExpandInput(input);
    input.addEventListener('input', () => autoExpandInput(input));
  });

  row.querySelectorAll('.total-cell').forEach(autoExpandInput);

  return row;
}

function createColumnTotalRow() {
  const row = document.createElement('tr');
  row.id = 'column-total-row';
  row.innerHTML = `
    <td colspan="2"><b>Totales</b></td>
    ${Array.from({ length: 15 }, () => `<td><input type="text" readonly data-no-arrows /></td>`).join('')}
    <td><input type="text" readonly data-no-arrows /></td>
  `;
  return row;
}

function createFinalRow() {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><b>PIEZAS RECHAZADAS</b></td>
    <td><input type="text" id="piezas-rechazadas" readonly data-no-arrows /></td>
    <td><b>PIEZAS INSPECCIONADAS</b></td>
    <td><input type="text" data-no-arrows /></td>
  `;
  return row;
}

function resetFormData() {
  const confirmClear = confirm('¿Desea limpiar el formulario ahora?');
  if (!confirmClear) return;

  document.querySelectorAll('.iteamNos input').forEach(input => input.value = '');
  document.querySelectorAll('#data-body tr.data-row').forEach(row => {
    row.querySelectorAll('input[type="text"]').forEach(input => {
      if (!input.hasAttribute('readonly')) input.value = '';
      autoExpandInput(input);
    });
    calculateRowTotal(row);
  });
  calculateColumnTotals();

  const piezasInspeccionadasInput = document.querySelector('#data-body tr:last-child td:nth-child(4) input');
  if (piezasInspeccionadasInput) piezasInspeccionadasInput.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('data-body');
  for (let i = 1; i <= 25; i++) tbody.appendChild(createRow(i));
  tbody.appendChild(createColumnTotalRow());
  tbody.appendChild(createFinalRow());

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.input-wrapper').forEach(wrapper => wrapper.classList.remove('active'));
    if (e.target.matches('input[type="text"]')) {
      const wrapper = e.target.closest('.input-wrapper');
      if (wrapper) wrapper.classList.add('active');
    }
  });

  document.getElementById('submitBtn').addEventListener('click', function () {
    const btn = this;
    document.querySelectorAll('.highlight-error').forEach(el => el.classList.remove('highlight-error'));

    const item = document.querySelectorAll('.iteamNos input')[0];
    const supervisor = document.querySelectorAll('.iteamNos input')[1];
    const inspector = document.querySelectorAll('.iteamNos input')[2];
    const fecha = document.querySelectorAll('.iteamNos input')[3];

    const requiredFields = [item, supervisor, inspector, fecha];
    let missingRequired = false;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('highlight-error');
        missingRequired = true;
      }
    });

    const defectKeys = [
      'costuraAbierta', 'embolsado', 'fueraDeMedida', 'incompleta', 'omitida',
      'orillaCrudo', 'pliegue', 'saltos', 'defMaterial', 'arrugado',
      'rotos', 'manchas', 'noEstandar', 'tonalidades', 'otros'
    ];

    const rows = [];
    document.querySelectorAll('#data-body tr.data-row').forEach((tr, idx) => {
      const tds = tr.querySelectorAll('input[type="text"]');
      const op = tds[0].value.trim();
      const defectValues = Array.from(tds).slice(1, 16).map(td => parseInt(td.value) || 0);
      const totalFila = parseInt(tds[16].value) || 0;
      const hasData = defectValues.some(val => val > 0) || totalFila > 0;

      if (hasData) {
        if (!op) {
          tds[0].classList.add('highlight-error');
          missingRequired = true;
        } else {
          const defectData = Object.fromEntries(defectKeys.map((key, i) => [key, defectValues[i]]));
          rows.push({ no: idx + 1, op, ...defectData, totalFila });
        }
      }
    });

    if (missingRequired) {
      alert('⚠️ Por favor ingrese el número de operador (Op) para las filas con defectos.');
      return;
    }

    if (rows.length === 0) {
      alert('⚠️ No se ingresaron datos válidos en ninguna fila. Por favor complete al menos una fila.');
      return;
    }

    const piezasRechazadas = parseInt(document.getElementById('piezas-rechazadas').value) || 0;
    const piezasInspeccionadas = parseInt(
      document.querySelector('#data-body tr:last-child td:nth-child(4) input').value
    ) || 0;

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    fetch('https://prod-168.westus.logic.azure.com:443/workflows/a470a8d232214a22919d616946bcb5a3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=whE3tuFhuSUWGDsMRIHEKlDBk-z3Gu4-MS2xszbkXRE', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: item.value.trim(),
        supervisor: supervisor.value.trim(),
        inspector: inspector.value.trim(),
        fecha: fecha.value.trim(),
        rows,
        piezasRechazadas,
        piezasInspeccionadas
      })
    })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        await res.text();
        alert('✅ Formulario enviado y guardado con éxito!');
        resetFormData();
      })
      .catch(err => {
        console.error('❌ Error al enviar datos:', err);
        alert('⚠️ Error al guardar el formulario:\n' + err.message);
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Enviar';
      });
  });
});
