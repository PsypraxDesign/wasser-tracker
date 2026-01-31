// Google Apps Script für Wasser-Tracker
// Diesen Code in Erweiterungen → Apps Script einfügen

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const action = e.parameter.action;
  
  // CORS Headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    if (action === 'get') {
      // Alle Daten abrufen
      const data = sheet.getDataRange().getValues();
      const result = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          result.push({
            date: formatDate(data[i][0]),
            glasses: parseInt(data[i][1]) || 0
          });
        }
      }
      
      output.setContent(JSON.stringify({ success: true, data: result }));
      
    } else if (action === 'save') {
      // Einen Tag speichern/aktualisieren
      const date = e.parameter.date;
      const glasses = parseInt(e.parameter.glasses) || 0;
      
      // Suche ob Datum bereits existiert
      const data = sheet.getDataRange().getValues();
      let found = false;
      
      for (let i = 1; i < data.length; i++) {
        if (formatDate(data[i][0]) === date) {
          // Update bestehende Zeile
          sheet.getRange(i + 1, 2).setValue(glasses);
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Neue Zeile hinzufügen
        sheet.appendRow([date, glasses]);
      }
      
      output.setContent(JSON.stringify({ success: true }));
      
    } else {
      output.setContent(JSON.stringify({ success: false, error: 'Unknown action' }));
    }
    
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, error: error.toString() }));
  }
  
  return output;
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') return dateValue;
  
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
