import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyApHYstsNpEBODGGqoqZG49Icx2WCWthas",
    authDomain: "cake-heaven-e62dd.firebaseapp.com",
    projectId: "cake-heaven-e62dd",
    storageBucket: "cake-heaven-e62dd.firebasestorage.app",
    messagingSenderId: "160227044207",
    appId: "1:160227044207:web:cc7e03b8df67786ed0d69a",
    measurementId: "G-MSBDT5H0GF"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const App = {
    // State
    cart: [],
    currentView: 'home',
    menuLoading: true,
    
    // Menu Data
    menu: {
        regular: [],
        premium: [],
        designer: [],
        specialty: []
    },

    init() {
        this.currentView = window.location.hash.replace('#', '') || 'home';
        this.renderView();
        this.loadProducts();

        window.addEventListener('hashchange', () => {
            this.currentView = window.location.hash.replace('#', '') || 'home';
            this.renderView();
            window.scrollTo(0, 0);
        });

        this.updateCartUI();
        this.initMobileMenu();
        console.log("Cake Heaven App Initialized - v2.0");
    },

    initMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const nav = document.querySelector('.nav-links');
        
        if (toggle && nav) {
            toggle.onclick = (e) => {
                e.stopPropagation();
                nav.classList.toggle('active');
                toggle.querySelector('i').classList.toggle('fa-bars');
                toggle.querySelector('i').classList.toggle('fa-xmark');
            };

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (nav.classList.contains('active') && !nav.contains(e.target) && e.target !== toggle) {
                    nav.classList.remove('active');
                    toggle.querySelector('i').classList.add('fa-bars');
                    toggle.querySelector('i').classList.remove('fa-xmark');
                }
            });

            // Close menu when clicking a link
            nav.querySelectorAll('a').forEach(link => {
                link.onclick = () => {
                    nav.classList.remove('active');
                    toggle.querySelector('i').classList.add('fa-bars');
                    toggle.querySelector('i').classList.remove('fa-xmark');
                };
            });
        }
    },

    showToast(message, icon = 'fa-check-circle') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    renderView() {
        const appContainer = document.getElementById('app');
        
        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${this.currentView}`);
        });

        switch (this.currentView) {
            case 'home': appContainer.innerHTML = this.templates.home(); break;
            case 'menu': appContainer.innerHTML = this.templates.menu(); break;
            case 'custom': appContainer.innerHTML = this.templates.custom(); break;
            case 'cart': appContainer.innerHTML = this.templates.cart(); break;
            case 'about': appContainer.innerHTML = this.templates.about(); break;
            case 'contact': appContainer.innerHTML = this.templates.contact(); break;
            case 'blogs': appContainer.innerHTML = this.templates.blogs(); break;
            case 'terms': appContainer.innerHTML = this.templates.terms(); break;
            case 'privacy': appContainer.innerHTML = this.templates.privacy(); break;
            case 'refund': appContainer.innerHTML = this.templates.refund(); break;
            default: appContainer.innerHTML = this.templates.home();
        }

        // Re-attach event listeners for dynamic content
        if (this.currentView === 'menu') this.attachMenuListeners();
        if (this.currentView === 'cart') this.attachCartListeners();
        if (this.currentView === 'custom') this.attachCustomListeners();
    },

    // Templates
    templates: {
        home() {
            return `
                <section class="hero">
                    <div class="container">
                        <div class="hero-content">
                            <h1>Delicious Cakes Made with Love</h1>
                            <p>Where every bite feels like heaven. Experience the finest homemade cakes in Lucknow.</p>
                            <a href="#menu" class="btn-primary">Order Now</a>
                        </div>
                    </div>
                </section>

                <section class="featured-section view active" style="padding-top: 50px;">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 40px; font-size: 2.5rem;">Our Favorites</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
                            <div class="cake-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" alt="Delicious Chocolate Truffle Cake - Cake Heaven Lucknow" style="width: 100%; height: auto; max-height: 320px; object-fit: contain;">
                                <div style="padding: 20px;">
                                    <h3>Chocolate Truffle</h3>
                                    <p>Rich, creamy, and heavenly.</p>
                                    <a href="#menu" style="color: var(--gold); font-weight: 600;">View in Menu →</a>
                                </div>
                            </div>
                            <div class="cake-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?auto=format&fit=crop&w=400&q=80" alt="Premium Red Velvet Cake Lucknow - Best Quality" style="width: 100%; height: auto; max-height: 320px; object-fit: contain;">
                                <div style="padding: 20px;">
                                    <h3>Premium Red Velvet</h3>
                                    <p>A classic taste of elegance.</p>
                                    <a href="#menu" style="color: var(--gold); font-weight: 600;">View in Menu →</a>
                                </div>
                            </div>
                            <div class="cake-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80" alt="Custom Designer Floral Cake - Cake Heaven by Priyanka" style="width: 100%; height: auto; max-height: 320px; object-fit: contain;">
                                <div style="padding: 20px;">
                                    <h3>Designer Floral</h3>
                                    <p>Beautifully crafted for your special day.</p>
                                    <a href="#menu" style="color: var(--gold); font-weight: 600;">View in Menu →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style="background: white; padding: 100px 0;">
                    <div class="container" style="text-align: center;">
                        <h2 style="margin-bottom: 50px;">What Our Customers Say</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                            <div style="font-style: italic; background: var(--cream); padding: 30px; border-radius: 20px;">
                                "The best cake shop in Lucknow! The bento cakes are so cute and delicious." - Aditi S.
                            </div>
                            <div style="font-style: italic; background: var(--cream); padding: 30px; border-radius: 20px;">
                                "Ordered a designer cake for my daughter's birthday. It was exactly like the photo!" - Rahul M.
                            </div>
                        </div>
                    </div>
                </section>

                <section style="padding: 100px 0; background: var(--primary-pink);">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 50px;">Custom Orders & More</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; text-align: center;">
                            <div>
                                <i class="fa-solid fa-gift" style="font-size: 2.5rem; color: var(--gold); margin-bottom: 15px;"></i>
                                <h4 style="margin-bottom: 10px;">Customizations</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8;">Available according to your theme & choice.</p>
                            </div>
                            <div>
                                <i class="fa-solid fa-cake-candles" style="font-size: 2.5rem; color: var(--gold); margin-bottom: 15px;"></i>
                                <h4 style="margin-bottom: 10px;">Bulk Orders</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8;">Special offers available for large occasions.</p>
                            </div>
                            <div>
                                <i class="fa-solid fa-palette" style="font-size: 2.5rem; color: var(--gold); margin-bottom: 15px;"></i>
                                <h4 style="margin-bottom: 10px;">Choose Design</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8;">Flavor, design, color & packaging just as you want.</p>
                            </div>
                            <div>
                                <i class="fa-solid fa-truck-fast" style="font-size: 2.5rem; color: var(--gold); margin-bottom: 15px;"></i>
                                <h4 style="margin-bottom: 10px;">Timely Delivery</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8;">Best quality & fresh ingredients delivered on time.</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },
        menu() {
            if (App.menuLoading) {
                return `
                    <section class="view active">
                        <div class="container" style="text-align: center; padding: 120px 0;">
                            <h2 style="font-size: 3rem; margin-bottom: 10px;">Loading menu...</h2>
                            <p style="opacity: 0.7;">Fetching the latest product list from Firebase.</p>
                        </div>
                    </section>
                `;
            }

            const hasProducts = Object.values(App.menu).some(category => category.length > 0);
            if (!hasProducts) {
                return `
                    <section class="view active">
                        <div class="container" style="text-align: center; padding: 120px 0;">
                            <h2 style="font-size: 3rem; margin-bottom: 10px;">No products available yet</h2>
                            <p style="opacity: 0.7;">Please check back later or contact us for custom orders.</p>
                        </div>
                    </section>
                `;
            }

            let html = `
                <section class="view active">
                    <div class="container">
                        <h2 style="font-size: 3rem; margin-bottom: 10px;">Our Heavenly Menu</h2>
                        <p style="margin-bottom: 50px; opacity: 0.7;">Select from our wide range of homemade delights.</p>
                        
                        <div class="menu-categories" style="display: flex; gap: 20px; margin-bottom: 40px; overflow-x: auto; padding-bottom: 10px;">
                            <button class="cat-btn active" onclick="document.getElementById('regular').scrollIntoView({behavior: 'smooth'})" style="background: var(--gold); color: white; padding: 10px 25px; border-radius: 20px;">Regular</button>
                            <button class="cat-btn" onclick="document.getElementById('premium').scrollIntoView({behavior: 'smooth'})" style="background: white; padding: 10px 25px; border-radius: 20px; border: 1px solid var(--gold);">Premium</button>
                            <button class="cat-btn" onclick="document.getElementById('designer').scrollIntoView({behavior: 'smooth'})" style="background: white; padding: 10px 25px; border-radius: 20px; border: 1px solid var(--gold);">Designer</button>
                            <button class="cat-btn" onclick="document.getElementById('specialty').scrollIntoView({behavior: 'smooth'})" style="background: white; padding: 10px 25px; border-radius: 20px; border: 1px solid var(--gold);">Specialty</button>
                        </div>
            `;

            for (let category in App.menu) {
                html += `
                    <div id="${category}" style="margin-bottom: 60px;">
                        <h3 style="font-size: 2rem; border-left: 5px solid var(--gold); padding-left: 15px; margin-bottom: 30px; text-transform: capitalize;">${category} Cakes</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">
                            ${App.menu[category].map(item => `
                                <div class="cake-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft); transition: var(--transition-smooth);">
                                    <div style="position: relative;">
                                        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: auto; max-height: 320px; object-fit: contain;">
                                        <span style="position: absolute; top: 15px; right: 15px; background: var(--gold); color: white; padding: 5px 12px; border-radius: 15px; font-weight: 700;">₹${item.price}</span>
                                    </div>
                                    <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                                        <h4 style="font-size: 1.2rem;">${item.name}</h4>
                                        <p style="opacity: 0.85; margin: 0; min-height: 44px;">${item.description || ''}</p>
                                        <button onclick="App.addToCart('${item.id}', '${item.name}', ${item.price})" class="btn-add" style="background: var(--primary-pink); color: var(--deep-brown); padding: 12px; border-radius: 12px; font-weight: 600; width: 100%; border: 1px dashed var(--accent-pink);">Add to Cart</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            html += `</div></section>`;
            return html;
        },
        custom() {
            return `
                <section class="view active">
                    <div class="container">
                        <div style="max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 30px; box-shadow: var(--shadow-soft);">
                            <h2 style="text-align: center; margin-bottom: 30px;">ORDER YOUR CUSTOM CAKE</h2>
                            <p style="text-align: center; margin-bottom: 40px; opacity: 0.7;">Have a specific design in mind? Let us make it a reality.</p>
                            
                            <form id="customForm" style="display: flex; flex-direction: column; gap: 20px;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Full Name</label>
                                        <input type="text" id="cust_name_custom" placeholder="Your Name" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Phone Number</label>
                                        <input type="tel" id="cust_phone_custom" placeholder="Your Phone" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Upload Reference Image</label>
                                    <input type="file" id="custom_image" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed var(--secondary-pink); border-radius: 10px;">
                                    <small style="opacity: 0.6;">(Please attach this image manually in WhatsApp after clicking submit)</small>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Select Flavor</label>
                                        <select id="custom_flavor" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                            <option value="">Choose Flavor</option>
                                            <option>Chocolate Truffle</option>
                                            <option>Vanilla Delight</option>
                                            <option>Butterscotch</option>
                                            <option>Red Velvet</option>
                                            <option>Black Forest</option>
                                            <option>Strawberry</option>
                                            <option>Pineapple</option>
                                            <option>Other (Specify in Message)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Size (Kg)</label>
                                        <input type="number" id="custom_size" step="0.5" min="0.5" placeholder="e.g. 1.5" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Message on Cake</label>
                                        <input type="text" id="custom_msg" placeholder="Happy Birthday..." style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Budget/Total (Optional)</label>
                                        <input type="number" id="custom_total" placeholder="e.g. 1500" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Delivery Address</label>
                                    <textarea id="custom_address" placeholder="Full Delivery Address" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; min-height: 80px;"></textarea>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Delivery Date</label>
                                        <input type="date" id="custom_date" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Delivery Time</label>
                                        <input type="time" id="custom_time" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                </div>
                                <div style="margin: 10px 0;">
                                    <label style="display: block; margin-bottom: 10px; font-weight: 600;">Payment Option</label>
                                    <div style="display: flex; gap: 15px;">
                                        <label><input type="radio" name="custom_payment" value="UPI" checked> UPI</label>
                                        <label><input type="radio" name="custom_payment" value="COD"> Cash on Delivery</label>
                                    </div>
                                </div>
                                <button type="submit" class="btn-primary" style="margin-top: 20px;">Submit via WhatsApp</button>
                            </form>
                        </div>
                    </div>
                </section>
            `;
        },
        cart() {
            const total = App.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            if (App.cart.length === 0) {
                return `
                    <section class="view active">
                        <div class="container" style="text-align: center; padding-top: 100px;">
                            <i class="fa-solid fa-basket-shopping" style="font-size: 5rem; color: var(--secondary-pink); margin-bottom: 30px;"></i>
                            <h2>Your cart is empty</h2>
                            <p style="margin-bottom: 30px;">Add some sweetness to your day!</p>
                            <a href="#menu" class="btn-primary">Go to Menu</a>
                        </div>
                    </section>
                `;
            }

            return `
                <section class="view active">
                    <div class="container">
                        <h2 style="margin-bottom: 40px;">Your Cart</h2>
                        <div class="cart-grid">
                            <div class="cart-items" style="display: flex; flex-direction: column; gap: 20px;">
                                ${App.cart.map(item => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 20px; border-radius: 20px; box-shadow: var(--shadow-soft);">
                                        <div>
                                            <h4 style="font-size: 1.2rem;">${item.name}</h4>
                                            <p style="color: var(--gold); font-weight: 700;">₹${item.price}</p>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <button onclick="App.updateQty('${item.id}', -1)" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ddd;">-</button>
                                            <span style="font-weight: 700;">${item.qty}</span>
                                            <button onclick="App.updateQty('${item.id}', 1)" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ddd;">+</button>
                                            <button onclick="App.removeFromCart('${item.id}')" style="color: #ff4d4d; margin-left: 10px;"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="checkout-form" style="background: white; padding: 30px; border-radius: 30px; box-shadow: var(--shadow-soft); height: fit-content;">
                                <h3 style="margin-bottom: 25px;">Order Summary</h3>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 1.3rem; font-weight: 700;">
                                    <span>Total:</span>
                                    <span>₹${total}</span>
                                </div>
                                <hr style="margin-bottom: 25px; border: 0.5px solid #eee;">
                                
                                <form id="orderForm" style="display: flex; flex-direction: column; gap: 15px;">
                                    <input type="text" id="cust_name" placeholder="Full Name" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    <input type="tel" id="cust_phone" placeholder="Phone Number" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    <textarea id="cust_address" placeholder="Delivery Address" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; min-height: 80px;"></textarea>
                                    <div class="form-row">
                                        <input type="date" id="del_date" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                        <input type="time" id="del_time" required style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    </div>
                                    <input type="text" id="del_msg" placeholder="Message on Cake (Optional)" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                                    <div style="margin: 10px 0;">
                                        <label style="display: block; margin-bottom: 10px; font-weight: 600;">Payment Option</label>
                                        <div style="display: flex; gap: 15px;">
                                            <label><input type="radio" name="payment" value="UPI" checked> UPI</label>
                                            <label><input type="radio" name="payment" value="COD"> Cash on Delivery</label>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%;">Place Order via WhatsApp</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },
        about() {
            return `
                <section class="view active">
                    <div class="container">
                        <div class="about-grid">
                            <div>
                                <h2 style="font-size: 3rem; margin-bottom: 30px;">About Priyanka's Kitchen</h2>
                                <p style="font-size: 1.1rem; margin-bottom: 20px;">Welcome to Cake Heaven! I am Priyanka, a passionate home baker based in Lucknow. What started as a hobby of baking for family and friends has now turned into a sweet mission to bring joy to every celebration.</p>
                                <p style="font-size: 1.1rem; margin-bottom: 20px;">Every cake here is handcrafted with premium ingredients, fresh cream, and most importantly, a lot of love. We believe that cakes shouldn't just look beautiful; they should taste like a dream.</p>
                                <div style="display: flex; gap: 20px; margin-top: 30px;">
                                    <div style="text-align: center;">
                                        <h3 style="color: var(--gold); font-size: 2rem;">500+</h3>
                                        <p>Happy Customers</p>
                                    </div>
                                    <div style="text-align: center;">
                                        <h3 style="color: var(--gold); font-size: 2rem;">50+</h3>
                                        <p>Flavors</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80" style="width: 100%; border-radius: 30px; box-shadow: var(--shadow-soft);">
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },
        contact() {
            return `
                <section class="view active">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 50px;">Contact Us</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                            <div style="background: white; padding: 40px; border-radius: 30px; box-shadow: var(--shadow-soft); text-align: center;">
                                <i class="fa-solid fa-phone" style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;"></i>
                                <h3>Call/WhatsApp</h3>
                                <p>+91 87963 43915</p>
                            </div>
                            <div style="background: white; padding: 40px; border-radius: 30px; box-shadow: var(--shadow-soft); text-align: center;">
                                <i class="fa-solid fa-location-dot" style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;"></i>
                                <h3>Pick-up Point</h3>
                                <p>Near Gomti Nagar, Lucknow, UP</p>
                                <a href="https://maps.app.goo.gl/VhdM8gx7DjJpcccR9?g_st=iw" target="_blank" style="display: inline-block; margin-top: 15px; color: var(--gold); font-weight: 600; text-decoration: underline;">View on Google Maps</a>
                            </div>
                            <div style="background: white; padding: 40px; border-radius: 30px; box-shadow: var(--shadow-soft); text-align: center;">
                                <i class="fa-solid fa-envelope" style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;"></i>
                                <h3>Email</h3>
                                <p>hello@cakeheaven.com</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },
        blogs() {
            return `
                <section class="view active">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 50px; font-size: 3rem;">Bakery Stories & Tips</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                            <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80" style="width: 100%; height: 200px; object-fit: cover;">
                                <div style="padding: 25px;">
                                    <h3 style="margin-bottom: 10px;">5 Tips for the Perfect Birthday Surprise</h3>
                                    <p style="opacity: 0.7; margin-bottom: 15px;">Choosing the right flavor is just the beginning. Learn how to make the celebration unforgettable...</p>
                                    <a href="#" style="color: var(--gold); font-weight: 600;">Read More →</a>
                                </div>
                            </div>
                            <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=400&q=80" style="width: 100%; height: 200px; object-fit: cover;">
                                <div style="padding: 25px;">
                                    <h3 style="margin-bottom: 10px;">Why Homemade Cakes Taste Better</h3>
                                    <p style="opacity: 0.7; margin-bottom: 15px;">Discover the secret ingredients and the love that goes into every batch of our heavenly creations...</p>
                                    <a href="#" style="color: var(--gold); font-weight: 600;">Read More →</a>
                                </div>
                            </div>
                            <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);">
                                <img src="https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=400&q=80" style="width: 100%; height: 200px; object-fit: cover;">
                                <div style="padding: 25px;">
                                    <h3 style="margin-bottom: 10px;">The Rise of Bento Cakes in Lucknow</h3>
                                    <p style="opacity: 0.7; margin-bottom: 15px;">Small in size, big on joy! Why everyone is falling in love with these cute mini treats...</p>
                                    <a href="#" style="color: var(--gold); font-weight: 600;">Read More →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        },
        terms() {
            return `
                <section class="view active">
                    <div class="container" style="max-width: 800px; background: white; padding: 50px; border-radius: 30px; box-shadow: var(--shadow-soft);">
                        <h2 style="margin-bottom: 30px;">Terms & Conditions</h2>
                        <div style="opacity: 0.8; display: flex; flex-direction: column; gap: 20px;">
                            <p>1. <strong>Order Confirmation:</strong> All orders are confirmed only after payment or specific WhatsApp confirmation from our team.</p>
                            <p>2. <strong>Delivery:</strong> We strive for timely delivery; however, delays due to traffic or weather in Lucknow are possible.</p>
                            <p>3. <strong>Freshness:</strong> As our cakes are homemade and contain no preservatives, they should be consumed within 24-48 hours and kept refrigerated.</p>
                            <p>4. <strong>Custom Designs:</strong> Slight variations in color and design may occur as each cake is handcrafted.</p>
                        </div>
                    </div>
                </section>
            `;
        },
        privacy() {
            return `
                <section class="view active">
                    <div class="container" style="max-width: 800px; background: white; padding: 50px; border-radius: 30px; box-shadow: var(--shadow-soft);">
                        <h2 style="margin-bottom: 30px;">Privacy Policy</h2>
                        <div style="opacity: 0.8; display: flex; flex-direction: column; gap: 20px;">
                            <p>Your privacy is important to us. We only collect the necessary details (Name, Phone, Address) to fulfill your cake orders.</p>
                            <p>We do not share your personal information with any third parties except for delivery purposes.</p>
                        </div>
                    </div>
                </section>
            `;
        },
        refund() {
            return `
                <section class="view active">
                    <div class="container" style="max-width: 800px; background: white; padding: 50px; border-radius: 30px; box-shadow: var(--shadow-soft);">
                        <h2 style="margin-bottom: 30px;">Refund & Cancellation Policy</h2>
                        <div style="opacity: 0.8; display: flex; flex-direction: column; gap: 20px;">
                            <p>1. <strong>Cancellations:</strong> Orders can be cancelled up to 24 hours before the scheduled delivery time for a full refund.</p>
                            <p>2. <strong>No-Refund:</strong> Due to the perishable nature of cakes, refunds are not possible for cancellations made within 12 hours of delivery.</p>
                            <p>3. <strong>Issues:</strong> If you are unsatisfied with the quality, please contact us immediately on WhatsApp with photos for a resolution.</p>
                        </div>
                    </div>
                </section>
            `;
        }
    },

    async loadProducts() {
        this.menuLoading = true;
        this.renderView();

        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const categories = {
                regular: [],
                premium: [],
                designer: [],
                specialty: []
            };

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const category = (data.category || 'regular').toLowerCase();
                const item = {
                    id: doc.id,
                    name: data.name || 'Untitled Cake',
                    price: Number(data.price) || 0,
                    image: data.image_landscape || data.imageUrl || 'https://placehold.co/600x400?text=No+Image',
                    description: data.description || '',
                    category
                };

                if (categories[category]) {
                    categories[category].push(item);
                } else {
                    categories.regular.push(item);
                }
            });

            this.menu = categories;
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showToast('Unable to load menu from Firebase.', 'fa-exclamation-circle');
        } finally {
            this.menuLoading = false;
            if (this.currentView === 'menu') this.renderView();
        }
    },

    // Logic
    addToCart(id, name, price) {
        const existing = this.cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            this.cart.push({ id, name, price, qty: 1 });
        }
        this.updateCartUI();
        this.showToast(`${name} added to cart!`, 'fa-cart-plus');
    },

    updateQty(id, delta) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) this.removeFromCart(id);
            else {
                this.renderView();
                this.updateCartUI();
            }
        }
    },

    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.renderView();
        this.updateCartUI();
    },

    updateCartUI() {
        const count = this.cart.reduce((sum, item) => sum + item.qty, 0);
        document.querySelector('.cart-count').textContent = count;
    },

    attachMenuListeners() {
        // Handle category button active states
        const btns = document.querySelectorAll('.cat-btn');
        btns.forEach(btn => {
            btn.onclick = (e) => {
                btns.forEach(b => {
                    b.style.background = 'white';
                    b.style.color = 'var(--deep-brown)';
                });
                e.target.style.background = 'var(--gold)';
                e.target.style.color = 'white';
                const targetId = e.target.textContent.toLowerCase();
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            };
        });
    },

    attachCartListeners() {
        const form = document.getElementById('orderForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.placeOrder();
            };
        }
    },

    attachCustomListeners() {
        const form = document.getElementById('customForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('cust_name_custom').value;
                const phone = document.getElementById('cust_phone_custom').value;
                const flavor = document.getElementById('custom_flavor').value;
                const size = document.getElementById('custom_size').value;
                const cakeMsg = document.getElementById('custom_msg').value;
                const customTotal = document.getElementById('custom_total').value || 0;
                const date = document.getElementById('custom_date').value;
                const time = document.getElementById('custom_time').value;
                const address = document.getElementById('custom_address').value;
                const payment = document.querySelector('input[name="custom_payment"]:checked')?.value || 'UPI';
                const file = document.getElementById('custom_image').files[0];

                let base64Image = null;

                const orderData = {
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    flavor: flavor,
                    size: size,
                    message: cakeMsg,
                    total: Number(customTotal),
                    preferred_date: date,
                    preferred_time: time,
                    payment_option: payment,
                    status: 'pending',
                    host_uid: "YinadrOrLZWzaFpJPOhYoKtrakH3",
                    image: "",
                    imageUrl: "",
                    createdAt: serverTimestamp()
                };

                if (file) {
                    this.showToast("Processing image...", 'fa-spinner');
                    try {
                        base64Image = await toBase64(file);
                        orderData.image_landscape = base64Image;
                        orderData.image_portrait = base64Image;
                        
                        await addDoc(collection(db, 'custom_orders'), orderData);
                        this.showToast("Custom order recorded!", 'fa-check-circle');
                    } catch (error) {
                        console.error('Failed to process custom order image:', error);
                        this.showToast("Could not save image to database.", 'fa-exclamation-circle');
                    }
                } else {
                    orderData.image_landscape = "";
                    orderData.image_portrait = "";
                    await addDoc(collection(db, 'custom_orders'), orderData);
                }

                let message = `*Custom Cake Inquiry from Cake Heaven*%0A%0A`;
                message += `*Customer Details:*%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0A%0A`;
                message += `*Cake Details:*%0A- Flavor: ${flavor}%0A- Size: ${size} Kg%0A- Message: ${cakeMsg || 'None'}%0A- Preferred Date: ${date} at ${time}%0A- Payment: ${payment}%0A%0A`;
                
                if (base64Image) {
                    message += `*Reference Image included in database*%0A%0A`;
                }
                
                message += `*Order Link:* https://cakeheavenlucknow.com/admin%0A%0A`;
                message += `Please let me know the price and availability!`;

                const whatsappUrl = `https://wa.me/918796343915?text=${message}`;
                window.open(whatsappUrl, '_blank');

                this.showToast("Opening WhatsApp...", 'fa-whatsapp');
                setTimeout(() => {
                    window.location.hash = '#home';
                }, 2000);
            };
        }
    },

    async placeOrder() {
        const name = document.getElementById('cust_name').value;
        const phone = document.getElementById('cust_phone').value;
        const address = document.getElementById('cust_address').value;
        const date = document.getElementById('del_date').value;
        const time = document.getElementById('del_time').value;
        const msg = document.getElementById('del_msg').value;
        const payment = document.querySelector('input[name="payment"]:checked')?.value || 'UPI';

        this.showToast("Recording order...", 'fa-spinner');

        try {
            // Save order to Firestore
            await addDoc(collection(db, 'orders'), {
                customer_name: name,
                customer_phone: phone,
                customer_address: address,
                delivery_date: date,
                delivery_time: time,
                message: msg,
                payment_option: payment,
                items: this.cart,
                total: this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
                status: 'pending',
                host_uid: "YinadrOrLZWzaFpJPOhYoKtrakH3",
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Failed to save order to Firestore:', error);
        }

        let message = `*New Order from Cake Heaven by Priyanka*%0A%0A`;
        message += `*Customer Details:*%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0A%0A`;
        message += `*Message on Cake:* ${msg || 'None'}%0A%0A`;
        message += `*Order Items:*%0A`;
        
        let total = 0;
        this.cart.forEach(item => {
            message += `- ${item.name} x ${item.qty} (₹${item.price * item.qty})%0A`;
            total += item.price * item.qty;
        });
        
        message += `%0A*Total Amount:* ₹${total}%0A`;
        message += `*Delivery:* ${date} at ${time}%0A`;
        message += `*Payment:* ${payment}%0A%0A`;
        message += `*Order Link:* https://cakeheavenlucknow.com/admin%0A%0A`;
        message += `Please confirm my order!`;

        const whatsappUrl = `https://wa.me/918796343915?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        // Clear cart
        this.cart = [];
        this.updateCartUI();
        this.showToast("Order placed! Redirecting to WhatsApp...", 'fa-whatsapp');
        
        setTimeout(() => {
            window.location.hash = '#home';
        }, 2000);
    }
};

window.App = App;

// Initialize App
App.init();
