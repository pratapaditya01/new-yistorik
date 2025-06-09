# Cloudinary Setup Guide

## 🚀 Quick Setup for Image Uploads

### Step 1: Create Cloudinary Account
1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up for Free"
3. Create your account with email/password
4. Verify your email address

### Step 2: Get Your Credentials
1. After logging in, go to your Dashboard
2. You'll see your credentials in the "Account Details" section:
   - **Cloud Name**: (e.g., `dxxxxx123`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Update Environment Variables
Replace the placeholder values in `backend/.env`:

```env
# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 4: Test the Setup
1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Go to admin products page:
   ```
   http://localhost:5174/admin/products
   ```

3. Try creating a new product with images

## 🔧 Features Implemented

### ✅ Cloudinary Integration
- **Automatic Image Optimization**: Images are automatically resized and optimized
- **CDN Delivery**: Fast image loading from Cloudinary's global CDN
- **Multiple Formats**: Supports JPG, PNG, WEBP formats
- **File Size Limits**: 5MB maximum per image
- **Secure Upload**: Admin-only access with authentication

### ✅ Image Management
- **Drag & Drop Upload**: Easy image uploading interface
- **Multiple Images**: Upload up to 5 images per product
- **Main Image Selection**: Set primary product image
- **Image Deletion**: Remove images from both database and Cloudinary
- **Preview Grid**: Visual preview of uploaded images

### ✅ API Endpoints
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/image/:publicId` - Delete image
- `POST /api/admin/products` - Create product with images
- `PUT /api/admin/products/:id` - Update product with images
- `DELETE /api/admin/products/:id` - Delete product and images

## 🎯 Usage Instructions

### Creating Products with Images
1. Go to Admin Products page
2. Click "Add New Product"
3. Fill in product details
4. Upload images using drag & drop or click to browse
5. Set main image by clicking "Main" button
6. Save the product

### Image Upload Features
- **Drag & Drop**: Drag images directly onto upload area
- **File Browser**: Click upload area to browse files
- **Multiple Upload**: Select multiple images at once
- **Progress Indicator**: Visual feedback during upload
- **Error Handling**: Clear error messages for failed uploads

### Image Management
- **Main Image**: First uploaded image is automatically set as main
- **Reorder**: Click "Main" on any image to make it primary
- **Remove**: Click X button to delete images
- **Preview**: Hover over images to see controls

## 🔒 Security Features

### ✅ Authentication Required
- Only authenticated admin users can upload images
- JWT token validation on all upload endpoints
- Role-based access control

### ✅ File Validation
- File type validation (images only)
- File size limits (5MB maximum)
- Secure file handling with Cloudinary

### ✅ Error Handling
- Comprehensive error messages
- Graceful failure handling
- Automatic cleanup on errors

## 📁 Folder Structure
Images are organized in Cloudinary:
```
clothing-store/
  └── products/
      ├── image1.jpg
      ├── image2.png
      └── image3.webp
```

## 🎉 Benefits of Cloudinary

### ✅ Performance
- **Global CDN**: Fast image delivery worldwide
- **Auto Optimization**: Automatic format and quality optimization
- **Responsive Images**: Different sizes for different devices
- **Lazy Loading**: Improved page load times

### ✅ Storage
- **Cloud Storage**: No local server storage needed
- **Unlimited Bandwidth**: No bandwidth restrictions
- **Backup & Security**: Automatic backups and security
- **Scalability**: Handles any number of images

### ✅ Features
- **Image Transformations**: Resize, crop, effects on-the-fly
- **Format Conversion**: Automatic format optimization
- **Quality Control**: Smart quality adjustments
- **SEO Friendly**: Optimized for search engines

## 🚨 Important Notes

1. **Free Tier Limits**: Cloudinary free tier includes:
   - 25GB storage
   - 25GB monthly bandwidth
   - 25,000 transformations/month

2. **Environment Variables**: Keep your API secret secure and never commit it to version control

3. **Image URLs**: Cloudinary URLs are permanent and can be cached

4. **Backup**: Consider backing up important images separately

## 🔧 Troubleshooting

### Common Issues:
1. **Upload Fails**: Check your Cloudinary credentials
2. **Images Don't Load**: Verify cloud name in URLs
3. **Permission Denied**: Ensure user has admin role
4. **File Too Large**: Check 5MB file size limit

### Debug Steps:
1. Check browser console for errors
2. Verify backend logs for upload errors
3. Test Cloudinary credentials in dashboard
4. Ensure proper environment variable format

## 🎯 Next Steps

After setup, you can:
1. Create products with multiple images
2. Manage existing product images
3. Set main product images
4. Delete unused images
5. Monitor usage in Cloudinary dashboard

Your image upload system is now ready for production use! 🎉
