# Cadence OS Landing Page - Setup Guide

## Quick Start (Local Preview)

Open `index.html` in your browser to preview the landing page. The waitlist form works in "demo mode" (logs to console) until you connect Google Sheets.

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## Connect Google Sheets for Waitlist

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Cadence OS Waitlist" (or whatever you prefer)
4. Add headers in Row 1:
   - A1: `Email`
   - B1: `Timestamp`
   - C1: `Source`

### Step 2: Create the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.email,
      data.timestamp,
      data.source || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Waitlist endpoint is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. Click **Save** (Ctrl/Cmd + S)
4. Name the project "Waitlist Handler"

### Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - Description: "Waitlist signup handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Authorize the app when prompted (click through the "unsafe" warning - it's your own script)
6. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```

### Step 4: Connect to Landing Page

1. Open `script.js`
2. Find this line at the top:
   ```javascript
   const GOOGLE_SCRIPT_URL = '';
   ```
3. Paste your Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABC123.../exec';
   ```
4. Save the file

### Step 5: Test It

1. Refresh your landing page
2. Enter a test email and submit
3. Check your Google Sheet - you should see the new row!

---

## Deployment Options

### GitHub Pages (Free)

1. Push to a GitHub repository
2. Go to Settings > Pages
3. Select branch and folder
4. Your site will be live at `username.github.io/repo-name`

### Vercel (Free)

1. Connect your GitHub repo to Vercel
2. Deploy with one click
3. Get a `.vercel.app` domain (or add custom domain)

### Netlify (Free)

1. Drag and drop the `website` folder to Netlify
2. Or connect via GitHub for continuous deployment
3. Get a `.netlify.app` domain

### Custom Domain

For any platform above:
1. Add your domain in the platform settings
2. Update DNS records as instructed
3. Enable HTTPS (usually automatic)

---

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --accent: #4f46e5;        /* Main brand color */
    --accent-hover: #4338ca;  /* Hover state */
    --accent-light: #eef2ff;  /* Light background */
}
```

### Content

Edit text directly in `index.html`. Key sections:
- Hero headline and subtitle
- Problem quote
- Benefits cards
- Target audience

### Logo

Replace the SVG in the nav and footer, or swap `assets/favicon.svg`.

---

## Troubleshooting

### Form submits but no data in sheet

1. Check the Apps Script URL is correct in `script.js`
2. Verify the script is deployed as "Anyone" can access
3. Check the Apps Script execution logs:
   - In Apps Script, go to **Executions** on the left sidebar
   - Look for any errors

### CORS errors in console

This is normal with Google Apps Script. The form uses `no-cors` mode, so submissions work but you won't see a response in the network tab. Check your Google Sheet to verify data is being recorded.

### Need to update the Apps Script

After any changes:
1. Click **Deploy > Manage deployments**
2. Edit the active deployment
3. Change the version to "New version"
4. Click **Deploy**
