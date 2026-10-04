const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const allowedCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

// GET all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, amount, category, TO_CHAR(date, \'YYYY-MM-DD\') AS date FROM expenses ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new expense
app.post('/api/expenses', async (req, res) => {
    const { title, amount, category, date } = req.body;
    
    if (!title || !amount || !category || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING id, title, amount, category, TO_CHAR(date, \'YYYY-MM-DD\') AS date',
            [title, amount, category, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID format' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});