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

    // Обработка сворачивания/разворачивания фильтров
    const filterTitles = document.querySelectorAll('.filter-title');
    
    filterTitles.forEach(title => {
        const content = title.nextElementSibling;
        // По умолчанию скрываем контент
        content.style.display = 'none';
        
        title.addEventListener('click', () => {
            // Переключаем класс active для иконки
            title.classList.toggle('active');
            
            // Плавно показываем/скрываем контент
            if (content.style.display === 'none') {
                content.style.display = 'block';
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
            } else {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                setTimeout(() => {
                    content.style.display = 'none';
                }, 300);
            }
        });
    });

    // Функция для отображения товаров на странице
    async function displayProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) {
            console.error('Не найден элемент .products-grid');
            return;
        }

        try {
            console.log('Загрузка товаров...');
            const products = await getProducts();
            console.log('Полученные товары:', products);
            
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card" data-id="${product.id}">
                    ${product.is_new ? '<div class="product-badge new">Новинка</div>' : ''}
                    ${product.is_hit ? '<div class="product-badge">Хит</div>' : ''}
                    ${product.discount ? '<div class="product-badge sale">-${product.discount}%</div>' : ''}
                    <img src="${product.image_url}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-features">
                        <span><i class="fas fa-paint-roller"></i> ${product.coverage_area} м²/л</span>
                        <span><i class="fas fa-clock"></i> ${product.drying_time} часа</span>
                    </div>
                    <p class="product-price">${product.price} ₽</p>
                    <button class="add-to-cart-btn" 
                            onclick="addToCart('${product.name}', ${product.price}, '${product.image_url}')" 
                            data-id="${product.id}"
                            data-name="${product.name}"
                            data-price="${product.price}"
                            data-image="${product.image_url}">
                        В корзину
                    </button>
                </div>
            `).join('');
            
            console.log('Товары успешно отображены');
        } catch (error) {
            console.error('Ошибка при загрузке товаров:', error);
        }
    }

    displayProducts();
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
    // Удаляем предыдущее уведомление, если оно есть
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification show';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Обработка формы заказа
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
});

// Функция обработки отправки формы
function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    // Собираем данные формы
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };
    
    console.log('Данные заказа:', formData);
    
    // Очищаем корзину
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Показываем сообщение об успехе
    showNotification('Готово! Скоро с вами свяжется оператор для подтверждения заказа');
    
    // Очищаем форму
    this.reset();
    
    // Обновляем отображение
    displayCart();
    updateCartCounter();
    
    // Перенаправляем на главную через 3 секунды
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Функции для работы с API товаров
const API_URL = 'http://localhost:3000/api';  // Убедитесь, что этот URL правильный

// Получить все товары
async function getProducts() {
    try {
        console.log('Запрос товаров из API...');
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        console.log('Получены товары:', products);
        return products;
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        return [];
    }
}

// Получить один товар по ID
async function getProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        return null;
    }
}

// Добавить новый товар
async function addProduct(productData) {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка при добавлении товара:', error);
        return null;
    }
}

// Обновить существующий товар
async function updateProduct(id, productData) {
    try {
        console.log('Отправка запроса на обновление:', id, productData); // Добавляем логирование
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        console.log('Ответ от сервера:', result); // Добавляем логирование
        
        // После успешного обновления, обновляем отображение товаров на странице
        await displayProducts();
        
        return result;
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        return null;
    }
}

// Удалить товар
async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        return null;
    }
}