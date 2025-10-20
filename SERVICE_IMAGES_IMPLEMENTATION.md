# Service Images Implementation

## Overview
Added support for images in the service catalogue. Admins can now add image URLs to services, which can be displayed throughout the application.

## Features Implemented

### 1. **Database Schema Updates**

Added two new columns to the `service_catalogue` table:
- `image` (LONGBLOB) - For storing binary image data (future use)
- `image_url` (VARCHAR(500)) - For storing image URLs

#### Migration Files
- **Up Migration**: `/backend/migrations/sqls/20251020133516-add-service-image-up.sql`
- **Down Migration**: `/backend/migrations/sqls/20251020133516-add-service-image-down.sql`
- **Manual Script**: `/backend/scripts/add-service-images.sql`

### 2. **Backend API Updates**

#### Updated Interface
```typescript
interface ServiceCatalogue {
  service_id: string;
  service_name: string;
  category: string;
  unit_price: number;
  image?: Buffer;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### Updated Endpoints

**POST /api/services** - Create Service
- Now accepts `image_url` (optional string)
- Stores the URL in the database

**PUT /api/services/:service_id** - Update Service
- Accepts `image_url` for updates
- Can set to null to remove image

**GET /api/services** & **GET /api/services/:service_id**
- Returns `image_url` in the response

#### Request Body Example
```json
{
  "service_name": "Spa Massage",
  "category": "Wellness",
  "unit_price": 85.00,
  "image_url": "https://example.com/images/spa-massage.jpg",
  "is_active": true
}
```

### 3. **Frontend Admin Dashboard Updates**

#### Service Form State
Updated `serviceFormData` to include:
```javascript
{
  service_name: '',
  category: '',
  unit_price: '',
  is_active: true,
  image_url: ''  // NEW
}
```

#### Add/Edit Service Modals
- Added "Image URL (Optional)" input field
- Type: URL input with validation
- Placeholder: `https://example.com/service-image.jpg`
- Helper text: "Enter a URL to an image for this service"

#### UI Features
- Clean URL input field
- Optional field (not required)
- Validates URL format
- Persists during editing

### 4. **Files Modified**

#### Backend
1. **`backend/src/controllers/serviceCatalogueController.ts`**
   - Updated `ServiceCatalogue` interface
   - Modified `createService()` to handle image_url
   - Modified `updateService()` to handle image_url
   - Updated all responses to include image_url

2. **`backend/migrations/sqls/20251020133516-add-service-image-up.sql`**
   - Migration to add image columns

3. **`backend/scripts/add-service-images.sql`**
   - Manual migration script

#### Frontend
1. **`frontend/src/components/AdminDashboard.js`**
   - Updated service form state
   - Updated `handleAddServiceClick()`
   - Updated `handleEditServiceClick()`
   - Updated service submission handlers
   - Added image URL input to Add Service modal
   - Added image URL input to Edit Service modal

## Installation & Setup

### Step 1: Run Database Migration

```bash
# Option 1: Using MySQL command line
mysql -u skynestadmin -p SkyNest_Hotels < backend/scripts/add-service-images.sql

# Option 2: Using db-migrate
cd backend
NODE_ENV=development db-migrate up
```

### Step 2: Restart Backend Server

```bash
cd backend
pnpm dev
```

### Step 3: Restart Frontend (if running)

```bash
cd frontend
npm start
```

## Usage

### Adding a Service with Image

1. Navigate to Admin Dashboard → Services tab
2. Click "Add Service"
3. Fill in service details
4. Enter an image URL in the "Image URL" field
5. Click "Create Service"

### Updating Service Image

1. Navigate to Admin Dashboard → Services tab
2. Click edit icon on a service
3. Update the "Image URL" field
4. Click "Update Service"

### Removing Service Image

1. Edit the service
2. Clear the "Image URL" field
3. Save changes

## Image URL Guidelines

### Recommended Image Sources
- **Cloud Storage**: AWS S3, Google Cloud Storage, Azure Blob Storage
- **CDN**: Cloudinary, Imgix, Cloudflare Images
- **Image Hosting**: Imgur, Flickr (with direct links)

### Best Practices
- Use HTTPS URLs for security
- Recommended image size: 800x600px or similar aspect ratio
- Supported formats: JPG, PNG, WebP
- Keep file sizes under 500KB for fast loading
- Use descriptive filenames

### Example URLs
```
https://images.example.com/services/spa-massage.jpg
https://cdn.cloudinary.com/hotel/room-service.png
https://storage.googleapis.com/skynest/laundry-service.webp
```

## API Response Example

```json
{
  "success": true,
  "message": "Service created successfully.",
  "data": {
    "service": {
      "service_id": "abc-123-def-456",
      "service_name": "Spa Massage",
      "category": "Wellness",
      "unit_price": 85.00,
      "image_url": "https://example.com/images/spa-massage.jpg",
      "is_active": true,
      "created_at": "2025-10-20T13:00:00.000Z",
      "updated_at": "2025-10-20T13:00:00.000Z"
    }
  }
}
```

## Testing Checklist

- [ ] Create service with image URL
- [ ] Create service without image URL
- [ ] Edit service and add image URL
- [ ] Edit service and change image URL
- [ ] Edit service and remove image URL
- [ ] Verify image_url is saved in database
- [ ] Verify image_url is returned in API responses
- [ ] Test with various URL formats
- [ ] Test with invalid URLs (should still save)

## Future Enhancements

### Phase 2: Image Upload
- Add file upload functionality
- Store images in cloud storage (AWS S3, Cloudinary)
- Generate thumbnails automatically
- Image optimization and compression

### Phase 3: Image Gallery
- Multiple images per service
- Image carousel in service details
- Image preview in admin dashboard
- Drag-and-drop reordering

### Phase 4: Advanced Features
- Image validation (check if URL is accessible)
- Automatic image resizing
- Lazy loading for performance
- Fallback placeholder images
- Image caching strategy

## Benefits

1. **Visual Appeal**: Services can now be displayed with images
2. **Better UX**: Users can see what services look like
3. **Flexibility**: Use any image hosting service
4. **Simple Implementation**: URL-based approach is easy to use
5. **Scalable**: Can be extended to file uploads later

## Notes

- The `image` LONGBLOB column is reserved for future file upload functionality
- Currently using URL-based approach for simplicity
- No file size limits as images are hosted externally
- Admin is responsible for ensuring image URLs are valid and accessible

---

**Implementation Date**: October 20, 2025  
**Status**: ✅ Complete and Ready for Testing  
**Related**: See `OFFER_MANAGEMENT_IMPLEMENTATION.md` for offer management features
