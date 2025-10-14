# Payload Size Limit Fix for Photo Uploads

## Issue
When uploading photos for room types, the server was returning an error:
```
PayloadTooLargeError: request entity too large
expected: 132209,
length: 132209,
limit: 102400,
type: 'entity.too.large'
```

## Root Cause
The default Express `body-parser` middleware has a payload limit of **100KB (102,400 bytes)**. However, Base64 encoded images are significantly larger:

- Original image: ~3MB
- Base64 encoded: ~4MB (33% overhead)
- Frontend limit: 5MB
- Backend limit: 100KB ❌ **TOO SMALL**

## Solution
Increased the payload limit in Express middleware to **10MB** to accommodate Base64 encoded images.

### File Modified
**`backend/src/index.ts`**

### Changes
```typescript
// Before
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// After
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Why 10MB?
- Frontend validation: 5MB max original image
- Base64 overhead: ~33% increase
- Encoded size: ~6.65MB
- Buffer: Set to 10MB for safety margin
- Still reasonable for production use

## Testing
After this fix, you should be able to upload images up to 5MB without errors.

### Test Scenarios
1. ✅ Small image (100KB) - Should work
2. ✅ Medium image (1-2MB) - Should work
3. ✅ Large image (4-5MB) - Should work now
4. ❌ Oversized image (>5MB) - Should be rejected by frontend validation

## Alternative Solutions Considered

### Option 1: Multipart/form-data (Rejected)
- Would require `multer` package
- More complex implementation
- File system or memory storage needed
- Current Base64 approach simpler for BLOB storage

### Option 2: Separate upload endpoint (Rejected)
- Unnecessary complexity
- Would require multiple API calls
- Current single-endpoint approach cleaner

### Option 3: Client-side compression (Future Enhancement)
- Could compress images before upload
- Reduce payload size
- Maintain quality
- Recommended for future optimization

## Production Considerations

### Security
- Consider adding rate limiting on upload endpoints
- Monitor payload sizes in production
- Set up alerts for excessive payload sizes

### Performance
- 10MB payloads can impact server performance
- Consider implementing:
  - Request timeout limits
  - Concurrent upload limits
  - CDN for image delivery (future)

### Monitoring
Track these metrics:
- Average payload size
- Upload success/failure rate
- Server memory usage during uploads
- Response times for upload endpoints

## Deployment Notes
After deploying this fix:
1. Restart the backend server
2. Test with various image sizes
3. Monitor server logs for any payload errors
4. Verify frontend validation still works (5MB limit)

## Related Files
- `backend/src/index.ts` - Express middleware configuration
- `frontend/src/components/AdminDashboard.js` - Frontend 5MB validation
- `backend/src/controllers/roomTypeController.ts` - Photo processing

## Status
✅ **Fixed** - October 15, 2025
- Payload limit increased from 100KB to 10MB
- Backend rebuilt successfully
- Ready for testing

## Next Steps
1. Restart backend: `cd backend && pnpm dev`
2. Test photo upload functionality
3. Upload various image sizes (100KB - 5MB)
4. Verify no more "PayloadTooLargeError"
