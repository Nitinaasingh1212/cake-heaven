# Firebase Setup Guide

This guide explains how to configure Firebase for Cake Heaven.

## Prerequisites

- Firebase project created at https://console.firebase.google.com/
- Project ID: `cake-heaven-e62dd`

## 1. Enable Firestore Database

1. Go to Firebase Console
2. Select your project
3. Go to **Firestore Database**
4. Click **Create Database**
5. Start in **production mode**
6. Choose region (us-central1 or closest to your location)
7. Click **Create**

## 2. Configure Firestore Security Rules

Go to **Firestore Database > Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read products
    match /products/{document=**} {
      allow read: if true;
    }
    
    // Deny writes (admin uses authenticated method)
    match /products/{document=**} {
      allow write: if false;
    }
  }
}
```

## 3. Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Choose default storage location (GCS bucket will be `cake-heaven-e62dd.firebasestorage.app`)
4. Click **Done**

## 4. Configure Storage Security Rules

Go to **Storage > Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to upload to custom_inquiries folder
    match /custom_inquiries/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Allow anyone to read product_images
    match /product_images/{allPaths=**} {
      allow read: if true;
      // Only allow writes from authenticated admin (optional)
      allow write: if false;
    }
  }
}
```

**⚠️ Production Note**: These rules allow public uploads. For production, restrict uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Require authentication for uploads
    match /custom_inquiries/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /product_images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Create Firestore Collection Structure

### Products Collection

Create a collection named `products` with documents like:

```json
{
  "name": "Regular Cake (1 Kg)",
  "category": "regular",
  "price": 1499,
  "description": "Classic vanilla cake with fresh cream",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "createdAt": "2026-05-06T12:00:00Z"
}
```

## 6. Test the Setup

### Local Testing

1. Start local server: `python -m http.server 8000`
2. Open `http://localhost:8000`
3. Go to `/admin` to upload a product
4. Check if image uploads to Storage
5. Check if product appears in Firestore

### Troubleshooting

**Issue: "Permission denied" error**
- Check Storage rules allow the operation
- Verify bucket name matches in Firebase config

**Issue: "Product won't load"**
- Ensure Firestore `products` collection exists
- Check Firestore read rules allow public reads
- Open browser console for error details

**Issue: "Custom order image upload hangs"**
- Verify Storage rules allow writes to `custom_inquiries/`
- Check file size is under 5MB
- Try uploading from browser console:
  ```javascript
  const test = await App.uploadTestImage();
  ```

## 7. Firebase Configuration

The Firebase config is in:
- `js/app.js` (for main site)
- `admin.html` (for admin panel)

Current config for project `cake-heaven-e62dd`:

```javascript
{
  apiKey: "AIzaSyApHYstsNpEBODGGqoqZG49Icx2WCWthas",
  authDomain: "cake-heaven-e62dd.firebaseapp.com",
  projectId: "cake-heaven-e62dd",
  storageBucket: "cake-heaven-e62dd.firebasestorage.app",
  messagingSenderId: "160227044207",
  appId: "1:160227044207:web:cc7e03b8df67786ed0d69a",
  measurementId: "G-MSBDT5H0GF"
}
```

## 8. Deploy to Production

### Netlify

1. Connect GitHub to Netlify
2. Use provided `netlify.toml` config
3. No environment variables needed (config is public)

### Firebase Hosting

1. Install CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Deploy: `firebase deploy`

## Security Considerations

⚠️ **Development vs Production**:
- Development: Allow public reads/writes for testing
- Production: Use authentication for writes, public reads only

⚠️ **API Keys**: The Firebase API key is public (by design), so don't rely on it for security. Use Firestore/Storage rules instead.

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Check Firebase console for rule violations
3. Verify collection names and paths match exactly
4. Test with Network tab open to see actual requests
