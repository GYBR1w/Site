// Инициализация корзины
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обновляем счетчик корзины
    updateCartCounter();
    
    // Если мы на странице корзины, отображаем её содержимое
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    // Добавляем обработчики на кнопки "В корзину"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            addToCart(name, price, image);
        });
    });
});

// Добавление товара в корзину
function addToCart(name, price, image) {
    if (!name || !price) {
        console.error('Не указано имя или цена товара');
        return;
    }

    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showNotification('Товар добавлен в корзину');
}

// Обновление счетчика корзины
function updateCartCounter() {
    const counter = document.querySelector('.cart-counter');
    if (counter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = totalItems;
        counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Отображение содержимого корзины
function displayCart() {
    const cartItems = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.cart-total');
    
    if (!cartItems || !totalElement) {
        console.error('Не найдены элементы корзины');
        return;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        totalElement.textContent = '0 ₽';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} ₽</p>
                    <div class="quantity">
                        <button onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')">Удалить</button>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    totalElement.textContent = total.toLocaleString() + ' ₽';
}

// Изменение количества товара
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
            updateCartCounter();
        } else {
            removeFromCart(name);
        }
    }
}

// Удаление товара из корзины
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCounter();
    showNotification('Товар удален из корзины');
}

// Показ уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Оформление заказа
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Корзина пуста');
                return;
            }
            
            showNotification('Заказ оформлен');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
            updateCartCounter();
        });
    }
});