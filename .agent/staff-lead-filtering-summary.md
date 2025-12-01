# Lead Filtering by Staff Role - Implementation Summary

## Overview
Implemented automatic lead filtering for staff users based on their role ID. When a user has the staff role (`STAFF_ROLE_ID = "6892f49e5e1bb25c871bdd3c"`), the system now automatically filters leads to show only those assigned to that specific user.

## Changes Made

### 1. LeadList.tsx (`src/pages/Lead/LeadList.tsx`)

#### Added User Role Detection
```typescript
// Get user info from localStorage
const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
const userRoleId = userInfo?.role || "";
const userId = userInfo?._id || "";
const isSuperAdmin = userInfo?.isSuperAdmin || false;

// Staff role ID
const STAFF_ROLE_ID = "6892f49e5e1bb25c871bdd3c";

// User is staff if their role matches the staff role ID
const isStaff = userRoleId === STAFF_ROLE_ID && !isSuperAdmin;
```

#### Updated All fetchLeads Calls
All instances of `fetchLeads` dispatch now include the `assignedTo` filter when the user is staff:

1. **Initial fetch (useEffect)**:
```typescript
const activeFilters = {
  isDeleted: false,
  ...(localFilters.status ? { status: localFilters.status } : {}),
  // If user is staff, automatically filter by their assigned leads
  ...(isStaff && userId ? { assignedTo: userId } : {}),
};
```

2. **Page change handler** - Added assignedTo filter
3. **Limit change handler** - Added assignedTo filter
4. **After delete refresh** - Added assignedTo filter
5. **After assignment refresh** - Added assignedTo filter

## How It Works

1. **On Component Mount**: The component reads user information from localStorage
2. **Role Check**: Determines if the user is a staff member by comparing their role ID with `STAFF_ROLE_ID`
3. **Automatic Filtering**: If the user is staff:
   - All lead fetch requests automatically include `assignedTo: userId` in the filters
   - Staff users only see leads assigned to them
   - Admin and SuperAdmin users see all leads (no automatic filtering)

## Backend Integration

The implementation leverages the existing backend API filter parameter:
- **Filter Parameter**: `assignedTo` (user ID)
- **API Endpoint**: `/crm/leads?assignedTo={userId}`
- The backend already supports this filter, so no backend changes are required

## User Experience

### For Staff Users:
- ✅ Automatically see only their assigned leads
- ✅ Cannot see leads assigned to other staff members
- ✅ All pagination, search, and status filters work correctly with their assigned leads
- ✅ Seamless experience - no manual filter selection needed

### For Admin/SuperAdmin Users:
- ✅ See all leads (no automatic filtering)
- ✅ Can still use the staff filter dropdown to view specific staff member's leads
- ✅ Full access to all lead management features

## Testing Checklist

- [ ] Login as a staff user (role ID: `6892f49e5e1bb25c871bdd3c`)
- [ ] Verify only assigned leads are displayed
- [ ] Test pagination with staff user
- [ ] Test search functionality with staff user
- [ ] Test status filters with staff user
- [ ] Login as admin/superadmin
- [ ] Verify all leads are displayed
- [ ] Test manual staff filter selection as admin

## Notes

- The `isStaff` check excludes superadmins even if they have the staff role ID
- The filter is applied consistently across all lead fetch operations
- The implementation is backward compatible - existing admin functionality remains unchanged
