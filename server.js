const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

let liveProducts = [];
let orders = [];

// Fetch live products
async function fetchProducts() {
    try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        liveProducts = data.products.map(p => ({
            id: p.id,
            name: `${p.brand ? p.brand + ' - ' : ''}${p.title}`,
            category: p.category,
            price: Math.round(p.price * 83),
            originalPrice: Math.round((p.price * 83) / (1 - (p.discountPercentage / 100))),
            discount: Math.round(p.discountPercentage),
            rating: p.rating,
            ratingCount: Math.floor(p.rating * 1200),
            image: p.thumbnail,
            delivery: p.price > 50 ? "FREE Delivery by Tomorrow" : "Delivery in 2-3 Days",
            isDeal: p.discountPercentage > 15,
            description: p.description,
            stock: p.stock,
            brand: p.brand || "Authentic"
        }));
    } catch (e) {}
}
fetchProducts();

app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let results = liveProducts;
    if (category && category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
        const q = search.toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    res.json(results);
});

app.get('/api/categories', (req, res) => {
    const categories = [...new Set(liveProducts.map(p => p.category))];
    res.json(categories);
});

app.get('/api/orders', (req, res) => res.json(orders));
app.post('/api/orders', (req, res) => {
    const order = { id: 'AMZ-IN-' + Date.now().toString().slice(-6), date: new Date().toLocaleDateString('en-IN'), ...req.body };
    orders.unshift(order);
    res.status(201).json(order);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
    console.log(`🚀 Live on Port ${PORT}`);
});
