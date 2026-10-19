/** Ejecuta configurar una vez; luego publica como aplicación web. */
var DESTINO_ID = '1P2higEKdSPhuOvVy_h5w5YGVLMRafu1EP2529hVPx-I';
var DESTINO_PESTANA = 0;

function hojaDestino_() {
  var spreadsheet = SpreadsheetApp.openById(DESTINO_ID);
  var sheet = spreadsheet.getSheets().filter(function(item) { return item.getSheetId() === DESTINO_PESTANA; })[0];
  if (!sheet) throw new Error('No existe la pestaña gid=0 en el archivo indicado.');
  return sheet;
}

function configurar() {
  var sheet = hojaDestino_();
  var spreadsheet = sheet.getParent();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha de registro', 'Nombre completo', 'Estado', 'ID de envío']);
    sheet.getRange(1, 1, 1, 4).setBackground('#162b49').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 260);
    sheet.setColumnWidth(3, 130);
    sheet.setColumnWidth(4, 290);
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange('B:C').setWrap(true);
    spreadsheet.setSpreadsheetTimeZone('America/Mexico_City');
  }
  validarCabecera_(sheet);
  SpreadsheetApp.flush();
  console.log('Tu hoja de confirmaciones: ' + spreadsheet.getUrl());
}

function validarCabecera_(sheet) {
  var expected = ['Fecha de registro', 'Nombre completo', 'Estado', 'ID de envío'];
  var actual = sheet.getRange(1, 1, 1, 4).getDisplayValues()[0];
  if (expected.some(function(value, i) { return actual[i] !== value; })) {
    throw new Error('Ejecuta configurar en una pestaña vacía o verifica sus encabezados. No se sobrescribieron datos.');
  }
}

function doGet(e) {
  try {
    validarCabecera_(hojaDestino_());
    return respuesta_({ ok: true, service: 'Confirmaciones Notaría 134', version: 3, configured: true });
  } catch (error) {
    console.error(error);
    return respuesta_({ ok: false, version: 3, configured: false, error: 'Ejecuta configurar y verifica el acceso a la hoja de destino.' });
  }
}

function doPost(e) {
  return guardar_(e);
}

function guardar_(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = e && e.parameter ? e.parameter : {};
    var name = String(p.fullName || '').trim().replace(/\s+/g, ' ');
    var requestId = String(p.requestId || '');
    if (p.website || name.length < 3 || name.length > 120 || !/^[a-f0-9-]{36}$/i.test(requestId)) {
      return respuesta_({ ok: false, error: 'Datos no válidos.' });
    }
    if (!lock.tryLock(15000)) return respuesta_({ ok: false, error: 'Intenta de nuevo en unos segundos.' });
    var sheet = hojaDestino_();
    validarCabecera_(sheet);
    var lastRow = sheet.getLastRow();
    var existing = lastRow > 1 && sheet.getRange(2, 4, lastRow - 1, 1)
      .createTextFinder(requestId).matchEntireCell(true).findNext();
    var duplicate = lastRow > 1 && sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues().some(function(row) { return nombreClave_(row[0]) === nombreClave_(name); });
    if (!existing && !duplicate) {
      sheet.appendRow([new Date(), textoSeguro_(name), 'Confirmado', requestId]);
      SpreadsheetApp.flush();
      if (sheet.getRange(sheet.getLastRow(), 4).getValue() !== requestId) throw new Error('No se pudo verificar la fila guardada.');
    }
    return respuesta_({ ok: true, requestId: requestId, duplicate: !!duplicate });
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

function nombreClave_(value) {
  return String(value).replace(/^'/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function respuesta_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
