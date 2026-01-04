# JShope Frontend 🛍️

JShope adalah aplikasi e-commerce modern yang dibangun menggunakan Next.js. Proyek ini merupakan bagian frontend yang terhubung dengan backend JShope API.

🔗 **Repository:** [https://github.com/jelitarahma/jshope-frontend](https://github.com/jelitarahma/jshope-frontend)

## 🚀 Fitur Utama

*   **Belanja Online:** Jelajahi produk, kategori, dan detail produk.
*   **Keranjang Belanja:** Tambahkan produk ke keranjang dan kelola jumlahnya.
*   **Autentikasi User:** Login dan Register menggunakan JWT.
*   **Checkout:** Proses checkout yang mudah.
*   **Responsive Design:** Tampilan optimal di Desktop dan Mobile.
*   **Monitoring:** Terintegrasi dengan Google Analytics.

## 🛠️ Teknologi yang Digunakan

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **HTTP Client:** Axios
*   **Icons:** Lucide React / Heroicons
*   **Alerts:** SweetAlert2

## 📦 Persyaratan Sistem

Sebelum memulai, pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (Versi 18 atau terbaru disarankan)
*   npm (biasanya terinstall otomatis bersama Node.js)

## 🏃‍♂️ Cara Menjalankan Project (Localhost)

Ikuti langkah-langkah berikut untuk menjalankan project di komputer Anda:

1.  **Clone Repository**
    ```bash
    git clone https://github.com/jelitarahma/jshope-frontend.git
    cd jshope-frontend
    ```

2.  **Install Dependencies**
    Download semua library yang dibutuhkan:
    ```bash
    npm install
    # atau jika menggunakan yarn
    yarn install
    ```

3.  **Jalankan Server Development**
    Mulai aplikasi dalam mode development:
    ```bash
    npm run dev
    ```

4.  **Buka di Browser**
    Akses aplikasi melalui alamat: [http://localhost:3000](http://localhost:3000)

## 📝 Konfigurasi API

Aplikasi ini secara default terhubung ke backend production:
*   **Base URL:** `https://jshope-backend-phs3.vercel.app/jshope`
*   Konfigurasi ini terdapat di file `lib/api.js`.

---
*Dibuat oleh Jelita Rahma*
