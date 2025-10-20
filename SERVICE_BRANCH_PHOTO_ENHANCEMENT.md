# Service Management Enhancement: Branch & Photo Support

**Date**: October 20, 2025  
**Feature**: Added branch selection and photo upload to service management system

---

## Overview

Enhanced the service management system in the Admin Dashboard to support:
1. **Branch Association**: Services can now be linked to specific branches
2. **Photo Upload**: Services can have images (similar to room types)
3. **Description Field**: Added description support for detailed service information

---

## Database Changes

### Migration File
Location: `backend/database_migrations/add_branch_photo_to_service_types.sql`

### Schema Updates to `service_types` Table

```sql
-- Add branch_id column
ALTER TABLE service_types 
ADD COLUMN branch_id CHAR(36) NULL AFTER service_type_id,
ADD CONSTRAINT fk_service_type_branch 
FOREIGN KEY (branch_id) REFERENCES branch(branch_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add photo column
ALTER TABLE service_types 
ADD COLUMN photo LONGBLOB NULL AFTER description;

-- Add indexes for performance
CREATE INDEX idx_service_type_branch ON service_types(branch_id);
CREATE INDEX idx_service_type_branch_active ON service_types(branch_id, is_active);
```

### Updated Table Structure

| Column | Type | Attributes | Description |
|--------|------|------------|-------------|
| service_type_id | CHAR(36) | PK | UUID primary key |
| service_name | VARCHAR(100) | NOT NULL | Service name |
| category | VARCHAR(50) | NOT NULL | Service category |
| price | DECIMAL(10,2) | NOT NULL | Service price |
| branch_id | CHAR(36) | NULL, FK | Branch association (NULL = all branches) |
| photo | LONGBLOB | NULL | Base64 encoded image |
| description | TEXT | NULL | Service description |
| is_active | BOOLEAN | DEFAULT 1 | Active status |
| created_at | TIMESTAMP | AUTO | Creation timestamp |
| updated_at | TIMESTAMP | AUTO ON UPDATE | Update timestamp |

---

## Backend Changes

### File: `backend/src/controllers/serviceCatalogueController.ts`

#### 1. Updated Interface

```typescript
interface ServiceCatalogue extends RowDataPacket {
  service_type_id: string;
  service_name: string;
  category: string;
  price: number;
  branch_id: string | null;
  photo: Buffer | null;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### 2. Enhanced `createService` Function

**New Parameters**:
- `branch_id`: Optional branch association
- `photo`: Optional base64 encoded image
- `description`: Optional service description

**Key Features**:
- Validates branch_id exists in database
- Checks for duplicate service names within same branch
- Stores photo as LONGBLOB
- Returns photo as base64 string in response

```typescript
const { service_name, category, price, branch_id, photo, description, is_active } = req.body;

// Validate branch_id if provided
if (branch_id) {
  const [branches] = await connection.query<RowDataPacket[]>(
    'SELECT branch_id FROM branch WHERE branch_id = ?',
    [branch_id]
  );
  if (branches.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid branch_id provided.'
    });
    return;
  }
}

// Insert with new fields
INSERT INTO service_types 
(service_name, category, price, branch_id, photo, description, is_active) 
VALUES (?, ?, ?, ?, ?, ?, ?)
```

#### 3. Enhanced `getServices` Function

**New Features**:
- Joins with `branch` table to get branch name
- Filters by branch_id (includes NULL for global services)
- Returns photo as base64 string
- Returns branch_name or "All Branches"

```typescript
let query = `SELECT st.*, b.branch_name 
             FROM service_types st 
             LEFT JOIN branch b ON st.branch_id = b.branch_id 
             WHERE 1=1`;

// Filter by branch (includes global services)
if (branch_id) {
  query += ' AND (st.branch_id = ? OR st.branch_id IS NULL)';
  params.push(branch_id);
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "service_type_id": "uuid",
        "service_name": "Room Service",
        "category": "Dining",
        "price": 25.00,
        "branch_id": "branch-uuid",
        "branch_name": "Downtown Branch",
        "photo": "data:image/jpeg;base64,...",
        "description": "24/7 in-room dining service",
        "is_active": true,
        "created_at": "2025-10-20T...",
        "updated_at": "2025-10-20T..."
      }
    ],
    "count": 1
  }
}
```

---

## Frontend Changes

### File: `frontend/src/components/AdminDashboard.js`

#### 1. Updated State Management

```javascript
const [serviceFormData, setServiceFormData] = useState({
  service_name: '',
  category: '',
  price: '',
  branch_id: '',        // NEW
  photo: '',            // NEW
  description: '',      // NEW (moved from optional to included)
  is_active: true
});

// NEW states for photo handling
const [serviceIsDragging, setServiceIsDragging] = useState(false);
const [servicePhotoPreview, setServicePhotoPreview] = useState(null);
```

#### 2. New Image Handling Functions

```javascript
// Process uploaded image file
const processServiceImageFile = (file) => {
  // Validates file type (JPEG, PNG, GIF, WebP)
  // Validates file size (max 5MB)
  // Converts to base64
  // Sets preview and form data
};

// Drag and drop handlers
const handleServiceDragOver = (e) => { /* ... */ };
const handleServiceDragLeave = (e) => { /* ... */ };
const handleServiceDrop = (e) => { /* ... */ };

// Remove photo
const handleRemoveServicePhoto = () => {
  setServicePhotoPreview(null);
  setServiceFormData(prev => ({ ...prev, photo: '' }));
};
```

#### 3. Enhanced Form Validation

```javascript
const validateServiceForm = () => {
  const errors = {};
  
  if (!serviceFormData.service_name?.trim()) {
    errors.service_name = 'Service name is required';
  }
  
  if (!serviceFormData.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!serviceFormData.branch_id?.trim()) {
    errors.branch_id = 'Branch selection is required';  // NEW
  }
  
  if (!serviceFormData.price || serviceFormData.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  return errors;
};
```

#### 4. Updated Services Table

**New Columns**:
- Photo (thumbnail)
- Branch name

```jsx
<table className="w-full">
  <thead>
    <tr>
      <th>Photo</th>           {/* NEW */}
      <th>Service Name</th>
      <th>Category</th>
      <th>Branch</th>           {/* NEW */}
      <th>Price</th>
      <th>Status</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    {services.map((service) => (
      <tr key={service.service_type_id}>
        <td>
          {service.photo ? (
            <img 
              src={service.photo} 
              alt={service.service_name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </td>
        <td>{service.service_name}</td>
        <td>{service.category}</td>
        <td>{service.branch_name || 'All Branches'}</td>
        <td>${Number(service.price).toFixed(2)}</td>
        <td>
          <span className={service.is_active ? 'badge-active' : 'badge-inactive'}>
            {service.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>{service.description || '-'}</td>
      </tr>
    ))}
  </tbody>
</table>
```

#### 5. Enhanced Add Service Modal

**New Form Fields**:

1. **Branch Selection**:
```jsx
<div>
  <label>Branch *</label>
  <select
    name="branch_id"
    value={serviceFormData.branch_id}
    onChange={handleServiceInputChange}
    className={serviceFormErrors.branch_id ? 'border-red-500' : 'border-gray-300'}
  >
    <option value="">Select Branch</option>
    {branches.map(branch => (
      <option key={branch.branch_id} value={branch.branch_id}>
        {branch.branch_name}
      </option>
    ))}
  </select>
  {serviceFormErrors.branch_id && (
    <p className="text-red-500 text-xs">{serviceFormErrors.branch_id}</p>
  )}
  <p className="text-xs text-gray-500">Select the branch where this service is available</p>
</div>
```

2. **Photo Upload**:
```jsx
<div>
  <label>Service Photo</label>
  
  {!servicePhotoPreview ? (
    <div
      onDragOver={handleServiceDragOver}
      onDragLeave={handleServiceDragLeave}
      onDrop={handleServiceDrop}
      className="border-2 border-dashed rounded-lg p-6 text-center"
    >
      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p>Drag and drop an image here, or</p>
      <label>
        <span className="px-4 py-2 bg-white border rounded-lg cursor-pointer">
          Choose File
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => processServiceImageFile(e.target.files[0])}
          className="hidden"
        />
      </label>
      <p className="text-xs text-gray-500">PNG, JPG, GIF or WebP (Max 5MB)</p>
    </div>
  ) : (
    <div className="relative inline-block">
      <img
        src={servicePhotoPreview}
        alt="Service preview"
        className="w-full h-48 object-cover rounded-lg"
      />
      <button
        type="button"
        onClick={handleRemoveServicePhoto}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )}
  
  {serviceFormErrors.photo && (
    <p className="text-red-500 text-xs">{serviceFormErrors.photo}</p>
  )}
</div>
```

---

## Frontend Service File

### File: `frontend/src/services/serviceCatalogueService.js`

**Updated Response Handling**:
```javascript
getAllServices: async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/services?${params.toString()}`);
    return {
      success: response.data.success,
      services: response.data.data?.services || [],  // Fixed data path
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      services: [],  // Always return empty array on error
      message: error.response?.data?.message || 'Failed to fetch services',
      error,
    };
  }
}
```

---

## Usage Workflow

### Adding a New Service

1. **Navigate to Services Tab**
   - Click on "Services" in Admin Dashboard navigation

2. **Click "Add Service" Button**
   - Opens Add Service Modal

3. **Fill Service Details**:
   - **Service Name**: Required (e.g., "Spa Massage")
   - **Category**: Required dropdown (Room Service, Spa, Laundry, Transport, Dining, Other)
   - **Branch**: Required dropdown (select from available branches)
   - **Price**: Required (e.g., 75.00)
   - **Description**: Optional (e.g., "Relaxing 60-minute full body massage")
   - **Photo**: Optional (drag & drop or choose file)
   - **Is Active**: Checkbox (checked by default)

4. **Upload Photo** (Optional):
   - Drag and drop image onto upload area, OR
   - Click "Choose File" and select from file system
   - Supported formats: JPEG, PNG, GIF, WebP
   - Max size: 5MB
   - Preview appears after upload
   - Click X button to remove and re-upload

5. **Submit Form**:
   - Click "Add Service" button
   - Validation checks all required fields
   - Service created in database
   - Success message displayed
   - Modal closes automatically
   - Services table refreshes

### Viewing Services

Services table displays:
- **Photo**: Thumbnail (12x12) or placeholder icon
- **Service Name**: Full service name
- **Category**: Badge with category
- **Branch**: Branch name or "All Branches"
- **Price**: Formatted as $XX.XX
- **Status**: Active (green) or Inactive (gray) badge
- **Description**: Truncated text (hover for full)

### Search/Filter Services

Search bar filters by:
- Service name (case-insensitive)
- Category (case-insensitive)

---

## API Endpoints

### Create Service
```
POST /api/services
Authorization: Bearer <admin_token>

Request Body:
{
  "service_name": "Room Service",
  "category": "Dining",
  "price": 25.00,
  "branch_id": "uuid-branch-id",
  "photo": "data:image/jpeg;base64,...",
  "description": "24/7 in-room dining",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Service added to catalogue successfully.",
  "data": {
    "service": {
      "service_type_id": "uuid",
      "service_name": "Room Service",
      "category": "Dining",
      "price": 25.00,
      "branch_id": "uuid-branch-id",
      "photo": "data:image/jpeg;base64,...",
      "description": "24/7 in-room dining",
      "is_active": true,
      "created_at": "2025-10-20T...",
      "updated_at": "2025-10-20T..."
    }
  }
}
```

### Get All Services
```
GET /api/services?category=Spa&is_active=true&branch_id=uuid
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Services retrieved successfully.",
  "data": {
    "services": [
      {
        "service_type_id": "uuid",
        "service_name": "Spa Massage",
        "category": "Spa",
        "price": 75.00,
        "branch_id": "uuid",
        "branch_name": "Downtown Branch",
        "photo": "data:image/jpeg;base64,...",
        "description": "60-minute massage",
        "is_active": true,
        "created_at": "2025-10-20T...",
        "updated_at": "2025-10-20T..."
      }
    ],
    "count": 1
  }
}
```

---

## Migration Steps

### Step 1: Run Database Migration

```bash
# Connect to MySQL
mysql -u root -p

# Select database
USE SkyNest_Hotels;

# Run migration
source backend/database_migrations/add_branch_photo_to_service_types.sql;

# Verify changes
DESCRIBE service_types;
SHOW INDEX FROM service_types;
```

### Step 2: Update Backend

```bash
cd backend
npm run build
npm start
```

Verify console output shows no TypeScript errors.

### Step 3: Update Frontend

```bash
cd frontend
# Frontend auto-reloads in development
# Or restart if needed:
npm start
```

### Step 4: Test the Feature

1. **Login as Admin**
2. **Navigate to Services Tab**
3. **Test Create Service**:
   - With photo
   - Without photo
   - Different branches
   - All required fields
   - Validation errors
4. **Verify Table Display**:
   - Photo thumbnails
   - Branch names
   - All data correct
5. **Test Search**:
   - By service name
   - By category

---

## Error Handling

### Backend Errors

| Error | Status | Message |
|-------|--------|---------|
| Missing required fields | 400 | "Missing required fields: service_name, category, and price are required." |
| Invalid branch_id | 400 | "Invalid branch_id provided." |
| Duplicate service name | 409 | "Service with name 'X' already exists in this branch." |
| Database error | 500 | "Failed to retrieve created service." |

### Frontend Validation

| Field | Validation | Error Message |
|-------|-----------|---------------|
| service_name | Required, trim | "Service name is required" |
| category | Required, not empty | "Category is required" |
| branch_id | Required, not empty | "Branch selection is required" |
| price | Required, > 0 | "Price must be greater than 0" |
| photo | File type | "Please upload a valid image file (JPEG, PNG, GIF, or WebP)" |
| photo | File size | "Image size must be less than 5MB" |

---

## Benefits

### 1. Branch-Specific Services
- Services can be tailored to specific branches
- Different pricing at different locations
- Separate service offerings per branch

### 2. Visual Service Catalog
- Photos help guests recognize services
- Professional appearance
- Better user experience

### 3. Better Management
- Admins can see which services belong to which branch
- Easy to identify services visually
- Detailed descriptions for clarity

### 4. Scalability
- Support for multiple branches
- Global services (branch_id = NULL)
- Future enhancement ready

---

## Future Enhancements

### Potential Improvements

1. **Edit Service**:
   - Update service details
   - Change photo
   - Modify branch assignment

2. **Delete Service**:
   - Soft delete option
   - Cascade handling for bookings

3. **Service Analytics**:
   - Most popular services
   - Revenue by service
   - Usage statistics per branch

4. **Multi-Branch Services**:
   - Same service available at multiple branches
   - Different pricing per branch
   - Junction table approach

5. **Service Packages**:
   - Bundle multiple services
   - Package pricing
   - Promotional offers

6. **Photo Gallery**:
   - Multiple photos per service
   - Photo carousel in service details
   - Photo management interface

---

## Testing Checklist

### Database
- [ ] Migration runs without errors
- [ ] Columns added correctly
- [ ] Foreign key constraints work
- [ ] Indexes created
- [ ] NULL values allowed for branch_id and photo

### Backend
- [ ] createService accepts new fields
- [ ] Branch validation works
- [ ] Duplicate service detection works (per branch)
- [ ] Photo stored as LONGBLOB
- [ ] getServices returns branch_name
- [ ] Photo returned as base64
- [ ] Error responses correct

### Frontend
- [ ] Form includes branch dropdown
- [ ] Branches load correctly
- [ ] Photo upload UI works
- [ ] Drag and drop works
- [ ] File validation works (type, size)
- [ ] Photo preview displays
- [ ] Remove photo button works
- [ ] Form validation works
- [ ] Service created successfully
- [ ] Table displays photo thumbnails
- [ ] Table displays branch names
- [ ] Search filters work

### Integration
- [ ] End-to-end service creation works
- [ ] Photo displays in table
- [ ] Branch association correct
- [ ] Services filter by branch (if implemented)
- [ ] No console errors

---

## Troubleshooting

### Issue: "services.map is not a function"

**Solution**: Fixed by updating serviceCatalogueService.js:
```javascript
services: response.data.data?.services || []
```

### Issue: Photo not displaying

**Possible Causes**:
1. Photo not converted to base64 in backend
2. Invalid image format
3. LONGBLOB column too small

**Solution**: Verify backend returns photo with base64 prefix:
```javascript
photo: service.photo ? service.photo.toString('base64') : null
```

### Issue: Branch dropdown empty

**Cause**: Branches not loaded when modal opens

**Solution**: Ensure branches fetched in useEffect and available in state

### Issue: Large images cause timeout

**Solution**: Reduce image size on frontend before upload:
```javascript
// Add image compression before upload
// Use Canvas API to resize
```

---

## Summary

This enhancement adds essential features to the service management system:

1. ✅ **Branch Association**: Services linked to specific branches
2. ✅ **Photo Upload**: Drag & drop and file selection support
3. ✅ **Enhanced UI**: Table displays photos and branches
4. ✅ **Form Validation**: Required field checks
5. ✅ **Database Migration**: Safe schema updates with indexes
6. ✅ **Backend Updates**: New fields in controllers
7. ✅ **Frontend Integration**: Complete UI implementation

The system now provides a more professional and feature-rich service management experience for hotel administrators.

