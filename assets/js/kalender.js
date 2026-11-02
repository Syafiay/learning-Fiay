// Array daftar bulan akademik (Mulai Juli tahun berjalan hingga Juni tahun berikutnya)
// Format bulan JavaScript: 0 = Januari, ..., 6 = Juli, ..., 11 = Desember
const listBulanAkademik = [
    { bulan: 6, tahun: 2026, nama: "Juli 2026" },
    { bulan: 7, tahun: 2026, nama: "Agustus 2026" },
    { bulan: 8, tahun: 2026, nama: "September 2026" },
    { bulan: 9, tahun: 2026, nama: "Oktober 2026" },
    { bulan: 10, tahun: 2026, nama: "November 2026" },
    { bulan: 11, tahun: 2026, nama: "Desember 2026" },
    { bulan: 0, tahun: 2027, nama: "Januari 2027" },
    { bulan: 1, tahun: 2027, nama: "Februari 2027" },
    { bulan: 2, tahun: 2027, nama: "Maret 2027" },
    { bulan: 3, tahun: 2027, nama: "April 2027" },
    { bulan: 4, tahun: 2027, nama: "Mei 2027" },
    { bulan: 5, tahun: 2027, nama: "Juni 2027" }
];

let currentIndexBulan = 0; // Mulai dari Juli 2026

// Database Contoh Jadwal Khusus Berdasarkan Tanggal (Format: "YYYY-MM-DD")
const jadwalAkademikData = {
    "2026-07-13": { title: "Hari Pertama Masuk Sekolah & MPLS", type: "event" },
    "2026-08-17": { title: "Upacara HUT RI ke-81 & Libur Nasional", type: "libur" },
    "2026-09-15": { title: "Penilaian Tengah Semester (PTS) Ganjil", type: "ujian" },
    "2026-10-01": { title: "Peringatan Hari Kesaktian Pancasila", type: "event" },
    "2026-12-07": { title: "Penilaian Akhir Semester (PAS) / UAS Ganjil", type: "ujian" },
    "2026-12-25": { title: "Libur Hari Raya Natal", type: "libur" },
    "2027-01-04": { title: "Awal Masuk Semester Genap", type: "kbm" },
    "2027-03-15": { title: "Ujian Madrasah / Penilaian Tengah Semester Genap", type: "ujian" },
    "2027-05-01": { title: "Libur Hari Buruh Internasional", type: "libur" },
    "2027-06-07": { title: "Penilaian Akhir Tahun (PAT) / UAS Genap", type: "ujian" },
    "2027-06-25": { title: "Pembagian Rapor Kenaikan Kelas", type: "event" }
};

function renderKalender() {
    const currentObj = listBulanAkademik[currentIndexBulan];
    document.getElementById('label-bulan-tahun').innerText = currentObj.nama;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const year = currentObj.tahun;
    const month = currentObj.bulan;

    // Cari hari pertama di bulan tersebut (0 = Minggu, 1 = Senin, dst)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total hari dalam bulan tersebut
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Render kotak kosong untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = "h-10 md:h-12 bg-gray-50/50 rounded-lg opacity-30";
        grid.appendChild(emptyDiv);
    }

    // Render tanggal dari 1 sampai total hari
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDiv = document.createElement('div');
        
        // Desain dasar kotak tanggal
        let baseClass = "h-10 md:h-12 rounded-xl flex flex-col justify-center items-center font-bold text-xs cursor-pointer transition border relative ";
        
        let indicatorColor = "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"; // Default KBM Aktif
        let agenda = jadwalAkademikData[dateStr];

        if (agenda) {
            if (agenda.type === 'ujian') {
                indicatorColor = "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm animate-pulse";
            } else if (agenda.type === 'libur') {
                indicatorColor = "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
            } else if (agenda.type === 'event') {
                indicatorColor = "bg-blue-500 text-white border-blue-600 hover:bg-blue-600";
            }
        } else {
            // Jika hari Minggu (index 0 dari hitungan baris atau hari libur mingguan)
            const dayOfWeek = new Date(year, month, day).getDay();
            if (dayOfWeek === 0) {
                indicatorColor = "bg-gray-100 text-rose-500 border-gray-200 hover:bg-gray-200";
            } else {
                indicatorColor = "bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300";
            }
        }

        dayDiv.className = baseClass + indicatorColor;
        dayDiv.innerHTML = `
            <span>${day}</span>
            ${agenda ? '<span class="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></span>' : ''}
        `;

        // Event klik untuk melihat detail jadwal tanggal tertentu
        dayDiv.onclick = () => {
            tampilkanDetailJadwal(dateStr, agenda, day, currentObj.nama);
        };

        grid.appendChild(dayDiv);
    }
}

function ubahBulan(arah) {
    currentIndexBulan += arah;
    if (currentIndexBulan < 0) {
        currentIndexBulan = 0;
    } else if (currentIndexBulan >= listBulanAkademik.length) {
        currentIndexBulan = listBulanAkademik.length - 1;
    }
    renderKalender();
}

function tampilkanDetailJadwal(dateStr, agenda, day, namaBulan) {
    const detailBox = document.getElementById('detail-jadwal-text');
    if (agenda) {
        let badgeType = "";
        if (agenda.type === 'ujian') badgeType = "<span class='bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold'>Ujian / Penilaian</span>";
        else if (agenda.type === 'libur') badgeType = "<span class='bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold'>Hari Libur</span>";
        else badgeType = "<span class='bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold'>Kegiatan Sekolah</span>";

        detailBox.innerHTML = `
            <div class="space-y-1">
                <p class="font-bold text-emeraldCustom text-sm">📅 ${day} ${namaBulan}</p>
                <div>${badgeType} <span class="font-bold text-gray-800 ml-1">${agenda.title}</span></div>
            </div>
        `;
    } else {
        detailBox.innerHTML = `📅 <strong>${day} ${namaBulan}</strong>: Kegiatan Belajar Mengajar (KBM) Efektif Reguler / Hari Sekolah.`;
    }
}

// Inisialisasi jalankan kalender saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    renderKalender();
});