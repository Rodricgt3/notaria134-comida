/** Ejecuta configurar una vez; luego publica como aplicación web. */
function configurar() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  var spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.create('Notaría 134 · Confirmaciones · 11 diciembre 2026');
  properties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  var sheet = spreadsheet.getSheetByName('Confirmaciones') || spreadsheet.insertSheet('Confirmaciones');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha de registro', 'Nombre completo', 'Recomendación, sugerencia o alergia', 'Estado', 'ID de envío']);
    sheet.getRange(1, 1, 1, 5).setBackground('#173d32').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 260);
    sheet.setColumnWidth(3, 420);
    sheet.setColumnWidth(4, 130);
    sheet.setColumnWidth(5, 290);
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange('B:C').setWrap(true);
    spreadsheet.setSpreadsheetTimeZone('America/Mexico_City');
  }
  console.log('Tu hoja de confirmaciones: ' + spreadsheet.getUrl());
}

function doGet() {
  return respuesta_({ ok: true, service: 'Confirmaciones Notaría 134' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = e && e.parameter ? e.parameter : {};
    var name = String(p.fullName || '').trim().replace(/\s+/g, ' ');
    var notes = String(p.notes || '').trim();
    var requestId = String(p.requestId || '');
    if (p.website || name.length < 3 || name.length > 120 || notes.length > 1500 || !/^[a-f0-9-]{36}$/i.test(requestId)) {
      return respuesta_({ ok: false, error: 'Datos no válidos.' });
    }
    if (!lock.tryLock(15000)) return respuesta_({ ok: false, error: 'Intenta de nuevo en unos segundos.' });
    var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) throw new Error('Ejecuta configurar antes de publicar.');
    var sheet = SpreadsheetApp.openById(id).getSheetByName('Confirmaciones');
    if (!sheet) throw new Error('No existe la hoja de confirmaciones.');
    var lastRow = sheet.getLastRow();
    var existing = lastRow > 1 && sheet.getRange(2, 5, lastRow - 1, 1)
      .createTextFinder(requestId).matchEntireCell(true).findNext();
    if (!existing) {
      sheet.appendRow([new Date(), textoSeguro_(name), textoSeguro_(notes), 'Confirmado', requestId]);
      SpreadsheetApp.flush();
    }
    return respuesta_({ ok: true, requestId: requestId });
  } catch (error) {
    console.error(error);
    return respuesta_({ ok: false, error: 'No fue posible guardar la confirmación.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function textoSeguro_(value) {
  return /^[=+@\-\t\r\n]/.test(value) ? "'" + value : value;
}

function respuesta_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
