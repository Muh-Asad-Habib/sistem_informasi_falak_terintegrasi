import { HisabError } from './errors.js';
/** Faktor bayangan Asar per mazhab (dipakai pada rumus cotan h = tan|φ − δ| + faktor). */
export const FAKTOR_BAYANGAN_ASAR = {
    Syafii: 1,
    Hanafi: 2,
};
/**
 * Nilai bersama yang berlaku untuk semua kriteria.
 *
 * Semi-diameter & refraksi adalah besaran astronomis (bukan pilihan mazhab), sedangkan
 * Dhuha & Imsak tidak didefinisikan oleh kriteria internasional (MWL/ISNA/dll.) sehingga
 * SIFA memakai konvensi Modul AIK IV Bab III agar tidak mengarang nilai baru.
 */
const DASAR_ASTRONOMIS = {
    hTerbit: -1,
    hDhuha: 4.5, // 4Â°30' â€” Modul AIK IV Bab III
    semiDiameterMenitBusur: 16,
    refraksiMenitBusur: 34,
    imsakMenit: 10,
    mazhabAsarDefault: 'Syafii',
};
const CATATAN_DHUHA_IMSAK = "Kriteria ini hanya mengatur ketinggian matahari untuk Subuh & Isya. Nilai Dhuha (4Â°30') dan Imsak (10 menit sebelum Subuh) mengikuti konvensi Modul AIK IV Bab III agar tidak ada angka karangan.";
/**
 * Tabel parameter per metode hisab.
 *
 * PENTING: nilai di sini menentukan hasil ibadah. Jangan mengubahnya tanpa
 * rujukan resmi dan tanpa menjalankan golden test (`agent_docs/testing.md`).
 */
export const PARAMETER_METODE = {
    Muhammadiyah: {
        ...DASAR_ASTRONOMIS,
        label: 'Muhammadiyah',
        wilayah: 'Indonesia — Majelis Tarjih dan Tajdid PP Muhammadiyah',
        // Munas Tarjih XXXI menetapkan awal Subuh h = -18° (koreksi dari -20°); Isya tetap -18°.
        hSubuh: -18,
        hIsya: -18,
        sumber: 'Keputusan Munas Tarjih XXXI (ditanfidz SK PP Muhammadiyah, 2021) tentang kriteria awal waktu Subuh h = -18° & Pedoman Hisab Muhammadiyah (Majelis Tarjih dan Tajdid)',
        statusRujukan: 'terverifikasi',
        catatan: 'Munas Tarjih XXXI merevisi ketinggian matahari awal Subuh dari -20° menjadi -18°. Contoh hisab Modul AIK IV Bab III masih memakai -20° (nilai lama); SIFA mengikuti ketetapan resmi terbaru.',
    },
    Kemenag: {
        ...DASAR_ASTRONOMIS,
        label: 'Kemenag RI',
        wilayah: 'Indonesia — Kementerian Agama Republik Indonesia',
        // Almanak Hisab Rukyat Kemenag RI: awal Subuh h = -20Â°, awal Isya h = -18Â°.
        hSubuh: -20,
        hIsya: -18,
        sumber: 'Almanak Hisab Rukyat, Kementerian Agama RI',
        statusRujukan: 'terverifikasi',
        catatan: 'Kemenag RI tetap memakai -20°/-18° sesuai Almanak Hisab Rukyat (sama dengan contoh Modul AIK IV). Sejak Munas Tarjih XXXI, Subuh Muhammadiyah (-18°) lebih siang daripada Kemenag; SIFA menampilkannya apa adanya.',
    },
    MABIMS: {
        ...DASAR_ASTRONOMIS,
        label: 'MABIMS',
        wilayah: 'Brunei, Indonesia, Malaysia, Singapura',
        hSubuh: -20,
        hIsya: -18,
        sumber: 'Kesepakatan Menteri Agama Brunei Darussalam, Indonesia, Malaysia, dan Singapura (MABIMS) tentang kriteria waktu salat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Nilai -20Â°/-18Â° identik dengan Kemenag RI karena Kemenag memang memakai kriteria MABIMS. Preset ini disediakan agar penamaannya jelas bagi pengguna di luar Indonesia, bukan untuk menciptakan perbedaan angka. ' +
            CATATAN_DHUHA_IMSAK,
    },
    NU: {
        ...DASAR_ASTRONOMIS,
        label: 'Nahdlatul Ulama (LF PBNU)',
        wilayah: 'Indonesia — Lembaga Falakiyah PBNU',
        hSubuh: -20,
        hIsya: -18,
        sumber: 'Almanak/Pedoman Hisab Rukyat Lembaga Falakiyah PBNU',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'TODO: perlu konfirmasi rujukan cetak LF PBNU. Sepanjang penelusuran, LF PBNU memakai ketinggian matahari yang sama dengan Kemenag (-20°/-18°) dan mazhab Asar Syafi’i. ' +
            CATATAN_DHUHA_IMSAK,
    },
    MWL: {
        ...DASAR_ASTRONOMIS,
        label: 'Muslim World League',
        wilayah: 'Eropa, Timur Jauh, sebagian Amerika',
        hSubuh: -18,
        hIsya: -17,
        sumber: 'Muslim World League (Rabithah al-Alam al-Islami) — parameter kalkulasi waktu salat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: CATATAN_DHUHA_IMSAK,
    },
    ISNA: {
        ...DASAR_ASTRONOMIS,
        label: 'ISNA (Amerika Utara)',
        wilayah: 'Amerika Serikat & Kanada',
        hSubuh: -15,
        hIsya: -15,
        sumber: 'Islamic Society of North America (ISNA) — parameter kalkulasi waktu salat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Kriteria paling "longgar" (15Â°/15Â°) sehingga Subuh paling siang dan Isya paling awal di antara preset yang tersedia. ' +
            CATATAN_DHUHA_IMSAK,
    },
    UmmAlQura: {
        ...DASAR_ASTRONOMIS,
        label: 'Umm al-Qura (Makkah)',
        wilayah: 'Arab Saudi',
        hSubuh: -18.5,
        hIsya: -18, // tidak dipakai — Isya memakai selang waktu tetap di bawah ini
        isyaMenitSetelahMagrib: 90,
        sumber: 'Umm al-Qura University, Makkah — Taqwim Umm al-Qura',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Isya TIDAK dihitung dari ketinggian matahari, melainkan 90 menit setelah Magrib (120 menit selama Ramadan — penyesuaian Ramadan belum diterapkan otomatis di SIFA). ' +
            CATATAN_DHUHA_IMSAK,
    },
    Egypt: {
        ...DASAR_ASTRONOMIS,
        label: 'Egyptian General Authority of Survey',
        wilayah: 'Afrika, Suriah, Irak, Lebanon, Malaysia (sebagian)',
        hSubuh: -19.5,
        hIsya: -17.5,
        sumber: 'Egyptian General Authority of Survey — parameter kalkulasi waktu salat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: CATATAN_DHUHA_IMSAK,
    },
    Karachi: {
        ...DASAR_ASTRONOMIS,
        label: 'Univ. of Islamic Sciences, Karachi',
        wilayah: 'Pakistan, India, Bangladesh, Afghanistan',
        hSubuh: -18,
        hIsya: -18,
        sumber: 'University of Islamic Sciences, Karachi — parameter kalkulasi waktu salat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: 'Di kawasan Asia Selatan mazhab Asar yang lazim dipakai adalah Hanafi (bayangan 2Ã—). SIFA tetap memakai Syafi\u2019i sebagai bawaan dan menyediakan pilihan mazhab Asar terpisah agar tidak mengubah hasil secara diam-diam. ' +
            CATATAN_DHUHA_IMSAK,
    },
    Singapura: {
        ...DASAR_ASTRONOMIS,
        label: 'MUIS Singapura',
        wilayah: 'Singapura',
        hSubuh: -20,
        hIsya: -18,
        sumber: 'Majlis Ugama Islam Singapura (MUIS) — jadwal waktu solat',
        statusRujukan: 'perlu_konfirmasi',
        catatan: CATATAN_DHUHA_IMSAK,
    },
};
/** Urutan tampil preset di UI (Indonesia dulu, baru internasional). */
export const URUTAN_METODE = [
    'Muhammadiyah',
    'Kemenag',
    'MABIMS',
    'NU',
    'MWL',
    'ISNA',
    'UmmAlQura',
    'Egypt',
    'Karachi',
    'Singapura',
];
/** Daftar metode siap render untuk dropdown/tabel perbandingan di UI. */
export function daftarMetode() {
    return URUTAN_METODE.map((metode) => ({ metode, parameter: PARAMETER_METODE[metode] }));
}
/**
 * Menghitung Julian Date dari objek Date.
 */
export function getJulianDate(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
    let y = year;
    let m = month;
    if (month <= 2) {
        y = year - 1;
        m = month + 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
    return JD;
}
/**
 * Menghitung Deklinasi Matahari (delta) dan Equation of Time (EoT) secara astronomis (Meeus/Kemenag standard).
 * Mengembalikan deklinasi dalam derajat dan EoT dalam menit.
 */
export function hitungEphemerisMatahari(date) {
    const JD = getJulianDate(date);
    const T = (JD - 2451545.0) / 36525.0; // Century since J2000
    // Geometric mean longitude of the Sun
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = L0 % 360;
    if (L0 < 0)
        L0 += 360;
    // Mean anomaly of the Sun
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = M % 360;
    if (M < 0)
        M += 360;
    // Eccentricity of Earth's orbit
    const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    // Sun's equation of center
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
        + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
        + 0.000289 * Math.sin(3 * M * Math.PI / 180);
    // Sun's true longitude
    const trueLong = L0 + C;
    // Sun's apparent longitude
    const omega = 125.04 - 1934.136 * T;
    const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
    // Mean obliquity of the ecliptic
    const epsilon0 = 23 + 26 / 60 + 21.448 / 3600 - 46.815 / 3600 * T - 0.00059 / 3600 * T * T + 0.001813 / 3600 * T * T * T;
    const obliquity = epsilon0 + 0.00256 * Math.cos(omega * Math.PI / 180);
    // Sun's declination
    const sinDelta = Math.sin(obliquity * Math.PI / 180) * Math.sin(lambda * Math.PI / 180);
    const delta = Math.asin(sinDelta) * 180 / Math.PI;
    // Equation of Time (EoT)
    const y = Math.pow(Math.tan((obliquity / 2) * Math.PI / 180), 2);
    let EotRad = y * Math.sin(2 * L0 * Math.PI / 180)
        - 2 * e * Math.sin(M * Math.PI / 180)
        + 4 * e * y * Math.sin(M * Math.PI / 180) * Math.cos(2 * L0 * Math.PI / 180)
        - 0.5 * y * y * Math.sin(4 * L0 * Math.PI / 180)
        - 1.25 * e * e * Math.sin(2 * M * Math.PI / 180);
    const eotMinutes = EotRad * (4 * 180 / Math.PI); // Convert radians to minutes of time
    return {
        deklinasi: delta,
        eot: eotMinutes,
    };
}
/**
 * Memformat jam desimal (misal 12.1166 => "12:07")
 * Sesuai aturan hisab: detik dibulatkan ke atas ke menit terdekat untuk kehati-hatian,
 * kecuali waktu Terbit dan Dhuha yang dikurangkan (atau dibulatkan ke bawah jika instruksi modul menentukan demikian).
 */
export function formatJamDesimal(decimalHours, roundUp = true) {
    const totalSeconds = Math.round(decimalHours * 3600);
    // Bulatkan ke menit terdekat
    let minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (roundUp && seconds > 0) {
        minutes += 1;
    }
    let finalHours = Math.floor(minutes / 60) % 24;
    const finalMinutes = ((minutes % 60) + 60) % 60;
    if (finalHours < 0)
        finalHours += 24;
    const hh = finalHours.toString().padStart(2, '0');
    const mm = finalMinutes.toString().padStart(2, '0');
    return `${hh}:${mm}`;
}
/** Menghitung sudut waktu t (derajat) untuk tinggi matahari h tertentu. */
function sudutWaktu(hDerajat, latRad, dekRad) {
    const hRad = hDerajat * Math.PI / 180;
    const cosT = (Math.sin(hRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
    if (Math.abs(cosT) > 1)
        return null; // Matahari tidak pernah mencapai ketinggian ini (lintang tinggi)
    return Math.acos(cosT) * 180 / Math.PI;
}
/**
 * Menghitung jadwal salat lengkap untuk suatu koordinat geografis dan tanggal.
 *
 * @param metode Menentukan tabel parameter (lihat `PARAMETER_METODE`). Parameter ini
 *               benar-benar dipakai untuk kalkulasi â€” bukan sekadar label.
 * @param parameterOverride Untuk uji regresi terhadap contoh modul: menimpa sebagian
 *               parameter secara eksplisit dan terdokumentasi.
 * @param mazhabAsar Mazhab penentuan awal Asar. Bila tidak diisi, dipakai bawaan metode
 *               (`mazhabAsarDefault`) supaya tidak ada perubahan hasil secara diam-diam.
 */
export function hitungJadwalSalat(coordinate, tanggal, timezoneOffset, // GMT+8 = 8, GMT+7 = 7
elevation = 0, // Ketinggian tempat mdpl
metode = 'Muhammadiyah', ikhtiyatMenit = 2, parameterOverride, mazhabAsar) {
    const { lat, lng } = coordinate;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new HisabError('INVALID_COORDINATES', 'Koordinat tidak valid');
    }
    const dasar = PARAMETER_METODE[metode];
    if (!dasar) {
        throw new HisabError('INVALID_METHOD', `Metode hisab tidak dikenal: ${metode}`);
    }
    const p = { ...dasar, ...parameterOverride };
    const mazhab = mazhabAsar ?? p.mazhabAsarDefault ?? 'Syafii';
    const faktorBayangan = FAKTOR_BAYANGAN_ASAR[mazhab];
    if (faktorBayangan === undefined) {
        throw new HisabError('INVALID_METHOD', `Mazhab Asar tidak dikenal: ${mazhab}`);
    }
    // 1. Dapatkan posisi Matahari
    // Untuk keakuratan optimal, kita hitung pada jam 12:00 zona waktu lokal (solar noon perkiraan)
    const localNoonDate = new Date(tanggal);
    localNoonDate.setUTCHours(12 - timezoneOffset, 0, 0, 0);
    const { deklinasi, eot } = hitungEphemerisMatahari(localNoonDate);
    // 2. Hitung Meridian Pass (zawal/solar noon)
    const eotHours = eot / 60;
    const meridianPass = 12.0 - eotHours;
    // 3. Hitung KWB / Interpolasi (I) = (BujurTempat - BujurDaerah) / 15
    const bujurDaerah = timezoneOffset * 15;
    const interpolasi = (lng - bujurDaerah) / 15;
    const ikh = ikhtiyatMenit / 60;
    // Zuhur = Meridian Pass - I + ikhtiyat
    const zuhurDesimal = meridianPass - interpolasi + ikh;
    const latRad = lat * Math.PI / 180;
    const dekRad = deklinasi * Math.PI / 180;
    // 4. Asar â€” cotan(h) = tan|Ï† - Î´| + faktor bayangan mazhab (Syafi'i 1Ã—, Hanafi 2Ã—)
    const cotanHAsar = Math.tan(Math.abs(latRad - dekRad)) + faktorBayangan;
    const hAsarRad = Math.atan(1 / cotanHAsar);
    const hAsarDeg = hAsarRad * 180 / Math.PI;
    const tAsar = sudutWaktu(hAsarDeg, latRad, dekRad);
    const asarDesimal = tAsar === null ? zuhurDesimal : meridianPass + tAsar / 15 - interpolasi + ikh;
    // 5. Magrib & Terbit â€” koreksi refraksi, semi-diameter, & Dip (kerendahan ufuk)
    const dip = 1.76 * Math.sqrt(Math.max(elevation, 0)) / 60; // derajat
    const hMagribDeg = -(p.semiDiameterMenitBusur / 60 + p.refraksiMenitBusur / 60 + dip);
    const tMagrib = sudutWaktu(hMagribDeg, latRad, dekRad);
    const magribDesimal = tMagrib === null ? zuhurDesimal : meridianPass + tMagrib / 15 - interpolasi + ikh;
    const tTerbit = sudutWaktu(p.hTerbit, latRad, dekRad);
    // Terbit dikurangi ikhtiyat (arah kehati-hatian berlawanan dengan waktu lain)
    const terbitDesimal = tTerbit === null ? zuhurDesimal : meridianPass - tTerbit / 15 - interpolasi - ikh;
    // 6. Subuh & Isya â€” memakai parameter metode terpilih
    const tSubuh = sudutWaktu(p.hSubuh, latRad, dekRad);
    const subuhDesimal = tSubuh === null ? zuhurDesimal : meridianPass - tSubuh / 15 - interpolasi + ikh;
    // Sebagian kriteria (mis. Umm al-Qura) memakai selang waktu tetap setelah Magrib
    // untuk Isya, bukan ketinggian matahari. Keduanya ditangani eksplisit di sini.
    const isyaBerbasisInterval = typeof p.isyaMenitSetelahMagrib === 'number';
    let isyaDesimal;
    if (isyaBerbasisInterval) {
        isyaDesimal = magribDesimal + p.isyaMenitSetelahMagrib / 60;
    }
    else {
        const tIsya = sudutWaktu(p.hIsya, latRad, dekRad);
        isyaDesimal = tIsya === null ? zuhurDesimal : meridianPass + tIsya / 15 - interpolasi + ikh;
    }
    // 7. Dhuha
    const tDhuha = sudutWaktu(p.hDhuha, latRad, dekRad);
    const dhuhaDesimal = tDhuha === null ? zuhurDesimal : meridianPass - tDhuha / 15 - interpolasi + ikh;
    // 8. Imsak = Subuh - imsakMenit
    const imsakDesimal = subuhDesimal - p.imsakMenit / 60;
    const yyyy = tanggal.getFullYear();
    const mm = (tanggal.getMonth() + 1).toString().padStart(2, '0');
    const dd = tanggal.getDate().toString().padStart(2, '0');
    return {
        tanggal: `${yyyy}-${mm}-${dd}`,
        imsak: formatJamDesimal(imsakDesimal, true),
        subuh: formatJamDesimal(subuhDesimal, true),
        terbit: formatJamDesimal(terbitDesimal, false), // Terbit dibulatkan ke bawah/aman
        dhuha: formatJamDesimal(dhuhaDesimal, true),
        zuhur: formatJamDesimal(zuhurDesimal, true),
        asar: formatJamDesimal(asarDesimal, true),
        magrib: formatJamDesimal(magribDesimal, true),
        isya: formatJamDesimal(isyaDesimal, true),
        metode,
        mazhabAsar: mazhab,
        ikhtiyatMenit,
        parameter: p,
        rincian: {
            deklinasi,
            eot,
            meridianPass,
            interpolasi,
            dip,
            hMagrib: hMagribDeg,
            hAsar: hAsarDeg,
            faktorBayanganAsar: faktorBayangan,
            isyaBerbasisInterval,
        },
    };
}
/** Mengubah "HH:mm" menjadi menit sejak tengah malam. */
function menitDariJam(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}
/**
 * Menghitung jadwal salat untuk SEMUA metode yang tersedia pada satu titik & tanggal,
 * lengkap dengan selisihnya terhadap metode acuan.
 *
 * Dipakai halaman edukasi/informasi agar pengguna bisa melihat perbedaan kriteria
 * secara terbuka â€” bukan disodori satu angka tanpa pembanding (AGENTS.md poin 3).
 */
export function bandingkanMetode(coordinate, tanggal, timezoneOffset, elevation = 0, ikhtiyatMenit = 2, metodeAcuan = 'Muhammadiyah', mazhabAsar) {
    const acuan = hitungJadwalSalat(coordinate, tanggal, timezoneOffset, elevation, metodeAcuan, ikhtiyatMenit, undefined, mazhabAsar);
    return URUTAN_METODE.map((metode) => {
        const jadwal = hitungJadwalSalat(coordinate, tanggal, timezoneOffset, elevation, metode, ikhtiyatMenit, undefined, mazhabAsar);
        return {
            metode,
            parameter: jadwal.parameter,
            jadwal,
            selisihMenit: {
                subuh: menitDariJam(jadwal.subuh) - menitDariJam(acuan.subuh),
                zuhur: menitDariJam(jadwal.zuhur) - menitDariJam(acuan.zuhur),
                asar: menitDariJam(jadwal.asar) - menitDariJam(acuan.asar),
                magrib: menitDariJam(jadwal.magrib) - menitDariJam(acuan.magrib),
                isya: menitDariJam(jadwal.isya) - menitDariJam(acuan.isya),
            },
        };
    });
}
//# sourceMappingURL=prayer-times.js.map