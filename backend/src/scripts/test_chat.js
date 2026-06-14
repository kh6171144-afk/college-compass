const db = require('../config/db');
const chatController = require('../controllers/chatController');

const createMockReq = (body) => ({ body });
const createMockRes = (resolve, reject) => ({
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    if (this.statusCode >= 400) {
      reject(new Error(`API Error: Status ${this.statusCode} - ${JSON.stringify(data)}`));
    } else {
      resolve(data);
    }
  }
});

async function runTest() {
  try {
    await db.initDbSchema();

    // Test 1: Best colleges for AI (COLLEGE_RECOMMENDATION)
    console.log('\n--- TEST 1: Best colleges for AI ---');
    const result1 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'Best colleges for AI' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result1.response);

    // Test 2: My rank is 12000 (RANK_GUIDANCE)
    console.log('\n--- TEST 2: My rank is 12000 ---');
    const result2 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'My rank is 12000' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result2.response);

    // Test 3: CSE vs AI&DS (BRANCH_GUIDANCE)
    console.log('\n--- TEST 3: CSE vs AI&DS ---');
    const result3 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'CSE vs AI&DS' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result3.response);

    // Test 4: What is JoSAA? (COUNSELING_GUIDANCE)
    console.log('\n--- TEST 4: What is JoSAA? ---');
    const result4 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'What is JoSAA?' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result4.response);

    // Test 5: Tell me about IIIT Hyderabad (COLLEGE_DETAILS - Found)
    console.log('\n--- TEST 5: Tell me about IIIT Hyderabad ---');
    const result5 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'Tell me about IIIT Hyderabad' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result5.response);

    // Test 6: Tell me about XYZ Engineering College (COLLEGE_DETAILS - Missing)
    console.log('\n--- TEST 6: Tell me about XYZ Engineering College ---');
    const result6 = await new Promise((resolve, reject) => {
      chatController.chat(
        createMockReq({ messages: [{ role: 'user', content: 'Tell me about XYZ Engineering College' }] }),
        createMockRes(resolve, reject)
      );
    });
    console.log(result6.response);

    // 20 AI Counseling Topics Test Suite
    console.log('\n--- TESTING 20 AI COUNSELING TOPICS ---');
    const topics = [
      "Which matters more: College or Branch?",
      "CSE vs AI & DS vs IT – Which should I choose?",
      "Is ECE a good choice in 2026?",
      "Which engineering branches have the best future scope?",
      "How should I prioritize placements, fees, and college reputation?",
      "What mistakes do students make during counseling?",
      "Should I choose an IIT lower branch or NIT CSE?",
      "Is it worth paying high fees for private colleges?",
      "What should I consider before selecting a college?",
      "How do I build a career in AI and Machine Learning?",
      "What are the best career options after CSE?",
      "How important are college rankings?",
      "Is coding culture more important than placements?",
      "Should I focus on average package or median package?",
      "What are the differences between JoSAA and CSAB?",
      "How can I maximize my chances during counseling rounds?",
      "Which branch is best for government jobs and higher studies?",
      "What skills should I learn during engineering?",
      "Is pursuing M.Tech or MBA worth it after B.Tech?",
      "What trends will shape engineering careers in the next decade?"
    ];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const result = await new Promise((resolve, reject) => {
        chatController.chat(
          createMockReq({ messages: [{ role: 'user', content: topic }] }),
          createMockRes(resolve, reject)
        );
      });
      
      const containsWarning = result.response.includes("not currently available in our database") || result.response.includes("not available in our database");
      if (containsWarning) {
        throw new Error(`FAILURE on topic: "${topic}". Response incorrectly contained database warning message.`);
      }
      console.log(`Topic ${i + 1} passed: "${topic.substring(0, 40)}..." -> Response start: "${result.response.trim().split('\n')[0]}"`);
    }

    console.log('\nALL TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTest();
