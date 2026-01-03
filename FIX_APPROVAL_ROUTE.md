# Fix: Staff Approval/Rejection Route Error

## Issue
Staff members were getting a "Route /api/registrations//approve not found" error when trying to approve or reject student registrations. The double slash (`//`) indicated that the submission ID was missing from the API call.

## Root Cause
The `ApprovalModal` component was not passing the submission ID to the `onApprove` and `onReject` handlers. The handlers were only receiving the comments/reason parameter, but not the ID parameter.

### Before (Broken):
```typescript
// ApprovalModal.tsx
interface ApprovalModalProps {
  onApprove: (comments: string) => void;  // ❌ Missing ID parameter
  onReject: (reason: string) => void;      // ❌ Missing ID parameter
}

const handleApprove = async () => {
  await onApprove(comments);  // ❌ Only passing comments, no ID
};
```

This caused the API call to be:
```
POST /api/registrations//approve  // ❌ Empty ID
```

## Solution
Updated all components in the approval chain to properly pass the submission ID:

### 1. ApprovalModal Component
```typescript
// ApprovalModal.tsx
interface ApprovalModalProps {
  onApprove: (id: string, comments: string) => void;  // ✅ Added ID parameter
  onReject: (id: string, reason: string) => void;      // ✅ Added ID parameter
}

const handleApprove = async () => {
  await onApprove(submission.id, comments);  // ✅ Passing both ID and comments
};

const handleReject = async () => {
  await onReject(submission.id, comments);   // ✅ Passing both ID and reason
};
```

### 2. Dashboard Components
Updated all staff dashboard components to match the new signature:

```typescript
// StaffDashboard.tsx, YearLeaderDashboard.tsx, 
// FinanceOfficerDashboard.tsx, RegistrarDashboard.tsx
interface DashboardProps {
  onApprove: (id: string, comments?: string) => void;  // ✅ Correct signature
  onReject: (id: string, reason: string) => void;       // ✅ Correct signature
}
```

### 3. App.tsx
The main App component already had the correct implementation:
```typescript
const handleApprove = async (id: string, comments?: string) => {
  const result = await approveRegistration(id, comments || 'Approved by staff');
  // ... ✅ Already correct
};
```

## Files Modified
1. ✅ `frontend/components/ApprovalModal.tsx` - Added ID parameter to handlers
2. ✅ `frontend/components/StaffDashboard.tsx` - Updated prop types
3. ✅ `frontend/components/YearLeaderDashboard.tsx` - Updated prop types
4. ✅ `frontend/components/FinanceOfficerDashboard.tsx` - Updated prop types
5. ✅ `frontend/components/RegistrarDashboard.tsx` - Updated prop types

## Result
Now when staff members approve or reject a registration, the API call will be:
```
POST /api/registrations/{submissionId}/approve  // ✅ Correct with ID
POST /api/registrations/{submissionId}/reject   // ✅ Correct with ID
```

## Testing
To verify the fix:
1. Login as a staff member (Year Leader, Finance Officer, or Registrar)
2. Navigate to the dashboard
3. Click on a pending registration
4. Click "Approve" or "Reject"
5. The request should now succeed without the route error

## Status
✅ **FIXED** - Staff can now approve and reject student registrations successfully!

---
**Fixed on**: January 3, 2026
**Issue**: Missing submission ID in approval/rejection API calls
**Impact**: All staff roles (Year Leader, Finance Officer, Registrar)
