// RoadMate Waitlist — Google Apps Script
// Receives form submissions and emails them to waitlist@roadmate.ai

const DESTINATION_EMAIL = 'waitlist@roadmate.ai';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const firstName  = data.first_name  || '';
    const lastName   = data.last_name   || '';
    const email      = data.email       || '';
    const role       = data.role        || '';
    const brokerage  = data.brokerage   || '';
    const market     = data.market      || '';
    const teamSize   = data.team_size   || 'Not specified';

    if (!email || !firstName || !lastName) {
      return respond(400, { error: 'Missing required fields' });
    }

    const subject = `New Waitlist Signup: ${firstName} ${lastName} — ${brokerage}`;

    const body = `
New RoadMate Waitlist Signup
─────────────────────────────
Name:        ${firstName} ${lastName}
Email:       ${email}
Role:        ${role}
Brokerage:   ${brokerage}
Market:      ${market}
Team Size:   ${teamSize}
─────────────────────────────
Reply directly to this email to contact them.
    `.trim();

    GmailApp.sendEmail(DESTINATION_EMAIL, subject, body, {
      replyTo: email,
      name: 'RoadMate Waitlist'
    });

    // Also log to a Google Sheet (optional — remove if not needed)
    logToSheet(data);

    return respond(200, { success: true });

  } catch (err) {
    return respond(500, { error: err.message });
  }
}

function logToSheet(data) {
  try {
    // Creates/uses a sheet named "Waitlist" in your Google Drive
    // Remove this function call above if you don't want spreadsheet logging
    const files = DriveApp.getFilesByName('RoadMate Waitlist');
    let ss;

    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('RoadMate Waitlist');
      const sheet = ss.getActiveSheet();
      sheet.setName('Waitlist');
      sheet.appendRow([
        'Timestamp', 'First Name', 'Last Name', 'Email',
        'Role', 'Brokerage', 'Market', 'Team Size'
      ]);
    }

    const sheet = ss.getSheetByName('Waitlist') || ss.getActiveSheet();
    sheet.appendRow([
      new Date(),
      data.first_name  || '',
      data.last_name   || '',
      data.email       || '',
      data.role        || '',
      data.brokerage   || '',
      data.market      || '',
      data.team_size   || ''
    ]);
  } catch (err) {
    // Sheet logging is optional — don't fail the request if it errors
    console.error('Sheet logging failed:', err.message);
  }
}

// Handle CORS preflight
function doGet(e) {
  return respond(200, { status: 'RoadMate Waitlist API is running' });
}

function respond(statusCode, data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
