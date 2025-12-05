# Meta Integration Settings - API Documentation

## Overview
This document provides information on how to configure Meta (Facebook) integration settings for your admin panel using the Settings API.

## API Endpoint
```
PUT http://localhost:3000/api/settings
```

## Headers
```
Content-Type: application/json
Authorization: Bearer <your_token_here> (if authentication is required)
```

## Meta Integration Fields

The following fields are available for Meta integration configuration:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `adAccountId` | string | Yes | Your Meta Ad Account ID (format: `act_YOUR_AD_ACCOUNT_ID`) |
| `pixelId` | string | Yes | Your Meta Pixel ID for tracking |
| `pageId` | string | Yes | Your Facebook Page ID |
| `accessToken` | string | Yes | Your Meta API Access Token |
| `appId` | string | Yes | Your Meta App ID (e.g., "4186118171673613") |
| `appSecret` | string | Yes | Your Meta App Secret |
| `isConnected` | boolean | No | Connection status (default: false) |
| `connectedAt` | string | No | ISO 8601 timestamp of connection (auto-generated) |

## Example cURL Command

### Update Meta Integration Settings

```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "metaIntegration": {
      "adAccountId": "act_YOUR_AD_ACCOUNT_ID",
      "pixelId": "YOUR_PIXEL_ID",
      "pageId": "YOUR_PAGE_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "appId": "4186118171673613",
      "appSecret": "YOUR_APP_SECRET",
      "isConnected": true,
      "connectedAt": "2025-12-05T13:49:44+05:30"
    }
  }'
```

### Update All Settings (Including E-commerce and Meta)

```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "codLimit": 5000,
    "freeShippingThreshold": 499,
    "codShippingChargeBelowThreshold": 50,
    "prepaidShippingChargeBelowThreshold": 40,
    "repeatOrderRestrictionDays": 7,
    "codOtpRequired": true,
    "codDisableForHighRTO": true,
    "codBlockOnRTOAddress": true,
    "highRTOOrderCount": 3,
    "metaIntegration": {
      "adAccountId": "act_YOUR_AD_ACCOUNT_ID",
      "pixelId": "YOUR_PIXEL_ID",
      "pageId": "YOUR_PAGE_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "appId": "4186118171673613",
      "appSecret": "YOUR_APP_SECRET",
      "isConnected": true,
      "connectedAt": "2025-12-05T13:49:44+05:30"
    }
  }'
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "codLimit": 5000,
    "freeShippingThreshold": 499,
    "codShippingChargeBelowThreshold": 50,
    "prepaidShippingChargeBelowThreshold": 40,
    "repeatOrderRestrictionDays": 7,
    "codOtpRequired": true,
    "codDisableForHighRTO": true,
    "codBlockOnRTOAddress": true,
    "highRTOOrderCount": 3,
    "metaIntegration": {
      "adAccountId": "act_1234567890",
      "pixelId": "1234567890123456",
      "pageId": "1234567890",
      "accessToken": "EAAG...",
      "appId": "4186118171673613",
      "appSecret": "abc123...",
      "isConnected": true,
      "connectedAt": "2025-12-05T13:49:44+05:30"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation error message here"
}
```

## Using the Admin Panel UI

You can also configure Meta integration through the admin panel:

1. Navigate to **Settings** in the sidebar
2. Click on the **Meta Integration** tab
3. Fill in your Meta credentials:
   - Ad Account ID
   - Pixel ID
   - Page ID
   - Access Token
   - App ID
   - App Secret
4. Check the **Connection Status** checkbox to enable the integration
5. Click **Save Settings**

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit sensitive credentials** to version control
2. Store `accessToken` and `appSecret` securely in environment variables
3. Use HTTPS in production environments
4. Rotate access tokens regularly
5. Apply appropriate API rate limiting
6. Implement proper authentication and authorization for the settings endpoint

## Getting Meta Credentials

To obtain your Meta credentials:

1. **App ID & App Secret**: Create an app at [Meta for Developers](https://developers.facebook.com/)
2. **Access Token**: Generate a long-lived access token through the Meta Graph API Explorer
3. **Ad Account ID**: Found in your Meta Ads Manager (format: `act_123456789`)
4. **Pixel ID**: Found in your Meta Events Manager
5. **Page ID**: Found in your Facebook Page settings

## Troubleshooting

### Common Issues

1. **Invalid Access Token**
   - Ensure your token hasn't expired
   - Verify the token has the required permissions

2. **Invalid Ad Account ID**
   - Make sure the format includes the `act_` prefix
   - Verify you have access to the ad account

3. **Connection Failed**
   - Check that all credentials are correct
   - Verify your app has the necessary permissions
   - Ensure your IP isn't blocked by Meta

## Related Documentation

- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Meta Pixel](https://developers.facebook.com/docs/meta-pixel)
