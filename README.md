# GadgetFlow

Web app sederhana untuk sistem penjualan dan retur gadget.

## Struktur

```text
index.html
styles.css
script.js
app.js
supabase.sql
README.md
```

## ERD 10 entitas

`customers`, `employees`, `categories`, `suppliers`, `products`, `sales`, `sale_items`, `returns`, `return_items`, `payments`.

Relasi utama: customer memiliki sales dan returns; employee menangani sales dan returns; category dan supplier memiliki products; sales memiliki sale_items, returns, dan payments; product digunakan oleh sale_items dan return_items.

## Menjalankan

1. Jalankan seluruh `supabase.sql` di Supabase SQL Editor.
2. Pastikan Node.js 18+ tersedia.
3. Opsional, set kredensial Supabase di PowerShell:

```powershell
$env:SUPABASE_URL="https://PROJECT_ID.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY"
```

4. Jalankan `node app.js`, lalu buka `http://localhost:3000`.

Tanpa kredensial, aplikasi berjalan dalam mode demo lokal. Tidak diperlukan `package.json` atau `env.example`. Untuk deployment publik, aktifkan RLS dan policy Supabase yang sesuai.
