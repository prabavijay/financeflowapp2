# OAuth2 Quick Start Guide

Quick setup guide for OAuth2 email receipt processing in FinanceFlow.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install googleapis @azure/msal-browser
```

### 2. Environment Variables
Create `.env` file with:
```env
# Gmail OAuth2
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2/gmail/callback

# Microsoft Outlook OAuth2
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_MICROSOFT_TENANT_ID=common
REACT_APP_MICROSOFT_REDIRECT_URI=http://localhost:5173
```

### 3. Provider Setup

#### Gmail (2 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Gmail API
3. Create OAuth2 credentials → Copy Client ID/Secret
4. Add redirect URI: `http://localhost:5173/oauth2/gmail/callback`

#### Outlook (2 minutes)
1. Go to [Azure Portal](https://portal.azure.com/)
2. App registrations → New registration
3. Add permissions: `Mail.Read`, `User.Read`
4. Add redirect URI: `http://localhost:5173`

### 4. Test Connection
1. Start app: `npm run dev`
2. Go to Email Receipt Processor → Accounts tab
3. Click "Connect" on provider cards
4. Test in Security → Testing & Validation tab

## 🔧 Development Tips

### Enable Debug Mode
```javascript
localStorage.setItem('oauth2_debug', 'true');
```

### Test API Calls
```javascript
import { oauth2TestSuite } from './src/utils/oauth2Testing';
await oauth2TestSuite.runAllTests(['gmail', 'outlook']);
```

### Monitor Security
- Check Security tab for real-time monitoring
- Review token health and security events
- Export test results for debugging

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `invalid_client` | Check Client ID in `.env` |
| `redirect_uri_mismatch` | Verify redirect URI in provider console |
| `access_denied` | User denied permissions |
| CORS errors | Check origin configuration |

## 📱 Usage

```javascript
// Connect to Gmail
const result = await gmailOAuth2Service.signIn();

// Search receipts
const receipts = await gmailOAuth2Service.searchReceiptEmails({
  keywords: ['receipt', 'invoice'],
  maxResults: 50
});

// Connect to Outlook
const result = await outlookOAuth2Service.signInPopup();

// Get messages
const messages = await outlookOAuth2Service.getMessages();
```

## 🔐 Security Features

- ✅ OAuth2 with PKCE
- ✅ Automatic token refresh  
- ✅ CSRF protection
- ✅ Security monitoring
- ✅ Error boundaries
- ✅ Comprehensive testing

## 📚 Full Documentation

See [OAuth2_Setup_Guide.md](./OAuth2_Setup_Guide.md) for complete setup instructions.

---

*Need help? Check the Security tab → Testing & Validation for built-in diagnostics.*