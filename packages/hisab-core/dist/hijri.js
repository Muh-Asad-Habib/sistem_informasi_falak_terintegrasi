import { getSunEclipticLongitude, getMoonCoordinates, getElongation } from './ephemeris.js';
import { getJulianDate, hitungJadwalSalat } from './prayer-times.js';
import { HisabError } from './errors.js';
/** Nama 12 bulan Hijriah sesuai urutan. */
export const NAMA_BULAN_HIJRIAH = [
    'Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir",
    'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
    'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijjah',
];
/**
 * Tabel ambang tiap kriteria.
 *
 * PENTING: angka di sini menentukan tanggal ibadah. Jangan mengubahnya tanpa rujukan
 * resmi (AGENTS.md poin 1). Kriteria yang belum diverifikasi ke terbitan resmi
 * ditandai `perlu_konfirmasi` dan status itu ikut ditampilkan di UI.
 */
export const PARAMETER_KRITERIA_HIJRIAH = {
    WujudulHilal: {
        label: 'Wujudul Hilal',
        organisasi: 'Muhammadiyah (Majelis Tarjih dan Tajdid)',
        jenis: 'lokal',
        minTinggiHilal: 0,
        minElongasi: 0,
        minUmurBulanJam: 0,
        syaratIjtimakSebelumMagrib: true,
        sumber: 'Pedoman Hisab Muhammadiyah (Majelis Tarjih dan Tajdid) & Modul AIK IV Fakultas Teknik Unismuh Bab IV',
        statusRujukan: 'terverifikasi',
        catatan: 'Tiga syarat kumulatif: (1) telah terjadi ijtimak, (2) ijtimak terjadi sebelum Magrib, (3) saat Magrib piringan atas Bulan masih di atas ufuk (tinggi > 0°). Tidak mensyaratkan hilal dapat dirukyat.',
    },
    KHGT: {
        label: 'KHGT (Kalender Hijriah Global Tunggal)',
        organisasi: 'Muhammadiyah — Munas Tarjih, berlaku sejak 1 Muharram 1447 H',
        jenis: 'global',
        minTinggiHilal: 5,
        minElongasi: 8,
        minUmurBulanJam: 0,
        syaratIjtimakSebelumMagrib: false,
        sumber: 'Keputusan Munas Tarjih tentang Kalender Hijriah Global Tunggal (KHGT)',
        statusRujukan: 'terverifikasi',
        catatan: 'Matlak global: bila di suatu tempat di bumi elongasi ≥ 8° dan tinggi hilal ≥ 5° sebelum pukul 24:00 GMT, awal bulan berlaku seragam sedunia. Ambangnya mengadopsi kriteria Istanbul 2016.',
    },
    MABIMS: {
        label: 'MABIMS Baru (3-6,4)',
        organisasi: 'Brunei, Indonesia, Malaysia, Singapura — berlaku sejak 1443 H',
        jenis: 'lokal',
        minTinggiHilal: 3,
        minElongasi: 6.4,
        minUmurBulanJam: 0,
        syaratIjtimakSebelumMagrib: true,
        sumber: 'Kriteria imkanur rukyat MABIMS (hasil kesepakatan 2021, dipakai Kemenag RI sejak 1443 H)',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Kriteria imkanur rukyat: hilal dianggap mungkin dirukyat bila tinggi ≥ 3° dan elongasi ≥ 6,4°. TODO: perlu konfirmasi rujukan cetak (Keputusan Menteri Agama / berita acara MABIMS).',
    },
    MABIMSLama: {
        label: 'MABIMS Lama (2-3-8)',
        organisasi: 'MABIMS — dipakai sebelum 1443 H',
        jenis: 'lokal',
        minTinggiHilal: 2,
        minElongasi: 3,
        minUmurBulanJam: 8,
        syaratIjtimakSebelumMagrib: true,
        sumber: 'Kriteria imkanur rukyat MABIMS lama (tinggi ≥ 2°, elongasi ≥ 3°, umur bulan ≥ 8 jam)',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Disertakan sebagai pembanding historis agar pengguna paham mengapa keputusan awal bulan bisa berubah antar-tahun. TODO: perlu konfirmasi rujukan cetak.',
    },
    Istanbul: {
        label: 'Istanbul 2016',
        organisasi: 'Kongres Persatuan Kalender Hijriah Internasional, Istanbul',
        jenis: 'lokal',
        minTinggiHilal: 5,
        minElongasi: 8,
        minUmurBulanJam: 0,
        syaratIjtimakSebelumMagrib: true,
        sumber: 'Keputusan Kongres Kalender Hijriah Internasional Istanbul 2016',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Ambangnya sama dengan KHGT, bedanya di sini diuji pada markaz lokal (bukan matlak global), sehingga hasilnya bisa berbeda dengan KHGT untuk tanggal yang sama.',
    },
};
/** Urutan tampil kriteria di UI. */
export const URUTAN_KRITERIA_HIJRIAH = [
    'WujudulHilal',
    'KHGT',
    'MABIMS',
    'MABIMSLama',
    'Istanbul',
];
/**
 * Konversi derajat desimal ke format DMS sederhana.
 */
function toDMS(deg) {
    const sign = deg < 0 ? '-' : '';
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = Math.round(((absDeg - d) * 60 - m) * 60 * 100) / 100;
    return `${sign}${d}°${m}'${s}"`;
}
/**
 * Mencari Julian Date konjungsi (ijtimak) terdekat dari Julian Date perkiraan.
 * Menggunakan metode bisection (pencarian biner).
 */
export function cariWaktuIjtimakJd(jdAwal) {
    // Rentang pencarian ± 1.5 hari
    let minJd = jdAwal - 1.5;
    let maxJd = jdAwal + 1.5;
    const getDiff = (jd) => {
        const sun = getSunEclipticLongitude(jd);
        const moon = getMoonCoordinates(jd).lng;
        let diff = moon - sun;
        // Normalisasi ke [-180, 180]
        diff = ((diff + 540) % 360) - 180;
        return diff;
    };
    // Lakukan bisection sebanyak 30 iterasi untuk presisi tinggi (di bawah 1 detik)
    for (let i = 0; i < 40; i++) {
        const midJd = (minJd + maxJd) / 2;
        const diffMid = getDiff(midJd);
        // Karena kita mencari New Moon (Moon menyalip Sun, diff berpindah dari negatif ke positif)
        // Jika diffMid > 0, berarti Moon sudah menyalip Sun -> conjunction ada di kiri
        if (diffMid > 0) {
            maxJd = midJd;
        }
        else {
            minJd = midJd;
        }
    }
    return (minJd + maxJd) / 2;
}
/**
 * Menghitung Obliquity of the Ecliptic (Kemiringan sumbu bumi) dalam radian.
 */
function getObliquityRad(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    // Rumus IAU 1980
    const epsDeg = 23.439291 - 0.013004167 * T - 0.000000164 * T * T + 0.0000005036 * T * T * T;
    return epsDeg * Math.PI / 180;
}
/**
 * Menghitung Greenwich Sidereal Time (GST) dalam derajat.
 */
function getGreenwichSiderealTime(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    // Meeus Bab 12 rumus 12.4
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
    gmst = gmst % 360;
    if (gmst < 0)
        gmst += 360;
    return gmst;
}
/**
 * Menghitung koordinat horizontal (Tinggi/Altitude dan Azimuth) Bulan untuk suatu pengamat dan waktu.
 */
export function getMoonHorizontalCoordinates(jd, coord) {
    const moon = getMoonCoordinates(jd);
    const moonLngRad = moon.lng * Math.PI / 180;
    const moonLatRad = (moon.lat || 0) * Math.PI / 180;
    // 1. Konversi Ecliptic -> Equatorial (Right Ascension α, Declination δ)
    const eps = getObliquityRad(jd);
    // sin(δ) = sin(β)cos(ε) + cos(β)sin(ε)sin(λ)
    const sinDec = Math.sin(moonLatRad) * Math.cos(eps) + Math.cos(moonLatRad) * Math.sin(eps) * Math.sin(moonLngRad);
    const decRad = Math.asin(sinDec);
    // y = sin(λ)cos(ε) - tan(β)sin(ε), x = cos(λ)
    const y = Math.sin(moonLngRad) * Math.cos(eps) - Math.tan(moonLatRad) * Math.sin(eps);
    const x = Math.cos(moonLngRad);
    let raRad = Math.atan2(y, x);
    if (raRad < 0)
        raRad += 2 * Math.PI;
    // 2. Equatorial -> Horizontal (Hour Angle t, Altitude h)
    const gst = getGreenwichSiderealTime(jd); // dalam derajat
    const lstDeg = gst + coord.lng; // Local Sidereal Time
    const lstRad = lstDeg * Math.PI / 180;
    // Hour Angle (t) = LST - RA
    let hourAngleRad = lstRad - raRad;
    const latRad = coord.lat * Math.PI / 180;
    // sin(h) = sin(Lat)*sin(δ) + cos(Lat)*cos(δ)*cos(t)
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
    const altRad = Math.asin(Math.max(-1.0, Math.min(1.0, sinAlt)));
    // Azimuth (A)
    const yAz = Math.sin(hourAngleRad);
    const xAz = Math.cos(hourAngleRad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad);
    let azRad = Math.atan2(yAz, xAz);
    if (azRad < 0)
        azRad += 2 * Math.PI;
    return {
        altitude: altRad * 180 / Math.PI,
        azimuth: azRad * 180 / Math.PI,
    };
}
/** Panjang rata-rata satu bulan sinodis (Meeus, Astronomical Algorithms Bab 49), hari. */
const LUNASI_RATA_RATA = 29.530588861;
/** JD mean new moon k = 0 (6 Januari 2000 18:14 TD) — Meeus rumus 49.1 */
const JD_NEW_MOON_K0 = 2451550.09766;
/** JD 1 Muharram 1 H menurut epoch Hijriah tabular (16 Juli 622 M) */
const JD_EPOCH_HIJRIAH = 1948439.5;
/**
 * Memperkirakan Julian Date ijtimak (konjungsi) untuk sebuah bulan Hijriah.
 *
 * Alur: perkiraan kasar dari epoch Hijriah tabular → dibulatkan ke nomor lunasi (k)
 * terdekat memakai rumus mean new moon Meeus → dipakai sebagai titik awal bisection
 * `cariWaktuIjtimakJd` yang mencari konjungsi sesungguhnya.
 *
 * Ini menggantikan tabel tanggal hardcoded yang dulu hanya berisi 5 bulan di 1447 H.
 */
export function perkiraanJdIjtimak(hijriMonthIndex, hijriYear) {
    if (hijriMonthIndex < 0 || hijriMonthIndex > 11) {
        throw new HisabError('INVALID_INPUT', `Indeks bulan Hijriah tidak valid: ${hijriMonthIndex}`);
    }
    if (!Number.isFinite(hijriYear) || hijriYear < 1) {
        throw new HisabError('INVALID_INPUT', `Tahun Hijriah tidak valid: ${hijriYear}`);
    }
    const bulanSejakEpoch = (hijriYear - 1) * 12 + hijriMonthIndex;
    const jdKasar = JD_EPOCH_HIJRIAH + bulanSejakEpoch * LUNASI_RATA_RATA;
    const k = Math.round((jdKasar - JD_NEW_MOON_K0) / LUNASI_RATA_RATA);
    return JD_NEW_MOON_K0 + k * LUNASI_RATA_RATA;
}
/**
 * Mengevaluasi kriteria awal bulan Hijriah — SEMUA kriteria dihitung berdampingan.
 *
 * @param hijriMonthName Nama bulan Hijriah (lihat `NAMA_BULAN_HIJRIAH`)
 * @param hijriYear Tahun Hijriah
 * @param localCoord Markaz pengamat untuk kriteria berjenis `lokal`
 * @param timezoneOffset Offset zona waktu markaz (WITA = 8)
 * @param elevation Ketinggian markaz (mdpl), mempengaruhi waktu Magrib
 */
export function hitungKriteriaBulan(hijriMonthName, hijriYear, localCoord, timezoneOffset, elevation = 0) {
    const monthIndex = NAMA_BULAN_HIJRIAH.findIndex((n) => n.toLowerCase() === hijriMonthName.trim().toLowerCase());
    if (monthIndex < 0) {
        throw new HisabError('INVALID_INPUT', `Nama bulan Hijriah "${hijriMonthName}" tidak dikenal. Pilihan: ${NAMA_BULAN_HIJRIAH.join(', ')}.`);
    }
    // 1. Cari waktu ijtimak sesungguhnya di sekitar perkiraan lunasi
    const jdConjunction = cariWaktuIjtimakJd(perkiraanJdIjtimak(monthIndex, hijriYear));
    // Ubah JD konjungsi ke Date UTC
    const conjunctionDateUtc = new Date((jdConjunction - 2440587.5) * 86400 * 1000);
    // Format string waktu ijtimak UTC
    const pad = (n) => n.toString().padStart(2, '0');
    const waktuIjtimakUtc = `${conjunctionDateUtc.getUTCFullYear()}-${pad(conjunctionDateUtc.getUTCMonth() + 1)}-${pad(conjunctionDateUtc.getUTCDate())} ${pad(conjunctionDateUtc.getUTCHours())}:${pad(conjunctionDateUtc.getUTCMinutes())}:${pad(conjunctionDateUtc.getUTCSeconds())} UTC`;
    // Hari terbenamnya matahari yang diuji (hari terjadinya konjungsi)
    const testDate = new Date(conjunctionDateUtc);
    const dateMasehi = `${testDate.getUTCFullYear()}-${pad(testDate.getUTCMonth() + 1)}-${pad(testDate.getUTCDate())}`;
    // 2. Waktu Magrib lokal — dihitung lewat hisab-core, bukan diasumsikan 18:06.
    //    Ikhtiyat sengaja 0 karena yang diuji adalah saat terbenam astronomis, bukan
    //    jadwal salat yang sudah diberi margin kehati-hatian.
    const tanggalLokal = new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate());
    const jadwal = hitungJadwalSalat(localCoord, tanggalLokal, timezoneOffset, elevation, 'Muhammadiyah', 0);
    const [magribJam, magribMenit] = jadwal.magrib.split(':').map(Number);
    const magribLokalDesimal = magribJam + magribMenit / 60;
    // Magrib lokal → UTC → Julian Date
    const magribUtcMs = Date.UTC(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate()) + (magribLokalDesimal - timezoneOffset) * 3600 * 1000;
    const jdMagrib = getJulianDate(new Date(magribUtcMs));
    // 3. Parameter hilal lokal saat Magrib
    const ijtimakTerjadiSebelumMagrib = jdConjunction < jdMagrib;
    const { altitude: lokalTinggiHilal } = getMoonHorizontalCoordinates(jdMagrib, localCoord);
    const lokalElongasi = getElongation(jdMagrib);
    const umurBulanJam = (jdMagrib - jdConjunction) * 24;
    // 4. Parameter geosentris global untuk kriteria matlak global (KHGT)
    // Dievaluasi pada batas 24:00 UTC hari konjungsi, pada titik optimum di belahan
    // bumi barat tempat hilal paling tinggi saat Magrib sebelum pukul 24:00 GMT.
    const jdKhgtLimit = getJulianDate(new Date(`${dateMasehi}T23:59:59Z`));
    const khgtElongasiGeosentris = getElongation(jdKhgtLimit);
    const coordOptimum = { lat: 20, lng: -100 };
    const { altitude: khgtTinggiHilalGeosentris } = getMoonHorizontalCoordinates(jdKhgtLimit, coordOptimum);
    const umurBulanGlobalJam = (jdKhgtLimit - jdConjunction) * 24;
    // 5. Evaluasi seluruh kriteria dengan ambang dari PARAMETER_KRITERIA_HIJRIAH
    const evaluasi = URUTAN_KRITERIA_HIJRIAH.map((kriteria) => {
        const parameter = PARAMETER_KRITERIA_HIJRIAH[kriteria];
        const global = parameter.jenis === 'global';
        const tinggiHilal = global ? khgtTinggiHilalGeosentris : lokalTinggiHilal;
        const elongasi = global ? khgtElongasiGeosentris : lokalElongasi;
        const umur = global ? umurBulanGlobalJam : umurBulanJam;
        const ijtimakOk = global ? jdConjunction < jdKhgtLimit : ijtimakTerjadiSebelumMagrib;
        const syarat = [];
        if (parameter.syaratIjtimakSebelumMagrib) {
            syarat.push({ nama: 'ijtimak sebelum Magrib', lolos: ijtimakOk });
        }
        // Wujudul Hilal: hilal cukup berada di atas ufuk (> 0°), bukan ≥ 0°.
        const lolosTinggi = parameter.minTinggiHilal === 0 ? tinggiHilal > 0 : tinggiHilal >= parameter.minTinggiHilal;
        syarat.push({
            nama: `tinggi hilal ${parameter.minTinggiHilal === 0 ? '> 0°' : `≥ ${parameter.minTinggiHilal}°`} (${tinggiHilal.toFixed(2)}°)`,
            lolos: lolosTinggi,
        });
        if (parameter.minElongasi > 0) {
            syarat.push({
                nama: `elongasi ≥ ${parameter.minElongasi}° (${elongasi.toFixed(2)}°)`,
                lolos: elongasi >= parameter.minElongasi,
            });
        }
        if (parameter.minUmurBulanJam > 0) {
            syarat.push({
                nama: `umur bulan ≥ ${parameter.minUmurBulanJam} jam (${umur.toFixed(2)} jam)`,
                lolos: umur >= parameter.minUmurBulanJam,
            });
        }
        const terpenuhi = syarat.every((s) => s.lolos);
        const alasan = syarat
            .map((s) => `${s.lolos ? '✓' : '✗'} ${s.nama}`)
            .join('; ');
        return { kriteria, parameter, tinggiHilal, elongasi, umurBulanJam: umur, ijtimakSebelumMagrib: ijtimakOk, terpenuhi, alasan };
    });
    const wujudulHilalTerpenuhi = evaluasi.find((e) => e.kriteria === 'WujudulHilal').terpenuhi;
    const khgtTerpenuhi = evaluasi.find((e) => e.kriteria === 'KHGT').terpenuhi;
    // 6. Penjelasan — menyebut jumlah kriteria yang terpenuhi, tidak memihak satu kriteria
    const terpenuhiList = evaluasi.filter((e) => e.terpenuhi).map((e) => e.parameter.label);
    const belumList = evaluasi.filter((e) => !e.terpenuhi).map((e) => e.parameter.label);
    let penjelasan;
    if (belumList.length === 0) {
        penjelasan = `Seluruh kriteria (${terpenuhiList.join(', ')}) sepakat bahwa awal bulan ${hijriMonthName} ${hijriYear} H dimulai pada hari berikutnya setelah Magrib ${dateMasehi}.`;
    }
    else if (terpenuhiList.length === 0) {
        penjelasan = `Tidak ada kriteria yang terpenuhi pada Magrib ${dateMasehi} (tinggi hilal lokal ${lokalTinggiHilal.toFixed(2)}°, elongasi ${lokalElongasi.toFixed(2)}°). Bulan berjalan digenapkan (istikmal) menjadi 30 hari menurut seluruh kriteria yang dibandingkan.`;
    }
    else {
        penjelasan = `Terjadi PERBEDAAN penetapan awal ${hijriMonthName} ${hijriYear} H. Terpenuhi menurut: ${terpenuhiList.join(', ')}. Belum terpenuhi menurut: ${belumList.join(', ')}. Perbedaan ini wajar karena tiap kriteria memakai ambang tinggi hilal/elongasi dan lingkup matlak (lokal vs global) yang berbeda — SIFA menampilkan keduanya apa adanya, bukan memilih salah satu.`;
    }
    return {
        hijriMonthName: NAMA_BULAN_HIJRIAH[monthIndex],
        hijriYear,
        dateMasehi,
        waktuIjtimakUtc,
        ijtimakTerjadiSebelumMagrib,
        lokalMagribMasehi: jadwal.magrib,
        lokalTinggiHilal,
        lokalTinggiHilalDms: toDMS(lokalTinggiHilal),
        lokalElongasi,
        lokalElongasiDms: toDMS(lokalElongasi),
        wujudulHilalTerpenuhi,
        khgtElongasiGeosentris,
        khgtTinggiHilalGeosentris,
        khgtTerpenuhi,
        umurBulanJam,
        evaluasi,
        penjelasan,
    };
}
//# sourceMappingURL=hijri.js.map