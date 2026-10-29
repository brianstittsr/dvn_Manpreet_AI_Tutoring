# Alignable Integration Documentation

## Overview

Alignable integration allows AICenter4U to connect with the Alignable business networking platform, enabling:

- **Business Profile Sync** - Manage your Alignable presence
- **Content Exchange** - Post updates and engage with your network
- **Connection Management** - Build and manage business relationships
- **Recommendation System** - Give and receive business reviews
- **Direct Messaging** - Communicate with other businesses
- **Analytics** - Track network growth and engagement

---

## Setup Instructions

### 1. Get Alignable API Credentials

1. Visit [Alignable Developer Portal](https://developers.alignable.com)
2. Create a developer account or sign in
3. Create a new app/integration
4. Generate an API key or OAuth credentials

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Alignable API Configuration
ALIGNABLE_API_KEY=your_api_key_here
ALIGNABLE_ACCESS_TOKEN=your_oauth_token_here  # Optional, for full access
```

**Note:** The API key provides limited access. For full functionality including posting and messaging, an OAuth access token is required.

### 3. Access the Admin Panel

1. Log in to your admin portal
2. Navigate to **Admin** → **Alignable**
3. Enter your credentials and click **Connect**

---

## Available API Actions

### Connection & Profile
- `test_connection` - Verify API credentials
- `get_profile` - Fetch business profile
- `get_connections` - List your network
- `search_businesses` - Find businesses
- `request_connection` - Send connection requests

### Content Management
- `get_posts` - Fetch posts from feed
- `create_post` - Publish new content
- `get_recommendations` - View reviews
- `create_recommendation` - Write recommendations

### Communication
- `get_messages` - Read private messages
- `send_message` - Send direct messages
- `get_notifications` - Check alerts and mentions

### Analytics
- `get_analytics` - View network statistics

---

## Admin Panel Features

### Overview Tab
- Quick search for businesses
- Quick post creation
- Feature overview

### Connections Tab
- View your network
- Manage connections
- Filter and sort

### Content Tab
- Create and manage posts
- View post engagement
- Schedule content

### Recommendations Tab
- Reviews received
- Write recommendations
- Track recommendation stats

### Settings Tab
- Auto-sync configuration
- Cross-posting settings
- Integration controls
- Disconnect option

---

## Future Features (Planned)

### Lead Generation
- Capture leads from profile visitors
- Sync with CRM
- Track lead sources

### Event Integration
- Sync Alignable events with calendar
- RSVP management
- Event promotion

### Automation
- Auto-recommendation requests
- Welcome messages
- Follow-up sequences

### Analytics Dashboard
- Network growth tracking
- Engagement metrics
- Competitor insights

### Website Widgets
- Embed recommendations on site
- Live connection count
- Social proof display

---

## API Rate Limits

Alignable API has the following rate limits:

- **Read operations**: 1000 requests/hour
- **Write operations**: 100 requests/hour
- **Search**: 500 requests/hour

The integration includes automatic rate limiting to prevent exceeding these limits.

---

## Troubleshooting

### Connection Issues
1. Verify API key is correct
2. Check if key has required permissions
3. Ensure account is in good standing

### Posting Failures
1. Content must be 2000 characters or less
2. Check rate limits
3. Verify OAuth token for write access

### Missing Data
1. Some data requires OAuth (not just API key)
2. Check privacy settings on Alignable
3. Verify connections are mutual

---

## Best Practices

### Content Strategy
- Post 2-3 times per week for optimal engagement
- Use industry-specific hashtags
- Respond to comments within 24 hours
- Share success stories and client wins

### Networking
- Personalize connection requests
- Engage with others' content before connecting
- Give recommendations to receive them
- Join local business groups

### Integration
- Enable auto-sync for real-time updates
- Cross-post valuable content from your site
- Track which content performs best
- Use analytics to optimize posting times

---

## Technical Details

### API Endpoint
```
POST /api/alignable
```

### Request Format
```json
{
  "action": "get_profile",
  "apiKey": "your_api_key",
  "accessToken": "your_oauth_token",
  "searchParams": { "page": 1, "per_page": 25 },
  "data": { "content": "Post content here" }
}
```

### Response Format
```json
{
  "id": "business_id",
  "business_name": "AICenter4U",
  "connection_count": 150,
  "recommendation_count": 24
}
```

---

## Support

For Alignable API support:
- [Alignable Developer Docs](https://developers.alignable.com)
- [API Status](https://status.alignable.com)
- Developer Support: dev-support@alignable.com

For integration issues with this platform:
- Contact your system administrator
- Check the admin panel logs
- Review browser console for errors

---

## Security Notes

- API keys are stored encrypted in the database
- Credentials are never exposed to the frontend
- OAuth tokens expire and need refresh
- All API calls are server-side only
- Use HTTPS in production environments
