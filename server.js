const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Создаем подключение к базе данных
const db = new sqlite3.Database('shop.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Создаем таблицу products, если она не существует
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,                    -- Название товара
            article TEXT UNIQUE,                   -- Артикул товара
            price REAL NOT NULL,                   -- Цена
            old_price REAL,                        -- Старая цена (для скидок)
            category TEXT NOT NULL,                -- Категория товара
            brand TEXT,                            -- Производитель
            description TEXT,                      -- Описание товара
            specifications TEXT,                   -- Технические характеристики
            volume REAL,                           -- Объем (в литрах)
            weight REAL,                           -- Вес (в кг)
            color TEXT,                            -- Цвет
            coverage_area REAL,                    -- Площадь покрытия (м²)
            drying_time INTEGER,                   -- Время высыхания (в часах)
            shelf_life INTEGER,                    -- Срок годности (в месяцах)
            application_method TEXT,               -- Способ нанесения
            surface_type TEXT,                     -- Тип поверхности
            stock_quantity INTEGER DEFAULT 0,      -- Количество на складе
            image_url TEXT,                        -- Ссылка на изображение
            is_available BOOLEAN DEFAULT 1,        -- Доступность товара
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Дата добавления
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Дата обновления
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
            } else {
                console.log('Products table ready');
            }
        });
    }
});

// API endpoints

// Получить все продукты
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Добавить новый продукт
app.post('/api/products', (req, res) => {
    const { 
        name, 
        article, 
        price, 
        old_price, 
        category, 
        brand, 
        description, 
        specifications, 
        volume, 
        weight, 
        color, 
        coverage_area, 
        drying_time, 
        shelf_life, 
        application_method, 
        surface_type, 
        stock_quantity, 
        image_url, 
        is_available 
    } = req.body;
    db.run(
        'INSERT INTO products (name, article, price, old_price, category, brand, description, specifications, volume, weight, color, coverage_area, drying_time, shelf_life, application_method, surface_type, stock_quantity, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ 
            name, 
            article, 
            price, 
            old_price, 
            category, 
            brand, 
            description, 
            specifications, 
            volume, 
            weight, 
            color, 
            coverage_area, 
            drying_time, 
            shelf_life, 
            application_method, 
            surface_type, 
            stock_quantity, 
            image_url, 
            is_available 
        ],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                message: 'Product added successfully'
            });
        }
    );
});

// Получить продукт по ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(row);
    });
});

// Обновить продукт
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    console.log('Получен PUT запрос для ID:', id);
    console.log('Данные для обновления:', req.body);

    const updateFields = [];
    const updateValues = [];
    
    // Динамически формируем SQL запрос только для тех полей, которые были переданы
    Object.entries(req.body).forEach(([key, value]) => {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
    });
    
    // Добавляем updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Добавляем id в конец массива значений
    updateValues.push(id);
    
    const updateQuery = `
        UPDATE products 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
    `;
    
    console.log('SQL запрос:', updateQuery);
    console.log('Значения:', updateValues);

    db.run(updateQuery, updateValues, function(err) {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        
        // Получаем обновленный продукт
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('Обновленный продукт:', product);
            res.json({
                message: 'Product updated successfully',
                product: product
            });
        });
    });
});

// Удалить продукт
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM products WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Запуск сервера
if (!module.parent) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}