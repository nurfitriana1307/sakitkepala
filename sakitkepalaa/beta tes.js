const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToDb, getDb } = require('./db');

const app = express();
const secretKey = '';

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

// Endpoint POST /transactions yang memerlukan token
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






app.use(express.json()); // Middleware to parse JSON request body

// GET endpoint to retrieve users
app.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const users = [];

    await db.collection('users')
      .find()
      .sort({ username: 1 }) // Assuming 'username' is a field in your collection
      .forEach((user) => {
        users.push(user);
      });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch the documents' });
  }
});

// POST endpoint to add a new user
app.post('/users', async (req, res) => {
  try {
    const db = getDb();
    const newUser = req.body; // Assuming the request body contains the new user data

    // Add validation or sanitation logic if needed

    const result = await db.collection('users').insertOne(newUser);

    res.status(201).json({ message: 'User added successfully', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Could not add the user' });
  }
});

// GET endpoint to retrieve login information
app.get('/login', async (req, res) => {
  try {
    const db = getDb();
    const loginData = [];

    await db.collection('login')
      .find()
      .sort({ username: 1 }) // Assuming 'username' is a field in your collection
      .forEach((login) => {
        loginData.push(login);
      });

    res.status(200).json(loginData);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch login information' });
  }
});

// POST endpoint to add new login information
app.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const newLoginInfo = req.body; // Mengasumsikan bahwa request body berisi data login baru

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    // Gantilah ini dengan logika generasi token yang sesuai dengan kebutuhan Anda
    const generatedToken = generateToken({ userId: newLoginInfo.userId });

    // Tambahkan token ke objek newLoginInfo
    newLoginInfo.token = generatedToken;

    const result = await db.collection('login').insertOne(newLoginInfo);

    res.status(201).json({ message: 'Informasi login berhasil ditambahkan', token: generatedToken, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Tidak dapat menambahkan informasi login' });
  }
});

// Gantilah ini dengan logika generasi token yang sesuai dengan kebutuhan Anda
function generateToken(payload) {
  return jwt.sign(payload, secretKey);
}

// GET endpoint to retrieve transaction data
app.get('/transaction', async (req, res) => {
  try {
    const db = getDb();
    const transactions = [];

    await db.collection('transaction')
      .find()
      .sort({ date: -1 }) // Assuming 'date' is a field in your collection
      .forEach((transaction) => {
        transactions.push(transaction);
      });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch transaction data' });
  }
});

// POST endpoint to add a new transaction
app.post('/transaction', async (req, res) => {
  try {
    const db = getDb();
    const newTransaction = req.body; // Assuming the request body contains the new transaction data

    // Add validation or sanitation logic if needed

    const result = await db.collection('transaction').insertOne(newTransaction);

    res.status(201).json({ message: 'Transaction added successfully', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Could not add the transaction' });
  }
});

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('App listening on port 3000');
    });
  } else {
    console.error('Error connecting to the database:', err);
  }
});
