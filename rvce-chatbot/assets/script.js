/* RVCE Chatbot v3 — Smart Engine with Content Moderation */
function startRVCEChatbot() {
'use strict';

let tone = 'funny';
let chatOpen = false;

/* =============== CONTENT MODERATION =============== */
const BLOCKED = {
    abusive: [
        'fuck','shit','ass','bitch','bastard','damn','dick','pussy','slut','whore',
        'stupid','idiot','dumb','moron','retard','crap','screw you','shut up','suck',
        'hate you','loser','trash','worthless','ugly','go to hell','kill','murder',
        'rape','abuse','harass','molest','stalk','threat','bomb','attack','terror',
        'drug','weed','cocaine','heroin','alcohol','drunk','smoke','gambling','porn',
        'sex','nude','naked','obscene','vulgar','profanity','racist','sexist','bigot',
        'ass hole','wtf','stfu','lmao','lmfao','bloody','madarchod','behenchod',
        'chutiya','bc','mc','gaand','saala','kamina','haramkhor','bewakoof','gadha','hack'
    ],
    conspiracy: [
        'illuminati','flat earth','reptilian','chemtrail','5g cause','qanon','deep state',
        'new world order','fake moon','area 51','aliens control','government mind control',
        'covid fake','vaccine microchip','bill gates chip','controlled demolition',
        'pizza gate','fake news media','rigged election','brainwash','propaganda',
        'freemason','secret society','population control','depopulation','mk ultra','political affiliation'
    ],
    private: [
        'student phone number','personal number','private email','home address',
        'student address','teacher address','salary of','faculty salary',
        'personal data','student marks','result of','cgpa of','gpa of',
        'marks of','percentage of','private detail','confidential','password',
        'bank detail','account number','aadhaar','pan card','dob of','date of birth of',
        'caste of','religion of','family of','father of','mother of','girlfriend',
        'boyfriend','relationship','married','wife of','husband of','someone\'s phone',
        'whatsapp number','instagram id','social media of','facebook of'
    ]
};

const SESSION = {
    lastIntent: null,
    history: [],
    navStack: [] // For back-navigation in nested flows
};

const PREFIXES = [
    "Sure thing!", "I can help with that!", "Got it!", "Great question.",
    "Here's what I found:", "Looking into that...", "Certainly!", "Happy to help."
];

function getPrefix() {
    return PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + " ";
}

function checkModeration(input) {
    const lower = input.toLowerCase();
    
    // Helper to check for blocked pattern with word boundaries
    const isBlocked = (list) => {
        for (const word of list) {
            // Escape special chars and use word boundary (?:^|\s) and (?=\s|$) for broad match
            // or use \b if we want strict letter boundaries. 
            // Given "c.s.e" type sanitization, \b is generally safe for letters/numbers.
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('(?:^|\\s)' + escaped + '(?=\\s|$|[?!.])', 'i');
            if (regex.test(lower)) return true;
        }
        return false;
    };

    if (isBlocked(BLOCKED.abusive)) return { blocked: true, type: 'abusive' };
    if (isBlocked(BLOCKED.conspiracy)) return { blocked: true, type: 'conspiracy' };
    if (isBlocked(BLOCKED.private)) return { blocked: true, type: 'private' };
    
    return { blocked: false };
}

function getModerationResponse(type) {
    const responses = {
        abusive: {
            funny: "Whoa there! 🚫 Let's keep it friendly, shall we? I'm here to help with RVCE stuff, not to trade insults! 😅",
            pro: "⚠️ I'm unable to respond to inappropriate or offensive language. Please keep our conversation respectful. I'm here to help you with genuine RVCE queries."
        },
        conspiracy: {
            funny: "Nice try! 🛸 But I only deal in verified RVCE facts, not conspiracy theories! Let's stick to something I can actually help with 😄",
            pro: "⚠️ I'm designed to provide factual information about RVCE only. I cannot engage with conspiracy theories or unverified claims. Please ask me about admissions, placements, or campus facilities."
        },
        private: {
            funny: "Sorry, that's classified! 🔒 I can't share anyone's private information. I'm a college chatbot, not a spy! 🕵️",
            pro: "⚠️ I cannot share personal or confidential information about students, faculty, or staff. This includes contact details, marks, or personal data. I can help with general college information instead."
        }
    };
    return responses[type][tone === 'funny' ? 'funny' : 'pro'];
}

/* =============== KNOWLEDGE BASE =============== */
const KB = {
    general: {
        name: "RV College of Engineering (RVCE)", est: "1963",
        campus: "16.85 acres on Mysuru Road, Bengaluru – 560 059",
        trust: "Rashtreeya Sikshana Samithi Trust (RSST)",
        status: "Autonomous (UG), Affiliated to VTU",
        accreditation: "NAAC A+ Grade (CGPA 3.39/4.0, valid 2024–2029), NBA Accredited (multiple UG & PG programs)",
        ranking: "NIRF 101-150 band (Engineering, 2025), #1 Private Engineering College in IIRF 2025",
        principal: "Dr. K.N. Subramanya",
        timings: "Mon-Fri: 9:00 AM – 4:45 PM, Sat: 9:00 AM – 1:00 PM",
        vision: "Leadership in quality technical education, interdisciplinary research & innovation, with focus on sustainable and inclusive technology.",
        intake: "2000+ students annually across UG and PG",
        research: "100+ Patents, ₹30+ Crores in grants, 20 Centres of Excellence, 15 VTU-recognized Research Centres",
        researchDomains: "AI, Quantum Tech, 5G, Electric Vehicles, Hydrogen Technology, IC Design",
        coes: [
            "Macroelectronics (CME)", "Macroelectronics (CME) - Thin Film Lab",
            "Internet of Things (IoT)", "Smart Antenna Systems (CSAS)",
            "Visual Computing", "Excellence in Materials & Manufacturing",
            "Robotics & Cognitive Systems", "Automotive Mechatronics (Mercedes Benz)",
            "Computational Genomics", "Quantum Computing (Q-RVCE)",
            "Cloud Computing & Big Data (HP)", "Advanced Manufacturing",
            "Smart Grid Technology", "Embedded Systems",
            "Data Science & AI", "IC Design & VLSI",
            "Electric Vehicle Technology", "Hydrogen & Fuel Cell Technology",
            "5G & Communication Systems", "Cyber Security"
        ],
        cocs: [
            "Bosch Rexroth - Automation Tech", "Toyota - Automotive Tech",
            "Cisco - Networking", "HP - Cloud Computing"
        ],
        industryPartners: ["Google", "Microsoft", "Toyota", "Mercedes Benz", "Cisco", "IBM", "Intel", "Honeywell", "Bosch", "Amazon", "Adobe", "Samsung"]
    },
    contact: {
        address: "RV College of Engineering, RV Vidyanikethan Post, Mysuru Road, Bengaluru – 560 059",
        phone: "+91-080-68188112 / 8111", admissionPhone: "080-68188147/48/49",
        email: "principal@rvce.edu.in", placementPhone: "9886130504",
        website: "https://rvce.edu.in/"
    },
    rvei: {
        history: "Founded in 1940 by Sri M. C. Shivananda Sarma and Sri Meda Kasturi Ranga Setty.",
        institutions: "Manages over 25 institutions including RV College of Engineering, RV University, NMKRV College, DAPM RV Dental College, and RV Institute of Management.",
        motto: "Excellence in Education with Societal Commitment."
    },
    placements: {
        companies: "260+ companies participated in the 2025 campus drive", avgSalary: "~₹15-17 LPA (2025 B.E. Avg)",
        maxSalary: "₹67 LPA Highest Package (2025 B.E. Batch)", recruiters: "Microsoft, Google, Amazon, Atlassian, Cisco, Dell, Intel, Adobe, Flipkart, Samsung, PayPal, IBM, Deloitte, JP Morgan, Goldman Sachs, Bosch, Mercedes-Benz",
        scholarships: "₹72+ Lakhs awarded to ~110 students annually from ABB, Boeing, CTS",
        infra: "800+ systems, seminar halls, 6 interview rooms, 2 GD rooms",
        offers: "800+ offers to B.E./B.Tech students (2025 Batch)",
        url: "https://rvce.edu.in/placement_and_training/",
        prev2024: { maxSalary: "₹92 LPA", companies: "249", offers: "917 offers, 75% rate" }
    },
    admissions: {
        ug: { eligibility: "12th/2nd PUC with min 45% in Physics + Maths + Chemistry/Biotech/Biology/CS/Electronics (40% for SC/ST/OBC Karnataka)", exams: "KCET (KEA), COMED-K, Management Quota. JEE Mains is NOT considered.", quotas: "Also available: CIWG/PIO/OCI/Nepal Citizens quota" },
        pg: { eligibility: "B.E./B.Tech with min 50% marks (45% for SC/ST/OBC Karnataka)", exams: "Valid GATE or PGCET score" },
        mca: { eligibility: "Bachelor's degree with min 50% marks (45% for SC/ST/OBC Karnataka)" },
        phd: { info: "Doctoral programs in all departments via entrance test + interview. 15 VTU-recognized Research Centres." },
        fees: "Management Quota B.E. fees range from ~₹16 Lakhs to ~₹70 Lakhs total over 4 years (e.g., CSE highest at ~₹70L, Core branches ~₹16L-₹24L). M.Tech/MCA ranges from ₹2L to ₹16L.",
        cutoffs: "Official KCET cutoffs are released by KEA (e.g., ISE cutoff was ~832 in 2023).",
        url: "https://rvce.edu.in/admissions/"
    },
    departments: {
        ug: [
            {
                n:"Aerospace Engineering (AE)",
                c:"ae", 
                u:"https://rvce.edu.in/department/ae/main_dept/", 
                hod:"Dr. Supreeth R",
                info: "Welcome to the Department of Aerospace Engineering. Established in 2015, the Department has evolved into one of the country’s most prestigious destinations for undergraduate Aerospace Programmes.",
                about: "https://rvce.edu.in/department/ae/about_dept/",
                syllabus: "https://rvce.edu.in/department/ae/b_e_ase/",
                faculty: "https://rvce.edu.in/department/ae/faculty/",
                placement: "https://rvce.edu.in/department/ae/placement/",
                labs: "https://rvce.edu.in/department/ae/laboratories/"
            },
            {
                n:"AI & Machine Learning (AIML)",
                c:"aiml", 
                u:"https://rvce.edu.in/department/ai_ml/main_department/", 
                hod:"Dr. Sathish Babu B",
                hod_bio: "Dr. Sathish Babu B leads the AI & ML department at RVCE. He has extensive expertise in Artificial Intelligence and High-Performance Computing, guiding the department toward cutting-edge innovation.",
                hod_photo: "https://rvce.edu.in/department/wp-content/uploads/2025/11/B-SATHISH-BABU-HOD-scaled.jpg",
                info: "Established in 2021, the programme builds a strong foundation in computer science engineering with focused training in Artificial Intelligence, Machine Learning, Deep Learning, and Data Science.",
                about: "https://rvce.edu.in/department/ai_ml/about_the_department/",
                syllabus: "https://rvce.edu.in/department/ai_ml/be_al_ml/#scheme",
                faculty: "https://rvce.edu.in/department/ai_ml/faculty/",
                placement: "https://rvce.edu.in/department/ai_ml/placement/",
                labs: "https://rvce.edu.in/department/ai_ml/laboratories/"
            },
            {
                n:"Biotechnology (BT)",
                c:"bt", 
                u:"https://rvce.edu.in/department/biotechnology/department_of_biotechnology/", 
                hod:"Dr. Nagashree N Rao",
                info: "At the crossroads of science and innovation, the Department of Biotechnology (est. 2002) blends theoretical knowledge with practical experience, offering B.E., M.Tech., and Ph.D. programmes with advanced research facilities.",
                about: "https://rvce.edu.in/department/biotechnology/about_the_department/",
                syllabus: "https://rvce.edu.in/department/biotechnology/b_e_in_biotechnology/",
                placement: "https://rvce.edu.in/department/biotechnology/placement/",
                labs: "https://rvce.edu.in/department/biotechnology/laboratories/"
            },
            {
                n:"Chemical Engineering (CH)",
                c:"ch", 
                u:"https://rvce.edu.in/department/chemical_engineering/main_dept/", 
                hod:"Dr. Jagadish H Patil",
                info: "Established in 1982, the Department of Chemical Engineering is a leader in academic and research excellence, holding a 6-year NBA accreditation. It offers B.E., M.Sc. (Engg) by Research, and Ph.D. programmes.",
                about: "https://rvce.edu.in/department/chemical_engineering/about_dept/",
                syllabus: "https://rvce.edu.in/department/chemical_engineering/academic_planning/",
                faculty: "http://rvce.edu.in/department/chemical_engineering/faculty/",
                placement: "https://rvce.edu.in/department/chemical_engineering/placement/",
                labs: "https://rvce.edu.in/department/chemical_engineering/laboratories/"
            },
            {
                n:"Chemistry (CHY)",
                c:"chy", 
                u:"https://rvce.edu.in/department/chemistry/department_of_chemistry/", 
                hod:"HOD, Department of Chemistry",
                info: "Established in 1963, the Department of Chemistry provides foundational knowledge to all first-year engineering students and offers global electives. It is a recognized VTU research centre.",
                about: "https://rvce.edu.in/department/chemistry/about_the_department/",
                syllabus: "https://rvce.edu.in/department/chemistry/academic_planning/",
                faculty: "https://rvce.edu.in/department/chemistry/faculty/",
                labs: "https://rvce.edu.in/department/chemistry/laboratories/"
            },
            {
                n:"Civil Engineering (CV)",
                c:"cv", 
                u:"https://rvce.edu.in/department/civil_engineering/department-of-civil-engineering/", 
                hod:"Dr. Anjaneyappa",
                info: "Established in 1963, the department offers NBA-accredited B.E. in Civil Engineering and M.Tech in Structural Engineering & Highway Technology. It is a recognized VTU research centre.",
                about: "https://rvce.edu.in/department/civil_engineering/about-the-department/",
                syllabus: "https://rvce.edu.in/department/civil_engineering/academic-planning/",
                faculty: "https://rvce.edu.in/department/civil_engineering/faculty/",
                placement: "https://rvce.edu.in/department/civil_engineering/placement/",
                labs: "https://rvce.edu.in/department/civil_engineering/civil-laboratories/"
            },
            {
                n:"Computer Science & Engg (CSE)",
                c:"cs", 
                u:"https://rvce.edu.in/department/cse/cse_main/", 
                hod:"Dr. Shanta Rangaswamy",
                hod_bio: "Dr. Shanta Rangaswamy has 30+ years of experience in teaching and research. Her areas of interest include Computer Networks, Network Security, and Wireless Networks. She has published numerous papers in international journals.",
                hod_photo: "https://rvce.edu.in/department/wp-content/uploads/2025/06/SHANTA-RANGASWAMY-1.png",
                info: "Established in 1984, the department offers B.E. in Computer Science with specialisations in Data Science, Cyber Security, and AI/ML. It has strong industry partnerships with IBM, CISCO, and Infosys.",
                about: "https://rvce.edu.in/department/cse/about_the_department/",
                syllabus: "https://rvce.edu.in/department/cse/b_e_cse/",
                faculty: "https://rvce.edu.in/department/cse/faculty/",
                placement: "https://rvce.edu.in/department/cse/placement/",
                labs: "https://rvce.edu.in/department/cse/laboratories/"
            },
            {
                n:"CSE (AI & ML) (CSAIML)",
                c:"csaiml", 
                u:"https://rvce.edu.in/department/cse/cse_main/", 
                hod:"Dr. Shanta Rangaswamy (Under CSE Dept)",
                info: "A specialized B.E. track under the CSE department focusing on Artificial Intelligence and Machine Learning.",
                about: "https://rvce.edu.in/department/cse/about_the_department/",
                syllabus: "https://rvce.edu.in/department/cse/academic_planning/",
                faculty: "https://rvce.edu.in/department/cse/faculty/",
                placement: "https://rvce.edu.in/department/cse/placement/",
                labs: "https://rvce.edu.in/department/cse/laboratories/"
            },
            {
                n:"CSE (Cyber Security) (CSCY)",
                c:"cscy", 
                u:"https://rvce.edu.in/department/cse/cse_main/", 
                hod:"Dr. Shanta Rangaswamy (Under CSE Dept)",
                info: "A specialized B.E. track under the CSE department focusing on Cyber Security and defensive computing.",
                about: "https://rvce.edu.in/department/cse/about_the_department/",
                syllabus: "https://rvce.edu.in/department/cse/b_e_cse_cy/",
                faculty: "https://rvce.edu.in/department/cse/faculty/",
                placement: "https://rvce.edu.in/department/cse/placement/",
                labs: "https://rvce.edu.in/department/cse/laboratories/"
            },
            {
                n:"CSE (Data Science) (CSDS)",
                c:"csds", 
                u:"https://rvce.edu.in/department/cse/cse_main/", 
                hod:"Dr. Shanta Rangaswamy (Under CSE Dept)",
                info: "A specialized B.E. track under the CSE department focusing on Data Science, Big Data, and Analytics.",
                about: "https://rvce.edu.in/department/cse/about_the_department/",
                syllabus: "https://rvce.edu.in/department/cse/b_e_cse_2/",
                faculty: "https://rvce.edu.in/department/cse/faculty/",
                placement: "https://rvce.edu.in/department/cse/placement/",
                labs: "https://rvce.edu.in/department/cse/laboratories/"
            },
            {
                n:"Electrical & Electronics (EEE)",
                c:"ee", 
                u:"https://rvce.edu.in/department/eee/main_department/", 
                hod:"Dr. J N Hemalatha",
                info: "Offers B.E. in Electrical & Electronics and M.Tech in Power Electronics, supported by industry collaborations with BESCOM, BPCL, Log9, and ARCADIS.",
                about: "https://rvce.edu.in/department/eee/about_the_department/",
                syllabus: "https://rvce.edu.in/department/eee/academic_planning/",
                faculty: "https://rvce.edu.in/department/eee/faculty/",
                placement: "https://rvce.edu.in/department/eee/placement/",
                labs: "https://rvce.edu.in/department/eee/laboratories/"
            },
            {
                n:"Electronics & Communication (ECE)",
                c:"ec", 
                u:"https://rvce.edu.in/department/ece/department_of_electronics_and_communication/", 
                hod:"Dr. Ravish Aradhya H V",
                hod_bio: "Dr. Ravish Aradhya H V specializes in Electronics and Communication Engineering. He oversees the department's NBA-accredited curriculum and numerous Centres of Excellence.",
                hod_photo: "https://rvce.edu.in/department/wp-content/uploads/2025/07/HoD-2-e1758888064364.png",
                info: "Established in 1972, the department offers state-of-the-art degrees with a 6-year NBA accreditation (2022-2028) and hosts multiple Centres of Excellence.",
                about: "https://rvce.edu.in/department/ece/about_department/",
                syllabus: "https://rvce.edu.in/department/ece/academic_planning/",
                faculty: "https://rvce.edu.in/department/ece/faculty/",
                placement: "https://rvce.edu.in/department/ece/placement/",
                labs: "https://rvce.edu.in/department/ece/laboratories/"
            },
            {
                n:"Electronics & Instrumentation (EIE)",
                c:"ei", 
                u:"https://rvce.edu.in/department/eim/main_dept/", 
                hod:"Dr. Kendaganna Swamy S",
                info: "Established in 1981, the department offers an NBA-accredited curriculum that is regularly updated to meet industry demands, featuring modern laboratories for hands-on learning and innovation.",
                about: "https://rvce.edu.in/department/eim/about_dept/",
                syllabus: "https://rvce.edu.in/department/eim/academic_planning/",
                faculty: "https://rvce.edu.in/department/eim/faculty/",
                labs: "https://rvce.edu.in/department/eim/rd/"
            },
            {
                n:"Electronics & Telecom (ETE)",
                c:"et", 
                u:"https://rvce.edu.in/department/etc/main_department/", 
                hod:"Dr. Nagamani K",
                info: "Established in 1992, the department offers a comprehensive educational experience emphasizing hands-on design in hardware, software, embedded systems, networks, and protocols.",
                about: "https://rvce.edu.in/department/etc/about_the_department/",
                syllabus: "https://rvce.edu.in/department/etc/academic_planning/",
                faculty: "http://rvce.edu.in/department/etc/faculty/",
                placement: "https://rvce.edu.in/department/etc/placement/",
                labs: "https://rvce.edu.in/department/etc/laboratories/"
            },
            {
                n:"Industrial Engg & Mgmt (IEM)",
                c:"im", 
                u:"https://rvce.edu.in/department/iem/b_e_industrial_engineering_and_management/", 
                hod:"Dr. N S Narahari",
                info: "Established in 1980, the department integrates engineering and management to align with industry needs. It offers an NBA-accredited B.E. programme and maintains close associations with professional societies like IIIE, ORSI, and IIMM.",
                about: "https://rvce.edu.in/department/iem/about_the_department/",
                syllabus: "https://rvce.edu.in/department/iem/acadamic_planning/",
                faculty: "https://rvce.edu.in/department/iem/faculty/",
                placement: "https://rvce.edu.in/department/iem/placement/",
                labs: "https://rvce.edu.in/department/iem/laboratories/"
            },
            {
                n:"Information Science & Engg (ISE)",
                c:"is", 
                u:"https://rvce.edu.in/department/ise/b_e_ise/", 
                hod:"Dr. Mamatha G S",
                hod_bio: "Dr. Mamatha G S is an expert in Information Science and Engineering with a focus on IoT and Cloud Computing. She leads the department's industry collaborations and research initiatives.",
                hod_photo: "https://rvce.edu.in/department/wp-content/uploads/2025/07/MAMATHA-G-S-ISE-HOD-scaled.jpg",
                info: "Offers a dynamic curriculum focused on AI, IoT, Cloud Computing and Cybersecurity. Supported by a VTU-recognised research centre and partnerships with Microsoft, Nvidia and HP.",
                about: "https://rvce.edu.in/department/ise/about_dept/",
                syllabus: "https://rvce.edu.in/department/ise/academic_planning/",
                faculty: "https://rvce.edu.in/department/ise/faculty/",
                placement: "https://rvce.edu.in/department/ise/placement/",
                labs: "https://rvce.edu.in/department/ise/facilities/"
            },
            {
                n:"Mathematics (MATHS)",
                c:"mat", 
                u:"https://rvce.edu.in/department/maths/main_dept/", 
                hod:"Dr. Jayalatha G",
                info: "Established in 1963, one of the oldest departments at RVCE. It provides high-quality education and features a dedicated team of 24 faculty members with research spanning Pure Mathematics, Applied Mathematics, and Quantum Computing.",
                about: "https://rvce.edu.in/department/maths/about_dept/",
                syllabus: "https://rvce.edu.in/department/maths/academic_planning/",
                faculty: "https://rvce.edu.in/department/maths/main_dept/",
                labs: "https://rvce.edu.in/department/maths/facilities/"
            },
            {
                n:"Mechanical Engineering (ME)",
                c:"me", 
                u:"https://rvce.edu.in/department/me/b_e_mechanical/", 
                hod:"Dr. Shanmukha N",
                hod_bio: "Dr. Shanmukha N is a veteran in Mechanical Engineering and also serves as the Dean Academics. He is dedicated to fostering innovation and excellence in core engineering research.",
                hod_photo: "https://rvce.edu.in/department/wp-content/uploads/2025/11/SHANMUKHA-N-scaled.jpg",
                info: "Dedicated to fostering innovation and excellence in Mechanical Engineering. Offers premier education and cultivates cutting-edge research in Design, Materials, Thermal and Manufacturing, strengthened by robust industry collaborations.",
                about: "https://rvce.edu.in/department/me/about_the_department/",
                syllabus: "https://rvce.edu.in/department/me/academic_planning/",
                faculty: "https://rvce.edu.in/department/me/faculty/",
                labs: "https://rvce.edu.in/department/me/laboratories/"
            },
            {
                n:"Physics (PHY)",
                c:"phy", 
                u:"https://rvce.edu.in/department/physics/department_of_physics/", 
                hod:"Dr. G Shireesha",
                info: "Established in 1963, it offers Engineering Physics courses and global electives. Known for its research, discipline, and academic rigour, it features 13 doctorate-qualified faculty and advanced research facilities.",
                about: "https://rvce.edu.in/department/physics/about_the_department/",
                syllabus: "https://rvce.edu.in/department/physics/academic_planning/",
                faculty: "https://rvce.edu.in/department/physics/faculty/",
                labs: "https://rvce.edu.in/department/physics/laboratories/"
            }
        ],
        pg: [
            {n:"M.Tech Biotechnology",c:"bt", u:"https://rvce.edu.in/department/biotechnology/department-of-biotechnology/"},
            {n:"M.Tech Structural Engg",c:"cv_se", u:"https://rvce.edu.in/department/civil_engineering/m_tech_structural_engineering/"},
            {n:"M.Tech Highway Tech",c:"cv_ht", u:"https://rvce.edu.in/department/civil_engineering/m-tech-highway-technology/"},
            {n:"M.Tech CSE",c:"cs_cse", u:"https://rvce.edu.in/department/cse/m-tech-cse/"},
            {n:"M.Tech Computer Network Engg",c:"cs_cne", u:"https://rvce.edu.in/department/cse/m-tech-cne/"},
            {n:"M.Tech Power Electronics",c:"ee_pe", u:"https://rvce.edu.in/department/eee/mtech_in_power_electronics/"},
            {n:"M.Tech VLSI & Embedded",c:"ec_vlsi", u:"https://rvce.edu.in/department/ece/m-tech-in-vlsi-design-embedded-systems/"},
            {n:"M.Tech Comm Systems",c:"ec_cs", u:"https://rvce.edu.in/department/ece/master-of-technology-in-m-tech-communication-systems/"},
            {n:"M.Tech Software Engg",c:"is_se", u:"https://rvce.edu.in/department/ise/ise-mtech-in-software-engineering/"},
            {n:"M.Tech Info Tech",c:"is_it", u:"https://rvce.edu.in/department/ise/ise_mtech_in_information_technology/"},
            {n:"M.Tech Product Design",c:"me_pd", u:"https://rvce.edu.in/department/me/mtech-in-product-design-and-manufacturing/"},
            {n:"M.Tech Machine Design",c:"me_md", u:"https://rvce.edu.in/department/me/mtech-in-machine-design/"},
            {n:"M.Tech Digital Comm",c:"et_dc", u:"https://rvce.edu.in/department/etc/mtech_in_digital_communication_engineering/"},
            {
                n:"Master of Computer Applications (MCA)",
                c:"mca", 
                u:"https://rvce.edu.in/department/mca/main_department/", 
                hod:"Dr. Jasmine K S",
                info: "Established in 1997, it offers MCA (Intake: 120), M.Sc. by Research, and Ph.D. The programme holds 4 NBA accreditations and boasts consistent 100% placement opportunities with a 96% internship conversion rate.",
                about: "https://rvce.edu.in/department/mca/about_the_department/",
                syllabus: "https://rvce.edu.in/department/mca/academic_planning/",
                faculty: "https://rvce.edu.in/department/mca/main_department/",
                placement: "https://rvce.edu.in/department/mca/placement/",
                labs: "https://rvce.edu.in/department/mca/laboratories/"
            }
        ]
    },
    hostels: {
        boys: "Chamundi, Cauvery, Sir MV, Krishna blocks",
        girls: "Diamond Jubilee, Krishna Garden blocks",
        amenities: "Vegetarian mess, Wi-Fi, laundry, 24/7 security",
        note: "Allotted during admission — no advance booking",
        url: "https://rvce.edu.in/facilities/"
    },
    facilities: {
        list: ["Central Library","Food Court","Sports Complex (400m track, Cricket/Football)","Health Centre","ICICI Bank","Post Office","Gymnatorium","Labs & Workshops"],
        url: "https://rvce.edu.in/facilities/"
    },
    placements2025: {
        maxSalary: "₹67 LPA Highest Package (2025 Batch, B.E.)",
        mtechMax: "₹35 LPA (M.Tech highest)",
        mcaMax: "₹20 LPA (MCA highest)",
        avgSalary: "~₹15-17 LPA (2025 B.E. Avg)",
        companies: "260+ companies participated in 2025 drive",
        offers: "800+ offers to B.E./B.Tech students",
        topRecruiters: "Microsoft, Google, Amazon, Atlassian, Cisco, Dell, Intel, Adobe, Flipkart, Samsung, PayPal, IBM, Deloitte, JP Morgan, Goldman Sachs, Bosch, Mercedes-Benz"
    },
    placements2024: {
        maxSalary: "₹92 LPA Highest Package (2024 Batch)",
        avgSalary: "~₹35 LPA (2024 Avg)",
        companies: "249 companies participated in 2024 drive",
        offers: "917 total offers with 75% placement rate"
    },
    hostelDetails: {
        boysBlocks: { chamundi: "1st year UG", cauvery: "2nd & 3rd year UG", cauveryAnnex: "1st year UG", sirMV: "Final year UG & PG" },
        girlsBlocks: { djBlock: "1st year & higher sem B.E. (On-campus)", krishnaGarden: "Higher sem B.E., M.Tech, MCA (Off-campus, Pattanagere)" },
        fees: { tripleSharing: "~₹1,42,000 – ₹1,53,000 per annum", doubleSharing: "~₹1,84,000 – ₹1,91,000 per annum" },
        facilities: "Furnished rooms (bed, study table, chair, cupboard), Wi-Fi, 24/7 security, gymnasium, indoor/outdoor sports, vegetarian mess"
    },
    safety: {
        cctv: "Extensive CCTV surveillance across all blocks, classrooms, and hostels",
        wardens: "Residential wardens in all hostel blocks",
        healthCentre: "On-campus Health Centre with 24/7 medical support and ambulance facility. Partnered with Aster Hospital for specialist care.",
        healthDetails: {
            doctor: "Full-time resident medical officer available",
            services: ["Emergency Care", "Consultation", "24/7 Ambulance", "Medical Pharmacy"],
            hospital: "Tied up with Aster Hospital, RV Road for advanced treatments"
        },
        grievance: "Active Internal Complaints Committee (ICC) and Student Grievance Redressal Cell",
        antiRagging: "Strict Zero Tolerance policy; Anti-ragging squad ensures a safe environment for freshers"
    },
    campus: {
        fest: "8th Mile (Annual Technocultural Fest)",
        clubs: ["Alaap (Music)", "Raaga (Dance)", "TEDxRVCE", "CARV (Cultural)", "Entrepreneurship Cell (E-Cell)", "Namma RVCE (Social)", "DebSoc", "QuizCorp", "Photography Club", "Literary Society", "Kannada Sangha", "Rotaract Club", "Coding Club", "Robotics Club", "NSS", "NCC"],
        teams: ["Team Ashwa (Formula Student)", "Project Antariksh (Space Tech)", "Team Vyoma (UAVs)", "Team Chimera (Hybrid Vehicles)", "Team Astra (Robotics)", "Team Jatayu (Aeromodelling)", "RV Racing (Go-Kart)", "Team Ojas (Electric Vehicle)"],
        societies: ["IEEE RVCE", "SAE RVCE", "ACM Student Chapter", "CSI Student Chapter"],
        urls: {
            innovation: "https://rvce.edu.in/innovative_teams/",
            cultural: "https://rvce.edu.in/cultural_teams/"
        }
    },
    events: [
        { name: "GenAI Workshop (B.E. 2nd Year)", date: "May 15-20, 2026", type: "Technical" },
        { name: "CSITSS 2026 Conference (IEEE)", date: "2026", type: "Research" },
        { name: "Applied AI/ML in Renewable Energy Certification", date: "Mar 16 – Jun 19, 2026", type: "Technical" },
        { name: "ICOECA 2026 Conference", date: "June 12-14, 2026", type: "Research" },
        { name: "8th Mile — Annual Technocultural Fest", date: "2026 (TBA)", type: "Cultural" }
    ],
    attendance: {
        requirement: "Minimum 85% attendance mandatory",
        consequence: "Students below 85% may be detained from appearing in semester exams",
        tracking: "Attendance tracked through mandatory ID card system"
    },
    nearby: {
        areas: "Mysuru Road, Kengeri, Rajarajeshwari Nagar, Pattanagere",
        food: "Multiple eateries, cafes & restaurants near campus on Mysuru Road",
        shopping: "RR Nagar has malls (Gopalan Arcade), local markets, and retail stores",
        hospitals: "BGS Gleneagles Global Hospital, Rajarajeshwari Medical College Hospital nearby",
        connectivity: "NICE Road junction nearby, Kengeri Metro station, BMTC bus routes"
    },
    circulars: {
        academic: "https://rvce.edu.in/academic-circular/",
        admissions: "https://rvce.edu.in/admission-circulars/",
        examinations: "https://rvce.edu.in/examination-circulars/",
        feePayment: "https://rvce.edu.in/academics_and_examinations/fee_payment_circulars/"
    },
    ncc: {
        battalion: "6 Karnataka Battalion NCC",
        established: "2008",
        strength: "80 cadets (Army wing)",
        officer: "ANO in charge",
        activities: "Drill, weapons training, adventure activities, camps (CATC, ATC, NIC), Republic Day parade participation, social service"
    },
    nss: {
        units: "2 NSS Units",
        strength: "200+ volunteers",
        activities: "Blood donation camps, tree plantation drives, rural development, Swachh Bharat campaigns, health awareness programs",
        motto: "Not Me But You"
    },
    kannadaSangha: {
        info: "Kannada Sangha promotes Kannada language, literature, and culture through events, literary competitions, and cultural celebrations.",
        events: "Rajyotsava celebrations, Kannada Habba, poetry recitals, drama performances"
    },
    rvjsteam: {
        info: "RVJ STEAM Team bridges Science, Technology, Engineering, Arts, and Mathematics through hands-on projects, workshops, and school outreach programs."
    },
    faculty: {
        deans: [
            { n: "Dr. Shanmukha Nagaraj", u: "https://rvce.edu.in/about_us/key-executives/", r: "Dean Academics" },
            { n: "Dr. B.M. Sagar", u: "https://rvce.edu.in/about_us/key-executives/", r: "Dean Student Affairs" },
            { n: "Dr. M Uttara Kumari", u: "https://rvce.edu.in/about_us/key-executives/", r: "Dean R&D" },
            { n: "Dr. D. Ranganath", u: "https://rvce.edu.in/about_us/key-executives/", r: "Dean Placement & Training" },
            { n: "Dr. M Krishna", u: "https://rvce.edu.in/about_us/key-executives/", r: "Dean Skill Development" }
        ],
        ae: [
            { n: "Dr. R Supreeth", u: "https://rvce.edu.in/department/ae/dr_r_supreeth/", r: "HOD & Associate Professor" },
            { n: "Dr. Ravindra S Kulkarni", u: "https://rvce.edu.in/department/ae/dr_ravindra_s_kulkarni/#", r: "Professor" },
            { n: "Dr. Promio Charles F", u: "https://rvce.edu.in/department/ae/dr_promio_charles_f/", r: "Associate Professor" },
            { n: "Bhaskar K", u: "https://rvce.edu.in/department/ae/bhaskar_k/", r: "Assistant Professor" },
            { n: "Pranesh Kumar S R", u: "https://rvce.edu.in/department/ae/pranesh_kumar_s_r/", r: "Assistant Professor" },
            { n: "Dr. Benjamin Rohit", u: "https://rvce.edu.in/department/ae/dr_benjamin_rohit/", r: "Assistant Professor" },
            { n: "Srinivasan S", u: "https://rvce.edu.in/department/ae/srinivasan_s/", r: "Faculty" },
            { n: "Mukesh M", u: "https://rvce.edu.in/department/ae/mukesh_m/", r: "Faculty" },
            { n: "Prof. Deepak Bana", u: "https://rvce.edu.in/department/ae/prof_deepak_bana/", r: "Expert/Faculty" },
            { n: "Jitendra Singh", u: "https://rvce.edu.in/department/ae/mr_jitendra_singh/", r: "Professor of Practice" },
            { n: "Srinath Ramakrishnan", u: "https://rvce.edu.in/department/ae/mr_srinath_ramakrishnan/", r: "Assistant Professor" }
        ]
    }
};

/* =============== INPUT SANITIZATION =============== */
function sanitize(input) {
    // 1. Remove dots explicitly to handle c.s.e -> cse
    let cleaned = input.replace(/\./g, '');
    // 2. Remove other special chars
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, ' ');
    // 3. Remove extra spaces
    return cleaned.replace(/\s+/g, ' ').trim();
}

/* =============== INTENT MATCHING (Priority-based) =============== */
// p: 0=greet/bye, 1=very specific, 2=medium, 3=generic fallback
const QA = [
    {k:['hi','hello','hey','hii','hola','good morning','good evening','good afternoon','Namaste','yo','sup','howdy','wassup','yoo','heyo','heyy','hellooo','helloo','namaskara'],id:'greet',p:0},
    {k:['bye','goodbye','thank you','thanks','thats all','see you','cya','take care','ok bye','okay bye','good night','tata','laterz','peace out','im out','gtg','gotta go','kbye'],id:'bye',p:0},
    {k:['circular','circulars','announcement','announcements','latest news','recent notice','notices','update'],id:'circulars',p:1},
    // P1: Specific topics
    {k:['hostel','hostels','accommodation','dorm','dormitory','boys hostel','girls hostel','hostel fee','hostel room','single room','shared room','hostel mess','staying','where to stay','stay at rvce','pg','paying guest','hostel life','hstl','hostl'],id:'hostels',p:1},
    {k:['transport','how to reach','bmtc','bus route','kengeri metro','commute to rvce','distance from','reach rvce','reach the college','how to get there','travel to rvce','cab to rvce','auto to rvce','ola to rvce','uber to rvce','metro station','nearest metro'],id:'transport',p:1},
    {k:['wifi','internet','wi fi','connectivity','broadband','net access','wifi password','net speed','slow internet'],id:'wifi',p:1},
    {k:['canteen','food','mess food','eat','dining','cafeteria','food court','what to eat','lunch','breakfast','snacks','tiffin','grub','khana','mess menu','food quality','dabba','maggi point'],id:'food',p:1},
    {k:['exam','exams','examination','examinations','semester exam','end semester','internal','assessment','cie','end sem','mid sem','exam pattern','question paper','question papers','endsem','midsem','internals','ia marks','see exam','cie marks','qp','prev papers','previous papers'],id:'exam',p:1},
    {k:['lateral','lateral entry','diploma holder','dcet','lateral admission'],id:'lateral',p:1},
    {k:['nri','international student','foreign student','overseas','ciwg','pio','oci','foreign quota','nri quota','nri admission','abroad student'],id:'nri',p:1},
    {k:['scholarship','financial aid','stipend','merit scholarship','scholy','scholorship','fee waiver','free seat','freeship'],id:'scholarships',p:1},
    {k:['jee','jee mains','jee main','jee accepted','jee score','jee rank','jee valid','does jee work'],id:'jee',p:1},
    {k:['kcet','comedk','comed k','cet rank','kcet rank','comedk rank'],id:'examTypes',p:1},
    {k:['management quota','management seat','direct admission','donation seat','mgmt quota','mgmt seat','donation','capitation','mq seat'],id:'management_quota',p:1},
    {k:['cutoff','cut off','closing rank','kcet rank','comedk cutoff','last rank','expected cutoff','cutoffs','closing ranks'],id:'cutoffs',p:1},
    {k:['fee','fees','tuition','fee structure','semester fee','total cost','how much cost','how much does it cost','fee details','kitna paisa','kitna lagta','college fees','yearly fees','annual fees'],id:'fees',p:1},
    {k:['refund','fee refund','cancellation','cancel admission','get money back','refund policy','aicte refund','money back','paisa wapas'],id:'refund_policy',p:1},
    {k:['syllabus','1st semester syllabus','1st sem syllabus','first semester syllabus','scheme','first year subjects','1st year syllabus','what are we studying','sylly','syll','subjects list','what subjects'],id:'syllabus_1st_sem',p:0.8},
    {k:['innovation team','formula student','uav','ashwa','chimera','jatayu','astra robotics','antariksh','student projects','project teams','racing team','baja','sae','drone team'],id:'innovationTeams',p:1},
    {k:['cultural life','culture','cultural life','college culture','music club','dance club','theatre','drama','tedx','tedxrvce','rotaract','fest','8th mile','eighth mile','annual fest','college fest','events','college events','cultural events','cultural activities','annual day','culturals','fests','techfest','tech fest'],id:'culturalLife',p:1},
    {k:['vision','mission','motto','college vision','rvce vision'],id:'vision',p:1},
    {k:['principal','principal name','who is principal','head of institution','director of rvce','who is the principal','about principal','tell me about principal','princi','whos the princi'],id:'principal',p:1},
    {k:['hod','head of department','dean','deans','faculty','teachers','professors','who is the hod','list of hods','hods','who is hod','department head','heads','teaching staff'],id:'faculty',p:1.5},
    {k:['deans list','all deans','dean list','executive committee','key executives'],id:'deans_list',p:1},
    {k:['hods list','list of hods','all hods','hod list','head of departments','all heads'],id:'hods_list',p:1},
    {k:['coe','coes','centres of excellence','centers of excellence','coe list','research centres','research centers','innovation hubs'],id:'centres_of_excellence',p:1},
    {k:['health center','health centre','doctor','medical','ambulance','sick','hospital','first aid','emergency medical','clinic'],id:'health_centre',p:1},
    {k:['ieee','sae','acm','csi','societies','professional societies','student chapters','chapters'],id:'professional_societies',p:1},
    {k:['upcoming events','events','calendar','workshops','conferences','what is happening','happening soon','college events'],id:'upcoming_events',p:0.7},
    {k:['ranking','nirf','iirf','college ranking','where does rvce rank','ranked','best college','rvce rank','top college','rvce ranking'],id:'ranking',p:1},
    {k:['accreditation','naac','nba','naac grade','naac rating','accredited'],id:'accreditation',p:1},
    {k:['timing','timings','working hours','college hours','college time','what time','opening time','closing time','open close','class timings','college timing','kab khulta','when open'],id:'timings',p:1},
    {k:['trust','trust details'],id:'trust',p:1},
    {k:['research','patent','patents','innovation centre','centre of excellence','research centre','grants','funding','research at rvce','research lab','r and d','rnd'],id:'research',p:1},
    {k:['mca','master of computer application','mca dept','mca department','mca course','mca admission'],id:'mca',p:1},
    {k:['phd','doctoral','doctorate','research program','doctor degree','phd admission','phd at rvce'],id:'phd',p:1},
    {k:['vtu','visvesvaraya','affiliated university','university affiliation','vtu affiliation'],id:'vtu',p:1},
    {k:['seat','seats','total seats','intake','how many students','total students','student count','student strength','intake capacity','seat count','total intake'],id:'intake',p:0.5},
    {k:['library','central library','books','reading room','e library','digital library','lib','library timing','study room'],id:'library',p:0.3},
    {k:['sports','cricket','football','basketball','volleyball','athletics','gym','gymnatorium','sports complex','games','badminton','table tennis','tt','fitness','workout','sports ground','playground'],id:'sports',p:1},
    {k:['autonomous','autonomy','own syllabus','own exam','autonomous status','is rvce autonomous'],id:'autonomous',p:1},
    {k:['stat','stats','statistic','statistics','number','numbers','figure','figures','data','how many'],id:'stats_disambiguation',p:0.4},
    // Department-specific (with short codes + college slang)
    {k:['computer science','cse','cs','cs department','computer science engineering','cse department','comps','comp sci','cs branch','cs dept'],id:'dept_cs',p:1},
    {k:['artificial intelligence','aiml','ai ml','machine learning','ai department','ai branch','ml branch','ai and ml'],id:'dept_aiml',p:1},
    {k:['electronics and communication','ece','ec','ec department','ece department','entc','e and c','ec branch'],id:'dept_ec',p:1},
    {k:['mechanical engineering','me department','mech','mech department','mechanical','mech engg','mech branch','mechies'],id:'dept_me',p:1},
    {k:['civil engineering','cv department','cv','civil department','civil','civil branch','cv branch','civil engg'],id:'dept_cv',p:1},
    {k:['electrical','eee','ee','ee department','eee department','electrical engineering','elec','electrical branch','triple e'],id:'dept_ee',p:1},
    {k:['aerospace','ae department','ae','aero','aero department','aeronautical','aerospace engineering','aero branch','aero engg'],id:'dept_ae',p:1},
    {k:['biotech','bt','biotechnology','bio technology','bt department','bio tech','bio branch','biotech dept'],id:'dept_bt',p:1},
    {k:['chemical engineering','ch department','ch','chemical engg','che','chem engg','chem branch','chemical dept'],id:'dept_ch',p:1},
    {k:['information science','ise','is department','ise department','is branch','ise branch','info sci'],id:'dept_is',p:1},
    {k:['data science','csds','ds','cs data science','csds department','ds branch','data sci','csds branch'],id:'dept_csds',p:1},
    {k:['cyber security','cscy','cy','cs cyber security','cscy department','cyber','cyber branch','cscy branch','cybersec'],id:'dept_cscy',p:1},
    {k:['telecom','ete','tc','telecommunication','ete department','tc branch','ete branch','tele'],id:'dept_et',p:1},
    {k:['instrumentation','eie','ei','ei department','eie department','instr','instru','ei branch','eie branch'],id:'dept_ei',p:1},
    {k:['industrial engineering','iem','ie','iem department','industrial management','ie branch','iem branch','industrial'],id:'dept_im',p:1},
    // P2: Mid-level
    {k:['placement','placements','placed','salary','package','lpa','ctc','highest package','average salary','recruit','hiring','companies visit','which companies','recruiters','job','jobs','placement details','plcmnt','plcmnts','campus drive','dream company','mass recruit','superdream','dream offer','placed kya','placement scene','placement stats','on campus placement','off campus placement','top company','top companies','top recruiter','top recruiters'],id:'placements',p:0.5},
    {k:['admission','admissions','how to apply','how to join','entrance','eligibility','enroll','apply to rvce','join rvce','get into rvce','admission process','how to get admission','ug adm','pg adm','ug b e','admission kaise','how to get in','want to join','joining process'],id:'admissions',p:1.5},
    {k:['department','departments','branch','branches','stream','streams','course','courses','program','programmes','what courses','all branches','view programs','depts','all depts'],id:'departments',p:2},
    {k:['ug','ug details'],id:'ug_disambiguation',p:2},
    {k:['ug programs','ug programmes','ug program','undergraduate','undergrad','b e','be','btech','b tech','ug courses','b e flavors','b e course','b e courses','be courses','bachelor','bachelors','ug branch'],id:'ugPrograms',p:1.5},
    {k:['pg program','pg programs','postgraduate','postgrad','m tech','mtech','masters','pg courses','pg branch','pg admission'],id:'pgPrograms',p:1.5},
    {k:['facility','facilities','infrastructure','what facilities','amenities','all facilities','infra','college infra','campus infra'],id:'facilities',p:2},
    {k:['website','site','official website','rvce website','visit website','rvce site','college website'],id:'website',p:2},
    // P3: Generic fallback
    {k:['tell me about','know about','information about','about'],id:'about_disambiguation',p:3.5},
    {k:['rvce','about rvce','college','history','founded','established','overview','abt rvce','whats rvce','what is rvce'],id:'about_rvce',p:3},
    {k:['rvei','about rvei','rsst','institutions','what is rvei','who is rvei','parent organization','who manages','who owns','ownership'],id:'about_rvei',p:3},
    {k:['campus life','student life','extracurricular','clubs','life at rvce','campus','student experience','college life','clg life','lyf at rvce','vibes','campus vibes','college scene'],id:'campusLife',p:1.5},
    {k:['dress code','uniform','what to wear','clothes allowed','is there a uniform','can i wear shorts','can i wear jeans','dress rules','formals','casuals allowed','shorts allowed'],id:'dress_code',p:0.8},
    {k:['anti ragging','ragging','helpline','report ragging','ragging completely banned','bullied','harassed','ragging helpline','rag','ragging scene','ragging hota hai','seniors bully'],id:'anti_ragging',p:0.8},
    {k:['contact','phone','email','address','location','where is rvce','map','direction','call','bengaluru','bangalore','phone number','contact number','college address','rvce address'],id:'contact',p:3},
    {k:['menu','main menu','options','help','start','what can you do','show menu','halp','commands'],id:'menu',p:3},
    // ===== PARENT-SPECIFIC INTENTS =====
    {k:['safe','safety','is it safe','is my child safe','is my daughter safe','security','cctv','campus security','safe for girls','is rvce safe','how safe','secure','campus safety','child safety','girl safety','daughter safety','women safety'],id:'safety',p:0.8},
    {k:['attendance','attendance rules','attendance requirement','minimum attendance','85 percent','attendance mandatory','bunking','bunk','proxy','absent','leave policy','attendance policy','how strict','strict attendance','will my child attend'],id:'attendance',p:1},
    {k:['roi','return on investment','worth the fees','worth the money','value for money','is it worth','paisa vasool','fee worth','investment','good investment','waste of money','expensive but good','justification of fees'],id:'roi',p:1},
    {k:['girls hostel','girls hostel rules','girls curfew','girls safety','female hostel','women hostel','hostel for girls','daughter hostel','curfew','curfew time','hostel timings','hostel curfew','in time','girls hostel fees','separate hostel','hostel rules for girls'],id:'girls_hostel',p:0.7},
    {k:['nearby','surroundings','area around','near rvce','around campus','neighbourhood','neighborhood','food outside','restaurants near','hospital near','hospitals near','shops near','market near','atm near','nearby places','what is around'],id:'nearby',p:1},
    {k:['internship','internships','intern','summer intern','company intern','internship opportunities','internship cell','internship support','do students get internships','intern kahan','intern milta hai'],id:'internship',p:1},
    {k:['startup','entrepreneurship','startup culture','e cell','ecell','incubation','startup support','business','own company','startup scene','entrepreneur','innovation hub'],id:'startup',p:1},
    {k:['peer','peers','peer quality','student quality','topper','toppers','smart students','competitive','peer group','classmates','caliber','students caliber','how are students','crowd','what type of students'],id:'peer_quality',p:1},
    {k:['worth','worth it','is rvce good','is rvce worth it','should i join','should my child join','rvce vs','rvce or','better college','how is rvce','rvce review','reviews','rvce worth joining','join karu','acha hai kya','kaisa hai','accha college hai'],id:'worth_it',p:1.5},
    {k:['best branch','which branch','branch to choose','best department','top branch','scope','which course','cse vs','ise vs','ece vs','branch selection','konsa branch','best course','trending branch','hot branch','most demand'],id:'best_branch',p:1},
    {k:['parking','vehicle','bike parking','car parking','two wheeler','scooty','bike allowed','vehicle allowed','parking space','parking facility'],id:'parking',p:1},
    {k:['part time','part time job','side hustle','earn while studying','freelance','freelancing','earn money','side income','working student','parttime'],id:'part_time',p:1},
    {k:['alumni','alumni network','famous alumni','notable alumni','alumni association','old students','passed out','alumni connect','alumni support','alumni portal'],id:'alumni',p:1},
    {k:['ncc','national cadet corps'],id:'ncc',p:1},
    {k:['nss','national service scheme'],id:'nss',p:1},
    {k:['mandatory disclosure'],id:'mandatory_disclosure',p:1},
    {k:['kannada sangha'],id:'kannada_sangha',p:1},
    {k:['steam team','rvjsteam'],id:'rvjsteam',p:1},
    {k:['calendar','academic calendar','calendar of events'],id:'calendar_events',p:1},
    {k:['comparison','compare','rvce vs pes','rvce vs msrit','rvce vs bms','rvce vs sit','pes vs rvce','msrit vs rvce','bms vs rvce','which is better','better than rvce','rvce better','college comparison'],id:'college_compare',p:1},
    // ===== MULTI-TURN CONTEXT INTENTS =====
    {k:['tell me more','more about this','more details','elaborate','explain more','more info','more information','can you tell me more','in detail','detailed info','detail','details','expand','continue','go on','aur batao','aur bata'],id:'_more',p:0},
    {k:['go back','back','previous','prev','go back to','return','wapas','piche'],id:'_back',p:0},
    {k:['what else','anything else','something else','other options','what more','kuch aur','aur kya'],id:'_what_else',p:0},
    {k:['yes','yeah','yep','yup','sure','ok','okay','haan','ha','ji','correct','right'],id:'_yes',p:0},
    {k:['no','nah','nope','nahi','na','not interested','skip'],id:'_no',p:0},
];

// Dynamically inject specific HOD queries for ALL departments
const dynamicHodIntents = [];
QA.forEach(q => {
    if (q.id && q.id.startsWith('dept_')) {
        const c = q.id.replace('dept_', '');
        const hodKWs = [];
        q.k.forEach(kw => {
            hodKWs.push(`hod ${kw}`);
            hodKWs.push(`${kw} hod`);
            hodKWs.push(`head of ${kw}`);
        });
        // p=0.5 overrides normal department queries (p=1)
        dynamicHodIntents.push({ k: hodKWs, id: `hod_${c}`, p: 0.5 });
    }
});
QA.push(...dynamicHodIntents);

// 3. Dynamically inject Faculty names for direct search
Object.keys(KB.faculty).forEach(dept => {
    KB.faculty[dept].forEach(fac => {
        const full = fac.n.toLowerCase();
        const plain = fac.n.replace(/Dr\.|Prof\.|Mr\.|Assistant Prof/gi, '').trim().toLowerCase();
        const slug = full.replace(/[^a-z0-9]/g, '');
        // Priority 0 ensures it matches before anything else
        QA.push({ k: [full, plain], id: `fac_${slug}`, p: 0 });
    });
});

// Human-readable labels for suggestion buttons
const INTENT_LABELS = {
    greet:'Say Hi 👋', bye:'Bye!', about_disambiguation:'About 🤔', about_rvce:'About RVCE 🏫', about_rvei:'About RVEI (RSST) 🏛️', hostels:'Hostels 🏠',
    transport:'How to Reach 🚌', wifi:'WiFi 📶', food:'Food & Canteen 🍛',
    exam:'Exams 📝', lateral:'Lateral Entry', nri:'NRI / International',
    scholarships:'Scholarships 🎓', jee:'JEE Info', examTypes:'KCET / COMED-K',
    contact:'Contact 📞', menu:'Main Menu 📋',
    dept_cs:'Computer Science & Engineering (CSE)', dept_aiml:'AI & Machine Learning (AIML)', dept_ec:'Electronics & Communication (ECE)',
    dept_me:'Mechanical Engineering (ME)', dept_cv:'Civil Engineering (CV)', dept_ee:'Electrical & Electronics (EEE)',
    dept_ae:'Aerospace Engineering (AE)', dept_bt:'Biotechnology (BT)', dept_ch:'Chemical Engineering (CH)',
    dept_is:'Information Science (ISE)', dept_csds:'Data Science (CSDS)', dept_cscy:'Cyber Security (CSCY)',
    dept_et:'Telecommunication (ETE)', dept_ei:'Instrumentation (EIE)', dept_im:'Industrial Engineering (IEM)',
    syllabus_1st_sem: '1st Year Syllabus 📚', dress_code: 'Dress Code 👔', anti_ragging: 'Anti-Ragging 🛑', hod_cs: 'CSE HOD 👨‍🏫',
    safety: 'Campus Safety 🛡️', attendance: 'Attendance Rules 📋', roi: 'Value for Money 💎', girls_hostel: 'Girls Hostel 🏠',
    nearby: 'Nearby Areas 📍', internship: 'Internships 🧑‍💻', startup: 'Startups & E-Cell 🚀', peer_quality: 'Peer Quality 🎯',
    worth_it: 'Is RVCE Worth It? ⭐', best_branch: 'Best Branch 🔝', parking: 'Parking & Vehicles 🅿️', part_time: 'Part-time Work 💼',
    alumni: 'Alumni Network 🤝', college_compare: 'College Comparison 📊',
    centres_of_excellence:'Centres of Excellence 🔬', health_centre:'Health Facilities 🏥',
    professional_societies:'Student Societies 🤝', upcoming_events:'Upcoming Events 📅',
    ncc:'NCC 🇮🇳', nss:'NSS 🤝', mandatory_disclosure:'Mandatory Disclosure 📄',
    kannada_sangha:'Kannada Sangha 🎭', rvjsteam:'RVJ STEAM Team 🎨', calendar_events:'Calendar of Events 📅',
    circulars: 'Circulars & Notices 📢', management_quota: 'Management Quota 💰', cutoffs: 'Cutoffs & Ranks 📊', fees: 'Fee Structure 💵',
    refund_policy: 'Refund Policy 💸', innovationTeams: 'Innovation Teams 💡', culturalLife: 'Cultural Life 🎭', vision: 'Vision & Mission 🎯',
    principal: 'Principal 👨‍🏫', faculty: 'Faculty & Deans 👨‍🏫', deans_list: 'Deans List 📋', hods_list: 'HODs List 👩‍🏫',
    ranking: 'Rankings & NIRF 🏆', accreditation: 'Accreditation 💎', timings: 'College Timings ⏰', trust: 'RSST Trust 🏛️',
    research: 'Research & R&D 🔬', mca: 'MCA Department 💻', phd: 'PhD Programs 🧪', vtu: 'VTU Affiliation 🏛️',
    intake: 'Student Intake 🎓', library: 'Central Library 📚', sports: 'Sports & Athletics 🏅', autonomous: 'Autonomous Status 📜',
    stats_disambiguation: 'College Statistics 📊', placements: 'Placements 💼', admissions: 'Admissions 🎓', departments: 'All Departments 📚',
    ug_disambiguation: 'UG Details 🎓', ugPrograms: 'UG Programs (B.E.) 📜', pgPrograms: 'PG Programs (M.Tech) 📘', facilities: 'Facilities & Infra 🏢',
    website: 'Official Website 🌐', campusLife: 'Campus Life 🏕️'
};

const ABBR = {
    'prgm': 'ugPrograms', 'prgms': 'ugPrograms', 'prog': 'ugPrograms',
    'dept': 'departments', 'depts': 'departments',
    'adm': 'admissions', 'adms': 'admissions',
    'plcmnt': 'placements', 'plcmnts': 'placements',
    'hstl': 'hostels', 'hostl': 'hostels',
    'schly': 'scholarships',
    'syll': 'syllabus_1st_sem', 'sylly': 'syllabus_1st_sem',
    'infra': 'facilities', 'amenities': 'facilities',
    'mgmt': 'management_quota',
    'execs': 'deans_list',
    'princi': 'principal',
    'cult': 'culturalLife',
    'inno': 'innovationTeams',
    'soc': 'professional_societies',
    'alum': 'alumni',
    'fee': 'fees',
    'exam': 'exam',
    'res': 'research',
    'place': 'placements'
};

// Returns { type: 'exact'|'keyword'|'fuzzy'|null, id: string|null, suggestions: string[] }
function classifyIntent(input) {
    const cleanInput = sanitize(input).toLowerCase();
    // === ULTRA-AGGRESSIVE FACULTY SEARCH ===
    console.log("[Chatbot] Classifying:", cleanInput);
    if (KB.faculty) {
        for (const deptCode in KB.faculty) {
            for (const fac of KB.faculty[deptCode]) {
                const fullName = fac.n.toLowerCase();
                const plainName = fac.n.replace(/Dr\.|Prof\.|Mr\.|Assistant Prof/gi, '').trim().toLowerCase();
                
                // Direct containment check (Very aggressive)
                if (cleanInput.length >= 4 && (fullName.includes(cleanInput) || cleanInput.includes(plainName))) {
                    const finalId = `fac_${fullName.replace(/[^a-z0-9]/g, '')}`;
                    console.log("[Chatbot] SUCCESS: Matched Faculty ->", finalId);
                    return { type: 'exact', id: finalId, suggestions: [] };
                }
            }
        }
    }
    
    // 0. High-Priority Faculty Search (Legacy Fallback)
    const facultyMatch = findFacultyMatch(cleanInput);
    if (facultyMatch) {
        console.log("[Chatbot] Fallback Match Found:", facultyMatch);
        return { type: 'exact', id: facultyMatch, suggestions: [] };
    }
    
    // 0. Abbreviation Check
    if (ABBR[cleanInput]) return { type: 'fuzzy', id: null, suggestions: [ABBR[cleanInput]] };

    // 0.5 Context-aware multi-turn handling
    const contextIntents = ['_more','_back','_what_else','_yes','_no'];
    for (const q of QA) {
        if (contextIntents.includes(q.id) && q.k.includes(cleanInput)) {
            return { type: 'context', id: q.id, suggestions: [] };
        }
    }
    
    // 1. Universal Button-to-Intent Bypass — these are BUTTONS the user clicked, always exact
    for (const [id, label] of Object.entries(INTENT_LABELS)) {
        if (sanitize(label).toLowerCase() === cleanInput) return { type: 'exact', id, suggestions: [] };
    }
    for (const d of KB.departments.ug) {
        if (sanitize(d.n).toLowerCase() === cleanInput) return { type: 'exact', id: 'dept_' + d.c, suggestions: [] };
    }
    for (const d of KB.departments.pg) {
        if (sanitize(d.n).toLowerCase() === cleanInput) return { type: 'exact', id: 'dept_' + d.c, suggestions: [] };
    }
    const BUTTON_MAP = {
        'ug be': 'ugAdm', 'pg mtech': 'pgAdm', 'mca': 'mca', 'phd': 'phd',
        'view programs': 'ugPrograms', 'pg programs': 'pgPrograms', 'all departments': 'departments',
        'admissions page': 'admissions', 'apply': 'admissions',
        'placement details': 'placements', 'more info': 'admissions',
        'facilities': 'facilities', 'all facilities': 'facilities',
        'innovation teams': 'innovationTeams', 'see teams': 'innovationTeams',
        'cultural clubs': 'culturalLife', 'cultural teams': 'culturalLife',
        'sports info': 'sports', 'rvei website': 'trust',
        'website': 'website', 'email': 'contact', 'rvce edu in': 'website'
    };
    if (BUTTON_MAP[cleanInput]) return { type: 'exact', id: BUTTON_MAP[cleanInput], suggestions: [] };

    // 2. Exact match: user typed EXACTLY a keyword from the QA bank
    for (const q of QA) {
        if (q.k.includes(cleanInput)) return { type: 'exact', id: q.id, suggestions: [] };
    }

    // 3. Keyword-in-sentence: a keyword appears as a whole word inside user's input
    let best = null, bestP = 99, bestL = 0;
    for (const q of QA) {
        for (const k of q.k) {
            const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('(?:^|\\s)' + escapedK + '(?=\\s|$)', 'i');
            
            if (regex.test(cleanInput)) {
                if (q.p < bestP || (q.p === bestP && k.length > bestL)) {
                    best = q.id; bestP = q.p; bestL = k.length;
                }
            }
        }
    }
    if (best) return { type: 'keyword', id: best, suggestions: [] };

    // 4. Fuzzy match: no exact keyword found, try "Did you mean?" suggestions
    const suggestions = findSuggestions(input);
    if (suggestions.length > 0) return { type: 'fuzzy', id: null, suggestions };

    // 5. No match at all
    return { type: null, id: null, suggestions: [] };
}

function findFacultyMatch(input) {
    if (!KB.faculty) return null;
    const sInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sInput.length < 3) return null;

    for (const dept in KB.faculty) {
        for (const fac of KB.faculty[dept]) {
            const fSlug = fac.n.toLowerCase().replace(/[^a-z0-9]/g, '');
            const pSlug = fac.n.replace(/Dr\.|Prof\.|Mr\.|Assistant Prof/gi, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (sInput === fSlug || sInput === pSlug || (sInput.length > 5 && fSlug.includes(sInput))) {
                return `fac_${fSlug}`;
            }
        }
    }
    return null;
}

// Legacy wrapper for tests and button clicks (returns just the ID)
function matchIntent(input) {
    const result = classifyIntent(input);
    return result.id || null;
}

/* =============== FUZZY "DID YOU MEAN?" =============== */
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, ()=> Array(n+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));
    return dp[m][n];
}

function findSuggestions(input) {
    const words = sanitize(input).toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const scored = new Map();
    for (const q of QA) {
        if (q.id === 'greet' || q.id === 'bye' || q.id === 'menu') continue;
        let minDist = Infinity;
        for (const k of q.k) {
            for (const w of words) {
                // Check each keyword and each word from input
                const kWords = k.split(/\s+/);
                for (const kw of kWords) {
                    if (kw.length < 3) continue;
                    const d = levenshtein(w, kw);
                    const threshold = Math.max(1, Math.floor(kw.length * 0.35));
                    if (d <= threshold && d < minDist) minDist = d;
                }
            }
        }
        if (minDist < Infinity) scored.set(q.id, minDist);
    }
    // Sort by distance, return top 3 unique
    const sorted = [...scored.entries()].sort((a,b) => a[1]-b[1]);
    const results = [];
    const seen = new Set();
    for (const [id] of sorted) {
        if (!seen.has(id) && results.length < 3) { results.push(id); seen.add(id); }
    }
    return results;
}

function getFollowUps(id) {
    const map = {
        ugPrograms: [{l:'Admissions info',a:'ugAdm',i:'🎓'},{l:'Campus Life',a:'campusLife',i:'🏕️'}],
        placements: [{l:'Top Companies',a:'_more',i:'🏢'},{l:'Admissions',a:'admissions',i:'🎓'}],
        hostels: [{l:'Facilities',a:'facilities',i:'🏢'},{l:'Sports',a:'sports',i:'🏅'}],
        admissions: [{l:'Fee Structure',a:'fees',i:'💰'},{l:'Placements',a:'placements',i:'💼'}],
        food: [{l:'Hostels',a:'hostels',i:'🏠'},{l:'Nearby Areas',a:'nearby',i:'📍'}],
        wifi: [{l:'Hostels',a:'hostels',i:'🏠'},{l:'Facilities',a:'facilities',i:'🏢'}],
        transport: [{l:'Nearby Areas',a:'nearby',i:'📍'},{l:'Contact',a:'contact',i:'📞'}],
        exam: [{l:'Academic Calendar',a:'calendar_events',i:'📅'},{l:'Syllabus',a:'syllabus_1st_sem',i:'📚'}],
        intake: [{l:'Admissions',a:'admissions',i:'🎓'},{l:'Departments',a:'departments',i:'📚'}],
        timings: [{l:'Contact',a:'contact',i:'📞'},{l:'Transport',a:'transport',i:'🚌'}],
        dress_code: [{l:'Campus Life',a:'campusLife',i:'🏕️'},{l:'Anti-Ragging',a:'anti_ragging',i:'🛑'}],
        attendance: [{l:'Exams',a:'exam',i:'📝'},{l:'Calendar',a:'calendar_events',i:'📅'}],
        parking: [{l:'Transport',a:'transport',i:'🚌'},{l:'Nearby',a:'nearby',i:'📍'}],
        vtu: [{l:'Autonomous Status',a:'autonomous',i:'📜'},{l:'Exams',a:'exam',i:'📝'}],
        autonomous: [{l:'VTU Affiliation',a:'vtu',i:'🏛️'},{l:'Syllabus',a:'syllabus_1st_sem',i:'📚'}],
        ranking: [{l:'Placements',a:'placements',i:'💼'},{l:'Accreditation',a:'accreditation',i:'💎'}],
        vision: [{l:'About RVCE',a:'about_rvce',i:'🏫'},{l:'Principal',a:'principal',i:'👨‍🏫'}],
        refund_policy: [{l:'Fee Structure',a:'fees',i:'💰'},{l:'Admissions',a:'admissions',i:'🎓'}]
    };
    return map[id] || [];
}

/* =============== MULTI-TURN CONTEXT HELPERS =============== */
function getDeepInfo(lastId) {
    const r = { text:'', buttons:[], noMenu:false };
    const deepMap = {
        'placements': () => {
            r.text = T("Here's the full breakdown! 📊","Detailed Placement Information:");
            r.text += "\n\n**2025 Batch (B.E.):**\n• Highest: " + KB.placements.maxSalary + "\n• Average: " + KB.placements.avgSalary + "\n• " + KB.placements.companies + "\n• " + KB.placements.offers + "\n• Infrastructure: " + KB.placements.infra + "\n• Scholarships: " + KB.placements.scholarships;
            r.text += "\n\n**M.Tech/MCA (2025):**\n• M.Tech highest: " + KB.placements2025.mtechMax + "\n• MCA highest: " + KB.placements2025.mcaMax;
            r.text += "\n\n**Previous Year (2024):**\n• Highest: " + KB.placements2024.maxSalary + "\n• " + KB.placements2024.companies + "\n• " + KB.placements2024.offers;
            r.text += "\n\n**Top Recruiters:**\n" + KB.placements.recruiters;
            r.buttons = [{l:'Placement Page',u:KB.placements.url,i:'🌐'},{l:'Admissions',a:'admissions',i:'🎓'}];
        },
        'admissions': () => {
            r.text = T("Here's the complete admissions guide! 📋","Comprehensive Admission Details:");
            r.text += "\n\n**UG (B.E.):**\n• Eligibility: " + KB.admissions.ug.eligibility + "\n• Exams: " + KB.admissions.ug.exams + "\n• Other Quotas: " + KB.admissions.ug.quotas;
            r.text += "\n\n**PG (M.Tech):**\n• Eligibility: " + KB.admissions.pg.eligibility + "\n• Exams: " + KB.admissions.pg.exams;
            r.text += "\n\n**MCA:**\n• Eligibility: " + KB.admissions.mca.eligibility;
            r.text += "\n\n**Fee Structure:**\n" + KB.admissions.fees;
            r.text += "\n\n**Cutoffs:**\n" + KB.admissions.cutoffs;
            r.buttons = [{l:'Apply Now',u:KB.admissions.url,i:'🌐'},{l:'Fee Details',a:'fees',i:'💰'}];
        },
        'about_rvce': () => {
            r.text = T("Let me tell you everything about RVCE! 🏫","Complete RVCE Overview:");
            r.text += "\n\n• **Name:** " + KB.general.name + "\n• **Established:** " + KB.general.est + "\n• **Campus:** " + KB.general.campus + "\n• **Trust:** " + KB.general.trust + "\n• **Status:** " + KB.general.status + "\n• **Accreditation:** " + KB.general.accreditation + "\n• **Ranking:** " + KB.general.ranking + "\n• **Principal:** " + KB.general.principal + "\n• **Vision:** " + KB.general.vision + "\n• **Research:** " + KB.general.research + "\n• **Intake:** " + KB.general.intake + "\n• **Industry Partners:** " + KB.general.industryPartners.join(', ');
            r.buttons = [{l:'Rankings',a:'ranking',i:'🏆'},{l:'Research',a:'research',i:'🔬'},{l:'Website',u:'https://rvce.edu.in/about_us/',i:'🌐'}];
        },
        'hostels': () => {
            r.text = T("Here's the full hostel scoop! 🏠","Complete Hostel Details:");
            r.text += "\n\n**Boys Blocks:**";
            Object.entries(KB.hostelDetails.boysBlocks).forEach(([k,v]) => { r.text += "\n• " + k.charAt(0).toUpperCase()+k.slice(1) + ": " + v; });
            r.text += "\n\n**Girls Blocks:**";
            Object.entries(KB.hostelDetails.girlsBlocks).forEach(([k,v]) => { r.text += "\n• " + k.charAt(0).toUpperCase()+k.slice(1) + ": " + v; });
            r.text += "\n\n**Fees:**\n• Triple Sharing: " + KB.hostelDetails.fees.tripleSharing + "\n• Double Sharing: " + KB.hostelDetails.fees.doubleSharing;
            r.text += "\n\n**Facilities:** " + KB.hostelDetails.facilities;
            r.buttons = [{l:'Girls Hostel',a:'girls_hostel',i:'🏠'},{l:'Campus Safety',a:'safety',i:'🛡️'}];
        },
        'departments': () => {
            r.text = T("RVCE has departments across multiple levels! 📚","Department Overview:");
            r.text += "\n\n**UG Programs (B.E.):** " + KB.departments.ug.length + " departments\n**PG Programs (M.Tech/MCA):** " + KB.departments.pg.length + " programs\n**PhD:** Available in all departments with 15 VTU-recognized Research Centres";
            r.text += "\n\n**Top Departments:**\n• CSE — HOD: Dr. Shanta Rangaswamy\n• AIML — HOD: Dr. Sathish Babu B\n• ECE — HOD: Dr. Ravish Aradhya H V\n• ISE — HOD: Dr. Mamatha G S\n• ME — HOD: Dr. Shanmukha N";
            r.buttons = [{l:'UG Programs',a:'ugPrograms',i:'🎓'},{l:'PG Programs',a:'pgPrograms',i:'📘'},{l:'All HODs',a:'hods_list',i:'👩‍🏫'}];
        },
        'research': () => {
            r.text = T("RVCE's research game is next level! 🔬","Detailed Research Information:");
            r.text += "\n\n• " + KB.general.research + "\n• Research Domains: " + KB.general.researchDomains;
            r.text += "\n\n**All 20 Centres of Excellence:**\n• " + KB.general.coes.join("\n• ");
            r.text += "\n\n**Centres of Competence:**\n• " + KB.general.cocs.join("\n• ");
            r.buttons = [{l:'Research Page',u:'https://rvce.edu.in/research_consulting/',i:'🌐'}];
        },
        'campusLife': () => {
            r.text = T("Campus life at RVCE is EPIC! 🎉","Detailed Campus Life:");
            r.text += "\n\n**Cultural Clubs (" + KB.campus.clubs.length + "):**\n• " + KB.campus.clubs.join("\n• ");
            r.text += "\n\n**Innovation Teams (" + KB.campus.teams.length + "):**\n• " + KB.campus.teams.join("\n• ");
            r.text += "\n\n**Professional Societies:**\n• " + KB.campus.societies.join("\n• ");
            r.text += "\n\n**Annual Fest:** " + KB.campus.fest;
            r.buttons = [{l:'Innovation Teams',u:KB.campus.urls.innovation,i:'🚀'},{l:'Cultural Teams',u:KB.campus.urls.cultural,i:'🎭'}];
        },
        'contact': () => {
            r.text = T("Here's every way to reach RVCE! 📞","Complete Contact Information:");
            r.text += "\n\n• **Address:** " + KB.contact.address + "\n• **Phone:** " + KB.contact.phone + "\n• **Admissions:** " + KB.contact.admissionPhone + "\n• **Placement Cell:** " + KB.contact.placementPhone + "\n• **Email:** " + KB.contact.email + "\n• **Website:** " + KB.contact.website + "\n• **Timings:** " + KB.general.timings;
            r.buttons = [{l:'Website',u:KB.contact.website,i:'🌐'},{l:'Contact Page',u:'https://rvce.edu.in/contact-us/',i:'📞'}];
        },
        'fees': () => {
            r.text = T("Full fee breakdown! 💰","Detailed Fee Structure:");
            r.text += "\n\n" + KB.admissions.fees;
            r.text += "\n\n**Hostel Fees:**\n• Triple Sharing: " + KB.hostelDetails.fees.tripleSharing + "\n• Double Sharing: " + KB.hostelDetails.fees.doubleSharing;
            r.text += "\n\n**Refund Policy:** AICTE rules apply — full refund (-₹1k processing) before commencement.";
            r.buttons = [{l:'Fee Circulars',u:KB.circulars.feePayment,i:'📄'},{l:'Scholarships',a:'scholarships',i:'🎓'}];
        }
    };
    if (deepMap[lastId]) { deepMap[lastId](); return r; }
    // For department-specific intents
    if (lastId && lastId.startsWith('dept_')) {
        const c = lastId.replace('dept_','');
        const d = KB.departments.ug.find(x=>x.c===c) || KB.departments.pg.find(x=>x.c===c);
        if (d) {
            r.text = T("Here's everything about " + d.n + "! 📚","Detailed Department Information: " + d.n);
            r.text += "\n\n• **HOD:** " + (d.hod || 'N/A');
            if (d.info) r.text += "\n• **About:** " + d.info;
            r.text += "\n\nExplore all department resources below:";
            r.buttons = [{l:'Main Page',u:d.u,i:'🌐'}];
            if (d.about) r.buttons.push({l:'About',u:d.about,i:'ℹ️'});
            if (d.syllabus) r.buttons.push({l:'Syllabus',u:d.syllabus,i:'📚'});
            if (d.faculty) r.buttons.push({l:'Faculty',u:d.faculty,i:'👨‍🏫'});
            if (d.placement) r.buttons.push({l:'Placements',u:d.placement,i:'💼'});
            if (d.labs) r.buttons.push({l:'Labs',u:d.labs,i:'🧪'});
            return r;
        }
    }
    return null;
}

function getRelatedTopics(lastId) {
    const r = { text:'', buttons:[], noMenu:false };
    const relatedMap = {
        'placements': ['admissions','fees','departments','best_branch','internship','alumni'],
        'admissions': ['fees','placements','departments','hostels','scholarships','cutoffs'],
        'about_rvce': ['ranking','accreditation','research','vision','principal','about_rvei'],
        'hostels': ['facilities','food','safety','girls_hostel','nearby','transport'],
        'departments': ['ugPrograms','pgPrograms','placements','research','centres_of_excellence'],
        'campusLife': ['culturalLife','innovationTeams','sports','upcoming_events','ncc','nss'],
        'fees': ['admissions','scholarships','refund_policy','hostels','management_quota'],
        'contact': ['transport','nearby','timings','website'],
        'research': ['centres_of_excellence','departments','phd'],
        'ranking': ['accreditation','about_rvce','college_compare'],
        'safety': ['hostels','girls_hostel','anti_ragging','health_centre'],
        'culturalLife': ['innovationTeams','sports','upcoming_events','campusLife'],
        'innovationTeams': ['culturalLife','research','startup','campusLife']
    };
    const related = relatedMap[lastId] || ['admissions','placements','departments','campusLife','hostels'];
    r.text = T("Here are some related topics you might like! 🔗","Related topics you can explore:");
    r.buttons = related.slice(0,5).map(id => ({ l: INTENT_LABELS[id] || id, a: id, i: '🔍' }));
    return r;
}

/* =============== TONE HELPER =============== */
function T(f, p) { return tone === 'funny' ? f : p; }

/* =============== RESPONSE GENERATOR =============== */
function getResponse(id) {
    const r = { text:'', buttons:[], noMenu:false };
    
    // Add conversational prefix for non-greeting/bye intents
    if (id !== 'greet' && id !== 'bye' && id !== 'menu') {
        r.text = getPrefix();
    }

    SESSION.lastIntent = id;

    switch(id) {
    case 'greet':
        r.text = T("Hey there! 👋 Welcome to RVCE — the place where engineers are crafted! 🔧 What would you like to know?","Hello! Welcome to RV College of Engineering. How can I assist you today?");
        r.noMenu = true; return r;
    case 'bye':
        r.text = T("See ya! 🙌 Hope I helped. Come back anytime!","Thank you for visiting. Feel free to return anytime. Have a good day!");
        r.buttons = [{l:'Visit Website',u:KB.contact.website,i:'🌐'}]; return r;
    case 'about':
    case 'about_disambiguation':
        r.text = T(
            "Are you looking for information about Departments, the RV Educational Institutions (RVEI), or RV College of Engineering (RVCE)?",
            "Please clarify what you would like to know about:"
        );
        r.buttons = [
            {l:'Departments 📚', a:'departments', i:'📚'},
            {l:'About RVEI 🏛️', a:'about_rvei', i:'🏛️'},
            {l:'About RVCE 🏫', a:'about_rvce', i:'🏫'}
        ];
        r.noMenu = true;
        break;
    case 'about_rvei':
        r.text += T("Rashtreeya Vidyalaya Educational Institutions (RVEI) is managed by RSST! 🏛️","About RVEI (RSST):");
        r.text += "\n• "+KB.rvei.history+"\n• "+KB.rvei.institutions+"\n• Motto: "+KB.rvei.motto;
        r.buttons = [{l:'RVEI Website',u:'https://rvinstitutions.com/',i:'🌐'},{l:'About RVCE',a:'about_rvce',i:'🏫'}];
        break;
    case 'about_rvce':
        r.text += T("RVCE — engineering excellence since 1963! 🔧\n📍 16.85 acres on Mysuru Road, Bengaluru\n🏆 NAAC A+ (3.39/4.0) | NIRF 101-150\n🎓 16 UG + 14 PG programs\n📄 100+ Patents | 20 Centres of Excellence",
            "RV College of Engineering, established in 1963, is situated on 16.85 acres on Mysuru Road, Bengaluru.\n\n• Accreditation: NAAC A+ Grade (CGPA 3.39/4.0, valid 2024-2029)\n• Ranking: NIRF 101-150, #1 Private College (IIRF 2025)\n• Programs: 16 B.E., 14 M.Tech/MCA, PhD\n• Research: 100+ Patents, 20 Centres of Excellence");
        r.buttons = [{l:'Rankings',a:'ranking',i:'🏆'},{l:'Vision & Mission',a:'vision',i:'🎯'},{l:'Research',a:'research',i:'🔬'},{l:'Website',u:'https://rvce.edu.in/about_us/',i:'🌐'}]; break;
    case 'vision':
        r.text += T("RVCE's vision? Tech + Innovation + Sustainability = Future! 🚀","Vision: "+KB.general.vision); break;
    case 'principal':
        r.text += T("Dr. K.N. Subramanya is the Principal! With 34+ years experience, he leads the team! ⚓",
            "The Principal of RVCE is Dr. K.N. Subramanya.\n\nHe holds a B.E., M.Tech., MBA, and Ph.D., bringing over 34 years of experience in teaching, research, and administration.\n\nContact: principal@rvce.edu.in");
        r.buttons = [{l:'About Principal',u:'https://rvce.edu.in/about-k_n_subramanya/',i:'👨‍🏫'}]; break;
    case 'ranking':
        r.text += T("RVCE is killing it! 🏆","RVCE Rankings:");
        r.text += "\n• "+KB.general.ranking+"\n• "+KB.general.accreditation; break;
    case 'accreditation':
        r.text += T("RVCE scored the top marks! 💎","Accreditation Details:");
        r.text += "\n• "+KB.general.accreditation+"\n• "+KB.general.status;
        r.buttons = [{l:'NAAC Portal',u:'https://rvce.edu.in/naac/',i:'🌐'}]; break;
    case 'timings':
        r.text += T("⏰ "+KB.general.timings,"College timings: "+KB.general.timings); break;
    case 'trust':
        r.text += T("RVCE is powered by RSST! 🏛️","RVCE is managed by "+KB.general.trust+".");
        r.buttons = [{l:'RVEI Website',u:'https://rvei.edu.in/',i:'🌐'}]; break;
    case 'research':
        r.text += T("Research at RVCE is 🔥!","Research Highlights:");
        r.text += "\n• "+KB.general.research+"\n• Domains: "+KB.general.researchDomains;
        r.buttons = [{l:'Centres of Excellence 🔬',a:'centres_of_excellence',i:'🧪'},{l:'Research Centres',u:'https://rvce.edu.in/research_consulting/',i:'🌐'}]; break;
    case 'centres_of_excellence':
        r.text += T("RVCE has 20 Centres of Excellence! 🔬 Here are the key ones:","Centres of Excellence (COEs):");
        r.text += "\n• " + KB.general.coes.join("\n• ");
        r.text += "\n\n**Industry Competence Centres:**\n• " + KB.general.cocs.join("\n• ");
        r.buttons = [{l:'Research Home',a:'research',i:'🔬'},{l:'Full List',u:'https://rvce.edu.in/research_consulting/',i:'🌐'}]; break;
    case 'admissions':
        r.text += T("Let's get you enrolled! 🎓","Admission Information:");
        r.buttons = [{l:'UG (B.E.)',a:'ugAdm',i:'🎓'},{l:'PG (M.Tech)',a:'pgAdm',i:'📘'},{l:'MCA',a:'mca',i:'💻'},{l:'PhD',a:'phd',i:'🧪'},{l:'Admissions Page',u:KB.admissions.url,i:'🌐'}]; break;
    case 'ugAdm':
        r.text += T("B.E. admission details 📋:","UG Admission:");
        r.text += "\n• Eligibility: "+KB.admissions.ug.eligibility+"\n• Exams: "+KB.admissions.ug.exams+"\n• "+KB.admissions.ug.quotas;
        r.buttons = [{l:'View Programs',a:'ugPrograms',i:'📋'},{l:'Apply',u:KB.admissions.url,i:'🌐'}]; break;
    case 'circulars':
        r.text += T("Looking for the latest updates? 📢 Check out the official circulars below!","Please select the type of circular you are looking for:");
        r.buttons = [
            {l:'Admission Circulars',u:KB.circulars.admissions,i:'🎓'},
            {l:'Exam Circulars',u:KB.circulars.examinations,i:'📝'},
            {l:'Academic Circulars',u:KB.circulars.academic,i:'📚'},
            {l:'Fee Payment Circulars',u:'https://rvce.edu.in/academics_and_examinations/fee_payment_circulars/',i:'💰'}
        ]; break;
    case 'pgAdm':
        r.text += T("M.Tech time! 🚀","PG Admission:");
        r.text += "\n• Eligibility: "+KB.admissions.pg.eligibility+"\n• Exams: "+KB.admissions.pg.exams;
        r.buttons = [{l:'PG Programs',a:'pgPrograms',i:'📋'},{l:'Apply (M.Tech/MCA)',u:'https://rvce.edu.in/admissions/#mtechmca_link',i:'🌐'}]; break;
    case 'jee':
        r.text += T("⚠️ JEE Mains is NOT accepted at RVCE! You need KCET, COMED-K, or Management Quota.","Important: JEE Mains scores are NOT considered for RVCE admission. Accepted exams: KCET (KEA), COMED-K, and Management Quota.");
        r.buttons = [{l:'Admission Info',a:'admissions',i:'🎓'}]; break;
    case 'examTypes':
        r.text += T("Ways to get in 🎯:","Admission Modes:");
        r.text += "\n• KCET (KEA) — Karnataka entrance\n• COMED-K — Private colleges\n• Management Quota\n• Special: CIWG/PIO/OCI/Nepal";
        r.buttons = [{l:'More Info',u:KB.admissions.url,i:'🌐'}]; break;
    case 'management_quota':
        r.text += T("Management Quota Seats 💰:","Management Quota Information:");
        r.text += "\n• Admission is based on academic performance and seat availability.\n• Fees: "+KB.admissions.fees;
        r.buttons = [{l:'Contact Admissions',a:'contact',i:'📞'},{l:'Admissions Page',u:KB.admissions.url,i:'🌐'}]; break;
    case 'cutoffs':
        r.text += T("Rankings & Cutoffs 📊:","KCET/COMEDK Cutoffs:");
        r.text += "\n• "+KB.admissions.cutoffs+"\n• Note: Cutoffs vary significantly by year and category.";
        r.buttons = [{l:'KEA Website',u:'https://cetonline.karnataka.gov.in/kea/',i:'🌐'},{l:'Admissions Info',a:'admissions',i:'🎓'}]; break;
    case 'scholarships':
        r.text += T("Scholarships & Aid 🎓:","Financial Support:");
        r.text += "\n• "+KB.placements.scholarships;
        r.buttons = [{l:'More Details',u:'https://rvce.edu.in/scholarships/',i:'🌐'}]; break;
    case 'lateral':
        r.text += T("Lateral Entry (Diploma) 🔄:","Admission for Diploma Holders:");
        r.text += "\n• Direct admission to 2nd year B.E.\n• Mandatory Requirement: DCET (Diploma CET) rank.";
        r.buttons = [{l:'Admissions Page',u:KB.admissions.url,i:'🌐'}]; break;
    case 'fees':
        r.text += T("Tuition fees depend on the admission quota:<br>• <strong>KCET:</strong> ~₹1,00,000 to ₹1,20,000 per year<br>• <strong>COMEDK:</strong> ~₹2,50,000 to ₹3,00,000 per year<br>• <strong>Management:</strong> Can exceed ₹10L depending on branch.<br><em>Note: Hostels cost an additional ₹1.1L - ₹1.3L per year.</em>",
            "Tuition fees depend on the admission quota:<br>• <strong>KCET:</strong> ~₹1,00,000 to ₹1,20,000 per year<br>• <strong>COMEDK:</strong> ~₹2,50,000 to ₹3,00,000 per year<br>• <strong>Management:</strong> ~₹16L to ₹70L total over 4 years.");
        r.buttons = [{l:'Admissions Info',a:'admissions',i:'🎓'}]; break;
    case 'placements':
        r.text += T("Our record is legendary! 🚀","Placement Statistics (2025 Batch):");
        r.text += "\n• Max: " + KB.placements.maxSalary + "\n• Avg: " + KB.placements.avgSalary + "\n• " + KB.placements.offers + "\n• " + KB.placements.companies + "\n• Top Recruiters: " + KB.placements.recruiters;
        r.text += T("\n\n📌 Previous batch (2024): ₹92 LPA highest, 917 offers, 75% rate","\n\nPrevious Year (2024): ₹92 LPA highest package, 249 companies, 917 offers with 75% placement rate.");
        r.buttons = [{l:'Placement Training',u:KB.placements.url,i:'🌐'}]; break;
    case 'refund_policy':
        r.text += T("Refund policy follows AICTE rules! 💸<br><br>• Before start: Full refund (-₹1k)<br>• After start: Only if seat filled<br>• Document retention is BANNED.",
            "The Fee Refund Policy strictly follows <strong>AICTE Regulations</strong>.<br><br>• <strong>Before Course Start:</strong> Full refund minus a processing fee (max ₹1,00,0).<br>• <strong>After Course Start:</strong> Refundable only if the vacated seat is filled.<br>• <strong>Original Docs:</strong> By AICTE mandate, colleges cannot retain original certificates.");
        break;
    case 'syllabus_1st_sem':
        r.text += T("1st Year Syllabus (VTU 2022 Scheme) 📚<br><br>Physics & Chemistry cycles apply! Key subjects include Math, Electronics, C-Programming.",
            "The <strong>1st Year B.E. Syllabus</strong> follows the VTU 2022 Scheme.<br><br>Students are divided into Physics and Chemistry Cycles. Key subjects include:<br>• Engineering Mathematics<br>• Basic Electronics/Electrical<br>• Programming in C");
        r.buttons = [{l:'Download Syllabus PDF',u:'https://rvce.edu.in/sites/default/files/FIRST-YEAR-SYLLABUS-BOOK-2022-SCHEMEFORPRINT.pdf',i:'📑'}]; break;
    case 'faculty':
        r.text += T("Are you looking for the Deans or Head of Departments (HODs)? 🧑‍🏫", "Please specify what you are looking for:");
        r.buttons = [{l:'Deans List 🎓',a:'deans_list',i:'👨‍🏫'},{l:'HODs List 📚',a:'hods_list',i:'👩‍🏫'}]; 
        r.noMenu = true; break;
    case 'deans_list':
        r.text += T("Here are the top commanders at RVCE! ⚓\n\n","RVCE Deans & Key Executives:\n\n");
        r.text += "• **Dean Academics:** Dr. Shanmukha Nagaraj\n• **Dean Student Affairs:** Dr. B.M. Sagar\n• **Dean R&D:** Dr. M Uttara Kumari\n• **Dean Placement & Training:** Dr. D. Ranganath\n• **Dean Skill Dev:** Dr. M Krishna";
        r.buttons = [{l:'HODs List 📚',a:'hods_list',i:'👩‍🏫'}, {l:'Key Executives Page',u:'https://rvce.edu.in/about_us/key-executives/',i:'🌐'}]; break;
    case 'hods_list':
        r.text += T("Here are the Heads of Departments (HODs): 📚\n\n","RVCE Head of Departments:\n\n");
        r.text += "• **CSE:** Dr. Shanta Rangaswamy\n• **AIML:** Dr. Sathish Babu B\n• **ISE:** Dr. Mamatha G S\n• **ECE:** Dr. Ravish Aradhya H V\n• **Mechanical:** Dr. Shanmukha N\n• **Civil:** Dr. Anjaneyappa\n• **EEE:** Dr. J N Hemalatha\n• **Aerospace:** Dr. Supreeth R\n• **Biotech:** Dr. Nagashree N Rao\n• **Chemical:** Dr. Jagadish H Patil\n• **MCA:** Dr. Jasmine K S\n• **Physics:** Dr. Shireesha Golla\n• **Maths:** Dr. Jayalatha G\n• **Chemistry:** Dr. Mahesh R";
        r.buttons = [{l:'Deans List 🎓',a:'deans_list',i:'👨‍🏫'}, {l:'Key Executives Page',u:'https://rvce.edu.in/about_us/key-executives/',i:'🌐'}]; break;
    case 'dress_code':
        r.text += T("Dress sharp! 👔 No shorts or ripped jeans. Casuals are okay, but labs require safety gear (Khakis/Aprons)!",
            "As an institution affiliated with <strong>VTU</strong>, RVCE enforces a dress code that aligns with professional and academic decorum.<br><br>• <strong>General Wear:</strong> Clean, neat, and non-revealing casual wear is permitted.<br>• <strong>Prohibited:</strong> Shorts, ripped jeans, revealing tops.<br>• <strong>Labs/Workshops:</strong> Closed-toe shoes and safety uniforms mandatory.");
        break;
    case 'anti_ragging':
        r.text += T("Ragging is a crime! 🛑 Total ban at RVCE.<br><br>🚨 National Helpline: 1800-180-5522",
            "RVCE strictly adheres to the <strong>UGC Regulations on Curbing the Menace of Ragging (2009)</strong>. Ragging is a criminal offense.<br><br>🚨 <strong>National 24x7 Anti-Ragging Helpline:</strong> 1800-180-5522<br>Email: helpline@antiragging.in");
        r.buttons = [{l:'Anti-Ragging Portal',u:'https://www.antiragging.in/',i:'🛑'}]; break;
    case 'innovationTeams':
        r.text += T("RVCE = Innovation! 💡 Join a team:","Innovative Student Teams:");
        r.text += "\n• " + KB.campus.teams.join("\n• ");
        r.buttons = [{l:'See Innovation',u:KB.campus.urls.innovation,i:'🌐'}]; break;
    case 'culturalLife':
        r.text += T("Student life is more than classes! 🎭","Cultural Activities & Clubs:");
        r.text += "\n• Clubs: " + KB.campus.clubs.join(", ") + "\n• Fest: " + KB.campus.fest;
        r.buttons = [{l:'Cultural Teams',u:KB.campus.urls.cultural,i:'🌐'}]; break;
    case 'contact':
        r.text += T("Here's how to reach RVCE! 📞","Contact Information:");
        r.text += "\n📍 "+KB.contact.address+"\n📱 "+KB.contact.phone+"\n📧 "+KB.contact.email+"\n🎓 Admissions: "+KB.contact.admissionPhone;
        r.buttons = [{l:'Website',u:KB.contact.website,i:'🌐'},{l:'Email',u:'mailto:'+KB.contact.email,i:'📧'}]; break;
    case 'website':
        r.text += T("Here you go! 🌐","Official Website:");
        r.buttons = [{l:'rvce.edu.in',u:KB.contact.website,i:'🌐'}]; break;
    case 'intake':
        r.text += T("RVCE admits 2000+ students every year! 🎓","Annual intake: "+KB.general.intake+"."); break;
    case 'ug_disambiguation':
        r.text += T("Academic explorer! 🗺️ Are you looking to see the **Programmes List** or do you need **Admission Details** for UG?","Would you like to explore Undergraduate (B.E.) Programmes or check Admission Details?");
        r.buttons = [
            {l:'Programmes List 📜',a:'ugPrograms',i:'📋'},
            {l:'Admission Process 🎓',a:'ugAdm',i:'🎫'}
        ]; 
        return r;
    case 'ugPrograms':
        r.text += T("RVCE offers 16 Undergraduate (B.E.) programs. Choose a category:","RVCE offers 16 UG programs. Select a category below:");
        r.buttons = [
            {l:'Computing & IT 💻',a:'dept_group_comp',i:'💻'},
            {l:'Electrical & Comm 🔌',a:'dept_group_elec',i:'🔌'},
            {l:'Core Engineering ⚙️',a:'dept_group_core',i:'⚙️'},
            {l:'Applied Sciences 🧬',a:'dept_group_sci',i:'🧬'}
        ];
        r.noMenu = true; break;
    case 'pgPrograms':
        r.text += T("RVCE offers 14 Postgraduate programs. Choose a category to find your program:","RVCE offers 14 PG programs. Select a category below:");
        r.buttons = [
            {l:'Computing & IT 💻',a:'pg_group_comp',i:'💻'},
            {l:'Electrical & Comm 🔌',a:'pg_group_elec',i:'🔌'},
            {l:'Core Engineering ⚙️',a:'pg_group_core',i:'⚙️'},
            {l:'Applied Sciences 🧬',a:'pg_group_sci',i:'🧬'}
        ];
        r.noMenu = true; break;
    case 'pg_group_comp':
        r.text += T("M.Tech & MCA Computing Programs:","PG Computing Programs:");
        r.buttons = [{l:'M.Tech CSE',a:'pg_cs_cse',i:'💻'},{l:'M.Tech CNE',a:'pg_cs_cne',i:'💻'},{l:'M.Tech Software Engg',a:'pg_is_se',i:'💻'},{l:'M.Tech Info Tech',a:'pg_is_it',i:'💻'},{l:'MCA',a:'pg_mca',i:'💻'}];
        r.noMenu = true; break;
    case 'pg_group_elec':
        r.text += T("M.Tech Electrical & Communication:","PG Electrical & Communication:");
        r.buttons = [{l:'M.Tech VLSI',a:'pg_ec_vlsi',i:'🔌'},{l:'M.Tech Comm Sys',a:'pg_ec_cs',i:'📡'},{l:'M.Tech Digital Comm',a:'pg_et_dc',i:'📱'},{l:'M.Tech Power Electronics',a:'pg_ee_pe',i:'⚡'}];
        r.noMenu = true; break;
    case 'pg_group_core':
        r.text += T("M.Tech Core Engineering:","PG Core Engineering:");
        r.buttons = [{l:'M.Tech Structural',a:'pg_cv_se',i:'🏗️'},{l:'M.Tech Highway',a:'pg_cv_ht',i:'🛣️'},{l:'M.Tech Product Design',a:'pg_me_pd',i:'⚙️'},{l:'M.Tech Machine Design',a:'pg_me_md',i:'🏭'}];
        r.noMenu = true; break;
    case 'pg_group_sci':
        r.text += T("M.Tech Applied Sciences:","PG Applied Sciences:");
        r.buttons = [{l:'M.Tech Biotechnology',a:'pg_bt',i:'🧬'}];
        r.noMenu = true; break;
    case 'mca':
        return renderDepartment(KB.departments.pg.find(d => d.c === 'mca'));
    case 'sports':
        r.text += T("Stay fit and active at RVCE! 🏃‍♂️🏆\n\nThe Department of Physical Education & Sports provides excellent facilities for indoor and outdoor games. RVCE students regularly participate in VTU, State, and National level tournaments.",
            "Department of Physical Education & Sports:\nRVCE provides comprehensive sports facilities and scholarships for outstanding athletes.");
        r.buttons = [
            {l:'Sports Dept Page',u:'https://rvce.edu.in/department-of-physical-education-sports/',i:'🌐'},
            {l:'Sports Scholarships',u:'https://rvce.edu.in/department-of-physical-education-sports/rvce-sports-scholarship/',i:'🏅'},
            {l:'VTU Tournaments',u:'https://rvce.edu.in/department-of-physical-education-sports/v-t-u-tournament-organized/',i:'🏆'}
        ];
        break;
    case 'phd':
        r.text += T("Doctoral Programs (Ph.D.) 🧪:","Research Programs:");
        r.text += "\n• " + KB.admissions.phd.info;
        r.buttons = [{l:'Research Centres',a:'research',i:'🔬'},{l:'PhD Admissions',u:'https://rvce.edu.in/admissions/#ph_link',i:'🌐'}]; break;
    case 'departments':
        r.text += T("Explore our departments! 📚 Choose a level of study:","Academic Departments - Select a level of study:");
        r.buttons = [
            {l:'UG Programs (B.E.) 🎓',a:'ugPrograms',i:'🎓'},
            {l:'PG Programs 📘',a:'pgPrograms',i:'📘'},
            {l:'Ph.D. Programs 🧪',a:'phd',i:'🧪'}
        ];
        r.noMenu = true;
        break;
    case 'dept_group_comp':
        r.text += T("Computing & IT Branches:","Computing & IT:");
        r.buttons = [{l:'CSE',a:'dept_cs',i:'💻'},{l:'ISE',a:'dept_is',i:'💻'},{l:'AIML',a:'dept_aiml',i:'💻'},{l:'Data Science',a:'dept_csds',i:'📊'},{l:'Cyber Security',a:'dept_cscy',i:'🛡️'}];
        r.noMenu = true; break;
    case 'dept_group_elec':
        r.text += T("Electrical & Communication Branches:","Electrical & Communication:");
        r.buttons = [{l:'ECE',a:'dept_ec',i:'🔌'},{l:'EEE',a:'dept_ee',i:'⚡'},{l:'EIE',a:'dept_ei',i:'📡'},{l:'Telecom (ETE)',a:'dept_et',i:'📱'}];
        r.noMenu = true; break;
    case 'dept_group_core':
        r.text += T("Core Engineering & Manufacturing Branches:","Core Engineering:");
        r.buttons = [{l:'Mechanical',a:'dept_me',i:'⚙️'},{l:'Civil',a:'dept_cv',i:'🏗️'},{l:'Aerospace',a:'dept_ae',i:'🚀'},{l:'Industrial (IEM)',a:'dept_im',i:'🏭'}];
        r.noMenu = true; break;
    case 'dept_group_sci':
        r.text += T("Applied Sciences Branches:","Applied Sciences:");
        r.buttons = [{l:'Biotechnology',a:'dept_bt',i:'🧬'},{l:'Chemical',a:'dept_ch',i:'🧪'},{l:'Chemistry',a:'dept_chy',i:'🧪'},{l:'Mathematics',a:'dept_mat',i:'📐'},{l:'Physics',a:'dept_phy',i:'⚛️'}];
        r.noMenu = true; break;
    case 'campusLife':
        r.text += T("Life at RVCE is vibrant! 🏕️","Student Experience & Campus Life:");
        r.text += "\n• Cultural Clubs & Kannada Sangha\n• Technical Innovation Teams & STEAM\n• Sports & Athletics\n• NCC & NSS Units\n• Annual Fest: " + KB.campus.fest;
        r.buttons = [
            {l:'Cultural Clubs',a:'culturalLife',i:'🎭'},
            {l:'Innovation Teams',a:'innovationTeams',i:'💡'},
            {l:'Sports & Athletics',a:'sports',i:'🏆'},
            {l:'NCC & NSS',a:'ncc_nss_disambiguation',i:'🤝'}
        ]; break;
    case 'professional_societies':
        r.text += T("Get professional! 🤝 Join a chapter:","Professional Student Societies:");
        r.text += "\n• " + KB.campus.societies.join("\n• ") + "\n\nThese chapters host international conferences, workshops, and networking events regularly.";
        r.buttons = [{l:'Innovation Teams',a:'innovationTeams',i:'💡'},{l:'Cultural Clubs',a:'culturalLife',i:'🎭'}]; break;
    case 'hostels':
        r.text += T("Home away from home 🏠:","Hostel Facilities:");
        r.text += "\n• Boys: " + KB.hostels.boys + "\n• Girls: " + KB.hostels.girls + "\n• Amenities: " + KB.hostels.amenities;
        r.buttons = [{l:'See Facilities',u:KB.hostels.url,i:'🌐'}]; break;
    case 'stats_disambiguation':
        r.text += T("Check out the numbers! 📊","RVCE Statistics:");
        r.buttons = [{l:'Placement Stats',a:'placements',i:'💼'},{l:'NIRF & Rankings',a:'ranking',i:'🏆'},{l:'Upcoming Events 📅',a:'upcoming_events',i:'🔥'}]; break;
    case 'upcoming_events':
        r.text += T("What's brewing at RVCE? 📅","Upcoming Events Calendar 2026:");
        KB.events.forEach(e => {
            r.text += `\n• **${e.name}** — ${e.date} (${e.type})`;
        });
        r.buttons = [{l:'Placement Scene',a:'placements',i:'💼'},{l:'Main Menu',a:'menu',i:'📋'}]; break;
    case 'facilities':
        r.text += T("Top-notch facilities 🏢:","Campus Infrastructure:");
        r.text += "\n• " + KB.facilities.list.join("\n• ");
        r.buttons = [{l:'Full Details',u:KB.facilities.url,i:'🌐'}]; break;
    case 'vtu':
        r.text += T("VTU affiliated but autonomous for UG! 🏛️","RVCE is affiliated to VTU (Visvesvaraya Technological University) and has Autonomous status for UG programs."); break;
    case 'transport':
        r.text += T("Getting to RVCE 🚌:\n• Located on Mysuru Road, ~13 km from city center\n• BMTC buses: Multiple routes to RVCE stop\n• Nearest Metro: Kengeri station\n• Autos & cabs: Easily available\n• Near NICE Road junction",
            "How to Reach RVCE:\n• Location: Mysuru Road, ~13 km from Bengaluru city center\n• Bus: BMTC bus routes serve the RVCE stop directly\n• Metro: Kengeri Metro station is the nearest\n• Auto/Cab: Easily accessible via Mysuru Road\n• Near NICE Road junction"); break;
    case 'wifi':
        r.text += T("Yes! Wi-Fi everywhere! 📶 Campus + Hostels!","Wi-Fi is available across the campus and in hostel blocks."); break;
    case 'food':
        r.text += T("Hungry? 🍛 RVCE has a food court + veg mess in hostels. Plenty of options around too!","RVCE has a food court on campus and vegetarian mess in hostels. Multiple eateries are also available nearby."); break;
    case 'exam':
        r.text += T("Exams? 📝 Semester system with CIE + SEE. Being autonomous, RVCE sets its own papers!","RVCE follows a semester system with Continuous Internal Evaluation (CIE) and Semester End Examination (SEE). As an autonomous institution, it designs its own syllabus and sets examination papers."); break;
    case 'nri':
        r.text += T("International students welcome! 🌍 CIWG/PIO/OCI/Nepal quotas available!","International admissions: Quotas available for CIWG, PIO, OCI, and Nepal Citizens.");
        r.buttons = [{l:'Admissions',u:KB.admissions.url,i:'🌐'}]; break;
    case 'library':
        r.text += T("The Central Library is a knowledge fortress! 📚","Central Library:");
        r.text += "\n• 1,00,000+ books, journals, and e-resources\n• Digital library with IEEE, Springer, Elsevier, NPTEL access\n• Reading rooms and group study areas\n• Reprography, book bank, and reference section\n• Open during college hours (Mon-Sat)";
        r.buttons = [{l:'Library Portal',u:'https://rvce.edu.in/library/',i:'🌐'}]; break;
    case 'ncc_nss_disambiguation':
        r.text += T("Service and Leadership! 🇮🇳 Choose a unit:","NCC & NSS Units:");
        r.buttons = [{l:'NCC 🇮🇳',a:'ncc',i:'🎖️'},{l:'NSS 🤝',a:'nss',i:'🌍'}]; break;
    case 'ncc':
        r.text += T("Join the National Cadet Corps (NCC) at RVCE! 🇮🇳","National Cadet Corps (NCC):");
        r.text += "\n• " + KB.ncc.battalion + " (Est. " + KB.ncc.established + ")\n• Strength: " + KB.ncc.strength + "\n• Activities: " + KB.ncc.activities;
        r.buttons = [{l:'NCC Page',u:'https://rvce.edu.in/ncc/',i:'🌐'}]; break;
    case 'nss':
        r.text += T("Service before self! 🤝 Join the NSS at RVCE.","National Service Scheme (NSS):");
        r.text += "\n• " + KB.nss.units + " with " + KB.nss.strength + "\n• Motto: " + KB.nss.motto + "\n• Activities: " + KB.nss.activities;
        r.buttons = [{l:'NSS Page',u:'https://rvce.edu.in/national_service_scheme_nss/',i:'🌐'}]; break;
    case 'kannada_sangha':
        r.text += T("Promoting the heritage of Karnataka! 🎭","Kannada Sangha:");
        r.text += "\n• " + KB.kannadaSangha.info + "\n• Events: " + KB.kannadaSangha.events;
        r.buttons = [{l:'Kannada Sangha',u:'https://rvce.edu.in/cultural_teams/kannada_sangha/',i:'🎭'}]; break;
    case 'rvjsteam':
        r.text += T("Science, Technology, Engineering, Arts, and Mathematics! 🎨","RVJ STEAM Team:");
        r.text += "\n• " + KB.rvjsteam.info;
        r.buttons = [{l:'STEAM Team Page',u:'https://rvce.edu.in/rvjsteam/',i:'🌐'}]; break;
    case 'mandatory_disclosure':
        r.text += T("Official compliance and disclosures. 📄","Mandatory Disclosure:");
        r.buttons = [{l:'View Disclosure',u:'https://rvce.edu.in/mandatory-disclosure/',i:'📄'}]; break;
    case 'calendar_events':
        r.text += T("Don't miss out on important dates! 📅","Calendar of Events:");
        r.buttons = [{l:'Calendar of Events',u:'https://rvce.edu.in/calendar-of-events/',i:'📅'}]; break;
    case 'sports_simple':
        r.text += T("Sporty campus! 🏅","Sports Facilities:");
        r.text += "\n• 400m athletic track\n• Cricket & Football grounds\n• Basketball, Volleyball, Badminton courts\n• Gymnatorium with modern equipment\n• Table Tennis, Chess";
        r.buttons = [{l:'Sports Info',u:'https://rvce.edu.in/facilities/sports_and_gymnatorium/',i:'🌐'}]; break;
    case 'autonomous':
        r.text += T("RVCE is autonomous for UG — they design their own syllabus and exams! 📋 For PG, it's affiliated to VTU.","RVCE has Autonomous status for UG programs, meaning it designs its own curriculum and conducts its own examinations. PG programs are affiliated to VTU."); break;
    // ===== PARENT & GEN-Z SPECIFIC RESPONSES =====
    case 'safety':
        r.text += T("Your safety is top priority at RVCE! 🛡️","Campus Safety at RVCE:");
        r.text += "\n• " + KB.safety.cctv + "\n• " + KB.safety.wardens + "\n• " + KB.safety.healthCentre + "\n• " + KB.safety.grievance + "\n• " + KB.safety.antiRagging;
        r.buttons = [{l:'Health Centre Details 🏥',a:'health_centre',i:'🩺'},{l:'Anti-Ragging',a:'anti_ragging',i:'🛑'}]; break;
    case 'health_centre':
        r.text += T("Health is wealth! 🏥 The on-campus centre is solid:","Health Centre Facilities:");
        r.text += "\n• " + KB.safety.healthDetails.doctor + "\n• Services: " + KB.safety.healthDetails.services.join(", ") + "\n• Partnership: " + KB.safety.healthDetails.hospital + "\n• 24/7 Ambulance available for emergencies.";
        r.buttons = [{l:'Safety Info',a:'safety',i:'🛡️'}]; break;
    case 'attendance':
        r.text += T("Attendance matters at RVCE! 📋 It's strict but keeps you on track!","Attendance Policy:");
        r.text += "\n• " + KB.attendance.requirement + "\n• " + KB.attendance.consequence + "\n• " + KB.attendance.tracking;
        break;
    case 'roi':
        r.text += T("Is RVCE paisa vasool? ABSOLUTELY! 💎\n\n","Return on Investment:\n\n");
        r.text += "• 2025 Highest Package: " + KB.placements2025.maxSalary + "\n• Avg Package: " + KB.placements2025.avgSalary + "\n• " + KB.placements2025.companies + "\n• Top recruiters: Google, Microsoft, Amazon, Goldman Sachs\n• 100+ Patents, 20 Centres of Excellence\n• NAAC A+ accreditation";
        r.buttons = [{l:'Placements',a:'placements',i:'💼'},{l:'Fee Structure',a:'fees',i:'💰'}]; break;
    case 'girls_hostel':
        r.text += T("Girls hostel deets! 🏠 Safe & well-managed!","Girls Hostel Information:");
        r.text += "\n• DJ Block (On-campus): " + KB.hostelDetails.girlsBlocks.djBlock + "\n• Krishna Garden (Off-campus, Pattanagere): " + KB.hostelDetails.girlsBlocks.krishnaGarden + "\n• Fees (Triple): " + KB.hostelDetails.fees.tripleSharing + "\n• Fees (Double): " + KB.hostelDetails.fees.doubleSharing + "\n• Facilities: " + KB.hostelDetails.facilities + "\n• Residential wardens & CCTV in all blocks\n• Strict curfew timings enforced for safety";
        r.buttons = [{l:'Safety Info',a:'safety',i:'🛡️'},{l:'All Hostels',a:'hostels',i:'🏠'}]; break;
    case 'nearby':
        r.text += T("What's around RVCE? Plenty! 📍","Nearby Areas & Amenities:");
        r.text += "\n• Areas: " + KB.nearby.areas + "\n• Food: " + KB.nearby.food + "\n• Shopping: " + KB.nearby.shopping + "\n• Hospitals: " + KB.nearby.hospitals + "\n• Connectivity: " + KB.nearby.connectivity;
        r.buttons = [{l:'Transport',a:'transport',i:'🚌'},{l:'Food Court',a:'food',i:'🍛'}]; break;
    case 'internship':
        r.text += T("Internships? RVCE students are everywhere! 🧑‍💻","Internship Opportunities:");
        r.text += "\n• Mandatory 6-8 week industry internship in curriculum\n• Placement & Training cell assists with internship placements\n• Top companies like Google, Microsoft, Amazon, Bosch offer internships\n• Being in Bangalore (India's tech capital) = tons of opportunities\n• Many students do internships at IITs, IISc, DRDO, ISRO";
        r.buttons = [{l:'Placements',a:'placements',i:'💼'},{l:'Innovation Teams',a:'innovationTeams',i:'💡'}]; break;
    case 'startup':
        r.text += T("Startup vibes are real at RVCE! 🚀","Entrepreneurship & Startup Ecosystem:");
        r.text += "\n• Active E-Cell (Entrepreneurship Cell) organizes events & workshops\n• Innovation & Incubation Centre for student startups\n• Annual hackathons and startup pitch competitions\n• Bangalore = India's startup capital — perfect ecosystem\n• Many RVCE alumni have founded successful startups";
        r.buttons = [{l:'Innovation Teams',a:'innovationTeams',i:'💡'},{l:'Campus Life',a:'campusLife',i:'🏕️'}]; break;
    case 'peer_quality':
        r.text += T("The crowd at RVCE is top-tier! 🎯 Competitive AF but also super helpful!","Peer Quality at RVCE:");
        r.text += "\n• Highly competitive admission (KCET/COMEDK) ensures quality intake\n• 2000+ students admitted annually from top rank holders\n• Strong coding culture — students participate in ICPC, GSoC, hackathons\n• Active on competitive platforms (Codeforces, LeetCode, CodeChef)\n• Collaborative environment with study groups and project teams";
        r.buttons = [{l:'Placements',a:'placements',i:'💼'},{l:'Rankings',a:'ranking',i:'🏆'}]; break;
    case 'worth_it':
        r.text += T("Is RVCE worth it? Let me put it this way — it SLAPS! 🔥\n\n","Is RVCE Worth Joining?\n\n");
        r.text += "✅ NAAC A+ | NIRF 101-150 | #1 Private (IIRF)\n✅ 2025: ₹67 LPA highest, 260+ companies\n✅ 2024: ₹92 LPA highest, 75% placement rate\n✅ Autonomous (own syllabus, industry-relevant)\n✅ Bangalore location = internship & job hub\n✅ 100+ patents, 20 Centres of Excellence\n✅ Strong alumni network in top MNCs";
        r.buttons = [{l:'Placements',a:'placements',i:'💼'},{l:'Rankings',a:'ranking',i:'🏆'},{l:'ROI',a:'roi',i:'💎'}]; break;
    case 'best_branch':
        r.text += T("Which branch is the GOAT? 🔝 Here's the lowdown:","Branch Selection Guide:");
        r.text += "\n\n🔥 **Highest Demand (Top Packages):** CSE, ISE, AIML, CSDS, CSCY\n💻 **Strong Tech:** ECE, ETE (with good coding skills)\n⚙️ **Core Engineering:** Mech, Civil, EEE, Chemical, Aero (strong in core companies like Bosch, ABB, Boeing)\n🧬 **Niche:** Biotech, IEM\n\n💡 Tip: Branch matters less than what YOU do — coding skills, projects, and internships make the real difference!";
        r.buttons = [{l:'All Departments',a:'departments',i:'📚'},{l:'Placements',a:'placements',i:'💼'}]; break;
    case 'parking':
        r.text += T("Got a ride? 🅿️ RVCE has parking!","Vehicle & Parking Info:");
        r.text += "\n• Dedicated two-wheeler and four-wheeler parking areas\n• Bikes and scooties are commonly used by students\n• Parking is free for students with valid college ID\n• Helmets mandatory as per campus rules";
        break;
    case 'part_time':
        r.text += T("Side hustle while studying? Smart move! 💼","Part-Time Work Opportunities:");
        r.text += "\n• Bangalore has tons of freelancing and part-time opportunities\n• Many students freelance in web dev, graphic design, tutoring\n• Coding contests and hackathons often have cash prizes\n• Some students do remote internships alongside studies\n• Note: Academic workload at RVCE is heavy — balance wisely!";
        r.buttons = [{l:'Internships',a:'internship',i:'🧑‍💻'},{l:'Startup Culture',a:'startup',i:'🚀'}]; break;
    case 'alumni':
        r.text += T("RVCE alumni are EVERYWHERE — from Google to ISRO! 🤝","Alumni Network:");
        r.text += "\n• 60+ years of alumni across the globe (Est. 1963)\n• Strong presence in top tech companies (Google, Microsoft, Amazon, Flipkart)\n• Active alumni chapters in Bangalore, Mumbai, USA, Europe\n• Alumni mentorship programs for current students\n• Regular alumni meets and networking events\n• Many alumni are founders of successful startups";
        r.buttons = [{l:'Alumni Portal',u:'https://rvce.edu.in/alumni-2/',i:'🎓'}, {l:'Placements',a:'placements',i:'💼'},{l:'About RVCE',a:'about_disambiguation',i:'🏫'}]; break;
    case 'college_compare':
        r.text += T("RVCE vs others? Here's the tea ☕:","RVCE in Comparison:");
        r.text += "\n\n📊 **RVCE Strengths:**\n• #1 Private Engg College (IIRF 2025)\n• NAAC A+ (higher than most private colleges)\n• Autonomous status — industry-relevant curriculum\n• ₹67 LPA highest (2025), ₹92 LPA (2024)\n• 260+ companies visit campus\n\n🏛️ RVCE is consistently ranked alongside PES, MSRIT, and BMS as Bangalore's top private engineering colleges. It edges ahead in autonomy, research output, and industry connections.";
        r.buttons = [{l:'Rankings',a:'ranking',i:'🏆'},{l:'Placements',a:'placements',i:'💼'},{l:'Is It Worth It?',a:'worth_it',i:'⭐'}]; break;
    case 'menu':
        r.text = T("How can I help? Choose a topic:","Main Menu — Choose a topic:");
        r.noMenu = true; return r;
    default:
        // Handle department-specific HOD requests
        if (id && id.startsWith('hod_')) {
            const c = id.replace('hod_','');
            const d = KB.departments.ug.find(x=>x.c===c) || KB.departments.pg.find(x=>x.c===c);
            if (d && d.hod) {
                if (d.hod_bio) return renderHODCard(d);
                r.text += T(`The Head of Department for ${d.n} is **${d.hod}**! 👨‍🏫`, `The HOD for **${d.n}** is **${d.hod}**.`);
                r.buttons = [{l:'Department Page',u:d.u,i:'🌐'}, {l:'All HODs',a:'hods_list',i:'👩‍🏫'}];
                return r;
            } else {
                r.text += T(`I don't have the specific HOD name for ${d?d.n:c} saved. Let me show you the full list! 📚`, "Please check the full HODs list for that information.");
                r.buttons = [{l:'HODs List',a:'hods_list',i:'👩‍🏫'}, {l:'Key Executives',u:'https://rvce.edu.in/about_us/key-executives/',i:'🌐'}];
                return r;
            }
        }
        // Handle specific faculty profile requests
        if (id && id.startsWith('fac_')) {
            const slug = id.replace('fac_', '');
            let facultyMember = null;
            let deptCode = null;
            
            for (const dk in KB.faculty) {
                const found = KB.faculty[dk].find(f => f.n.toLowerCase().replace(/[^a-z0-9]/g, '') === slug);
                if (found) { facultyMember = found; deptCode = dk; break; }
            }

            if (facultyMember) {
                const dept = KB.departments.ug.find(d=>d.c===deptCode) || KB.departments.pg.find(d=>d.c===deptCode);
                const deptName = facultyMember.dept || (dept ? dept.n : deptCode.toUpperCase());
                
                r.text += T(`**${facultyMember.n}** 👨‍🏫\n\nRole: ${facultyMember.r}\nDepartment: ${deptName}\n\nYou can view their detailed institutional profile below:`, 
                            `Faculty Profile: **${facultyMember.n}**\nDesignation: ${facultyMember.r}\nDepartment: ${deptName}`);
                r.buttons = [{l:'View Full Profile 👤',u:facultyMember.u,i:'🌐'}];
                if (dept) r.buttons.push({l:'Department Page',a:'dept_'+dept.c,i:'🏢'});
                return r;
            }
        }
        // Handle department links
        if (id && id.startsWith('dept_')) {
            const c = id.replace('dept_','');
            const d = KB.departments.ug.find(x=>x.c===c);
            if (d) { 
                let msg = T(`**${d.n}** 🎯\n👨‍🏫 HOD: ${d.hod}\n`,`Department: ${d.n}\nHOD: ${d.hod}\n`);
                if (d.info) msg += `\n*${d.info}*\n`;
                msg += T(`\nSelect what you'd like to explore below:`,`\nExplore options:`);
                r.text += msg;
                r.buttons = [{l:'Main Page',u:d.u,i:'🌐'}];
                if (d.about) r.buttons.push({l:'About Dept',u:d.about,i:'ℹ️'});
                if (d.syllabus) r.buttons.push({l:'Syllabus',u:d.syllabus,i:'📚'});
                if (d.faculty) r.buttons.push({l:'Faculty',u:d.faculty,i:'👨‍🏫'});
                if (d.placement) r.buttons.push({l:'Placements',u:d.placement,i:'💼'});
                if (d.labs) r.buttons.push({l:'Labs/Facilities',u:d.labs,i:'🧪'});
                r.buttons.push({l:'All Departments',a:'departments',i:'🔙'});
                return r; 
            }
        }
        // Handle PG program links
        if (id && id.startsWith('pg_')) {
            const c = id.replace('pg_','');
            const d = KB.departments.pg.find(x=>x.c===c);
            if (d) { 
                r.text += T(d.n+" looks interesting! 🚀","Postgraduate Program: "+d.n);
                r.buttons = [{l:'Program Page',u:d.u,i:'🌐'},{l:'PG Programs',a:'pgPrograms',i:'📘'}];
                return r; 
            }
        }
        r.text = T("Hmm 🤔 I didn't get that. Try one of these:","I didn't understand that query. Here are some options:");
        r.noMenu = true; return r;
    }

    // Append dynamic follow-up suggestions
    const followUps = getFollowUps(id);
    if (!r.noMenu) {
        r.buttons = [...(r.buttons || []), ...followUps];
    }

    return r;
}

/* =============== DOM =============== */
const $=s=>document.getElementById(s);
const chatW=$('chatWindow'),fab=$('chatFab'),badge=$('fabBadge'),msgs=$('chatMessages');
const typing=$('typingIndicator'),inp=$('userInput'),sendB=$('sendBtn');
const toneS=$('toneSwitch'),toneL=$('toneLabel'),emojiB=$('emojiBtn'),micB=$('micBtn'),sugs=$('quickSuggestions'),clearB=$('clearBtn');

fab.addEventListener('click',()=>{chatOpen=!chatOpen;chatW.classList.toggle('open',chatOpen);fab.classList.toggle('active',chatOpen);fab.setAttribute('aria-expanded',chatOpen);if(chatOpen){badge.classList.add('hidden');inp.focus();} if(typeof saveState!=='undefined')saveState();});
toneS.addEventListener('click',()=>{tone=tone==='funny'?'pro':'funny';toneS.classList.toggle('pro',tone==='pro');toneS.setAttribute('aria-checked',tone==='pro');toneL.textContent=tone==='funny'?'Buddy':'Pro'; if(typeof saveState!=='undefined')saveState();});
toneS.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toneS.click();}});
emojiB.addEventListener('click',()=>{disOld();showMenu();});
sugs.querySelectorAll('.suggestion-chip').forEach(c=>c.addEventListener('click',()=>process(c.dataset.query)));
sendB.addEventListener('click',()=>{const t=inp.value.trim();if(t)process(t);});
inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const t=inp.value.trim();if(t)process(t);}});
if(clearB) clearB.addEventListener('click', () => {
    msgs.innerHTML = '';
    SafeStorage.removeItem('rvce_chat_html');
    saveState();
    setTimeout(() => {
        addBot(T("Hey there! 👋 Welcome to RVCE — the place where engineers are crafted! Ask me anything about admissions, placements, campus, and more!","Hello! Welcome to RV College of Engineering. I'm here to help you with information about admissions, placements, campus facilities, and more."),[],true);
        setTimeout(showMenu,900);
    }, 200);
});

/* =============== VOICE RECOGNITION =============== */
let recognition;
let isRecording = false;
let isVoiceInteraction = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        micB.classList.add('recording');
        inp.placeholder = "Listening... 🎤";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inp.value = transcript;
        isVoiceInteraction = true;
        setTimeout(() => process(transcript), 500);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
    };

    recognition.onend = () => {
        stopRecording();
    };
}

function stopRecording() {
    isRecording = false;
    if(recognition) recognition.stop();
    micB.classList.remove('recording');
    inp.placeholder = "Ask me anything about RVCE...";
}

micB.addEventListener('click', () => {
    if (!recognition) {
        alert("Speech Recognition not supported in this browser. Try Chrome!");
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        recognition.start();
    }
});

/* =============== TELEMETRY & QUEUE =============== */
const telemetryQueue = [];
function processTelemetryQueue() {
    if (typeof rvceChatbotAjax === 'undefined' || !rvceChatbotAjax || !rvceChatbotAjax.ajaxUrl || !navigator.onLine || telemetryQueue.length === 0) return;
    const item = telemetryQueue[0];
    const formData = new FormData();
    formData.append('action', 'rvce_log_chat');
    formData.append('query', item.query);
    formData.append('intent_id', item.intent);
    fetch(rvceChatbotAjax.ajaxUrl, { method: 'POST', body: formData })
        .then(r => { if(r.ok) { telemetryQueue.shift(); processTelemetryQueue(); } })
        .catch(() => {}); // Keep in queue if it fails
}

function logChatInteraction(query, intent_id) {
    telemetryQueue.push({query, intent: intent_id});
    processTelemetryQueue();
}

let isProcessing = false;
function process(rawText) {
    if(isProcessing) return;
    if(!navigator.onLine) {
        addBotWarn(T("Oops! You seem to be offline. Please check your connection. 📶", "No internet connection detected. Please check your network and try again."));
        return;
    }
    const text = rawText.trim().substring(0, 250);
    if(!text) return;

    isProcessing = true;
    setTimeout(() => { isProcessing = false; }, 1000); // 1-second debounce

    // MODERATION CHECK — runs BEFORE intent matching (use original text)
    const mod = checkModeration(text);
    if (mod.blocked) {
        logChatInteraction(text, 'moderated_' + mod.type);
        addUser(text);
        inp.value = '';
        disOld();
        showTyp();
        setTimeout(()=>{hideTyp();addBotWarn(getModerationResponse(mod.type));},600);
        return;
    }

    // Always show the user's actual input text (no auto-replacement)
    addUser(text);
    inp.value = '';
    disOld();

    // Classify the intent with confidence detection
    const result = classifyIntent(text);

    // === MULTI-TURN CONTEXT HANDLING ===
    if (result.type === 'context') {
        logChatInteraction(text, result.id);
        const ctxId = result.id;

        if (ctxId === '_more') {
            // "Tell me more" — provide deeper info on last topic
            if (SESSION.lastIntent) {
                const deepInfo = getDeepInfo(SESSION.lastIntent);
                if (deepInfo) { botReply(deepInfo); return; }
            }
            // Fallback: show menu
            botReply({ text: T("I'd love to tell you more! What topic are you interested in? 🤔","What topic would you like more information about?"), buttons: [], noMenu: true });
            setTimeout(showMenu, 600);
            return;
        }

        if (ctxId === '_back') {
            // Go back to previous topic
            if (SESSION.navStack.length > 1) {
                SESSION.navStack.pop(); // Remove current
                const prevId = SESSION.navStack[SESSION.navStack.length - 1];
                SESSION.lastIntent = prevId;
                botReply(getResponse(prevId));
            } else {
                botReply({ text: T("Let's go back to the main menu! 📋","Returning to the main menu."), buttons: [], noMenu: true });
                setTimeout(showMenu, 600);
            }
            return;
        }

        if (ctxId === '_what_else') {
            // Show related topics
            if (SESSION.lastIntent) {
                const related = getRelatedTopics(SESSION.lastIntent);
                botReply(related);
            } else {
                setTimeout(showMenu, 300);
            }
            return;
        }

        if (ctxId === '_yes') {
            // Affirmative — re-run last intent or show menu
            if (SESSION.lastIntent && SESSION.lastIntent !== 'greet') {
                const deepInfo = getDeepInfo(SESSION.lastIntent);
                if (deepInfo) { botReply(deepInfo); return; }
            }
            setTimeout(showMenu, 300);
            return;
        }

        if (ctxId === '_no') {
            botReply({ text: T("No worries! Let me know if you need anything else 😊","Understood. Feel free to ask about any other topic."), buttons: [], noMenu: true });
            setTimeout(showMenu, 800);
            return;
        }
    }

    if (result.type === 'exact') {
        logChatInteraction(text, result.id);
        // Track navigation history
        SESSION.navStack.push(result.id);
        if (SESSION.navStack.length > 10) SESSION.navStack.shift();
        // High confidence — exact keyword or button click, respond directly
        const id = result.id;
        if (id === 'greet') { botReply(getResponse('greet')); setTimeout(showMenu,1200); }
        else if (id === 'menu') { setTimeout(showMenu,300); }
        else { botReply(getResponse(id)); }
    } else if (result.type === 'keyword') {
        logChatInteraction(text, result.id);
        // Track navigation history
        SESSION.navStack.push(result.id);
        if (SESSION.navStack.length > 10) SESSION.navStack.shift();
        // Medium confidence — keyword found in sentence
        // Show "Did you mean?" header + actual content below
        const primaryId = result.id;
        const primaryLabel = INTENT_LABELS[primaryId] || primaryId;
        const actualResponse = getResponse(primaryId);
        
        // Build combined response: "Did you mean?" + actual content
        const r = { text: '', buttons: [], noMenu: false };
        r.text = T(
            "I think you meant **" + primaryLabel + "**! 🤔\n\n" + (actualResponse.text || ''),
            "Did you mean **" + primaryLabel + "**?\n\n" + (actualResponse.text || '')
        );
        // Use the actual response buttons + add alternatives
        const otherSuggestions = findSuggestions(text).filter(s => s !== primaryId).slice(0, 2);
        r.buttons = [...(actualResponse.buttons || [])];
        if (otherSuggestions.length > 0) {
            otherSuggestions.forEach(sid => {
                r.buttons.push({ l: INTENT_LABELS[sid] || sid, a: sid, i: '🔍' });
            });
        }
        r.noMenu = actualResponse.noMenu || false;
        botReply(r);
    } else if (result.type === 'fuzzy') {
        logChatInteraction(text, 'fuzzy');
        // Low confidence — no exact keyword, fuzzy match found
        const r = { text: '', buttons: [], noMenu: false };
        r.text = T(
            "Hmm 🤔 I didn't quite get that! Did you mean:",
            "I couldn't find an exact match. Did you mean:"
        );
        r.buttons = result.suggestions.map(sid => ({
            l: INTENT_LABELS[sid] || sid,
            a: sid,
            i: '🔍'
        }));
        botReply(r);
    } else {
        logChatInteraction(text, 'unmatched');
        // No match at all
        const r = { text: '', buttons: [], noMenu: false };
        r.text = T(
            "Sorry, I couldn't find anything for that! 😅 Try something from the menu:",
            "I'm sorry, I don't have information on that topic. Please choose from the menu below:"
        );
        r.noMenu = true;
        botReply(r);
        setTimeout(showMenu, 600);
    }
}

/* =============== MESSAGE RENDERING =============== */
function addUser(text) {
    const m=document.createElement('div'); m.className='message user';
    m.innerHTML=`<div class="msg-av"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="msg-body"><div class="msg-bubble">${esc(text)}</div></div>`;
    msgs.appendChild(m); scr();
}

function addBot(text, buttons, noMenu) {
    const m=document.createElement('div'); m.className='message bot';
    let bh='';
    if(buttons && buttons.length){
        bh='<div class="msg-btns">';
        buttons.forEach(b=>{
            if(b.u) bh+=`<button class="act-btn lk" onclick="window.location.href='${b.u}'">${b.i||'🔗'} ${b.l}</button>`;
            else bh+=`<button class="act-btn" data-action="${b.a}">${b.i||''} ${b.l}</button>`;
        });
        // Only add universal menu if not explicitly suppressed AND not already in button list
        const hasMenu = buttons.some(b => b.a === 'menu');
        if(!noMenu && !hasMenu) {
            bh+=`<button class="act-btn mn" data-action="menu">📋 Main Menu</button>`;
        }
        bh+='</div>';
    } else if(!noMenu) {
        bh='<div class="msg-btns"><button class="act-btn mn" data-action="menu">📋 Main Menu</button></div>';
    }
    
    // Simple markdown: **bold** and \n to <br>
    let fmt = (text||'').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    fmt = fmt.replace(/\n/g,'<br>');
    
    m.innerHTML=`<div class="msg-av"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div class="msg-body"><div class="msg-bubble">${fmt}</div>${bh}</div>`;
    msgs.appendChild(m);
    m.querySelectorAll('.act-btn[data-action]').forEach(b=>b.addEventListener('click',()=>{disOld();handleAction(b.dataset.action);}));
    scr();
}

function addBotWarn(text) {
    const m=document.createElement('div'); m.className='message bot';
    m.innerHTML=`<div class="msg-av"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div class="msg-body"><div class="msg-bubble warn">${text.replace(/\n/g,'<br>')}</div><div class="msg-btns"><button class="act-btn mn" data-action="menu">📋 Main Menu</button></div></div>`;
    msgs.appendChild(m);
    m.querySelectorAll('.act-btn[data-action]').forEach(b=>b.addEventListener('click',()=>{disOld();handleAction(b.dataset.action);}));
    scr();
}




function renderHODCard(d) {
    const r = { text: '', buttons: [], noMenu: true };
    const html = `
<div class="hod-card">
    <div class="hod-main">
        <div class="hod-badge">Faculty Leadership</div>
        <div class="hod-head-info">
            <h3>${d.hod}</h3>
            <p>Head of Department</p>
        </div>
    </div>
    <div class="hod-bio-text">${d.hod_bio}</div>
    <div class="hod-details-grid">
        <div class="hod-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Department: ${d.n}</span>
        </div>
        <div class="hod-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Location: RVCE Bengaluru</span>
        </div>
    </div>
</div>`;
    r.text = html;
    r.buttons = [
        {l:'Faculty List',u:d.faculty||d.u,i:'👨‍🏫'},
        {l:'Contact Page',u:d.u,i:'✉️'},
        {l:'Main Menu',a:'menu',i:'🔙'}
    ];
    return r;
}

function botReply(r) {
    if(!r)return;showTyp();
    const d=400+Math.min((r.text||'').length*4,700);
    setTimeout(()=>{
        hideTyp();
        addBot(r.text,r.buttons,r.noMenu);
        if (isVoiceInteraction) {
            speakText(r.text);
            isVoiceInteraction = false;
        }
    },d);
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Clean text: remove emojis and markdown bolding so it sounds natural
    let cleanText = (text || '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '');
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = 'en-IN'; // Indian English pronunciation
    window.speechSynthesis.speak(u);
}

function showMenu() {
    const btns=[
        {l:'About RVCE',a:'about_disambiguation',i:'🏫'},{l:'Admissions',a:'admissions',i:'🎓'},
        {l:'Departments',a:'departments',i:'📚'},{l:'Placements',a:'placements',i:'💼'},
        {l:'Campus Life',a:'campusLife',i:'🏕️'},{l:'Hostels',a:'hostels',i:'🏠'},
        {l:'Contact',a:'contact',i:'📞'},{l:'Website',u:KB.contact.website,i:'🌐'}
    ];
    showTyp();
    setTimeout(()=>{hideTyp();addBot(T("Pick your adventure! 🗺️","How can I help? Choose a topic:"),btns,true);},400);
}

function handleAction(a) { if(a==='menu'){showMenu();return;} const r=getResponse(a); if(!r){showMenu();return;} botReply(r); }
function disOld() { msgs.querySelectorAll('.act-btn:not([disabled])').forEach(b=>b.disabled=true); }
function showTyp() { typing.classList.add('show'); scr(); }
function hideTyp() { typing.classList.remove('show'); }
function scr() { requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight;}); }
function esc(t) { const d=document.createElement('div');d.textContent=t;return d.innerHTML; }

/* =============== PARTICLES =============== */
const cvs=$('particles'),ctx=cvs.getContext('2d');let pts=[];
function rz(){cvs.width=innerWidth;cvs.height=innerHeight;}
addEventListener('resize',rz);rz();
for(let i=0;i<50;i++)pts.push({x:Math.random()*cvs.width,y:Math.random()*cvs.height,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*2+0.5,a:Math.random()*0.3+0.1});
function draw(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=cvs.width;if(p.x>cvs.width)p.x=0;if(p.y<0)p.y=cvs.height;if(p.y>cvs.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(227,30,36,${p.a})`;ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(227,30,36,${0.06*(1-d/120)})`;ctx.lineWidth=0.5;ctx.stroke();}}
    requestAnimationFrame(draw);
}
draw();

/* =============== SAFE STORAGE =============== */
const SafeStorage = {
    mem: {},
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch(e) { this.mem[k] = v; } },
    getItem: function(k) { try { return localStorage.getItem(k) || this.mem[k]; } catch(e) { return this.mem[k]; } },
    removeItem: function(k) { try { localStorage.removeItem(k); } catch(e) { delete this.mem[k]; } }
};

/* =============== STATE PERSISTENCE =============== */
function saveState() {
    SafeStorage.setItem('rvce_chat_html', msgs.innerHTML);
    SafeStorage.setItem('rvce_chat_tone', tone);
    SafeStorage.setItem('rvce_chat_open', chatOpen ? '1' : '0');
    SafeStorage.setItem('rvce_chat_time', Date.now().toString());
}

const msgObserver = new MutationObserver(() => saveState());
msgObserver.observe(msgs, { childList: true, subtree: true });

/* =============== INIT =============== */
setTimeout(()=>{
    let savedHtml = null;
    const time = SafeStorage.getItem('rvce_chat_time');
    // Clear history if older than 2 hours (7200000 ms)
    if (time && (Date.now() - parseInt(time) > 7200000)) {
        SafeStorage.removeItem('rvce_chat_html');
        SafeStorage.removeItem('rvce_chat_tone');
        SafeStorage.removeItem('rvce_chat_open');
        SafeStorage.removeItem('rvce_chat_time');
    } else {
        savedHtml = SafeStorage.getItem('rvce_chat_html');
    }

    if (savedHtml) {
        // Restore previous chat state instantly
        msgs.innerHTML = savedHtml;
        const savedTone = SafeStorage.getItem('rvce_chat_tone');
        if(savedTone === 'pro') { tone = 'pro'; toneS.classList.add('pro'); toneL.textContent = 'Pro'; }
        if(SafeStorage.getItem('rvce_chat_open') === '1') {
            chatOpen=true; chatW.classList.add('open'); fab.classList.add('active'); badge.classList.add('hidden');
        } else {
            chatOpen=false; badge.classList.add('hidden');
        }
        
        // Re-bind all historic action buttons
        msgs.querySelectorAll('.act-btn[data-action]').forEach(b => {
            if(!b.disabled) b.addEventListener('click',()=>{disOld();handleAction(b.dataset.action);});
        });
        scr();
    } else {
        // Standard first-time load
        chatOpen=true;chatW.classList.add('open');fab.classList.add('active');badge.classList.add('hidden');
        setTimeout(()=>{addBot(T("Hey there! 👋 Welcome to RVCE (v3.3) — the place where engineers are crafted! Ask me anything about admissions, placements, campus, and more!","Hello! Welcome to RV College of Engineering (v3.3). I'm here to help you with information about admissions, placements, campus facilities, and more."),[],true);setTimeout(showMenu,900);},350);
    }
},600);

}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRVCEChatbot);
} else {
    setTimeout(startRVCEChatbot, 100);
}
