/**
 * mockData.js
 * In-memory fallback dataset for development without a PostgreSQL instance.
 * Provides posts, events, and batches matching the schema.
 */

export const MOCK_BLOG_POSTS = [
  {
    id: "mock-blog-1",
    slug: "transforming-governance-bottom-up",
    title: "Transforming Governance: A Bottom-Up Approach to Public Policy",
    excerpt: "How grassroots-level participation can shape effective policy design and implementation in administrative ecosystems.",
    content: `
      <h2>The Paradigm of Grassroots Governance</h2>
      <p>Policy making has traditionally been a top-down exercise, formulated in elite corridors and passed down for implementation. However, sustainable change requires local context, regional ownership, and bottom-up feedback loops.</p>
      
      <blockquote>
        "True public service is not about implementing rules from above; it is about building the capacity of communities to self-govern and thrive."
      </blockquote>
      
      <h3>The Role of Local Leaders</h3>
      <p>When young officers step into regional posts, the first challenge is understanding local dynamics. Academic theories must merge with ground realities. Through Badlaav, we study how modern administrative methodologies can be applied in these setups.</p>
      
      <h3>Key Pillars of Grassroots Transformation</h3>
      <ul>
        <li><strong>Active Listening:</strong> Setting up citizen forums and feedback mechanisms.</li>
        <li><strong>Data-driven Decisions:</strong> Tracking service delivery metrics at the village block level.</li>
        <li><strong>Capacity Building:</strong> Training local authorities and self-help groups.</li>
      </ul>
      
      <p>In our upcoming retreats, we will dive deeper into case studies of successful local policy implementations across Maharashtra and Central India.</p>
    `,
    coverImage: "/images/program_badlaav.jpg",
    category: "GOVERNANCE",
    tags: ["Policy", "Grassroots", "Public Administration"],
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    readingTime: 6,
    status: "PUBLISHED",
    authorId: "arjun-id"
  },
  {
    id: "mock-blog-2",
    slug: "pursuit-of-purpose-civil-services",
    title: "The Pursuit of Purpose in Civil Services",
    excerpt: "Realigning candidate preparation with the core ethos of public service rather than just exam clearance.",
    content: `
      <h2>Beyond the UPSC Syllabus</h2>
      <p>Every year, lakhs of candidates attempt the civil services examination. While the competition is fierce, the real question is: what happens after selection? Are we preparing candidates for the career, or just for the exam?</p>
      
      <p>At Dnyanpith, we believe that academic preparation must be anchored in personal purpose. When your goal is public service, study becomes a mission rather than a chore.</p>
      
      <h3>Reclaiming the Narrative</h3>
      <p>Often, candidate preparation is filled with anxiety, isolation, and rote learning. Mission Udaan aims to reshape this preparation phase, introducing mentor support, peer discussion groups, and mental well-being practices.</p>
      
      <h3>Integrating Service Ethos</h3>
      <p>An officer's life is defined by high pressure, ethical choices, and public accountability. Cultivating leadership qualities, emotional resilience, and deep empathy during the preparation years sets the foundation for a brilliant career.</p>
    `,
    coverImage: "/images/program_udaan.jpg",
    category: "PERSPECTIVES",
    tags: ["Motivation", "Civil Services", "UPSC"],
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    readingTime: 5,
    status: "PUBLISHED",
    authorId: "arjun-id"
  },
  {
    id: "mock-blog-3",
    slug: "future-readiness-for-indian-youth",
    title: "Future Readiness: Equipping Indian Youth for Global Challenges",
    excerpt: "Why technical skills are not enough — introducing holistic development, ethical reasoning, and critical thinking.",
    content: `
      <h2>The Shifting Landscape of Work</h2>
      <p>The 21st century demands more than standard degrees. As automation, artificial intelligence, and global connectivity reshape industries, the skills that matter most are adaptability, collaboration, and ethical decision-making.</p>
      
      <h3>The Dnyanpith Approach</h3>
      <p>Through our Future Readiness programs, we address the critical gap in formal education. We bring corporate leaders, policy experts, and social developers together to mentor students.</p>
      
      <h3>Critical Competencies</h3>
      <ul>
        <li><strong>Systems Thinking:</strong> Understanding how local actions impact global networks.</li>
        <li><strong>Cross-cultural Communication:</strong> Communicating effectively across diverse mediums and regions.</li>
        <li><strong>Ethical Frameworks:</strong> Making decisions that prioritize long-term social value.</li>
      </ul>
    `,
    coverImage: "/images/program_readiness.jpg",
    category: "LIFESTYLE",
    tags: ["Future Skills", "Holistic Education", "Youth Empowerment"],
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    readingTime: 4,
    status: "PUBLISHED",
    authorId: "arjun-id"
  }
];

export const MOCK_EVENTS = [
  {
    id: "mock-event-1",
    title: "Badlaav Retreat 2026: Grassroots Leadership",
    description: "An intensive 3-day residential retreat focusing on grassroots public policy, local administration, and systemic problem solving for selected participants.",
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days in future
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Dnyanpith Campus, Pune",
    type: "RETREAT",
    totalSeats: 30,
    seatsBooked: 18,
    status: "OPEN",
    coverImage: "/images/badlaav_day1.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-event-2",
    title: "UPSC Interview Prep Workshop",
    description: "A specialized masterclass on building communication skills, handling pressure, and framing administrative perspectives for personality test candidates.",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days in future
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: "Online (Zoom)",
    type: "WORKSHOP",
    totalSeats: 150,
    seatsBooked: 95,
    status: "OPEN",
    coverImage: "/images/program_udaan.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-event-3",
    title: "Vachan Vari Community Book Discussion",
    description: "Monthly get-together of book lovers to discuss literature on social sciences, Indian history, and modern governance.",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: "Central Library, Pune",
    type: "COMMUNITY",
    totalSeats: 50,
    seatsBooked: 42,
    status: "OPEN",
    coverImage: "/images/gallery_1.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-event-4",
    title: "Administrative Career Guidance Seminar",
    description: "An open session for college students to explore career tracks in State and Central civil services.",
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: "Abasaheb Garware College, Pune",
    type: "SESSION",
    totalSeats: 200,
    seatsBooked: 200,
    status: "CLOSED",
    coverImage: "/images/gallery_4.jpg",
    createdAt: new Date().toISOString()
  }
];

export const MOCK_BATCHES = [
  // Badlaav Batches
  {
    id: "mock-batch-1",
    program: "BADLAAV",
    name: "Badlaav Cohort 9 (Pune)",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days in future
    endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Dnyanpith Campus, Pune",
    totalSeats: 40,
    seatsBooked: 15,
    priceIndividual: 12000,
    priceCouple: 20000,
    priceCorporate: 30000,
    status: "OPEN"
  },
  // Udaan Batches
  {
    id: "mock-batch-2",
    program: "UDAAN",
    name: "Mission Udaan 2026 Foundation Batch",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
    endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Dnyanpith Academy, Sadashiv Peth",
    totalSeats: 60,
    seatsBooked: 52,
    priceIndividual: 45000,
    priceCouple: null,
    priceCorporate: null,
    status: "OPEN"
  },
  // Future Readiness Batches
  {
    id: "mock-batch-3",
    program: "FUTURE_READINESS",
    name: "Modern Leadership & Critical Thinking",
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days in future
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Online Session Block",
    totalSeats: 100,
    seatsBooked: 25,
    priceIndividual: 7500,
    priceCouple: null,
    priceCorporate: 12000,
    status: "OPEN"
  }
];
