# Pembaruan Skema Database untuk Skala Multi-User MOVA App
- pembaruan terkait alur pendaftaran role atau entitas bisnis 
    - pendaftaran entitas bisnis dengan alur bersusun 
    1. user bisnis ingin mendaftar ke aplikasi mova
    2. user melakukan pembayaran ke layanan aplikasi mova
    3. user mendapat 1 account superadmin 
    4. user melakukan konfigurasi operasional bisnis pada fase onboarding 
    5. user melakukan invite akun manajemen dan supervisor untuk join ke domain 
    6. user manajemen dan supervisor menerima undangan disertai dengan token yang tersedia untuk bergabung 
    7. user superadmin melakukan konfirmasi akun untuk bergabung pada entitas domain bisnis superadmin 
    8. user manajemen dan supervisor mengundang akun rider untuk bergabung ke dalam domain bisnis superadmin 
    9. user rider melakukan konfirmasi untuk bergabung pada entitas domain bisnis superadmin 
    10. user superadmin melakukan konfirmasi akun untuk bergabung pada entitas domain bisnis superadmin 

### PR Pembaruan 1 
- rencana implementasi skema database terkait penambahan alur pendaftaran
- rencana penambahan endpoint pada file `swagger.ts` terkait penambahan alur Skala Multi User Mova App
- update fungsionalitas pada alur skala multi user 
-  **Spatial Indexing**:
   * Tambahkan index spasial GiST di seluruh kolom geometri:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_pois_geom_gist ON pois USING GIST (geom);
     CREATE INDEX IF NOT EXISTS idx_protocol_roads_geom_gist ON protocol_roads USING GIST (geom);
     CREATE INDEX IF NOT EXISTS idx_zones_polygon_gist ON zones USING GIST (polygon_geom);
     ```
-  **Partitioning Tabel Skala Besar**:
   * Partisi tabel `sales_transactions`, `lbs_position_logs`, dan `audit_logs` menggunakan **PostgreSQL Declarative Partitioning (RANGE by created_at bulanan)**.

### PR Pembaruan 2
1. pisahin 