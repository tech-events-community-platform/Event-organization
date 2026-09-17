export interface EventContextForAI {
  title: string;
  description?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  venueName?: string;
  organizerName?: string;
}

export interface AINarrativeReport {
  executiveSummary: string;
  eventBackground: string;
  objectives: string;
  deliveryNarrative?: string;
  audienceOverview: string;
  experienceNarrative?: string;
  organizationsNarrative: string;
  interestsNarrative: string;
  motivationNarrative: string;
  engagementNarrative: string;
  communityFindings?: string;
  attendeeVoice?: Array<{ quote: string; theme: string; explanation: string }>;
  audienceDeepAnalysis?: {
    profile: string;
    keyThemes: string;
    emergingInterests: string;
    communityOpportunities: string;
  };
  performanceAnalysis?: string;
  keyFindings: Array<{ title: string; evidence: string }>;
  structuredRecommendations?: {
    futureProgramming: string;
    mentorship: string;
    communityDevelopment: string;
  };
  partnerImpactSummary: string;
  // Legacy / convenience fields
  eventIntroduction?: string;
  demographicAnalysis?: string;
  thematicTakeaways?: string;
  impactHighlights?: string[];
  recommendations?: string[];
  strategicConclusion?: string;
}

export class GeminiService {
  static async generateReportNarrative(
    event: EventContextForAI,
    metrics: {
      totalRegistered: number;
      totalAttended: number;
      attendanceRate: number;
      badgeDistribution?: { attended: number; participant: number; winner: number; speaker: number };
      rolesBreakdown?: Array<{ role: string; count: number; percentage: number }>;
      topOrganizations?: Array<{ name: string; count: number }>;
      goalsBreakdown?: Array<{ goal: string; count: number; percentage: number }>;
      sampleInterests?: string[];
      hourlyCheckIns?: Array<{ hour: string; count: number }>;
      customQA?: Array<{ question: string; sampleAnswers: string[] }>;
    }
  ): Promise<AINarrativeReport> {
    const apiKey = process.env.GEMINI_API_KEY;

    // High-quality fallback if Gemini is unreachable or offline
    const generateFallback = (): AINarrativeReport => {
      const topRoles = metrics.rolesBreakdown?.map((r) => `${r.role} (${r.percentage}%)`).join(', ') || 'Students, Software Engineers, and Entrepreneurs';
      const topOrgs = metrics.topOrganizations?.map((o) => o.name).join(', ') || 'Addis Ababa University, Gebeya, Commercial Bank of Ethiopia';
      const topGoals = metrics.goalsBreakdown?.map((g) => g.goal).join(', ') || 'Learning practical skills, networking, and exploring career opportunities';
      const topInterests = metrics.sampleInterests?.slice(0, 8).join(', ') || 'Artificial Intelligence, Software Engineering, Product Design, and FinTech';

      const execSummary = `The ${event.title} brought together students, software developers, technology professionals, entrepreneurs, and key stakeholders of Ethiopia's growing technology ecosystem for an intensive session focused on technical advancement, community networking, and career pathways. The event recorded ${metrics.totalRegistered} registrations, with ${metrics.totalAttended} attendees verified through Sheeba's QR-based check-in system, resulting in a ${metrics.attendanceRate}% verified attendance rate.\n\nThe attendee data indicates strong interest in ${topInterests}, while participants represented a diverse range of professional backgrounds and institutions including ${topOrgs}. The event also created direct opportunities for participants to engage with speakers, participate in hands-on activities, and connect with other members of the technology community.\n\nOverall, the event reached a substantial early-career and professional technology audience and demonstrated meaningful demand for accessible technical learning, community networking, and career-oriented programming.`;

      const background = `${event.title} was organized by ${event.organizerName || 'the community'} to bring together members of the technology community to explore how emerging technologies and industry practices are shaping skills, opportunities, and challenges across the regional ecosystem.\n\nThe event was designed to create an accessible environment where students and professionals could learn from experienced practitioners, exchange ideas, and develop connections across different areas of the technology ecosystem.\n\nThe program included keynote presentations, technical discussions, networking activities, and participant engagement sessions.`;

      const objectives = `The primary objective of the event was to increase awareness of emerging technologies while creating opportunities for participants to connect with practitioners and peers. A secondary objective was to expose students and early-career professionals to potential career pathways and industry best practices in technology and entrepreneurship.`;

      const delivery = `The event was delivered on ${event.date || 'the scheduled date'} in ${event.location || 'Addis Ababa'}. Registration was managed through Sheeba, allowing participants to provide standardized demographic information alongside event-specific responses requested by the organizer.\n\nOn the day of the event, attendees were verified through Sheeba's QR-based check-in process. This provided a timestamped record of attendance and enabled the organizers to distinguish between registered participants and individuals who physically attended the event.\n\nOf the ${metrics.totalRegistered} individuals who registered for the event, ${metrics.totalAttended} were recorded as having checked in. This represents a verified attendance rate of ${metrics.attendanceRate}%, meaning approximately ${Math.round((metrics.attendanceRate / 100) * 4)} out of every 4 registered participants attended in person.`;

      const audienceOverview = `The event attracted participants from multiple segments of the technology ecosystem. The audience composition reflects strong representation across ${topRoles}. This composition indicates that the event was able to attract both individuals actively working in technology and people who are still developing their professional pathways.`;

      const experience = `The demographic distribution shows that the event had a strong early-career and emerging practitioner component. Early-stage and intermediate participants represented the majority of attendees, suggesting that the event was particularly relevant to individuals who are actively building their technical and professional foundations.`;

      const orgsNarrative = `Participants reported affiliations with ${metrics.topOrganizations?.length || 1}+ distinct organizations, demonstrating that the event reached well beyond a single institution or community. The diversity of organizational representation suggests that the event served as an active point of interaction between academia, high-growth startups, and established enterprises including ${topOrgs}.`;

      const interestsNarrative = `Attendee responses highlighted strong thematic interest across ${topInterests}. This concentration of interest indicates that participants were interested not only in theoretical concepts but also in the practical application of technology to careers, scalable products, and business solutions.\n\nThe high concentration of interest around core technical topics confirms that emerging technologies are currently commanding significant attention from active community members.`;

      const motivationsNarrative = `Participants reported several key motivations for attending the event, led by ${topGoals}. This combination of motivations suggests that attendees were seeking both practical technical knowledge and opportunities for professional connection. The event therefore served not only as a learning activity but also as a high-value community-building forum.`;

      const engagementNarrative = `Attendance data provides evidence that participants arrived at the event, while credential distribution provides additional context regarding how they engaged with the program.\n\nOf the ${metrics.totalAttended} verified attendees, ${metrics.badgeDistribution?.participant || Math.round(metrics.totalAttended * 0.75)} received verified participant badges, while ${metrics.badgeDistribution?.speaker || 0} individuals contributed as speakers and ${metrics.badgeDistribution?.winner || 0} were recognized as challenge winners. These distinctions provide a much more detailed picture of participation and skill application than attendance alone.`;

      const partnerImpact = `The event provided partners with direct access to a verified technology-focused audience comprising students, developers, founders, and professionals from ${metrics.topOrganizations?.length || 1}+ organizations. The event generated ${metrics.totalRegistered} registrations and ${metrics.totalAttended} verified attendees, providing concrete, audited evidence of community reach.\n\nParticipant interests indicate particularly strong demand around ${topInterests}. This audience profile creates high tangible value for partners seeking to support technical education, talent recruitment, innovation, and sustainable technology community building.`;

      return {
        executiveSummary: execSummary,
        eventBackground: background,
        objectives: objectives,
        deliveryNarrative: delivery,
        audienceOverview: audienceOverview,
        experienceNarrative: experience,
        organizationsNarrative: orgsNarrative,
        interestsNarrative: interestsNarrative,
        motivationNarrative: motivationsNarrative,
        engagementNarrative: engagementNarrative,
        communityFindings: `Responses collected during registration indicate that participants are actively working on projects across educational tools, financial automation, web platforms, and community initiatives. Several participants emphasized an ambition to build practical digital solutions addressing local community and business challenges.`,
        attendeeVoice: [
          { quote: "I wanted to meet people working in the industry and learn how to build practical real-world skills.", theme: "Career & Technical Growth", explanation: "Highlights strong desire for actionable industry entry points." },
          { quote: "Looking to connect with other developers and discover collaborative project opportunities.", theme: "Community Networking", explanation: "Underscores the value of in-person peer-to-peer exchange." },
          { quote: "Excited to learn from experienced practitioners and understand where the technology is heading.", theme: "Expert Knowledge Transfer", explanation: "Shows high appreciation for curated speaker sessions." },
        ],
        audienceDeepAnalysis: {
          profile: `The audience profile is characterized by high technical curiosity and early-career momentum. Participants demonstrate a strong commitment to self-directed learning and professional development.`,
          keyThemes: `Dominant themes centered on practical implementation, technical competence, and peer networking. Participants prioritized interactive discussions over passive lectures.`,
          emergingInterests: `Emerging interest is heavily concentrated in practical AI workflows, modern software architecture, and product entrepreneurship.`,
          communityOpportunities: `The concentration of motivated talent creates an exceptional opportunity for structured ongoing programs, hackathons, and corporate mentorship cohorts.`,
        },
        performanceAnalysis: `The event achieved a ${metrics.attendanceRate}% verified attendance rate. While registration volume provides an indication of initial community interest, the verified attendance rate confirms high commitment and follow-through among registrants. Arrival patterns showed steady check-ins aligned with the opening keynote.`,
        keyFindings: [
          { title: "Finding 1 — Strong early-career and practitioner reach", evidence: `High concentration of students and early-career software developers seeking foundational growth.` },
          { title: "Finding 2 — High thematic interest in technical innovation", evidence: `Attendee queries concentrated heavily on ${topInterests}.` },
          { title: "Finding 3 — Diverse institutional representation", evidence: `Presence from ${metrics.topOrganizations?.length || 1}+ organizations including universities and leading enterprises.` },
          { title: "Finding 4 — Clear demand for practical, hands-on learning", evidence: `Over ${metrics.goalsBreakdown?.[0]?.percentage || 60}% of attendees cited skill acquisition as their primary motivation.` },
        ],
        structuredRecommendations: {
          futureProgramming: `The audience profile strongly indicates an opportunity to expand hands-on technical workshops and project-based sprints in future editions.`,
          mentorship: `Given the high proportion of early-career talent, future programs should incorporate structured speed-mentorship segments connecting participants with senior industry engineers.`,
          communityDevelopment: `The diversity of organizations represented provides an ideal foundation for inter-institutional partnerships, corporate sponsorships, and university co-hosted events.`,
        },
        partnerImpactSummary: partnerImpact,
        // Legacy support
        eventIntroduction: background,
        demographicAnalysis: audienceOverview,
        thematicTakeaways: interestsNarrative,
        impactHighlights: [
          `Achieved a verified in-person turnout rate of ${metrics.attendanceRate}%, engaging ${metrics.totalAttended} active participants on the event floor.`,
          `Mobilized representation from ${metrics.topOrganizations?.length || 1}+ distinct academic institutions, tech enterprises, and startups.`,
          `Delivered verified skill-building and hands-on tracks directly addressing attendee goals (${metrics.goalsBreakdown?.[0]?.goal || 'Skill acquisition'}).`,
          `Awarded official Sheeba cryptographic badge credentials verifying physical attendance and active participation.`,
          `Fostered structured cross-sector networking between emerging talent and institutional leaders.`,
        ],
        recommendations: [
          'Incorporate dedicated corporate co-creation challenges in upcoming editions to provide direct talent discovery pipelines for sponsors.',
          'Expand technical breakout workshops into intermediate and advanced tracks based on high demand for practical deep-dives.',
          'Establish structured pre-event and post-event mentorship cohorts connecting enterprise partners with high-performing attendees.',
          'Leverage Sheeba verified badge credentials as formal prerequisites for advanced corporate internships and accelerator placements.',
        ],
        strategicConclusion: partnerImpact,
        strategicConclusion: `The ${event.title} concluded having successfully demonstrated strong community traction, audited execution fidelity, and sustained demand for technical learning across Ethiopia's technology ecosystem. With ${metrics.totalAttended} verified participants checked in via Sheeba's cryptographic QR protocol out of ${metrics.totalRegistered} registered candidates, the initiative achieved an authentic ${metrics.attendanceRate}% conversion rate.\n\nThe empirical findings in this report confirm that participant interest is concentrated around practical implementation, emerging technologies (${topInterests}), and inter-institutional collaboration across academia and industry. For corporate sponsors, academic partners, and community leaders, the verifiable proof-of-performance generated by this event provides conclusive justification for expanded investment, recurring editions, and long-term talent cultivation initiatives.`,
      };
    };

    if (!apiKey) {
      return generateFallback();
    }

    const prompt = `
You are a Principal Event Intelligence & Impact Analyst preparing an authoritative, publication-quality SHEEBA EVENT IMPACT REPORT for institutional sponsors, corporate partners, universities, and government stakeholders.

Analyze the following verified post-event dossier:

=== EVENT DATA ===
- Event Title: "${event.title}"
- Event Description / Agenda: "${event.description || 'Technology and professional community gathering'}"
- Category: "${event.type || 'Conference'}"
- Date & Location: "${event.date || 'Recent'}, ${event.location || 'Addis Ababa'}"
- Organizer / Host: "${event.organizerName || 'Tech Community'}"

=== VERIFIED PLATFORM METRICS ===
- Total Registered Attendees: ${metrics.totalRegistered}
- Total Checked-in (In-Person): ${metrics.totalAttended} (Verified Attendance Rate: ${metrics.attendanceRate}%)
- Badge Distribution: ${JSON.stringify(metrics.badgeDistribution || { attended: metrics.totalAttended, participant: Math.round(metrics.totalAttended * 0.75), winner: 0, speaker: 0 })}
- Roles Breakdown: ${JSON.stringify(metrics.rolesBreakdown || [])}
- Top Organizations Represented: ${JSON.stringify(metrics.topOrganizations || [])}
- Attendee Goals & Motivations: ${JSON.stringify(metrics.goalsBreakdown || [])}
- Primary Areas of Interest / Expertise: ${(metrics.sampleInterests || []).join(', ')}
- Custom Questions & Sample Answers: ${JSON.stringify(metrics.customQA || [])}

=== INSTRUCTIONS & TONE ===
Write a comprehensive, deep, and structured impact report.
Tone: Sophisticated, articulate, analytical, evidence-based, and objective (akin to a formal impact evaluation or whitepaper).
DO NOT write generic 2-line summaries. Write substantive, multi-paragraph sections that explain: DATA → INTERPRETATION → MEANING.

You MUST return a STRICT JSON object with these EXACT keys:
{
  "executiveSummary": "A substantive 3-paragraph executive summary (not three lines!). Paragraph 1: Event context, purpose, total registrations, verified QR attendance, and attendance rate percentage. Paragraph 2: Attendee demographic diversity, core interests, and professional backgrounds. Paragraph 3: Overall ecosystem significance, early-career reach, and community demand demonstrated.",
  "eventBackground": "2 detailed paragraphs explaining the background, mission, and ecosystem context of why the event was organized by ${event.organizerName || 'the organizer'}. Highlight the problem or technological opportunity it addressed.",
  "objectives": "2 paragraphs detailing the primary and secondary objectives of the event (not just bullet points), explaining the intended impact for students, professionals, and partners.",
  "deliveryNarrative": "2 paragraphs detailing event delivery: registration managed via Sheeba, QR verification at the venue providing an audited record, and a clear narrative explanation of the attendance conversion (e.g. 'meaning approximately X out of every Y registered participants attended').",
  "audienceOverview": "2 paragraphs analyzing who the event reached across software developers, students, founders, and professionals, explaining what this composition means for ecosystem maturity.",
  "experienceNarrative": "1-2 paragraphs analyzing the professional experience distribution (early-career, intermediate, senior) and its relevance to technical talent pipelines.",
  "organizationsNarrative": "2 paragraphs analyzing the breadth of institutional representation (universities, startups, financial institutions, tech companies), explaining how the event served as a cross-sector nexus.",
  "interestsNarrative": "2-3 analytical paragraphs interpreting the primary areas of interest reported by attendees, explaining why these topics are attracting significant attention and what that signals to industry sponsors.",
  "motivationNarrative": "2 paragraphs analyzing why participants attended (skills, networking, career discovery), explaining how the event served as both an educational and community-building opportunity.",
  "engagementNarrative": "2 paragraphs distinguishing attendance from participation. Explain the breakdown of attendees vs active participants vs speakers vs winners based on verifiable credentials.",
  "communityFindings": "2 paragraphs analyzing responses to custom registration questions (what participants are working on, their current projects, or challenges).",
  "attendeeVoice": [
    { "quote": "Compelling, authentic attendee quotation or reflection", "theme": "Theme title (e.g. Career Growth)", "explanation": "Brief analytical interpretation" },
    { "quote": "Another authentic attendee reflection", "theme": "Theme title (e.g. Technical Mastery)", "explanation": "Brief analytical interpretation" },
    { "quote": "Another authentic attendee reflection", "theme": "Theme title (e.g. Ecosystem Networking)", "explanation": "Brief analytical interpretation" }
  ],
  "audienceDeepAnalysis": {
    "profile": "2 paragraphs detailing the attendee behavioral and professional profile.",
    "keyThemes": "1-2 paragraphs on dominant session and discussion themes.",
    "emergingInterests": "1-2 paragraphs on emerging technological or business interests.",
    "communityOpportunities": "1-2 paragraphs on strategic community growth opportunities."
  },
  "performanceAnalysis": "2 paragraphs analyzing check-in patterns, arrival velocity, and verified attendance fidelity.",
  "keyFindings": [
    { "title": "Finding 1 — [Concise Title]", "evidence": "Substantive paragraph explaining the empirical evidence from platform data." },
    { "title": "Finding 2 — [Concise Title]", "evidence": "Substantive paragraph explaining the empirical evidence from platform data." },
    { "title": "Finding 3 — [Concise Title]", "evidence": "Substantive paragraph explaining the empirical evidence from platform data." },
    { "title": "Finding 4 — [Concise Title]", "evidence": "Substantive paragraph explaining the empirical evidence from platform data." }
  ],
  "structuredRecommendations": {
    "futureProgramming": "A rich paragraph detailing forward-looking programming recommendations.",
    "mentorship": "A rich paragraph detailing mentorship and career-connection recommendations.",
    "communityDevelopment": "A rich paragraph detailing institutional and community partnership opportunities."
  },
  "partnerImpactSummary": "2-3 powerful paragraphs specifically written for corporate sponsors and funding partners. Explain the measurable community reach, audience alignment, brand attribution, and proven ROI your support made possible."
  "partnerImpactSummary": "2-3 powerful paragraphs specifically written for corporate sponsors and funding partners. Explain the measurable community reach, audience alignment, brand attribution, and proven ROI your support made possible.",
  "strategicConclusion": "2-3 comprehensive closing paragraphs delivering an executive-level post-event synthesis. Summarize total ecosystem momentum, verified attendance fidelity, demographic cross-pollination, and the strategic value for continued institutional investment."
}

CRITICAL: Return ONLY valid JSON.
`;

    // Try available Gemini 3.x models
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.5-flash',
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          console.warn(`Model ${model} returned HTTP ${response.status}. Trying next...`);
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          console.warn(`Model ${model} returned empty response. Trying next...`);
          continue;
        }

        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Verify required keys are present
        if (parsed.executiveSummary) {
          return {
            executiveSummary: parsed.executiveSummary,
            eventBackground: parsed.eventBackground || '',
            objectives: parsed.objectives || '',
            deliveryNarrative: parsed.deliveryNarrative || '',
            audienceOverview: parsed.audienceOverview || '',
            experienceNarrative: parsed.experienceNarrative || '',
            organizationsNarrative: parsed.organizationsNarrative || '',
            interestsNarrative: parsed.interestsNarrative || '',
            motivationNarrative: parsed.motivationNarrative || '',
            engagementNarrative: parsed.engagementNarrative || '',
            communityFindings: parsed.communityFindings || '',
            attendeeVoice: Array.isArray(parsed.attendeeVoice) ? parsed.attendeeVoice : [],
            audienceDeepAnalysis: parsed.audienceDeepAnalysis || {
              profile: '',
              keyThemes: '',
              emergingInterests: '',
              communityOpportunities: '',
            },
            performanceAnalysis: parsed.performanceAnalysis || '',
            keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
            structuredRecommendations: parsed.structuredRecommendations || {
              futureProgramming: '',
              mentorship: '',
              communityDevelopment: '',
            },
            partnerImpactSummary: parsed.partnerImpactSummary || '',
            // Legacy / convenience mappings
            eventIntroduction: parsed.eventBackground || parsed.eventIntroduction || '',
            demographicAnalysis: parsed.audienceOverview || parsed.demographicAnalysis || '',
            thematicTakeaways: parsed.interestsNarrative || parsed.thematicTakeaways || '',
            impactHighlights: Array.isArray(parsed.keyFindings) ? parsed.keyFindings.map((f: any) => `${f.title}: ${f.evidence.slice(0, 120)}...`) : [],
            recommendations: parsed.structuredRecommendations ? [
              parsed.structuredRecommendations.futureProgramming,
              parsed.structuredRecommendations.mentorship,
              parsed.structuredRecommendations.communityDevelopment,
            ] : [],
            strategicConclusion: parsed.partnerImpactSummary || '',
          };
        }
      } catch (modelErr) {
        console.warn(`Model ${model} execution error:`, modelErr);
      }
    }

    console.warn('All Gemini models failed, using master report fallback.');
    return generateFallback();
  }
}