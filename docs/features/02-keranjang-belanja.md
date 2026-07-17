# Keranjang Belanja

Menyimpan sementara produk yang ingin dibeli oleh pelanggan sebelum checkout.

## Spesifikasi

### Tujuan
Menyediakan tempat bagi pelanggan untuk mengumpulkan dan mengelola produk yang diminati sebelum memutuskan melakukan checkout, sehingga memudahkan pembelian beberapa barang sekaligus.

### Selesai bila
- Produk yang dimasukkan dari katalog atau halaman detail langsung muncul di keranjang dan tetap ada meskipun pelanggan berpindah-pindah halaman.
- Di dalam keranjang, pelanggan dapat dengan bebas mengubah jumlah setiap produk atau menghapusnya kapan saja.
- Total harga keseluruhan dihitung otomatis dan selalu diperbarui saat ada perubahan isi keranjang.
- Rincian setiap item (nama, jumlah, harga satuan, subtotal) terlihat jelas pada halaman ringkasan keranjang.
- Tersedia tombol \"Lanjut ke Checkout\" yang mengarahkan ke proses pengisian data pengiriman dan pembayaran.

## Sub-fitur: Tambah ke Keranjang

Memasukkan produk yang ingin dibeli ke keranjang belanja.

### Tujuan
Memberikan cara instan bagi pelanggan untuk menambahkan produk yang diinginkan ke dalam keranjang belanja dari halaman katalog maupun detail produk.

### Selesai bila
- Setiap produk memiliki tombol \"Tambah ke Keranjang\", baik di tampilan daftar maupun halaman detail.
- Begitu tombol ditekan, muncul pemberitahuan bahwa produk sudah masuk keranjang (misal notifikasi kecil atau jumlah di ikon keranjang bertambah).
- Produk yang baru ditambahkan langsung terlihat di halaman keranjang dengan informasi yang benar (nama, harga, jumlah awal).

## Sub-fitur: Atur Isi Keranjang

Mengubah jumlah, menghapus, atau melihat daftar produk yang sudah dipilih.

### Tujuan
Memberikan kendali penuh kepada pelanggan untuk memperbarui kuantitas atau menghapus item yang sudah ada di dalam keranjang sebelum melanjutkan ke checkout.

### Selesai bila
- Di halaman keranjang, setiap item dilengkapi tombol ‘+’ dan ‘–’ untuk mengubah jumlah, serta ikon atau tombol hapus.
- Perubahan jumlah atau penghapusan item langsung mengubah tampilan daftar dan total harga tanpa halaman dimuat ulang.
- Bila jumlah suatu item dikurangi menjadi nol, item tersebut otomatis hilang dari keranjang dan total harga menyesuaikan.

## Sub-fitur: Ringkasan Keranjang

Melihat total harga dan daftar item sebelum melanjutkan ke pembayaran.

### Tujuan
Menampilkan daftar lengkap isi keranjang beserta perhitungan total biaya agar pelanggan dapat memeriksa kembali pesanannya sebelum checkout.

### Selesai bila
- Setiap produk ditampilkan dengan gambar mini, nama, harga satuan, jumlah beli, dan subtotal (harga × jumlah).
- Total keseluruhan (jumlah semua subtotal) tertera jelas dan diperbarui otomatis setiap kali isi keranjang berubah.
- Di bagian bawah ringkasan terdapat tombol \"Lanjut ke Checkout\" yang siap ditekan untuk memulai proses pengisian alamat dan pembayaran.

## Task

### 1. Buat halaman ringkasan keranjang belanja dengan data tiruan

### 2. Implementasikan kontrol ubah jumlah dan hapus item di halaman keranjang

### 3. Buat state keranjang global dan fungsi tambah produk ke keranjang

### 4. Integrasikan tombol tambah ke keranjang pada komponen produk tiruan

### 5. Pasang notifikasi visual dan badge jumlah item di ikon keranjang

### 6. Buat skema database keranjang belanja beserta migrasi

### 7. Implementasi API endpoint CRUD untuk item keranjang

### 8. Lindungi endpoint keranjang dengan middleware otentikasi
