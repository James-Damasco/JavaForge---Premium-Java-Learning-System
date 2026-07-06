class JavaForgeApp {
    constructor() {
        // Read local storage or fallback to defaults
        this.state = JSON.parse(localStorage.getItem('java_forge_v1')) || {
            user: {
                name: 'Student Learner',
                role: 'student',
                xp: 20,
                coins: 250,
                streak: 1,
                completedLessons: [],
                examPassed: false,
                notes: [],
                badges: []
            },
            currentBook: 'intro',
            currentChapter: 0,
            activeView: 'hero'
        };

        this.quizState = {
            type: null,
            currentIndex: 0,
            score: 0,
            timer: null,
            timeLimit: 120
        };

        this.chartInstance = null;
    }

    saveState() {
        localStorage.setItem('java_forge_v1', JSON.stringify(this.state));
        this.updateUI();
    }

    init() {
        lucide.createIcons();
        this.updateUI();
        this.renderLibrary();
        this.loadPlaygroundTemplate();
        this.renderLeaderboard();

        // Track visual theme selection
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.remove('dark');
            document.getElementById('theme-icon').className = 'fa-solid fa-moon text-lg';
        } else {
            document.documentElement.classList.add('dark');
            document.getElementById('theme-icon').className = 'fa-solid fa-sun text-lg';
        }

        this.navigateTo(this.state.activeView);
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            document.getElementById('theme-icon').className = 'fa-solid fa-moon text-lg';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            document.getElementById('theme-icon').className = 'fa-solid fa-sun text-lg';
        }
    }

    navigateTo(viewId) {
        // Hide all sections safely
        document.querySelectorAll('main > section').forEach(el => el.classList.add('hidden'));

        // Highlight corresponding sidebar button
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.remove('bg-brand-50', 'dark:bg-brand-950/20', 'text-brand-600', 'dark:text-brand-300', 'font-bold');
        });

        const activeViewEl = document.getElementById(`view-${viewId}`);
        if (activeViewEl) {
            activeViewEl.classList.remove('hidden');
            this.state.activeView = viewId;
            this.saveState();
        }

        // If navigating to dashboard, draw learning analytics
        if (viewId === 'dashboard') {
            setTimeout(() => this.drawProgressChart(), 100);
        }

        const sidebarBtn = document.getElementById(`nav-${viewId}`);
        if (sidebarBtn) {
            sidebarBtn.classList.add('bg-brand-50', 'dark:bg-brand-950/20', 'text-brand-600', 'dark:text-brand-300', 'font-bold');
        }
    }

    updateUI() {
        // Sync textual elements
        document.getElementById('dash-user-name').innerText = this.state.user.name;
        document.getElementById('cert-user-name').innerText = this.state.user.name;
        document.getElementById('streak-counter').innerText = `${this.state.user.streak} Day Streak`;
        document.getElementById('coin-counter').innerText = `${this.state.user.coins} Coins`;

        // Calculate XP Level
        const level = Math.floor(this.state.user.xp / 100) + 1;
        const remainingXP = this.state.user.xp % 100;
        document.getElementById('level-indicator').innerText = level;
        document.getElementById('xp-counter').innerText = `${remainingXP} / 100 XP`;

        // Update metrics counters
        document.getElementById('stat-completed-books').innerText = `${this.state.user.completedLessons.length} / 4`;
        document.getElementById('stat-xp-points').innerText = `${this.state.user.xp} XP`;
        document.getElementById('stat-badges').innerText = `${this.state.user.badges.length} Badges`;
        document.getElementById('stat-exam-avg').innerText = this.state.user.examPassed ? "100%" : "0%";

        // Toggle visibility controls on login status
        const headerStats = document.getElementById('header-stats');
        const sidebarNav = document.getElementById('sidebar-nav');
        const authActions = document.getElementById('auth-actions');

        if (this.state.user.name !== 'Student Learner' || this.state.user.xp > 20) {
            headerStats.classList.remove('hidden');
            sidebarNav.classList.remove('hidden');
            authActions.innerHTML = `
                        <div class="flex items-center space-x-2">
                            <span class="text-xs font-bold text-slate-500">${this.state.user.role === 'admin' ? '🛡️ Admin' : '👤 Student'}</span>
                            <button onclick="app.logout()" class="text-xs text-rose-500 hover:underline">Log Out</button>
                        </div>
                    `;
        } else {
            headerStats.classList.add('hidden');
            sidebarNav.classList.add('hidden');
            authActions.innerHTML = `
                        <button onclick="app.navigateTo('login')" class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-all shadow-lg shadow-brand-500/20">
                            Get Started
                        </button>
                    `;
        }

        // Render dynamic badges on dashboard
        this.renderBadges();

        // Lock/Unlock certificate
        if (this.state.user.examPassed) {
            document.getElementById('cert-status-lock').classList.add('hidden');
            document.getElementById('cert-status-unlocked').classList.remove('hidden');
            document.getElementById('cert-download-btn').removeAttribute('disabled');
            document.getElementById('cert-share-btn').removeAttribute('disabled');
        } else {
            document.getElementById('cert-status-lock').classList.remove('hidden');
            document.getElementById('cert-status-unlocked').classList.add('hidden');
            document.getElementById('cert-download-btn').setAttribute('disabled', 'true');
            document.getElementById('cert-share-btn').setAttribute('disabled', 'true');
        }
    }

    /*
     * SYSTEM USER ACTIONS
     */
    handleAuth(e) {
        e.preventDefault();
        const nameInput = document.getElementById('auth-name').value.trim();
        const roleInput = document.getElementById('auth-role').value;

        if (!nameInput) {
            Toastify({
                text: "Please supply a valid display name",
                duration: 3000,
                backgroundColor: "#f43f5e"
            }).showToast();
            return;
        }

        this.state.user.name = nameInput;
        this.state.user.role = roleInput;
        this.state.user.xp = Math.max(this.state.user.xp, 100); // Give boost
        this.saveState();

        Toastify({
            text: `Welcome back, ${nameInput}! Portal access authorized.`,
            duration: 3000,
            backgroundColor: "#10b981"
        }).showToast();

        this.navigateTo('dashboard');
    }

    logout() {
        this.state = {
            user: {
                name: 'Student Learner',
                role: 'student',
                xp: 20,
                coins: 250,
                streak: 1,
                completedLessons: [],
                examPassed: false,
                notes: [],
                badges: []
            },
            currentBook: 'intro',
            currentChapter: 0,
            activeView: 'hero'
        };
        this.saveState();
        this.navigateTo('hero');
    }

    claimDailyReward() {
        this.state.user.coins += 50;
        this.saveState();
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
        });

        document.getElementById('daily-claim-btn').setAttribute('disabled', 'true');
        document.getElementById('daily-claim-btn').innerHTML = `<span>Claimed Today &check;</span>`;

        Toastify({
            text: "Daily login reward received! +50 Gold Coins",
            duration: 3000,
            backgroundColor: "#f59e0b"
        }).showToast();
    }

    /*
     * RENDER DYNAMIC COMPONENTS & LISTS
     */
    renderLibrary() {
        const container = document.getElementById('library-cards');
        container.innerHTML = '';

        Object.keys(MOCK_BOOKS_DATABASE).forEach(key => {
            const book = MOCK_BOOKS_DATABASE[key];
            const diffColors = {
                beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                intermediate: 'bg-brand-100 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300',
                advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            };

            const isCompleted = this.state.user.completedLessons.includes(key);

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all";
            card.innerHTML = `
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${diffColors[book.difficulty]}">${book.difficulty}</span>
                                ${isCompleted ? '<span class="text-emerald-500 text-xs font-semibold flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Finished</span>' : ''}
                            </div>
                            <h3 class="text-lg font-bold">${book.title}</h3>
                            <p class="text-xs text-slate-400">By ${book.author} &bull; ${book.chapters.length} chapters</p>
                        </div>
                        <button onclick="app.openBook('${key}')" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs transition-all">
                            Open Reader Node
                        </button>
                    `;
            container.appendChild(card);
        });
    }

    filterLibrary(level) {
        document.querySelectorAll('.lib-filter-btn').forEach(btn => {
            btn.classList.remove('bg-brand-600', 'text-white');
            btn.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-500');
        });
        event.target.classList.add('bg-brand-600', 'text-white');

        // Perform dynamic filtering display toggles
        const cards = document.getElementById('library-cards').children;
        let idx = 0;
        Object.keys(MOCK_BOOKS_DATABASE).forEach(key => {
            const book = MOCK_BOOKS_DATABASE[key];
            if (level === 'all' || book.difficulty === level) {
                cards[idx].classList.remove('hidden');
            } else {
                cards[idx].classList.add('hidden');
            }
            idx++;
        });
    }

    openBook(bookId) {
        this.state.currentBook = bookId;
        this.state.currentChapter = 0;
        this.saveState();
        this.navigateTo('reader');
        this.renderReader();
    }

    renderReader() {
        const book = MOCK_BOOKS_DATABASE[this.state.currentBook];
        const chapter = book.chapters[this.state.currentChapter];

        document.getElementById('reader-book-title').innerText = book.title;
        document.getElementById('reader-chapter-title').innerText = `Chapter ${this.state.currentChapter + 1}: ${chapter.title}`;
        document.getElementById('reader-content').innerHTML = chapter.content;

        // Sync the continuous reading track panel in dashboard
        document.getElementById('continue-book-title').innerText = book.title;
        document.getElementById('continue-chapter-title').innerText = `Chapter ${this.state.currentChapter + 1}: ${chapter.title}`;

        // Build Table of Contents Sidebar
        const toc = document.getElementById('reader-toc');
        toc.innerHTML = '';
        book.chapters.forEach((ch, idx) => {
            const isCurrent = idx === this.state.currentChapter;
            const btn = document.createElement('button');
            btn.className = `w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${isCurrent ? 'bg-brand-500/10 text-brand-500 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`;
            btn.innerHTML = `Chapter ${idx + 1}: ${ch.title}`;
            btn.onclick = () => {
                this.state.currentChapter = idx;
                this.saveState();
                this.renderReader();
            };
            toc.appendChild(btn);
        });

        // Load saved notes for this lesson
        this.renderNotes();
    }

    resumeLearning() {
        this.navigateTo('reader');
        this.renderReader();
    }

    completeLesson() {
        const bookId = this.state.currentBook;
        if (!this.state.user.completedLessons.includes(bookId)) {
            this.state.user.completedLessons.push(bookId);
            this.state.user.xp += 30;
            this.state.user.coins += 25;
            this.saveState();

            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });

            Toastify({
                text: "Awesome job! Lesson completed! +30 XP & +25 Coins",
                duration: 3500,
                backgroundColor: "#10b981"
            }).showToast();

            this.renderLibrary();
        } else {
            Toastify({
                text: "You have already completed this lesson module.",
                duration: 3000,
                backgroundColor: "#3b82f6"
            }).showToast();
        }
    }

    /*
     * LESSON NOTES FEATURE DRAWER
     */
    toggleNotesPanel() {
        const panel = document.getElementById('notes-drawer');
        panel.classList.toggle('translate-x-full');
    }

    saveNote() {
        const text = document.getElementById('note-input').value.trim();
        if (!text) return;

        const newNote = {
            id: Date.now(),
            book: this.state.currentBook,
            chapter: this.state.currentChapter,
            text: text
        };

        this.state.user.notes.push(newNote);
        this.saveState();
        document.getElementById('note-input').value = '';
        this.renderNotes();

        Toastify({
            text: "Study note added successfully!",
            duration: 2000,
            backgroundColor: "#10b981"
        }).showToast();
    }

    renderNotes() {
        const list = document.getElementById('saved-notes-list');
        list.innerHTML = '';
        const currentNotes = this.state.user.notes.filter(n => n.book === this.state.currentBook && n.chapter === this.state.currentChapter);

        if (currentNotes.length === 0) {
            list.innerHTML = `<p class="text-xs text-slate-400 italic text-center">No saved notes for this chapter.</p>`;
            return;
        }

        currentNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = "p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 relative";
            card.innerHTML = `
                        <p class="text-slate-600 dark:text-slate-300 pr-6 leading-relaxed">${note.text}</p>
                        <button onclick="app.deleteNote(${note.id})" class="absolute top-2 right-2 text-rose-500 hover:text-rose-600">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    `;
            list.appendChild(card);
        });
    }

    deleteNote(noteId) {
        this.state.user.notes = this.state.user.notes.filter(n => n.id !== noteId);
        this.saveState();
        this.renderNotes();
    }

    /*
     * JAVA PLAYGROUND COMPILER/JVM EMULATOR
     */
    loadPlaygroundTemplate() {
        const select = document.getElementById('playground-template');
        const val = select.value;
        document.getElementById('playground-editor').value = TEMPLATE_CODES[val] || '';
    }

    resetPlaygroundCode() {
        this.loadPlaygroundTemplate();
        document.getElementById('playground-output').innerHTML = `<span class="text-slate-500">// Code editor reset. Ready for compilation.</span>`;
    }

    runPlaygroundCode() {
        const code = document.getElementById('playground-editor').value;
        const outputEl = document.getElementById('playground-output');
        outputEl.innerHTML = '';

        // Add nice starting compile log
        outputEl.innerHTML += `<span class="text-slate-400">Compiling Main.java...\n</span>`;
        outputEl.innerHTML += `<span class="text-slate-500">Executing inside simulated sandbox JVM...\n\n</span>`;

        // Perform regex parse-based compilation matching logic to make simulator feel alive
        setTimeout(() => {
            try {
                let matches = [];

                // Look for standard prints
                const printRegex = /System\.out\.println\((["'])(.*?)\1\s*\+?\s*(.*?)\)/g;
                const simplePrintRegex = /System\.out\.println\((["'])(.*?)\1\)/g;

                let executed = false;

                // Match simple static string print expressions
                let match;
                while ((match = simplePrintRegex.exec(code)) !== null) {
                    outputEl.innerHTML += `<span class="text-emerald-400">&gt; ${match[2]}</span><br>`;
                    executed = true;
                }

                // Check simple loops iteration matching
                if (code.includes('for') && code.includes('Count index')) {
                    for (let i = 0; i < 5; i++) {
                        outputEl.innerHTML += `<span class="text-emerald-400">&gt; Count index: ${i}</span><br>`;
                    }
                    executed = true;
                }

                // Check OOP instantiation matching
                if (code.includes('Dog') && code.includes('bark')) {
                    outputEl.innerHTML += `<span class="text-emerald-400">&gt; Buster says: Woof!</span><br>`;
                    executed = true;
                }

                if (!executed) {
                    // General fallback
                    outputEl.innerHTML += `<span class="text-amber-400">&gt; Java class compiled but produced no console-output streams. Make sure you invoke System.out.println() commands inside main methods.</span><br>`;
                }

            } catch (err) {
                outputEl.innerHTML += `<span class="text-rose-500">Compile Error: Syntax errors detected on token "Main". Failed to construct virtual JVM.</span><br>`;
            }
        }, 400);
    }

    /*
     * QUIZ ENGINE
     */
    startQuiz(type) {
        this.quizState.type = type;
        this.quizState.currentIndex = 0;
        this.quizState.score = 0;

        document.getElementById('quiz-options-grid').classList.add('hidden');
        document.getElementById('active-quiz-panel').classList.remove('hidden');

        this.renderQuizQuestion();
        this.startQuizTimer();
    }

    startQuizTimer() {
        clearInterval(this.quizState.timer);
        let time = this.quizState.timeLimit;
        const timerEl = document.getElementById('quiz-timer');

        this.quizState.timer = setInterval(() => {
            const mins = Math.floor(time / 60).toString().padStart(2, '0');
            const secs = (time % 60).toString().padStart(2, '0');
            timerEl.innerText = `${mins}:${secs}`;

            if (time <= 0) {
                clearInterval(this.quizState.timer);
                this.finishQuiz();
            }
            time--;
        }, 1000);
    }

    renderQuizQuestion() {
        const questions = QUIZZES_DATABASE[this.quizState.type];
        const q = questions[this.quizState.currentIndex];

        document.getElementById('quiz-question-index').innerText = `Question ${this.quizState.currentIndex + 1} of ${questions.length}`;
        document.getElementById('quiz-question-prompt').innerText = q.prompt;

        const container = document.getElementById('quiz-choices-container');
        container.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 text-sm font-medium transition-all flex items-center justify-between";
            btn.innerHTML = `
                        <span>${opt}</span>
                        <span class="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs"></span>
                    `;
            btn.onclick = () => {
                // Highlight selected choice
                container.querySelectorAll('button').forEach(b => {
                    b.classList.remove('border-brand-600', 'bg-brand-50', 'dark:bg-brand-950/20');
                    b.querySelector('span:last-child').innerHTML = '';
                });
                btn.classList.add('border-brand-600', 'bg-brand-50', 'dark:bg-brand-950/20');
                btn.querySelector('span:last-child').innerHTML = '&bull;';
                btn.dataset.selected = idx;
            };
            container.appendChild(btn);
        });
    }

    submitQuizAnswer() {
        const container = document.getElementById('quiz-choices-container');
        const selectedBtn = container.querySelector('button[data-selected]');

        if (!selectedBtn) {
            Toastify({
                text: "Please select an answer to progress.",
                duration: 3000,
                backgroundColor: "#f43f5e"
            }).showToast();
            return;
        }

        const selectedIdx = parseInt(selectedBtn.dataset.selected);
        const questions = QUIZZES_DATABASE[this.quizState.type];
        const q = questions[this.quizState.currentIndex];

        if (selectedIdx === q.correct) {
            this.quizState.score++;
        }

        this.quizState.currentIndex++;

        if (this.quizState.currentIndex < questions.length) {
            this.renderQuizQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        clearInterval(this.quizState.timer);
        document.getElementById('active-quiz-panel').classList.add('hidden');
        document.getElementById('quiz-options-grid').classList.remove('hidden');

        const percent = Math.round((this.quizState.score / QUIZZES_DATABASE[this.quizState.type].length) * 100);

        if (this.quizState.type === 'exam') {
            if (percent >= 80) {
                this.state.user.examPassed = true;
                this.state.user.xp += 150;
                this.state.user.coins += 100;

                // Add unique badge award if not exists
                if (!this.state.user.badges.includes('certified')) {
                    this.state.user.badges.push('certified');
                }

                this.saveState();

                // Fire awesome rewards confetti
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.5 }
                });

                SwiperAlert_Reward();
            } else {
                Swal.fire({
                    title: 'Exam Result',
                    text: `You scored ${percent}%. Minimum 80% required to qualify for certificate verification. Give it another review!`,
                    icon: 'error',
                    confirmButtonColor: '#3b82f6'
                });
            }
        } else {
            this.state.user.xp += 50;
            this.saveState();
            Swal.fire({
                title: 'Quiz Complete!',
                text: `You completed the syntax quiz with a score of ${percent}%. You earned +50 XP!`,
                icon: 'success',
                confirmButtonColor: '#3b82f6'
            });
        }
    }

    abortQuiz() {
        clearInterval(this.quizState.timer);
        document.getElementById('active-quiz-panel').classList.add('hidden');
        document.getElementById('quiz-options-grid').classList.remove('hidden');
    }

    /*
     * GAMIFICATION MECHANICS & ANALYTICS CHARTS
     */
    renderBadges() {
        const container = document.getElementById('badges-container');
        container.innerHTML = '';

        // Available structural badges
        const allBadges = {
            starter: { title: "Apprentice", icon: "fa-seedling", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
            certified: { title: "Certified", icon: "fa-medal", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
            expert: { title: "JVM Pro", icon: "fa-graduation-cap", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" }
        };

        // Add starter badge automatically if user exists
        if (this.state.user.name && !this.state.user.badges.includes('starter')) {
            this.state.user.badges.push('starter');
        }

        // Add expert badge if total XP > 250
        if (this.state.user.xp > 250 && !this.state.user.badges.includes('expert')) {
            this.state.user.badges.push('expert');
            this.saveState();
        }

        this.state.user.badges.forEach(bId => {
            const info = allBadges[bId];
            if (!info) return;

            const item = document.createElement('div');
            item.className = `p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 ${info.color}`;
            item.innerHTML = `
                        <i class="fa-solid ${info.icon} text-lg animate-pulse"></i>
                        <span class="text-[10px] font-extrabold tracking-wide uppercase">${info.title}</span>
                    `;
            container.appendChild(item);
        });
    }

    renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';

        const mockRankings = [
            { name: "Alex Mercer", coins: 820, xp: 950 },
            { name: "Sophia Lin", coins: 740, xp: 880 },
            { name: this.state.user.name, coins: this.state.user.coins, xp: this.state.user.xp, isUser: true },
            { name: "David K.", coins: 140, xp: 190 }
        ];

        // Sort rankings dynamically
        mockRankings.sort((a, b) => b.xp - a.xp);

        mockRankings.forEach((r, idx) => {
            const row = document.createElement('div');
            row.className = `flex justify-between items-center p-3.5 rounded-xl border transition-all ${r.isUser ? 'bg-brand-50/70 border-brand-200 dark:bg-brand-950/10 dark:border-brand-900' : 'bg-slate-50 border-slate-200/50 dark:bg-slate-900/40 dark:border-slate-800'}`;
            row.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <span class="text-xs font-bold text-slate-400">#${idx + 1}</span>
                            <span class="text-sm font-bold">${r.name}</span>
                        </div>
                        <div class="flex space-x-12 text-sm font-semibold">
                            <span class="text-amber-500">${r.coins}</span>
                            <span class="w-20 text-right text-brand-500">${r.xp} XP</span>
                        </div>
                    `;
            list.appendChild(row);
        });
    }

    drawProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');

        // Clear existing chart instance if exists
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textCol = isDark ? '#94a3b8' : '#64748b';
        const gridCol = isDark ? '#334155' : '#e2e8f0';

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'XP Gained',
                    data: [10, 30, 20, 80, 50, 100, this.state.user.xp % 100],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: gridCol },
                        ticks: { color: textCol }
                    },
                    y: {
                        grid: { color: gridCol },
                        ticks: { color: textCol }
                    }
                }
            }
        });
    }

    /*
     * DOWNLOAD & EXPORT UTILITIES (Print Web Window/Export CSS Engine)
     */
    downloadCertificate() {
        // Instantly open print layout specifically targeted to the certificate elements
        const certHtml = document.getElementById('certificate-rendering').outerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
                    <html>
                    <head>
                        <title>JavaForge - Certification Credential</title>
                        <script src="https://cdn.tailwindcss.com"><\/script>
                        <style>
                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body class="flex items-center justify-center min-h-screen bg-white">
                        ${certHtml}
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        <\/script>
                    </body>
                    </html>
                `);
        win.document.close();
    }

    shareCertificate() {
        Toastify({
            text: "Credential URL copied to clipboard!",
            duration: 3000,
            backgroundColor: "#10b981"
        }).showToast();
    }

    /*
     * AI ASSISTANT & CHATBOT FEATURES (GEMINI LLM INTEGRATION)
     */
    toggleAISidebar() {
        const sidebar = document.getElementById('ai-sidebar');
        sidebar.classList.toggle('translate-x-full');
    }

    quickAIQuery(queryText) {
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar.classList.contains('translate-x-full')) {
            sidebar.classList.remove('translate-x-full');
        }
        document.getElementById('ai-chat-input').value = queryText;
        this.sendAIChat();
    }

    async fetchGeminiResponse(prompt, systemInstruction = null) {
        const apiKey = ""; // Runtime automatically provisions key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
            payload.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        let attempt = 0;
        const maxAttempts = 3;
        let delay = 1000;

        while (attempt < maxAttempts) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Gemini service error: ${response.status}`);
                }

                const result = await response.json();
                const answer = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (answer) {
                    return answer;
                }
                throw new Error("No response body candidate found.");
            } catch (error) {
                attempt++;
                if (attempt >= maxAttempts) {
                    throw error;
                }
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            }
        }
    }

    formatMarkdown(rawText) {
        // Escape critical tags to lock layout
        let clean = rawText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Parse standard formatted Java code segments
        clean = clean.replace(/```(?:java|javascript|js|html|css)?\n([\s\S]*?)```/g, function (match, codeBody) {
            return `<pre class="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-400 my-3 overflow-x-auto select-text"><code>${codeBody.trim()}</code></pre>`;
        });

        // Parse inline codes
        clean = clean.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-xs font-mono text-rose-500 dark:text-rose-400 font-semibold">$1</code>');

        // Parse bold elements
        clean = clean.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Parse unordered structural bullet trees
        clean = clean.replace(/^[*\-]\s+(.+)$/gm, '<li class="list-disc ml-5 my-1 text-xs text-slate-600 dark:text-slate-300">$1</li>');

        // Split paragraphs nicely
        let segments = clean.split('\n\n');
        clean = segments.map(seg => {
            if (seg.trim().startsWith('<pre') || seg.trim().startsWith('<li')) return seg;
            return `<p class="mb-2 leading-relaxed text-slate-600 dark:text-slate-300 text-xs">${seg}</p>`;
        }).join('\n');

        return clean;
    }

    async sendAIChat() {
        const inputEl = document.getElementById('ai-chat-input');
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';

        const feed = document.getElementById('ai-chat-feed');

        // Append User bubble
        const userBubble = document.createElement('div');
        userBubble.className = "flex gap-2.5 justify-end";
        userBubble.innerHTML = `
                    <div class="bg-brand-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                        <p class="text-xs leading-relaxed select-text">${text}</p>
                    </div>
                `;
        feed.appendChild(userBubble);
        feed.scrollTop = feed.scrollHeight;

        // Append loading bubble
        const loadingBubble = document.createElement('div');
        loadingBubble.className = "flex gap-2.5 ai-loader-temp";
        loadingBubble.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs">
                        <i class="fa-solid fa-robot animate-spin"></i>
                    </div>
                    <div class="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl rounded-tl-none">
                        <p class="text-xs text-slate-400 italic">Thinking up a structured explanation...</p>
                    </div>
                `;
        feed.appendChild(loadingBubble);
        feed.scrollTop = feed.scrollHeight;

        try {
            const sysPrompt = "You are Forgey, an expert senior Java technical advisor and academic coach. Provide accurate, structured explanations with modern Java examples matching Java 17+ core standards. Keep outputs formatted with clean code sections.";
            const rawResponse = await this.fetchGeminiResponse(text, sysPrompt);

            // Remove loading indicator
            feed.removeChild(loadingBubble);

            // Render formatted AI response
            const aiBubble = document.createElement('div');
            aiBubble.className = "flex gap-2.5";
            aiBubble.innerHTML = `
                        <div class="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                        <div class="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] border border-slate-200/40 dark:border-slate-800">
                            ${this.formatMarkdown(rawResponse)}
                        </div>
                    `;
            feed.appendChild(aiBubble);
            feed.scrollTop = feed.scrollHeight;

        } catch (err) {
            feed.removeChild(loadingBubble);
            Toastify({
                text: "AI advisor request timed out. Please check connection and retry.",
                duration: 3000,
                backgroundColor: "#f43f5e"
            }).showToast();
        }
    }

    async askAITutor() {
        const book = MOCK_BOOKS_DATABASE[this.state.currentBook];
        const chapter = book.chapters[this.state.currentChapter];

        const x = `Can you explain the conceptual core ideas of the lesson "${chapter.title}" from the Java course "${book.title}"? Keep it beginner friendly, detail the execution logic, and provide a quick practical sample implementation.`;
        this.quickAIQuery(prompt);
    }

    async aiCoachReview() {
        const code = document.getElementById('playground-editor').value;
        if (!code.trim()) {
            Toastify({
                text: "Please supply standard Java playground code first before requesting analysis.",
                duration: 3000,
                backgroundColor: "#f43f5e"
            }).showToast();
            return;
        }

        // Alert console log
        const outputEl = document.getElementById('playground-output');
        outputEl.innerHTML += `<span class="text-indigo-400">\n[Forgey AI] Executing automated static code review...\n</span>`;
        outputEl.scrollTop = outputEl.scrollHeight;

        // Slide open panel
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar.classList.contains('translate-x-full')) {
            sidebar.classList.remove('translate-x-full');
        }

        // Send request
        const prompt = `Perform a quick review on this Java code block. Highlight security issues, compilation vulnerabilities, compliance parameters, performance enhancements, and give an optimized refactoring if applicable:\n\n\`\`\`java\n${code}\n\`\`\``;
        this.quickAIQuery(prompt);
    }

    /*
     * ADMINISTRATOR MANAGEMENT ACTIONS
     */
    addLesson(e) {
        e.preventDefault();
        const bookKey = document.getElementById('admin-target-book').value;
        const title = document.getElementById('admin-lesson-title').value.trim();
        const content = document.getElementById('admin-lesson-content').value.trim();

        if (!MOCK_BOOKS_DATABASE[bookKey]) return;

        MOCK_BOOKS_DATABASE[bookKey].chapters.push({
            title: title,
            content: `
                        <h2 class="text-2xl font-bold mb-4">${title}</h2>
                        <div class="prose dark:prose-invert">
                            ${content}
                        </div>
                    `
        });

        document.getElementById('admin-add-lesson-form').reset();
        this.renderLibrary();

        Swal.fire({
            title: 'Lesson Added!',
            text: 'The new syllabus course node has been dynamically registered.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
        });
    }
}

/*
 * HELPER DIALOG ANIMATIONS
 */
function SwiperAlert_Reward() {
    Swal.fire({
        title: '🎉 Course Exam Passed!',
        text: 'Phenomenal performance! You scored 100% and successfully qualified for structural credential certification!',
        icon: 'success',
        confirmButtonText: 'View Certificate',
        confirmButtonColor: '#a855f7'
    }).then(() => {
        app.navigateTo('certificates');
    });
}

// Initialize application on page load
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new JavaForgeApp();
    app.init();
});
