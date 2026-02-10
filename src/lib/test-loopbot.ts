import { processIntent, handleBotAction } from './ai-agent';

// Assumes env vars are loaded via shell or .env files automatically by tsx

async function testLoopBot() {
    const testCases = [
        {
            name: "Sell Intent",
            message: "Hey LoopBot, I want to sell my HP Laptop for 250000 in Electronics",
            expected: "sell"
        },
        {
            name: "Request Intent",
            message: "I really need a private tutor for MTH101. Anyone available?",
            expected: "request"
        },
        {
            name: "Karma Intent",
            message: "What is my karma?",
            expected: "karma"
        },
        {
            name: "Search Intent",
            message: "Find me some cheap coding books",
            expected: "search"
        }
    ];

    const testFromNumber = "2348123456789"; // Ensure this number exists in your profiles table for a full test

    console.log("--- LoopBot Logic Test Suite ---");

    for (const tc of testCases) {
        console.log(`\nTesting: ${tc.name}`);
        console.log(`Input: "${tc.message}"`);

        try {
            const intent = await processIntent(tc.message);
            console.log("Extracted Data:", JSON.stringify(intent, null, 2));

            if (intent.intent !== tc.expected) {
                console.warn(`[WARN] Expected ${tc.expected}, but got ${intent.intent}`);
            }

            // Note: handleBotAction requires a valid DB connection and existing user
            // We skip full action execution if we just want to test AI extraction logic
            // But let's try it for the first one if we have a valid testFromNumber
            if (tc.name === "Karma Intent") {
                console.log("Simulating Karma Action...");
                const reply = await handleBotAction(testFromNumber, intent);
                console.log("Bot Reply:", reply);
            }
        } catch (error) {
            console.error(`❌ Test failed for ${tc.name}:`, error);
        }
    }

    console.log("\n✅ Test Suite completed.");
}

testLoopBot();
