# Staff Account Deletion Feature

## Overview
Added the ability for System Administrators to delete staff accounts (Registrar, Finance Officer, and Year Leader) from the system.

## Implementation Details

### Backend Changes

#### 1. Controller (`admin.controller.ts`)
**New Function**: `deleteStaffAccount`

**Features**:
- ✅ System Admin only access
- ✅ Validates user is a staff member (not student or system admin)
- ✅ Deletes from both local database and Supabase Auth
- ✅ Handles related data cleanup:
  - Deletes notifications
  - Nullifies approval logs (preserves audit trail)
  - Nullifies audit log references
  - Creates deletion audit log entry
- ✅ Complete error handling

**Restrictions**:
- Can only delete: Registrar, Finance Officer, Year Leader
- Cannot delete: Students (use Registrar function) or System Admins
- Requires System Admin role

#### 2. Routes (`admin.routes.ts`)
**New Route**: `DELETE /api/admin/staff/:email`
- Protected by authentication middleware
- Restricted to System Admin role
- Email parameter URL-encoded

### Frontend Changes

#### 1. Service (`admin.service.ts`)
**New Function**: `deleteStaffAccount(email: string)`
- Calls DELETE endpoint with encoded email
- Returns success/error response

#### 2. Dashboard (`SystemAdminDashboard.tsx`)
**New Features**:
- ✅ Delete button in "All Staff Members" modal
- ✅ Confirmation dialog with detailed warning
- ✅ Automatic refresh after deletion
- ✅ Stats update after deletion
- ✅ Error handling with user feedback

**UI Changes**:
- Added "Actions" column to staff table
- Red delete button for each staff member
- Confirmation prompt before deletion
- Success/error alerts

## User Flow

1. **System Admin** clicks on "Total Staffs" stat card
2. Modal opens showing all staff members
3. Each staff row has a red "Delete" button
4. Clicking "Delete" shows confirmation dialog:
   ```
   Are you sure you want to delete the staff account for [Name]?

   This action cannot be undone and will:
   - Remove the account from the system
   - Delete all associated data
   - Remove access to the portal

   Email: [email]
   ```
5. Upon confirmation:
   - Account deleted from database
   - Account deleted from Supabase Auth
   - Audit log created
   - Modal refreshes to show updated list
   - Stats updated
   - Success message displayed

## Security Features

✅ **Role-Based Access**: Only System Admin can delete staff  
✅ **Confirmation Required**: Double confirmation before deletion  
✅ **Audit Trail**: Deletion logged in audit system  
✅ **Data Integrity**: Related data properly handled  
✅ **Cannot Delete**:
- Student accounts (must use Registrar function)
- System Admin accounts (protected)
- Non-existent accounts

## Data Cleanup

When a staff account is deleted:

1. **Notifications**: Deleted completely
2. **Approval Logs**: User ID set to null (preserves history)
3. **Audit Logs**: Performer/target IDs set to null (preserves history)
4. **New Audit Log**: Created to record the deletion
5. **User Record**: Deleted from database
6. **Supabase Auth**: User deleted from authentication system

## Files Modified

### Backend
1. `backend/src/controllers/admin.controller.ts` - Added deleteStaffAccount function
2. `backend/src/routes/admin.routes.ts` - Added DELETE route

### Frontend
3. `frontend/services/admin.service.ts` - Added deleteStaffAccount service
4. `frontend/components/SystemAdminDashboard.tsx` - Added delete UI and handler

## API Endpoint

```
DELETE /api/admin/staff/:email
```

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Parameters**:
- `email` (URL parameter): Staff member's email address (URL-encoded)

**Response Success** (200):
```json
{
  "success": true,
  "message": "Staff account for [Name] deleted successfully"
}
```

**Response Error** (400/403/404):
```json
{
  "error": "Error message"
}
```

## Testing

### Test Cases
1. ✅ System Admin can delete Registrar account
2. ✅ System Admin can delete Finance Officer account
3. ✅ System Admin can delete Year Leader account
4. ✅ Cannot delete Student account (error message)
5. ✅ Cannot delete System Admin account (error message)
6. ✅ Non-admin cannot access endpoint (403)
7. ✅ Deleting non-existent account returns 404
8. ✅ Audit log created on deletion
9. ✅ Related data properly cleaned up
10. ✅ UI refreshes after deletion

## Usage

1. Login as System Admin
2. Navigate to System Admin Dashboard
3. Click on "Total Staffs" stat card
4. Find the staff member to delete
5. Click the red "Delete" button
6. Confirm the deletion
7. Account is removed from the system

## Benefits

✅ **Clean Up**: Remove accidentally created staff accounts  
✅ **Security**: Remove access for former staff members  
✅ **Data Management**: Keep user database clean  
✅ **Audit Trail**: All deletions are logged  
✅ **User-Friendly**: Simple, clear interface  

## Notes

- **Cannot be undone**: Deletion is permanent
- **Audit trail preserved**: Historical records maintained with null user IDs
- **System Admin protected**: Cannot delete System Admin accounts
- **Students separate**: Student deletion handled by Registrar function

---

**Feature Status**: ✅ COMPLETE  
**Production Ready**: YES  
**Date Added**: January 3, 2026
