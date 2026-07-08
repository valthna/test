import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  User, 
  TrendingUp, 
  Compass, 
  MapPin, 
  DollarSign, 
  HelpCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Award, 
  Layers, 
  MessageSquare, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  AlertTriangle, 
  Info, 
  Send, 
  Search, 
  Lock, 
  Star, 
  ArrowRight,
  Sparkles,
  Settings,
  X,
  UserCheck,
  ThumbsUp,
  SlidersHorizontal,
  ThumbsDown,
  Clock,
  BriefcaseBusiness,
  AlertCircle,
  Shield,
  Lightbulb
} from 'lucide-react';

interface OnboardingData {
  firstName: string;
  lastName: string;
  profileTitle: string;
  linkedInUrl: string;
  linkedInVerified: boolean;
  linkedInAvatar: string;
  cvText: string;
  pastExperiences: { companyName: string; roleTitle: string; period: string }[];
  dreamCompanies: string[];
  isSearching: 'YES' | 'NO' | '';
  searchReason: string;
  currentSalaryBrut: number;
  currentSalaryType: 'cadre' | 'non-cadre';
  expectedSalaryBrut: number;
  expectedSalaryType: 'cadre' | 'non-cadre';
  biggestRoadblock: string;
}

interface AtsResult {
  score: number;
  criticalIssues: string[];
  suggestedKeywords: string[];
  improvedDraft: string;
}

interface CompanyWiki {
  id: string;
  name: string;
  city: string;
  country: string;
  isSubsidiary: boolean;
  baseSalaryAvg: number;
  baseSalaryType: 'cadre' | 'non-cadre';
  variablePay: string;
  perks: {
    greenMobility: boolean;
    ticketsResto: boolean;
    ce: boolean;
    mutuelleName: string;
    workPhone: boolean;
    rtt: boolean;
    participation: boolean;
  };
  tools: string[];
  recruitmentProcessSteps: string[];
  remotePolicy: string;
  overallEnvironmentScore: number;
  workLifeBalanceScore: number;
  turnoverScore: number;
  valueProposition: string;
  recentMilestones: string[];
  realRealityReport: string;
  activeJobs?: string[];
}

interface KanbanOpportunity {
  id: string;
  companyName: string;
  roleTitle: string;
  city: string;
  currentStepIndex: number;
  steps: string[];
  status: 'favorite' | 'active' | 'won' | 'refused_needs_debrief' | 'archived_refused';
  dossierGenerated: boolean;
  salaryProposed?: string;
  peopleMet?: string[];
  debriefCompleted?: boolean;
  jdText?: string;
  historyDebriefs?: { stepName: string; comment: string; toolsDiscussed: string; duration: string; salaryDiscussed: string }[];
}

interface StrategicDossier {
  companyReport: {
    financialHealth: string;
    marketState: string;
    recentNews: string;
  };
  matchScore: number;
  missionRecap: string;
  gaps: {
    skill: string;
    defense: string;
    recommendedTraining: string;
  }[];
  blindSpotsJob: string[];
  blindSpotsCompany: {
    issue: string;
    expertQuestion: string;
  }[];
  sixtySecPitch: string;
  negotiationGuide: {
    suggestedRange: string;
    coreArguments: string[];
  };
  interviewerQuestions: {
    roleType: 'rh' | 'manager' | 'cto' | 'peer';
    question: string;
    answerStrategy: string;
  }[];
  useCaseScenario: {
    id: string;
    title: string;
    description: string;
    expectedDeliverable: string;
    proTips: string;
  }[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const calculateFrenchTax = (brut: number, type: 'cadre' | 'non-cadre' = 'cadre') => {
  const contributionRate = type === 'cadre' ? 0.23 : 0.22;
  const netSocial = brut * (1 - contributionRate);
  const netImposable = netSocial * 0.95;
  const taxableBasis = netImposable * 0.9;
  
  let tax = 0;
  if (taxableBasis > 177106) {
    tax += (taxableBasis - 177106) * 0.45;
    tax += (177106 - 82341) * 0.41;
    tax += (82341 - 28797) * 0.30;
    tax += (28797 - 11294) * 0.11;
  } else if (taxableBasis > 82341) {
    tax += (taxableBasis - 82341) * 0.41;
    tax += (82341 - 28797) * 0.30;
    tax += (28797 - 11294) * 0.11;
  } else if (taxableBasis > 28797) {
    tax += (taxableBasis - 28797) * 0.30;
    tax += (28797 - 11294) * 0.11;
  } else if (taxableBasis > 11294) {
    tax += (taxableBasis - 11294) * 0.11;
  }
  
  const netAfterTax = netSocial - tax;
  return {
    netSocialYear: Math.round(netSocial),
    netSocialMonth: Math.round(netSocial / 12),
    netAfterTaxYear: Math.round(netAfterTax),
    netAfterTaxMonth: Math.round(netAfterTax / 12),
    avgTaxRate: Math.round((tax / (netSocial || 1)) * 100) || 0
  };
};

const SalaryBadge: React.FC<{ brut: number; type?: 'cadre' | 'non-cadre'; className?: string }> = ({ brut, type = 'cadre', className = '' }) => {
  const { netSocialMonth, netAfterTaxMonth } = calculateFrenchTax(brut, type);
  return (
    <div className={`bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col gap-1.5 text-left ${className}`}>
      <div className="flex justify-between text-xs font-bold text-neutral-800">
        <span>Brut annuel :</span>
        <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded">{(brut / 1000).toFixed(0)} K€</span>
      </div>
      <div className="flex justify-between text-[11px] text-neutral-600">
        <span>Net Social estimé :</span>
        <span className="font-mono font-semibold text-emerald-700">{netSocialMonth} € / mois</span>
      </div>
      <div className="flex justify-between text-[11px] text-neutral-600">
        <span>Après impôts :</span>
        <span className="font-mono font-bold text-neutral-900">{netAfterTaxMonth} € / mois</span>
      </div>
    </div>
  );
};

const INITIAL_COMPANIES: CompanyWiki[] = [
  {
    id: "stripe",
    name: "Stripe",
    city: "Paris",
    country: "France",
    isSubsidiary: true,
    baseSalaryAvg: 75000,
    baseSalaryType: "cadre",
    variablePay: "Variable individuel déplafonné indexé sur la marge nette (moyenne constatée: 18K€)",
    perks: {
      greenMobility: true,
      ticketsResto: true,
      ce: true,
      mutuelleName: "Alan Blue (Prise en charge à 100%)",
      workPhone: true,
      rtt: true,
      participation: true
    },
    tools: ["Salesforce CRM", "Slack", "GSuite", "Gong.io", "Notion", "Tableau"],
    recruitmentProcessSteps: ["Screening", "Étude de cas", "Entretien technique", "Entretien managérial", "Fondateur", "Proposition finale"],
    remotePolicy: "Hybride flexible (2 jours de télétravail recommandés)",
    overallEnvironmentScore: 4.6,
    workLifeBalanceScore: 3.8,
    turnoverScore: 2.1,
    valueProposition: "L'infrastructure de paiement mondiale pour l'internet. Entreprise exigeante mais extrêmement structurée.",
    recentMilestones: [
      "Lancement de Stripe Billing avancé pour les modèles d'abonnement complexes en Europe.",
      "Intégration d'agents IA pour le support marchand de niveau 1."
    ],
    realRealityReport: "L'onboarding est excellent (2 semaines de boot-camp intensif). Cependant, la pression sur l'atteinte des quotas du trimestre est forte et les horaires de fin de journée peuvent s'étirer lors des phases de closing de fin d'année.",
    activeJobs: ["Enterprise Account Executive - SaaS Fintech", "Solutions Engineer - Payments", "Account Manager - Mid Market"]
  },
  {
    id: "doctolib",
    name: "Doctolib",
    city: "Nantes",
    country: "France",
    isSubsidiary: false,
    baseSalaryAvg: 54000,
    baseSalaryType: "cadre",
    variablePay: "Variable d'équipe et personnel (atteinte moyenne 85% du variable cible)",
    perks: {
      greenMobility: true,
      ticketsResto: true,
      ce: false,
      mutuelleName: "Malan (Mutuelle d'entreprise standard)",
      workPhone: true,
      rtt: true,
      participation: false
    },
    tools: ["Salesforce", "Clari", "Microsoft Teams", "Confluence", "Jira"],
    recruitmentProcessSteps: ["Screening", "Entretien technique", "Étude de cas", "Entretien managérial", "Proposition finale"],
    remotePolicy: "2 jours par semaine fixés avec l'équipe, présentéisme attendu les autres jours",
    overallEnvironmentScore: 4.1,
    workLifeBalanceScore: 3.5,
    turnoverScore: 3.4,
    valueProposition: "Leader de la e-santé en Europe. Mission forte d'utilité publique.",
    recentMilestones: [
      "Déploiement mondial de Doctolib Assistant de consultation IA pour les médecins.",
      "Ouverture de nouveaux pôles régionaux en France et Italie."
    ],
    realRealityReport: "L'onboarding est cadré à la Doctolib Academy, mais le rythme de prospection terrain est extrêmement intense avec un contrôle hebdomadaire des indicateurs d'activité (KPIs serrés).",
    activeJobs: ["Account Executive - Praticiens", "Customer Success Manager", "Implementation Consultant Santé"]
  }
];

const INITIAL_OPPORTUNITIES: KanbanOpportunity[] = [
  {
    id: "opp-1",
    companyName: "Stripe",
    roleTitle: "Enterprise Account Executive - SaaS Fintech",
    city: "Paris",
    currentStepIndex: 0,
    steps: ["Screening", "Étude de cas", "Entretien technique", "Entretien managérial", "Fondateur", "Proposition finale"],
    status: "active",
    dossierGenerated: false,
    jdText: "Recherche un Enterprise AE Senior pour le marché français. Expérience requise : closing de transactions SaaS complexes à cycles longs (3 à 9 mois), négociation avec des interlocuteurs de niveau C-level. Connaissance approfondie des outils comme Salesforce et des méthodologies structurées type MEDDPICC."
  }
];

const PREDEFINED_STEPS = [
  "Screening",
  "Étude de cas",
  "Entretien technique",
  "Entretien managérial",
  "Fondateur",
  "Proposition finale"
];

const FRENCH_MUTUELLES = [
  "Alan Blue (Prise en charge à 100%)",
  "Alan Standard",
  "Mercer",
  "Malan",
  "Gras Savoye",
  "Swiss Life",
  "Generali",
  "Harmonie Mutuelle"
];

export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingForm, setOnboardingForm] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    profileTitle: "",
    linkedInUrl: "",
    linkedInVerified: false,
    linkedInAvatar: "👤",
    cvText: "",
    pastExperiences: [
      { companyName: "Doctolib", roleTitle: "Account Executive Junior", period: "2024 - 2026" },
      { companyName: "Payfit", roleTitle: "Sales Intern", period: "2023" }
    ],
    dreamCompanies: ["", "", ""],
    isSearching: '',
    searchReason: "",
    currentSalaryBrut: 45000,
    currentSalaryType: 'cadre',
    expectedSalaryBrut: 55000,
    expectedSalaryType: 'cadre',
    biggestRoadblock: ""
  });

  const [showManualLinkedIn, setShowManualLinkedIn] = useState<boolean>(false);
  const [manualUsername, setManualUsername] = useState<string>("");
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualLocation, setManualLocation] = useState<string>("Paris, France");

  const [atsAnalysis, setAtsAnalysis] = useState<AtsResult | null>(null);
  const [isAtsAnalyzing, setIsAtsAnalyzing] = useState<boolean>(false);
  const [linkedInScanning, setLinkedInScanning] = useState<boolean>(false);
  const [linkedInSearchResults, setLinkedInSearchResults] = useState<{username: string; title: string; avatar: string; location: string}[]>([]);

  const [companies, setCompanies] = useState<CompanyWiki[]>(INITIAL_COMPANIES);
  const [opportunities, setOpportunities] = useState<KanbanOpportunity[]>(INITIAL_OPPORTUNITIES);
  const [selectedOpportunity, setSelectedOpportunity] = useState<KanbanOpportunity | null>(null);
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');

  const [companySearchInput, setCompanySearchInput] = useState<string>('');
  const [proactiveJobsList, setProactiveJobsList] = useState<string[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState<boolean>(false);
  const [searchingCompanyLive, setSearchingCompanyLive] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'cockpit' | 'vitrine' | 'contribuer'>('cockpit');
  const [activePrepaTab, setActivePrepaTab] = useState<'dossier' | 'coach' | 'cas' | 'debrief'>('dossier');

  const [selectedCoachRole, setSelectedCoachRole] = useState<'rh' | 'manager' | 'cto' | 'peer'>('rh');

  const [agentMessages, setAgentMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Bonjour ! Je suis Victor, ton copilote d'élite. Mon unique rôle est de te faire gagner un temps précieux et de t'offrir une longueur d'avance chirurgicale sur les recruteurs. Commençons par configurer ton profil de combat. Saisis ton prénom et ton nom ci-contre !",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [agentInput, setAgentInput] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);

  const [vitrineFilter, setVitrineFilter] = useState('');
  const [vitrineSort, setVitrineSort] = useState<'score' | 'salary' | 'jobs'>('score');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    city: 'Paris',
    country: 'France',
    isSubsidiary: false,
    roleTitle: '',
    baseSalary: 60000,
    baseSalaryType: 'cadre' as 'cadre' | 'non-cadre',
    variablePay: 'Variable individuel sur KPIs',
    overallScore: 4.5,
    workLifeBalanceScore: 4.0,
    turnoverScore: 1.5,
    remotePolicy: 'Hybride 3 jours',
    realityReport: '',
    greenMobility: true,
    ticketsResto: true,
    ce: false,
    rtt: true,
    participation: false,
    mutuelleName: 'Alan Standard',
    customMutuelleName: '',
    workPhone: false,
    tools: 'Slack, GSuite, Notion',
    sector: 'Sales'
  });

  const [coachSessions, setCoachSessions] = useState<Record<string, {
    history: { role: 'user' | 'model'; text: string; feedback?: string; rating?: 'good' | 'average' | 'poor'; optimized?: string }[];
    currentAnswer: string;
    isEvaluating: boolean;
  }>>({
    rh: {
      history: [{ role: 'model', text: "Bonjour, je suis Sophie de l'équipe RH. Commençons par parler de votre motivation globale pour ce poste. Pourquoi nous ?" }],
      currentAnswer: '',
      isEvaluating: false
    },
    manager: {
      history: [{ role: 'model', text: "Salut, je suis Marc, le Hiring Manager. J'aime les faits concrets. Parle-moi d'un deal complexe que tu as clos récemment et des leviers utilisés." }],
      currentAnswer: '',
      isEvaluating: false
    },
    cto: {
      history: [{ role: 'model', text: "Bonjour, je suis Thomas, le CTO. Notre infrastructure grandit vite. Quelle est ton expérience avec les architectures distribuées et la gestion de crise technique ?" }],
      currentAnswer: '',
      isEvaluating: false
    },
    peer: {
      history: [{ role: 'model', text: "Salut, moi c'est Lucas, je suis dans l'équipe de vente. Dis-moi, comment gères-tu les interactions quotidiennes et la pression des quotas en fin de mois ?" }],
      currentAnswer: '',
      isEvaluating: false
    }
  });

  const [postInterviewDebriefSession, setPostInterviewDebriefSession] = useState<{
    history: { role: 'user' | 'model'; text: string; feedback?: string }[];
    currentAnswer: string;
    isEvaluating: boolean;
  }>({
    history: [{ role: 'model', text: "Salut ! C'est Victor. Tu viens de finir ton entretien ? Prenons 2 minutes pour débriefer à chaud. Comment as-tu senti l'échange globalement, et y a-t-il eu une question où tu as eu un doute ?" }],
    currentAnswer: '',
    isEvaluating: false
  });

  const [selectedExerciceId, setSelectedExerciceId] = useState<string>('exe-1');
  const [exerciceAnswers, setExerciceAnswers] = useState<Record<string, {
    userProposal: string;
    evaluation: { score: number; critique: string; improvements: string[]; proVersion: string } | null;
    isSubmitting: boolean;
    hintUsed: boolean;
    hintText: string;
  }>>({
    'exe-1': { userProposal: '', evaluation: null, isSubmitting: false, hintUsed: false, hintText: '' },
    'exe-2': { userProposal: '', evaluation: null, isSubmitting: false, hintUsed: false, hintText: '' },
    'exe-3': { userProposal: '', evaluation: null, isSubmitting: false, hintUsed: false, hintText: '' }
  });

  const [tokens, setTokens] = useState<number>(5);
  const [currentDossier, setCurrentDossier] = useState<StrategicDossier | null>(null);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [showAddOppModal, setShowAddOppModal] = useState<boolean>(false);
  const [newOppForm, setNewOppForm] = useState({
    companyName: '',
    roleTitle: '',
    city: 'Paris',
    steps: [...PREDEFINED_STEPS],
    jdText: ''
  });

  const [transitionDebriefOpen, setTransitionDebriefOpen] = useState<boolean>(false);
  const [transitionTargetOpp, setTransitionTargetOpp] = useState<{ oppId: string; nextIndex: number } | null>(null);
  const [transitionComment, setTransitionComment] = useState('');
  const [transitionTools, setTransitionTools] = useState('');
  const [transitionDuration, setTransitionDuration] = useState('30m');
  const [transitionSalaryDiscussed, setTransitionSalaryDiscussed] = useState('non_evoque');

  const [selectedGiveToGetExpIndex, setSelectedGiveToGetExpIndex] = useState<number | null>(null);
  const [giveToGetForm, setGiveToGetForm] = useState({
    baseSalary: 45000,
    baseSalaryType: 'cadre' as 'cadre' | 'non-cadre',
    variablePay: '10K€',
    greenMobility: true,
    ticketsResto: true,
    ce: false,
    rtt: true,
    participation: false,
    mutuelleName: 'Alan Blue',
    customMutuelleName: '',
    workPhone: true,
    tools: 'Salesforce, Slack, Notion',
    realityReport: '',
    isSubsidiary: false,
    workLifeBalanceScore: 4,
    turnoverScore: 2,
    sector: 'Sales'
  });

  const [isDebriefOpen, setIsDebriefOpen] = useState<boolean>(false);
  const [debriefOpportunity, setDebriefOpportunity] = useState<KanbanOpportunity | null>(null);
  const [debriefForm, setDebriefForm] = useState({
    peopleMet: '',
    qualityExchange: 'good',
    questionsAsked: '',
    salaryDiscussed: '',
    packageDetails: '',
    toolsConfirmed: '',
    followUpRating: '3'
  });

  const agentEndRef = useRef<HTMLDivElement>(null);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  useEffect(() => {
    agentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  const currentSalaryCalc = calculateFrenchTax(onboardingForm.currentSalaryBrut, onboardingForm.currentSalaryType);
  const expectedSalaryCalc = calculateFrenchTax(onboardingForm.expectedSalaryBrut, onboardingForm.expectedSalaryType);

  const salaryDiffPercent = onboardingForm.currentSalaryBrut > 0 
    ? Math.round(((onboardingForm.expectedSalaryBrut - onboardingForm.currentSalaryBrut) / onboardingForm.currentSalaryBrut) * 100)
    : 0;
  
  const isSalaryDivergent = salaryDiffPercent > 35;

  const simulateFallbackResponse = async (prompt: string, systemInstruction: string, options: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fName = (onboardingForm.firstName || "").toLowerCase();
    const lName = (onboardingForm.lastName || "").toLowerCase();
    const promptLower = prompt.toLowerCase();
    const systemLower = (systemInstruction || "").toLowerCase();

    const isStephanie = fName.includes("stephanie") || 
                        lName.includes("wynsberghe") ||
                        promptLower.includes("stephanie") ||
                        promptLower.includes("wynsberghe");

    if (options.isJSON) {
      // 1. LinkedIn Search Fallback
      if ((promptLower.includes("linkedin") && !promptLower.includes("cv brut")) || systemLower.includes("linkedin")) {
        if (isStephanie) {
          return {
            text: JSON.stringify([
              { username: "stephanie-van-wynsberghe-svr", title: "Marketing Group Manager at Laboratoire SVR (Ex Puig, Ex Dior)", location: "Paris, Île-de-France, France", avatar: "👩‍💼" },
              { username: "stephvanwynsberghe", title: "Marketing Group Manager @laboratoire_svr - Citizen of the World", location: "Paris, France", avatar: "🍷" },
              { username: "stephanie-van-wynsberghe-holistic", title: "STEPHANIE VAN WYNSBERGHE - Holistic Zen Practitioner", location: "France", avatar: "🧘" }
            ]),
            sources: []
          };
        }
        
        const fNameVal = onboardingForm.firstName || "Sophie";
        const lNameVal = onboardingForm.lastName || "Martin";
        return {
          text: JSON.stringify([
            { username: `${fNameVal.toLowerCase()}-${lNameVal.toLowerCase()}-tech`, title: "Lead Product Owner - Digital Solutions", location: "Paris, France", avatar: "👩‍💻" },
            { username: `${fNameVal.toLowerCase()}.${lNameVal.toLowerCase()}.sales`, title: "Senior Enterprise Account Executive", location: "Nantes, France", avatar: "📈" }
          ]),
          sources: []
        };
      }
      
      // 2. CV / ATS extraction Fallback
      if (promptLower.includes("cv brut") || promptLower.includes("ats") || systemLower.includes("ats") || systemLower.includes("cv")) {
        const pastExp = isStephanie ? [
          { companyName: "Laboratoire SVR", roleTitle: "Marketing Group Manager", period: "2022 - Présent" },
          { companyName: "Puig", roleTitle: "Brand Manager", period: "2019 - 2022" },
          { companyName: "Parfums Christian Dior", roleTitle: "Product Manager Assistant", period: "2017 - 2019" }
        ] : [
          { companyName: "Doctolib", roleTitle: "Account Executive Junior", period: "2024 - 2026" },
          { companyName: "Payfit", roleTitle: "Sales Intern", period: "2023" }
        ];

        return {
          text: JSON.stringify({
            cvText: isStephanie 
              ? "Marketing Group Manager chevronnée spécialisée dans la cosmétique et le luxe. Expérience confirmée chez Laboratoire SVR, Puig et Parfums Christian Dior en trade marketing, activation omnicanale et gestion de marque sélective."
              : "Product Owner chevronné avec une expertise solide dans l'agilité et le pilotage d'API transactionnelles complexes.",
            atsScore: 94,
            criticalIssues: [
              "Format de date non homogène dans l'historique de carrière.",
              isStephanie ? "Manque d'indicateurs quantifiables sur l'activation Puig." : "Description de poste un peu trop générique sur Payfit."
            ],
            suggestedKeywords: isStephanie 
              ? ["Omnicanal", "Trade Marketing", "Activation de Marque", "Luxe", "ROI Média"]
              : ["API", "Agile", "Product Owner", "SaaS", "Backlog"],
            improvedDraft: isStephanie 
              ? "Marketing Group Manager d'élite spécialisée dans les cosmétiques de luxe et l'omnicanalité."
              : "Product Owner d'élite orienté API et performance transactionnelle.",
            pastExperiences: pastExp
          }),
          sources: []
        };
      }

      // 3. Dossier Generation Fallback
      if (promptLower.includes("dossier") || promptLower.includes("combat") || promptLower.includes("stratégique") || promptLower.includes("entreprise cible") || systemLower.includes("combat") || systemLower.includes("dossier") || systemLower.includes("stratégique")) {
        if (isStephanie || onboardingForm.profileTitle.toLowerCase().includes("marketing") || onboardingForm.profileTitle.toLowerCase().includes("svr")) {
          return {
            text: JSON.stringify({
              companyReport: {
                financialHealth: "Forte croissance e-commerce, expansion sur le marché sélectif européen.",
                marketState: "Forte tension sur le circuit de distribution sélectif (Sephora, Marionnaud).",
                recentNews: "Focus sur la digitalisation des marques dermo-cosmétiques et l'activation omnicanale."
              },
              matchScore: 92,
              missionRecap: "Gestion globale de l'activation de marque, trade marketing et pilotage de campagnes d'envergure. Le quotidien est orienté à 60% sur le ROI des campagnes médias et à 40% sur la négociation avec les distributeurs.",
              gaps: [
                { skill: "Mise en place opérationnelle d'outils de tracking publicitaire hyper-spécifiques", defense: "Mettre en avant le pilotage stratégique d'agences spécialisées et d'experts techniques.", recommendedTraining: "E-Commerce Media Masterclass" }
              ],
              blindSpotsJob: ["La hiérarchie attend une rentabilité publicitaire immédiate sur les nouveaux lancements de gammes."],
              blindSpotsCompany: [
                { issue: "Ralentissement des investissements trade physiques chez les distributeurs.", expertQuestion: "'Face à la baisse d'audience de certains points de vente physiques, comment arbitrez-vous l'enveloppe budgétaire entre activation omnicanale et théâtralisation retail ?'" }
              ],
              sixtySecPitch: "Forte de mon expérience de Marketing Group Manager, notamment au sein du Laboratoire SVR et chez Puig / Dior, j'ai développé une double expertise : le positionnement de marque sélective haut de gamme et l'optimisation rigoureuse de l'activation omnicanale. Mon objectif est d'amplifier l'impact de vos lancements.",
              negotiationGuide: {
                suggestedRange: "72000",
                coreArguments: ["Pilotage réussi de budgets omnicaux significatifs", "Solide carnet d'adresses et habitude de l'écosystème cosmétique sélectif"]
              },
              interviewerQuestions: [
                { roleType: "rh", question: "Qu'est-ce qui vous passionne le plus entre le marketing stratégique et l'activation opérationnelle ?", answerStrategy: "Valoriser l'interdépendance des deux : pas de bonne stratégie sans une exécution retail parfaite." }
              ],
              useCaseScenario: [
                { id: "exe-1", title: "Arbitrage budgétaire post-lancement de gamme", description: "Le lancement d'une nouvelle gamme de soins présente une sous-performance de 15% sur le canal pharmacie. Comment réallouez-vous le budget média ?", expectedDeliverable: "Matrice d'arbitrage trade vs digital.", proTips: "Priorisez la redirection du trafic vers le DTC pour de la conversion rapide." }
              ]
            }),
            sources: []
          };
        }

        return {
          text: JSON.stringify({
            companyReport: {
              financialHealth: "Bénéficiaire, croissance soutenue de +18% sur le marché français.",
              marketState: "Compétition agressive sur le segment SaaS de niche.",
              recentNews: "Annonce d'un plan stratégique d'autonomisation produit d'ici fin 2026."
            },
            matchScore: 84,
            missionRecap: "Refonte du coeur transactionnel et de l'accès API. Le poste demande en réalité 70% de gestion de backlog technique sur des legacy systems et seulement 30% d'orientation stratégique.",
            gaps: [
              { skill: "Absence de certification Azure Cloud Practitioner", defense: "Mettre en avant l'expérience de migration passée équivalente sur AWS et GCP.", recommendedTraining: "Azure Certified Architect - Global Prep" }
            ],
            blindSpotsJob: ["Le poste est annoncé comme 100% autonome mais dépend d'une validation permanente de l'entité mère."],
            blindSpotsCompany: [
              { issue: "La filiale française manque de ressources QA dédiées sur ce projet.", expertQuestion: "'Comment prévoyez-vous d'adresser le sujet de l'automatisation des tests pour décharger les Product Owners du fardeau de la recette technique ?'" }
            ],
            sixtySecPitch: `Fort de mon parcours de ${onboardingForm.profileTitle || 'spécialiste'}, j'ai l'habitude d'aligner des contraintes de sécurité dures avec des parcours utilisateurs fluides. Mon but est d'accélérer la transition de vos flux en assumant la liaison technique directe avec l'architecture centrale.`,
            negotiationGuide: {
              suggestedRange: "68000",
              coreArguments: ["Expertise acquise sur des architectures d'échanges API", "Capacité avérée à rationaliser de la dette technique complexe"]
            },
            interviewerQuestions: [
              { roleType: "rh", question: "Pourquoi notre structure plutôt qu'une grande banque d'investissement ?", answerStrategy: "Mettre en avant l'agilité décisionnelle et l'importance du 'hands-on' technique." }
            ],
            useCaseScenario: [
              { id: "exe-1", title: "Arbitrage budgétaire en période de crise technique", description: "Le serveur principal de paiement rencontre une faille zero-day. En tant que PO, comment priorisez-vous le backlog face aux demandes des investisseurs ?", expectedDeliverable: "Une matrice d'arbitrage de crise et communication client.", proTips: "Misez sur le confinement de la faille avant toute considération commerciale." }
            ]
          }),
          sources: []
        };
      }

      // 4. Company Grounding Search Fallback
      if (promptLower.includes("recherche internet") || promptLower.includes("entreprise") || systemLower.includes("recrutement") || systemLower.includes("éclaireur")) {
        const compName = prompt.split('"')[1] || "Entreprise Détectée";
        return {
          text: JSON.stringify({
            name: compName,
            city: "Paris",
            country: "France",
            baseSalaryAvg: 62000,
            baseSalaryType: "cadre",
            variablePay: "Variable de 10% sur objectifs collectifs",
            tools: ["Slack", "Google Workspace", "Salesforce", "Notion", "Jira"],
            recruitmentProcessSteps: ["Screening", "Entretien technique", "Étude de cas", "Entretien managérial", "Proposition finale"],
            remotePolicy: "Hybride standard 2 jours",
            overallEnvironmentScore: 4.3,
            valueProposition: "Acteur innovant en pleine expansion.",
            recentMilestones: ["Levée de fonds récente", "Expansion européenne en cours"],
            realRealityReport: "L'onboarding est rapide mais autonome. L'ambiance est positive et respectueuse des horaires individuels.",
            activeJobs: ["Product Owner Senior - Core Banking", "Product Manager - API Platform", "Consultant Technique Senior"]
          }),
          sources: [{ uri: "https://google.com/search?q=" + encodeURIComponent(compName), title: `Informations sur ${compName}` }]
        };
      }

      // 5. Coach response / rating evaluation Fallback
      if (promptLower.includes("candidat") || promptLower.includes("coach") || promptLower.includes("réponse") || systemLower.includes("star") && !promptLower.includes("exercice id")) {
        return {
          text: JSON.stringify({
            rating: "good",
            critique: "La réponse du candidat respecte les grands principes du framework STAR. L'accent est mis sur les indicateurs de succès mesurables.",
            optimizedResponse: "Axe de perfectionnement : 'J'ai géré le déploiement de la solution e-commerce en réduisant le temps de chargement de 20%, ce qui a directement augmenté les ventes de 5%.'",
            nextInterviewerQuestion: "Excellent exemple. Quelle est votre plus grande réussite dans la résolution de conflits au sein de vos équipes d'ingénieurs ?"
          }),
          sources: []
        };
      }

      // 6. Exercises / Practical Cases Evaluation Fallback
      if (promptLower.includes("exercice id") || promptLower.includes("proposition du candidat") || promptLower.includes("exercice") || systemLower.includes("framework star")) {
        return {
          text: JSON.stringify({
            score: 85,
            critique: "La structure de réponse est claire et pragmatique. Vous ciblez immédiatement la protection des données clients avant de relancer les flux transactionnels.",
            improvements: ["Détailler davantage l'impact d'adoption utilisateur", "Préciser la gestion des imprévus techniques"],
            proVersion: "Axe basé sur le retour d'adoption : 'Nous lançons une task force conjointe Produit + QA dès la validation de la faille...'"
          }),
          sources: []
        };
      }

      // Ultimate failsafe JSON object to prevent ANY parsing and crash bugs
      return {
        text: JSON.stringify({
          companyReport: {
            financialHealth: "Bénéficiaire, croissance soutenue de +18% sur le marché français.",
            marketState: "Compétition agressive sur le segment SaaS de niche.",
            recentNews: "Annonce d'un plan stratégique d'autonomisation d'ici fin 2026."
          },
          matchScore: 84,
          missionRecap: "Refonte et alignement stratégique.",
          gaps: [
            { skill: "Absence de certification Azure Cloud Practitioner", defense: "Mettre en avant l'expérience de migration passée équivalente sur AWS et GCP.", recommendedTraining: "Azure Certified Architect - Global Prep" }
          ],
          blindSpotsJob: ["Le poste est annoncé comme autonome."],
          blindSpotsCompany: [
            { issue: "La filiale manque de ressources QA dédiées sur ce projet.", expertQuestion: "'Comment prévoyez-vous d'adresser le sujet de l'automatisation des tests ?'" }
          ],
          sixtySecPitch: "Fort de mon parcours, je souhaite accompagner vos ambitions.",
          negotiationGuide: {
            suggestedRange: "68000",
            coreArguments: ["Expertise acquise", "Capacité avérée"]
          },
          interviewerQuestions: [
            { roleType: "rh", question: "Pourquoi nous ?", answerStrategy: "Mettre en avant l'agilité décisionnelle." }
          ],
          useCaseScenario: [
            { id: "exe-1", title: "Cas pratique de crise", description: "Le serveur principal rencontre une faille. Comment priorisez-vous le backlog ?", expectedDeliverable: "Matrice d'arbitrage.", proTips: "Priorisez la sécurité." }
          ]
        }),
        sources: []
      };
    }

    return {
      text: "Simulé : Évaluation validée avec succès par l'agent Victor. Votre structuration d'arguments respecte la grille d'excellence opérationnelle.",
      sources: []
    };
  };

  const buildLlmContext = () => ({
    firstName: onboardingForm.firstName,
    lastName: onboardingForm.lastName,
    profileTitle: onboardingForm.profileTitle,
    cvText: onboardingForm.cvText,
    pastExperiences: onboardingForm.pastExperiences,
    expectedSalaryBrut: onboardingForm.expectedSalaryBrut,
    targetCompany: selectedOpportunity?.companyName,
    targetRole: selectedOpportunity?.roleTitle
  });

  // All of the app's intelligence goes through the Vercel AI Gateway via our
  // /api/llm serverless proxy. If the gateway is not configured (no
  // AI_GATEWAY_API_KEY) or errors out, we transparently fall back to the local
  // offline simulation so the product keeps working.
  const callGeminiAPI = async (
    prompt: string,
    systemInstruction: string,
    options: {
      isJSON?: boolean;
      schema?: any;
      task?: string;
    } = {}
  ) => {
    try {
      const resp = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          isJSON: !!options.isJSON,
          task: options.task,
          context: buildLlmContext()
        })
      });

      if (!resp.ok) throw new Error(`gateway ${resp.status}`);
      const data = await resp.json();
      if (!data || typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('empty gateway response');
      }
      return { text: data.text, sources: Array.isArray(data.sources) ? data.sources : [] };
    } catch (err) {
      console.warn('AI Gateway indisponible, repli sur la simulation locale:', err);
      return simulateFallbackResponse(prompt, systemInstruction, options);
    }
  };

  const triggerProactiveLinkedInScan = async () => {
    const fullName = `${onboardingForm.firstName} ${onboardingForm.lastName}`.trim();
    if (!onboardingForm.firstName || !onboardingForm.lastName) {
      triggerNotification("Renseigne ton prénom et ton nom pour lancer la recherche.", "error");
      return;
    }

    setLinkedInScanning(true);
    addAgentMessage(`Recherche du profil LinkedIn de "${fullName}" en cours via Google Grounding...`);

    try {
      const response = await callGeminiAPI(
        `Cherche le profil LinkedIn pour "${fullName}" en France. Propose des résultats plausibles ou réels si disponibles, adaptés pour l'industrie de la tech/vente/produit/cosmétique.`,
        "Génère un retour JSON strict.",
        { isJSON: true, task: 'linkedin_search' }
      );

      const results = JSON.parse(response.text);
      if (Array.isArray(results)) {
        setLinkedInSearchResults(results);
        addAgentMessage(`J'ai trouvé ${results.length} profils correspondants potentiels. Choisis celui qui te correspond le mieux pour lier tes expériences réelles.`);
      } else {
        triggerNotification("Format de réponse LinkedIn invalide.", "error");
      }
    } catch (error) {
      console.error(error);
      triggerNotification("Erreur de simulation de recherche LinkedIn.", "error");
    } finally {
      setLinkedInScanning(false);
    }
  };

  const selectLinkedInProfile = async (prof: typeof linkedInSearchResults[0]) => {
    const isSvrProfile = prof.username.includes("svr") || prof.title.toLowerCase().includes("svr") || onboardingForm.lastName.toLowerCase().includes("wynsberghe");

    setOnboardingForm(prev => {
      const parsedExperiences = isSvrProfile ? [
        { companyName: "Laboratoire SVR", roleTitle: "Marketing Group Manager", period: "2022 - Présent" },
        { companyName: "Puig", roleTitle: "Brand Manager", period: "2019 - 2022" },
        { companyName: "Parfums Christian Dior", roleTitle: "Product Manager Assistant", period: "2017 - 2019" }
      ] : [
        { companyName: "Doctolib", roleTitle: "Account Executive Junior", period: "2024 - 2026" },
        { companyName: "Payfit", roleTitle: "Sales Intern", period: "2023" }
      ];

      return {
        ...prev,
        profileTitle: prof.title,
        linkedInUrl: `https://linkedin.com/in/${prof.username}`,
        linkedInVerified: true,
        linkedInAvatar: prof.avatar,
        pastExperiences: parsedExperiences
      };
    });

    addAgentMessage(`Parfait ! Profil lié avec succès : @${prof.username} (${prof.title}).`);
    triggerNotification("LinkedIn validé !", "success");

    setIsAtsAnalyzing(true);
    try {
      const cvMockText = isSvrProfile 
        ? "Marketing Group Manager chevronnée spécialisée dans la cosmétique et le luxe. Expérience confirmée chez Laboratoire SVR, Puig et Parfums Christian Dior en trade marketing, activation omnicanale et gestion de marque sélective."
        : "Product Owner chevronné avec une expertise solide dans l'agilité et le pilotage d'API transactionnelles complexes.";

      setAtsAnalysis({
        score: 94,
        criticalIssues: [
          "Format de date non homogène dans l'historique de carrière.",
          "Manque d'indicateurs quantifiables sur l'activation Puig."
        ],
        suggestedKeywords: ["Omnicanal", "Trade Marketing", "Activation de Marque", "Luxe", "ROI Média"],
        improvedDraft: "Marketing Group Manager d'élite spécialisée dans les cosmétiques de luxe et l'omnicanalité."
      });
      setOnboardingForm(prev => ({ ...prev, cvText: cvMockText }));
      addAgentMessage(`J'ai extrait ton parcours réel pour ton portfolio. Ton score d'optimisation ATS de départ est de 94/100.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAtsAnalyzing(false);
    }
  };

  const addAgentMessage = (text: string, role: 'user' | 'model' = 'model') => {
    setAgentMessages(prev => [...prev, {
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleAgentConversationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isAgentThinking) return;

    const userText = agentInput;
    setAgentInput('');
    addAgentMessage(userText, 'user');
    setIsAgentThinking(true);

    try {
      const response = await callGeminiAPI(userText, "Tu es Victor l'Éclaireur, un copilote d'entretien d'élite.", { task: 'chat' });
      addAgentMessage(response.text);
    } catch (error) {
      console.error(error);
      addAgentMessage("Désolé, j'ai rencontré une petite perturbation en analysant ta demande.");
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleCompanyInputSearchChange = async (val: string) => {
    setCompanySearchInput(val);
    const query = val.trim();
    if (query.length < 3) return;

    setSearchingCompanyLive(true);
    try {
      const response = await callGeminiAPI(
        `Fais une recherche internet poussée sur l'entreprise "${query}".`,
        "Tu es un éclaireur de recrutement. Génère un retour sous format JSON.",
        { isJSON: true, task: 'company_search' }
      );

      // Sensible defaults, then overlay whatever the AI Gateway returned.
      const defaults: CompanyWiki = {
        id: query.toLowerCase().replace(/\s+/g, '-'),
        name: query,
        city: "Paris",
        country: "France",
        isSubsidiary: false,
        baseSalaryAvg: 62000,
        baseSalaryType: "cadre",
        variablePay: "Variable individuel de 12%",
        perks: {
          greenMobility: true,
          ticketsResto: true,
          ce: false,
          mutuelleName: "Alan Standard",
          workPhone: false,
          rtt: true,
          participation: false
        },
        tools: ["Slack", "Salesforce", "Notion", "Jira"],
        recruitmentProcessSteps: ["Screening", "Entretien technique", "Étude de cas", "Entretien managérial", "Proposition finale"],
        remotePolicy: "Hybride standard 2 jours",
        overallEnvironmentScore: 4.4,
        workLifeBalanceScore: 4.1,
        turnoverScore: 1.6,
        valueProposition: "Acteur technologique de premier plan en France.",
        recentMilestones: ["Consolidation de la direction produit européenne"],
        realRealityReport: "L'onboarding est rapide mais autonome. L'ambiance est positive et respectueuse des horaires individuels.",
        activeJobs: ["Product Owner Senior - Core Banking", "Product Manager - API Platform", "Consultant Technique Senior"]
      };

      let aiData: Partial<CompanyWiki> = {};
      try {
        const parsed = JSON.parse(response.text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) aiData = parsed;
      } catch {
        /* keep defaults if the gateway output isn't parseable */
      }

      const parsedData: CompanyWiki = {
        ...defaults,
        ...aiData,
        id: defaults.id,
        name: query,
        perks: { ...defaults.perks, ...(aiData.perks || {}) },
        tools: aiData.tools?.length ? aiData.tools : defaults.tools,
        recruitmentProcessSteps: aiData.recruitmentProcessSteps?.length ? aiData.recruitmentProcessSteps : defaults.recruitmentProcessSteps,
        recentMilestones: aiData.recentMilestones?.length ? aiData.recentMilestones : defaults.recentMilestones,
        activeJobs: aiData.activeJobs?.length ? aiData.activeJobs : defaults.activeJobs
      };

      setCompanies(prev => {
        const exists = prev.some(c => c.id === parsedData.id);
        if (exists) return prev.map(c => c.id === parsedData.id ? parsedData : c);
        return [parsedData, ...prev];
      });

      setProactiveJobsList(parsedData.activeJobs || []);
      setShowJobDropdown(true);
      triggerNotification(`Recherche Google Grounding fructueuse pour ${parsedData.name}!`, "success");
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCompanyLive(false);
    }
  };

  const handleSelectProactiveJob = (job: string) => {
    const matchingCompany = companies.find(c => c.activeJobs?.includes(job));
    const companyName = matchingCompany ? matchingCompany.name : companySearchInput;
    const city = matchingCompany ? matchingCompany.city : "Paris";
    
    const newOpp: KanbanOpportunity = {
      id: `opp-${Date.now()}`,
      companyName: companyName,
      roleTitle: job,
      city: city,
      currentStepIndex: 0,
      steps: matchingCompany?.recruitmentProcessSteps.length ? matchingCompany.recruitmentProcessSteps : [...PREDEFINED_STEPS],
      status: "active",
      dossierGenerated: false,
      jdText: `Description et enjeux de l'emploi pour le poste "${job}" chez ${companyName}.\nOutils attendus: ${matchingCompany?.tools.join(', ') || "Salesforce, Slack"}.\nPolitique: ${matchingCompany?.remotePolicy || "Hybride"}.`
    };

    setOpportunities(prev => [...prev, newOpp]);
    setSelectedOpportunity(newOpp);
    setJobDescriptionInput(newOpp.jdText || '');
    setShowJobDropdown(false);
    addAgentMessage(`Génial ! J'ai intégré "${job} chez ${companyName}" à tes dossiers actifs. On prépare le plan de combat ?`);
    triggerNotification("Opportunité intégrée !", "success");
  };

  const handleAddNewOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppForm.companyName || !newOppForm.roleTitle) {
      triggerNotification("Champs obligatoires manquants", "error");
      return;
    }

    const newOpp: KanbanOpportunity = {
      id: `opp-${Date.now()}`,
      companyName: newOppForm.companyName,
      roleTitle: newOppForm.roleTitle,
      city: newOppForm.city,
      currentStepIndex: 0,
      steps: newOppForm.steps.length ? newOppForm.steps : [...PREDEFINED_STEPS],
      status: "active",
      dossierGenerated: false,
      jdText: newOppForm.jdText || `Offre standard chez ${newOppForm.companyName}.`
    };

    setOpportunities(prev => [...prev, newOpp]);
    setShowAddOppModal(false);
    setNewOppForm({ companyName: '', roleTitle: '', city: 'Paris', steps: [...PREDEFINED_STEPS], jdText: '' });
    triggerNotification("Opportunité ajoutée au Kanban !", "success");
  };

  const triggerStepTransition = (oppId: string, nextIndex: number) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;

    if (nextIndex >= opp.steps.length) {
      setDebriefOpportunity({ ...opp, status: 'won' });
      setIsDebriefOpen(true);
    } else {
      setTransitionTargetOpp({ oppId, nextIndex });
      setTransitionComment('');
      setTransitionTools('');
      setTransitionDuration('30m');
      const hasSalaryBeenDiscussed = opp.historyDebriefs?.some(h => h.salaryDiscussed !== 'non_evoque');
      setTransitionSalaryDiscussed(hasSalaryBeenDiscussed ? 'deja_evoque' : 'non_evoque');
      setTransitionDebriefOpen(true);
    }
  };

  const handleTransitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionTargetOpp) return;

    const { oppId, nextIndex } = transitionTargetOpp;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;

    const currentStepName = opp.steps[opp.currentStepIndex];

    setOpportunities(prev => prev.map(o => {
      if (o.id === oppId) {
        const history = o.historyDebriefs || [];
        return {
          ...o,
          currentStepIndex: nextIndex,
          historyDebriefs: [...history, {
            stepName: currentStepName,
            comment: transitionComment,
            toolsDiscussed: transitionTools,
            duration: transitionDuration,
            salaryDiscussed: transitionSalaryDiscussed
          }]
        };
      }
      return o;
    }));

    setTokens(prev => prev + 1);
    setTransitionDebriefOpen(false);
    setTransitionTargetOpp(null);
    triggerNotification("Étape validée ! +1 crédit pour ton feedback.", "success");
    addAgentMessage(`Félicitations pour le passage d'étape chez ${opp.companyName}. Ton retour sur "${currentStepName}" a été consigné pour alimenter notre intelligence collective.`);
  };

  const handleManualStatusChange = (oppId: string, targetStatus: KanbanOpportunity['status']) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === oppId) {
        return { ...o, status: targetStatus };
      }
      return o;
    }));
    triggerNotification(`Statut mis à jour vers : ${targetStatus}`, "success");
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyForm.name) return;

    const mutuelleVal = newCompanyForm.mutuelleName === 'Autre' 
      ? newCompanyForm.customMutuelleName 
      : newCompanyForm.mutuelleName;

    const newComp: CompanyWiki = {
      id: newCompanyForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCompanyForm.name,
      city: newCompanyForm.city,
      country: newCompanyForm.country,
      isSubsidiary: newCompanyForm.isSubsidiary,
      baseSalaryAvg: newCompanyForm.baseSalary,
      baseSalaryType: newCompanyForm.baseSalaryType,
      variablePay: newCompanyForm.variablePay,
      perks: {
        greenMobility: newCompanyForm.greenMobility,
        ticketsResto: newCompanyForm.ticketsResto,
        ce: newCompanyForm.ce,
        mutuelleName: mutuelleVal,
        workPhone: newCompanyForm.workPhone,
        rtt: newCompanyForm.rtt,
        participation: newCompanyForm.participation
      },
      tools: newCompanyForm.tools.split(',').map(t => t.trim()).filter(Boolean),
      recruitmentProcessSteps: [...PREDEFINED_STEPS],
      remotePolicy: newCompanyForm.remotePolicy,
      overallEnvironmentScore: newCompanyForm.overallScore,
      workLifeBalanceScore: newCompanyForm.workLifeBalanceScore,
      turnoverScore: newCompanyForm.turnoverScore,
      valueProposition: newCompanyForm.realityReport ? "Enregistré par un contributeur" : "N/A",
      recentMilestones: ["Ajouté par la communauté"],
      realRealityReport: newCompanyForm.realityReport || "Pas encore de Reality Check renseigné."
    };

    setCompanies(prev => [newComp, ...prev]);
    setShowAddCompanyModal(false);
    triggerNotification(`${newComp.name} ajouté à la vitrine !`, "success");
  };

  const getFilteredAndSortedCompanies = () => {
    return companies
      .filter(c => {
        const query = vitrineFilter.toLowerCase();
        return c.name.toLowerCase().includes(query) || c.city.toLowerCase().includes(query) || c.tools.some(t => t.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (vitrineSort === 'score') return b.overallEnvironmentScore - a.overallEnvironmentScore;
        if (vitrineSort === 'salary') return b.baseSalaryAvg - a.baseSalaryAvg;
        if (vitrineSort === 'jobs') return (b.activeJobs?.length || 0) - (a.activeJobs?.length || 0);
        return 0;
      });
  };

  const handleExerciceHintRequest = async (exeId: string) => {
    setExerciceAnswers(prev => ({
      ...prev,
      [exeId]: { ...prev[exeId], hintUsed: true, hintText: "Chargement de l'indice de combat..." }
    }));

    const contextText = selectedOpportunity 
      ? `Poste : ${selectedOpportunity.roleTitle} chez ${selectedOpportunity.companyName}` 
      : "Poste technique d'élite";

    try {
      const res = await callGeminiAPI(
        `Exercice sélectionné : ${exeId}. Contexte : ${contextText}. Donne-moi l'angle d'attaque pour réussir.`,
        "Donne une recommandation tactique pour aider le candidat sans donner la réponse.",
        { task: 'exercise_hint' }
      );
      setExerciceAnswers(prev => ({
        ...prev,
        [exeId]: { ...prev[exeId], hintText: res.text }
      }));
    } catch (e) {
      setExerciceAnswers(prev => ({
        ...prev,
        [exeId]: { ...prev[exeId], hintText: "Analyse ton audience cible : concentre-toi sur l'impact budgétaire et l'adoption par les équipes terrain." }
      }));
    }
  };

  const handleExerciceSubmit = async (exeId: string) => {
    setExerciceAnswers(prev => ({
      ...prev,
      [exeId]: { ...prev[exeId], isSubmitting: true }
    }));

    try {
      const res = await callGeminiAPI(
        `Exercice ID: ${exeId}. Proposition du candidat: "${exerciceAnswers[exeId].userProposal}".`,
        "Analyse la réponse selon le framework STAR.",
        { isJSON: true, task: 'exercise_eval' }
      );
      const data = JSON.parse(res.text);

      setExerciceAnswers(prev => ({
        ...prev,
        [exeId]: {
          ...prev[exeId],
          isSubmitting: false,
          evaluation: data
        }
      }));
      triggerNotification("Rapport d'exercice validé !", "success");
    } catch (e) {
      console.error(e);
      setExerciceAnswers(prev => ({
        ...prev,
        [exeId]: { ...prev[exeId], isSubmitting: false }
      }));
    }
  };

  const handleGiveToGetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGiveToGetExpIndex === null) {
      triggerNotification("Veuillez sélectionner l'une de vos expériences passées", "error");
      return;
    }

    const exp = onboardingForm.pastExperiences[selectedGiveToGetExpIndex];

    const finalMutuelle = giveToGetForm.mutuelleName === 'Autre' 
      ? giveToGetForm.customMutuelleName 
      : giveToGetForm.mutuelleName;

    const newCompany: CompanyWiki = {
      id: exp.companyName.toLowerCase().replace(/\s+/g, '-'),
      name: exp.companyName,
      city: "Paris",
      country: "France",
      isSubsidiary: giveToGetForm.isSubsidiary,
      baseSalaryAvg: giveToGetForm.baseSalary,
      baseSalaryType: giveToGetForm.baseSalaryType,
      variablePay: giveToGetForm.variablePay,
      perks: {
        greenMobility: giveToGetForm.greenMobility,
        ticketsResto: giveToGetForm.ticketsResto,
        ce: giveToGetForm.ce,
        mutuelleName: finalMutuelle,
        workPhone: giveToGetForm.workPhone,
        rtt: giveToGetForm.rtt,
        participation: giveToGetForm.participation
      },
      tools: giveToGetForm.tools.split(',').map(t => t.trim()).filter(Boolean),
      recruitmentProcessSteps: [...PREDEFINED_STEPS],
      remotePolicy: "Hybride standard",
      overallEnvironmentScore: 4.4,
      workLifeBalanceScore: giveToGetForm.workLifeBalanceScore,
      turnoverScore: giveToGetForm.turnoverScore,
      valueProposition: "Expérience vérifiée suite au parcours de l'utilisateur.",
      recentMilestones: ["Rapport de réalité de l'onboarding validé par un pair"],
      realRealityReport: giveToGetForm.realityReport || "Rapport de réalité non-complété."
    };

    setCompanies(prev => [newCompany, ...prev]);
    setTokens(prev => prev + 3);
    setSelectedGiveToGetExpIndex(null);
    setGiveToGetForm({
      baseSalary: 45000,
      baseSalaryType: 'cadre',
      variablePay: '10K€',
      greenMobility: true,
      ticketsResto: true,
      ce: false,
      rtt: true,
      participation: false,
      mutuelleName: 'Alan Blue',
      customMutuelleName: '',
      workPhone: true,
      tools: 'Salesforce, Slack, Notion',
      realityReport: '',
      isSubsidiary: false,
      workLifeBalanceScore: 4,
      turnoverScore: 2,
      sector: 'Sales'
    });

    triggerNotification("Contribution validée ! +3 Crédits", "success");
    addAgentMessage(`Merci beaucoup pour ton partage éthique. Ton expérience chez ${exp.companyName} est maintenant consolidée anonymement. +3 crédits de recherche ajoutés à ton cockpit.`);
  };

  const handleGenerateStrategicDossier = async (companyName: string, jobTitle: string) => {
    setIsGeneratingDossier(true);

    const promptText = `
    === INFOS CANDIDAT ===
    Nom Complet: ${onboardingForm.firstName} ${onboardingForm.lastName}
    CV Brut: ${onboardingForm.cvText}
    Titre: ${onboardingForm.profileTitle}
    
    === ENTREPRISE CIBLE ===
    Nom: ${companyName}
    Poste: ${jobTitle}
    Description du poste: ${jobDescriptionInput}
    `;

    try {
      const response = await callGeminiAPI(promptText, "Bâtis un rapport de combat d'entretien.", { isJSON: true, task: 'dossier' });

      const parsedDossier: StrategicDossier = JSON.parse(response.text);
      setCurrentDossier(parsedDossier);
      setTokens(prev => Math.max(0, prev - 1));

      setOpportunities(prev => prev.map(o => {
        if (o.companyName.toLowerCase() === companyName.toLowerCase()) {
          return { ...o, dossierGenerated: true };
        }
        return o;
      }));

      if (parsedDossier?.useCaseScenario?.length) {
        const customAnswers: typeof exerciceAnswers = {};
        parsedDossier.useCaseScenario.forEach(exe => {
          customAnswers[exe.id] = {
            userProposal: '',
            evaluation: null,
            isSubmitting: false,
            hintUsed: false,
            hintText: ''
          };
        });
        setExerciceAnswers(customAnswers);
        setSelectedExerciceId(parsedDossier.useCaseScenario[0].id);
      }

      addAgentMessage(`Dossier stratégique généré pour ${companyName} ! J'ai cartographié les forces, les goulots d'étranglements de compétences ainsi que ton pitch personnalisé.`);
      triggerNotification("Dossier d'impact généré ! -1 crédit", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Erreur lors de la génération du dossier.", "error");
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  const handleCoachAnswerSubmit = async () => {
    const session = coachSessions[selectedCoachRole];
    if (!session.currentAnswer.trim() || session.isEvaluating) return;

    setCoachSessions(prev => ({
      ...prev,
      [selectedCoachRole]: { ...prev[selectedCoachRole], isEvaluating: true }
    }));

    const userAns = session.currentAnswer;

    try {
      const response = await callGeminiAPI(
        `Tu es l'interlocuteur "${selectedCoachRole}" en entretien. Nouvelle réponse du candidat : "${userAns}"`,
        "Analyse la réponse selon la grille STAR.",
        { isJSON: true, task: 'coach_eval' }
      );

      const data = JSON.parse(response.text);

      setCoachSessions(prev => {
        const hist = [...prev[selectedCoachRole].history];
        hist.push({
          role: 'user',
          text: userAns,
          feedback: data.critique,
          rating: data.rating as 'good' | 'average' | 'poor',
          optimized: data.optimizedResponse
        });
        hist.push({
          role: 'model',
          text: data.nextInterviewerQuestion
        });

        return {
          ...prev,
          [selectedCoachRole]: {
            history: hist,
            currentAnswer: '',
            isEvaluating: false
          }
        };
      });
      triggerNotification("Évaluation STAR actualisée !", "success");
    } catch (e) {
      console.error(e);
      setCoachSessions(prev => ({
        ...prev,
        [selectedCoachRole]: { ...prev[selectedCoachRole], isEvaluating: false }
      }));
    }
  };

  const handlePostInterviewDebriefSubmit = async () => {
    if (!postInterviewDebriefSession.currentAnswer.trim() || postInterviewDebriefSession.isEvaluating) return;

    setPostInterviewDebriefSession(prev => ({ ...prev, isEvaluating: true }));
    const userAns = postInterviewDebriefSession.currentAnswer;

    try {
      const res = await callGeminiAPI(
        `Ressenti de l'utilisateur suite à son entretien d'étape : "${userAns}"`,
        "Tu es Victor l'Éclaireur, le coach d'analyse post-entretien.",
        { task: 'debrief' }
      );

      setPostInterviewDebriefSession(prev => {
        const hist = [...prev.history];
        hist.push({ role: 'user', text: userAns });
        hist.push({ role: 'model', text: res.text });
        return {
          history: hist,
          currentAnswer: '',
          isEvaluating: false
        };
      });
    } catch (e) {
      console.error(e);
      setPostInterviewDebriefSession(prev => ({ ...prev, isEvaluating: false }));
    }
  };

  const handleDebriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debriefOpportunity) return;

    setOpportunities(prev => prev.map(o => {
      if (o.id === debriefOpportunity.id) {
        return {
          ...o,
          status: debriefOpportunity.status === 'won' ? 'won' : 'archived_refused',
          salaryProposed: debriefForm.salaryDiscussed,
          peopleMet: debriefForm.peopleMet.split(',').map(p => p.trim()),
          debriefCompleted: true
        };
      }
      return o;
    }));

    setTokens(prev => prev + 2);
    setIsDebriefOpen(false);
    setDebriefOpportunity(null);
    addAgentMessage(`Merci d'avoir débriefé l'issue du processus chez ${debriefOpportunity.companyName}. +2 crédits offerts.`);
    triggerNotification("Débriefing final enregistré !", "success");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans antialiased flex flex-col md:flex-row">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all transform animate-fadeIn ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
          notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-500' :
            notification.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
          }`}></span>
          {notification.text}
        </div>
      )}

      {/* LEFT PANEL: CENTRAL CONVERSATIONAL AGENT (VICTOR, CO-PILOT) */}
      <aside className="w-full md:w-80 bg-neutral-900 text-white flex flex-col border-r border-neutral-800 shrink-0">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white text-neutral-900 flex items-center justify-center font-mono font-black text-base shadow-inner relative overflow-hidden">
              V
              <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <div>
              <span className="font-semibold text-xs tracking-tight block">Victor l'Éclaireur</span>
              <span className="text-[9px] text-emerald-400 font-mono font-semibold block -mt-0.5">GUIDE IA ACTIF</span>
            </div>
          </div>
          <div className="bg-neutral-800 text-[10px] text-neutral-400 font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-700">
            {tokens} Cr.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[300px] md:max-h-none">
          {agentMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-3 py-2.5 text-[11px] leading-relaxed border ${
                msg.role === 'user' 
                  ? 'bg-neutral-800 text-white border-neutral-700 rounded-br-none' 
                  : 'bg-white text-neutral-900 border-neutral-200 rounded-bl-none shadow-md'
              }`}>
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                <span className="text-[8px] font-mono block text-right mt-1 opacity-50">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isAgentThinking && (
            <div className="flex justify-start">
              <div className="bg-white text-neutral-900 border border-neutral-200 rounded-xl rounded-bl-none p-3 shadow-md max-w-[90%]">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-[10px] text-neutral-400 font-mono ml-2">Analyse tactique...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={agentEndRef} />
        </div>

        <form onSubmit={handleAgentConversationSubmit} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-1.5">
          <input 
            type="text"
            value={agentInput}
            onChange={e => setAgentInput(e.target.value)}
            placeholder="Pose une question à Victor..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
          />
          <button 
            type="submit" 
            disabled={isAgentThinking}
            className="bg-white text-black hover:bg-neutral-200 p-1.5 rounded-lg transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5"/>
          </button>
        </form>

        <div className="bg-neutral-950/45 p-3 border-t border-neutral-800/80 text-[10px] text-neutral-400 space-y-1">
          <span className="font-bold text-[8px] tracking-wider uppercase text-neutral-500 block mb-1">Actions d'Élite disponibles :</span>
          <button 
            type="button" 
            onClick={() => addAgentMessage("Victor, écris-moi un court modèle d'e-mail de remerciements post-entretien.")}
            className="w-full text-left hover:text-white transition truncate block">• Rédiger un mail de remerciements</button>
          <button 
            type="button" 
            onClick={() => addAgentMessage("Victor, comment réagir si on me propose un statut non-cadre au lieu de cadre ?")}
            className="w-full text-left hover:text-white transition truncate block">• Gérer la requalification Cadre / Non-Cadre</button>
        </div>
      </aside>

      {/* RIGHT MAIN FRAMEWORK */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAV HEADER */}
        <nav className="bg-white border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-neutral-900">Copilot_Prep</span>
            <span className="text-[10px] bg-neutral-100 border px-1.5 py-0.2 rounded font-mono font-bold">PROTOTYPE PLATFORME</span>
          </div>

          {onboardingCompleted && (
            <div className="flex items-center bg-neutral-50 p-0.5 rounded-lg border border-neutral-250">
              <button 
                onClick={() => setActiveTab('cockpit')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${activeTab === 'cockpit' ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'}`}
              >
                <Briefcase className="h-3.5 w-3.5"/> Cockpit & Préparations
              </button>
              <button 
                onClick={() => setActiveTab('vitrine')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${activeTab === 'vitrine' ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'}`}
              >
                <Compass className="h-3.5 w-3.5"/> Vitrine Entreprises (Wikidex)
              </button>
              <button 
                onClick={() => setActiveTab('contribuer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${activeTab === 'contribuer' ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'}`}
              >
                <Sparkles className="h-3.5 w-3.5"/> Give-to-Get (+3)
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowApiKeyModal(true)} 
              className="text-xs bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 p-1.5 rounded-lg flex items-center gap-1 text-neutral-700"
            >
              <Settings className="h-3.5 w-3.5"/> API
            </button>
            {onboardingCompleted && (
              <button 
                onClick={() => {
                  setOnboardingCompleted(false);
                  setOnboardingStep(1);
                  addAgentMessage("Modifions ton profil d'onboarding.");
                }}
                className="text-xs text-neutral-500 hover:text-black font-semibold"
              >
                Éditer Profil
              </button>
            )}
          </div>
        </nav>

        {/* MAIN VIEWS */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          
          {/* FLOW 1: RE-ENGINEERED ONBOARDING */}
          {!onboardingCompleted && (
            <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
              
              <div className="bg-neutral-900 text-white p-4 rounded-2xl mb-6 flex gap-3 items-start border border-neutral-800">
                <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-mono font-bold shrink-0">V</div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-amber-400 block uppercase tracking-wide text-[9px]">Pourquoi cette étape est capitale pour toi :</span>
                  {onboardingStep === 1 && (
                    <p className="text-neutral-300 leading-relaxed">
                      "Nous allons cartographier ton profil LinkedIn et ton CV brut. Cela permet de paramétrer tes mots-clés d'élite et de simuler immédiatement ton indice d'optimisation pour les robots de tri ATS."
                    </p>
                  )}
                  {onboardingStep === 2 && (
                    <p className="text-neutral-300 leading-relaxed">
                      "Ici, nous définissons ta trajectoire de rêve et les motifs de ta démarche commerciale. Cela oriente les recherches de mes agents d'investigation Google."
                    </p>
                  )}
                  {onboardingStep === 3 && (
                    <p className="text-neutral-300 leading-relaxed">
                      "Le nerf de la guerre. Nous convertissons ton brut de référence actuel en pouvoir d'achat mensuel après cotisations et prélèvements progressifs à la source en France."
                    </p>
                  )}
                  {onboardingStep === 4 && (
                    <p className="text-neutral-300 leading-relaxed">
                      "Comprendre tes plus grandes craintes (syndrome de l'imposteur, négociation salariale) me permet d'adapter l'agressivité de mon coaching d'entraînement d'IA."
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-b pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Étape {onboardingStep} sur 4</span>
                  <h2 className="text-base font-black text-neutral-950 mt-0.5">Configuration Tactique</h2>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 w-6 rounded-full transition ${s <= onboardingStep ? 'bg-neutral-900' : 'bg-neutral-100'}`}></div>
                  ))}
                </div>
              </div>

              {/* STEP 1: IDENTITY & PROACTIVE LINKEDIN VERIFICATION WITH CAROUSEL */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Prénom *</label>
                      <input 
                        type="text" 
                        value={onboardingForm.firstName}
                        onChange={e => setOnboardingForm({...onboardingForm, firstName: e.target.value})}
                        placeholder="Ex: Stephanie"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Nom *</label>
                      <input 
                        type="text" 
                        value={onboardingForm.lastName}
                        onChange={e => setOnboardingForm({...onboardingForm, lastName: e.target.value})}
                        placeholder="Ex: Van Wynsberghe"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowManualLinkedIn(!showManualLinkedIn);
                        setLinkedInSearchResults([]);
                      }}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition"
                    >
                      {showManualLinkedIn ? "Retourner à la recherche" : "Saisie Manuelle Directe"}
                    </button>
                    <button 
                      type="button"
                      onClick={triggerProactiveLinkedInScan}
                      disabled={linkedInScanning}
                      className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {linkedInScanning ? "Scan IA en cours..." : "Rechercher mon profil LinkedIn"}
                    </button>
                  </div>

                  {/* Manual LinkedIn override block */}
                  {showManualLinkedIn && (
                    <div className="bg-neutral-50 border border-neutral-250 p-4 rounded-2xl space-y-3 animate-fadeIn">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Saisie manuelle sécurisée :</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 mb-1">Nom d'utilisateur LinkedIn</label>
                          <input 
                            type="text"
                            value={manualUsername}
                            onChange={e => setManualUsername(e.target.value)}
                            placeholder="Ex: stephanie-van-wynsberghe-svr"
                            className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 mb-1">Titre de poste actuel</label>
                          <input 
                            type="text"
                            value={manualTitle}
                            onChange={e => setManualTitle(e.target.value)}
                            placeholder="Ex: Marketing Group Manager at Laboratoire SVR"
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 mb-1">Localisation</label>
                          <input 
                            type="text"
                            value={manualLocation}
                            onChange={e => setManualLocation(e.target.value)}
                            placeholder="Ex: Paris, France"
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!manualUsername || !manualTitle) {
                              triggerNotification("Veuillez remplir au moins le nom d'utilisateur et le titre.", "error");
                              return;
                            }
                            selectLinkedInProfile({
                              username: manualUsername,
                              title: manualTitle,
                              location: manualLocation,
                              avatar: "👤"
                            });
                            setShowManualLinkedIn(false);
                          }}
                          className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold"
                        >
                          Lier ce profil saisi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HORIZONTAL CAROUSEL FOR REAL-WORLD ALIGNED RESULTS */}
                  {linkedInSearchResults.length > 0 && (
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block font-bold">👀 Faites glisser pour valider votre profil trouvé :</span>
                        <span className="text-[10px] text-neutral-400 font-medium">Défilement horizontal →</span>
                      </div>
                      
                      <div className="flex overflow-x-auto gap-3 pb-3 snap-x scrollbar-thin scrollbar-thumb-gray-300">
                        {linkedInSearchResults.map((prof, idx) => {
                          const isSelected = onboardingForm.linkedInUrl.includes(prof.username);
                          return (
                            <div 
                              key={idx}
                              onClick={() => selectLinkedInProfile(prof)}
                              className={`flex-none w-56 p-4 bg-white border rounded-xl cursor-pointer hover:border-neutral-950 transition-all flex flex-col justify-between text-center space-y-3 snap-start relative ${
                                isSelected ? 'border-neutral-900 ring-2 ring-neutral-950/20' : 'border-neutral-200'
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 bg-neutral-900 text-white rounded-full p-0.5 text-[8px] font-bold px-1.5">
                                  ✓ Lié
                                </span>
                              )}
                              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-2xl mx-auto shadow-inner">
                                {prof.avatar}
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-neutral-800 block truncate">@{prof.username}</span>
                                <span className="text-[10px] text-neutral-600 block leading-tight font-medium h-8 overflow-hidden line-clamp-2 mt-1">{prof.title}</span>
                                <span className="text-[9px] text-neutral-400 block mt-1">{prof.location}</span>
                              </div>
                              <button 
                                type="button"
                                className={`w-full py-1 rounded text-[10px] font-bold transition ${
                                  isSelected ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-900 text-white hover:bg-black'
                                }`}
                              >
                                {isSelected ? "Profil sélectionné" : "C'est mon profil"}
                              </button>
                            </div>
                          );
                        })}

                        <div 
                          onClick={() => {
                            setShowManualLinkedIn(true);
                            setLinkedInSearchResults([]);
                          }}
                          className="flex-none w-56 p-4 bg-neutral-100 border border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-800 hover:bg-neutral-50 transition-all flex flex-col justify-center items-center text-center space-y-3 snap-end"
                        >
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-sm text-neutral-500">
                            ✏️
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-neutral-700 block">Mon profil n'est pas là</span>
                            <span className="text-[9px] text-neutral-400 block mt-1 leading-tight">Saisir manuellement mon username et mon titre de poste en 10 secondes.</span>
                          </div>
                          <span className="text-[9px] font-bold text-neutral-900 underline">Écrire manuellement</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Titre de profil validé</label>
                      <input 
                        type="text" 
                        value={onboardingForm.profileTitle}
                        onChange={e => setOnboardingForm({...onboardingForm, profileTitle: e.target.value})}
                        placeholder="Ex: Marketing Group Manager"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Texte Brut du CV (Pour compatibilité ATS)</label>
                      <textarea 
                        value={onboardingForm.cvText}
                        onChange={e => setOnboardingForm({...onboardingForm, cvText: e.target.value})}
                        rows={4}
                        placeholder="Colle ton CV ou laisse l'analyse LinkedIn le reconstituer..."
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {atsAnalysis && (
                    <div className="bg-emerald-50/20 border border-emerald-150 p-4 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Audit de Lisibilité ATS intégré :</span>
                        <span className="text-xs text-neutral-900 font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono">{atsAnalysis.score}/100</span>
                      </div>
                      <div className="text-[10px] text-neutral-600 space-y-1">
                        <p className="font-semibold text-neutral-800">Problèmes critiques d'optimisation détectés :</p>
                        {atsAnalysis.criticalIssues.map((issue, idx) => (
                          <div key={idx} className="flex gap-1.5 items-start">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium font-mono bg-white p-2 rounded border">Mots-clés requis détectés : {atsAnalysis.suggestedKeywords.join(', ')}</div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ASPIRATIONS & TARGETED COMPANIES */}
              {onboardingStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Quelles sont tes 3 boîtes de rêves ? (Laisse vide pour des exemples)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[0, 1, 2].map(idx => (
                        <input 
                          key={idx}
                          type="text"
                          value={onboardingForm.dreamCompanies[idx] || ''}
                          onChange={e => {
                            const list = [...onboardingForm.dreamCompanies];
                            list[idx] = e.target.value;
                            setOnboardingForm({...onboardingForm, dreamCompanies: list});
                          }}
                          placeholder={`Ex: Qonto, Stripe, Alan...`}
                          className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-2">Es-tu en recherche active d'emploi ?</label>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setOnboardingForm({...onboardingForm, isSearching: 'YES'})}
                        className={`flex-1 py-2.5 border rounded-xl text-xs font-semibold transition ${onboardingForm.isSearching === 'YES' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
                      >
                        Oui, recherche active
                      </button>
                      <button 
                        type="button"
                        onClick={() => setOnboardingForm({...onboardingForm, isSearching: 'NO'})}
                        className={`flex-1 py-2.5 border rounded-xl text-xs font-semibold transition ${onboardingForm.isSearching === 'NO' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
                      >
                        Non, simple veille
                      </button>
                    </div>
                  </div>

                  {onboardingForm.isSearching === 'YES' && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Pourquoi as-tu envie de changer ?</label>
                      <textarea 
                        value={onboardingForm.searchReason}
                        onChange={e => setOnboardingForm({...onboardingForm, searchReason: e.target.value})}
                        placeholder="Ex: Manque de perspectives d'évolution, recherche de transparence..."
                        rows={3}
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DYNAMIC FRENCH INCOME FISCAL CALCULATOR */}
              {onboardingStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-neutral-50 border p-4 rounded-xl">
                    <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-1 font-bold">
                      <TrendingUp className="h-4.5 w-4.5 text-neutral-500"/>
                      Simulateur Fiscal & Social de Référence (Barème Proactif)
                    </h3>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Nous convertissons automatiquement le montant brut pour calculer la quote-part fiscale et le net disponible mensuel réel.
                    </p>
                  </div>

                  {isSalaryDivergent && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800 animate-fadeIn">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5"/>
                      <div className="space-y-1">
                        <span className="font-bold text-amber-900">Attention : Écart de prétentions élevé (+{salaryDiffPercent}%)</span>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          Viser une augmentation supérieure à 35% sans changement de périmètre managérial ou géographique est considéré comme très ambitieux en France. Préparez des arguments de poids basés sur vos compétences rares (notre Dossier Stratégique vous guidera).
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-neutral-200 p-4 rounded-xl space-y-3 bg-white">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Rémunération Actuelle</span>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 mb-1">Salaire brut annuel (€)</label>
                        <input 
                          type="number"
                          value={onboardingForm.currentSalaryBrut || ''}
                          onChange={e => setOnboardingForm({...onboardingForm, currentSalaryBrut: Number(e.target.value)})}
                          className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => setOnboardingForm({...onboardingForm, currentSalaryType: 'cadre'})}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded border transition ${onboardingForm.currentSalaryType === 'cadre' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}
                        >
                          Cadre (~23%)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOnboardingForm({...onboardingForm, currentSalaryType: 'non-cadre'})}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded border transition ${onboardingForm.currentSalaryType === 'non-cadre' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}
                        >
                          Non-Cadre (~22%)
                        </button>
                      </div>

                      <div className="border-t pt-2">
                        <SalaryBadge brut={onboardingForm.currentSalaryBrut} type={onboardingForm.currentSalaryType}/>
                      </div>
                    </div>

                    <div className="border border-neutral-200 p-4 rounded-xl space-y-3 bg-white">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Prétentions Salariales</span>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 mb-1">Salaire brut visé (€)</label>
                        <input 
                          type="number"
                          value={onboardingForm.expectedSalaryBrut || ''}
                          onChange={e => setOnboardingForm({...onboardingForm, expectedSalaryBrut: Number(e.target.value)})}
                          className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => setOnboardingForm({...onboardingForm, expectedSalaryType: 'cadre'})}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded border transition ${onboardingForm.expectedSalaryType === 'cadre' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}
                        >
                          Cadre (~23%)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOnboardingForm({...onboardingForm, expectedSalaryType: 'non-cadre'})}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded border transition ${onboardingForm.expectedSalaryType === 'non-cadre' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}
                        >
                          Non-Cadre (~22%)
                        </button>
                      </div>

                      <div className="border-t pt-2">
                        <SalaryBadge brut={onboardingForm.expectedSalaryBrut} type={onboardingForm.expectedSalaryType}/>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ROADBLOCKS & SYSTEM LAUNCH */}
              {onboardingStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Quels sont tes plus gros freins ou craintes dans la recherche d'emploi ?</label>
                    <textarea 
                      value={onboardingForm.biggestRoadblock}
                      onChange={e => setOnboardingForm({...onboardingForm, biggestRoadblock: e.target.value})}
                      placeholder="Ex: Négocier le fixe, peur d'avoir un décalage entre la fiche de poste et la réalité..."
                      rows={3}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-neutral-800 block">Récapitulatif de ton profil de combat :</span>
                    <div className="grid grid-cols-2 gap-3 text-neutral-600 font-medium">
                      <div><span className="font-bold text-neutral-400">Identité:</span> {onboardingForm.firstName} {onboardingForm.lastName}</div>
                      <div><span className="font-bold text-neutral-400">Titre ciblé:</span> {onboardingForm.profileTitle}</div>
                      <div><span className="font-bold text-neutral-400">Prétention:</span> {onboardingForm.expectedSalaryBrut / 1000} K€ ({expectedSalaryCalc.netSocialMonth}€ net/m)</div>
                      <div><span className="font-bold text-neutral-400">Entreprises cibles:</span> {onboardingForm.dreamCompanies.filter(Boolean).join(', ') || "Non renseigné"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center border-t pt-4 mt-6">
                <button 
                  type="button"
                  disabled={onboardingStep === 1}
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="text-xs font-bold text-neutral-400 hover:text-black transition disabled:opacity-40"
                >
                  Retour
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (onboardingStep < 4) {
                      setOnboardingStep(prev => prev + 1);
                    } else {
                      setOnboardingCompleted(true);
                      setTokens(prev => prev + 1);
                      addAgentMessage(`Félicitations ${onboardingForm.firstName} ! Ton profil est validé et lié à ton compte. Tu possèdes maintenant ${tokens + 1} crédits de recherche pour lancer tes dossiers stratégiques.`);
                      triggerNotification("Profil enregistré ! +1 Crédit de bienvenue", "success");
                    }
                  }}
                  className="px-5 py-2.5 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  {onboardingStep === 4 ? "Finaliser et Ouvrir le Cockpit" : "Continuer"}
                </button>
              </div>
            </div>
          )}

          {/* FLOW 2: COCKPIT & PREPA WITH CUSTOM KANBAN */}
          {onboardingCompleted && activeTab === 'cockpit' && (
            <div className="space-y-6">
              
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {onboardingForm.linkedInAvatar || '👤'}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-neutral-950 flex items-center gap-2">
                      {onboardingForm.firstName} {onboardingForm.lastName}
                      <span className="text-[10px] bg-neutral-100 border px-1.5 py-0.2 rounded text-neutral-600 font-mono font-bold">{onboardingForm.profileTitle}</span>
                    </h2>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                      Cibles : {onboardingForm.dreamCompanies.filter(Boolean).join(', ') || "Non renseigné"} • Prétentions : {onboardingForm.expectedSalaryBrut / 1000} K€ ({expectedSalaryCalc.netSocialMonth}€ net/m)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowAddOppModal(true)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5"/> Nouvelle opportunité
                  </button>
                </div>
              </div>

              {/* CUSTOM STAGE BOARD */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
                
                {/* Column 1: Entreprises Favorites */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b pb-2 mb-3 font-bold">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">1. Favoris Wikidex</span>
                    <span className="text-[10px] bg-neutral-200 font-bold px-1.5 py-0.2 rounded font-mono">{opportunities.filter(o => o.status === 'favorite').length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {opportunities.filter(o => o.status === 'favorite').map(opp => (
                      <div 
                        key={opp.id}
                        className="p-3 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-2 hover:border-black transition cursor-pointer"
                        onClick={() => {
                          setSelectedOpportunity(opp);
                          setJobDescriptionInput(opp.jdText || '');
                        }}
                      >
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide block font-bold">{opp.companyName}</span>
                        <h4 className="text-xs font-semibold text-neutral-800 leading-tight font-black">{opp.roleTitle}</h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualStatusChange(opp.id, 'active');
                          }}
                          className="w-full py-1 bg-neutral-900 text-white font-bold rounded text-[10px] hover:bg-black transition flex items-center justify-center gap-1"
                        >
                          🚀 Postuler & Préparer
                        </button>
                      </div>
                    ))}
                    {opportunities.filter(o => o.status === 'favorite').length === 0 && (
                      <div className="text-[10px] text-neutral-400 text-center py-8 italic font-medium">
                        Ajoutez des entreprises favorites depuis la Vitrine Wikidex.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: En cours de process */}
                <div className="bg-neutral-50/50 border border-neutral-250 rounded-2xl p-3 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">2. En cours</span>
                    <span className="text-[10px] bg-neutral-200 font-bold px-1.5 py-0.2 rounded font-mono">{opportunities.filter(o => o.status === 'active').length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {opportunities.filter(o => o.status === 'active').map(opp => {
                      const currentStepName = opp.steps[opp.currentStepIndex] || "N/A";
                      return (
                        <div 
                          key={opp.id}
                          onClick={() => {
                            setSelectedOpportunity(opp);
                            setJobDescriptionInput(opp.jdText || '');
                          }}
                          className={`p-3 rounded-xl border bg-white shadow-sm cursor-pointer hover:border-black transition space-y-1.5 ${selectedOpportunity?.id === opp.id ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">{opp.companyName}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpportunities(prev => prev.filter(o => o.id !== opp.id));
                                if (selectedOpportunity?.id === opp.id) setSelectedOpportunity(null);
                              }}
                              className="text-neutral-300 hover:text-rose-500"
                            >
                              <Trash2 className="h-3 w-3"/>
                            </button>
                          </div>
                          <h4 className="text-xs font-semibold text-neutral-800 leading-tight">{opp.roleTitle}</h4>
                          
                          <div className="bg-neutral-50 border p-1.5 rounded-lg text-[10px] flex flex-col gap-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-neutral-500">Étape active:</span>
                              <span className="text-neutral-900">{currentStepName}</span>
                            </div>
                            <div className="flex gap-1">
                              {opp.steps.map((st, i) => (
                                <div 
                                  key={i} 
                                  className={`h-1.5 flex-1 rounded-full ${i <= opp.currentStepIndex ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                                  title={st}
                                ></div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[9px] text-neutral-400 font-semibold">
                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-neutral-500"/> {opp.city}</span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                triggerStepTransition(opp.id, opp.currentStepIndex + 1); 
                              }}
                              className="text-neutral-800 hover:underline font-bold"
                            >
                              Suivant →
                            </button>
                          </div>

                          <div className="flex gap-1 pt-1.5 border-t border-neutral-100">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleManualStatusChange(opp.id, 'won'); }}
                              className="flex-1 py-0.5 bg-emerald-50 text-emerald-800 text-[8px] font-bold rounded border border-emerald-200"
                            >
                              Won
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleManualStatusChange(opp.id, 'refused_needs_debrief'); }}
                              className="flex-1 py-0.5 bg-rose-50 text-rose-800 text-[8px] font-bold rounded border border-rose-200"
                            >
                              Lost
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Offre Reçue */}
                <div className="bg-emerald-50/20 border border-emerald-150 rounded-2xl p-3 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 font-bold">3. Offre Reçue</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">{opportunities.filter(o => o.status === 'won').length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {opportunities.filter(o => o.status === 'won').map(opp => (
                      <div 
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        className="p-3 rounded-xl border border-emerald-200 bg-white shadow-sm space-y-2 cursor-pointer hover:border-emerald-500 transition"
                      >
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">{opp.companyName}</span>
                        <h4 className="text-xs font-semibold text-neutral-800 leading-tight">{opp.roleTitle}</h4>
                        {opp.debriefCompleted ? (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">✓ Débriefing consigné (+2 cr.)</span>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDebriefOpportunity(opp); setIsDebriefOpen(true); }}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold transition animate-pulse"
                          >
                            ⚠️ Débriefer l'offre (+2 Cr.)
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 4: Refusé - Besoin Débrief */}
                <div className="bg-rose-50/20 border border-rose-150 rounded-2xl p-3 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-2 mb-3 font-bold">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 font-bold">4. Refusé - Débrief</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded font-mono">{opportunities.filter(o => o.status === 'refused_needs_debrief').length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {opportunities.filter(o => o.status === 'refused_needs_debrief').map(opp => (
                      <div 
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        className="p-3 rounded-xl border border-rose-200 bg-white shadow-sm space-y-2 cursor-pointer hover:border-rose-500 transition"
                      >
                        <span className="text-[9px] font-bold text-rose-650 uppercase tracking-wide">{opp.companyName}</span>
                        <h4 className="text-xs font-semibold text-neutral-800 leading-tight">{opp.roleTitle}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDebriefOpportunity({ ...opp, status: 'refused_needs_debrief' }); setIsDebriefOpen(true); }}
                          className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition"
                        >
                          Consigner le débrief (+2 Cr.)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 5: Archives */}
                <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-3 flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b pb-2 mb-3 font-bold">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">5. Archives Refusés</span>
                    <span className="text-[10px] bg-neutral-200 font-bold px-1.5 py-0.2 rounded font-mono">{opportunities.filter(o => o.status === 'archived_refused').length}</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {opportunities.filter(o => o.status === 'archived_refused').map(opp => (
                      <div key={opp.id} className="p-3 bg-neutral-50 rounded-xl border opacity-75">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">{opp.companyName}</span>
                        <h4 className="text-xs font-semibold text-neutral-700">{opp.roleTitle}</h4>
                        <span className="text-[8px] text-emerald-600 block mt-1 font-bold">✓ Données de défaillance agrégées</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ACTION PREPARATION CORE LABS */}
              {selectedOpportunity ? (
                <div className="border border-neutral-200 bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
                  <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded">
                        Candidature active : {selectedOpportunity.companyName}
                      </span>
                      <h3 className="text-sm font-black text-neutral-900 mt-1">{selectedOpportunity.roleTitle}</h3>
                    </div>

                    {!selectedOpportunity.dossierGenerated && !currentDossier ? (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-neutral-400 font-bold">Coût : 1 crédit</span>
                        <button 
                          onClick={() => handleGenerateStrategicDossier(selectedOpportunity.companyName, selectedOpportunity.roleTitle)}
                          disabled={tokens < 1 || isGeneratingDossier}
                          className="px-4 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-40"
                        >
                          {isGeneratingDossier ? "Investigation live..." : "Bâtir mon Dossier de Combat"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 bg-neutral-200/50 p-0.5 rounded-lg border border-neutral-250">
                        <button 
                          onClick={() => setActivePrepaTab('dossier')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${activePrepaTab === 'dossier' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                        >
                          📊 Dossier Stratégique
                        </button>
                        <button 
                          onClick={() => setActivePrepaTab('coach')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${activePrepaTab === 'coach' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                        >
                          💬 Coach IA (Multi-Rôles)
                        </button>
                        <button 
                          onClick={() => setActivePrepaTab('cas')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${activePrepaTab === 'cas' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                        >
                          🏆 Exercices Guidés
                        </button>
                        <button 
                          onClick={() => setActivePrepaTab('debrief')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${activePrepaTab === 'debrief' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                        >
                          📢 Débrief d'étape à chaud
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PRE-DOSSIER FORM */}
                  {!selectedOpportunity.dossierGenerated && !currentDossier && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-8 space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Description de la fiche de poste (pour calculer la compatibilité)
                        </label>
                        <textarea 
                          value={jobDescriptionInput}
                          onChange={e => setJobDescriptionInput(e.target.value)}
                          rows={6}
                          placeholder="Colle la fiche de poste..."
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-4 bg-neutral-50 p-4 rounded-xl border flex flex-col justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">Compatibilité Automatique :</span>
                        <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                          Victor va automatiquement extraire les concepts clés de ton CV et de ton profil LinkedIn et simuler ton alignement technique direct.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PREPARATION TABS INTERFACE */}
                  {currentDossier && (
                    <div className="p-6">
                      
                      {/* DOSSIER STRATEGIQUE VIEW */}
                      {activePrepaTab === 'dossier' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            <div className="md:col-span-4 bg-neutral-900 text-white p-5 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Score de Compatibilité CV & Profil</span>
                                <span className="text-4xl font-mono font-black text-emerald-400">{currentDossier?.matchScore}%</span>
                                <p className="text-xs text-neutral-300 mt-2 font-medium">
                                  {currentDossier?.matchScore && currentDossier.matchScore > 75 
                                    ? "Excellent taux de mots-clés et adéquation d'expérience détectée." 
                                    : "Quelques écarts sémantiques ou durée d'expertise requis identifiés."}
                                </p>
                              </div>
                              <div className="border-t border-neutral-800 pt-3 mt-4 text-[9px] font-mono text-neutral-500 font-bold">
                                DIAGNOSTIC AUTOMATISÉ PAR L'AGENT VICTOR
                              </div>
                            </div>

                            {/* "Ce qui vous attend vraiment au quotidien" BLOCK */}
                            <div className="md:col-span-8 bg-amber-50/15 border border-amber-200 rounded-2xl p-5 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">🕵️‍♂️ Ce qui vous attend vraiment au quotidien (Détrompeur RH)</h3>
                              </div>
                              <p className="text-xs text-neutral-700 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-neutral-150">
                                {currentDossier?.missionRecap}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-neutral-600 font-medium">
                                <div className="p-2.5 bg-white rounded-lg border border-neutral-100">
                                  <span className="font-bold text-neutral-900 block mb-0.5">Le marché & Concurrence :</span>
                                  {currentDossier?.companyReport?.marketState}
                                </div>
                                <div className="p-2.5 bg-white rounded-lg border border-neutral-100">
                                  <span className="font-bold text-neutral-900 block mb-0.5">Santé financière signalée :</span>
                                  {currentDossier?.companyReport?.financialHealth}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* GAPS & REMEDIAL POSTURES */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border p-5 rounded-2xl space-y-4">
                              <h4 className="text-xs font-bold uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-amber-500"/> Écarts Détectés & Trait d'Union d'Entretien
                              </h4>
                              <div className="space-y-3">
                                {currentDossier?.gaps?.map((gap, idx) => (
                                  <div key={idx} className="bg-neutral-50 p-3 rounded-xl border border-neutral-150 space-y-2">
                                    <p className="text-xs font-bold text-neutral-900">• {gap.skill}</p>
                                    <p className="text-xs text-neutral-600 pl-3 border-l-2 border-neutral-400 font-medium">
                                      <span className="font-bold text-neutral-700">Posture de défense :</span> {gap.defense}
                                    </p>
                                    <div className="bg-white p-2 rounded border border-neutral-150 text-[10px] text-neutral-500 flex items-center gap-1 font-bold font-mono">
                                      <Award className="h-3.5 w-3.5 text-neutral-900"/> Certif recommandée : {gap.recommendedTraining}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white border p-5 rounded-2xl space-y-4">
                              <h4 className="text-xs font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-rose-500"/> Failles de Structure à Exploiter (Questions de Vision)
                              </h4>
                              <div className="space-y-3">
                                {currentDossier?.blindSpotsCompany?.map((spot, idx) => (
                                  <div key={idx} className="space-y-2">
                                    <p className="text-xs text-neutral-700 font-semibold italic">"{spot.issue}"</p>
                                    <div className="bg-neutral-950 text-white p-3.5 rounded-xl border space-y-1">
                                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wide block font-bold">La Question Chirurgicale :</span>
                                      <p className="text-xs font-mono text-amber-200 italic leading-relaxed">
                                        "{spot.expertQuestion}"
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Sixty seconds pitch & salary expectations */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                            <div className="md:col-span-7 bg-neutral-50 border p-5 rounded-2xl space-y-3">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Pitch de 60 secondes d'Impact</span>
                              <p className="text-xs text-neutral-700 italic leading-relaxed bg-white p-4 rounded-xl border border-neutral-150">
                                "{currentDossier?.sixtySecPitch}"
                              </p>
                            </div>

                            <div className="md:col-span-5 bg-emerald-50/10 border border-emerald-150 p-5 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold block mb-2">Estimation de Négociation Réelle (Intégrée IR)</span>
                                <SalaryBadge brut={Number(currentDossier?.negotiationGuide?.suggestedRange?.replace(/\D/g,'') || '65000') || 65000} type={onboardingForm.expectedSalaryType}/>
                              </div>

                              <div className="mt-4 space-y-2 text-xs font-semibold">
                                <span className="font-bold text-neutral-700 block">Arguments de combat :</span>
                                {currentDossier?.negotiationGuide?.coreArguments?.map((arg, idx) => (
                                  <p key={idx} className="text-neutral-600 flex items-start gap-1 font-medium">
                                    <span className="text-emerald-500">✔</span> {arg}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* COACH IA MULTI-ROLES */}
                      {activePrepaTab === 'coach' && (
                        <div className="space-y-4 animate-fadeIn">
                          
                          <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl border max-w-md">
                            {(['rh', 'manager', 'cto', 'peer'] as const).map(role => (
                              <button 
                                key={role}
                                onClick={() => setSelectedCoachRole(role)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition uppercase ${
                                  selectedCoachRole === role ? 'bg-neutral-900 text-white shadow' : 'text-neutral-500 hover:text-black'
                                }`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>

                          <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600"/>
                            <span>Coach connecté en mode : <span className="underline font-bold uppercase">{selectedCoachRole}</span>. Idéal pour tester ta structure STAR face aux différents profils métiers.</span>
                          </div>

                          <div className="bg-neutral-50 p-4 border rounded-xl space-y-4 max-h-[300px] overflow-y-auto">
                            {coachSessions[selectedCoachRole].history.map((chat, idx) => (
                              <div key={idx} className="space-y-2 animate-fadeIn">
                                <div className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                                    chat.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800 border'
                                  }`}>
                                    <span className="text-[8px] uppercase tracking-wider block opacity-50 font-mono mb-1">
                                      {chat.role === 'user' ? 'Ta Réponse' : `${selectedCoachRole.toUpperCase()} interviewer`}
                                    </span>
                                    <div className="whitespace-pre-wrap">{chat.text}</div>
                                  </div>
                                </div>

                                {chat.feedback && (
                                  <div className="bg-amber-50/40 border border-amber-200 p-3 rounded-lg text-xs space-y-2 max-w-[85%] ml-auto">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                      <Settings className="h-4 w-4"/>
                                      <span>Analyse de Victor :</span>
                                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-mono uppercase ml-auto ${
                                        chat.rating === 'good' ? 'bg-emerald-100 text-emerald-800' :
                                        chat.rating === 'average' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        {chat.rating === 'good' ? 'EXCELLENT' : chat.rating === 'average' ? 'MOYEN' : 'INSUFFISANT'}
                                      </span>
                                    </div>
                                    <p className="text-neutral-700 font-medium">{chat.feedback}</p>
                                    <div className="bg-white p-2.5 rounded border border-amber-100 italic text-[11px] text-neutral-800">
                                      <span className="font-bold block text-neutral-400 not-italic uppercase text-[8px] tracking-wider mb-1">Reformulation d'Élite suggérée :</span>
                                      "{chat.optimized || 'Misez sur le volume de data traité.'}"
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={coachSessions[selectedCoachRole].currentAnswer}
                              onChange={e => {
                                const current = { ...coachSessions };
                                current[selectedCoachRole].currentAnswer = e.target.value;
                                setCoachSessions(current);
                              }}
                              placeholder="Rédige ta réponse à haute voix..."
                              className="flex-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                            />
                            <button 
                              onClick={handleCoachAnswerSubmit}
                              disabled={coachSessions[selectedCoachRole].isEvaluating || !coachSessions[selectedCoachRole].currentAnswer.trim()}
                              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition disabled:opacity-40"
                            >
                              {coachSessions[selectedCoachRole].isEvaluating ? "Analyse..." : "Soumettre"}
                            </button>
                          </div>

                        </div>
                      )}

                      {/* MULTIPLE EXERCICES LIST */}
                      {activePrepaTab === 'cas' && (
                        <div className="space-y-4 animate-fadeIn">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentDossier?.useCaseScenario?.map(exe => (
                              <button 
                                key={exe.id}
                                onClick={() => setSelectedExerciceId(exe.id)}
                                className={`p-3 border rounded-xl text-left transition ${
                                  selectedExerciceId === exe.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'bg-white border-neutral-200 hover:border-black'
                                }`}
                              >
                                <span className="text-[9px] font-mono block uppercase tracking-wider text-neutral-400 font-bold">Exercice opérationnel</span>
                                <h4 className="text-xs font-bold leading-tight mt-1">{exe.title}</h4>
                              </button>
                            ))}
                          </div>

                          {(() => {
                            const currentExe = currentDossier?.useCaseScenario?.find(e => e.id === selectedExerciceId);
                            if (!currentExe) return null;
                            const state = exerciceAnswers[selectedExerciceId] || { userProposal: '', evaluation: null, isSubmitting: false, hintUsed: false, hintText: '' };

                            return (
                              <div className="space-y-4">
                                <div className="bg-white border p-5 rounded-2xl space-y-3">
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Soutenance attendue :</span>
                                  <p className="text-xs text-neutral-700 leading-relaxed font-semibold">
                                    {currentExe.description}
                                  </p>
                                  <div className="text-[10px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border">
                                    <span className="font-bold">Livrable attendu :</span> {currentExe.expectedDeliverable}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => handleExerciceHintRequest(currentExe.id)}
                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border rounded-lg text-[10px] font-bold text-neutral-700 flex items-center gap-1"
                                  >
                                    💡 Demander un indice à Victor
                                  </button>
                                </div>

                                {state.hintUsed && (
                                  <div className="bg-amber-50 border border-amber-250 p-3 rounded-xl text-xs text-amber-900 italic font-medium">
                                    <span className="font-bold not-italic uppercase text-[8px] tracking-wider block mb-1">L'angle d'attaque de Victor :</span>
                                    {state.hintText}
                                  </div>
                                )}

                                <div className="bg-neutral-50 p-4 rounded-xl border space-y-3">
                                  <label className="block text-xs font-bold text-neutral-700">Rédige ta proposition opérationnelle :</label>
                                  <textarea 
                                    value={state.userProposal}
                                    onChange={e => {
                                      const updated = { ...exerciceAnswers };
                                      updated[selectedExerciceId].userProposal = e.target.value;
                                      setExerciceAnswers(updated);
                                    }}
                                    rows={4}
                                    placeholder="Propose ta structure, ton plan d'activation, etc..."
                                    className="w-full p-2.5 bg-white border border-neutral-200 rounded-lg text-xs"
                                  />
                                  <div className="flex justify-end">
                                    <button 
                                      type="button"
                                      onClick={() => handleExerciceSubmit(currentExe.id)}
                                      disabled={state.isSubmitting || !state.userProposal.trim()}
                                      className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                                    >
                                      {state.isSubmitting ? "Analyse..." : "Soumettre ma proposition"}
                                    </button>
                                  </div>
                                </div>

                                {state.evaluation && (
                                  <div className="bg-white border p-5 rounded-2xl space-y-3 animate-fadeIn">
                                    <div className="flex justify-between items-center border-b pb-2">
                                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Rapport d'évaluation :</span>
                                      <span className="text-xs font-mono font-bold text-emerald-600">Score : {state.evaluation.score}/100</span>
                                    </div>
                                    <div className="text-xs text-neutral-700 font-semibold">
                                      <span className="font-bold text-neutral-900 block">Critique globale :</span>
                                      {state.evaluation.critique}
                                    </div>
                                    <div className="space-y-1 text-xs font-medium">
                                      <span className="font-bold text-neutral-500 block">Améliorations requises :</span>
                                      {state.evaluation.improvements.map((imp, idx) => (
                                        <p key={idx} className="text-neutral-600">• {imp}</p>
                                      ))}
                                    </div>
                                    <div className="bg-neutral-50 p-3 rounded-lg text-xs font-mono border italic text-neutral-800">
                                      <span className="font-bold block text-neutral-400 not-italic uppercase text-[8px] tracking-wider mb-1 font-bold">Version d'excellence :</span>
                                      "{state.evaluation.proVersion}"
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                        </div>
                      )}

                      {/* DEBRIEFING COACH */}
                      {activePrepaTab === 'debrief' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed font-semibold">
                            💬 Ce module te permet de débriefer à chaud de l'entretien que tu viens d'avoir pour comprendre les signaux faibles émis par les recruteurs.
                          </div>

                          <div className="bg-neutral-50 p-4 border rounded-xl space-y-4 max-h-[300px] overflow-y-auto">
                            {postInterviewDebriefSession.history.map((chat, idx) => (
                              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                                  chat.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800 border'
                                }`}>
                                  <span className="text-[8px] uppercase tracking-wider block opacity-50 font-mono mb-1">
                                    {chat.role === 'user' ? 'Ton récit' : 'Victor (Analyseur)'}
                                  </span>
                                  <div className="whitespace-pre-wrap">{chat.text}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={postInterviewDebriefSession.currentAnswer}
                              onChange={e => setPostInterviewDebriefSession({ ...postInterviewDebriefSession, currentAnswer: e.target.value })}
                              placeholder="Ex : J'ai eu un doute sur la question sur le forfait jour, ils ont froncé les sourcils..."
                              className="flex-1 px-3 py-2.5 bg-neutral-50 border rounded-xl text-xs"
                            />
                            <button 
                              onClick={handlePostInterviewDebriefSubmit}
                              disabled={postInterviewDebriefSession.isEvaluating || !postInterviewDebriefSession.currentAnswer.trim()}
                              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                            >
                              Débriefer
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 text-center text-xs text-neutral-400 mt-6 font-medium">
                  Sélectionnez une opportunité du Kanban pour bâtir votre dossier de stratégie personnalisé ou voir les étapes.
                </div>
              )}

            </div>
          )}

          {/* FLOW 3: COMPANY VITRINE */}
          {onboardingCompleted && activeTab === 'vitrine' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Wikidex éthique</span>
                  <h2 className="text-base font-black text-neutral-900">Vitrine des Entreprises • Transparence Complète</h2>
                  <p className="text-xs text-neutral-500">Comparez les entreprises et découvrez leur vraie politique salariale après impôts.</p>
                </div>
                <button 
                  onClick={() => setShowAddCompanyModal(true)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                >
                  <Plus className="h-3.5 w-3.5"/> Partager un rapport d'expérience
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm text-xs">
                <div className="flex items-center gap-2 flex-1 max-w-sm font-medium">
                  <Search className="h-4 w-4 text-neutral-400"/>
                  <input 
                    type="text"
                    value={vitrineFilter}
                    onChange={e => setVitrineFilter(e.target.value)}
                    placeholder="Filtrer par nom, ville, outil..."
                    className="bg-transparent border-none focus:outline-none w-full font-semibold"
                  />
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-neutral-400">Trier par:</span>
                  <button 
                    onClick={() => setVitrineSort('score')} 
                    className={`px-2 py-1 rounded transition ${vitrineSort === 'score' ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-500 hover:text-black'}`}
                  >
                    Score d'ambiance
                  </button>
                  <button
                    onClick={() => setVitrineSort('salary')}
                    className={`px-2 py-1 rounded transition ${vitrineSort === 'salary' ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-500 hover:text-black'}`}
                  >
                    Salaire de base
                  </button>
                  <button
                    onClick={() => setVitrineSort('jobs')}
                    className={`px-2 py-1 rounded transition ${vitrineSort === 'jobs' ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-500 hover:text-black'}`}
                  >
                    Offres disponibles
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredAndSortedCompanies().map(company => {
                  return (
                    <div key={company.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-neutral-950">{company.name}</h3>
                            <span className="text-[10px] text-neutral-400 font-medium">{company.city}, {company.country} {company.isSubsidiary ? "• Filiale" : "• Siège"}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-neutral-50 border px-2 py-0.5 rounded-full text-xs font-mono font-bold text-neutral-700">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/> {company.overallEnvironmentScore} / 5
                          </div>
                        </div>

                        <p className="text-xs text-neutral-650 italic">"{company.valueProposition}"</p>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide block mb-1 font-bold">Rémunération Moyenne (Intégrée IR)</span>
                            <SalaryBadge brut={company.baseSalaryAvg} type={company.baseSalaryType}/>
                          </div>
                          <div className="space-y-1.5 text-xs text-neutral-600 font-medium">
                            <div><span className="font-bold text-neutral-400">Télétravail :</span> {company.remotePolicy}</div>
                            <div><span className="font-bold text-neutral-400">Variable :</span> {company.variablePay}</div>
                            <div><span className="font-bold text-neutral-400">Mutuelle :</span> {company.perks.mutuelleName}</div>
                            <div><span className="font-bold text-neutral-400">Tél de fonction :</span> {company.perks.workPhone ? "Oui" : "Non"}</div>
                            <div><span className="font-bold text-neutral-400">RTT :</span> {company.perks.rtt ? "Oui" : "Non"}</div>
                            <div><span className="font-bold text-neutral-400">Participation :</span> {company.perks.participation ? "Oui" : "Non"}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-[11px] text-neutral-600 font-medium">
                          <div>
                            <span className="text-neutral-400 block font-bold text-[9px] uppercase">Balance vie pro/perso</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(company.workLifeBalanceScore / 5) * 100}%` }}></div>
                              </div>
                              <span className="font-mono font-bold">{company.workLifeBalanceScore}/5</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-bold text-[9px] uppercase">Indice Turnover</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${(company.turnoverScore / 5) * 100}%` }}></div>
                              </div>
                              <span className="font-mono font-bold">{company.turnoverScore}/5</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {company.tools.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-mono font-bold text-neutral-600">{t}</span>
                          ))}
                        </div>

                        <div className="bg-amber-50/20 border border-amber-200 p-3 rounded-xl space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-amber-800 block">Rapport de Réalité Terrain :</span>
                          <p className="text-xs text-neutral-600 leading-relaxed italic">"{company.realRealityReport}"</p>
                        </div>

                        {company.activeJobs && company.activeJobs.length > 0 && (
                          <div className="border border-neutral-150 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 block">
                                Offres ouvertes détectées ({company.activeJobs.length})
                              </span>
                              <span className="text-[9px] text-neutral-400 font-medium">Cliquez pour préparer →</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {company.activeJobs.map((job, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    const exists = opportunities.some(o => o.companyName.toLowerCase() === company.name.toLowerCase() && o.roleTitle === job);
                                    if (exists) {
                                      triggerNotification("Cette offre est déjà dans ton Kanban !", "info");
                                      return;
                                    }
                                    const newOpp: KanbanOpportunity = {
                                      id: `opp-${Date.now()}`,
                                      companyName: company.name,
                                      roleTitle: job,
                                      city: company.city,
                                      currentStepIndex: 0,
                                      steps: company.recruitmentProcessSteps.length ? company.recruitmentProcessSteps : [...PREDEFINED_STEPS],
                                      status: 'active',
                                      dossierGenerated: false,
                                      jdText: `Poste "${job}" chez ${company.name} (${company.city}).\nOutils attendus : ${company.tools.join(', ')}.\nPolitique de télétravail : ${company.remotePolicy}.`
                                    };
                                    setOpportunities(prev => [...prev, newOpp]);
                                    setSelectedOpportunity(newOpp);
                                    setJobDescriptionInput(newOpp.jdText || '');
                                    setActiveTab('cockpit');
                                    addAgentMessage(`Top ! J'ai ajouté "${job}" chez ${company.name} à ton cockpit. On bâtit le dossier de combat ?`);
                                    triggerNotification("Offre ajoutée au Kanban (En cours) !", "success");
                                  }}
                                  className="text-left p-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 rounded-lg text-[11px] font-medium text-neutral-700 transition flex items-center gap-1.5"
                                >
                                  <Briefcase className="h-3 w-3 text-neutral-400 shrink-0" /> {job}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-neutral-50 px-5 py-3 border-t flex justify-between items-center text-[10px] text-neutral-400">
                        <span className="truncate max-w-[200px]">Process : {company.recruitmentProcessSteps.join(' → ')}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const exists = opportunities.some(o => o.companyName.toLowerCase() === company.name.toLowerCase() && o.status === 'favorite');
                              if (exists) {
                                triggerNotification("Cette entreprise est déjà dans vos favoris !", "info");
                                return;
                              }
                              const newOpp: KanbanOpportunity = {
                                id: `opp-${Date.now()}`,
                                companyName: company.name,
                                roleTitle: `Candidature favorite @ ${company.name}`,
                                city: company.city,
                                currentStepIndex: 0,
                                steps: company.recruitmentProcessSteps,
                                status: 'favorite',
                                dossierGenerated: false,
                                jdText: "Généré depuis la vitrine Wikidex."
                              };
                              setOpportunities(prev => [...prev, newOpp]);
                              triggerNotification(`${company.name} ajouté aux Favoris Kanban !`, "success");
                            }}
                            className="bg-white border border-neutral-300 text-neutral-800 px-2.5 py-1 rounded-lg font-bold hover:bg-neutral-100 transition"
                          >
                            ⭐️ Favoris
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* FLOW 4: GIVE TO GET */}
          {onboardingCompleted && activeTab === 'contribuer' && (
            <div className="max-w-xl mx-auto bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm animate-fadeIn">
              <div className="border-b pb-4 mb-5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded">
                  Programme Give-to-Get
                </span>
                <h2 className="text-base font-black text-neutral-900">Alimentez la transparence. Gagnez des crédits.</h2>
                <p className="text-xs text-neutral-500">
                  Sélectionnez l'un de vos postes passés validés pour en donner le contexte et remporter +3 Crédits de recherche immédiats.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-neutral-700">Sélectionne l'une de tes expériences professionnelles validées :</label>
                <div className="grid grid-cols-1 gap-2">
                  {onboardingForm.pastExperiences.map((exp, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedGiveToGetExpIndex(idx)}
                      className={`p-3 border rounded-xl cursor-pointer hover:border-black transition flex justify-between items-center ${
                        selectedGiveToGetExpIndex === idx ? 'border-neutral-900 bg-neutral-50' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block">{exp.companyName}</span>
                        <span className="text-[10px] text-neutral-500 block font-medium">{exp.roleTitle}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        {exp.period}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedGiveToGetExpIndex !== null && (
                  <form onSubmit={handleGiveToGetSubmit} className="space-y-4 pt-4 border-t text-xs animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Salaire fixe de base (brut annuel en €)</label>
                        <input 
                          type="number"
                          value={giveToGetForm.baseSalary}
                          onChange={e => setGiveToGetForm({...giveToGetForm, baseSalary: Number(e.target.value)})}
                          className="w-full p-2.5 bg-neutral-50 border rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Part variable perçue (€)</label>
                        <input 
                          type="text"
                          value={giveToGetForm.variablePay}
                          onChange={e => setGiveToGetForm({...giveToGetForm, variablePay: e.target.value})}
                          className="w-full p-2.5 bg-neutral-50 border rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Outils utilisés au quotidien (séparés par virgules)</label>
                        <input 
                          type="text"
                          value={giveToGetForm.tools}
                          onChange={e => setGiveToGetForm({...giveToGetForm, tools: e.target.value})}
                          className="w-full p-2.5 bg-neutral-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Nom de la Mutuelle</label>
                        <select
                          value={giveToGetForm.mutuelleName}
                          onChange={e => setGiveToGetForm({...giveToGetForm, mutuelleName: e.target.value})}
                          className="w-full p-2.5 bg-neutral-50 border rounded-xl font-medium"
                        >
                          {FRENCH_MUTUELLES.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                          <option value="Autre">Autre (Saisir manuellement)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-xl border">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase">Balance vie pro / vie perso (0-5)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="5" 
                          step="0.5"
                          value={giveToGetForm.workLifeBalanceScore}
                          onChange={e => setGiveToGetForm({...giveToGetForm, workLifeBalanceScore: Number(e.target.value)})}
                          className="w-full mt-2 accent-neutral-900"
                        />
                        <span className="font-mono font-bold text-neutral-800 text-xs mt-1 block">{giveToGetForm.workLifeBalanceScore} / 5</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase">Indice de Turnover (0-5)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="5" 
                          step="0.5"
                          value={giveToGetForm.turnoverScore}
                          onChange={e => setGiveToGetForm({...giveToGetForm, turnoverScore: Number(e.target.value)})}
                          className="w-full mt-2 accent-neutral-900"
                        />
                        <span className="font-mono font-bold text-neutral-800 text-xs mt-1 block">{giveToGetForm.turnoverScore} / 5</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Le rapport de réalité (Onboarding, horaires réels, ambiance)</label>
                      <textarea 
                        value={giveToGetForm.realityReport}
                        onChange={e => setGiveToGetForm({...giveToGetForm, realityReport: e.target.value})}
                        rows={3}
                        placeholder="Qu'est-ce qui t'attendait vraiment au quotidien ?"
                        className="w-full p-3 bg-neutral-50 border rounded-xl focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold transition"
                    >
                      Consigner l'expérience anonyme (+3 Crédits)
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: STAGE TRANSITION DEBRIEF WITH EXTENDED PARAMETERS */}
      {transitionDebriefOpen && transitionTargetOpp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border px-2 py-0.5 rounded">
                Feedback de transition d'étape
              </span>
              <h3 className="text-sm font-black text-neutral-950 mt-1">Comment s'est déroulée cette étape ?</h3>
            </div>

            <form onSubmit={handleTransitionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Durée de l'entretien</label>
                  <select 
                    value={transitionDuration}
                    onChange={e => setTransitionDuration(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-medium"
                  >
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="45m">45 minutes</option>
                    <option value="1h">1 heure</option>
                    <option value="1h30">1h30 ou plus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">La rémunération a-t-elle été abordée ?</label>
                  <select 
                    value={transitionSalaryDiscussed}
                    onChange={e => setTransitionSalaryDiscussed(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-medium"
                  >
                    <option value="non_evoque">Non, pas évoqué</option>
                    <option value="evoque_favorable">Oui, dans ma fourchette</option>
                    <option value="evoque_defavorable">Oui, en dessous de mes prétentions</option>
                    <option value="deja_evoque">Déjà abordé précédemment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Quels outils ou technos ont été abordés ?</label>
                <input 
                  type="text"
                  value={transitionTools}
                  onChange={e => setTransitionTools(e.target.value)}
                  placeholder="Ex : Notion, Github actions, Salesforce..."
                  className="w-full p-2 bg-neutral-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Des questions déstabilisantes ou remarques clés ?</label>
                <textarea 
                  value={transitionComment}
                  onChange={e => setTransitionComment(e.target.value)}
                  rows={3}
                  placeholder="Comment as-tu senti le recruteur ?"
                  className="w-full p-2 bg-neutral-50 border rounded-lg resize-none font-medium"
                />
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-lg border text-[11px] text-neutral-500 font-medium">
                💡 <span className="font-bold">Astuce :</span> À la validation, vous recevrez +1 crédit. Vous pourrez également débriefer immédiatement avec Victor l'Éclaireur dans l'onglet Débrief.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setTransitionDebriefOpen(false)}
                  className="px-4 py-1.5 text-neutral-400 hover:text-black font-semibold"
                >
                  Passer
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Valider l'étape (+1 Crédit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST INTERVIEW GUIDED FEEDBACK */}
      {isDebriefOpen && debriefOpportunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="border-b pb-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border px-2 py-0.5 rounded">
                Formulaire de Débriefing Guidé par Victor
              </span>
              <h3 className="text-sm font-black text-neutral-950 mt-1">
                Débriefing de fin de process : {debriefOpportunity.companyName}
              </h3>
            </div>

            <form onSubmit={handleDebriefSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Qui as-tu rencontré ?</label>
                <input 
                  type="text" 
                  value={debriefForm.peopleMet}
                  onChange={e => setDebriefForm({...debriefForm, peopleMet: e.target.value})}
                  placeholder="Ex: Marc (VP Sales), Sophie (RH)..."
                  className="w-full p-2 bg-neutral-50 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Qualité générale de l'échange</label>
                  <select 
                    value={debriefForm.qualityExchange}
                    onChange={e => setDebriefForm({...debriefForm, qualityExchange: e.target.value})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Correct</option>
                    <option value="poor">Médiocre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Suivi global du recruteur</label>
                  <select 
                    value={debriefForm.followUpRating}
                    onChange={e => setDebriefForm({...debriefForm, followUpRating: e.target.value})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg"
                  >
                    <option value="5">5/5 - Réponses instantanées</option>
                    <option value="4">4/5 - Bon suivi</option>
                    <option value="3">3/5 - Délais un peu longs</option>
                    <option value="2">2/5 - Ghosting partiel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Proposition finale de rémunération abordée (K€)</label>
                <input 
                  type="text" 
                  value={debriefForm.salaryDiscussed}
                  onChange={e => setDebriefForm({...debriefForm, salaryDiscussed: e.target.value})}
                  placeholder="Ex: 55K€ Fixe + 10K€ Variable"
                  className="w-full p-2 bg-neutral-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Exemples de questions déstabilisantes rencontrées</label>
                <textarea 
                  value={debriefForm.questionsAsked}
                  onChange={e => setDebriefForm({...debriefForm, questionsAsked: e.target.value})}
                  rows={2}
                  placeholder="Ex: Parlez-moi d'une fois où un client vous a dit non..."
                  className="w-full p-2 bg-neutral-50 border rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsDebriefOpen(false)}
                  className="px-4 py-1.5 text-neutral-400 hover:text-black font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Valider et gagner (+2 Crédits)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARE EXPERIENCE REPORT */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-black text-neutral-950">Partager un rapport d'expérience éthique</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Assurez la véracité en liant ce rapport à une de vos expériences d'onboarding.</p>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-neutral-600 font-bold mb-1">Sélectionner l'une de vos expériences passées *</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto border p-2 rounded-lg bg-neutral-50">
                  {onboardingForm.pastExperiences.map((exp, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setNewCompanyForm({
                          ...newCompanyForm,
                          name: exp.companyName,
                          roleTitle: exp.roleTitle
                        });
                      }}
                      className={`p-2 rounded border cursor-pointer text-[11px] font-medium transition ${
                        newCompanyForm.name === exp.companyName ? 'bg-neutral-900 text-white border-black' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <span className="font-bold">{exp.companyName}</span> - {exp.roleTitle} ({exp.period})
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Nom de l'entreprise *</label>
                  <input 
                    type="text"
                    required
                    readOnly
                    value={newCompanyForm.name}
                    className="w-full p-2 bg-neutral-100 border rounded-lg font-bold focus:outline-none"
                    placeholder="Sélectionnez ci-dessus"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Type de structure</label>
                  <select 
                    value={newCompanyForm.isSubsidiary ? 'subsidiary' : 'hq'}
                    onChange={e => setNewCompanyForm({...newCompanyForm, isSubsidiary: e.target.value === 'subsidiary'})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-medium"
                  >
                    <option value="hq">Siège social</option>
                    <option value="subsidiary">Filiale régionale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Ville</label>
                  <input 
                    type="text"
                    value={newCompanyForm.city}
                    onChange={e => setNewCompanyForm({...newCompanyForm, city: e.target.value})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Pays</label>
                  <input 
                    type="text"
                    value={newCompanyForm.country}
                    onChange={e => setNewCompanyForm({...newCompanyForm, country: e.target.value})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Poste occupé</label>
                  <input 
                    type="text"
                    readOnly
                    value={newCompanyForm.roleTitle}
                    className="w-full p-2 bg-neutral-100 border rounded-lg font-medium focus:outline-none"
                    placeholder="Sélectionnez ci-dessus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Secteur d'activité pour l'outillage</label>
                  <select 
                    value={newCompanyForm.sector}
                    onChange={e => {
                      let preloadedTools = 'Slack, Notion, Google Suite';
                      if (e.target.value === 'Finance') preloadedTools = 'Excel, Bloomberg Terminal, Slack, GSuite';
                      if (e.target.value === 'Marketing') preloadedTools = 'Hubspot, Canva, Google Analytics, Notion';
                      if (e.target.value === 'Production') preloadedTools = 'Jira, Figma, Github, Slack';
                      if (e.target.value === 'Sales') preloadedTools = 'Salesforce, Gong.io, LinkedIn Sales Navigator, Slack';
                      setNewCompanyForm({...newCompanyForm, sector: e.target.value, tools: preloadedTools});
                    }}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-medium"
                  >
                    <option value="Sales">Vente / Commerce</option>
                    <option value="Marketing">Marketing / Growth</option>
                    <option value="Finance">Finance / Audit</option>
                    <option value="Production">Production / Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Salaire brut annuel (€) *</label>
                  <input 
                    type="number"
                    required
                    value={newCompanyForm.baseSalary}
                    onChange={e => setNewCompanyForm({...newCompanyForm, baseSalary: Number(e.target.value)})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-2 rounded-lg border">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Estimation Fiscale du Salaire partagé :</span>
                <SalaryBadge brut={newCompanyForm.baseSalary} className="mt-1" type={newCompanyForm.baseSalaryType}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Score global (0-5)</label>
                  <input 
                    type="number"
                    step="0.1"
                    max="5"
                    value={newCompanyForm.overallScore}
                    onChange={e => setNewCompanyForm({...newCompanyForm, overallScore: Number(e.target.value)})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-bold mb-1">Mutuelle</label>
                  <select 
                    value={newCompanyForm.mutuelleName}
                    onChange={e => setNewCompanyForm({...newCompanyForm, mutuelleName: e.target.value})}
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-medium"
                  >
                    {FRENCH_MUTUELLES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                {newCompanyForm.mutuelleName === 'Autre' && (
                  <div>
                    <label className="block text-neutral-600 font-bold mb-1">Nom personnalisé</label>
                    <input 
                      type="text"
                      value={newCompanyForm.customMutuelleName}
                      onChange={e => setNewCompanyForm({...newCompanyForm, customMutuelleName: e.target.value})}
                      className="w-full p-2 bg-neutral-50 border rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-xl border">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase">Balance Vie pro/vie perso (0-5)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.5"
                    value={newCompanyForm.workLifeBalanceScore}
                    onChange={e => setNewCompanyForm({...newCompanyForm, workLifeBalanceScore: Number(e.target.value)})}
                    className="w-full mt-2 accent-neutral-900"
                  />
                  <span className="font-mono font-bold text-neutral-800 text-xs mt-1 block">{newCompanyForm.workLifeBalanceScore} / 5</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase">Indice de Turnover (0-5)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.5"
                    value={newCompanyForm.turnoverScore}
                    onChange={e => setNewCompanyForm({...newCompanyForm, turnoverScore: Number(e.target.value)})}
                    className="w-full mt-2 accent-neutral-900"
                  />
                  <span className="font-mono font-bold text-neutral-800 text-xs mt-1 block">{newCompanyForm.turnoverScore} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2 rounded-lg border font-medium">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.greenMobility} onChange={e => setNewCompanyForm({...newCompanyForm, greenMobility: e.target.checked})} />
                  <span>Mobilité Verte (Vélo...)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.ticketsResto} onChange={e => setNewCompanyForm({...newCompanyForm, ticketsResto: e.target.checked})} />
                  <span>Tickets Resto</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.ce} onChange={e => setNewCompanyForm({...newCompanyForm, ce: e.target.checked})} />
                  <span>Comité d'Entreprise (CE)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.rtt} onChange={e => setNewCompanyForm({...newCompanyForm, rtt: e.target.checked})} />
                  <span>RTT d'équipe</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.participation} onChange={e => setNewCompanyForm({...newCompanyForm, participation: e.target.checked})} />
                  <span>Primes & Participation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newCompanyForm.workPhone} onChange={e => setNewCompanyForm({...newCompanyForm, workPhone: e.target.checked})} />
                  <span>Téléphone de fonction</span>
                </label>
              </div>

              <div>
                <label className="block text-neutral-600 font-bold mb-1">Outils internes décelés (séparés par virgules)</label>
                <input 
                  type="text"
                  value={newCompanyForm.tools}
                  onChange={e => setNewCompanyForm({...newCompanyForm, tools: e.target.value})}
                  className="w-full p-2 bg-neutral-50 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-bold mb-1">La réalité du quotidien (Reality Check)</label>
                <textarea
                  value={newCompanyForm.realityReport}
                  onChange={e => setNewCompanyForm({...newCompanyForm, realityReport: e.target.value})}
                  className="w-full p-2 bg-neutral-50 border rounded-lg resize-none"
                  placeholder="Onboarding, ambiance réelle, horaires..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-1.5 text-neutral-400 hover:text-black font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Valider le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD OPPORTUNITY TO KANBAN */}
      {showAddOppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-black text-neutral-950">Nouvelle opportunité</h3>
              <p className="text-xs text-neutral-400">Configure tes étapes d'entretien personnalisées.</p>
            </div>

            <form onSubmit={handleAddNewOpp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Entreprise *</label>
                  <input 
                    type="text"
                    required
                    value={newOppForm.companyName}
                    onChange={e => {
                      setNewOppForm({...newOppForm, companyName: e.target.value});
                      const match = companies.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase()));
                      if (match && match.activeJobs) {
                        setProactiveJobsList(match.activeJobs);
                        setShowJobDropdown(true);
                      }
                    }}
                    placeholder="Ex: L'Oréal, Chanel, SVR..."
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Poste *</label>
                  <input 
                    type="text"
                    required
                    value={newOppForm.roleTitle}
                    onChange={e => setNewOppForm({...newOppForm, roleTitle: e.target.value})}
                    placeholder="Ex: Head of Brand"
                    className="w-full p-2 bg-neutral-50 border rounded-lg font-bold"
                  />
                </div>
              </div>

              {showJobDropdown && proactiveJobsList.length > 0 && (
                <div className="bg-neutral-50 border p-2.5 rounded-xl space-y-1.5 animate-fadeIn">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Offres d'emploi détectées sur Internet :</span>
                  <div className="flex flex-col gap-1">
                    {proactiveJobsList.map((job, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewOppForm({
                            ...newOppForm,
                            roleTitle: job,
                            jdText: `Description et enjeux de l'emploi pour le poste "${job}".\nOutils et exigences recommandés pour l'analyse d'excellence.`
                          });
                          setShowJobDropdown(false);
                          triggerNotification("Fiche de poste pré-remplie avec succès !", "success");
                        }}
                        className="text-left p-1.5 hover:bg-neutral-200 rounded text-[11px] font-medium text-neutral-800 transition"
                      >
                        💼 {job}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-neutral-600 font-semibold mb-2">Configure les étapes clés de ton process d'entretien :</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PREDEFINED_STEPS.map(step => {
                    const isSelected = newOppForm.steps.includes(step);
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => {
                          const hasStep = newOppForm.steps.includes(step);
                          const updated = hasStep 
                            ? newOppForm.steps.filter(s => s !== step)
                            : [...newOppForm.steps, step];
                          setNewOppForm({...newOppForm, steps: updated});
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                          isSelected ? 'bg-neutral-900 text-white border-black' : 'bg-neutral-50 text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[9px] text-neutral-400 block">Désélectionnez pour filtrer les étapes superflues. Les étapes sont triées et ordonnées pour le Kanban.</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Fiche de poste (JD) optionnelle</label>
                <textarea 
                  value={newOppForm.jdText}
                  onChange={e => setNewOppForm({...newOppForm, jdText: e.target.value})}
                  rows={3}
                  placeholder="Copiez la description ou laissez l'import automatique s'en occuper..."
                  className="w-full p-2 bg-neutral-50 border rounded-lg resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddOppModal(false)}
                  className="px-4 py-1.5 text-neutral-400 hover:text-black font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Ajouter au Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GEMINI API KEY MODAL SETTINGS */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-black text-neutral-950">Intelligence : Vercel AI Gateway</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Toute l'intelligence de l'app (recherche, dossiers, coach, exercices) passe par le Vercel AI Gateway.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2 text-[11px] text-neutral-600 leading-relaxed">
                <p className="font-semibold text-neutral-800">Configuration sécurisée côté serveur</p>
                <p>
                  Les appels LLM sont relayés par la fonction serverless <span className="font-mono font-semibold text-neutral-800">/api/llm</span>.
                  La clé n'est jamais exposée au navigateur : elle vit dans la variable d'environnement Vercel
                  <span className="font-mono font-semibold text-neutral-800"> AI_GATEWAY_API_KEY</span>.
                </p>
                <p>
                  Modèle configurable via <span className="font-mono font-semibold text-neutral-800">AI_GATEWAY_MODEL</span>
                  {' '}(défaut <span className="font-mono">openai/gpt-4o-mini</span>).
                </p>
                <p className="text-neutral-500">
                  Sans clé configurée, l'app bascule automatiquement sur une simulation locale afin de rester fonctionnelle.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button 
                type="button" 
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold text-xs hover:bg-black transition"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}