// --- Gemini API Setup ---
const apiKey = ""; // Set by environment
const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- Resume Data Context for AI ---
const resumeContext = {
    profile: "Manjima Jijo, AI Specialist & Data Analyst. Based in Winnipeg, MB.",
    summary: "Effective client liaison, strong leadership, project management, rapid adaptability. Collaborative team player.",
    skills: {
        languages: ["Python (Advanced)", "C", "C++", "HTML", "SQL"],
        libraries: ["OpenCV", "Pandas", "NumPy", "Scikit-Learn"],
        tools: ["Jupyter Notebook", "PyCharm", "VS Code", "MS Excel", "PowerPoint"],
        os: ["Windows", "Linux"]
    },
    education: [
        { degree: "Postgraduate Diploma in AI & ML", school: "Lambton College", year: "2022-2023" },
        { degree: "BSc Physics", school: "Nirmala College, India", year: "2018-2021" }
    ],
    experience: [
        { role: "Data Analyst Intern", company: "Eyecare Plus", desc: "Data accuracy, validation procedures, collaboration with tech teams." },
        { role: "Administrative Officer", company: "Scarborough Convention Center", desc: "Finance tracking, client reports, customer service." },
        { role: "IT Support Specialist", company: "Vinayaka Transports", desc: "System maintenance, user support, diagnostics." }
    ],
    projects: [
        { name: "AI Banking Chatbot", tech: "NLP, Python", details: "Understands natural language to resolve banking queries." },
        { name: "Fraud Detection", tech: "ML, Scikit-Learn", details: "Predictive model for real-time transaction analysis." },
        { name: "Accident Risk Score", tech: "Pandas, Data Analysis", details: "Predicting risks for safer traffic management." },
        { name: "Hand Gesture Recognition", tech: "OpenCV", details: "Touchless control interface." }
    ]
};

// --- API Helper Function ---
async function callGemini(prompt, systemInstruction = "") {
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini Error:", error);
        // Simple exponential backoff retry could go here, but for brevity we return null
        return null;
    }
}

// --- Chatbot Logic ---
let isChatOpen = false;

function toggleChat() {
    const window = document.getElementById('chat-window');
    if (isChatOpen) {
        window.classList.add('scale-95', 'opacity-0', 'hidden');
        window.classList.remove('scale-100', 'opacity-100', 'flex');
    } else {
        window.classList.remove('hidden');
        setTimeout(() => {
            window.classList.remove('scale-95', 'opacity-0');
            window.classList.add('scale-100', 'opacity-100', 'flex');
        }, 10);
    }
    isChatOpen = !isChatOpen;
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('send-btn');
    const messages = document.getElementById('chat-messages');
    const text = input.value.trim();

    if (!text) return;

    // User Message
    appendMessage('user', text);
    input.value = '';
    input.disabled = true;
    btn.disabled = true;

    // Loading Indicator
    const loadingId = appendLoading();
    messages.scrollTop = messages.scrollHeight;

    // Prepare Prompt
    const sysPrompt = `You are an enthusiastic AI assistant for Manjima Jijo's portfolio. 
    Here is her resume data in JSON: ${JSON.stringify(resumeContext)}.
    Answer questions briefly (under 50 words) and professionally. 
    If asked about something not in the resume, suggest contacting her directly.
    Use emojis occasionally.`;

    // Call API
    const reply = await callGemini(text, sysPrompt);
    
    // Remove Loading
    document.getElementById(loadingId).remove();
    
    // Bot Message
    if (reply) {
        appendMessage('bot', reply);
    } else {
        appendMessage('bot', "I'm having trouble connecting to my brain right now. Please try again later! 🧠");
    }

    input.disabled = false;
    btn.disabled = false;
    input.focus();
    messages.scrollTop = messages.scrollHeight;
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'flex items-end justify-end' : 'flex items-start';
    
    const bubbleColor = role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-100';
    const icon = role === 'user' ? '' : `
        <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mr-2">
            <i class="fas fa-robot text-slate-500 text-xs"></i>
        </div>`;

    div.innerHTML = `
        ${icon}
        <div class="${bubbleColor} p-3 rounded-2xl ${role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm text-sm max-w-[80%]">
            ${marked.parse(text)}
        </div>
    `;
    document.getElementById('chat-messages').appendChild(div);
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex items-start';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mr-2">
            <i class="fas fa-robot text-slate-500 text-xs"></i>
        </div>
        <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
            <div class="typing-indicator flex">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    document.getElementById('chat-messages').appendChild(div);
    return id;
}

// --- Job Fit Analyzer Logic ---
function openFitModal() {
    document.getElementById('fit-modal').classList.remove('hidden');
}

function closeFitModal() {
    document.getElementById('fit-modal').classList.add('hidden');
}

async function analyzeJobFit() {
    const jobDesc = document.getElementById('job-desc-input').value;
    const btn = document.getElementById('analyze-btn');
    const resultArea = document.getElementById('analysis-result');

    if (!jobDesc.trim()) return;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...';
    resultArea.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center">
            <div class="typing-indicator flex mb-4">
                <span></span><span></span><span></span>
            </div>
            <p class="text-sm text-slate-500">Gemini is reading the job description...</p>
        </div>
    `;

    const sysPrompt = `You are a career consultant. Compare Manjima's resume (${JSON.stringify(resumeContext)}) with the user's Job Description.
    Output format: Markdown.
    1. Match Score (0-100%)
    2. Top 3 Matching Skills (Bullet points)
    3. Brief Summary (Why she fits).
    4. Keep it encouraging but realistic.`;

    const analysis = await callGemini(jobDesc, sysPrompt);

    btn.disabled = false;
    btn.innerHTML = '<span>Analyze Match</span><i class="fas fa-bolt ml-2"></i>';

    if (analysis) {
        resultArea.innerHTML = `
            <div class="prose prose-sm prose-emerald">
                ${marked.parse(analysis)}
            </div>
            <div class="mt-6 pt-4 border-t border-slate-200 text-center">
                <a href="mailto:manjimamaryjijo2001@gmail.com" class="text-emerald-600 font-bold hover:underline">Schedule an Interview</a>
            </div>
        `;
    } else {
        resultArea.innerHTML = `<p class="text-red-500 text-center">Analysis failed. Please try again.</p>`;
    }
}

// --- Existing Portfolio Logic (Charts, etc.) ---
const skillsData = {
    labels: ['Data Analysis','Python', 'SQL', 'Machine Learning', 'C/C++', 'Communication'],
    data: [95, 90, 80, 80, 75, 90]
};

const experienceData = [
    {
        id: 1,
        role: "Administrative Assistant",
        company: "Keewatin Air L.P, Winnipeg",
        period: "September 2023 – Present",
        description: "Ensured accurate and reliable records through meticulous data entry, document verification, and regular cross-checking of information.",
        responsibilities: [
            "Ensure data quality by identifying and rectifying errors, inconsistencies, and missing information, and maintaining accurate datasets.",
            "Utilize tools like Tableau, PowerBI, or specialized healthcare analytics software to perform data analysis.",
            "Conduct regular audits and validation checks to ensure data accuracy, consistency, and integrity. "
        ],
        icon: "fas fa-chart-line"
    },
    
    {
        id: 3,
        role: "IT Support Specialist",
        company: "Vinayaka Transports, Muvattupuzha",
        period: "Nov 2021 – April 2022",
        description: "Provided technical support and system maintenance.",
        responsibilities: [
            "Consulting with users to resolve IT issues.",
            "Monitoring system, software, and hardware performance indicators.",
            "Updating computer software and creating process documentation.",
            "Conducting diagnostic tests and quick error correction."
        ],
        icon: "fas fa-desktop"
    },
    {
        id: 4,
        role: "IELTS Tutor",
        company: "Milwaukee Academy, India",
        period: "Aug 2021 – Oct 2021",
        description: "Educational role focused on language proficiency and student guidance.",
        responsibilities: [
            "Taught IELTS and Cambridge International modules.",
            "Provided supervision and guidance to students.",
            "Managed lesson plans and addressed academic needs."
        ],
        icon: "fas fa-chalkboard-teacher"
    }
];

const projectsData = [
    {
        title: "AI Banking Chatbot",
        category: "AI/ML",
        tech: "NLP, Python, AI",
        desc: "An intelligent chatbot designed to assist banking customers by understanding natural language queries, providing account information, and resolving common issues automatically.",
        icon: "fas fa-robot"
    },
    {
        title: "Online Payment Fraud Detection",
        category: "Security",
        tech: "Machine Learning, Python, Scikit-Learn",
        desc: "Developed a predictive model to identify fraudulent transactions in real-time, enhancing financial security by analyzing transaction patterns and anomalies.",
        icon: "fas fa-shield-alt"
    },
    {
        title: "Accident Risk Score Prediction",
        category: "AI/ML",
        tech: "Data Analysis, Python, Pandas",
        desc: "A data-driven project predicting accident risks based on various factors, aiding in the development of safer traffic management strategies.",
        icon: "fas fa-car-crash"
    },
    {
        title: "Hand Gesture Recognition",
        category: "CV",
        tech: "OpenCV, Python, Computer Vision",
        desc: "Implemented a computer vision system using OpenCV to recognize and interpret hand gestures, enabling touchless control interfaces.",
        icon: "fas fa-hand-paper"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    renderTimeline();
    renderProjects('all');
    setupMobileMenu();
    setupProjectFilters();
});

function initChart() {
    const ctx = document.getElementById('skillsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: skillsData.labels,
            datasets: [{
                label: 'Proficiency Level (%)',
                data: skillsData.data,
                backgroundColor: 'rgba(16, 185, 129, 0.6)', 
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, max: 100, grid: { display: false } },
                y: { grid: { display: false }, ticks: { font: { family: 'Inter' } } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderTimeline() {
    const navContainer = document.getElementById('timeline-nav');
    const detailContainer = document.getElementById('experience-detail');
    navContainer.innerHTML = '';
    
    experienceData.forEach((item, index) => {
        const isActive = index === 0;
        const navItem = document.createElement('div');
        navItem.className = `flex items-center cursor-pointer group`;
        navItem.onclick = () => selectExperience(index);
        navItem.innerHTML = `
            <div class="timeline-point w-4 h-4 rounded-full border-2 border-white shadow-sm mr-4 z-10 ${isActive ? 'bg-emerald-600 active' : 'bg-slate-300 group-hover:bg-emerald-400'}" id="point-${index}"></div>
            <div class="flex-1">
                <h4 class="text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-slate-600'}" id="title-${index}">${item.role}</h4>
                <span class="text-xs text-slate-400">${item.period}</span>
            </div>
        `;
        navContainer.appendChild(navItem);
    });
    selectExperience(0);
}

function selectExperience(index) {
    const item = experienceData[index];
    const detailContainer = document.getElementById('experience-detail');
    experienceData.forEach((_, i) => {
        const point = document.getElementById(`point-${i}`);
        const title = document.getElementById(`title-${i}`);
        if (i === index) {
            point.classList.add('bg-emerald-600', 'active');
            point.classList.remove('bg-slate-300');
            title.classList.add('text-emerald-700');
            title.classList.remove('text-slate-600');
        } else {
            point.classList.remove('bg-emerald-600', 'active');
            point.classList.add('bg-slate-300');
            title.classList.remove('text-emerald-700');
            title.classList.add('text-slate-600');
        }
    });
    detailContainer.style.opacity = '0';
    setTimeout(() => {
        detailContainer.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-slate-800">${item.role}</h3>
                    <div class="text-emerald-600 font-medium mb-2">${item.company}</div>
                    <div class="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-mono">${item.period}</div>
                </div>
                <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl shadow-inner">
                    <a href="prop.html"> <i class="${item.icon}"> </i> </a>
                    
                </div>
            </div>
            <p class="text-slate-600 italic mb-6 border-l-4 border-slate-200 pl-4">"${item.description}"</p>
            <h4 class="font-bold text-slate-800 mb-3">Key Responsibilities:</h4>
            <ul class="space-y-2">
                ${item.responsibilities.map(resp => `
                    <li class="flex items-start">
                        <i class="fas fa-check text-emerald-500 mt-1.5 mr-3 text-xs"></i>
                        <span class="text-slate-600 text-sm leading-relaxed">${resp}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        detailContainer.style.opacity = '1';
    }, 300);
}

function renderProjects(filter) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    const filtered = filter === 'all' 
        ? projectsData 
        : projectsData.filter(p => p.category.includes(filter) || p.tech.includes(filter));
    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col h-full';
        card.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600 mr-4 border border-slate-100">
                    <i class="${project.icon}"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-800">${project.title}</h3>
                    <span class="text-xs text-slate-400 uppercase tracking-wide font-semibold">${project.category}</span>
                </div>
            </div>
            <p class="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">${project.desc}</p>
            <div class="mt-auto pt-4 border-t border-slate-200">
                <div class="text-xs font-mono text-emerald-600"><i class="fas fa-code mr-2"></i>${project.tech}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white');
                b.classList.add('bg-slate-100', 'text-slate-600');
            });
            e.target.classList.remove('bg-slate-100', 'text-slate-600');
            e.target.classList.add('bg-emerald-600', 'text-white');
            renderProjects(e.target.dataset.filter);
        });
    });
}

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    btn.addEventListener('click', () => { menu.classList.toggle('hidden'); });
    menu.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { menu.classList.add('hidden'); }); });
}


