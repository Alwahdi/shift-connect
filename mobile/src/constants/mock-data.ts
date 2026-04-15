export type AppRole = 'professional' | 'clinic';

export const roleCopy: Record<AppRole, {
  title: string;
  subtitle: string;
  heroStatLabel: string;
  heroStatValue: string;
  action: string;
}> = {
  professional: {
    title: 'Your next great healthcare shift is already within reach.',
    subtitle: 'Discover premium nearby opportunities, keep credentials ready, and stay booked with a mobile-first workflow.',
    heroStatLabel: 'Match score',
    heroStatValue: '96%',
    action: 'Explore matched shifts',
  },
  clinic: {
    title: 'Staff faster with a polished mobile command center for your clinic.',
    subtitle: 'Track urgent coverage, confirm verified professionals, and keep every open shift moving in real time.',
    heroStatLabel: 'Fill rate',
    heroStatValue: '91%',
    action: 'Review open roles',
  },
};

export const dashboardStats: Record<AppRole, Array<{ label: string; value: string; tone: 'primary' | 'secondary' | 'warning' | 'success'; }>> = {
  professional: [
    { label: 'Saved this month', value: '$4.8k', tone: 'primary' },
    { label: 'Upcoming shifts', value: '08', tone: 'secondary' },
    { label: 'Profile completion', value: '92%', tone: 'success' },
    { label: 'Response time', value: '4m', tone: 'warning' },
  ],
  clinic: [
    { label: 'Open shifts', value: '14', tone: 'primary' },
    { label: 'Available pros', value: '38', tone: 'secondary' },
    { label: 'This week spend', value: '$12.2k', tone: 'warning' },
    { label: 'Verified rate', value: '100%', tone: 'success' },
  ],
};

export const quickActions: Record<AppRole, Array<{ title: string; description: string; icon: string }>> = {
  professional: [
    { title: 'Instant apply', description: 'Submit to your best-fit shifts in one tap.', icon: 'bolt' },
    { title: 'Credential vault', description: 'Keep licenses and certifications ready.', icon: 'shield-checkmark' },
    { title: 'Payout pulse', description: 'See confirmed earnings before payday.', icon: 'cash' },
  ],
  clinic: [
    { title: 'Urgent coverage', description: 'Surface top responders first for urgent roles.', icon: 'flash' },
    { title: 'Shortlist fast', description: 'Compare verified talent with clear signals.', icon: 'people' },
    { title: 'Operations view', description: 'Track spend, quality, and fill speed in one place.', icon: 'stats-chart' },
  ],
};

export const featuredCards: Record<AppRole, Array<{
  title: string;
  meta: string;
  supporting: string;
  badge: string;
  accent: 'primary' | 'secondary' | 'warning';
}>> = {
  professional: [
    {
      title: 'ICU RN · Sunrise Medical',
      meta: 'Tonight · 7:00 PM – 7:00 AM · 5.2 km',
      supporting: '$72/hr · High demand · Verified unit',
      badge: 'Top match',
      accent: 'primary',
    },
    {
      title: 'Pediatric Float · Al Noor Clinic',
      meta: 'Tomorrow · 8:00 AM – 4:00 PM · 8.1 km',
      supporting: '$64/hr · Day shift · Fast confirmation',
      badge: 'Fast confirm',
      accent: 'secondary',
    },
    {
      title: 'ER Cover · CityCare West',
      meta: 'Fri · 6:00 PM – 2:00 AM · 12 km',
      supporting: '$79/hr · Premium rate · Transport stipend',
      badge: 'Urgent',
      accent: 'warning',
    },
  ],
  clinic: [
    {
      title: 'Night ICU coverage',
      meta: '3 professionals shortlisted',
      supporting: 'Starts tonight · SAR 270/hr budget · 1 seat left',
      badge: 'Urgent',
      accent: 'warning',
    },
    {
      title: 'Outpatient triage support',
      meta: '8 verified matches nearby',
      supporting: 'Tomorrow morning · 2 accepted invites pending',
      badge: 'Strong pool',
      accent: 'secondary',
    },
    {
      title: 'Weekend pediatric rotation',
      meta: '92% expected fill confidence',
      supporting: 'Sat–Sun · Premium shift · Fast applicants',
      badge: 'Ready to publish',
      accent: 'primary',
    },
  ],
};

export const workflowSteps: Record<AppRole, string[]> = {
  professional: [
    'Verify credentials once and keep them reusable across applications.',
    'Track only the shifts that fit your schedule, pay target, and commute.',
    'Stay responsive with streamlined confirmations and conversation previews.',
  ],
  clinic: [
    'Publish shift needs with wage, urgency, and specialty signals in seconds.',
    'Review candidates using verification status, ratings, and response speed.',
    'Close the loop quickly with booking actions and staffing visibility.',
  ],
};

export const conversations: Record<AppRole, Array<{
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  highlight: string;
}>> = {
  professional: [
    { name: 'Sunrise Medical', role: 'ICU Manager', lastMessage: 'We can confirm your arrival at 6:45 PM.', time: '2m', unread: 2, highlight: 'Shift confirmed' },
    { name: 'Al Noor Clinic', role: 'Scheduling', lastMessage: 'Can you also cover triage on Friday?', time: '20m', unread: 0, highlight: 'New opportunity' },
    { name: 'CityCare West', role: 'Charge Nurse', lastMessage: 'Thanks — your documents are all approved.', time: '1h', unread: 0, highlight: 'Verified' },
  ],
  clinic: [
    { name: 'Amina Hassan', role: 'ICU RN', lastMessage: 'I can cover both overnight blocks if needed.', time: '5m', unread: 1, highlight: 'Available now' },
    { name: 'Omar Salem', role: 'Pediatric Nurse', lastMessage: 'My license renewal was uploaded this morning.', time: '28m', unread: 0, highlight: 'Docs updated' },
    { name: 'Noura Ali', role: 'ER RN', lastMessage: 'Could you share parking details for the facility?', time: '1h', unread: 0, highlight: 'Needs response' },
  ],
};

export const profileChecklist: Record<AppRole, Array<{ title: string; done: boolean }>> = {
  professional: [
    { title: 'Primary license uploaded', done: true },
    { title: 'Specialty certifications attached', done: true },
    { title: 'Availability updated for this week', done: true },
    { title: 'Emergency contact confirmed', done: false },
  ],
  clinic: [
    { title: 'Facility verification submitted', done: true },
    { title: 'Departments and role templates configured', done: true },
    { title: 'Primary billing contact reviewed', done: false },
    { title: 'Default shift preferences saved', done: true },
  ],
};

export const profileSummary: Record<AppRole, {
  name: string;
  roleLabel: string;
  completion: number;
  note: string;
}> = {
  professional: {
    name: 'Leena Faris',
    roleLabel: 'Critical Care RN',
    completion: 92,
    note: 'You are one detail away from a fully optimized profile.',
  },
  clinic: {
    name: 'SyndeoCare Partner Clinic',
    roleLabel: '24/7 urgent care facility',
    completion: 88,
    note: 'Complete your billing and shift defaults to streamline publishing.',
  },
};
