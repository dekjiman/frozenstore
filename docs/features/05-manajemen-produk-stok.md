# Manajemen Produk & Stok

Mengelola produk dan stok toko agar selalu terupdate di halaman pelanggan.

## Spesifikasi

### Tujuan
Membantu admin menambah, mengubah, menghapus produk, serta memantau stok agar informasi yang tampil di halaman pelanggan selalu akurat dan mencegah penjualan melebihi stok.
### Selesai bila
- Admin bisa menambahkan produk baru dengan SKU unik, nama, gambar, harga, dan stok awal, lalu produk langsung muncul di katalog pelanggan.
- Admin bisa mengubah data produk (kecuali SKU jika sudah ada stok) atau menghapus produk yang tidak dijual.
- Admin bisa mencatat penambahan stok masuk untuk produk yang sudah ada, dan stok langsung bertambah.
- Tersedia halaman riwayat perubahan stok yang mencatat setiap penambahan/pengurangan beserta waktu, jumlah, dan alasan.
- Dashboard admin menampilkan stok terkini setiap produk, dan angka ini otomatis berkurang saat pesanan berhasil.

## Sub-fitur: Tambah Produk Baru

Menambah produk ke toko dengan SKU unik, nama, gambar, harga, dan stok awal.

### Tujuan
Memudahkan admin memasukkan barang baru ke toko dengan data lengkap dan SKU yang tidak boleh sama.
### Selesai bila
- Tersedia formulir isian SKU, nama, deskripsi, harga, stok awal, dan unggahan gambar.
- Sistem menolak SKU yang sudah ada dan memberi tahu admin.
- Setelah disimpan, produk langsung terlihat di daftar produk dan halaman katalog pelanggan.

## Sub-fitur: Edit & Hapus Produk

Mengubah informasi produk atau menghapusnya dari katalog.

### Tujuan
Memberi admin kemampuan untuk memperbarui informasi produk atau menghapusnya dari katalog.
### Selesai bila
- Admin dapat mengubah nama, harga, deskripsi, gambar, atau SKU (dengan validasi unik) dari produk yang dipilih.
- Tersedia tombol hapus yang menghilangkan produk dari tampilan pelanggan.
- Perubahan yang disimpan langsung terlihat di daftar produk dan katalog.

## Sub-fitur: Tambah Stok Masuk

Menambah jumlah stok produk yang sudah ada.

### Tujuan
Mencatat penambahan fisik stok barang sehingga stok di sistem bertambah dan tercatat.
### Selesai bila
- Admin dapat memilih produk, lalu memasukkan jumlah stok yang masuk.
- Sistem mencatat riwayat stok bertipe

## Sub-fitur: Riwayat Perubahan Stok

Melihat catatan semua penambahan dan pengurangan stok beserta waktu dan jumlahnya.

## Sub-fitur: Stok Terkini

Menampilkan jumlah stok setiap produk saat ini agar tidak kehabisan.

## Task

### 1. Buat layout admin untuk manajemen produk beserta halaman daftar produk

### 2. Buat formulir tambah produk baru dengan validasi SKU unik lokal

### 3. Buat formulir edit produk dengan pembatasan SKU dan validasi unik

### 4. Implementasi tombol hapus produk dengan konfirmasi di halaman daftar

### 5. Buat halaman tambah stok masuk dengan pemilihan produk dan input jumlah

### 6. Buat halaman riwayat perubahan stok dengan filter dan data tiruan

### 7. Buat komponen dashboard stok terkini dengan indikator stok rendah

### 8. Buat skema database dan migrasi tabel produk

### 9. Buat skema database dan migrasi tabel riwayat perubahan stok

### 10. Buat endpoint CRUD produk dengan validasi SKU unik dan penghapusan lunak

### 11. Buat endpoint pencatatan stok masuk dan pembaruan stok produk

### 12. Buat endpoint riwayat perubahan stok dengan filter produk dan rentang waktu

### 13. Buat endpoint stok terkini untuk dashboard admin

### 14. Buat layanan pengurangan stok otomatis saat pesanan sukses dan catat riwayat
