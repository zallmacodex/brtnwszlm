// Mengambil daftar berita dari API
fetch('https://zallma-mews-api.vercel.app/api/berita')
  .then(response => response.json())
  .then(data => {
    const beritaList = document.getElementById('berita-list');
    data.forEach(berita => {
      const beritaItem = document.createElement('div');
      beritaItem.classList.add('berita-item');
      beritaItem.innerHTML = `
        <h3>${berita.judul}</h3>
        <p>${berita.tanggal}</p>
      `;
      beritaItem.onclick = () => {
        localStorage.setItem('beritaId', berita.id);
        window.location.href = 'berita.html';
      };
      beritaList.appendChild(beritaItem);
    });
  });

// Menampilkan detail berita di halaman berita.html
if (window.location.pathname.includes('berita.html')) {
  const beritaId = localStorage.getItem('beritaId');
  fetch(`https://zallma-mews-api.vercel.app/api/berita/${beritaId}`)
    .then(response => response.json())
    .then(data => {
      const beritaDetail = document.getElementById('berita-detail');
      beritaDetail.innerHTML = `
        <h2>${data.judul}</h2>
        <img src="${data.foto[0]}" alt="${data.judul}">
        <p>${data.teks}</p>
      `;
    });
}

// Login admin
if (window.location.pathname.includes('admin.html')) {
  document.getElementById('login-form').onsubmit = (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('https://zallma-mews-api.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = 'admin-panel.html';
      } else {
        alert('Login gagal!');
      }
    });
  };
}