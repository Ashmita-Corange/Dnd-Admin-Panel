# Lead Analytics Feature - Complete Documentation

## Overview
A comprehensive analytics dashboard for tracking lead performance with role-based access control, filtering capabilities, and visual metrics display.

## Features

### 🎯 **Role-Based Access Control**

#### **For Staff Users**
- View only their own lead analytics
- Cannot change the staff filter (locked to their own ID)
- See personal performance metrics
- Track their own conversion rates

#### **For Admin/SuperAdmin Users**
- View analytics for all leads
- Filter by specific staff members
- See organization-wide metrics
- Access top performers leaderboard
- Compare staff performance

### 📊 **Key Metrics Displayed**

1. **Total Leads** - Overall count of leads in the selected period
2. **New Leads** - Leads with "new" status
3. **Converted Leads** - Successfully converted leads
4. **Conversion Rate** - Percentage of converted leads
5. **Status Breakdown** - Distribution across all lead statuses
6. **Source Analysis** - Leads grouped by source (website, Facebook, etc.)
7. **Call Status Breakdown** - Distribution of call outcomes
8. **Top Performers** - Staff leaderboard (admin only)

### 🔍 **Filtering Options**

#### **Date Range Filter**
- Start Date selector
- End Date selector
- Defaults to current month
- Can select any custom date range

#### **Staff Filter** (Admin Only)
- Searchable dropdown of all staff members
- Filter by specific staff member
- "All Staff" option to view organization-wide data
- Real-time search by name or email

### 📁 **Files Created**

1. **Redux Slice**: `src/store/slices/leadAnalytics.ts`
2. **Component**: `src/pages/Lead/LeadAnalytics.tsx`
3. **Store Integration**: Updated `src/store/index.ts`

## Implementation Details

### **Redux Slice Structure**

```typescript
interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  assignedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsByCallStatus: Array<{ callStatus: string; count: number }>;
  leadsByAssignedTo: Array<{
    assignedTo: string;
    assignedToName: string;
    count: number;
  }>;
  topPerformers: Array<{
    staffId: string;
    staffName: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
  }>;
}
```

### **API Integration**

The component makes API calls to:
```
GET /api/crm/leads/analytics
```

**Query Parameters:**
- `startDate` - ISO date string (YYYY-MM-DD)
- `endDate` - ISO date string (YYYY-MM-DD)
- `assignedTo` - Staff member ID (optional for admin, required for staff)

**Example API Calls:**

```bash
# Admin viewing all leads for November 2025
curl -X GET "http://localhost:3000/api/crm/leads/analytics?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Content-Type: application/json" \
  -H "x-tenant: bharat"

# Admin viewing specific staff member's leads
curl -X GET "http://localhost:3000/api/crm/leads/analytics?startDate=2025-11-01&endDate=2025-11-30&assignedTo=64cd18c4a76c95f4f37e2e90" \
  -H "Content-Type: application/json" \
  -H "x-tenant: bharat"

# Staff user (automatically filtered to their own ID)
curl -X GET "http://localhost:3000/api/crm/leads/analytics?assignedTo=64cd18c4a76c95f4f37e2e90" \
  -H "Content-Type: application/json" \
  -H "x-tenant: bharat"
```

### **User Role Detection**

The component reads user information from localStorage:

```typescript
const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
const userRole = userInfo?.role?.name?.toLowerCase() || "";
const userId = userInfo?._id || "";
const isSuperAdmin = userInfo?.isSuperAdmin || false;
const isAdmin = userRole === "admin" || isSuperAdmin;
```

## UI Components

### **Filter Section**
- Date range pickers (Start Date & End Date)
- Staff dropdown (admin only)
- Reset Filters button

### **Summary Cards**
Four prominent cards displaying:
1. Total Leads (with Users icon)
2. New Leads (with Activity icon)
3. Converted Leads (with CheckCircle icon)
4. Conversion Rate (with BarChart icon)

### **Status Breakdown Section**
Two side-by-side panels:
1. **Leads by Status** - Shows distribution across all 6 statuses
2. **Leads by Source** - Shows leads grouped by acquisition source

### **Call Status Breakdown**
Grid layout showing count of leads for each call status:
- Call Not Answered
- Number Not Reachable
- Interested
- Not Interested
- etc.

### **Top Performers Table** (Admin Only)
Leaderboard showing:
- Staff Member Name
- Total Leads
- Converted Leads
- Conversion Rate

## Usage Examples

### **For Staff Users**

1. Navigate to Lead Analytics page
2. Select desired date range
3. View personal performance metrics
4. Track conversion rate over time

### **For Admin Users**

1. Navigate to Lead Analytics page
2. Select date range (defaults to current month)
3. Optionally filter by specific staff member
4. View organization-wide or individual performance
5. Compare staff members using Top Performers table
6. Reset filters to return to defaults

## Styling & Design

- **Dark Mode Support** - Full dark mode compatibility
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Icon Integration** - Lucide React icons for visual clarity
- **Color Coding**:
  - Blue - Total/General metrics
  - Purple - New leads
  - Green - Converted/Success
  - Orange - Conversion rate
  - Red - Lost leads

## State Management

### **Local State**
- `startDate` - Selected start date
- `endDate` - Selected end date
- `selectedStaff` - Selected staff member ID
- `staffSearchTerm` - Search input for staff dropdown
- `isStaffDropdownOpen` - Dropdown visibility

### **Redux State**
- `analytics` - Analytics data from API
- `loading` - Loading state
- `error` - Error message if any
- `filters` - Applied filters

## Error Handling

- Displays error messages in red alert box
- Shows loading state while fetching data
- Handles API failures gracefully
- Validates user role before showing admin features

## Next Steps

To integrate this into your application:

1. **Add Route** - Add route to your router configuration:
   ```tsx
   import LeadAnalytics from "./pages/Lead/LeadAnalytics";
   
   // In your routes
   <Route path="/lead/analytics" element={<LeadAnalytics />} />
   ```

2. **Add Navigation Link** - Add link to sidebar/navigation:
   ```tsx
   <Link to="/lead/analytics">Lead Analytics</Link>
   ```

3. **Verify API Endpoint** - Ensure your backend has the `/api/crm/leads/analytics` endpoint

4. **Test Role-Based Access** - Test with both staff and admin users

## Benefits

✅ **Data-Driven Decisions** - Make informed decisions based on real metrics
✅ **Performance Tracking** - Monitor individual and team performance
✅ **Conversion Optimization** - Identify bottlenecks in the lead funnel
✅ **Source Analysis** - Understand which channels bring quality leads
✅ **Staff Accountability** - Track individual staff performance
✅ **Time-Based Insights** - Analyze trends over custom date ranges

## Security Considerations

- Staff users can only see their own data
- Admin role verification before showing sensitive data
- User ID from localStorage is validated server-side
- All API calls include tenant header for multi-tenancy
