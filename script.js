class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartCount = document.getElementById('cartCount');
        this.cartItems = document.getElementById('cartItems');
        this.totalPrice = document.getElementById('totalPrice');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.overlay = document.getElementById('overlay');
        
        this.updateCartUI();
    }

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: Date.now(),
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${name} added to cart!`);
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartUI() {
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        this.cartCount.textContent = totalItems;

        if (this.items.length === 0) {
            this.cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            this.cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">NPR ${item.price}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        this.totalPrice.textContent = `NPR ${this.getTotal()}`;
    }

    openCart() {
        this.cartSidebar.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartSidebar.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.body = document.body;
        
        this.init();
    }

    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.body.classList.add('light-mode');
            this.themeIcon.className = 'fas fa-sun';
        }

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const isLightMode = this.body.classList.toggle('light-mode');
        
        if (isLightMode) {
            this.themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        } else {
            this.themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        }
    }
}

const cart = new ShoppingCart();
const themeManager = new ThemeManager();

document.getElementById('cartIcon').addEventListener('click', () => cart.openCart());
document.getElementById('closeCart').addEventListener('click', () => cart.closeCart());
document.getElementById('overlay').addEventListener('click', () => cart.closeCart());
document.getElementById('checkoutBtn').addEventListener('click', () => {
    window.location.href = 'checkout.html';
});

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

function addToCart(name, price) {
    cart.addItem(name, price);
}

function orderViaWhatsApp(customerDetails, orderItems) {
    const phoneNumber = '+9779847244773';
    
    const itemsList = orderItems.map(item => 
        `🛍️ ${item.name} x${item.quantity} - NPR ${item.price * item.quantity}`
    ).join('\n');
    
    const message = `🛒 *NEW ORDER - Handcraft Haven*

👤 *Customer Details:*
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}

📦 *Order Details:*
${itemsList}

💰 *Total Amount:* NPR ${cart.getTotal()}

📍 *Delivery Address:* ${customerDetails.address}

📞 *Contact:* ${customerDetails.phone}

Thank you for your order! 🎉`;
    
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            left: ${x}px;
            top: ${y}px;
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        cart.closeCart();
    }
    
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScroll = debounce(() => {
}, 10);

window.addEventListener('scroll', optimizedScroll);

window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
});

console.log('%c🎨 Welcome to Handcraft Haven!', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
console.log('%cExplore our handcrafted collection and add to cart!', 'color: #ec4899; font-size: 14px;');
