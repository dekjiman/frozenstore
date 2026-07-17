# Checkout & Pembayaran Manual

Menyelesaikan pemesanan dengan memilih metode pembayaran manual transfer dan mengunggah bukti bayar.

## Spesifikasi

### Tujuan
Memungkinkan pelanggan menyelesaikan pesanan dengan mengisi alamat pengiriman, melihat panduan transfer manual, mengunggah bukti pembayaran, dan mendapatkan ringkasan pesanan untuk memastikan transaksi tercatat dengan benar.

### Selesai bila
- Pelanggan dapat mengisi formulir pengiriman lengkap (nama penerima, alamat, kontak) sebelum melanjutkan ke pembayaran.
- Halaman panduan transfer menampilkan nomor rekening tujuan dan instruksi langkah demi langkah yang jelas dan dapat diatur oleh admin.
- Pelanggan dapat mengunggah file gambar bukti transfer dan sistem menyimpannya terkait pesanan.
- Setelah mengunggah bukti, pelanggan melihat ringkasan pesanan yang mencakup detail produk, total bayar, alamat pengiriman, dan status pembayaran terkini.
- Status pembayaran awal adalah "Menunggu Pembayaran" dan berubah menjadi "Menunggu Verifikasi" setelah bukti diunggah (dapat dicek di halaman ringkasan).

## Sub-fitur: Formulir Pengiriman

Mengisi nama, alamat, dan kontak penerima agar pesanan bisa dikirim.

### Tujuan
Mengumpulkan data penerima pesanan agar admin dapat mengirimkan barang ke alamat yang tepat.

### Selesai bila
- Formulir berisi input untuk nama penerima, alamat lengkap (jalan, kota, kode pos), dan nomor kontak (telepon/WA).
- Sistem memvalidasi bahwa semua field wajib diisi sebelum pelanggan bisa melanjutkan ke langkah berikutnya.
- Data yang diisi tersimpan ke dalam pesanan dan dapat dilihat kembali di halaman ringkasan.

## Sub-fitur: Panduan Transfer

Menampilkan nomor rekening tujuan dan instruksi langkah demi langkah untuk transfer.

### Tujuan
Memberikan informasi rekening tujuan dan langkah-langkah transfer yang dapat diikuti pelanggan.

### Selesai bila
- Halaman menampilkan daftar rekening bank toko (nama bank, nomor rekening, atas nama) yang aktif dan diambil dari pengaturan admin.
- Instruksi transfer berupa teks langkah demi langkah (misal: 1. Catat total bayar, 2. Pilih bank tujuan, 3. Lakukan transfer, 4. Simpan bukti) ditampilkan dengan jelas.
- Total nominal yang harus dibayar ditampilkan dengan angka yang sesuai dengan ringkasan keranjang.

## Sub-fitur: Konfirmasi Pembayaran

Mengunggah bukti transfer agar pesanan bisa diproses oleh penjual.

### Tujuan
Menerima unggahan bukti transfer dari pelanggan sebagai tanda pembayaran telah dilakukan.

### Selesai bila
- Terdapat tombol atau area unggah untuk memilih file gambar (JPG, PNG) dari perangkat.
- Setelah file dipilih, sistem menampilkan pratinjau (preview) bukti sebelum dikirim.
- Setelah konfirmasi unggah, file tersimpan dan status pesanan berubah menjadi "Menunggu Verifikasi" serta bukti dapat dilihat oleh admin.

## Sub-fitur: Ringkasan Pesanan

Menampilkan kembali detail pesanan, total, dan status pembayaran sebelum dikirim.

### Tujuan
Menampilkan kembali seluruh detail pesanan, alamat, total, dan status pembayaran agar pelanggan yakin sebelum dan setelah pembayaran.

### Selesai bila
- Halaman menampilkan daftar produk yang dibeli (nama, jumlah, harga satuan, subtotal).
- Alamat pengiriman, total bayar, dan status pembayaran terkini terlihat dengan jelas.
- Jika pembayaran belum dilakukan, terdapat tombol untuk menuju ke panduan transfer/konfirmasi; jika sudah diunggah, muncul status "Menunggu Verifikasi" atau "Diproses" sesuai status di sistem.

## Task

### 1. Buat halaman checkout multi-step dengan indikator langkah menggunakan data tiruan

### 2. Tambahkan formulir pengiriman pada langkah pertama dengan validasi dan data tiruan

### 3. Tambahkan panduan transfer pada langkah kedua dengan data tiruan rekening dan instruksi

### 4. Tambahkan unggah bukti transfer pada langkah ketiga dengan pratinjau gambar dan konfirmasi

### 5. Tambahkan ringkasan pesanan pada langkah keempat dengan data tiruan produk dan status

### 6. Buat migrasi tabel orders tambahkan kolom alamat pengiriman dan status pembayaran

### 7. Buat migrasi tabel rekening_toko untuk menyimpan data bank toko

### 8. Buat migrasi tabel instruksi_transfer untuk menyimpan langkah-langkah transfer

### 9. Buat API endpoint untuk menyimpan data pengiriman pesanan

### 10. Buat API endpoint daftar rekening aktif untuk panduan transfer

### 11. Buat API endpoint instruksi transfer untuk panduan

### 12. Buat API endpoint unggah bukti transfer dan update status pesanan ke Menunggu Verifikasi

### 13. Buat API endpoint ringkasan pesanan yang mengembalikan detail pesanan, alamat, total, dan status

### 14. Buat API endpoint admin untuk mengelola rekening bank dan instruksi transfer
