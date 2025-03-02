// server.js
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Для токенов

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = 'your-secret-key'; // Замените на свой секретный ключ

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'QWERTY',
    port: 5432,
});

// Создание таблиц
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        recipe_id VARCHAR(50),
        UNIQUE(user_id, recipe_id)
    );
`, (err) => {
    if (err) console.error(err);
    else console.log("Таблицы готовы!");
});

// Регистрация
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email уже зарегистрирован!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hashedPassword]);
        res.json({ message: "Регистрация успешна!" });
    } catch (err) {
        console.error("Ошибка регистрации:", err);
        res.status(500).json({ message: "Ошибка сервера!" });
    }
});

// Вход
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (!user.rows.length || !(await bcrypt.compare(password, user.rows[0].password))) {
            return res.status(400).json({ message: "Неверный email или пароль!" });
        }
        const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Вход успешен!", token, username: user.rows[0].username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ошибка сервера!" });
    }
});

// Информация о пользователе
// server.js (фрагмент эндпоинта /profile)
app.get('/profile', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Не авторизован" });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await pool.query("SELECT username, email FROM users WHERE id = $1", [decoded.id]);
        const likes = await pool.query("SELECT recipe_id FROM likes WHERE user_id = $1", [decoded.id]);
        res.json({ 
            username: user.rows[0].username, 
            email: user.rows[0].email, 
            likes: likes.rows.map(row => row.recipe_id)
        }); // Убрали ip: req.ip
    } catch (err) {
        res.status(401).json({ message: "Неверный токен" });
    }
});

// Лайк/анлайк рецепта
app.post('/like', async (req, res) => {
    const { recipeId } = req.body;
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Не авторизован" });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const exists = await pool.query("SELECT * FROM likes WHERE user_id = $1 AND recipe_id = $2", [decoded.id, recipeId]);
        if (exists.rows.length > 0) {
            await pool.query("DELETE FROM likes WHERE user_id = $1 AND recipe_id = $2", [decoded.id, recipeId]);
            res.json({ message: "Лайк убран", liked: false });
        } else {
            await pool.query("INSERT INTO likes (user_id, recipe_id) VALUES ($1, $2)", [decoded.id, recipeId]);
            res.json({ message: "Лайк добавлен", liked: true });
        }
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"));