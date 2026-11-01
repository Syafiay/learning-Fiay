        const DATA_SISWA = [
            { nis: "12345", nama: "Ahmad Fauzi", kelas: "X A" },
            { nis: "12346", nama: "Siti Aisyah", kelas: "X B" },
            { nis: "10001", nama: "Muhammad Rizky", kelas: "X A" },
            { nis: "10002", nama: "Nur Khadijah", kelas: "X B" },
            { nis: "10003", nama: "Farhan Ali", kelas: "X C" }
        ];

        let currentStudent = null;
        let activeSession = null;
        let attendanceLogs = [];
        let userProgress = {
            presence: false,
            materi: false,
            video: false,
            simulasi: false,
            quizCompleted: false,
            quizScore: 0
        };

        function getTodayString() {
            return new Date().toISOString().split('T')[0];
        }

        function loadSystemData() {
            const today = getTodayString();
            
            const savedSession = localStorage.getItem(`ski_session_${today}`);
            if (savedSession) {
                activeSession = JSON.parse(savedSession);
            } else {
                activeSession = {
                    date: today,
                    code: "SKI1030",
                    subject: "SKI",
                    targetClass: "Semua",
                    deadline: "07:30"
                };
                localStorage.setItem(`ski_session_${today}`, JSON.stringify(activeSession));
            }

            const savedLogs = localStorage.getItem(`ski_logs_${today}_${activeSession.code}`);
            if (savedLogs) {
                attendanceLogs = JSON.parse(savedLogs);
            }

            updateSessionBanner();
            checkExistingStudentSession();
        }

        function updateSessionBanner() {
            if (!activeSession) return;
            document.getElementById('session-code-display').innerText = `Kode: ${activeSession.code}`;
            document.getElementById('session-time-display').innerText = `Batas: ${activeSession.deadline}`;
            document.getElementById('session-class-display').innerText = `Kelas: ${activeSession.targetClass}`;
            
            document.getElementById('setup-code').value = activeSession.code;
            document.getElementById('setup-class').value = activeSession.targetClass;
            document.getElementById('setup-deadline').value = activeSession.deadline;
        }

        function fillNis(val) {
            document.getElementById('nis-input').value = val;
            if (activeSession) {
                document.getElementById('code-input').value = activeSession.code;
            }
        }

        function togglePermissionReason(show) {
            const box = document.getElementById('permission-reason-container');
            if (show) box.classList.remove('hidden');
            else box.classList.add('hidden');
        }

        function handleStudentAttendance(e) {
            e.preventDefault();
            const nisInput = document.getElementById('nis-input').value.trim();
            const codeInput = document.getElementById('code-input').value.trim().toUpperCase();
            const statusRadio = document.querySelector('input[name="attendance_status"]:checked').value;
            const reasonInput = document.getElementById('reason-input').value.trim();
            const errorBox = document.getElementById('login-error');
            const errorMsg = document.getElementById('login-error-msg');

            if (!activeSession || codeInput !== activeSession.code) {
                errorMsg.innerText = "Kode presensi tidak valid atau sudah tidak berlaku.";
                errorBox.classList.remove('hidden');
                return;
            }

            const student = DATA_SISWA.find(s => s.nis === nisInput);
            if (!student) {
                errorMsg.innerText = "NIS tidak ditemukan. Periksa kembali NIS Anda.";
                errorBox.classList.remove('hidden');
                return;
            }

            if (activeSession.targetClass !== "Semua" && activeSession.targetClass !== student.kelas) {
                errorMsg.innerText = `Sesi presensi khusus untuk ${activeSession.targetClass}. Anda di ${student.kelas}.`;
                errorBox.classList.remove('hidden');
                return;
            }

            const today = getTodayString();
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            const existingLog = attendanceLogs.find(l => l.nis === student.nis);
            if (existingLog) {
                currentStudent = student;
                localStorage.setItem('ski_active_student', JSON.stringify(student));
                showAttendanceTicket(student, existingLog, true);
                return;
            }

            let finalStatus = statusRadio;
            if (statusRadio === "Hadir") {
                const deadlineParts = activeSession.deadline.split(':');
                const deadlineTime = new Date();
                deadlineTime.setHours(parseInt(deadlineParts[0]), parseInt(deadlineParts[1]), 0);
                if (now > deadlineTime) finalStatus = "Terlambat";
            }

            const newLog = {
                nis: student.nis,
                nama: student.nama,
                kelas: student.kelas,
                timestamp: `${now.toLocaleDateString('id-ID')} ${timeStr}`,
                timeOnly: timeStr,
                status: finalStatus,
                keterangan: (finalStatus === "Izin" || finalStatus === "Sakit") ? reasonInput : "-",
                code: activeSession.code
            };

            attendanceLogs.push(newLog);
            localStorage.setItem(`ski_logs_${today}_${activeSession.code}`, JSON.stringify(attendanceLogs));

            currentStudent = student;
            localStorage.setItem('ski_active_student', JSON.stringify(student));

            showAttendanceTicket(student, newLog, false);
        }

        function showAttendanceTicket(student, log, isAlready) {
            document.getElementById('ticket-student-info').innerText = `${student.nama} (${student.kelas})`;
            document.getElementById('ticket-nis').innerText = student.nis;
            document.getElementById('ticket-datetime').innerText = log.timestamp;
            document.getElementById('ticket-session').innerText = log.code;

            const badge = document.getElementById('ticket-status-badge');
            badge.innerText = log.status.toUpperCase();
            
            if (log.status === "Hadir") badge.className = "px-3 py-1 rounded-full font-extrabold text-white bg-emerald-600";
            else if (log.status === "Terlambat") badge.className = "px-3 py-1 rounded-full font-extrabold text-white bg-amber-600";
            else if (log.status === "Izin") badge.className = "px-3 py-1 rounded-full font-extrabold text-white bg-blue-600";
            else if (log.status === "Sakit") badge.className = "px-3 py-1 rounded-full font-extrabold text-white bg-rose-600";

            userProgress.presence = true;
            updateDashboardUI();

            if (isAlready) {
                alert(`Anda sudah presensi pada pukul ${log.timeOnly} dengan status: ${log.status}`);
            }

            document.getElementById('attendance-card-modal').classList.remove('hidden');
        }

        function openAttendanceCardModal() {
            if (!currentStudent) return;
            const log = attendanceLogs.find(l => l.nis === currentStudent.nis);
            if (log) showAttendanceTicket(currentStudent, log, false);
        }

        function enterLearningMedia() {
            document.getElementById('attendance-card-modal').classList.add('hidden');
            document.getElementById('login-modal').classList.add('hidden');
            applyLoginState();
        }

        function applyLoginState() {
            if (!currentStudent) return;

            updateElementIfPresent('hero-student-name', element => element.innerText = currentStudent.nama);
            updateElementIfPresent('hero-student-nis', element => element.innerText = currentStudent.nis);
            updateElementIfPresent('hero-student-class', element => element.innerText = currentStudent.kelas);
            updateElementIfPresent('bento-student-name', element => element.innerText = currentStudent.nama);
            updateElementIfPresent('bento-student-info', element => element.innerText = `NIS: ${currentStudent.nis} | ${currentStudent.kelas}`);
            updateElementIfPresent('sim-welcome-msg', element => {
                element.innerText = `Selamat datang, ${currentStudent.nama} (${currentStudent.kelas}). Mari jalankan simulasi dakwah sirriyah.`;
            });

            loadStudentProgress();
            updateDashboardUI();
        }

        function updateElementIfPresent(id, update) {
            const element = document.getElementById(id);
            if (element) update(element);
        }

        function loadStudentProgress() {
            if (!currentStudent) return;
            const savedProg = localStorage.getItem(`ski_progress_${currentStudent.nis}`);
            if (savedProg) {
                userProgress = JSON.parse(savedProg);
            } else {
                userProgress.presence = true;
                saveProgress();
            }
        }

        function saveProgress() {
            if (!currentStudent) return;
            localStorage.setItem(`ski_progress_${currentStudent.nis}`, JSON.stringify(userProgress));
        }

        function updateDashboardUI() {
            // Calculate Progress Percentage
            let count = 1; // Presence done
            if (userProgress.materi) count++;
            if (userProgress.video) count++;
            if (userProgress.simulasi) count++;
            if (userProgress.quizCompleted) count++;

            const pct = Math.round((count / 5) * 100);
            updateElementIfPresent('hero-progress-num', element => element.innerText = `${pct}%`);
            updateElementIfPresent('hero-progress-bar', element => element.style.width = `${pct}%`);

            // Update Pathway UI
            if (userProgress.materi) {
                updateElementIfPresent('step-2-icon', element => {
                    element.className = "w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-goldCustom";
                    element.innerText = "✓";
                });
                updateElementIfPresent('step-2-status', element => {
                    element.innerText = "Selesai";
                    element.className = "text-[10px] font-bold text-emerald-700";
                });
            }

            if (userProgress.video) {
                updateElementIfPresent('step-3-icon', element => {
                    element.className = "w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-goldCustom";
                    element.innerText = "✓";
                });
                updateElementIfPresent('step-3-status', element => {
                    element.innerText = "Selesai";
                    element.className = "text-[10px] font-bold text-emerald-700";
                });
            }

            if (userProgress.simulasi) {
                updateElementIfPresent('step-4-icon', element => {
                    element.className = "w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-goldCustom";
                    element.innerText = "✓";
                });
                updateElementIfPresent('step-4-status', element => {
                    element.innerText = "Selesai";
                    element.className = "text-[10px] font-bold text-emerald-700";
                });
            }

            if (userProgress.quizCompleted) {
                updateElementIfPresent('step-5-icon', element => {
                    element.className = "w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-goldCustom";
                    element.innerText = "✓";
                });
                updateElementIfPresent('step-5-status', element => {
                    element.innerText = "Selesai";
                    element.className = "text-[10px] font-bold text-emerald-700";
                });
                updateElementIfPresent('step-6-icon', element => {
                    element.className = "w-12 h-12 rounded-full bg-goldCustom text-emeraldCustom-dark flex items-center justify-center font-bold text-lg shadow-md pulse-active border-2 border-emeraldCustom";
                    element.innerText = "🎓";
                });
                updateElementIfPresent('step-6-status', element => {
                    element.innerText = "Siap Unduh";
                    element.className = "text-[10px] font-bold text-amber-700";
                });
                updateElementIfPresent('bento-quiz-score-badge', element => {
                    element.innerText = `Skor Terakhir: ${userProgress.quizScore}/100`;
                });
                updateElementIfPresent('bento-quiz-status', element => {
                    element.innerText = "🟢 Selesai Mengerjakan";
                    element.className = "text-[11px] font-bold text-emerald-700";
                });
            }
        }

        function resetLoginForm() {
            document.getElementById('nis-input').value = '';
            document.getElementById('login-error').classList.add('hidden');
        }

        function logout() {
            localStorage.removeItem('ski_active_student');
            currentStudent = null;
            resetSimulation();
            if (document.getElementById('quiz-result-container')) restartQuiz();
            resetLoginForm();
            document.getElementById('login-modal').classList.remove('hidden');
        }

        function checkExistingStudentSession() {
            const saved = localStorage.getItem('ski_active_student');
            if (saved) {
                try {
                    currentStudent = JSON.parse(saved);
                    updateElementIfPresent('login-modal', element => element.classList.add('hidden'));
                    applyLoginState();
                } catch(e) {
                    localStorage.removeItem('ski_active_student');
                }
            }
        }

        function openGuideModal() {
            document.getElementById('guide-modal').classList.remove('hidden');
        }

        function closeGuideModal() {
            document.getElementById('guide-modal').classList.add('hidden');
        }

        function openGuruModal() {
            document.getElementById('guru-modal').classList.remove('hidden');
        }

        function closeGuruModal() {
            document.getElementById('guru-modal').classList.add('hidden');
        }

        function verifyGuruPass() {
            const pass = document.getElementById('guru-pass-input').value;
            const err = document.getElementById('guru-auth-error');

            if (pass === "guru2026") {
                err.classList.add('hidden');
                document.getElementById('guru-auth-section').classList.add('hidden');
                document.getElementById('guru-dashboard').classList.remove('hidden');
                renderGuruTable();
            } else {
                err.classList.remove('hidden');
            }
        }

        function saveSessionSetup() {
            const today = getTodayString();
            const code = document.getElementById('setup-code').value.trim().toUpperCase() || "SKI1030";
            const targetClass = document.getElementById('setup-class').value;
            const deadline = document.getElementById('setup-deadline').value;

            activeSession = { date: today, code: code, subject: "SKI", targetClass: targetClass, deadline: deadline };
            localStorage.setItem(`ski_session_${today}`, JSON.stringify(activeSession));
            updateSessionBanner();
            alert("Sesi presensi berhasil disimpan!");
            renderGuruTable();
        }

        function renderGuruTable() {
            if (!activeSession) return;
            const tbody = document.getElementById('guru-recap-tbody');
            const searchVal = document.getElementById('guru-search').value.toLowerCase();
            tbody.innerHTML = '';

            let countHadir = 0, countTerlambat = 0, countIzin = 0, countSakit = 0;
            let targetStudents = DATA_SISWA;
            if (activeSession.targetClass !== "Semua") {
                targetStudents = DATA_SISWA.filter(s => s.kelas === activeSession.targetClass);
            }

            targetStudents.forEach(student => {
                const log = attendanceLogs.find(l => l.nis === student.nis);
                const status = log ? log.status : "Belum Absen";
                const time = log ? log.timestamp : "-";
                const ket = log ? log.keterangan : "-";

                if (status === "Hadir") countHadir++;
                else if (status === "Terlambat") countTerlambat++;
                else if (status === "Izin") countIzin++;
                else if (status === "Sakit") countSakit++;

                if (searchVal && !student.nama.toLowerCase().includes(searchVal) && !student.nis.includes(searchVal)) return;

                const tr = document.createElement('tr');
                tr.className = "hover:bg-creamCustom transition";

                let statusColor = "bg-gray-100 text-gray-700";
                if (status === "Hadir") statusColor = "bg-emerald-100 text-emerald-800 font-bold";
                else if (status === "Terlambat") statusColor = "bg-amber-100 text-amber-800 font-bold";
                else if (status === "Izin") statusColor = "bg-blue-100 text-blue-800 font-bold";
                else if (status === "Sakit") statusColor = "bg-rose-100 text-rose-800 font-bold";

                tr.innerHTML = `
                    <td class="p-2.5 font-mono font-bold">${student.nis}</td>
                    <td class="p-2.5 font-semibold text-gray-800">${student.nama}</td>
                    <td class="p-2.5 text-gray-600">${student.kelas}</td>
                    <td class="p-2.5 text-gray-500">${time}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[11px] ${statusColor}">${status}</span></td>
                    <td class="p-2.5 text-gray-500 italic max-w-xs truncate">${ket}</td>
                    <td class="p-2.5 text-center">
                        <select onchange="changeStudentStatus('${student.nis}', this.value)" class="text-[11px] border rounded px-1.5 py-1 bg-white focus:border-goldCustom">
                            <option value="" disabled selected>Ubah Status</option>
                            <option value="Hadir">Hadir</option>
                            <option value="Terlambat">Terlambat</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Alpa">Alpa / Reset</option>
                        </select>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('stat-hadir').innerText = countHadir;
            document.getElementById('stat-terlambat').innerText = countTerlambat;
            document.getElementById('stat-izin').innerText = countIzin;
            document.getElementById('stat-sakit').innerText = countSakit;
            document.getElementById('stat-belum').innerText = targetStudents.length - (countHadir + countTerlambat + countIzin + countSakit);
        }

        function changeStudentStatus(nis, newStatus) {
            const today = getTodayString();
            const student = DATA_SISWA.find(s => s.nis === nis);
            if (!student) return;

            let logIndex = attendanceLogs.findIndex(l => l.nis === nis);
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            if (newStatus === "Alpa") {
                if (logIndex !== -1) attendanceLogs.splice(logIndex, 1);
            } else {
                if (logIndex !== -1) {
                    attendanceLogs[logIndex].status = newStatus;
                } else {
                    attendanceLogs.push({
                        nis: student.nis, nama: student.nama, kelas: student.kelas,
                        timestamp: `${now.toLocaleDateString('id-ID')} ${timeStr}`, timeOnly: timeStr,
                        status: newStatus, keterangan: "Diubah manual oleh guru", code: activeSession.code
                    });
                }
            }

            localStorage.setItem(`ski_logs_${today}_${activeSession.code}`, JSON.stringify(attendanceLogs));
            renderGuruTable();
        }

        function resetTodayAttendance() {
            if (confirm("Hapus seluruh data presensi sesi hari ini?")) {
                const today = getTodayString();
                attendanceLogs = [];
                localStorage.removeItem(`ski_logs_${today}_${activeSession.code}`);
                renderGuruTable();
            }
        }

        function copyRecapClipboard() {
            let text = `REKAP PRESENSI DIGITAL SKI KELAS X\nTanggal: ${getTodayString()} | Kode Sesi: ${activeSession.code}\n\nNIS\tNama\tKelas\tWaktu\tStatus\tKeterangan\n`;
            DATA_SISWA.forEach(s => {
                const log = attendanceLogs.find(l => l.nis === s.nis);
                text += `${s.nis}\t${s.nama}\t${s.kelas}\t${log ? log.timestamp : '-'}\t${log ? log.status : 'Belum Absen'}\t${log ? log.keterangan : '-'}\n`;
            });
            navigator.clipboard.writeText(text).then(() => alert("Rekap disalin ke clipboard!"));
        }

        function downloadRecapCSV() {
            let csv = `NIS,Nama Siswa,Kelas,Waktu Presensi,Status,Keterangan\n`;
            DATA_SISWA.forEach(s => {
                const log = attendanceLogs.find(l => l.nis === s.nis);
                csv += `"${s.nis}","${s.nama}","${s.kelas}","${log ? log.timestamp : '-'}","${log ? log.status : 'Belum Absen'}","${log ? log.keterangan : '-'}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Rekap_Presensi_SKI_${getTodayString()}.csv`;
            link.click();
        }

        function switchTab(tabName) {
            const tabs = ['beranda', 'materi', 'simulasi', 'kuis'];
            tabs.forEach(t => {
                const section = document.getElementById(`sec-${t}`);
                if (section) section.classList.add('hidden');

                const tab = document.getElementById(`tab-${t}`);
                if (tab) tab.classList.remove('active');
            });

            const section = document.getElementById(`sec-${tabName}`);
            if (!section) return;
            section.classList.remove('hidden');

            const tab = document.getElementById(`tab-${tabName}`);
            if (tab) tab.classList.add('active');

            if (tabName === 'materi') {
                userProgress.materi = true;
                saveProgress();
                updateDashboardUI();
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function scrollToVideo() {
            switchTab('beranda');
            document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' });
            userProgress.video = true;
            saveProgress();
            updateDashboardUI();
        }

        function playVideoPlaceholder() {
            alert("Memutar Video Pembelajaran: Dakwah Sirriyah Rasulullah Saw.\n\nSiswa dapat menyimak narasi strategi pembinaan umat awal Makkah.");
            userProgress.video = true;
            saveProgress();
            updateDashboardUI();
        }

        function toggleAccordion(id) {
            const content = document.getElementById(id);
            const icon = document.getElementById(`icon-${id}`);
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                icon.innerText = '+';
            } else {
                content.classList.add('active');
                icon.innerText = '-';
            }
        }

        const simCharacters = [
            {
                name: "Keluarga Dekat", title: "Pendekatan Keluarga Dekat", subtitle: "Kerabat bertanya tentang perubahan peribadatan", icon: "🏡",
                question: "Mengapa kita harus meninggalkan ajaran nenek moyang dan menyembah Tuhan yang tidak kelihatan?",
                options: [
                    { text: "Menjelaskan dengan santun bahwa Allah Swt. Maha Menciptakan langit dan bumi, sementara berhala tidak dapat memberi manfaat atau bahaya.", feedback: "Sangat Tepat! Pendekatan keteladanan dan kasih sayang menyentuh hati keluarga.", scores: { iman: 10, berani: 5, satu: 10 }, correct: true },
                    { text: "Menjelaskan secara keras bahwa ajaran nenek moyang adalah sesat dan berhala harus segera dihancurkan.", feedback: "Kurang Tepat. Sikap keras menimbulkan penolakan emosional dari keluarga.", scores: { iman: 5, berani: 5, satu: 0 }, correct: false },
                    { text: "Menghindari pertanyaan dan beribadah secara diam-diam tanpa memberikan penjelasan apapun.", feedback: "Kurang Tepat. Penjelasan penuh hikmah tetap diperlukan.", scores: { iman: 5, berani: 0, satu: 5 }, correct: false }
                ]
            },
            {
                name: "Sahabat Karib", title: "Diskusi Tokoh Sahabat Karib", subtitle: "Sahabat kepercayaan meminta kejujuran", icon: "🤝",
                question: "Aku melihat engkau berkumpul secara rahasia. Ajaran apa yang sedang engkau ikuti?",
                options: [
                    { text: "Mengajaknya berdiskusi empat mata secara bertahap, menyampaikan indahnya kejujuran, tauhid, dan persamaan derajat dalam Islam.", feedback: "Sangat Tepat! Kepercayaan sahabat karib adalah pintu masuk dakwah sirriyah yang efektif.", scores: { iman: 10, berani: 10, satu: 10 }, correct: true },
                    { text: "Memintanya bersumpah menjaga rahasia dahulu, lalu memaksanya langsung masuk Islam hari itu juga.", feedback: "Kurang Tepat. Dakwah memerlukan kesadaran dan keikhlasan hati.", scores: { iman: 5, berani: 5, satu: 2 }, correct: false },
                    { text: "Merahasiakannya sepenuhnya dan mengatakan bahwa tidak ada kegiatan apapun.", feedback: "Kurang Tepat. Menolak sahabat dekat mengurangi rasa percaya.", scores: { iman: 2, berani: 0, satu: 2 }, correct: false }
                ]
            },
            {
                name: "Pemuda Quraisy", title: "Dialog Pemuda Mencari Kebenaran", subtitle: "Pemuda Makkah yang kritis terhadap ketidakadilan", icon: "🏹",
                question: "Tradisi suku kita membeda-bedakan bangsawan dan budak. Apakah Islam menawarkan keadilan?",
                options: [
                    { text: "Menjelaskan bahwa di mata Allah semua manusia adalah sederajat, yang membedakan hanyalah ketakwaan dan akhlaknya.", feedback: "Sangat Tepat! Prinsip kesetaraan menjadi daya tarik besar bagi pemuda.", scores: { iman: 10, berani: 10, satu: 8 }, correct: true },
                    { text: "Menyarankan agar pemuda fokus saja pada urusan sendiri.", feedback: "Kurang Tepat. Islam membawa misi kepedulian sosial.", scores: { iman: 2, berani: 2, satu: 0 }, correct: false },
                    { text: "Mengajaknya langsung memprotes para pemuka Quraisy secara terbuka.", feedback: "Kurang Tepat. Konfrontasi terbuka belum waktunya pada masa sirriyah.", scores: { iman: 5, berani: 10, satu: 2 }, correct: false }
                ]
            },
            {
                name: "Masyarakat Makkah", title: "Keingintahuan Rumah Pembinaan", subtitle: "Masyarakat bertanya tentang fungsi Rumah Arqam", icon: "🏛️",
                question: "Mengapa kalian berkumpul secara khusus di rumah Arqam bin Abi al-Arqam?",
                options: [
                    { text: "Menjelaskan bahwa rumah Arqam adalah tempat belajar kebaikan, kedamaian, dan tazkiyatun nufus secara tertib.", feedback: "Sangat Tepat! Menggambarkan Darul Arqam sebagai pusat pendidikan moral.", scores: { iman: 10, berani: 8, satu: 10 }, correct: true },
                    { text: "Mengatakan itu adalah perkumpulan rahasia untuk merebut Makkah.", feedback: "Salah! Dakwah bukan gerakan kekerasan.", scores: { iman: 0, berani: 5, satu: 0 }, correct: false },
                    { text: "Mewaspadai panya dan melarang siapapun mendekati rumah Arqam.", feedback: "Kurang Tepat. Sikap curiga memicu prasangka buruk.", scores: { iman: 2, berani: 0, satu: 2 }, correct: false }
                ]
            }
        ];

        let simState = { completed: [false, false, false, false], scores: { iman: 0, berani: 0, satu: 0 }, activeIdx: null };

        function selectCharacter(idx) {
            if (simState.completed[idx]) return;
            simState.activeIdx = idx;
            const data = simCharacters[idx];

            document.getElementById('dialog-area').classList.remove('hidden');
            document.getElementById('dialog-icon').innerText = data.icon;
            document.getElementById('dialog-title').innerText = data.title;
            document.getElementById('dialog-subtitle').innerText = data.subtitle;
            document.getElementById('dialog-question').innerText = `"${data.question}"`;
            document.getElementById('dialog-feedback').classList.add('hidden');
            document.getElementById('dialog-next-btn').classList.add('hidden');

            const optionsContainer = document.getElementById('dialog-options');
            optionsContainer.innerHTML = '';

            data.options.forEach((opt, oIdx) => {
                const btn = document.createElement('button');
                btn.className = "w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-xs md:text-sm font-medium transition flex items-start gap-2";
                btn.innerHTML = `<span class="bg-emerald-100 text-emeraldCustom rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">${String.fromCharCode(65+oIdx)}</span> <span>${opt.text}</span>`;
                btn.onclick = () => answerDialog(oIdx);
                optionsContainer.appendChild(btn);
            });

            document.getElementById('dialog-area').scrollIntoView({ behavior: 'smooth' });
        }

        function answerDialog(optionIdx) {
            const charData = simCharacters[simState.activeIdx];
            const selectedOpt = charData.options[optionIdx];

            simState.scores.iman += selectedOpt.scores.iman;
            simState.scores.berani += selectedOpt.scores.berani;
            simState.scores.satu += selectedOpt.scores.satu;

            document.getElementById('score-iman').innerText = simState.scores.iman;
            document.getElementById('score-berani').innerText = simState.scores.berani;
            document.getElementById('score-satu').innerText = simState.scores.satu;

            const fbBox = document.getElementById('dialog-feedback');
            fbBox.classList.remove('hidden');
            fbBox.className = selectedOpt.correct ? "mt-4 p-4 rounded-lg text-xs md:text-sm bg-emerald-100 text-emerald-900 border border-emerald-300" : "mt-4 p-4 rounded-lg text-xs md:text-sm bg-amber-100 text-amber-900 border border-amber-300";
            fbBox.innerHTML = `<strong>Umpan Balik Edukatif:</strong> ${selectedOpt.feedback}`;

            document.getElementById('dialog-options').querySelectorAll('button').forEach(btn => btn.disabled = true);

            simState.completed[simState.activeIdx] = true;
            const statusElem = document.getElementById(`status-${simState.activeIdx}`);
            statusElem.innerText = "Selesai";
            statusElem.className = "mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold";

            document.getElementById('dialog-next-btn').classList.remove('hidden');
        }

        function closeDialog() {
            document.getElementById('dialog-area').classList.add('hidden');
            if (simState.completed.every(val => val === true)) finishSimulation();
        }

        function finishSimulation() {
            document.getElementById('sim-main-container').classList.add('hidden');
            document.getElementById('sim-result-container').classList.remove('hidden');

            const name = currentStudent ? currentStudent.nama : "Siswa";
            document.getElementById('sim-result-student').innerText = `Selamat ${name}, Anda telah menyelesaikan simulasi dakwah!`;

            userProgress.simulasi = true;
            saveProgress();
            updateDashboardUI();
        }

        function resetSimulation() {
            simState = { completed: [false, false, false, false], scores: { iman: 0, berani: 0, satu: 0 }, activeIdx: null };
            updateElementIfPresent('score-iman', element => element.innerText = "0");
            updateElementIfPresent('score-berani', element => element.innerText = "0");
            updateElementIfPresent('score-satu', element => element.innerText = "0");

            for (let i = 0; i < 4; i++) {
                const statusElem = document.getElementById(`status-${i}`);
                if (statusElem) {
                    statusElem.innerText = "Belum Diajak";
                    statusElem.className = "mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold";
                }
            }

            updateElementIfPresent('dialog-area', element => element.classList.add('hidden'));
            updateElementIfPresent('sim-result-container', element => element.classList.add('hidden'));
            updateElementIfPresent('sim-main-container', element => element.classList.remove('hidden'));
        }

        // <!-- Quiz Data and Logic -->
        const quizDataMaster = [
            { question: "Wahyu Al-Qur'an yang menjadi landasan perintah awal dakwah Rasulullah Saw. adalah...", options: ["Q.S. Al-Muddassir [74]: 1-7", "Q.S. Al-Hijr [15]: 94", "Q.S. Al-Fatihah [1]: 1-7", "Q.S. Al-Baqarah [2]: 183"], answer: 0, explanation: "Q.S. Al-Muddassir ayat 1-7 berisi perintah 'Wahai orang yang berkelimut, bangunlah lalu berilah peringatan!'." },
            { question: "Durasi pelaksanaan dakwah Nabi Muhammad Saw. secara sembunyi-sembunyi (sirriyah) di Makkah adalah...", options: ["Sekitar 3 Tahun", "Sekitar 5 Tahun", "Sekitar 10 Tahun", "Sekitar 1 Tahun"], answer: 0, explanation: "Dakwah sirriyah berlangsung kurang lebih selama 3 tahun." },
            { question: "Wanita pertama yang menyatakan keimanan dan memeluk Islam adalah...", options: ["Khadijah binti Khuwailid r.a.", "Aisyah binti Abu Bakar r.a.", "Fatimah az-Zahra r.a.", "Sumayyah binti Khayyat r.a."], answer: 0, explanation: "Siti Khadijah binti Khuwailid r.a. adalah orang pertama dari kalangan wanita yang masuk Islam." },
            { question: "Pusat pembinaan akidah umat Islam pertama pada periode Makkah adalah...", options: ["Rumah Arqam bin Abi al-Arqam", "Rumah Abu Bakar ash-Shiddiq", "Rumah Ali bin Abi Thalib", "Rumah Utsman bin Affan"], answer: 0, explanation: "Darul Arqam dipilih sebagai madrasah pertama kaum muslimin awal." },
            { question: "Golongan anak-anak/pemuda pertama yang memeluk Islam adalah...", options: ["Ali bin Abi Thalib r.a.", "Zaid bin Haritsah r.a.", "Usamah bin Zaid r.a.", "Abdullah bin Mas'ud r.a."], answer: 0, explanation: "Ali bin Abi Thalib r.a. memeluk Islam pada usia sangat muda (sekitar 10 tahun)." },
            { question: "Berikut ini BUKAN alasan dakwah dilakukan secara sembunyi-sembunyi adalah...", options: ["Rasa takut Rasulullah Saw. terhadap ancaman kaum Quraisy", "Jumlah umat Islam yang masih sangat sedikit", "Menghindari pemusnahan massal dari penguasa Makkah", "Fokus memperkuat akidah kader awal"], answer: 0, explanation: "Rasulullah Saw. tidak pernah takut, melainkan strategi kearifan pembinaan internal." },
            { question: "Materi utama fokus ajaran dakwah periode Makkah adalah...", options: ["Pemurnian tauhid, perbaikan akhlak, dan hari akhir", "Hukum waris dan tata cara zakat", "Strategi militer perang", "Sistem tata negara birokrasi"], answer: 0, explanation: "Materi periode Makkah berfokus pada akidah tauhid dan penyucian akhlak." },
            { question: "Tokoh sahabat yang masuk Islam melalui pendekatan Abu Bakar ash-Shiddiq r.a. adalah...", options: ["Utsman bin Affan r.a. dan Zubair bin Awwam r.a.", "Umar bin Khattab r.a. dan Hamzah r.a.", "Abu Hurairah r.a. dan Khalid bin Walid r.a.", "Bilal bin Rabah r.a."], answer: 0, explanation: "Utsman bin Affan dan Zubair bin Awwam masuk Islam melalui dakwah Abu Bakar r.a." },
            { question: "Ayat Al-Qur'an perintah peralihan ke dakwah terang-terangan (jahriyah) adalah...", options: ["Q.S. Al-Hijr [15]: 94", "Q.S. Al-'Alaq [96]: 1-5", "Q.S. An-Nasr [110]: 1-3", "Q.S. Al-Ahzab [33]: 21"], answer: 0, explanation: "Q.S. Al-Hijr ayat 94 memerintahkan menyampaikan risalah secara terang-terangan." },
            { question: "Gelar 'Assabiqunal Awwalun' diberikan kepada...", options: ["Orang-orang yang pertama kali memeluk agama Islam", "Pasukan Perang Badar", "Penduduk Yatsrib pembela Nabi", "Para penghafal Al-Qur'an"], answer: 0, explanation: "Assabiqunal Awwalun berarti orang-orang pertama yang masuk Islam." }
        ];

        let quizCurrentIdx = 0, quizScore = 0, quizQuestions = [];

        function shuffleArray(array) {
            let arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function initQuiz() {
            quizCurrentIdx = 0; quizScore = 0;
            quizQuestions = quizDataMaster.map(item => {
                let optsWithIdx = item.options.map((opt, idx) => ({ text: opt, origIdx: idx }));
                let shuffled = shuffleArray(optsWithIdx);
                return {
                    question: item.question,
                    options: shuffled.map(o => o.text),
                    answer: shuffled.findIndex(o => o.origIdx === item.answer),
                    explanation: item.explanation
                };
            });
            quizQuestions = shuffleArray(quizQuestions);
            document.getElementById('quiz-result-container').classList.add('hidden');
            document.getElementById('quiz-question-container').classList.remove('hidden');
            document.getElementById('quiz-header').classList.remove('hidden');
            showQuestion();
        }

        function showQuestion() {
            const q = quizQuestions[quizCurrentIdx];
            document.getElementById('quiz-progress-text').innerText = `Soal ${quizCurrentIdx + 1} dari ${quizQuestions.length}`;
            document.getElementById('quiz-score-badge').innerText = `Skor: ${quizScore}`;
            document.getElementById('quiz-progress-bar').style.width = `${((quizCurrentIdx + 1) / quizQuestions.length) * 100}%`;
            document.getElementById('quiz-question-text').innerText = `${quizCurrentIdx + 1}. ${q.question}`;

            const optsContainer = document.getElementById('quiz-options-container');
            optsContainer.innerHTML = '';

            q.options.forEach((optText, oIdx) => {
                const btn = document.createElement('button');
                btn.className = "w-full text-left p-3.5 rounded-xl border-2 border-gray-200 bg-white hover:border-emeraldCustom hover:bg-emerald-50 text-xs md:text-sm font-medium transition flex items-center gap-3";
                btn.innerHTML = `<span class="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">${String.fromCharCode(65 + oIdx)}</span> <span>${optText}</span>`;
                btn.onclick = () => checkAnswer(oIdx);
                optsContainer.appendChild(btn);
            });

            document.getElementById('quiz-feedback-box').classList.add('hidden');
            document.getElementById('quiz-next-container').classList.add('hidden');
        }

        function checkAnswer(selectedIdx) {
            const q = quizQuestions[quizCurrentIdx];
            const buttons = document.getElementById('quiz-options-container').querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);

            const isCorrect = (selectedIdx === q.answer);
            if (isCorrect) {
                quizScore += 10;
                buttons[selectedIdx].classList.add('border-emerald-600', 'bg-emerald-100', 'text-emerald-900');
            } else {
                buttons[selectedIdx].classList.add('border-red-500', 'bg-red-50', 'text-red-900');
                buttons[q.answer].classList.add('border-emerald-600', 'bg-emerald-100', 'text-emerald-900');
            }

            const fbBox = document.getElementById('quiz-feedback-box');
            fbBox.classList.remove('hidden');
            fbBox.className = isCorrect ? "p-4 rounded-xl text-xs md:text-sm leading-relaxed mt-4 bg-emerald-100 text-emerald-900 border border-emerald-300" : "p-4 rounded-xl text-xs md:text-sm leading-relaxed mt-4 bg-red-50 text-red-900 border border-red-200";
            document.getElementById('quiz-feedback-title').innerText = isCorrect ? "✅ Jawaban Anda Benar!" : "❌ Jawaban Belum Tepat.";
            document.getElementById('quiz-feedback-text').innerText = q.explanation;
            document.getElementById('quiz-score-badge').innerText = `Skor: ${quizScore}`;
            document.getElementById('quiz-next-container').classList.remove('hidden');
        }

        function nextQuestion() {
            quizCurrentIdx++;
            if (quizCurrentIdx < quizQuestions.length) showQuestion();
            else finishQuiz();
        }

        function finishQuiz() {
            document.getElementById('quiz-question-container').classList.add('hidden');
            document.getElementById('quiz-header').classList.add('hidden');
            document.getElementById('quiz-result-container').classList.remove('hidden');

            const name = currentStudent ? currentStudent.nama : "Siswa";
            document.getElementById('quiz-final-student').innerText = `Skor akhir ${name}:`;
            document.getElementById('quiz-final-score').innerText = `${quizScore} / 100`;
            updateElementIfPresent('quiz-final-percentage', element => {
                element.innerText = `(${quizScore}% Jawaban Benar)`;
            });

            let predicate = "Predikat: Perlu Belajar Lagi 💪";
            let review = "Jangan berkecil hati. Pelajari kembali materi interaktif SKI dan coba lagi.";
            if (quizScore >= 90) {
                predicate = "Predikat: Sangat Baik (Mumtaz) 🌟";
                review = "Luar biasa! Pemahaman Anda tentang dakwah sirriyah dan para tokoh awal Islam sangat baik.";
            } else if (quizScore >= 70) {
                predicate = "Predikat: Baik (Jayyid) 👍";
                review = "Anda telah memahami sebagian besar materi dakwah periode Makkah.";
            } else if (quizScore >= 50) {
                predicate = "Predikat: Cukup (Maqbul) 📖";
                review = "Baca kembali materi tentang Rumah Arqam dan kronologi dakwah sirriyah.";
            }
            updateElementIfPresent('quiz-predicate-badge', element => element.innerText = predicate);
            updateElementIfPresent('quiz-review-text', element => element.innerText = review);

            userProgress.quizCompleted = true;
            userProgress.quizScore = quizScore;
            saveProgress();
            updateDashboardUI();
        }

        function restartQuiz() { initQuiz(); }

        function openCertificateModal() {
            const name = currentStudent ? currentStudent.nama : "Nama Siswa";
            const studentClass = currentStudent ? currentStudent.kelas : "X";
            const nis = currentStudent ? currentStudent.nis : "-";

            document.getElementById('cert-student-name').innerText = name;
            document.getElementById('cert-student-class').innerText = `Kelas: ${studentClass} | NIS: ${nis}`;
            document.getElementById('cert-score').innerText = `${quizScore} / 100`;

            let pred = "Cukup (Maqbul)";
            if (quizScore >= 90) pred = "Sangat Baik (Mumtaz)";
            else if (quizScore >= 70) pred = "Baik (Jayyid)";

            document.getElementById('cert-predicate').innerText = pred;
            document.getElementById('cert-date').innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            document.getElementById('cert-modal').classList.remove('hidden');
        }

        function closeCertificateModal() {
            document.getElementById('cert-modal').classList.add('hidden');
        }

        function downloadCertificateJPG() {
            const canvas = document.getElementById('cert-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1200; canvas.height = 850;

            ctx.fillStyle = "#FAF9F5"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 12; ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
            ctx.lineWidth = 4; ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

            ctx.fillStyle = "#0F5132"; ctx.fillRect(52, 52, canvas.width - 104, 120);
            ctx.fillStyle = "#D4AF37"; ctx.font = "bold 36px 'Segoe UI', sans-serif"; ctx.textAlign = "center";
            ctx.fillText("SERTIFIKAT PENGHARGAAN", canvas.width / 2, 110);
            ctx.fillStyle = "#FFFFFF"; ctx.font = "18px 'Segoe UI', sans-serif";
            ctx.fillText("MEDIA PEMBELAJARAN INTERAKTIF SKI KELAS X MA", canvas.width / 2, 145);

            ctx.fillStyle = "#0A3622"; ctx.font = "bold 22px 'Segoe UI', sans-serif";
            ctx.fillText("Materi: Dakwah Nabi Muhammad Saw. Secara Sembunyi-Sembunyi (Sirriyah)", canvas.width / 2, 220);

            const name = currentStudent ? currentStudent.nama : "Nama Siswa";
            const studentClass = currentStudent ? currentStudent.kelas : "X";
            const nis = currentStudent ? currentStudent.nis : "-";

            ctx.fillStyle = "#0F5132"; ctx.font = "bold 44px 'Segoe UI', sans-serif"; ctx.fillText(name, canvas.width / 2, 340);
            ctx.fillStyle = "#333333"; ctx.font = "bold 20px 'Segoe UI', sans-serif";
            ctx.fillText(`Kelas: ${studentClass}  |  NIS: ${nis}`, canvas.width / 2, 380);

            ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2;
            ctx.fillRect(400, 480, 400, 100); ctx.strokeRect(400, 480, 400, 100);
            ctx.fillStyle = "#0F5132"; ctx.font = "bold 32px 'Segoe UI', sans-serif";
            ctx.fillText(`${quizScore}/100`, 500, 555);

            const imageURI = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement('a');
            link.download = `Sertifikat_SKI_${name.replace(/\s+/g, '_')}.jpg`;
            link.href = imageURI;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }

        window.onload = function() {
            if (document.getElementById('login-form')) {
                loadSystemData();
                initQuiz();
            } else if (document.getElementById('quiz-result-container')) {
                checkExistingStudentSession();
                initQuiz();
            }
        };
