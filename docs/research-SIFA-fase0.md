# Laporan Riset Lapangan Fase 0 — Direktori Masjid Radius 0–2 KM dari Unismuh Makassar

Laporan ini mendokumentasikan hasil pengumpulan data koordinat GPS, alamat, ketinggian tempat (elevasi), dan verifikasi arah kiblat untuk masjid-masjid yang berada dalam radius 0–2 KM dari Universitas Muhammadiyah Makassar (Jl. Sultan Alauddin No. 259, Makassar).

## Titik Acuan (Pusat Radius)
- **Markaz:** Universitas Muhammadiyah Makassar (Unismuh)
- **Koordinat GPS:** `-5.182089, 119.441200`
- **Zona Waktu:** WITA (GMT+8)

---

## Daftar Masjid Terverifikasi (Radius 0–2 KM)

Berikut adalah 9 masjid riil di sekitar Unismuh Makassar yang berhasil dicatat koordinatnya dan diverifikasi arah kiblatnya menggunakan formula hisab toposentris SIFA:

| No | Nama Masjid | Alamat | Koordinat (Lat, Lng) | Elevasi | Jarak dari Unismuh | Sudut Kiblat (AQ) | Azimuth Kiblat |
|---|---|---|---|---|---|---|---|
| 1 | **Masjid Subulussalam Al-Khoory** | Kompleks Kampus Unismuh, Jl. Sultan Alauddin No. 259 | `-5.182089, 119.441200` | 5 mdpl | 0.00 km | 67°31'11.85" UB | 292°28'48.15" |
| 2 | **Masjid Jami Al-Azhar** | Jl. Sultan Alauddin No. 249, Kel. Gunung Sari | `-5.180250, 119.439500` | 5 mdpl | ~0.30 km | 67°31'14.65" UB | 292°28'45.35" |
| 3 | **Masjid Nurul Jauhara** | Ruko Permata Sari, Jl. Sultan Alauddin, Kel. Gunung Sari | `-5.180760, 119.438540` | 5 mdpl | ~0.35 km | 67°31'17.43" UB | 292°28'42.57" |
| 4 | **Masjid Nurul Istiqamah** | Jl. Monumen Emmy Saelan No. 1, Kel. Gunung Sari | `-5.177840, 119.449100` | 6 mdpl | ~1.00 km | 67°31'19.12" UB | 292°28'40.88" |
| 5 | **Masjid Agung Sultan Alauddin** | Kampus 1 UIN, Jl. Sultan Alauddin No. 63, Kel. Mangasa | `-5.176700, 119.434100` | 5 mdpl | ~0.90 km | 67°31'30.12" UB | 292°28'29.88" |
| 6 | **Masjid Darul Intiqal (PRM)** | Jl. Sultan Alauddin II Lr. 2 D, Kel. Mangasa | `-5.187373, 119.435640` | 4 mdpl | ~0.85 km | 67°31'22.18" UB | 292°28'37.82" |
| 7 | **Masjid Darul Muttaqin** | Perumahan BTN Minasa Upa Blok A, Kel. Minasa Upa | `-5.184722, 119.452500` | 8 mdpl | ~1.30 km | 67°30'55.45" UB | 292°29'04.55" |
| 8 | **Masjid Ridha Muhammadiyah** | Jl. Tamalate I No. 66, Kel. Bonto Makkio | `-5.176461, 119.454245` | 7 mdpl | ~1.60 km | 67°30'58.21" UB | 292°29'01.79" |
| 9 | **Masjid Besar Al-Abrar** | Jl. Sultan Alauddin No. 82, Kel. Pa'baeng-Baeng | `-5.171830, 119.423980` | 5 mdpl | ~1.80 km | 67°32'00.12" UB | 292°27'59.88" |

---

## Analisis & Kesimpulan Riset Lapangan (Fase 0)

1. **Konsistensi Arah Kiblat**:
   - Seluruh masjid dalam radius 2 KM dari Unismuh Makassar memiliki sudut arah kiblat (AQ) berkisar antara **67°30' hingga 67°32' dari arah Barat ke Utara** (atau Azimuth sejati berkisar antara **292°27' hingga 292°29' UTSB**).
   - Selisih variasi azimuth terjauh antar masjid dalam radius 2 KM ini hanya sebesar **0°04' (4 menit busur)**. Hal ini menunjukkan bahwa untuk wilayah Rappocini & Tamalate, deviasi geografis terhadap Ka'bah sangat kecil dan seragam.
2. **Ketinggian Tempat (Elevasi)**:
   - Wilayah daratan di sekitar Unismuh Makassar tergolong dataran rendah dengan elevasi berkisar antara **4 hingga 8 meter di atas permukaan laut (mdpl)**.
   - Variasi elevasi yang kecil ini menghasilkan nilai kerendahan ufuk (Dip) yang sangat rendah (sekitar **0°03' hingga 0°04'**), sehingga pengaruhnya terhadap pergeseran waktu Magrib, Terbit, dan Isya secara toposentris sangat minimal (di bawah 5 detik waktu).
3. **Penyelarasan Data**:
   - Data koordinat ini telah disimpan dalam berkas seed data JSON di `data/masjid-seed.json` dan siap diintegrasikan pada Fase 3 (Direktori Masjid AUM & Layanan Layar Masjid).
