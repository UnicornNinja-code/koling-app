# Frontend Optimization & Engineering Guidelines (MantaKopi DSS App)

Setiap pengembangan dan penambahan fitur pada area **frontend** proyek MantaKopi DSS harus mematuhi panduan optimasi dan arsitektur berikut:

## 1. Optimasi Manajemen Data (Data Fetching & Caching)
- **TanStack Query (React Query) / SWR**: Gunakan pustaka manajemen data fetching untuk setiap request API yang berulang (misal: data statistik dashboard, ranking TOPSIS, data spasial geofence, daftar armada, dan daftar rider).
- **Manfaat**: Menghindari pemanggilan API berulang (*deduplication*), manajemen memori & caching otomatis, background revalidation, serta handling state `isLoading`, `isFetching`, dan `isError` secara bersih tanpa membebankan `useEffect`.

## 2. Manajemen Form & Validasi (Complex DSS Input Forms)
- **React Hook Form + Zod**: Untuk fitur input dinamis dan kompleks (seperti Form Perhitungan BWM/TOPSIS, Form Klaim Armada 5-Menit, dan Form Manajemen User/Zona), gunakan **React Hook Form** yang dikombinasikan dengan **Zod Schema Validation**.
- **Manfaat**: Menghindari re-render yang tidak perlu pada setiap keystroke (*uncontrolled input optimization*), integrasi bawaan dengan komponen form `shadcn/ui`, dan penanganan pesan kesalahan (*validation error messages*) yang konsisten.

## 3. Setup API Interceptors (Keamanan & Autentikasi Terpusat)
- **Centralized Axios Client (`src/lib/axios.js`)**: Gunakan instance Axios terpusat untuk seluruh komunikasi HTTP ke backend API.
- **Request Interceptor**: Otomatis menyisipkan token JWT (`Authorization: Bearer <token>`) pada setiap HTTP request outbound.
- **Response Interceptor**: Mencegat error `401 Unauthorized` atau `403 Forbidden` secara global untuk penanganan sesi kadaluarsa, otomatis me-log out pengguna, atau mengarahkan ke halaman login secara aman.

## 4. Code Splitting & Lazy Loading (Optimasi Performa Loading)
- **React.lazy() & <Suspense>**: Terapkan *code splitting* berbasis rute dan komponen, terutama pada modul yang menggunakan pustaka pihak ketiga yang berat (seperti Leaflet / Mapbox GIS spatial map, Recharts charts, dan laporan pdf/export).
- **Manfaat**: Pengguna tidak perlu mengunduh bundel JavaScript peta spasial ketika hanya mengakses halaman dashboard/login, sehingga waktu *First Contentful Paint (FCP)* aplikasi tetap sangat cepat.

## 5. Error Boundaries & Fallback UI (Resiliensi Komponen)
- **React Router `errorElement` & Component `<ErrorBoundary>`**: Gunakan error element pada konfigurasi rute React Router v7 serta bungkus widget/komponen rentang error (seperti Chart Card atau Peta Spasial) dalam Error Boundary.
- **Manfaat**: Jika terjadi kegagalan render atau jaringan terputus pada satu modul khusus, modul tersebut akan menampilkan *Fallback Error UI* yang informatif tanpa menyebabkan seluruh tampilan aplikasi menjadi putih/crash (*blank screen*).
