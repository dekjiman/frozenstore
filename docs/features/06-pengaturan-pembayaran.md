# Pengaturan Pembayaran

Mengatur metode dan detail rekening untuk menerima pembayaran manual dari pelanggan.

## Spesifikasi

### Tujuan
Memungkinkan admin mengelola metode pembayaran manual agar pelanggan selalu melihat rekening tujuan dan instruksi transfer yang akurat saat checkout.
### Selesai bila
- Admin dapat menambah, mengedit, dan menghapus rekening bank tujuan.
- Admin dapat mengubah teks instruksi pembayaran.
- Perubahan rekening dan instruksi langsung tampil di halaman checkout pelanggan.
- Hanya admin yang dapat mengakses pengaturan pembayaran.

## Sub-fitur: Atur Rekening Tujuan

Menyimpan nomor rekening bank yang akan digunakan pelanggan untuk transfer.

### Tujuan
Menyimpan dan mengelola daftar rekening bank toko yang akan digunakan pelanggan untuk transfer.
### Selesai bila
- Admin melihat daftar rekening yang sudah tersimpan (nama bank, nomor rekening, nama pemilik).
- Tersedia tombol untuk menambah rekening baru, mengisi formulir: nama bank, nomor rekening, nama pemilik rekening.
- Setiap rekening bisa diedit atau dihapus.
- Data yang tersimpan otomatis muncul di halaman panduan transfer saat checkout.

## Sub-fitur: Atur Instruksi Pembayaran

Menulis teks panduan atau catatan penting untuk ditampilkan saat checkout.

### Tujuan
Menyimpan teks panduan atau catatan penting yang ditampilkan kepada pelanggan saat checkout.
### Selesai bila
- Admin melihat area teks yang dapat diisi dengan instruksi (misal: 'Mohon transfer tepat agar pesanan cepat diproses').
- Setelah admin menyimpan, teks tersebut langsung tampil di halaman checkout pelanggan, di bagian instruksi.
- Instruksi dapat diubah kapan saja dan perubahan langsung terlihat.

## Task

### 1. Buat halaman dan routing pengaturan pembayaran di dashboard admin

### 2. Buat komponen daftar rekening bank dengan data tiruan, termasuk fitur hapus

### 3. Buat form tambah dan edit rekening bank dengan data tiruan

### 4. Buat komponen editor instruksi pembayaran dengan data tiruan

### 5. Buat model dan migrasi tabel rekening bank

### 6. Buat model dan migrasi untuk menyimpan instruksi pembayaran

### 7. Buat API endpoint CRUD rekening bank khusus admin

### 8. Buat API endpoint untuk mengelola instruksi pembayaran (admin)

### 9. Buat API publik untuk menampilkan daftar rekening dan instruksi saat checkout

### 10. Terapkan middleware autentikasi dan otorisasi admin untuk endpoint pengaturan pembayaran
