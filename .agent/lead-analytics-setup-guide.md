# Lead Analytics - Quick Setup Guide

## ✅ What's Been Created

### 1. Redux Slice
- **File**: `src/store/slices/leadAnalytics.ts`
- **Purpose**: Manages analytics state and API calls
- **Actions**: 
  - `fetchLeadAnalytics` - Fetches analytics data
  - `setAnalyticsFilters` - Updates filter state
  - `resetAnalyticsFilters` - Resets filters to default

### 2. Analytics Component
- **File**: `src/pages/Lead/LeadAnalytics.tsx`
- **Features**:
  - Role-based access control (Staff vs Admin)
  - Date range filtering
  - Staff member filtering (admin only)
  - Visual metrics display
  - Top performers leaderboard

### 3. Store Integration
- **File**: `src/store/index.ts`
- **Change**: Added `leadAnalytics` reducer to store

## 🚀 Next Steps to Complete Integration

### Step 1: Add Route to Your Router

Find your router configuration file (likely `src/App.tsx` or `src/routes/index.tsx`) and add:

```tsx
import LeadAnalytics from "./pages/Lead/LeadAnalytics";

// In your routes configuration
<Route path="/lead/analytics" element={<LeadAnalytics />} />
```

### Step 2: Add Navigation Link

Add a link to your sidebar or navigation menu:

```tsx
import { BarChart3 } from "lucide-react";

// In your navigation
<NavLink to="/lead/analytics">
  <BarChart3 className="w-5 h-5" />
  <span>Lead Analytics</span>
</NavLink>
```

### Step 3: Verify Backend API

Ensure your backend has the analytics endpoint:

**Endpoint**: `GET /api/crm/leads/analytics`

**Query Parameters**:
- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string  
- `assignedTo` (optional) - Staff member ID

**Expected Response Structure**:
```json
{
  "totalLeads": 150,
  "newLeads": 45,
  "contactedLeads": 30,
  "assignedLeads": 25,
  "qualifiedLeads": 20,
  "convertedLeads": 15,
  "lostLeads": 15,
  "conversionRate": 10,
  "leadsBySource": [
    { "source": "website", "count": 50 },
    { "source": "facebook_lead_ads", "count": 100 }
  ],
  "leadsByStatus": [
    { "status": "new", "count": 45 },
    { "status": "converted", "count": 15 }
  ],
  "leadsByCallStatus": [
    { "callStatus": "interested", "count": 30 },
    { "callStatus": "not_interested", "count": 20 }
  ],
  "topPerformers": [
    {
      "staffId": "123",
      "staffName": "John Doe",
      "totalLeads": 50,
      "convertedLeads": 10,
      "conversionRate": 20
    }
  ]
}
```

## 🎯 How It Works

### For Staff Users
1. User logs in as staff
2. Navigates to Lead Analytics
3. Sees only their own analytics (automatically filtered)
4. Can select date range
5. Cannot change staff filter

### For Admin Users
1. User logs in as admin/superadmin
2. Navigates to Lead Analytics
3. Sees all leads by default
4. Can filter by:
   - Date range
   - Specific staff member
5. Can view Top Performers table
6. Can reset filters

## 📊 Metrics Displayed

### Summary Cards
- **Total Leads**: All leads in selected period
- **New Leads**: Leads with "new" status
- **Converted Leads**: Successfully converted
- **Conversion Rate**: Percentage converted

### Breakdown Sections
- **Leads by Status**: Distribution across 6 statuses
- **Leads by Source**: Grouped by acquisition channel
- **Leads by Call Status**: Call outcome distribution
- **Top Performers**: Staff leaderboard (admin only)

## 🔒 Security Features

✅ **Role-Based Access**
- Staff users automatically filtered to their own data
- Admin features hidden from staff users
- User role read from localStorage

✅ **Data Isolation**
- Staff can only see their assigned leads
- Admin can see all or filter by staff

## 🧪 Testing Checklist

- [ ] Route is accessible at `/lead/analytics`
- [ ] Staff user sees only their own data
- [ ] Admin user sees all data
- [ ] Admin can filter by staff member
- [ ] Date range filter works correctly
- [ ] Reset filters button works
- [ ] Loading state displays correctly
- [ ] Error handling works
- [ ] Dark mode displays correctly
- [ ] Responsive on mobile/tablet

## 🎨 Customization Options

### Change Default Date Range
In `LeadAnalytics.tsx`, modify the `useEffect` that sets initial dates:

```typescript
// Current: Defaults to current month
// Change to last 30 days, last 7 days, etc.
```

### Add More Metrics
Update the `LeadAnalytics` interface in `leadAnalytics.ts` to include additional fields.

### Customize Colors
Modify the Tailwind classes in the component for different color schemes.

## 📝 Example Usage

### Admin viewing all leads for November
```
Navigate to: /lead/analytics
Start Date: 2025-11-01
End Date: 2025-11-30
Staff Filter: All Staff
```

### Admin viewing specific staff performance
```
Navigate to: /lead/analytics
Start Date: 2025-11-01
End Date: 2025-11-30
Staff Filter: Select "Ananya"
```

### Staff viewing their own performance
```
Navigate to: /lead/analytics
Start Date: 2025-11-01
End Date: 2025-11-30
Staff Filter: (Locked to their own ID)
```

## 🐛 Troubleshooting

### Analytics not loading
- Check browser console for errors
- Verify API endpoint is correct
- Check network tab for failed requests
- Ensure user is logged in

### Staff filter not showing
- Verify user role is admin/superadmin
- Check localStorage for user data
- Ensure staff list is loaded

### Wrong data displayed
- Verify date range is correct
- Check if staff filter is applied
- Ensure backend returns correct data

## 📚 Related Documentation

- See `lead-analytics-documentation.md` for complete technical details
- See `assigned-to-enhancement-summary.md` for assignedTo field handling
- See `last-call-status-dropdown.md` for call status options
