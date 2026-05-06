# Cake Heaven by Priyanka

A modern, responsive cake shop website built with HTML, CSS, JavaScript, and Firebase.

## Features

- **Dynamic Product Menu**: Products loaded from Firebase Firestore
- **Admin Panel**: Upload products with images to Firebase Storage
- **Custom Cake Orders**: Customers can submit custom cake inquiries with reference images
- **WhatsApp Integration**: Direct messaging for orders and inquiries
- **Responsive Design**: Works on all devices
- **SEO Optimized**: Meta tags and structured data for search engines

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Firebase (Firestore + Storage)
- **Deployment**: Netlify
- **Icons**: Font Awesome

## Setup

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Nitinaasingh1212/cake-heaven.git
   cd cake-heaven
   ```

2. Start a local server (required for Firebase):
   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Firebase Storage
4. Copy your Firebase config to `js/app.js` and `admin.html`
5. Set Firestore rules to allow reads/writes as needed
6. Set Storage rules to allow uploads

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Use these build settings:
   - **Branch**: `main`
   - **Base directory**: (leave empty)
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
3. Add Firebase environment variables in Netlify site settings

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Deploy: `firebase deploy`

## Project Structure

```
cake-heaven/
├── index.html          # Main website
├── admin.html          # Admin panel
├── css/
│   └── style.css       # Styles
├── js/
│   └── app.js          # Main app logic
├── images/             # Static images
├── firebase.json       # Firebase hosting config
├── netlify.toml        # Netlify config
└── README.md           # This file
```

## Usage

### For Customers

- Browse menu items loaded from Firestore
- Add items to cart
- Place orders via WhatsApp
- Submit custom cake inquiries with images

### For Admin

- Visit `/admin` to access admin panel
- Upload new products with images
- View existing products
- Manage inventory

## Contact

- **Phone**: +91 87963 43915
- **Email**: varunpriyanka07@gmail.com
- **Address**: 9/1770, Sector 9, Faridabad, Haryana 121006
- **Instagram**: [@cake_heaven_by_priyanka2618](https://www.instagram.com/cake_heaven_by_priyanka2618)

## License

© 2026 Cake Heaven by Priyanka. All rights reserved.