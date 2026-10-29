/**
 * Populate G.R.O.W.S. Course Content
 * Run with: npx tsx scripts/populate-grows-content.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "manpreethundal-svp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lesson content mapping
const LESSON_CONTENT: Record<string, { description: string; textContent: string }> = {
  "Welcome to the G.R.O.W.S. Journey": {
    description: "An overview of what you'll learn and how this framework will transform your business.",
    textContent: `# Welcome to the G.R.O.W.S. Framework

## Your Journey to Building a Legacy Business Starts Here

Welcome to the most comprehensive business transformation program designed specifically for entrepreneurs and business owners who want more than just profit—they want to build something that lasts.

### What is G.R.O.W.S.?

G.R.O.W.S. is our proprietary framework that stands for:

- **G** - Goals & Strategic Planning
- **R** - Results-Driven Leadership
- **O** - Operational Excellence
- **W** - Wealth Building & Financial Mastery
- **S** - Succession & Legacy Transition

### Why This Framework Works

Unlike cookie-cutter programs, G.R.O.W.S. is designed to be customized to YOUR unique vision, challenges, and goals. We don't believe in one-size-fits-all solutions because every business—and every business owner—is different.

### What You'll Achieve

By the end of this course, you will:
1. Have a clear, compelling vision for your business
2. Possess strategic roadmaps that guide daily decisions
3. Lead with confidence and inspire your team
4. Run efficient operations that scale
5. Have a succession plan that ensures your legacy continues

### How We Work Together

Every engagement follows four phases:
1. **Discovery** - We learn about your business, challenges, and goals
2. **Strategy** - Together, we create a customized roadmap
3. **Implementation** - You execute with coaching and support
4. **Results** - We measure progress and adjust as needed

Let's begin your transformation journey.`
  },
  "The Legacy Mindset": {
    description: "Shift from day-to-day operations to building something that outlasts you.",
    textContent: `# The Legacy Mindset

## Thinking Beyond Today's Bottom Line

Most business owners are trapped in the day-to-day. They work IN their business instead of ON their business. The Legacy Mindset is about making a fundamental shift in how you think about your role and your business's purpose.

### The Difference Between Building a Job and Building a Legacy

**Building a Job:**
- You are the business
- If you stop, everything stops
- Success is measured in monthly revenue
- Exit strategy: close the doors

**Building a Legacy:**
- The business runs without you
- Systems and people drive results
- Success is measured in sustainable impact
- Exit strategy: transition, sale, or generational transfer

### Three Questions Every Legacy Builder Must Answer

1. **What do I want my business to be known for in 20 years?**
2. **Who will carry this forward when I'm no longer here?**
3. **What systems must exist for this to outlast me?**

### Key Takeaways

- Legacy thinking requires stepping back from daily operations
- Your business should be able to thrive without your constant involvement
- Start with the end in mind—what do you want to leave behind?

> "The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb`
  },
  "Module 1 Quiz": {
    description: "Test your understanding of the G.R.O.W.S. framework fundamentals.",
    textContent: `# Module 1 Quiz: G.R.O.W.S. Foundations

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
What does the "G" in G.R.O.W.S. stand for?

A) Growth Strategies
B) Goals & Strategic Planning ✓
C) General Management
D) Governance

*The G stands for Goals & Strategic Planning, which forms the foundation of the entire framework.*

---

### Question 2
True or False: The G.R.O.W.S. framework is a one-size-fits-all program.

A) True
B) False ✓

*G.R.O.W.S. is specifically designed to be customized to each business owner's unique vision, challenges, and goals.*

---

### Question 3
What is the key difference between "building a job" and "building a legacy"?

A) Revenue size
B) Number of employees
C) Whether the business can run without you ✓
D) Industry type

*A legacy business has systems and people that allow it to thrive without the owner's constant involvement.*

---

### Question 4
What are the four phases of the G.R.O.W.S. engagement process?

A) Plan, Do, Check, Act
B) Discovery, Strategy, Implementation, Results ✓
C) Assess, Design, Build, Launch
D) Vision, Mission, Goals, Actions

---

### Question 5
Which of the following is NOT one of the five G.R.O.W.S. pillars?

A) Operational Excellence
B) Marketing Mastery ✓
C) Succession & Legacy Transition
D) Results-Driven Leadership

*The five pillars are Goals, Results-Driven Leadership, Operational Excellence, Wealth Building, and Succession.*`
  },
  "Crafting Your Business Vision": {
    description: "Create a clear, compelling vision that guides every decision in your organization.",
    textContent: `# Crafting Your Business Vision

## The Foundation of Strategic Planning

A compelling vision is more than a statement on your wall—it's the North Star that guides every decision, inspires your team, and attracts the right customers and partners.

### What Makes a Great Vision?

A powerful business vision has five characteristics:

1. **Clear** - Anyone can understand it
2. **Compelling** - It inspires action
3. **Future-Focused** - It describes where you're going, not where you are
4. **Aligned** - It connects to your personal values and goals
5. **Memorable** - It can be easily recalled and shared

### Vision Statement Template

"We exist to [IMPACT] by [HOW] so that [OUTCOME]."

**Example:**
"We exist to empower entrepreneurs to build lasting legacies by providing strategic coaching and proven frameworks so that businesses can thrive for generations."

### Common Vision Mistakes

❌ Too vague: "To be the best"
❌ Too narrow: "To increase revenue 20%"
❌ Too long: Multiple paragraphs
❌ Uninspiring: "To provide quality services"

### Action Items

1. Complete the personal reflection questions
2. Draft three versions of your vision statement
3. Test each with your leadership team
4. Refine based on feedback
5. Communicate widely and consistently`
  },
  "Module 2 Quiz": {
    description: "Test your knowledge of goals, vision, and strategic roadmapping.",
    textContent: `# Module 2 Quiz: Strategic Planning Mastery

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
What does the "+" in SMART+ goals represent?

A) Additional resources
B) Accountable ✓
C) Ambitious
D) Actionable

*The + adds Accountable to the traditional SMART framework, ensuring every goal has a clear owner.*

---

### Question 2
In the Three Horizons Model, which horizon focuses on transformational initiatives?

A) Horizon 1
B) Horizon 2
C) Horizon 3 ✓
D) All horizons equally

*Horizon 3 (36+ months) focuses on transformational initiatives and legacy-building projects.*

---

### Question 3
What are the five characteristics of a great business vision?

A) Short, Simple, Specific, Strategic, Sustainable
B) Clear, Compelling, Future-Focused, Aligned, Memorable ✓
C) Bold, Brief, Broad, Balanced, Beautiful
D) Visionary, Valuable, Viable, Vital, Verified

---

### Question 4
How often should quarterly planning sessions be conducted?

A) Monthly
B) Every 90 days ✓
C) Annually
D) When problems arise

---

### Question 5
Which is a LEADING indicator (predicts future results)?

A) Revenue
B) Profit
C) Customer satisfaction scores ✓
D) Market share`
  },
  "Developing Executive Presence": {
    description: "Build the confidence and gravitas that inspires trust and followership.",
    textContent: `# Developing Executive Presence

## Lead with Confidence and Conviction

Executive presence is that intangible quality that makes people want to follow you. It's not about being the loudest voice—it's about being the most trusted.

### The Three Pillars of Executive Presence

#### 1. Gravitas (How You Act)
- Confidence under pressure
- Decisiveness
- Emotional intelligence
- Vision and purpose
- Integrity and authenticity

#### 2. Communication (How You Speak)
- Clear and concise messaging
- Compelling storytelling
- Active listening
- Appropriate assertiveness
- Adaptable style

#### 3. Appearance (How You Present)
- Professional image
- Body language
- Energy and enthusiasm
- Poise and composure
- Attention to context

### The PREP Method for Clear Communication

- **P**oint - State your main message
- **R**eason - Explain why it matters
- **E**xample - Provide supporting evidence
- **P**oint - Restate your conclusion

### Building Gravitas

**Confidence Under Pressure**
- Prepare thoroughly for high-stakes situations
- Practice breathing techniques
- Focus on contribution, not perfection
- Learn from setbacks without dwelling`
  },
  "Module 3 Quiz": {
    description: "Test your understanding of leadership principles and team building.",
    textContent: `# Module 3 Quiz: Leadership Excellence

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
What are the three pillars of Executive Presence?

A) Vision, Strategy, Execution
B) Gravitas, Communication, Appearance ✓
C) Confidence, Competence, Character
D) Speaking, Listening, Writing

---

### Question 2
According to Patrick Lencioni, what is the foundation of team dysfunction?

A) Fear of Conflict
B) Lack of Commitment
C) Absence of Trust ✓
D) Avoidance of Accountability

*Without trust, teams cannot engage in healthy conflict or build commitment.*

---

### Question 3
What does the PREP method stand for?

A) Prepare, Rehearse, Execute, Perfect
B) Point, Reason, Example, Point ✓
C) Plan, Review, Evaluate, Present
D) Purpose, Results, Evidence, Proposal

---

### Question 4
In the Accountability Equation, which element asks "Can they actually do it?"

A) Clarity
B) Capability ✓
C) Commitment
D) Consequences

---

### Question 5
What percentage of development comes from on-the-job experiences (70-20-10 model)?

A) 10%
B) 20%
C) 50%
D) 70% ✓`
  },
  "Identifying and Eliminating Bottlenecks": {
    description: "Find the constraints limiting your business growth and systematically remove them.",
    textContent: `# Identifying and Eliminating Bottlenecks

## The Theory of Constraints in Action

Every business has constraints—bottlenecks that limit throughput and growth. The key to operational excellence is identifying and systematically eliminating these constraints.

### What is a Bottleneck?

A bottleneck is any resource or process that limits the overall capacity of your system. It's the narrowest point in your workflow—everything else waits for it.

### Common Business Bottlenecks

**People Bottlenecks:**
- Key person dependencies
- Skill gaps
- Capacity limitations

**Process Bottlenecks:**
- Manual tasks that should be automated
- Approval chains too long
- Handoff failures

### The 5-Step Bottleneck Elimination Process

1. **IDENTIFY** - Find where work piles up
2. **EXPLOIT** - Maximize current capacity
3. **SUBORDINATE** - Align everything to support it
4. **ELEVATE** - Increase capacity
5. **REPEAT** - Find the next constraint

### Key Metrics to Track

- Cycle time (how long things take)
- Throughput (how much gets done)
- Work in progress (how much is waiting)
- Utilization (how busy resources are)
- Quality rate (how much is right first time)`
  },
  "Module 4 Quiz": {
    description: "Test your knowledge of operations, efficiency, and scalability.",
    textContent: `# Module 4 Quiz: Operational Excellence

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
What is a bottleneck in business operations?

A) A type of container for storing inventory
B) Any resource or process that limits overall system capacity ✓
C) A management technique for controlling costs
D) A method for prioritizing tasks

---

### Question 2
In the 5-Step Bottleneck Elimination Process, what does "SUBORDINATE" mean?

A) Fire underperforming employees
B) Align everything else to support the bottleneck ✓
C) Create a hierarchy of processes
D) Reduce the bottleneck's workload

---

### Question 3
What does the "W" in TIMWOODS (8 Wastes) stand for?

A) Work
B) Waste
C) Waiting ✓
D) Workflow

---

### Question 4
What is the "10X Test"?

A) Testing if a process can handle 10 times more volume ✓
B) Improving efficiency by 10 times
C) Reducing costs by 10%
D) Hiring 10 new employees

---

### Question 5
Which is NOT one of the four levels of systematization?

A) Tribal Knowledge
B) Documented Processes
C) Automated Workflows ✓
D) Self-Improving Systems`
  },
  "Module 5 Quiz": {
    description: "Test your understanding of business finances and wealth building.",
    textContent: `# Module 5 Quiz: Financial Mastery

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
Which financial statement shows profitability over a period of time?

A) Balance Sheet
B) Income Statement (P&L) ✓
C) Cash Flow Statement
D) Statement of Equity

---

### Question 2
What is the formula for Gross Margin?

A) Net Income / Revenue
B) Gross Profit / Revenue ✓
C) Operating Income / Revenue
D) Revenue / Total Assets

---

### Question 3
True or False: A profitable business can never fail due to cash flow problems.

A) True
B) False ✓

*Profitable businesses can fail if they run out of cash due to slow collections or rapid growth.*

---

### Question 4
What is the recommended cash reserve target for a business?

A) 1 month of operating expenses
B) 3-6 months of operating expenses ✓
C) 1 year of operating expenses
D) Equal to annual revenue

---

### Question 5
Which is NOT a strategy to improve gross margin?

A) Value-based pricing
B) Negotiating with suppliers
C) Extending payment terms to vendors ✓
D) Reducing production waste`
  },
  "Module 6 Quiz": {
    description: "Test your knowledge of succession planning and legacy transition.",
    textContent: `# Module 6 Quiz: Succession & Legacy

**Passing Score: 70% | Time Limit: 15 minutes**

---

### Question 1
What are the four types of succession discussed in the course?

A) Retirement, Sale, Closure, Bankruptcy
B) Family, Internal, External Sale, Management Buyout ✓
C) Planned, Unplanned, Emergency, Gradual
D) Owner, Partner, Employee, Investor

---

### Question 2
Which factor does NOT typically increase business value?

A) Recurring revenue
B) Strong management team
C) Heavy owner dependence ✓
D) Documented processes

---

### Question 3
What are the two types of business knowledge?

A) Written and Verbal
B) Explicit and Tacit ✓
C) Technical and Soft
D) Internal and External

---

### Question 4
What is a key person risk?

A) Risk of hiring the wrong person
B) Risk that business depends too heavily on one individual ✓
C) Risk of employee turnover
D) Risk of leadership conflict

---

### Question 5
When should succession planning begin?

A) When you're ready to retire
B) When you receive a buyout offer
C) Years before any planned transition ✓
D) After identifying a successor`
  },
  "Final Exam: G.R.O.W.S. Certification": {
    description: "Comprehensive exam covering all G.R.O.W.S. framework pillars.",
    textContent: `# Final Exam: G.R.O.W.S. Certification

**Passing Score: 80% | Time Limit: 45 minutes | 25 Questions**

This comprehensive exam tests your mastery of all five G.R.O.W.S. pillars. You must score 80% or higher to earn your G.R.O.W.S. Certification.

---

## Section 1: Goals & Strategic Planning (5 Questions)

### Q1. The SMART+ framework adds which element to traditional SMART goals?
B) Accountable ✓

### Q2. Which horizon in the Three Horizons Model focuses on core business optimization?
A) Horizon 1 ✓

### Q3. A powerful business vision should be all EXCEPT:
D) Lengthy and detailed ✓

### Q4. Leading indicators:
C) Predict future results ✓

### Q5. Quarterly planning sessions should include:
D) All of the above ✓

---

## Section 2: Results-Driven Leadership (5 Questions)

### Q6. Executive Presence consists of:
B) Gravitas, Communication, Appearance ✓

### Q7. The foundation of the Five Dysfunctions of a Team is:
C) Absence of Trust ✓

### Q8. The Accountability Equation is:
A) Clarity + Capability + Commitment + Consequences ✓

### Q9. The 70-20-10 model suggests most development comes from:
D) On-the-job experiences ✓

### Q10. High-performing teams require:
D) All of the above ✓

---

## Section 3: Operational Excellence (5 Questions)

### Q11. A bottleneck is:
B) A constraint limiting system capacity ✓

### Q12. The first step in bottleneck elimination is:
A) Identify ✓

### Q13. TIMWOODS represents:
C) The 8 types of waste ✓

### Q14. The 10X Test asks:
B) Would this work at 10 times the scale? ✓

### Q15. Systems that run without you require:
D) All of the above ✓

---

## Section 4: Wealth Building (5 Questions)

### Q16. Gross Margin equals:
B) Gross Profit / Revenue ✓

### Q17. Cash flow differs from profit because:
C) Profit is accounting, cash flow is actual money movement ✓

### Q18. Recommended cash reserves are:
B) 3-6 months of operating expenses ✓

### Q19. To improve margins, you should:
D) All of the above ✓

### Q20. The Cash Conversion Cycle measures:
A) Time from paying suppliers to collecting from customers ✓

---

## Section 5: Succession & Legacy (5 Questions)

### Q21. Business value is typically reduced by:
C) Heavy owner dependence ✓

### Q22. Tacit knowledge is:
B) Difficult to articulate, based on experience ✓

### Q23. Succession planning should begin:
C) Years before any planned transition ✓

### Q24. The four types of succession are:
A) Family, Internal, External Sale, Management Buyout ✓

### Q25. A legacy business is characterized by:
D) All of the above ✓

---

**Congratulations on completing the G.R.O.W.S. Certification Exam!**`
  }
};

async function populateContent() {
  console.log("📝 Populating G.R.O.W.S. Course Content...\n");

  const lessonsRef = collection(db, "lms_lessons");
  const snapshot = await getDocs(lessonsRef);

  let updated = 0;
  for (const docSnap of snapshot.docs) {
    const lesson = docSnap.data();
    const content = LESSON_CONTENT[lesson.title];
    
    if (content) {
      await updateDoc(doc(db, "lms_lessons", docSnap.id), {
        description: content.description,
        textContent: content.textContent,
      });
      console.log(`✅ Updated: ${lesson.title}`);
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} lessons with content!`);
}

populateContent().catch(console.error);
