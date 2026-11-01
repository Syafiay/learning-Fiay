

let discussionPosts = [];

        // Loading and managing Ruang Diskusi Data
        function loadDiscussionData() {
            const stored = localStorage.getItem('ski_discussion_posts');
            if (stored) {
                discussionPosts = JSON.parse(stored);
            } else {
                // Default sample posts for rich initial content
                discussionPosts = [
                    {
                        id: 101,
                        author: "Ahmad Fauzi (X A)",
                        time: "Hari ini 07:30",
                        content: "Assalamu'alaikum kawan-kawan. Mengapa Rumah Arqam bin Abi al-Arqam dipilih sebagai pusat dakwah sirriyah pertama?",
                        likes: 3,
                        replies: [
                            { author: "Siti Aisyah (X B)", time: "07:35", text: "Wa'alaikumussalam Ahmad. Karena letaknya tersembunyi di bukit Shafa dan Arqam r.a belum dicurigai Kafir Quraisy." }
                        ]
                    }
                ];
                saveDiscussionData();
            }
            renderDiscussions();
        }

        function saveDiscussionData() {
            localStorage.setItem('ski_discussion_posts', JSON.stringify(discussionPosts));
        }

        function postDiscussionMessage(e) {
            e.preventDefault();
            const input = document.getElementById('discussion-input');
            const text = input.value.trim();
            if (!text) return;

            const newPost = {
                id: Date.now(),
                author: currentStudent ? `${currentStudent.nama} (${currentStudent.kelas})` : "Siswa",
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                content: text,
                likes: 0,
                replies: []
            };

            discussionPosts.unshift(newPost);
            saveDiscussionData();
            renderDiscussions();
            input.value = '';
        }

        function renderDiscussions() {
            const feed = document.getElementById('discussion-feed');
            if (!feed) return;
            feed.innerHTML = '';

            if (discussionPosts.length === 0) {
                feed.innerHTML = `<div class="p-4 text-center text-xs text-gray-500 bg-white rounded-xl">Belum ada percakapan. Jadilah yang pertama bertanya!</div>`;
                return;
            }

            discussionPosts.forEach(post => {
                const card = document.createElement('div');
                card.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3";
                
                let repliesHTML = '';
                if (post.replies && post.replies.length > 0) {
                    repliesHTML = post.replies.map(r => `
                        <div class="bg-creamCustom p-2.5 rounded-lg border-l-2 border-emeraldCustom text-xs space-y-1">
                            <div class="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                                <span>${r.author}</span>
                                <span>${r.time}</span>
                            </div>
                            <p class="text-gray-700">${r.text}</p>
                        </div>
                    `).join('');
                }

                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 bg-emerald-100 text-emeraldCustom rounded-full flex items-center justify-center font-bold text-xs">💬</span>
                            <div>
                                <h4 class="font-bold text-xs text-emeraldCustom">${post.author}</h4>
                                <span class="text-[10px] text-gray-400">${post.time}</span>
                            </div>
                        </div>
                        <button onclick="toggleLikeDiskusi(${post.id})" class="text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                            <span>👍</span> <span>${post.likes}</span>
                        </button>
                    </div>
                    <p class="text-xs md:text-sm text-gray-800 leading-relaxed">${post.content}</p>
                    
                    ${repliesHTML ? `<div class="space-y-2 pt-1">${repliesHTML}</div>` : ''}

                    <div class="pt-2 flex gap-2">
                        <input type="text" id="reply-input-${post.id}" placeholder="Tulis balasan..." class="flex-grow px-3 py-1 border rounded-lg text-xs focus:outline-none focus:border-goldCustom">
                        <button onclick="addReplyDiskusi(${post.id})" class="bg-emeraldCustom hover:bg-emeraldCustom-dark text-white px-3 py-1 rounded-lg text-xs font-bold">Balas</button>
                    </div>
                `;
                feed.appendChild(card);
            });
        }

        function toggleLikeDiskusi(postId) {
            const post = discussionPosts.find(p => p.id === postId);
            if (post) {
                post.likes++;
                saveDiscussionData();
                renderDiscussions();
            }
        }

        function addReplyDiskusi(postId) {
            const input = document.getElementById(`reply-input-${postId}`);
            const text = input ? input.value.trim() : '';
            if (!text) return;

            const post = discussionPosts.find(p => p.id === postId);
            if (post) {
                post.replies.push({
                    author: currentStudent ? `${currentStudent.nama} (${currentStudent.kelas})` : "Siswa",
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    text: text
                });
                saveDiscussionData();
                renderDiscussions();
            }
        }

        // Initialize discussion data on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadDiscussionData();
            const form = document.getElementById('discussion-form');
            if (form) {
                form.addEventListener('submit', postDiscussionMessage);
            }
        });
