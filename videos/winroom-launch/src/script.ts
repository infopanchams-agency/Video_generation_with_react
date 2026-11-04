// All on-screen copy and VO lines. Dummy data only.
// VO text is copied from vikas-winroom-launch-vo-script.md without the
// square-bracket voice tags.

export const VO_LINES = {
	vo01: {speaker: 'narrator', text: "Everyone's building. Faster than ever."},
	vo02: {
		speaker: 'salesLead',
		text: "But who's calling your customers? Who logs what they said? Who coaches your rep... before the next call?",
	},
	vo03: {speaker: 'salesLead', text: "Five tools. Empty notes. Last quarter's playbook."},
	vo04: {speaker: 'narrator', text: 'Meet Winroom.'},
	vo05a: {speaker: 'customer', text: 'Feels a bit pricey... maybe after the visit.'},
	vo05b: {speaker: 'narrator', text: 'Live coaching, mid-call. In English, Hindi, or Hinglish.'},
	vo06a: {speaker: 'rep', text: "I'll email you the details before the visit."},
	vo06b: {speaker: 'narrator', text: 'Winroom logs the call and sets the next step. Nobody types notes.'},
	vo07: {speaker: 'narrator', text: 'Voice. WhatsApp. Email. LinkedIn. One place. Coached by your own playbook.'},
	vo08: {speaker: 'narrator', text: 'Set it up by chatting. Describe the flow. Winroom builds it.'},
	vo09: {speaker: 'narrator', text: 'Every call coaches the next one.'},
	vo10a: {speaker: 'salesLead', text: 'Built for sales people.'},
	vo10b: {speaker: 'narrator', text: 'By sales people. Winroom, by Aerobee.'},
} as const;

export const COPY = {
	brand: {product: 'Winroom', by: 'by Aerobee', cta: 'Book a pilot'},
	s01: {headline: ['Everyone', 'is', 'building.']},
	s02: {
		questions: [
			"Who's calling your customers?",
			'Who logs what they said?',
			'Who coaches the rep before the next call?',
		],
	},
	s03: {
		windows: ['dialer', 'crm', 'sheet', 'chat'],
		notesLabel: 'lead.notes',
		notesKey: 'notes:',
		notesEmpty: '——',
	},
	lead: {
		name: 'Rohan M.',
		status: 'Site visit pending',
		owner: 'owner: pune_team',
		breadcrumb: 'winroom / leads / rohan-m',
	},
	s05: {
		live: 'live',
		callButton: 'Call',
		onCall: 'On call',
		transcript: 'transcript',
		lang: 'lang: english',
		repHeader: 'REP',
		customerHeader: 'CUSTOMER',
		repEarlier: 'Did you get a chance to see the floor plan?',
		customerLine: 'Feels a bit pricey… maybe after the visit.',
	},
	coaching: {
		label: 'Price objection',
		hint: 'Anchor on the site visit. Offer Saturday 11 AM.',
	},
	s06: {
		repReply: "I'll email you the details before the visit.",
		callEnded: 'call.ended',
		outcome: 'Site visit booked',
		crmBreadcrumb: 'crm / lead / rohan-m',
		fields: [
			{key: 'asc_call_outcome:', value: 'site_visit_booked'},
			{key: 'asc_next_action:', value: 'email_visit_details'},
		],
		taskLabel: 'task.created',
		taskTitle: 'Email visit details to Rohan M.',
		taskMeta: 'before Sat 11 AM',
	},
	s07: {
		timelineLabel: 'contact.timeline',
		rows: [
			{channel: 'VOICE', text: 'Call · Site visit booked'},
			{channel: 'WHATSAPP', text: 'Location pin for the site visit'},
			{channel: 'EMAIL', text: 'Visit details sent'},
			{channel: 'LINKEDIN', text: 'Thanks, see you Saturday.'},
		],
		playbook: ['playbook/objection-handling.md', 'playbook/site-visit-script.md', 'playbook/pricing-faq.md'],
	},
	s08: {
		breadcrumb: 'winroom / setup',
		sender: 'Admin',
		message: 'New inbound line for site-visit leads. Route to the Pune team. Missed calls go to WhatsApp.',
		placeholder: 'Describe a flow',
		nodes: [
			{label: 'INBOUND LINE', value: 'new_inbound_line'},
			{label: 'LEADS', value: 'site_visit_leads'},
			{label: 'ROUTE', value: 'pune_team'},
			{label: 'WHATSAPP', value: 'missed_call_msg'},
		],
		missedEdge: 'missed',
	},
	s09: {nodes: ['Call', 'Log', 'Coach', 'Next call']},
	s10: {lines: ['Built for sales people.', 'By sales people.']},
} as const;
