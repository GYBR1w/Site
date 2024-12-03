const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('shop.db');

const products = [
    {
        name: "Краска интерьерная",
        article: "INT-001",
        price: 2500,
        old_price: 2800,
        category: "Краски",
        brand: "ColorMaster",
        description: "Высококачественная краска для внутренних работ",
        specifications: "Матовая, водно-дисперсионная",
        volume: 5,
        weight: 5.5,
        color: "Белый",
        coverage_area: 50,
        drying_time: 4,
        shelf_life: 24,
        application_method: "Кисть, валик, распылитель",
        surface_type: "Стены и потолок",
        stock_quantity: 100,
        image_url: "images/product1.jpg",
        is_available: true
    },
    {
        name: "Эмаль ПФ-115",
        article: "PF-115",
        price: 750,
        old_price: null,
        category: "Эмали",
        brand: "ЛакоКраска",
        description: "Универсальная эмаль для наружных и внутренних работ",
        specifications: "Глянцевая, алкидная",
        volume: 0.9,
        weight: 1,
        color: "Синий",
        coverage_area: 10,
        drying_time: 24,
        shelf_life: 18,
        application_method: "Кисть, валик",
        surface_type: "Металл, дерево",
        stock_quantity: 150,
        image_url: "images/product2.jpg",
        is_available: true
    },
    {
        name: "Грунтовка глубокого проникновения",
        article: "GR-001",
        price: 1200,
        old_price: 1500,
        category: "Грунтовки",
        brand: "PrimerPro",
        description: "Грунтовка для подготовки поверхностей перед покраской",
        specifications: "Акриловая",
        volume: 10,
        weight: 10.2,
        color: "Прозрачный",
        coverage_area: 100,
        drying_time: 2,
        shelf_life: 36,
        application_method: "Кисть, валик, распылитель",
        surface_type: "Универсальная",
        stock_quantity: 75,
        image_url: "images/product3.jpg",
        is_available: true
    }
];

// Добавляем продукты в базу данных
db.serialize(() => {
    const stmt = db.prepare(`
        INSERT INTO products (
            name, article, price, old_price, category, brand, description, 
            specifications, volume, weight, color, coverage_area, drying_time, 
            shelf_life, application_method, surface_type, stock_quantity, 
            image_url, is_available
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    products.forEach(product => {
        stmt.run(
            product.name,
            product.article,
            product.price,
            product.old_price,
            product.category,
            product.brand,
            product.description,
            product.specifications,
            product.volume,
            product.weight,
            product.color,
            product.coverage_area,
            product.drying_time,
            product.shelf_life,
            product.application_method,
            product.surface_type,
            product.stock_quantity,
            product.image_url,
            product.is_available
        );
    });
    
    stmt.finalize();
    
    console.log('Products imported successfully');
    
    // Проверяем что данные добавились
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            console.error('Error checking products:', err);
            return;
        }
        console.log('Current products in database:');
        console.log(rows);
        db.close();
    });
});
