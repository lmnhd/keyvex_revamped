/**
 * Keyvex Revamped Styling Standards
 * Extracted from legacy Tailwind Styling Agent prompts
 * CRITICAL: Prevents white-on-white visibility issues
 */

export const CRITICAL_STYLING_PROHIBITIONS = {
  // NEVER USE INVISIBLE INPUT TEXT - #1 USER COMPLAINT
  inputTextVisibility: {
    darkTheme: 'text-gray-100 or text-white',
    lightTheme: 'text-gray-900',
    forbidden: 'Inputs without explicit text color',
    examples: {
      dark: 'className: "w-full h-10 px-4 text-gray-100 bg-slate-700 border-2..."',
      light: 'className: "w-full h-10 px-4 text-gray-900 bg-white border-2..."'
    }
  },
  
  // NEVER USE POOR CONTRAST COMBINATIONS
  contrastRules: {
    forbidden: [
      'White/light text on light backgrounds',
      'Dark text on dark backgrounds',
      'text-white on light Card backgrounds'
    ],
    required: 'Always specify explicit text colors for sufficient contrast'
  },
  
  // NEVER CREATE INVALID CARD STRUCTURES
  cardStructure: {
    forbidden: 'Input/results cards as siblings of main-tool-card',
    required: 'ALL content sections INSIDE main-tool-card wrapper'
  },
  
  // NEVER USE FULL-WIDTH BUTTON STRETCHING
  buttonSizing: {
    forbidden: ['w-full on buttons', 'Buttons that stretch across entire container width'],
    required: ['Compact button sizing (px-6 py-2)', 'Button groups with proper spacing (flex gap-2)']
  }
} as const;

export const FUTURISTIC_DEVICE_STYLING = {
  // SCIENTIFIC INSTRUMENT INSPIRATION
  principles: {
    darkGradients: 'Rich dark gradients mimicking premium device housings',
    metallicBorders: 'Metallic borders and accents for professional appearance',
    compactLayouts: 'Compact, purposeful layouts with maximum information density',
    tactileButtons: 'Tactile-looking buttons and controls',
    glassSurfaces: 'Glass-like surfaces with subtle transparency effects',
    professionalColors: 'Professional color schemes that convey precision and quality'
  },
  
  // DARK THEME HIERARCHY
  hierarchy: {
    toolContainer: 'Deep dark gradients (slate-800 to slate-900)',
    controlPanels: 'Medium dark surfaces (slate-700 to slate-800)',
    inputAreas: 'Lighter dark backgrounds (slate-600 to slate-700)',
    resultsAreas: 'Accent dark colors with subtle glows',
    interactiveElements: 'Hover effects with metallic highlights'
  },
  
  // PREMIUM MATERIAL EFFECTS
  effects: {
    shadows: 'shadow-2xl for deep, realistic shadows',
    borders: 'border-2 with metallic colors (slate-400, zinc-400)',
    gradients: 'subtle gradients for depth and dimension',
    hover: 'hover:scale-105 for tactile feedback',
    blur: 'backdrop-blur effects for glass-like surfaces'
  }
} as const;

export const COMPONENT_SIZING = {
  // PRECISE COMPONENT DIMENSIONS
  numberInputs: {
    currency: 'max-w-32 (8-character width for amounts like $50,000)',
    percentage: 'max-w-20 (5-character width for values like 15.5%)',
    age: 'max-w-16 (3-character width for values like 25)',
    quantity: 'max-w-24 (6-character width for values like 1,500)',
    forbidden: 'w-full for number inputs - it wastes space!'
  },
  
  // BUTTON SIZING REVOLUTION
  buttons: {
    primary: 'px-6 py-2 (compact, professional)',
    secondary: 'px-4 py-1.5 (smaller, supporting)',
    icon: 'p-2 (square, minimal)',
    forbidden: 'w-full buttons (makes tools look like forms)',
    required: 'Natural button width based on content'
  },
  
  // CARD SECTION SPACING
  spacing: {
    inputGroups: 'p-4 (compact, efficient)',
    resultsSections: 'p-3 (tight, information-dense)',
    headerSections: 'p-3 (minimal, focused)',
    sectionGaps: 'gap-3 or gap-4 (purposeful spacing)'
  }
} as const;

export const INPUT_VISIBILITY_STANDARDS = {
  // CRITICAL: INPUT TEXT MUST BE VISIBLE
  requirements: {
    mandatory: 'ALL Input components MUST include explicit text color',
    lightTheme: 'text-gray-900 on light/white backgrounds',
    darkTheme: 'text-gray-100 or text-white on dark backgrounds',
    forbidden: 'Missing text color specification'
  },
  
  // STANDARD INPUT PATTERNS
  patterns: {
    light: 'w-full h-10 px-4 text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200',
    dark: 'bg-slate-700/50 border-2 border-slate-400 text-gray-100 placeholder-slate-400 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-inner'
  }
} as const;

export const CHART_REQUIREMENTS = {
  // NEVER CREATE TINY UNUSABLE CHARTS
  sizing: {
    minimum: '400x400px for readability',
    forbidden: 'Charts smaller than 300x300px (users can\'t read them)',
    preferred: '500x500px for optimal readability',
    required: 'Professional results displays with large charts and supporting data'
  },
  
  // CHART SIZE REQUIREMENTS
  dimensions: {
    RadialBarChart: 'width={500} height={500} (MINIMUM 400x400)',
    PieChart: 'width={500} height={500} (MINIMUM 400x400)',
    BarChart: 'width={600} height={400} (MINIMUM 500x350)',
    LineChart: 'width={600} height={400} (MINIMUM 500x350)'
  }
} as const;

export const ACCESSIBILITY_STANDARDS = {
  // CONTRAST SAFETY RULES
  contrastRules: {
    lightBackgrounds: 'Use dark text (text-gray-900, text-slate-900)',
    mediumBackgrounds: 'Use dark text or ensure sufficient contrast',
    darkBackgrounds: 'Use light text (text-white, text-gray-100)',
    gradientBackgrounds: 'Match text color to the dominant background tone'
  },
  
  // GRADIENT BACKGROUND TEXT RULES
  gradientRules: {
    'from-blue-50 to-blue-100': 'Use text-blue-900 or text-slate-900 (DARK TEXT)',
    'from-indigo-600 to-indigo-700': 'Use text-white or text-indigo-100 (LIGHT TEXT)',
    'from-slate-50 to-slate-100': 'Use text-gray-900 or text-slate-900 (DARK TEXT)',
    'from-gray-600 to-gray-800': 'Use text-white or text-gray-100 (LIGHT TEXT)'
  }
} as const;

export const PROFESSIONAL_PATTERNS = {
  // TWO-COLUMN EFFICIENT LAYOUTS
  layouts: {
    toolMain: 'bg-white rounded-xl shadow-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8',
    inputSection: 'space-y-6',
    rightColumn: 'space-y-8',
    buttonsGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-4'
  },
  
  // RESULTS DISPLAY SYSTEM
  results: {
    container: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    chartCard: 'bg-slate-800 p-6 rounded-lg shadow-xl',
    chartTitle: 'text-xl font-semibold text-slate-200 mb-6',
    chartSize: 'mx-auto style={{width: "500px", height: "500px"}}',
    metricsCard: 'bg-slate-800 p-6 rounded-lg shadow-xl',
    metricValue: 'text-2xl font-bold text-emerald-400',
    metricLabel: 'text-slate-300'
  }
} as const;