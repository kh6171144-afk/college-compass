const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please provide message history.' });
    }

    const latestMessage = messages[messages.length - 1].content;

    // 1. Fetch all colleges to build context
    const collegesRes = await db.query(
      'SELECT id, name, type, state, city, average_package, highest_package, tuition_fee, nirf_rank FROM colleges ORDER BY name ASC'
    );
    const colleges = collegesRes.rows;

    const collegeListText = colleges
      .map(
        c =>
          `- ${c.name} (${c.type} in ${c.city}, ${c.state}). NIRF: ${c.nirf_rank || 'N/A'}, Avg Pkg: ${c.average_package || 'N/A'} LPA, Highest Pkg: ${c.highest_package || 'N/A'} LPA, Tuition Fee: ₹${c.tuition_fee || 'N/A'} per year.`
      )
      .join('\n');

    // 2. Build the system instruction prompt
    const systemPrompt = `You are EduGuide AI, an expert AI College Counselor integrated into this platform.

Your purpose is to help students with:
* College selection
* Branch selection
* Admissions
* JEE counseling
* NEET counseling
* JoSAA
* CSAB
* Placements
* Fees and ROI
* Career guidance
* Higher studies
* College comparisons
* Rank-based recommendations

Knowledge Sources & Critical Rules:
1. Determine the user's intent. Possible intents:
   - COLLEGE_DETAILS (student asks explicitly about a specific, named college)
   - COLLEGE_COMPARE (student wants to compare two or more colleges)
   - COLLEGE_RECOMMENDATION (student asks for the "best colleges" or suggestions)
   - RANK_GUIDANCE (student shares their rank and wants advice)
   - BRANCH_GUIDANCE (student asks about branch differences, e.g., CSE vs AI&DS)
   - COUNSELING_GUIDANCE (student asks about JoSAA, CSAB, counseling processes)
   - GENERAL_EDUCATION (general counseling or greeting questions)
2. Do NOT treat recommendation, rank, branch, counseling, or career questions as college lookup requests.
3. Only search for a specific college when the user explicitly asks about a particular college.
4. The message: "This college is not currently available in our database. I can provide general guidance, but detailed information may not be available." must ONLY be shown when:
   - The user asks about a specific college (COLLEGE_DETAILS intent).
   - The college cannot be found in the database.
5. NEVER show the database error/unavailable message for:
   - Best colleges queries
   - Rank-based queries
   - Branch comparisons
   - Career questions
   - Counseling questions
   - Admission guidance
6. If platform database information is available, use it as the primary source.
7. If platform database information is unavailable, provide general educational guidance using your knowledge. Never refuse a question solely because a college is not present in the database (unless it's an explicit COLLEGE_DETAILS lookup for a missing college, in which case output the message in Rule 4).
8. Never invent exact cutoffs, fees, rankings, placement figures, or admission statistics. If exact data is unavailable, clearly state that the information is not verified.

Response Style:
* Friendly
* Professional
* Student-focused
* Accurate
* Explain reasoning
* Give pros and cons when comparing options

For rank-based queries:
* Ask for category, state, gender (if relevant), and preferred branch if missing.
* Then suggest suitable options.

For college comparisons:
* Compare placements, academics, fees, ROI, campus life, and opportunities.
* End with a clear recommendation.

Your goal is to act as a knowledgeable college admission counselor who can answer both platform-specific and general educational questions.

Here is the list of verified colleges in the database:
${collegeListText}
`;

    // 3. Try online Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt
        });

        // Format history for Gemini chat structure
        // Convert 'user'/'assistant' roles to 'user'/'model' roles
        const contents = [];
        // Add previous messages (Gemini expects alternate user/model messages)
        for (let i = 0; i < messages.length - 1; i++) {
          const msg = messages[i];
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: latestMessage }]
        });

        const chatResult = await model.generateContent({ contents });
        const responseText = chatResult.response.text();
        return res.json({ response: responseText });
      } catch (geminiError) {
        console.error('Gemini online API error, falling back to local simulation:', geminiError);
      }
    }

    // 4. Offline Smart Counselor fallback (rules-based)
    console.log('Using offline smart counselor response engine.');
    const queryLower = latestMessage.toLowerCase();

    // Intent classification logic
    const isBestColleges = queryLower.includes('best colleges') || queryLower.includes('top colleges') || queryLower.includes('suggest colleges') || queryLower.includes('good colleges');
    
    // Precision rank matching (ignore 'ranking/rankings' and exclude typical year numbers 2020-2030)
    const cleanQueryForRank = queryLower.replace(/rankings?/g, '');
    const hasRankKeyword = cleanQueryForRank.includes('rank') || queryLower.includes('percentile') || queryLower.includes('cutoff') || queryLower.includes('cut off');
    const numbersInQuery = queryLower.match(/\b\d{4,6}\b/g) || [];
    const hasActualRankNumber = numbersInQuery.some(num => {
      const val = parseInt(num, 10);
      return val < 2020 || val > 2030;
    });
    const isRankQuery = hasRankKeyword || hasActualRankNumber;

    const isBranchCompare = queryLower.includes('vs') || queryLower.includes('versus') || queryLower.includes('difference between') || (queryLower.includes('branch') && queryLower.includes('choose'));
    const isCounseling = queryLower.includes('josaa') || queryLower.includes('csab') || queryLower.includes('counseling') || queryLower.includes('counselling') || queryLower.includes('seat allocation');
    const isSpecificCollegeQuery = queryLower.includes('tell me about') || queryLower.includes('details of') || (queryLower.includes('what is') && (queryLower.includes('iiit') || queryLower.includes('iit') || queryLower.includes('nit') || queryLower.includes('college') || queryLower.includes('university') || queryLower.includes('school')));

    let intent = 'GENERAL_EDUCATION';
    if (isBestColleges) {
      intent = 'COLLEGE_RECOMMENDATION';
    } else if (isRankQuery) {
      intent = 'RANK_GUIDANCE';
    } else if (isBranchCompare) {
      intent = 'BRANCH_GUIDANCE';
    } else if (isCounseling) {
      intent = 'COUNSELING_GUIDANCE';
    } else if (isSpecificCollegeQuery) {
      intent = 'COLLEGE_DETAILS';
    } else if (queryLower.includes('compare') || queryLower.includes('comparison')) {
      intent = 'COLLEGE_COMPARE';
    }

    // Helper function for flexible name matching
    const matchesCollege = (collegeName, query) => {
      const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const name = collegeName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

      // Extract short name from parentheses if present (e.g. IIITH from IIIT Hyderabad (IIITH))
      const hasParenthesis = collegeName.includes('(');
      let shortName = '';
      if (hasParenthesis) {
        shortName = collegeName.split('(')[1].split(')')[0].toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ');
      }

      // Check if query contains the exact full name or shortName
      if (q.includes(name)) return true;
      if (shortName && q.includes(shortName)) return true;

      // Special handling for IIT / IIIT / NIT to avoid substring collision (e.g., 'iiit' matches 'iit')
      const isIiitQuery = q.includes('iiit') || q.includes('iiith') || q.includes('iiitb') || q.includes('iiitm');
      const isIitQuery = (q.includes('iit') && !isIiitQuery) || q.includes('iith') || q.includes('iitb') || q.includes('iitd') || q.includes('iitm') || q.includes('iitk');
      const isNitQuery = q.includes('nit') || q.includes('nitk') || q.includes('nitt') || q.includes('nitw') || q.includes('nitc');

      // 1. IIIT Hyderabad alias
      if (collegeName.includes('IIIT Hyderabad') || collegeName.includes('IIITH')) {
        if (isIiitQuery && q.includes('hyderabad')) return true;
        if (q.includes('iiith') || q.includes('iiit h')) return true;
      }
      
      // 2. IIT Hyderabad alias
      if (collegeName.includes('IIT Hyderabad') || collegeName.includes('IITH')) {
        if (isIitQuery && q.includes('hyderabad')) return true;
        if (q.includes('iith') || q.includes('iit h')) return true;
      }

      // 3. IIIT Bangalore alias
      if (collegeName.includes('IIIT Bangalore') || collegeName.includes('IIITB')) {
        if ((isIiitQuery && (q.includes('bangalore') || q.includes('bengaluru'))) || q.includes('iiitb') || q.includes('iiit b')) return true;
      }

      // 4. Other specific alias rules
      if (name.includes('bombay') && (q.includes('iit bombay') || q.includes('iitb') || q.includes('iit mumbai') || q.includes('iit b'))) return true;
      if (name.includes('delhi') && (q.includes('iit delhi') || q.includes('iitd') || q.includes('iit new delhi') || q.includes('iit d'))) return true;
      if (name.includes('madras') && (q.includes('iit madras') || q.includes('iitm') || q.includes('iit chennai') || q.includes('iit m'))) return true;
      if (name.includes('trichy') && (q.includes('nit trichy') || q.includes('nitt') || q.includes('nit tiruchirappalli') || q.includes('nit t'))) return true;
      if (name.includes('surathkal') && (q.includes('nit surathkal') || q.includes('nitk') || q.includes('nit k'))) return true;

      // 5. Generic logic
      const isCollegeIiit = name.includes('iiit') || name.includes('international institute of information technology') || collegeName.includes('IIIT');
      const isCollegeIit = !isCollegeIiit && (name.includes('iit') || name.includes('indian institute of technology') || collegeName.includes('IIT'));
      const isCollegeNit = name.includes('nit') || name.includes('national institute of technology') || collegeName.includes('NIT');

      // Generic token-based matcher for city + type
      const cities = [
        'hyderabad', 'bangalore', 'bengaluru', 'gwalior', 'allahabad', 'prayagraj', 
        'dharwad', 'kalyani', 'delhi', 'bombay', 'mumbai', 'madras', 'chennai', 
        'trichy', 'tiruchirappalli', 'surathkal', 'calicut', 'kozhikode', 'warangal', 
        'jaipur', 'nagpur', 'durgapur', 'silchar', 'patna', 'jalandhar', 'jammu', 
        'tirupati', 'raipur', 'palakkad', 'surat', 'srinagar', 'bhopal', 'jamshedpur', 
        'shillong', 'kurukshetra', 'hamirpur', 'karaikal', 'agartala', 'ponda', 
        'goa', 'bhilai', 'bhubaneswar', 'mandi', 'jodhpur', 'gandhinagar', 'ropar', 
        'rupnagar', 'roorkee', 'kharagpur', 'kanpur', 'guwahati'
      ];
      
      let matchedCity = cities.find(c => q.includes(c));
      if (matchedCity) {
        if (matchedCity === 'bengaluru') matchedCity = 'bangalore';
        if (matchedCity === 'mumbai') matchedCity = 'bombay';
        if (matchedCity === 'chennai') matchedCity = 'madras';
        if (matchedCity === 'prayagraj') matchedCity = 'allahabad';
        if (matchedCity === 'kozhikode') matchedCity = 'calicut';
        if (matchedCity === 'tiruchirappalli') matchedCity = 'trichy';
        if (matchedCity === 'rupnagar') matchedCity = 'ropar';

        const dbNameLower = name.toLowerCase();
        const hasCity = dbNameLower.includes(matchedCity) || 
                        (matchedCity === 'bangalore' && dbNameLower.includes('bengaluru')) ||
                        (matchedCity === 'bombay' && dbNameLower.includes('mumbai')) ||
                        (matchedCity === 'madras' && dbNameLower.includes('chennai')) ||
                        (matchedCity === 'allahabad' && dbNameLower.includes('prayagraj')) ||
                        (matchedCity === 'calicut' && dbNameLower.includes('kozhikode')) ||
                        (matchedCity === 'trichy' && dbNameLower.includes('tiruchirappalli')) ||
                        (matchedCity === 'ropar' && dbNameLower.includes('rupnagar'));

        if (hasCity) {
          if (isIiitQuery && isCollegeIiit) return true;
          if (isIitQuery && isCollegeIit) return true;
          if (isNitQuery && isCollegeNit) return true;
        }
      }

      return false;
    };

    // Custom Counseling Topics Handler for offline/fallback mode
    let customTopicResponse = null;

    if (queryLower.includes('college or branch') || (queryLower.includes('college') && queryLower.includes('branch') && queryLower.includes('matters'))) {
      customTopicResponse = `### College vs Branch: Which Matters More?
      
This is the classic engineering dilemma. Here is how you should decide:

* **Choose College (IIT/NIT/Top IIIT) when**:
  * You want excellent **brand value**, alumni network, and campus opportunities.
  * You are open to branch change options (where available) or want to explore non-coding careers (consulting, finance, product management).
  * You want access to top-tier core placements and global research opportunities.

* **Choose Branch (CSE/ECE/IT) when**:
  * You are absolutely certain about your interest in software development, coding, and IT roles.
  * You are getting a lower college where coding culture might not be established.
  * You want to start coding from day one without worrying about branch upgrade GPA thresholds.

**Verdict**: A top-tier college brand (e.g. old IITs/top NITs) is usually worth taking even with a slightly lower branch (like mechanical or chemical), as companies open IT roles for almost all branches. However, for extremely low core branches, prioritize CSE/IT in a tier-1.5/2 college.`;
    } else if (queryLower.includes('cse vs') || queryLower.includes('cse vs ai') || (queryLower.includes('cse') && queryLower.includes('ds') && queryLower.includes('it'))) {
      customTopicResponse = `### CSE vs AI & DS vs Information Technology (IT)

Here is a breakdown of these three high-demand computer branches:

* **Computer Science & Engineering (CSE)**:
  * Covers core fundamentals (operating systems, compilers, theory of computation, algorithms).
  * Offers the most flexible career paths globally.
* **Information Technology (IT)**:
  * Focuses more on software applications, network security, database management, and web systems.
  * Industry placement opportunities are virtually identical to CSE.
* **Artificial Intelligence & Data Science (AI & DS)**:
  * Highly specialized in machine learning, statistics, data visualization, and neural networks.
  * Best for students committed to roles in data engineering, AI research, and business analytics.

**Verdict**: Choose **CSE** if you want general flexibility. Choose **IT** if CSE is unavailable (as syllabus is 90% identical). Choose **AI & DS** if you are specifically excited about data science and ML fields.`;
    } else if (queryLower.includes('ece') && (queryLower.includes('good') || queryLower.includes('2026') || queryLower.includes('choice'))) {
      customTopicResponse = `### Is Electronics & Communication Engineering (ECE) a Good Choice in 2026?

Yes, ECE is an excellent choice, especially with modern industry trends:

* **Semiconductor Surge**: With India's semiconductor initiatives, VLSI and chip design roles are growing exponentially.
* **Dual Opportunity**: ECE students are eligible for almost all IT software placements while retaining core hardware eligibility (companies like Intel, Qualcomm, Texas Instruments).
* **Future-Proof**: Covers IoT, robotics, embedded systems, and 5G communication protocols.

**Challenges**: ECE has a rigorous and math-heavy syllabus. You will need to manage core academic pressure along with learning coding skills if you target IT roles.`;
    } else if (queryLower.includes('future scope') && queryLower.includes('branch')) {
      customTopicResponse = `### Engineering Branches with the Best Future Scope

Here is the outlook for key branches:

1. **CSE & allied branches (AI/ML, Data Science, Cybersecurity)**: Remains dominant with the integration of AI in every sector.
2. **ECE & VLSI**: High demand due to automation, IoT, chip manufacturing, and 5G/6G communication systems.
3. **Electrical/Mechanical Engineering**: Experiencing a resurgence due to **Electric Vehicles (EV)**, green energy transition, and advanced robotics.
4. **Biotechnology/Chemical**: High growth in bioinformatics, pharmaceutical research, and sustainable materials.`;
    } else if (queryLower.includes('prioritize') && (queryLower.includes('placement') || queryLower.includes('fee') || queryLower.includes('reputation'))) {
      customTopicResponse = `### Prioritizing Placements, Fees, and College Reputation

Use this decision matrix to evaluate your options:

1. **Placements (Return on Investment)**: Always look at the **median package** rather than the highest package. It represents what an average student gets.
2. **Tuition & Hostel Fees**: If fees are high (e.g. private colleges/some IIITs), calculate the **ROI (Average Package / total fees)**. Avoid heavy student loans unless the college has guaranteed placements.
3. **Reputation/Brand**: Top brands (IITs/NITs) provide lifelong credibility, alumni support, and higher studies advantages.

**Priority Order**: Placements (Median) >= Reputation (Brand) > Fees (unless constraint).`;
    } else if (queryLower.includes('mistakes') && queryLower.includes('counseling')) {
      customTopicResponse = `### Common Student Mistakes During JoSAA/CSAB Counseling

Avoid these critical errors:

1. **Filling Choices Randomly**: Always put colleges in strictly decreasing order of preference. Never put a lower-choice college above a higher-choice one thinking you won't get it.
2. **Locking Choices Prematurely**: Double check your choice order multiple times before final locking.
3. **Not Uploading Correct Documents**: Ensure Category Certificate, Medical Certificate, and Marksheets are ready and clear.
4. **Ignoring CSAB (Spot Round)**: Many vacant seats in NITs/IIITs are filled in CSAB rounds with significantly relaxed cutoffs.
5. **Confusing Slide/Float/Freeze**: Ensure you select 'Float' if you want better colleges, 'Slide' if you want a better branch in the same college, and 'Freeze' only when fully satisfied.`;
    } else if (queryLower.includes('iit lower') || queryLower.includes('nit cse') || (queryLower.includes('iit') && queryLower.includes('nit') && queryLower.includes('lower'))) {
      customTopicResponse = `### IIT Lower Branch vs NIT CSE / Top IIIT CSE

This is a very common decision point:

* **Choose IIT Lower Branch (e.g., Civil, Metallurgy, Chemical in top IITs) when**:
  * You value the **IIT Brand** and want access to elite alumni, coding culture, global universities, and consulting/finance recruiters.
  * You are confident about preparing coding/software engineering independently alongside core coursework.
* **Choose NIT CSE / Top IIIT CSE when**:
  * You are 100% focused on computer science and want a structured curriculum.
  * You prefer a high average package immediately after B.Tech without having to learn software topics separately.
  * You do not want the academic stress of maintaining a high GPA for branch change at IIT.`;
    } else if (queryLower.includes('worth') && queryLower.includes('high fees') && queryLower.includes('private')) {
      customTopicResponse = `### Is It Worth Paying High Fees for Private Colleges?

Evaluate private colleges (like BITS Pilani, VIT, Manipal, Thapar) based on these parameters:

* **BITS Pilani**: Absolutely worth it. Brand value, zero attendance policy, and practice school (internship) system match top NITs/IITs.
* **Tier-2 Private (VIT/Manipal/Thapar)**: Worth it for **CSE/IT/ECE** branches, as companies visit extensively. Avoid taking high educational loans for core/lower branches here.
* **Tier-3 Private**: Not recommended if tuition fees exceed ₹3-4 Lakhs/year unless no other option exists. Better to prepare for exams again or consider state government colleges.`;
    } else if (queryLower.includes('consider') && queryLower.includes('selecting') && queryLower.includes('college')) {
      customTopicResponse = `### Key Factors to Consider Before Selecting a College

Always check these five metrics:

1. **Placement Statistics**: Median packages, percentage placed, and companies visiting.
2. **Faculty Profile**: Check if professors are research-active and hold PhDs from reputed institutes.
3. **Campus Infrastructure**: Labs, library, internet speed, and coding club activity.
4. **Location**: Colleges in tech hubs (Bangalore, Hyderabad, Pune, Delhi NCR) get better internship opportunities and industry exposure.
5. **Alumni Network**: A strong, active alumni network helps in referrals and career guidance.`;
    } else if (queryLower.includes('build a career') && (queryLower.includes('ai') || queryLower.includes('learning'))) {
      customTopicResponse = `### How to Build a Career in AI and Machine Learning

Here is a roadmap for B.Tech students:

1. **Mathematics & Stats**: Master linear algebra, calculus, probability, and statistics (this is the core of ML).
2. **Programming**: Learn **Python** or C++, along with libraries (NumPy, Pandas, Matplotlib, Scikit-Learn).
3. **Core ML Algorithms**: Implement regression, decision trees, SVMs, and clustering from scratch.
4. **Deep Learning & Frameworks**: Learn PyTorch or TensorFlow, and study neural networks (CNNs, RNNs, Transformers).
5. **Projects & Kaggle**: Build end-to-end projects (e.g. image classification, NLP chatbots) and participate in Kaggle competitions.
6. **Open Source/Research**: Contribute to research projects under college faculty or open-source libraries.`;
    } else if (queryLower.includes('career options') && queryLower.includes('cse')) {
      customTopicResponse = `### Top Career Options After CSE (Computer Science)

Graduating in CSE opens up diverse, high-paying roles:

1. **Software Development Engineer (SDE)**: Building backend, frontend, or full-stack software applications.
2. **AI/ML Engineer**: Developing predictive models, NLP systems, and computer vision applications.
3. **Data Scientist / Data Analyst**: Interpreting complex data to help companies make decisions.
4. **Cloud Architect / DevOps Engineer**: Managing cloud infrastructure (AWS/Azure/GCP) and deployment pipelines.
5. **Cybersecurity Analyst**: Securing networks, applications, and cloud systems.
6. **Product Manager**: Bridging tech and business to design product roadmaps.`;
    } else if ((queryLower.includes('importance') || queryLower.includes('important')) && (queryLower.includes('rankings') || queryLower.includes('ranking'))) {
      customTopicResponse = `### How Important Are College Rankings?

Understand how to interpret rankings (like NIRF, India Today, QS):

* **NIRF Rankings**: Good for identifying infrastructure and research output, but often don't correlate directly with placement quality. Always cross-check placements separately.
* **Perception vs Reality**: Rankings can be influenced by faculty-to-student ratio and publications. A college ranked #30 might have better CSE placement than a college ranked #15 due to location.
* **Usefulness**: Use rankings as a general tier guide (Tier 1 vs Tier 2) rather than choosing College A over College B simply because it is ranked two positions higher.`;
    } else if (queryLower.includes('coding culture') && queryLower.includes('placements')) {
      customTopicResponse = `### Coding Culture vs Placements: Which is More Important?

They are deeply interconnected:

* **Coding Culture**: An active competitive programming (CP) or open-source culture (GDSC, Github, hackathons) forces you to learn fast. Seniors guide you on resources, DSA, and referral networks.
* **Placements**: Represents the administrative success of the college training & placement cell in inviting recruiters.
* **Verdict**: **Coding culture is the driver; placements are the output.** A college with a strong coding culture (like IIIT Allahabad or IIIT Hyderabad) often outperforms colleges with better overall rankings because students push each other to excel.`;
    } else if (queryLower.includes('average package') || queryLower.includes('median package')) {
      customTopicResponse = `### Average Package vs Median Package: What to Look For?

**Always look at the Median Package.** Here is why:

* **Average Package**: Can be easily skewed by a few extremely high packages. For example, if 9 students get ₹5 LPA and 1 student gets ₹1 Crore, the average is ₹14.5 LPA, which is misleading.
* **Median Package**: Represents the middle value of the placements. If the median is ₹15 LPA, it means 50% of the students got packages above ₹15 LPA, and 50% below it. It is a much more honest representation of placement success.`;
    } else if (queryLower.includes('differences between josaa') || (queryLower.includes('josaa') && queryLower.includes('csab'))) {
      customTopicResponse = `### Differences Between JoSAA and CSAB

Here is the comparison:

* **JoSAA (Joint Seat Allocation Authority)**:
  * **Scope**: Standard counseling for all IITs, NITs, IIITs, and GFTIs.
  * **Rounds**: Conducts 5 to 6 rounds.
  * **Ranks**: Uses JEE Main (for NITs/IIITs) and JEE Advanced (for IITs).
* **CSAB (Central Seat Allocation Board)**:
  * **Scope**: Spot round counseling conducted *after* JoSAA is completed.
  * **Eligibility**: Only for vacant seats in NITs, IIITs, and GFTIs (IITs do NOT participate in CSAB).
  * **Rounds**: Conducts 2 rounds.
  * **Benefit**: Ranks are often relaxed significantly, allowing candidates to get seats at higher closing ranks.`;
    } else if (queryLower.includes('maximize') && queryLower.includes('chances') && queryLower.includes('counseling')) {
      customTopicResponse = `### How to Maximize Your Allotment Chances in Counseling

Follow this strategic choice-filling guide:

1. **Fill Abundant Choices**: Never limit your choices to just 10 or 15. Fill 80+ choices spanning different branches and tiers to avoid being unallotted.
2. **Order of Preference**: Arrange options in strict descending order of your preference. Do not guess whether you will get it; let the algorithm decide.
3. **Include Safe Options**: Ensure the bottom 20% of your list contains colleges where the previous year's closing ranks are comfortably above your rank.
4. **Use Slide/Float Smartly**: Keep options 'Float' in early rounds to upgrade to better choices as vacancies arise.`;
    } else if (queryLower.includes('government jobs') || queryLower.includes('higher studies')) {
      customTopicResponse = `### Best Engineering Branches for Government Jobs and Higher Studies

Depending on your target post-graduation goals:

* **For Government Jobs (PSUs, IES, Civil Services)**:
  * **Civil, Electrical, and Mechanical Engineering** are best. PSUs (like ONGC, NTPC, BHEL, IOCL) recruit heavily through GATE in these core fields.
  * **Railway & PWD** jobs also prioritize core civil/electrical engineers.
* **For Higher Studies (MS/PhD in US/Europe)**:
  * **CSE & ECE** have massive research funding globally for AI, robotics, and nanotechnology.
  * **Chemical & Biotech** are highly academic and offer excellent research fellowships abroad.`;
    } else if (queryLower.includes('skills') && queryLower.includes('learn') && queryLower.includes('engineering')) {
      customTopicResponse = `### Crucial Skills to Learn During Engineering

To be industry-ready, focus on these skills:

1. **Programming Language**: Master at least one language (Python, Java, or C++) along with Data Structures and Algorithms (DSA).
2. **Development Field**: Learn full-stack development, mobile app dev, cloud computing, or DevOps.
3. **Version Control**: Learn **Git & GitHub** from day one.
4. **Problem Solving**: Practice regularly on platforms like LeetCode or Codeforces.
5. **Soft Skills**: Effective communication, teamwork, public speaking, and resume writing.`;
    } else if (queryLower.includes('m tech or mba') || (queryLower.includes('m.tech') && queryLower.includes('mba'))) {
      customTopicResponse = `### M.Tech vs MBA After B.Tech: Which is Better?

Choose based on your personality and career aspirations:

* **M.Tech (Technical Specialization)**:
  * **Pros**: Deepens technical knowledge, open doors to research, R&D labs, and high-end tech engineering roles.
  * **Cons**: Placements are mostly technical; growth can plateau if you do not shift into management later.
  * **Best for**: Analytical minds wanting to work in AI, VLSI, or research.
* **MBA (Management/Business)**:
  * **Pros**: Fast-tracks career into leadership, consulting, investment banking, and product management. Higher initial salaries on average from top colleges (IIMs).
  * **Cons**: Expensive fees; soft skills and networking are highly pressurized.
  * **Best for**: Those wanting to manage teams, work in finance, or lead business divisions.`;
    } else if (queryLower.includes('trends') && queryLower.includes('decade') && queryLower.includes('careers')) {
      customTopicResponse = `### Tech Trends Shaping Engineering Careers in the Next Decade

Be prepared for these major shifts:

1. **AI & Generative Tech**: AI will not replace engineers, but engineers who know how to leverage AI tools (LLMs, copilots) will replace those who don't.
2. **Quantum Computing**: Emerging cryptography and computation systems.
3. **EV and Battery Tech**: Immense demand for electrical, chemical, and materials engineers.
4. **Cybersecurity & Privacy**: Crucial as data privacy laws tighten globally.
5. **AR/VR and Spatial Computing**: Expanding beyond gaming into industry simulations, education, and medicine.`;
    }

    let foundCollege = null;
    if (intent === 'COLLEGE_DETAILS') {
      for (const college of colleges) {
        if (!college.name) continue;
        if (matchesCollege(college.name, queryLower)) {
          foundCollege = college;
          break;
        }
      }
    }

    let response = '';

    if (customTopicResponse) {
      response = customTopicResponse;
    } else if (intent === 'COLLEGE_DETAILS') {
      if (foundCollege) {
        response = `Hello! I can definitely guide you on **${foundCollege.name}** based on the official platform database.

Here are the key details for this institute:
* **Type**: ${foundCollege.type}
* **Location**: ${foundCollege.city}, ${foundCollege.state}
* **NIRF Rank**: ${foundCollege.nirf_rank ? `#${foundCollege.nirf_rank} in India` : 'Not Ranked/Unavailable'}
* **Average Placement Package**: ${foundCollege.average_package ? `${foundCollege.average_package} LPA` : 'Data Unavailable'}
* **Highest Placement Package**: ${foundCollege.highest_package ? `${foundCollege.highest_package} LPA` : 'Data Unavailable'}
* **Annual Tuition Fee**: ${foundCollege.tuition_fee ? `₹${foundCollege.tuition_fee.toLocaleString('en-IN')}` : 'Data Unavailable'}

You can use our **College Predictor** to check your admission eligibility or use the **Compare Colleges** tool to see how it matches up with other institutes. Would you like me to help compare it with another choice?`;
      } else {
        response = `This college is not currently available in our database. I can provide general guidance, but detailed information may not be available.`;
      }
    } else if (intent === 'COLLEGE_RECOMMENDATION') {
      response = `Here are some recommendations for the **best colleges for AI** based on our database:
* **Indian Institute of Technology Bombay (IITB)**: Offers premier B.Tech computer engineering and extensive machine learning labs. Average package is ~23.5 LPA.
* **Indian Institute of Technology Delhi (IITD)**: Excellent department for software engineering and neural networks.
* **Indian Institute of Technology Madras (IITM)**: Ranked #1 NIRF, has top computational research centers.
* **IIIT Hyderabad (IIITH)**: Known for its state-of-the-art AI Research Centre (Kohli Center on Intelligent Systems) and dual degree research channels.

Always look at placement records, faculty profile, and coursework quality before choosing.`;
    } else if (intent === 'RANK_GUIDANCE') {
      response = `To give you the best guidance for your rank, could you please share:
1. Your **counseling category** (General, OBC, SC, ST, EWS)?
2. Your **preferred branch** (e.g. Computer Science, Electronics, Mechanical)?
3. Your **home state** (for state-quota options)?
4. Your **gender** (since some institutes have separate diversity pool cutoffs)?`;
    } else if (intent === 'BRANCH_GUIDANCE') {
      response = `Here is a detailed comparison of **CSE (Computer Science & Engineering) vs AI&DS (Artificial Intelligence & Data Science)**:

* **Computer Science & Engineering (CSE)**:
  * **Scope**: Very broad. Covers computer systems, database design, algorithms, web development, OS, and software engineering.
  * **Pros**: Offers maximum career flexibility; you can enter any software domain.
  * **Cons**: Less specialized focus on data science unless taken as an elective.

* **Artificial Intelligence & Data Science (AI&DS)**:
  * **Scope**: Highly specialized. Focuses on machine learning, data mining, statistical analysis, deep learning, and analytics.
  * **Pros**: Tailored specifically for the high-demand fields of AI engineering, data analytics, and big data.
  * **Cons**: Slightly narrower initial focus compared to core CSE.

* **Recommendation**: If you want a broad foundation with flexible options, choose **CSE**. If you are sure you want to build a career specifically in AI, machine learning, or data science, then **AI&DS** is a great choice.`;
    } else if (intent === 'COUNSELING_GUIDANCE') {
      response = `**JoSAA (Joint Seat Allocation Authority)** is the central counseling platform for admissions into IITs, NITs, IIITs, and other GFTIs in India.

* **Eligibility**: Based on JEE Main and JEE Advanced ranks.
* **Process**: Candidates register and fill choices of branches and colleges in order of preference.
* **Rounds**: Typically consists of 5 to 6 rounds of seat allotment.
* **Freeze, Slide, Float**:
  * **Freeze**: You accept the allotted seat and exit the counseling process.
  * **Slide**: You accept the seat but wish to slide to a better branch in the same college.
  * **Float**: You accept the seat but wish to consider better options in any college in subsequent rounds.

Let me know if you need help planning your backup colleges for JoSAA choices!`;
    } else if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      response = `Hello! I am **EduGuide AI**, your built-in college admission counselor. 

I am here to help you navigate your options, choose between branches/colleges, understand placement statistics, and use our prediction features effectively.

To give you the best guidance, could you please share:
1. Your entrance exam and **rank / percentile**?
2. Your **category** (General, OBC, SC, ST, EWS)?
3. Any preferred branches (like CSE, ECE, Mechanical) or regions?`;
    } else {
      response = `As your EduGuide AI Counselor, I'm here to support your counseling journey. 

I can guide you on:
* Choosing between colleges and branches
* JoSAA / CSAB counseling procedures
* Placement opportunities and fees
* Using our predictor features

Please let me know if you have any questions about specific colleges in our database or need assistance with your counseling choices!`;
    }

    return res.json({ response });
  } catch (err) {
    console.error('Chat controller error:', err);
    res.status(500).json({ error: 'Server error processing counselor chat.' });
  }
};
