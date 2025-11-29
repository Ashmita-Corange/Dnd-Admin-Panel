# Lead Analytics - Role-Based Access Configuration

## Role Detection Logic

The Lead Analytics component now uses **Role ID** instead of role name for determining access levels.

### Configuration

```typescript
// Staff role ID - if user has this role, they can only see their own analytics
const STAFF_ROLE_ID = "6892f49e5e1bb25c871bdd3c";

// User is admin if they are superadmin OR their role is NOT the staff role
const isAdmin = isSuperAdmin || (userRoleId !== STAFF_ROLE_ID && userRoleId !== "");
```

### How It Works

1. **User Info from localStorage**:
   ```json
   {
     "_id": "691323794070273ce91924f7",
     "name": "bharat",
     "email": "dhrumitpanchal789@gmail.com",
     "role": "6888d1dd50261784a38dd087",  // Role ID (not name)
     "isSuperAdmin": false
   }
   ```

2. **Access Determination**:
   - If `role === "6892f49e5e1bb25c871bdd3c"` → **Staff User**
     - Can only see their own analytics
     - `assignedTo` parameter is automatically set to their user ID
     - Staff filter dropdown is hidden
   
   - If `role !== "6892f49e5e1bb25c871bdd3c"` → **Admin User**
     - Can see all analytics
     - Can filter by specific staff member
     - Staff filter dropdown is visible
   
   - If `isSuperAdmin === true` → **SuperAdmin**
     - Always has admin access regardless of role ID

### API Calls Based on Role

#### Staff User (role = "6892f49e5e1bb25c871bdd3c")
```bash
# Automatically filtered to their own ID
GET /api/crm/leads/analytics?startDate=2025-11-01&endDate=2025-11-30&assignedTo=691323794070273ce91924f7
```

#### Admin User (role ≠ "6892f49e5e1bb25c871bdd3c")
```bash
# Without staff filter - shows all leads
GET /api/crm/leads/analytics?startDate=2025-11-01&endDate=2025-11-30

# With staff filter - shows specific staff's leads
GET /api/crm/leads/analytics?startDate=2025-11-01&endDate=2025-11-30&assignedTo=STAFF_ID
```

### Example Scenarios

#### Scenario 1: Staff User Login
```json
// localStorage user object
{
  "_id": "691323794070273ce91924f7",
  "role": "6892f49e5e1bb25c871bdd3c",  // Staff role
  "isSuperAdmin": false
}
```
**Result**: 
- ✅ Can only see their own analytics
- ❌ Cannot change staff filter
- 📊 API called with `assignedTo=691323794070273ce91924f7`

#### Scenario 2: Admin User Login
```json
// localStorage user object
{
  "_id": "691323794070273ce91924f7",
  "role": "6888d1dd50261784a38dd087",  // Different role (Admin)
  "isSuperAdmin": false
}
```
**Result**:
- ✅ Can see all analytics
- ✅ Can filter by staff member
- 📊 API called without `assignedTo` (shows all) or with selected staff ID

#### Scenario 3: SuperAdmin Login
```json
// localStorage user object
{
  "_id": "691323794070273ce91924f7",
  "role": "6892f49e5e1bb25c871bdd3c",  // Even if staff role
  "isSuperAdmin": true  // SuperAdmin flag
}
```
**Result**:
- ✅ Can see all analytics (superadmin overrides role)
- ✅ Can filter by staff member
- 📊 API called without `assignedTo` or with selected staff ID

### Customization

To change the staff role ID, update the constant in `LeadAnalytics.tsx`:

```typescript
// Change this to your staff role ID
const STAFF_ROLE_ID = "YOUR_STAFF_ROLE_ID_HERE";
```

### Security Notes

⚠️ **Important**: This is frontend-only access control. The backend API should also validate:
1. User's role from the authentication token
2. Ensure staff users can only query their own data
3. Verify admin users have proper permissions

### Testing Checklist

- [ ] Staff user (role = `6892f49e5e1bb25c871bdd3c`) sees only their data
- [ ] Staff user cannot see staff filter dropdown
- [ ] Admin user (role ≠ `6892f49e5e1bb25c871bdd3c`) sees all data
- [ ] Admin user can filter by staff member
- [ ] SuperAdmin always has admin access
- [ ] API calls include correct `assignedTo` parameter
- [ ] Date filters work for both staff and admin
- [ ] Reset filters works correctly for both roles
