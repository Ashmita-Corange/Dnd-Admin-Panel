# CSV Upload Integration for Manual Orders

This document describes the CSV upload functionality integrated into the OrderList component to allow manual order uploads.

## API Endpoint
- **URL**: `http://localhost:3000/api/orders/upload-manual`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Field Name**: `excelFile`

## Implementation Details

### 1. **Component Updates** (`src/pages/Orders/OrderList.tsx`)

#### Added Imports:
- `Upload` icon from lucide-react
- `useRef` hook from React

#### New States:
```typescript
const [uploading, setUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

#### New Functions:

##### `handleFileChange(e: React.ChangeEvent<HTMLInputElement>)`
- Validates file type (accepts `.csv`, `.xlsx`, `.xls`)
- Triggers file upload if validation passes
- Shows error popup for invalid file types

##### `handleCsvUpload(file: File)`
- Creates FormData with the selected file
- Sends POST request to `/api/orders/upload-manual`
- Handles success/error responses with popup notifications
- Refreshes the orders list on successful upload
- Resets file input after completion

### 2. **UI Components**

#### Upload Button:
```tsx
<button
  onClick={() => fileInputRef.current?.click()}
  disabled={uploading}
  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  <Upload className="h-4 w-4" />
  {uploading ? "Uploading..." : "Upload CSV"}
</button>
```

#### Hidden File Input:
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept=".csv,.xlsx,.xls"
  onChange={handleFileChange}
  className="hidden"
/>
```

## Features

1. **File Validation**: Only accepts CSV and Excel files (.csv, .xlsx, .xls)
2. **Loading State**: Button shows "Uploading..." during upload process
3. **Error Handling**: Displays error messages via popup alerts
4. **Success Feedback**: Shows success message and auto-refreshes order list
5. **Auto-refresh**: Orders list is automatically refreshed after successful upload
6. **Input Reset**: File input is cleared after each upload attempt

## Usage

1. Click the "Upload CSV" button in the OrderList header
2. Select a valid CSV or Excel file from your system
3. The file will be automatically uploaded to the API
4. A success/error popup will appear
5. On success, the orders list will refresh to show new orders

## Success Response Handling

When the upload is successful:
- Shows success popup with the message from API response
- Refreshes the orders list maintaining current filters
- Clears the file input for next upload

## Error Handling

The component handles:
- Invalid file types (shows error popup)
- API errors (shows error message from response)
- Network errors (shows generic error message)
- All errors are logged to console for debugging

## Bug Fixes

Fixed lint error: Changed `order.total` to `order.totalAmount` to match the Order interface definition in the Redux store.

## Example cURL Command

```bash
curl --location 'http://localhost:3000/api/orders/upload-manual' \
--form 'excelFile=@"/D:/nexprism/Dnd-Ecommerce/manual_orders_complete_sample.csv"'
```

## Expected API Response Format

### Success:
```json
{
  "success": true,
  "message": "Orders uploaded successfully",
  "data": {
    "ordersCreated": 10,
    "details": [...]
  }
}
```

### Error:
```json
{
  "success": false,
  "message": "Error message here"
}
```
