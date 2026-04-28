const fs = require('fs');

// 1. Load the Chatbot Brain safely without DOM components
let code = fs.readFileSync('script.js', 'utf8');
code = code.replace(/^\(\s*function\s*\(\)\s*\{/m, '').replace(/\}\)\(\)\;[\s\n]*$/, '');
const coreCode = code.split("/* =============== DOM =============== */")[0];

const testCode = `
// ============================================================
// RVCE CHATBOT v5 TEST SUITE
// GenZ Slang + Parent Queries + College Shorthand + Did You Mean
// ============================================================

const TEST_SUITE = [
    // ========================
    // GEN-Z EXACT MATCH TESTS (typing exact slang keywords)
    // ========================
    // Greetings
    { q: "yo", expected: "greet", matchType: "exact" },
    { q: "wassup", expected: "greet", matchType: "exact" },
    { q: "heyo", expected: "greet", matchType: "exact" },
    { q: "sup", expected: "greet", matchType: "exact" },
    { q: "namaskara", expected: "greet", matchType: "exact" },
    // Goodbye
    { q: "gtg", expected: "bye", matchType: "exact" },
    { q: "kbye", expected: "bye", matchType: "exact" },
    { q: "peace out", expected: "bye", matchType: "exact" },
    { q: "laterz", expected: "bye", matchType: "exact" },
    // Departments (slang)
    { q: "comps", expected: "dept_cs", matchType: "exact" },
    { q: "comp sci", expected: "dept_cs", matchType: "exact" },
    { q: "mechies", expected: "dept_me", matchType: "exact" },
    { q: "triple e", expected: "dept_ee", matchType: "exact" },
    { q: "cybersec", expected: "dept_cscy", matchType: "exact" },
    { q: "data sci", expected: "dept_csds", matchType: "exact" },
    { q: "info sci", expected: "dept_is", matchType: "exact" },
    { q: "entc", expected: "dept_ec", matchType: "exact" },
    { q: "instru", expected: "dept_ei", matchType: "exact" },
    { q: "tele", expected: "dept_et", matchType: "exact" },
    // Placements (slang)
    { q: "placement scene", expected: "placements", matchType: "exact" },
    { q: "campus drive", expected: "placements", matchType: "exact" },
    { q: "superdream", expected: "placements", matchType: "exact" },
    { q: "lpa", expected: "placements", matchType: "exact" },
    { q: "ctc", expected: "placements", matchType: "exact" },
    // Exams (slang)
    { q: "endsem", expected: "exam", matchType: "exact" },
    { q: "midsem", expected: "exam", matchType: "exact" },
    { q: "internals", expected: "exam", matchType: "exact" },
    { q: "ia marks", expected: "exam", matchType: "exact" },
    { q: "prev papers", expected: "exam", matchType: "exact" },
    // Food (Hinglish)
    { q: "khana", expected: "food", matchType: "exact" },
    { q: "dabba", expected: "food", matchType: "exact" },
    { q: "maggi point", expected: "food", matchType: "exact" },
    // Admissions (slang)
    { q: "admission kaise", expected: "admissions", matchType: "exact" },
    { q: "how to get in", expected: "admissions", matchType: "exact" },
    // Fees (Hindi)
    { q: "kitna paisa", expected: "fees", matchType: "exact" },
    { q: "kitna lagta", expected: "fees", matchType: "exact" },
    // Management (slang)
    { q: "mgmt quota", expected: "management_quota", matchType: "exact" },
    { q: "capitation", expected: "management_quota", matchType: "exact" },
    { q: "donation", expected: "management_quota", matchType: "exact" },
    // Campus (slang)
    { q: "clg life", expected: "campusLife", matchType: "exact" },
    { q: "campus vibes", expected: "campusLife", matchType: "exact" },
    { q: "college scene", expected: "campusLife", matchType: "exact" },
    // Cultural (slang)
    { q: "culturals", expected: "culturalLife", matchType: "exact" },
    { q: "fests", expected: "culturalLife", matchType: "exact" },
    { q: "techfest", expected: "culturalLife", matchType: "exact" },
    // Misc slang
    { q: "freeship", expected: "scholarships", matchType: "exact" },
    { q: "rnd", expected: "research", matchType: "exact" },
    { q: "lib", expected: "library", matchType: "exact" },
    { q: "halp", expected: "menu", matchType: "exact" },
    { q: "sylly", expected: "syllabus_1st_sem", matchType: "exact" },
    { q: "abt rvce", expected: "about_rvce", matchType: "exact" },
    { q: "paisa wapas", expected: "refund_policy", matchType: "exact" },
    { q: "tell me about", expected: "about_disambiguation", matchType: "exact" },
    { q: "what is rvei", expected: "about_rvei", matchType: "exact" },

    // ========================
    // NEW PARENT/GENZ INTENTS - EXACT MATCHES
    // ========================
    // Safety (Parent)
    { q: "safety", expected: "safety", matchType: "exact" },
    { q: "is it safe", expected: "safety", matchType: "exact" },
    { q: "campus security", expected: "safety", matchType: "exact" },
    { q: "cctv", expected: "safety", matchType: "exact" },
    { q: "is my daughter safe", expected: "safety", matchType: "exact" },
    { q: "women safety", expected: "safety", matchType: "exact" },
    // Attendance
    { q: "attendance", expected: "attendance", matchType: "exact" },
    { q: "bunk", expected: "attendance", matchType: "exact" },
    { q: "proxy", expected: "attendance", matchType: "exact" },
    { q: "85 percent", expected: "attendance", matchType: "exact" },
    { q: "bunking", expected: "attendance", matchType: "exact" },
    // ROI (Parent)
    { q: "paisa vasool", expected: "roi", matchType: "exact" },
    { q: "value for money", expected: "roi", matchType: "exact" },
    { q: "worth the fees", expected: "roi", matchType: "exact" },
    { q: "return on investment", expected: "roi", matchType: "exact" },
    // Girls Hostel (Parent)
    { q: "girls hostel", expected: "girls_hostel", matchType: "exact" },
    { q: "girls curfew", expected: "girls_hostel", matchType: "exact" },
    { q: "curfew", expected: "girls_hostel", matchType: "exact" },
    { q: "hostel for girls", expected: "girls_hostel", matchType: "exact" },
    { q: "curfew time", expected: "girls_hostel", matchType: "exact" },
    // Nearby
    { q: "nearby", expected: "nearby", matchType: "exact" },
    { q: "nearby places", expected: "nearby", matchType: "exact" },
    { q: "hospital near", expected: "nearby", matchType: "exact" },
    { q: "restaurants near", expected: "nearby", matchType: "exact" },
    // Internship (GenZ)
    { q: "internship", expected: "internship", matchType: "exact" },
    { q: "internships", expected: "internship", matchType: "exact" },
    { q: "summer intern", expected: "internship", matchType: "exact" },
    { q: "intern milta hai", expected: "internship", matchType: "exact" },
    // Startup (GenZ)
    { q: "startup", expected: "startup", matchType: "exact" },
    { q: "startup culture", expected: "startup", matchType: "exact" },
    { q: "ecell", expected: "startup", matchType: "exact" },
    { q: "e cell", expected: "startup", matchType: "exact" },
    // Peer Quality
    { q: "peer quality", expected: "peer_quality", matchType: "exact" },
    { q: "student quality", expected: "peer_quality", matchType: "exact" },
    { q: "caliber", expected: "peer_quality", matchType: "exact" },
    { q: "crowd", expected: "peer_quality", matchType: "exact" },
    // Worth It (GenZ + Parent)
    { q: "is rvce worth it", expected: "worth_it", matchType: "exact" },
    { q: "kaisa hai", expected: "worth_it", matchType: "exact" },
    { q: "acha hai kya", expected: "worth_it", matchType: "exact" },
    { q: "join karu", expected: "worth_it", matchType: "exact" },
    { q: "rvce review", expected: "worth_it", matchType: "exact" },
    { q: "reviews", expected: "worth_it", matchType: "exact" },
    // Best Branch (GenZ)
    { q: "best branch", expected: "best_branch", matchType: "exact" },
    { q: "konsa branch", expected: "best_branch", matchType: "exact" },
    { q: "which branch", expected: "best_branch", matchType: "exact" },
    { q: "top branch", expected: "best_branch", matchType: "exact" },
    { q: "trending branch", expected: "best_branch", matchType: "exact" },
    { q: "hot branch", expected: "best_branch", matchType: "exact" },
    // Parking
    { q: "parking", expected: "parking", matchType: "exact" },
    { q: "bike parking", expected: "parking", matchType: "exact" },
    { q: "scooty", expected: "parking", matchType: "exact" },
    // Part-time
    { q: "side hustle", expected: "part_time", matchType: "exact" },
    { q: "freelance", expected: "part_time", matchType: "exact" },
    { q: "freelancing", expected: "part_time", matchType: "exact" },
    { q: "earn while studying", expected: "part_time", matchType: "exact" },
    // Alumni
    { q: "alumni", expected: "alumni", matchType: "exact" },
    { q: "alumni network", expected: "alumni", matchType: "exact" },
    { q: "notable alumni", expected: "alumni", matchType: "exact" },
    // College Comparison
    { q: "rvce vs pes", expected: "college_compare", matchType: "exact" },
    { q: "rvce vs msrit", expected: "college_compare", matchType: "exact" },
    { q: "rvce vs bms", expected: "college_compare", matchType: "exact" },
    { q: "college comparison", expected: "college_compare", matchType: "exact" },

    // ========================
    // KEYWORD-IN-SENTENCE (should show "Did you mean?")
    // ========================
    // Parent sentences
    { q: "Is my daughter safe at RVCE hostel?", expected: "safety", matchType: "keyword" },
    { q: "What are the attendance rules at RVCE?", expected: "attendance", matchType: "keyword" },
    { q: "Is the fee worth the investment?", expected: "roi", matchType: "keyword" },
    { q: "Tell me about girls hostel rules and curfew", expected: "girls_hostel", matchType: "keyword" },
    { q: "Are there hospitals near the campus?", expected: "nearby", matchType: "keyword" },
    { q: "What internship opportunities do students get?", expected: "internship", matchType: "keyword" },
    { q: "How is the alumni network?", expected: "alumni", matchType: "keyword" },
    { q: "Should my child join RVCE or PES?", expected: "worth_it", matchType: "keyword" },
    // GenZ sentences
    { q: "bro tell me the startup scene at rvce", expected: "startup", matchType: "keyword" },
    { q: "what's the best branch to take rn?", expected: "best_branch", matchType: "keyword" },
    { q: "is there bike parking on campus?", expected: "parking", matchType: "keyword" },
    { q: "any side hustle options while studying?", expected: "part_time", matchType: "keyword" },
    { q: "how's the peer quality at this college?", expected: "peer_quality", matchType: "keyword" },
    { q: "yaar how are the internals conducted?", expected: "exam", matchType: "keyword" },
    { q: "bro is RVCE worth it or nah?", expected: "worth_it", matchType: "keyword" },
    { q: "what's the placement scene like these days?", expected: "placements", matchType: "keyword" },
    { q: "can i bunk classes here?", expected: "attendance", matchType: "keyword" },
    { q: "I want to compare RVCE with other colleges", expected: "college_compare", matchType: "keyword" },

    // ========================
    // ORIGINAL EXACT MATCHES (preserved)
    // ========================
    { q: "cse", expected: "dept_cs", matchType: "exact" },
    { q: "cs", expected: "dept_cs", matchType: "exact" },
    { q: "ec", expected: "dept_ec", matchType: "exact" },
    { q: "aiml", expected: "dept_aiml", matchType: "exact" },
    { q: "ece", expected: "dept_ec", matchType: "exact" },
    { q: "hostel", expected: "hostels", matchType: "exact" },
    { q: "placement", expected: "placements", matchType: "exact" },
    { q: "fees", expected: "fees", matchType: "exact" },
    { q: "kcet", expected: "examTypes", matchType: "exact" },
    { q: "jee", expected: "jee", matchType: "exact" },
    { q: "c.s.e!!!", expected: "dept_cs", matchType: "exact" },
    { q: "who is the hod", expected: "faculty", matchType: "keyword" },
    { q: "who is the dean of academics", expected: "faculty", matchType: "keyword" },
    { q: "can I get the list of hods", expected: "hods_list", matchType: "keyword" },
    { q: "hods list", expected: "hods_list", matchType: "exact" },
    { q: "cse hod", expected: "hod_cs", matchType: "exact" },
    { q: "mechies hod", expected: "hod_me", matchType: "exact" },
    { q: "coes", expected: "centres_of_excellence", matchType: "exact" },
    { q: "where is health center", expected: "health_centre", matchType: "keyword" },
    { q: "is there a doctor on campus", expected: "health_centre", matchType: "keyword" },
    { q: "tell me about ieee", expected: "professional_societies", matchType: "keyword" },
    { q: "any upcoming events", expected: "upcoming_events", matchType: "keyword" },

    // ========================
    // NO MATCH
    // ========================
    { q: "asjkdhakjsdhakjshd", expected: null, matchType: null },
    { q: "xyzzy123nonsense", expected: null, matchType: null }
];

const MODERATION_TESTS = [
    { q: "i want to hack the database", expected: "blocked" },
    { q: "what is your political affiliation", expected: "blocked" },
    { q: "Tell me about RVCE Assistant", expected: "passed" },
    { q: "When do classes start?", expected: "passed" },
    { q: "What is the admission procedure?", expected: "passed" },
    { q: "Tell me about MCA", expected: "passed" },
    { q: "Is my daughter safe?", expected: "passed" },
    { q: "How is the alumni network?", expected: "passed" },
];

let passed = 0;
let failed = 0;
let failures = [];

console.log("=============================================");
console.log("   🚀 RVCE CHATBOT v5 TEST SUITE 🚀        ");
console.log("   GenZ + Parent + Slang + Did You Mean     ");
console.log("=============================================\\n");

// ---- Test 1: classifyIntent() Tests ----
console.log("--- Intent Classification Tests ---\\n");
TEST_SUITE.forEach(test => {
    const result = classifyIntent(test.q);
    let intentId = result.id;
    if (result.type === 'fuzzy' && result.suggestions.length > 0) {
        intentId = result.suggestions[0];
    }
    const expectedId = test.expected;
    const expectedType = test.matchType;
    const idMatches = intentId === expectedId;
    const typeMatches = result.type === expectedType;

    if (idMatches && typeMatches) {
        passed++;
    } else if (idMatches && !typeMatches) {
        if ((expectedType === 'keyword' && result.type === 'exact') ||
            (expectedType === 'fuzzy' && (result.type === 'exact' || result.type === 'keyword'))) {
            passed++;
        } else {
            failed++;
            failures.push(\`[TYPE] "\${test.q}" -> ID OK ('\${intentId}'), type '\${result.type}' not '\${expectedType}'\`);
        }
    } else {
        failed++;
        failures.push(\`[INTENT] "\${test.q}" -> Expected: '\${expectedId}' (\${expectedType}), Got: '\${intentId}' (\${result.type})\`);
    }
});

// ---- Test 2: Moderation Tests ----
console.log("--- Content Moderation Tests ---\\n");
MODERATION_TESTS.forEach(test => {
    const modResult = checkModeration(test.q);
    const actual = (modResult && modResult.blocked) ? "blocked" : "passed";
    if (actual === test.expected) {
        passed++;
    } else {
        failed++;
        failures.push(\`[MOD] "\${test.q}" -> Expected: '\${test.expected}', Got: '\${actual}'\`);
    }
});

// ---- Test 3: Response Content Tests (new intents have valid responses) ----
console.log("--- Response Validation Tests ---\\n");
const NEW_INTENTS = ['safety','attendance','roi','girls_hostel','nearby','internship','startup','peer_quality','worth_it','best_branch','parking','part_time','alumni','college_compare'];
NEW_INTENTS.forEach(id => {
    const response = getResponse(id);
    if (response && response.text && response.text.length > 20) {
        passed++;
    } else {
        failed++;
        failures.push(\`[RESPONSE] Intent '\${id}' has empty or invalid response\`);
    }
});

// ---- RESULTS ----
console.log("\\n=============================================");
console.log(\`✅ Passed: \${passed}\`);
console.log(\`❌ Failed: \${failed}\`);
console.log(\`📊 Total:  \${passed + failed}\`);
console.log(\`📈 Score:  \${((passed / (passed + failed)) * 100).toFixed(1)}%\`);
console.log("=============================================\\n");

if (failed > 0) {
    console.log("⚠️  TEST FAILURES:");
    failures.forEach(f => console.log("  " + f));
} else {
    console.log("🎉 ALL TESTS PASSED! GenZ + Parent + Slang support is airtight!");
}
`;

try {
    eval(coreCode + "\n" + testCode);
} catch (e) {
    console.error("Failed to execute Test Suite:", e);
    process.exit(1);
}
