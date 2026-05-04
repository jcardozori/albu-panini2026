// src/services/googleSheetsService.js
// Servicio para leer y escribir datos en Google Sheets usando la API de Google

const SHEET_NAME = 'albu-panini2026';
const EXPORT_SHEET_NAME = 'fichas';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Obtiene o crea el spreadsheet "albu-panini2026" en el Drive del usuario autenticado.
 * Retorna el spreadsheetId.
 */
export async function getOrCreateSpreadsheet(accessToken) {
  // 1. Buscar si ya existe
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D%27${SHEET_NAME}%27+and+mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27+and+trashed%3Dfalse&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const driveData = await driveRes.json();

  if (driveData.files && driveData.files.length > 0) {
    return driveData.files[0].id;
  }

  // 2. Crear si no existe
  const createRes = await fetch(`${SHEETS_API_BASE}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: SHEET_NAME },
      sheets: [{ properties: { title: 'Fichas' } }],
    }),
  });
  const created = await createRes.json();

  // 3. Quitar acceso público (solo propietario)
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${created.spreadsheetId}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'owner',
        type: 'user',
        emailAddress: 'me',
      }),
    }
  );

  return created.spreadsheetId;
}

/**
 * Carga el estado de las fichas desde Google Sheets.
 * Retorna un objeto { [sectionId]: { [stickerIndex]: boolean } }
 */
export async function loadDataFromSheets(spreadsheetId, accessToken) {
  try {
    const res = await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Fichas!A1:ZZ1000`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();

    if (!data.values || data.values.length < 2) return null;

    const result = {};
    // Row 0: headers (sectionId, 0, 1, 2, ...)
    // Rows 1+: each row is a section
    for (let row = 1; row < data.values.length; row++) {
      const rowData = data.values[row];
      if (!rowData || rowData.length === 0) continue;
      const sectionId = rowData[0];
      if (!sectionId) continue;
      result[sectionId] = {};
      for (let col = 1; col < rowData.length; col++) {
        result[sectionId][col - 1] = rowData[col] === 'TRUE';
      }
    }
    return result;
  } catch (e) {
    console.error('Error cargando desde Sheets:', e);
    return null;
  }
}

/**
 * Guarda el estado completo de las fichas en Google Sheets.
 */
export async function saveDataToSheets(spreadsheetId, accessToken, allStates, sections) {
  try {
    // Construir matriz de datos
    const maxStickers = Math.max(...sections.map(s => s.totalStickers));
    const headerRow = ['Sección', ...Array.from({ length: maxStickers }, (_, i) => `Ficha ${i + 1}`)];

    const rows = [headerRow];
    for (const section of sections) {
      const stickerState = allStates[section.id] || {};
      const row = [section.title];
      for (let i = 0; i < section.totalStickers; i++) {
        row.push(stickerState[i] ? 'TRUE' : 'FALSE');
      }
      rows.push(row);
    }

    // Limpiar hoja y escribir
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Fichas!A1:ZZ1000:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Fichas!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Fichas!A1',
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    return true;
  } catch (e) {
    console.error('Error guardando en Sheets:', e);
    return false;
  }
}

/**
 * Exporta los datos a un nuevo spreadsheet llamado "fichas".
 * Si ya existe, lo sobreescribe.
 */
export async function exportToCustomSheet(accessToken, allStates, sections) {
  try {
    // Buscar si ya existe "fichas"
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name%3D%27${EXPORT_SHEET_NAME}%27+and+mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27+and+trashed%3Dfalse&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const driveData = await driveRes.json();

    let exportId;

    if (driveData.files && driveData.files.length > 0) {
      exportId = driveData.files[0].id;
    } else {
      // Crear nuevo spreadsheet "fichas"
      const createRes = await fetch(`${SHEETS_API_BASE}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: EXPORT_SHEET_NAME },
          sheets: [{ properties: { title: 'Resumen' } }],
        }),
      });
      const created = await createRes.json();
      exportId = created.spreadsheetId;
    }

    // Construir datos para exportar con resumen visual
    const rows = [
      ['Álbum Panini FWC 2026 - Reporte de Fichas'],
      ['Generado:', new Date().toLocaleString('es-CO')],
      [],
      ['Sección', 'Total Fichas', 'Fichas Llenas', 'Fichas Vacías', 'Completado'],
    ];

    for (const section of sections) {
      const stickerState = allStates[section.id] || {};
      const total = section.totalStickers;
      const filled = Object.values(stickerState).filter(v => v).length;
      const empty = total - filled;
      const complete = filled === total ? 'SÍ ✓' : 'NO';
      rows.push([section.title, total, filled, empty, complete]);
    }

    const totalAll = sections.reduce((a, s) => a + s.totalStickers, 0);
    const filledAll = sections.reduce((a, s) => {
      const state = allStates[s.id] || {};
      return a + Object.values(state).filter(v => v).length;
    }, 0);

    rows.push([]);
    rows.push(['TOTAL', totalAll, filledAll, totalAll - filledAll, filledAll === totalAll ? 'COMPLETO ✓' : `${Math.round((filledAll / totalAll) * 100)}%`]);

    // Limpiar y escribir
    await fetch(
      `${SHEETS_API_BASE}/${exportId}/values/Resumen!A1:Z1000:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    await fetch(
      `${SHEETS_API_BASE}/${exportId}/values/Resumen!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Resumen!A1',
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    return exportId;
  } catch (e) {
    console.error('Error exportando:', e);
    return null;
  }
}
