const express = require('express');
const cors = require('cors');
const { dropsPool, initDropsDB } = require('./db_drops');

const app = express();
app.use(cors()); // Pozwala stronie na łączenie się z botem
app.use(express.json());

// API: Pobieranie wszystkich dropów z wyliczoną średnią
app.get('/api/drops', async (req, res) => {
    try {
        const [drops] = await dropsPool.query(`
            SELECT d.*, 
                   IFNULL(AVG(r.rating), 0) as avg_rating, 
                   COUNT(r.id) as review_count 
            FROM drops d 
            LEFT JOIN reviews r ON d.id = r.drop_id 
            GROUP BY d.id 
            ORDER BY d.created_at DESC
        `);
        res.json(drops);
    } catch (e) {
        res.status(500).json({ error: "Błąd bazy danych" });
    }
});

// API: Pobieranie opinii dla konkretnego dropu
app.get('/api/drops/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await dropsPool.query('SELECT * FROM reviews WHERE drop_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: "Błąd bazy danych" });
    }
});

// Inicjalizacja obu baz, Discorda i API
Promise.all([initDB(), initDropsDB()]).then(() => {
    client.login(process.env.TOKEN);
    
    const PORT = process.env.WEB_PORT || 3000;
    app.listen(PORT, () => {
        console.log(`API Strony McDropTier wystartowało na porcie ${PORT}`);
    });
});
