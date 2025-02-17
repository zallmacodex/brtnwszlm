const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;
const SECRET_KEY = "zallma_secret";

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// Setup penyimpanan gambar dengan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Load akun admin
const loadAdmin = () => JSON.parse(fs.readFileSync("akun.json", "utf-8"));
const loadBerita = () => JSON.parse(fs.readFileSync("berita.json", "utf-8"));

// **1. Endpoint Login Admin**
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const admin = loadAdmin();
  
  if (admin.username === username && bcrypt.compareSync(password, admin.password)) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Login gagal!" });
  }
});

// **2. Endpoint Ambil Berita**
app.get("/api/berita", (req, res) => {
  res.json(loadBerita());
});

// Middleware verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token diperlukan" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token tidak valid" });
    req.user = decoded;
    next();
  });
};

// **3. Endpoint Tambah Berita**
app.post("/api/add-berita", verifyToken, upload.fields([{ name: "icon" }, { name: "foto" }]), (req, res) => {
  let berita = loadBerita();
  const { judul, deskripsi, teks } = req.body;
  
  const newBerita = {
    id: Date.now(),
    judul,
    deskripsi,
    teks,
    tanggal: new Date().toISOString().split("T")[0],
    icon: req.files["icon"] ? req.files["icon"][0].filename : null,
    foto: req.files["foto"] ? req.files["foto"].map(file => file.filename) : [],
  };

  berita.push(newBerita);
  fs.writeFileSync("berita.json", JSON.stringify(berita, null, 2));
  res.json({ success: true, message: "Berita berhasil ditambahkan!" });
});

// **4. Endpoint Hapus Berita**
app.delete("/api/delete-berita/:id", verifyToken, (req, res) => {
  let berita = loadBerita();
  berita = berita.filter(b => b.id !== parseInt(req.params.id));

  fs.writeFileSync("berita.json", JSON.stringify(berita, null, 2));
  res.json({ success: true, message: "Berita berhasil dihapus!" });
});

// **5. Menjalankan Server**
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));