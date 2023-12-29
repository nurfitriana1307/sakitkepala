const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToDb, getDb } = require('./db');

const app = express();
const secretKey = 'sakitkepala';

app.use(express.json()); // Middleware untuk parse JSON request body

// Middleware untuk memeriksa keberadaan token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Simpan informasi pengguna yang di-decode untuk digunakan dalam rute
    req.user = decoded;
    next();
  });
};

// Endpoint POST /login
app.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body; // Mengambil email dan password dari body request

    // Tambahkan logika validasi atau sanitasi jika diperlukan
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    // Periksa apakah email dan password cocok dengan data di database
    const user = await db.collection('users').findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Email atau password tidak valid' });
    }

    // Gantilah ini dengan logika generasi token yang sesuai dengan kebutuhan Anda
    const generatedToken = generateToken({ userId: user.userId });

    // Tambahkan token ke objek respons
    res.status(200).json({ message: 'Login berhasil', token: generatedToken });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat proses login' });
  }
});

// Endpoint GET /transactions
app.get('/transactions', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const transactions = [];

    await db.collection('transactions')
      .find()
      .sort({ date: -1 })
      .forEach((transaction) => {
        transactions.push(transaction);
      });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch transaction data' });
  }
});

// Endpoint POST /transactions
app.post('/transactions', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const newTransaction = req.body; // Mengasumsikan bahwa request body berisi data transaksi baru

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const result = await db.collection('transactions').insertOne(newTransaction);

    res.status(201).json({ message: 'Transaksi berhasil ditambahkan', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Tidak dapat menambahkan transaksi' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body; // Mengambil email dan password dari body request

    // Tambahkan logika validasi atau sanitasi jika diperlukan
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    // Periksa apakah email dan password cocok dengan data di database
    const user = await db.collection('users').findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Email atau password tidak valid' });
    }

    // Gantilah ini dengan logika generasi token yang sesuai dengan kebutuhan Anda
    const generatedToken = generateToken({ userId: user.userId });

    // Tambahkan token ke objek respons
    res.status(200).json({ message: 'Login berhasil', token: generatedToken });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat proses login' });
  }
});