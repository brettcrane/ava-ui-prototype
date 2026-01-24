import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ava.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Core entities
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    description TEXT,
    employee_count INTEGER,
    annual_revenue INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    department TEXT,
    is_primary INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name TEXT NOT NULL,
    amount INTEGER,
    stage TEXT DEFAULT 'discovery',
    forecast_category TEXT,
    close_date TEXT,
    probability INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Communication history
  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    contact_id INTEGER REFERENCES contacts(id),
    subject TEXT NOT NULL,
    body TEXT,
    direction TEXT CHECK(direction IN ('inbound', 'outbound')),
    sent_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    contact_id INTEGER REFERENCES contacts(id),
    title TEXT NOT NULL,
    transcript_vtt TEXT,
    duration_seconds INTEGER,
    occurred_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS slack_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    channel TEXT,
    author TEXT,
    content TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now'))
  );

  -- Calendar & files
  CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    title TEXT NOT NULL,
    description TEXT,
    attendees_json TEXT,
    start_time TEXT,
    end_time TEXT,
    meeting_type TEXT
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name TEXT NOT NULL,
    file_type TEXT,
    description TEXT,
    content_summary TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Agent knowledge
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    contact_id INTEGER REFERENCES contacts(id),
    category TEXT CHECK(category IN ('preference', 'relationship', 'technical_need', 'objection', 'decision_process')),
    content TEXT NOT NULL,
    confidence REAL DEFAULT 0.8,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Tasks
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Chats (for Ava conversations)
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    messages_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed ESPN data if account doesn't exist
const existingAccount = db.prepare('SELECT id FROM accounts WHERE name = ?').get('ESPN');
if (!existingAccount) {
  seedESPNData();
}

function seedESPNData() {
  // Create ESPN account
  const accountResult = db.prepare(`
    INSERT INTO accounts (name, industry, website, description, employee_count, annual_revenue)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'ESPN',
    'Sports Media & Entertainment',
    'https://espn.com',
    'Leading sports media company operating cable sports channels, streaming services, and digital content. Part of The Walt Disney Company. Key focus areas include live sports streaming, fantasy sports, and sports betting integration.',
    4500,
    12000000000
  );
  const accountId = accountResult.lastInsertRowid as number;

  // Create contacts
  const contacts = [
    { name: 'Sarah Chen', email: 'sarah.chen@espn.com', phone: '+1 (860) 555-0142', title: 'VP of Engineering', department: 'Technology', is_primary: 1 },
    { name: 'Marcus Johnson', email: 'marcus.johnson@espn.com', phone: '+1 (860) 555-0198', title: 'Senior Product Manager', department: 'Product', is_primary: 0 },
    { name: 'David Kim', email: 'david.kim@espn.com', phone: '+1 (860) 555-0167', title: 'Technical Lead, Streaming', department: 'Technology', is_primary: 0 },
    { name: 'Jennifer Walsh', email: 'jennifer.walsh@espn.com', phone: '+1 (860) 555-0134', title: 'Director of Procurement', department: 'Operations', is_primary: 0 },
    { name: 'Robert Martinez', email: 'robert.martinez@espn.com', phone: '+1 (860) 555-0156', title: 'CTO', department: 'Executive', is_primary: 0 },
  ];

  const insertContact = db.prepare(`
    INSERT INTO contacts (account_id, name, email, phone, title, department, is_primary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const contactIds: Record<string, number> = {};
  for (const contact of contacts) {
    const result = insertContact.run(accountId, contact.name, contact.email, contact.phone, contact.title, contact.department, contact.is_primary);
    contactIds[contact.name] = result.lastInsertRowid as number;
  }

  // Create opportunity
  db.prepare(`
    INSERT INTO opportunities (account_id, name, amount, stage, forecast_category, close_date, probability)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    accountId,
    'ESPN Streaming Platform Deal',
    450000,
    'negotiation',
    'commit',
    '2026-03-15',
    75
  );

  // Create emails
  const emails = [
    {
      contact_id: contactIds['Sarah Chen'],
      subject: 'Re: API Performance Requirements',
      body: `Hi Brett,

Thanks for the detailed breakdown of API latency benchmarks. The sub-100ms p99 latency you're showing is exactly what we need for our live streaming use case.

I've shared this with David and the streaming team. They're particularly interested in the CDN integration points you mentioned. Could we schedule a technical deep-dive next week?

Also, Robert (our CTO) would like to join the next executive call. He's been following this project closely.

Best,
Sarah`,
      direction: 'inbound',
      sent_at: '2026-01-20T14:32:00Z'
    },
    {
      contact_id: contactIds['Sarah Chen'],
      subject: 'ESPN Technical Requirements - Follow Up',
      body: `Hi Sarah,

Great speaking with you today! As promised, I'm attaching our technical architecture document that addresses your streaming latency concerns.

Key highlights:
- Sub-50ms API response times for metadata queries
- Real-time score update propagation < 200ms
- 99.99% uptime SLA with geographic redundancy

Let me know if you have questions. Happy to set up a technical deep-dive with David and team.

Best,
Brett`,
      direction: 'outbound',
      sent_at: '2026-01-15T10:15:00Z'
    },
    {
      contact_id: contactIds['Marcus Johnson'],
      subject: 'Product Roadmap Alignment',
      body: `Brett,

Following up on our conversation about the fantasy sports integration. I've gotten buy-in from the product leadership team on the proposed timeline.

A few questions:
1. Can we get early access to the beta API?
2. What's the onboarding process for our dev team?
3. Are there usage-based pricing tiers we should consider?

Marcus`,
      direction: 'inbound',
      sent_at: '2026-01-18T09:45:00Z'
    },
    {
      contact_id: contactIds['Jennifer Walsh'],
      subject: 'Procurement Process Update',
      body: `Hi Brett,

Good news - I've gotten preliminary budget approval for Q1. We're looking at a 3-year commitment with the option to expand.

Next steps from our side:
1. Security review (targeting completion by Feb 1)
2. Legal contract review (Feb 1-15)
3. Final executive sign-off (Feb 15-28)

Can you send over the MSA and SOW drafts?

Thanks,
Jennifer`,
      direction: 'inbound',
      sent_at: '2026-01-22T16:20:00Z'
    },
    {
      contact_id: contactIds['David Kim'],
      subject: 'Technical Questions - CDN Integration',
      body: `Hey Brett,

Quick questions from the streaming team:

1. Do you support multi-CDN failover configurations?
2. What's the cache invalidation latency?
3. Can we get a test environment set up to run our load tests?

We're particularly interested in how this handles our Sunday NFL traffic spikes (we see 10x normal load).

-David`,
      direction: 'inbound',
      sent_at: '2026-01-19T11:30:00Z'
    },
    {
      contact_id: contactIds['David Kim'],
      subject: 'Re: Technical Questions - CDN Integration',
      body: `Hi David,

Great questions! Here are the answers:

1. Yes, we support multi-CDN with automatic failover. Current integrations include Akamai, Cloudflare, and Fastly.
2. Cache invalidation is < 500ms globally, with regional propagation in < 100ms.
3. Absolutely - I'll have our solutions team spin up a dedicated test environment by EOD tomorrow.

For your NFL traffic spikes, we've handled similar patterns with other sports clients. Our auto-scaling can handle 20x bursts within 30 seconds.

Let me know when you'd like to schedule the load testing session.

Brett`,
      direction: 'outbound',
      sent_at: '2026-01-19T15:45:00Z'
    },
  ];

  const insertEmail = db.prepare(`
    INSERT INTO emails (account_id, contact_id, subject, body, direction, sent_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const email of emails) {
    insertEmail.run(accountId, email.contact_id, email.subject, email.body, email.direction, email.sent_at);
  }

  // Create conversations (call transcripts)
  const conversations = [
    {
      contact_id: contactIds['Sarah Chen'],
      title: 'Discovery Call - ESPN Streaming Requirements',
      transcript_vtt: `WEBVTT

00:00:05.000 --> 00:00:12.000
Brett: Thanks for taking the time today, Sarah. I'd love to understand more about ESPN's streaming infrastructure challenges.

00:00:13.000 --> 00:00:35.000
Sarah: Of course! So our main pain point is latency during live events. We're seeing delays of 15-30 seconds compared to cable, and fans are complaining about seeing scores on social media before the play happens on their stream.

00:00:36.000 --> 00:00:52.000
Brett: That's a common challenge. What's your current architecture for real-time updates?

00:00:53.000 --> 00:01:20.000
Sarah: We're using a custom WebSocket solution, but it doesn't scale well during peak events. NFL Sundays are our worst case - we see 10 million concurrent viewers and our current system starts dropping connections.

00:01:21.000 --> 00:01:45.000
Brett: Got it. We've solved similar problems for other sports media clients. Our edge network can handle that scale with sub-second latency. Would a technical deep-dive with your streaming team be helpful?

00:01:46.000 --> 00:02:00.000
Sarah: Definitely. Let me loop in David Kim, he leads our streaming infrastructure. He'll have the detailed technical questions.`,
      duration_seconds: 1847,
      occurred_at: '2026-01-10T15:00:00Z'
    },
    {
      contact_id: contactIds['David Kim'],
      title: 'Technical Deep-Dive - Architecture Review',
      transcript_vtt: `WEBVTT

00:00:00.000 --> 00:00:15.000
Brett: David, thanks for joining. Sarah mentioned you had some detailed technical questions about our architecture.

00:00:16.000 --> 00:00:45.000
David: Yeah, we need to understand how this integrates with our existing CDN setup. We're using Akamai primarily, with Cloudflare as backup.

00:00:46.000 --> 00:01:10.000
Brett: Perfect, we support both. Our edge nodes can sit in front of your existing CDN or work alongside it. The key is our intelligent routing layer that decides which path has the lowest latency for each user.

00:01:11.000 --> 00:01:40.000
David: What about our WebSocket connections? We have custom protocols for real-time score updates.

00:01:41.000 --> 00:02:15.000
Brett: We can proxy those through our network. Actually, most clients end up migrating to our pub/sub system because it handles the scaling automatically. You wouldn't need to manage connection pooling anymore.

00:02:16.000 --> 00:02:30.000
David: That's interesting. Can we get a test environment to run our benchmarks?`,
      duration_seconds: 2654,
      occurred_at: '2026-01-17T14:00:00Z'
    },
    {
      contact_id: contactIds['Robert Martinez'],
      title: 'Executive Sponsor Call - CTO Review',
      transcript_vtt: `WEBVTT

00:00:00.000 --> 00:00:20.000
Robert: I've heard good things from Sarah and David about your solution. Before we move forward, I want to understand the strategic fit.

00:00:21.000 --> 00:00:50.000
Brett: Absolutely, Robert. At a high level, we're helping ESPN deliver a cable-quality streaming experience with lower infrastructure costs and better scalability.

00:00:51.000 --> 00:01:25.000
Robert: The cost piece is important. We're investing heavily in direct-to-consumer, and streaming infrastructure is one of our biggest line items. What kind of savings have other media companies seen?

00:01:26.000 --> 00:02:00.000
Brett: Typically 30-40% reduction in CDN costs, plus significant engineering time savings from not having to build custom scaling solutions. For a company your size, that could be $5-10M annually.

00:02:01.000 --> 00:02:20.000
Robert: Those numbers align with what we're hoping for. What's the implementation timeline look like?`,
      duration_seconds: 1523,
      occurred_at: '2026-01-21T11:00:00Z'
    }
  ];

  const insertConversation = db.prepare(`
    INSERT INTO conversations (account_id, contact_id, title, transcript_vtt, duration_seconds, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const conv of conversations) {
    insertConversation.run(accountId, conv.contact_id, conv.title, conv.transcript_vtt, conv.duration_seconds, conv.occurred_at);
  }

  // Create Slack messages
  const slackMessages = [
    { channel: '#deals-espn', author: 'Brett', content: "Just had a great call with Sarah Chen (VP Eng). They're very interested in our streaming optimization. Main concerns are latency and NFL Sunday traffic spikes.", sent_at: '2026-01-10T16:30:00Z' },
    { channel: '#deals-espn', author: 'Alex (SE)', content: 'I can set up a POC environment for their load testing. When do they need it?', sent_at: '2026-01-10T16:45:00Z' },
    { channel: '#deals-espn', author: 'Brett', content: '@Alex end of this week would be ideal. David Kim (their tech lead) wants to run benchmarks.', sent_at: '2026-01-10T16:48:00Z' },
    { channel: '#deals-espn', author: 'Sam (CSM)', content: 'FYI - ESPN is a Disney subsidiary, so this could open doors to Disney+, Hulu, and other properties if we nail this.', sent_at: '2026-01-12T09:15:00Z' },
    { channel: '#deals-espn', author: 'Brett', content: 'Update: Jennifer from procurement says budget is approved! 🎉 Security review starts next week, targeting Feb close.', sent_at: '2026-01-22T17:00:00Z' },
    { channel: '#deals-espn', author: 'Lisa (Legal)', content: "I'll start preparing the MSA. Any special terms we discussed?", sent_at: '2026-01-22T17:15:00Z' },
    { channel: '#deals-espn', author: 'Brett', content: '@Lisa They want a 3-year term with expansion rights. Also SLA guarantees for sub-100ms p99 latency.', sent_at: '2026-01-22T17:20:00Z' },
  ];

  const insertSlack = db.prepare(`
    INSERT INTO slack_messages (account_id, channel, author, content, sent_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const msg of slackMessages) {
    insertSlack.run(accountId, msg.channel, msg.author, msg.content, msg.sent_at);
  }

  // Create calendar events
  const calendarEvents = [
    {
      title: 'ESPN Discovery Call',
      description: 'Initial discovery call to understand ESPN streaming requirements',
      attendees_json: JSON.stringify(['Sarah Chen', 'Brett']),
      start_time: '2026-01-10T15:00:00Z',
      end_time: '2026-01-10T15:30:00Z',
      meeting_type: 'discovery'
    },
    {
      title: 'ESPN Technical Deep-Dive',
      description: 'Architecture review with ESPN streaming team',
      attendees_json: JSON.stringify(['David Kim', 'Brett', 'Alex (SE)']),
      start_time: '2026-01-17T14:00:00Z',
      end_time: '2026-01-17T15:00:00Z',
      meeting_type: 'technical'
    },
    {
      title: 'ESPN CTO Call',
      description: 'Executive sponsor call with Robert Martinez',
      attendees_json: JSON.stringify(['Robert Martinez', 'Sarah Chen', 'Brett']),
      start_time: '2026-01-21T11:00:00Z',
      end_time: '2026-01-21T11:30:00Z',
      meeting_type: 'executive'
    },
    {
      title: 'ESPN Contract Review',
      description: 'Review MSA and SOW terms with procurement',
      attendees_json: JSON.stringify(['Jennifer Walsh', 'Brett', 'Lisa (Legal)']),
      start_time: '2026-02-05T14:00:00Z',
      end_time: '2026-02-05T15:00:00Z',
      meeting_type: 'negotiation'
    },
    {
      title: 'ESPN Executive Sign-off',
      description: 'Final approval call with CTO and VP Engineering',
      attendees_json: JSON.stringify(['Robert Martinez', 'Sarah Chen', 'Jennifer Walsh', 'Brett']),
      start_time: '2026-02-20T16:00:00Z',
      end_time: '2026-02-20T17:00:00Z',
      meeting_type: 'closing'
    }
  ];

  const insertEvent = db.prepare(`
    INSERT INTO calendar_events (account_id, title, description, attendees_json, start_time, end_time, meeting_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const event of calendarEvents) {
    insertEvent.run(accountId, event.title, event.description, event.attendees_json, event.start_time, event.end_time, event.meeting_type);
  }

  // Create files
  const files = [
    {
      name: 'ESPN RFP - Streaming Infrastructure.pdf',
      file_type: 'pdf',
      description: 'Original RFP document from ESPN procurement',
      content_summary: 'RFP for streaming infrastructure optimization. Key requirements: sub-second latency for live sports, support for 10M+ concurrent viewers, multi-CDN architecture, 99.99% uptime SLA. Budget range: $400K-600K annually. Decision timeline: Q1 2026.'
    },
    {
      name: 'ESPN Technical Requirements v2.docx',
      file_type: 'docx',
      description: 'Detailed technical requirements from David Kim',
      content_summary: 'Technical specifications including: WebSocket protocol support, Akamai/Cloudflare CDN integration, cache invalidation < 1s, auto-scaling for 20x traffic bursts, geographic redundancy across US regions, real-time analytics dashboard.'
    },
    {
      name: 'ESPN Use Cases - Fantasy & Betting.pdf',
      file_type: 'pdf',
      description: 'Product use cases from Marcus Johnson',
      content_summary: 'Primary use cases: 1) Real-time score updates for fantasy sports apps, 2) Live odds integration for ESPN Bet, 3) Second-screen experience synchronization, 4) Push notifications for scoring plays. Latency requirements vary by use case from 100ms to 2s.'
    },
    {
      name: 'ESPN Pricing Proposal v3.xlsx',
      file_type: 'xlsx',
      description: 'Our pricing proposal sent to Jennifer',
      content_summary: 'Three-year deal structure: Year 1: $450K, Year 2: $475K, Year 3: $500K. Includes: unlimited API calls, dedicated support, SLA guarantees, professional services for integration. Volume discounts available for Disney portfolio expansion.'
    }
  ];

  const insertFile = db.prepare(`
    INSERT INTO files (account_id, name, file_type, description, content_summary)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const file of files) {
    insertFile.run(accountId, file.name, file.file_type, file.description, file.content_summary);
  }

  // Create memories
  const memories = [
    { contact_id: contactIds['Sarah Chen'], category: 'preference', content: 'Sarah prefers async communication via email over calls. Best response times are Tuesday-Thursday mornings.' },
    { contact_id: contactIds['Sarah Chen'], category: 'relationship', content: 'Sarah is the key technical decision-maker. She reports directly to the CTO and has strong influence on vendor selection.' },
    { contact_id: contactIds['David Kim'], category: 'technical_need', content: 'David\'s primary concern is API latency during NFL Sunday traffic spikes. Current system drops connections at 10M concurrent users.' },
    { contact_id: contactIds['David Kim'], category: 'preference', content: 'David is very detail-oriented and appreciates thorough technical documentation. Prefers to see benchmarks and real data over marketing claims.' },
    { contact_id: contactIds['Marcus Johnson'], category: 'technical_need', content: 'Marcus needs real-time data for fantasy sports scoring. Current 15-30 second delays are causing user complaints.' },
    { contact_id: contactIds['Jennifer Walsh'], category: 'decision_process', content: 'Jennifer has budget authority up to $500K. Anything above requires VP Finance approval. Prefers 3-year terms for better pricing.' },
    { contact_id: contactIds['Robert Martinez'], category: 'objection', content: 'Robert expressed concern about vendor lock-in. Emphasized need for data portability and standard APIs.' },
    { contact_id: null, category: 'decision_process', content: 'ESPN decision process: Technical evaluation (David) → Business case (Marcus) → Procurement (Jennifer) → Executive approval (Robert). Sarah coordinates across all stakeholders.' },
    { contact_id: null, category: 'relationship', content: 'ESPN is a Disney subsidiary. Success here could lead to opportunities with Disney+, Hulu, and ABC. Sam (CSM) has Disney contacts.' },
    { contact_id: contactIds['Sarah Chen'], category: 'objection', content: 'Sarah mentioned they had a bad experience with a previous vendor who promised low latency but couldn\'t deliver at scale. Trust and proof points are important.' }
  ];

  const insertMemory = db.prepare(`
    INSERT INTO memories (account_id, contact_id, category, content)
    VALUES (?, ?, ?, ?)
  `);

  for (const memory of memories) {
    insertMemory.run(accountId, memory.contact_id, memory.category, memory.content);
  }

  // Create tasks - mix of completed (past milestones) and open (current priorities)
  const tasks = [
    // Completed tasks (deal progress milestones)
    { title: 'Send discovery deck to Sarah', description: 'Initial capabilities overview for VP Engineering', status: 'done', due_date: '2026-01-08' },
    { title: 'Complete technical scoping call', description: 'Architecture review with David and streaming team', status: 'done', due_date: '2026-01-17' },
    { title: 'Set up POC environment for David', description: 'David needs a test environment to run load testing benchmarks', status: 'done', due_date: '2026-01-20' },
    { title: 'Send ROI calculator to Marcus', description: 'Business case modeling for fantasy sports latency improvements', status: 'done', due_date: '2026-01-21' },
    { title: 'CTO intro call with Robert', description: 'Executive sponsor alignment meeting', status: 'done', due_date: '2026-01-21' },

    // Open tasks (current action items)
    { title: 'Send MSA draft to Jennifer', description: 'Jennifer requested MSA and SOW documents for legal review', status: 'todo', due_date: '2026-01-27' },
    { title: 'Schedule technical deep-dive follow-up', description: 'David had additional questions about WebSocket migration path', status: 'todo', due_date: '2026-01-28' },
    { title: 'Share NFL case study with Robert', description: 'Robert asked for references from similar media company deployments', status: 'todo', due_date: '2026-01-29' },
    { title: 'Prepare security questionnaire responses', description: 'Complete ESPN security review questionnaire before Feb 1 deadline', status: 'todo', due_date: '2026-01-31' },
    { title: 'Coordinate POC results review', description: 'Schedule call to walk through benchmark results with David', status: 'todo', due_date: '2026-02-03' },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (account_id, title, description, status, due_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const task of tasks) {
    insertTask.run(accountId, task.title, task.description, task.status, task.due_date);
  }
}

// Query functions
export function getAccounts() {
  return db.prepare('SELECT * FROM accounts ORDER BY created_at DESC').all();
}

export function getAccount(id: number) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
}

export function getContacts(accountId?: number) {
  if (accountId) {
    return db.prepare('SELECT * FROM contacts WHERE account_id = ? ORDER BY is_primary DESC, name').all(accountId);
  }
  return db.prepare('SELECT * FROM contacts ORDER BY name').all();
}

export function getContact(id: number) {
  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
}

export function getOpportunities(accountId?: number) {
  if (accountId) {
    return db.prepare('SELECT * FROM opportunities WHERE account_id = ? ORDER BY close_date').all(accountId);
  }
  return db.prepare('SELECT * FROM opportunities ORDER BY close_date').all();
}

export function getOpportunity(id: number) {
  return db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
}

export function getEmails(accountId?: number, contactId?: number, limit = 20) {
  if (contactId) {
    return db.prepare('SELECT * FROM emails WHERE contact_id = ? ORDER BY sent_at DESC LIMIT ?').all(contactId, limit);
  }
  if (accountId) {
    return db.prepare('SELECT * FROM emails WHERE account_id = ? ORDER BY sent_at DESC LIMIT ?').all(accountId, limit);
  }
  return db.prepare('SELECT * FROM emails ORDER BY sent_at DESC LIMIT ?').all(limit);
}

export function getConversations(accountId?: number, contactId?: number) {
  if (contactId) {
    return db.prepare('SELECT * FROM conversations WHERE contact_id = ? ORDER BY occurred_at DESC').all(contactId);
  }
  if (accountId) {
    return db.prepare('SELECT * FROM conversations WHERE account_id = ? ORDER BY occurred_at DESC').all(accountId);
  }
  return db.prepare('SELECT * FROM conversations ORDER BY occurred_at DESC').all();
}

export function getSlackMessages(accountId?: number, limit = 20) {
  if (accountId) {
    return db.prepare('SELECT * FROM slack_messages WHERE account_id = ? ORDER BY sent_at DESC LIMIT ?').all(accountId, limit);
  }
  return db.prepare('SELECT * FROM slack_messages ORDER BY sent_at DESC LIMIT ?').all(limit);
}

export function getCalendarEvents(accountId?: number, upcoming = false) {
  const now = new Date().toISOString();
  if (accountId) {
    if (upcoming) {
      return db.prepare('SELECT * FROM calendar_events WHERE account_id = ? AND start_time > ? ORDER BY start_time').all(accountId, now);
    }
    return db.prepare('SELECT * FROM calendar_events WHERE account_id = ? ORDER BY start_time DESC').all(accountId);
  }
  if (upcoming) {
    return db.prepare('SELECT * FROM calendar_events WHERE start_time > ? ORDER BY start_time').all(now);
  }
  return db.prepare('SELECT * FROM calendar_events ORDER BY start_time DESC').all();
}

export function getFiles(accountId?: number) {
  if (accountId) {
    return db.prepare('SELECT * FROM files WHERE account_id = ? ORDER BY created_at DESC').all(accountId);
  }
  return db.prepare('SELECT * FROM files ORDER BY created_at DESC').all();
}

export function getMemories(accountId?: number, contactId?: number, category?: string) {
  let query = 'SELECT * FROM memories WHERE 1=1';
  const params: (number | string)[] = [];

  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }
  if (contactId) {
    query += ' AND contact_id = ?';
    params.push(contactId);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';
  return db.prepare(query).all(...params);
}

export function getTasks(accountId?: number, status?: string) {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params: (number | string)[] = [];

  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY due_date';
  return db.prepare(query).all(...params);
}

// Mutation functions
export function createContact(data: { accountId?: number; name: string; email?: string; phone?: string; title?: string; department?: string }) {
  const result = db.prepare(`
    INSERT INTO contacts (account_id, name, email, phone, title, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.accountId || null, data.name, data.email || null, data.phone || null, data.title || null, data.department || null);
  return { id: result.lastInsertRowid, ...data };
}

export function updateContact(id: number, data: Partial<{ name: string; email: string; phone: string; title: string; department: string }>) {
  const fields = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined);
  if (fields.length === 0) return getContact(id);

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f as keyof typeof data]);

  db.prepare(`UPDATE contacts SET ${setClause} WHERE id = ?`).run(...values, id);
  return getContact(id);
}

export function deleteContact(id: number) {
  return db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
}

export function createTask(data: { accountId?: number; title: string; description?: string; dueDate?: string }) {
  const result = db.prepare(`
    INSERT INTO tasks (account_id, title, description, due_date)
    VALUES (?, ?, ?, ?)
  `).run(data.accountId || null, data.title, data.description || null, data.dueDate || null);
  return { id: result.lastInsertRowid, status: 'todo', ...data };
}

export function updateTaskStatus(id: number, status: 'todo' | 'in_progress' | 'done') {
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export function deleteTask(id: number) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

export function createMemory(data: { accountId: number; contactId?: number; category: string; content: string; confidence?: number }) {
  const result = db.prepare(`
    INSERT INTO memories (account_id, contact_id, category, content, confidence)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.accountId, data.contactId || null, data.category, data.content, data.confidence || 0.8);
  return { id: result.lastInsertRowid, ...data };
}

export function updateOpportunityStage(id: number, stage: string) {
  db.prepare('UPDATE opportunities SET stage = ? WHERE id = ?').run(stage, id);
  return db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
}

export function updateOpportunityCloseDate(id: number, closeDate: string) {
  db.prepare('UPDATE opportunities SET close_date = ? WHERE id = ?').run(closeDate, id);
  return db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
}

// Chat functions
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ui?: unknown;
  timestamp: string;
}

export interface Chat {
  id: number;
  title: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
}

export function getChats(): Chat[] {
  return db.prepare('SELECT * FROM chats ORDER BY updated_at DESC').all() as Chat[];
}

export function getChat(id: number): Chat | undefined {
  return db.prepare('SELECT * FROM chats WHERE id = ?').get(id) as Chat | undefined;
}

export function createChat(title: string, messages: ChatMessage[]): Chat {
  const result = db.prepare(`
    INSERT INTO chats (title, messages_json)
    VALUES (?, ?)
  `).run(title, JSON.stringify(messages));
  return getChat(result.lastInsertRowid as number)!;
}

export function updateChat(id: number, title: string, messages: ChatMessage[]): Chat | undefined {
  db.prepare(`
    UPDATE chats SET title = ?, messages_json = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, JSON.stringify(messages), id);
  return getChat(id);
}

export function deleteChat(id: number) {
  return db.prepare('DELETE FROM chats WHERE id = ?').run(id);
}

export default db;
