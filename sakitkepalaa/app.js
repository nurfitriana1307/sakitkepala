const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
const app = express();
const secretKey = 'sakitkepala'; // Ganti dengan kunci rahasia yang seharusnya aman.

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





app.get('/transaction', async (req, res) => {
  try {
    const db = getDb();
    const transactions = await db.collection('transaction')
      .find()
      .sort({ date: -1 })
      .toArray();

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    res.status(500).json({ error: 'Could not fetch transaction data' });
  }
});


//GET /transactions/:id_transaction 
app.get('/transaction/:id', async (req, res) => {
  try {
    const db = getDb();
    const idTransaction = req.params.id;

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const transaction = await db.collection('transaction').findOne({ id: ObjectId.createFromHexString(idTransaction) });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    console.log("ID Transaksi:", transaction._id);

    // Menghilangkan properti yang tidak perlu dikirim ke klien
    const { _id, ...filteredTransaction } = transaction;

    res.status(200).json(filteredTransaction);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    res.status(500).json({ error: 'Tidak dapat mengambil data transaksi' });
  }
});




// ...

// Endpoint PUT /transactions/:id_transaction
app.put('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const idTransaction = req.params.id;
    const updatedTransactionData = req.body; // Assuming that the request body contains the updated data

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const result = await db.collection('transactions').updateOne(
      { _id: ObjectId.createFromHexString(idTransaction) },
      { $set: updatedTransactionData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.status(200).json({ message: 'Transaksi berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Tidak dapat memperbarui transaksi' });
  }
});

// ...





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

// Endpoint POST /login
app.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const newLoginInfo = req.body; // Mengasumsikan bahwa request body berisi data login baru

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const generatedToken = generateToken({ userId: newLoginInfo.userId });

    newLoginInfo.token = generatedToken;

    const result = await db.collection('login').insertOne(newLoginInfo);

    res.status(201).json({ message: 'Informasi login berhasil ditambahkan', token: generatedToken, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Tidak dapat menambahkan informasi login' });
  }
});

// Endpoint GET /transaction
app.get('/transaction', async (req, res) => {
  try {
    const db = getDb();
    const transactions = [];

    await db.collection('transaction')
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

// Endpoint POST /transaction
app.post('/transactions', async (req, res) => {
  try {
    const db = getDb();
    const newTransaction = req.body; // Mengasumsikan bahwa request body berisi data transaksi baru

    // Dapatkan token dari header Authorization
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak valid atau tidak disertakan' });
    }

    const user = verifyToken(token.replace('Bearer ', ''));

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const result = await db.collection('transactions').insertOne(newTransaction);

    res.status(201).json({ message: 'Transaksi berhasil ditambahkan', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Tidak dapat menambahkan transaksi' });
  }
});




app.get('/transaction/:id', async (req, res) => {
  try {
    const db = getDb();
    const idTransaction = req.params.id;

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const transaction = await db.collection('transaction').findOne({ _id: ObjectId.createFromHexString(idTransaction) });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    console.log("ID Transaksi:", transaction._id);

    // Menghilangkan properti yang tidak perlu dikirim ke klien
    const { _id, ...filteredTransaction } = transaction;

    res.status(200).json(filteredTransaction);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    res.status(500).json({ error: 'Tidak dapat mengambil data transaksi' });
  }
});



// Endpoint GET /users
app.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const users = [];

    await db.collection('users')
      .find()
      .sort({ username: 1 })
      .forEach((user) => {
        users.push(user);
      });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch the documents' });
  }
});

// Endpoint POST /users
app.post('/users', async (req, res) => {
  try {
    const db = getDb();
    const newUser = req.body;

    // Tambahkan logika validasi atau sanitasi jika diperlukan

    const result = await db.collection('users').insertOne(newUser);

    res.status(201).json({ message: 'User added successfully', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Could not add the user' });
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

// Gantilah ini dengan logika generasi token yang sesuai dengan kebutuhan Anda
function generateToken(payload) {
  return jwt.sign(payload, secretKey);
}

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('App listening on port 3000');
    });
  } else {
    console.error('Error connecting to the database:', err);
  }
});
