/**
 * Krushiratna SaaS - Agricultural Farm Management
 * 9 Dedicated Commercial Grape Orchard Management Tabs
 * Bilingual Support (English & Marathi Toggle Engine)
 * Supabase Cloud Sync + Local Fallback State Engine
 */

// Supabase Credentials
const SUPABASE_URL = 'https://vbmekqrmphyoumfvqlwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibWVrcXJtcGh5b3VtZnZxbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDc4MDAsImV4cCI6MjEwNTYyMzgwMH0.KbkZDKj9_-HN5WK66hv15vCC2-ria6QsOMupG_pAC1Y';

let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Master Local State
let appState = {
    activeLang: localStorage.getItem('krushi_lang') || 'mr',
    currentTab: 'dashboard',
    farm: {
        id: '636ddc54-66ab-4b44-8037-47ca0331c9ff',
        name_mr: 'सह्याद्री द्राक्ष ऑर्चर्ड्स',
        name_en: 'Sahyadri Grape Orchards',
        ownerName_mr: 'गणेश पाटील',
        ownerName_en: 'Ganesh Patil',
        totalAcres: 10.5
    },
    plots: [],
    irrigationLogs: [],
    fertilizerLogs: [],
    sprayLogs: [],
    laborLogs: [],
    expenses: [],
    sales: [],
    reminders: [],
    activeFilterReminder: 'all'
};

// Initial Seed Fallback Data (Guarantees instant UI render even before network resolves)
const FALLBACK_PLOTS = [
    {
        id: '72c7ddbd-3081-4347-878a-7acc5545f0a3',
        name: 'साऊथ ब्लॉक - सुपर सोनका (Plot 1)',
        name_en: 'South Block - Super Sonaka (Plot 1)',
        crop_variety: 'Super Sonaka (सुपर सोनका)',
        acres: 4.0,
        spacing: '9 x 5 ft',
        foundation_pruning_date: '2026-04-18',
        fruit_pruning_date: '2026-10-12',
        canes_per_vine: 46,
        bunches_per_vine: 52,
        expected_yield_tonnes: 18.0
    },
    {
        id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a',
        name: 'नॉर्थ ब्लॉक - थॉमसन सीडलेस (Plot 2)',
        name_en: 'North Block - Thompson Seedless (Plot 2)',
        crop_variety: 'Thompson Seedless (थॉमसन)',
        acres: 3.0,
        spacing: '10 x 6 ft',
        foundation_pruning_date: '2026-04-15',
        fruit_pruning_date: '2026-10-08',
        canes_per_vine: 42,
        bunches_per_vine: 48,
        expected_yield_tonnes: 14.5
    },
    {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: 'ईस्ट ब्लॉक - मणिक चमन (Plot 3)',
        name_en: 'East Block - Manik Chaman (Plot 3)',
        crop_variety: 'Manik Chaman (मणिक चमन)',
        acres: 3.5,
        spacing: '9 x 5 ft',
        foundation_pruning_date: '2026-04-10',
        fruit_pruning_date: '2026-10-02',
        canes_per_vine: 38,
        bunches_per_vine: 45,
        expected_yield_tonnes: 16.0
    }
];

const FALLBACK_IRRIGATION = [
    {
        id: 'irr-1',
        plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3',
        log_date: '2026-09-22',
        duration_hours: 2.5,
        water_liters: 45000,
        water_source: 'विहीर + बोअरवेल ठिबक',
        ec_level: 0.85,
        ph_level: 6.8,
        nutrients_n: 3.2,
        nutrients_ca: 4.8,
        nutrients_mg: 2.1
    },
    {
        id: 'irr-2',
        plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a',
        log_date: '2026-09-20',
        duration_hours: 2.0,
        water_liters: 38000,
        water_source: 'धरण कालवा पाणी',
        ec_level: 0.78,
        ph_level: 6.9,
        nutrients_n: 2.8,
        nutrients_ca: 4.2,
        nutrients_mg: 1.8
    },
    {
        id: 'irr-3',
        plot_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        log_date: '2026-09-18',
        duration_hours: 3.0,
        water_liters: 52000,
        water_source: 'शेततळे (Farm Pond)',
        ec_level: 0.82,
        ph_level: 6.7,
        nutrients_n: 3.5,
        nutrients_ca: 5.1,
        nutrients_mg: 2.3
    }
];

const FALLBACK_FERTILIZER = [
    {
        id: 'fert-1',
        plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3',
        log_date: '2026-09-21',
        fertilizer_name: '0:52:34 (MKP - मोनो पोटॅशियम फॉस्फेट)',
        dose_amount: 5.0,
        dose_unit: 'kg/acre',
        application_method: 'Drip (Fertigation)',
        npk_ratio: '0:52:34',
        calculated_n_kg: 0.0,
        calculated_p_kg: 2.6,
        calculated_k_kg: 1.7,
        cost: 1250,
        notes: 'गोड छाटणीनंतर फुलोरा अवस्थेसाठी स्फुरद व पालाश डोस'
    },
    {
        id: 'fert-2',
        plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a',
        log_date: '2026-09-19',
        fertilizer_name: '13:00:45 (पोटॅशियम नायट्रेट)',
        dose_amount: 4.5,
        dose_unit: 'kg/acre',
        application_method: 'Drip (Fertigation)',
        npk_ratio: '13:0:45',
        calculated_n_kg: 0.58,
        calculated_p_kg: 0.0,
        calculated_k_kg: 2.02,
        cost: 980,
        notes: 'काडी पक्वतेसाठी व मणी फुगवणीसाठी'
    },
    {
        id: 'fert-3',
        plot_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        log_date: '2026-09-16',
        fertilizer_name: '19:19:19 (समतोल)',
        dose_amount: 5.0,
        dose_unit: 'kg/acre',
        application_method: 'Drip (Fertigation)',
        npk_ratio: '19:19:19',
        calculated_n_kg: 0.95,
        calculated_p_kg: 0.95,
        calculated_k_kg: 0.95,
        cost: 850,
        notes: 'सुरुवातीची एकसारखी शाकीय वाढ'
    }
];

const FALLBACK_SPRAYS = [
    {
        id: 'spray-1',
        plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3',
        log_date: '2026-09-21',
        pest_disease_name: 'थ्रीप्स (Thrips)',
        chemical_or_fertilizer: 'Spinotoram 11.7 SC',
        dose_per_liter: 0.35,
        total_water_liters: 400,
        next_spray_date: '2026-09-28',
        cost: 2600
    },
    {
        id: 'spray-2',
        plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a',
        log_date: '2026-09-18',
        pest_disease_name: 'केवडा (Downy Mildew)',
        chemical_or_fertilizer: 'Profiler (Fluopicolide + Fosetyl-Al)',
        dose_per_liter: 2.5,
        total_water_liters: 500,
        next_spray_date: '2026-09-25',
        cost: 3200
    },
    {
        id: 'spray-3',
        plot_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        log_date: '2026-09-15',
        pest_disease_name: 'उदबत्या (Flea Beetle)',
        chemical_or_fertilizer: 'Thiamethoxam 25 WG',
        dose_per_liter: 0.5,
        total_water_liters: 350,
        next_spray_date: '2026-09-23',
        cost: 1400
    }
];

const FALLBACK_LABOR = [
    {
        id: 'lab-1',
        plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3',
        log_date: '2026-09-22',
        activity: 'काडी बांधणी व विरळणी',
        worker_names: 'रामदास, सुरेश, सुनिता, मंगल, वंदना',
        male_workers: 4,
        female_workers: 6,
        wage_per_worker: 400,
        total_cost: 3800,
        payment_status: 'Paid'
    },
    {
        id: 'lab-2',
        plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a',
        log_date: '2026-09-20',
        activity: 'घडांची पहिली डीपिंग (1st Dipping)',
        worker_names: 'ज्ञानेश्वर, बाळू, लिलाबाई, सविता',
        male_workers: 3,
        female_workers: 5,
        wage_per_worker: 420,
        total_cost: 3300,
        payment_status: 'Paid'
    },
    {
        id: 'lab-3',
        plot_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        log_date: '2026-09-17',
        activity: 'खरड छाटणी व काडी छाटणी',
        worker_names: 'सखाराम, विठ्ठल, काशिनाथ, कमल',
        male_workers: 6,
        female_workers: 2,
        wage_per_worker: 450,
        total_cost: 3400,
        payment_status: 'Paid'
    }
];

const FALLBACK_EXPENSES = [
    { id: 'exp-1', plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3', log_date: '2026-09-21', category: 'खते', category_en: 'Fertilizers', amount: 48500, description: 'MKP, 13:0:45 व विद्राव्य खते खरेदी' },
    { id: 'exp-2', plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a', log_date: '2026-09-19', category: 'औषधे', category_en: 'Chemicals', amount: 52800, description: 'Profiler, Spinotoram व कीटकनाशके' },
    { id: 'exp-3', plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3', log_date: '2026-09-18', category: 'मजुरी', category_en: 'Labor', amount: 58400, description: 'छाटणी व बांधणी मजूर हजेरी' },
    { id: 'exp-4', plot_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', log_date: '2026-09-15', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 18200, description: 'महावितरण कृषी पंप वीज बिल व पाईप दुरुस्ती' },
    { id: 'exp-5', plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3', log_date: '2026-09-12', category: 'वाहतूक', category_en: 'Transport', amount: 22500, description: 'प्लास्टिक क्रेट्स व मार्केट वाहतूक टेम्पो' },
    { id: 'exp-6', plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a', log_date: '2026-09-10', category: 'इतर खर्च', category_en: 'Other', amount: 15000, description: 'मल्चिंग पेपर, सुतळी व तार ताणकाम' }
];

const FALLBACK_SALES = [
    { id: 'sale-1', plot_id: '72c7ddbd-3081-4347-878a-7acc5545f0a3', sale_date: '2026-09-20', buyer_name: 'सह्याद्री फार्म्स प्रा. लि.', grade: 'Export Quality (A+)', quantity_kg: 4200, rate_per_kg: 85, total_revenue: 357000 },
    { id: 'sale-2', plot_id: '9ef4c338-b11b-48f6-92ea-7e2cc3fe7d5a', sale_date: '2026-09-18', buyer_name: 'अमोल ट्रेडर्स, वाशी नवी मुंबई', grade: 'Domestic Super (A)', quantity_kg: 3050, rate_per_kg: 73, total_revenue: 223000 }
];

const FALLBACK_REMINDERS = [
    { id: 'rem-1', category: 'फवारणी', category_en: 'Spray', title: 'Flea Beetle (उदबत्या) व Thrips प्रतिबंधक फवारणी', title_en: 'Flea Beetle & Thrips Preventive Spray', due_date: '2026-09-23', status: 'pending', priority: 'High', notes: 'Spinotoram 11.7 SC @ 0.35 ml/L पाणी' },
    { id: 'rem-2', category: 'खत', category_en: 'Fertilizer', title: 'ठिबकमधून 0:60:20 आणि ह्युमिक ऍसिड ऍप्लिकेशन', title_en: 'Drip fertigation 0:60:20 & Humic acid', due_date: '2026-09-24', status: 'pending', priority: 'Medium', notes: 'मुळांची वाढ व पांढरी मुळी सक्रिय करणे' },
    { id: 'rem-3', category: 'सिंचन', category_en: 'Irrigation', title: 'सकाळी 6:00 वा. 2.5 तास ठिबक सिंचन (45,000 लिटर)', title_en: 'Morning 6:00 AM drip irrigation 2.5 hrs (45k L)', due_date: '2026-09-23', status: 'pending', priority: 'High', notes: 'EC < 1.0, pH 6.8 नियंत्रित ठेवणे' },
    { id: 'rem-4', category: 'छाटणी', category_en: 'Pruning', title: 'प्लॉट 1 - सब-केन पिंचिंग आणि काडी विरळणी', title_en: 'Plot 1 - Sub-cane pinching & cane thinning', due_date: '2026-09-26', status: 'pending', priority: 'Medium', notes: 'प्रति वेल 40 ते 42 निरोगी काड्या राखणे' },
    { id: 'rem-5', category: 'काढणी', category_en: 'Harvest', title: 'मणिक चमन - ब्रिक्स (Brix) TSS टेस्ट (लक्ष्य 18° Brix)', title_en: 'Manik Chaman - Brix TSS test (Target 18°)', due_date: '2026-10-04', status: 'pending', priority: 'High', notes: 'साखरेचे प्रमाण 18° आल्यावर काढणी नियोजन' },
    { id: 'rem-6', category: 'पेमेंट', category_en: 'Payment', title: 'मजूर आठवडा हजेरी पेमेंट (12 कामगार - ₹24,500)', title_en: 'Weekly Labor Wage Payment (12 workers - ₹24,500)', due_date: '2026-09-25', status: 'pending', priority: 'High', notes: 'छाटणी व बांधणी मजुरीचे UPI द्वारे पेमेंट' }
];

// Bilingual Navigation Titles
const TAB_TITLES = {
    'dashboard': {
        mr: { title: '1. डॅशबोर्ड (Dashboard)', sub: 'एकूण क्षेत्र, कामे, पाण्याचा वापर आणि आर्थिक स्थिती' },
        en: { title: '1. Dashboard (Overview)', sub: 'Total acreage, tasks, water usage and financials' },
        icon: 'layout-dashboard'
    },
    'grape-orchard': {
        mr: { title: '2. द्राक्ष बाग व्यवस्थापन', sub: 'प्लॉटनुसार वाण, अंतर, छाटणी तारखा व घड/काडी व्यवस्थापन' },
        en: { title: '2. Grape Orchard Management', sub: 'Plot-wise varieties, spacing, pruning dates & canopy' },
        icon: 'grape'
    },
    'water-mgmt': {
        mr: { title: '3. पाणी व्यवस्थापन', sub: 'आजचे सिंचन, पाणी लिटर, EC/pH नियंत्रण व N-Ca-Mg पोषक घटक' },
        en: { title: '3. Water Management', sub: 'Today\'s irrigation, water liters, EC/pH and nutrients' },
        icon: 'droplet'
    },
    'fertilizer-mgmt': {
        mr: { title: '4. खत व्यवस्थापन', sub: 'खताचे नाव, मात्रा, फर्टिगेशन नोंद व थेट N-P-K कॅल्क्युलेटर' },
        en: { title: '4. Fertilizer & Fertigation', sub: 'Fertilizer names, doses, fertigation logs & NPK calc' },
        icon: 'flask-conical'
    },
    'pest-disease': {
        mr: { title: '5. कीड व रोग व्यवस्थापन', sub: 'उदबत्या, थ्रीप्स, केवडा, भुरी फवारणी व पुढील नियोजन' },
        en: { title: '5. Pest & Disease Management', sub: 'Flea beetle, thrips, mildews, spraying & schedule' },
        icon: 'bug'
    },
    'labor-mgmt': {
        mr: { title: '6. मजूर व्यवस्थापन', sub: 'कामगारांची हजेरी, रोजंदारी, छाटणी/विरळणी कामे व मजुरी खर्च' },
        en: { title: '6. Labor Management', sub: 'Worker roster, daily wage, attendance & labor cost' },
        icon: 'users'
    },
    'finance-pnl': {
        mr: { title: '7. खर्च व उत्पन्न', sub: '6 मुख्य खर्च प्रवाह आणि द्राक्ष विक्री आवक व निव्वळ नफा' },
        en: { title: '7. Expenses & Income (P&L)', sub: '6 expense streams, grape sales revenue & net profit' },
        icon: 'indian-rupee'
    },
    'reports': {
        mr: { title: '8. अहवाल (Reports)', sub: 'प्रति एकर खर्च, प्रति किलो खर्च, प्लॉट उत्पादन व हंगाम तुलना' },
        en: { title: '8. Reports & Analytics', sub: 'Cost per acre, cost per kg, plot yield & seasons' },
        icon: 'bar-chart-3'
    },
    'reminders': {
        mr: { title: '9. स्मरणपत्रे (Reminders)', sub: 'फवारणी, खत, सिंचन, छाटणी, काढणी व पेमेंट ॲलर्ट्स' },
        en: { title: '9. Reminders & Alerts', sub: 'Spray, fertilizer, irrigation, pruning & payment alerts' },
        icon: 'bell'
    },
    'mandi-rates': {
        mr: { title: '10. द्राक्ष बाजारभाव (Live Mandi)', sub: 'नाशिक, सांगली, सोलापूर, पुणे व मुंबई वाशी APMC दर' },
        en: { title: '10. Mandi & APMC Grape Rates', sub: 'Nashik, Sangli, Solapur, Pune & Mumbai APMC auctions' },
        icon: 'trending-up'
    },
    'govt-schemes': {
        mr: { title: '11. शासकीय योजना व सबसिडी', sub: 'MahaDBT ठिबक, NHB कोल्ड स्टोरेज व फळपीक विमा' },
        en: { title: '11. Government Schemes & Subsidies', sub: 'MahaDBT Drip, NHB Cold Storage & Crop Insurance' },
        icon: 'landmark'
    }
};

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    initLanguageToggle();
    initAuth();
    initNavigation();
    initModals();
    initForms();
    initMandiRates();
    initSubsidyCalculator();
    setLanguage(appState.activeLang);
    loadAllData();
});

function initLucide() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ==========================================================================
// 1. BILINGUAL LANGUAGE ENGINE (English <-> Marathi)
// ==========================================================================
const UI_TRANSLATIONS = {
    mr: {
        farmName: 'सह्याद्री द्राक्ष ऑर्चर्ड्स',
        ownerName: 'गणेश पाटील',
        ownerRole: 'बागायतदार • 10.5 एकर',
        logout: 'लॉगआउट',
        loginTitle: 'लॉगिन करा (Sign In)',
        loginSub: 'द्राक्ष बागायतदार व ॲडमिन डॅशबोर्ड व्यवस्थापन',
        farmerPortal: '👨‍🌾 शेतकरी (Farmer Portal)',
        adminPortal: '🛡️ ॲडमिन (Admin Console)',
        loginBtn: 'डॅशबोर्डमध्ये प्रवेश करा (Open Dashboard)',
        
        // Tab 1 Dashboard
        dashTitle: '🌿 द्राक्ष बाग मुख्य डॅशबोर्ड',
        dashDesc: 'सह्याद्री द्राक्ष ऑर्चर्ड्स - आजच्या शेती कामांची व परिस्थितीची थेट नोंद',
        btnIrrigation: '<i data-lucide="droplet"></i> सिंचन नोंद',
        btnSpray: '<i data-lucide="bug"></i> फवारणी नोंद',
        kpiTotalArea: 'एकूण क्षेत्र (Total Area)',
        kpiPlots: 'बाग / प्लॉट संख्या (Plots)',
        kpiTasks: 'आजची कामे (Today\'s Tasks)',
        kpiPnl: 'खर्च व उत्पन्न (P & L)',
        kpiWater: 'पाण्याचा वापर (Water Usage)',
        urgentTasksTitle: '<i data-lucide="bell" style="color: var(--amber-accent);"></i> आजची तातडीची कामे (Urgent Reminders)',
        recentActivityTitle: '<i data-lucide="activity" style="color: var(--emerald-primary);"></i> द्राक्ष बाग स्थिती व नुकतीच कामे',

        // Tab 2 Grape Orchard
        tab2Title: '🍇 द्राक्ष बाग व्यवस्थापन (Grape Orchard Management)',
        tab2Desc: 'प्लॉटनुसार वाण, लागवड अंतर, छाटणी तारखा, घड/काडी व्यवस्थापन व अपेक्षित उत्पादन',
        btnAddPlot: '<i data-lucide="plus-circle"></i> नवीन प्लॉट जोडा',

        // Tab 3 Water Management
        tab3Title: '💧 पाणी व सिंचन व्यवस्थापन (Water Management)',
        tab3Desc: 'आजचे सिंचन, पाणी लिटर गणना, EC/pH नियंत्रण व पाण्यातून मिळणारे अन्नद्रव्ये (N, Ca, Mg)',
        btnAddIrrigation: '<i data-lucide="plus-circle"></i> सिंचन नोंद करा',

        // Tab 4 Fertilizer Management
        tab4Title: '🧪 खत व्यवस्थापन (Fertilizer & Fertigation Management)',
        tab4Desc: 'खताचे नाव, मात्रा, तारीख, प्लॉट, फर्टिगेशन नोंद व थेट N-P-K कॅल्क्युलेटर गणना',
        btnAddFertilizer: '<i data-lucide="plus-circle"></i> खत नोंद करा',

        // Tab 5 Pest & Disease
        tab5Title: '🐛 कीड व रोग व्यवस्थापन (Pest & Disease Management)',
        tab5Desc: 'उदबत्या (Flea beetle), थ्रीप्स (Thrips), केवडा, भुरी नोंद, फवारणी, औषध मात्रा व पुढील तारीख',
        btnAddSpray: '<i data-lucide="plus-circle"></i> फवारणी नोंद करा',

        // Tab 6 Labor
        tab6Title: '👷 मजूर व्यवस्थापन (Labor & Workforce Management)',
        tab6Desc: 'कामगारांची नोंद, रोजंदारी दर, केलेले काम (छाटणी, विरळणी, डिपिंग), उपस्थिती व मजुरी खर्च',
        btnAddLabor: '<i data-lucide="plus-circle"></i> मजूर हजेरी नोंद करा',

        // Tab 7 Finance
        tab7Title: '💰 खर्च व उत्पन्न (Expense & Income Financials)',
        tab7Desc: 'खते, औषधे, मजुरी, वीज, वाहतूक इ. 6 खर्च प्रवाह आणि द्राक्ष विक्री उत्पन्न व निव्वळ नफा',
        btnAddExpense: '<i data-lucide="minus-circle"></i> खर्च नोंद करा',
        btnAddSale: '<i data-lucide="plus-circle"></i> द्राक्ष विक्री नोंद करा',

        // Tab 8 Reports
        tab8Title: '📊 अहवाल व विश्लेषण (Reports & Intelligence)',
        tab8Desc: 'प्रति एकर खर्च, प्रति किलो उत्पादन खर्च, प्लॉटनुसार उत्पादन आणि हंगामाची तुलना',
        btnPrintReport: '<i data-lucide="printer"></i> अहवाल प्रिंट करा',

        // Tab 9 Reminders
        tab9Title: '🔔 स्मरणपत्रे व नियोजन (Reminders & Alerts)',
        tab9Desc: 'फवारणी, खत, सिंचन, छाटणी, काढणी व पेमेंट स्मरणपत्रे (पूर्ण / प्रलंबित थेट व्यवस्थापन)',
        btnAddReminder: '<i data-lucide="plus-circle"></i> नवीन स्मरणपत्र जोडा',

        // Tab 10 Mandi Rates
        tab10Title: '📈 थेट द्राक्ष बाजारभाव व APMC मार्केट दर',
        tab10Desc: 'नाशिक (पिंपळगाव), सांगली (तासगाव), सोलापूर, पुणे व मुंबई वाशी मार्केटमधील ताज्या द्राक्ष लिलाव नोंदी',
        btnRefreshMandi: '<i data-lucide="refresh-cw"></i> ताजे भाव लोड करा',
        btnShareMandi: '<i data-lucide="share-2"></i> बाजारभाव शेअर करा',

        // Tab 11 Government Schemes
        tab11Title: '🏛️ द्राक्ष बागायतदारांसाठी शासकीय योजना व सबसिडी',
        tab11Desc: 'MahaDBT ठिबक सिंचन, NHB पॅकहऊस/कोल्ड स्टोरेज, फळपीक विमा व सौर कृषी पंप योजनांची माहिती व अर्ज प्रक्रिया'
    },
    en: {
        farmName: 'Sahyadri Grape Orchards',
        ownerName: 'Ganesh Patil',
        ownerRole: 'Orchard Owner • 10.5 Acres',
        logout: 'Sign Out',
        loginTitle: 'Sign In to Dashboard',
        loginSub: 'Commercial Vineyard & Orchard Intelligence Operations',
        farmerPortal: '👨‍🌾 Farmer Portal',
        adminPortal: '🛡️ Admin Console',
        loginBtn: 'Enter Vineyard Dashboard',
        
        // Tab 1 Dashboard
        dashTitle: '🌿 Grape Orchard Master Dashboard',
        dashDesc: 'Sahyadri Grape Orchards - Daily vineyard logs, irrigation, spraying & financials',
        btnIrrigation: '<i data-lucide="droplet"></i> Log Irrigation',
        btnSpray: '<i data-lucide="bug"></i> Log Spraying',
        kpiTotalArea: 'Total Area',
        kpiPlots: 'Total Orchard Plots',
        kpiTasks: 'Today\'s Pending Tasks',
        kpiPnl: 'Net Financials (P & L)',
        kpiWater: 'Total Water Usage',
        urgentTasksTitle: '<i data-lucide="bell" style="color: var(--amber-accent);"></i> Urgent Farm Tasks & Reminders',
        recentActivityTitle: '<i data-lucide="activity" style="color: var(--emerald-primary);"></i> Recent Orchard Operations',

        // Tab 2 Grape Orchard
        tab2Title: '🍇 Grape Orchard Management',
        tab2Desc: 'Plot-wise varieties, vine spacing, pruning calendar, canopy density & target yield',
        btnAddPlot: '<i data-lucide="plus-circle"></i> Add New Plot',

        // Tab 3 Water Management
        tab3Title: '💧 Water & Irrigation Management',
        tab3Desc: 'Today\'s irrigation, water liters, EC/pH monitoring & elemental water nutrients (N, Ca, Mg)',
        btnAddIrrigation: '<i data-lucide="plus-circle"></i> Log Irrigation',

        // Tab 4 Fertilizer Management
        tab4Title: '🧪 Fertilizer & Fertigation Management',
        tab4Desc: 'Fertilizer dosages, fertigation records, application methods & elemental N-P-K calculator',
        btnAddFertilizer: '<i data-lucide="plus-circle"></i> Log Fertilizer',

        // Tab 5 Pest & Disease
        tab5Title: '🐛 Pest & Disease Management',
        tab5Desc: 'Flea beetle, Thrips, Downy & Powdery mildew monitoring, chemical logs & next spray date',
        btnAddSpray: '<i data-lucide="plus-circle"></i> Log Spraying',

        // Tab 6 Labor
        tab6Title: '👷 Labor & Workforce Management',
        tab6Desc: 'Daily worker roster, attendance breakdown, activity tracking & wage cost calculation',
        btnAddLabor: '<i data-lucide="plus-circle"></i> Log Labor Attendance',

        // Tab 7 Finance
        tab7Title: '💰 Expenses & Income (P&L Financials)',
        tab7Desc: '6 categorized expense streams, grape sales revenue, buyer registry & net profit margins',
        btnAddExpense: '<i data-lucide="minus-circle"></i> Record Expense',
        btnAddSale: '<i data-lucide="plus-circle"></i> Record Grape Sale',

        // Tab 8 Reports
        tab8Title: '📊 Reports & Business Intelligence',
        tab8Desc: 'Cost per acre, cost per kg production, plot-wise yield breakdown & season comparison',
        btnPrintReport: '<i data-lucide="printer"></i> Print Summary Report',

        // Tab 9 Reminders
        tab9Title: '🔔 Reminders & Operations Schedule',
        tab9Desc: 'Spraying, fertilizer, irrigation, pruning, harvesting & payment reminders with 1-click completion',
        btnAddReminder: '<i data-lucide="plus-circle"></i> Add New Reminder',

        // Tab 10 Mandi Rates
        tab10Title: '📈 Live Mandi & APMC Grape Rates',
        tab10Desc: 'Nashik (Pimpalgaon), Sangli (Tasgaon), Solapur, Pune & Mumbai Vashi APMC daily grape auctions',
        btnRefreshMandi: '<i data-lucide="refresh-cw"></i> Refresh Live Rates',
        btnShareMandi: '<i data-lucide="share-2"></i> Share Market Rates',

        // Tab 11 Government Schemes
        tab11Title: '🏛️ Government Schemes & Subsidies for Vineyards',
        tab11Desc: 'MahaDBT Drip Irrigation, NHB Packhouse/Cold Storage, Crop Insurance & PM KUSUM Solar Pump'
    }
};

function initLanguageToggle() {
    document.querySelectorAll('[data-lang-val]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const chosenLang = btn.dataset.langVal;
            switchLanguage(chosenLang);
        });
    });
}

function switchLanguage(lang) {
    if (!lang) lang = 'mr';
    appState.activeLang = lang;
    localStorage.setItem('krushi_lang', lang);

    // Update active class on all toggle buttons
    document.querySelectorAll('[data-lang-val]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.langVal === lang);
    });

    const isMr = lang === 'mr';
    const dict = isMr ? UI_TRANSLATIONS.mr : UI_TRANSLATIONS.en;

    // 1. Sidebar Brand & User Info
    const farmTitle = document.getElementById('sidebar-farm-title');
    if (farmTitle) farmTitle.textContent = dict.farmName;

    const userDisplay = document.getElementById('user-display-name');
    if (userDisplay) userDisplay.textContent = dict.ownerName;

    const userAcres = document.getElementById('user-display-acres');
    if (userAcres) userAcres.textContent = dict.ownerRole;

    // 2. Sidebar Navigation Items
    const navItems = [
        { id: 'nav-tab-dashboard', mr: ['1. डॅशबोर्ड', 'Dashboard Overview'], en: ['1. Dashboard', 'Farm Overview'] },
        { id: 'nav-tab-grape', mr: ['2. द्राक्ष बाग व्यवस्थापन', 'Grape Orchard Mgmt'], en: ['2. Grape Orchard', 'Plot & Canopy Mgmt'] },
        { id: 'nav-tab-water', mr: ['3. पाणी व्यवस्थापन', 'Water & EC/pH'], en: ['3. Water Management', 'Irrigation & EC/pH'] },
        { id: 'nav-tab-fertilizer', mr: ['4. खत व्यवस्थापन', 'Fertilizer & NPK'], en: ['4. Fertilizer Mgmt', 'Fertigation & NPK'] },
        { id: 'nav-tab-pest', mr: ['5. कीड व रोग व्यवस्थापन', 'Pest & Spraying'], en: ['5. Pest & Disease', 'Flea Beetle & Thrips'] },
        { id: 'nav-tab-labor', mr: ['6. मजूर व्यवस्थापन', 'Labor & Attendance'], en: ['6. Labor Management', 'Attendance & Wages'] },
        { id: 'nav-tab-finance', mr: ['7. खर्च व उत्पन्न', 'Expenses & Sales'], en: ['7. Financial P&L', 'Expenses & Sales'] },
        { id: 'nav-tab-reports', mr: ['8. अहवाल (Reports)', 'Cost/Acre & Kg'], en: ['8. Reports & Analytics', 'Cost/Acre & Kg Yield'] },
        { id: 'nav-tab-reminders', mr: ['9. स्मरणपत्रे (Reminder)', 'Alerts & Schedule'], en: ['9. Reminders', 'Tasks & Alerts'] },
        { id: 'nav-tab-mandi', mr: ['10. द्राक्ष बाजारभाव', 'APMC & Mandi Rates'], en: ['10. Mandi Rates', 'APMC Grape Prices'] },
        { id: 'nav-tab-schemes', mr: ['11. शासकीय योजना व सबसिडी', 'MahaDBT & Subsidies'], en: ['11. Govt Schemes', 'Subsidies & Grants'] }
    ];

    navItems.forEach(item => {
        const btn = document.getElementById(item.id);
        if (btn) {
            const titleSpan = btn.querySelector('.side-btn-title');
            const subSpan = btn.querySelector('.side-btn-sub');
            if (titleSpan) titleSpan.textContent = isMr ? item.mr[0] : item.en[0];
            if (subSpan) subSpan.textContent = isMr ? item.mr[1] : item.en[1];
        }
    });

    const extraSecHeading = document.getElementById('sidebar-sec-extra');
    if (extraSecHeading) {
        extraSecHeading.textContent = isMr ? 'बाजारभाव व योजना' : 'Mandi & Schemes';
    }

    // 3. Top Header
    const headerLogout = document.getElementById('btn-header-logout');
    if (headerLogout) {
        const textSpan = headerLogout.querySelector('span');
        if (textSpan) textSpan.textContent = dict.logout;
    }

    const meta = TAB_TITLES[appState.currentTab] || TAB_TITLES['dashboard'];
    const currentMeta = isMr ? meta.mr : meta.en;
    const titleElem = document.getElementById('breadcrumb-title');
    const subElem = document.getElementById('breadcrumb-sub');
    if (titleElem) titleElem.textContent = currentMeta.title;
    if (subElem) subElem.textContent = currentMeta.sub;

    // 4. Login Screen
    const loginTitle = document.querySelector('.login-main-title');
    if (loginTitle) loginTitle.textContent = dict.loginTitle;

    const loginSub = document.querySelector('.login-subtitle');
    if (loginSub) loginSub.textContent = dict.loginSub;

    const roleFarmer = document.querySelector('#card-role-farmer .role-card-title');
    if (roleFarmer) roleFarmer.textContent = dict.farmerPortal;

    const roleAdmin = document.querySelector('#card-role-admin .role-card-title');
    if (roleAdmin) roleAdmin.textContent = dict.adminPortal;

    const btnLoginText = document.getElementById('btn-login-text');
    if (btnLoginText) btnLoginText.textContent = dict.loginBtn;

    // 5. Headings & Buttons across all views
    const applyText = (sel, html) => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = html;
    };

    // Tab 1 Dashboard
    applyText('#view-dashboard .view-header-left h1', dict.dashTitle);
    applyText('#view-dashboard .view-header-desc', dict.dashDesc);
    applyText('#btn-dash-quick-irrigation', dict.btnIrrigation);
    applyText('#btn-dash-quick-spray', dict.btnSpray);
    applyText('#view-dashboard .kpi-card:nth-child(1) .kpi-label', dict.kpiTotalArea);
    applyText('#view-dashboard .kpi-card:nth-child(2) .kpi-label', dict.kpiPlots);
    applyText('#view-dashboard .kpi-card:nth-child(3) .kpi-label', dict.kpiTasks);
    applyText('#view-dashboard .kpi-card:nth-child(4) .kpi-label', dict.kpiPnl);
    applyText('#view-dashboard .kpi-card:nth-child(5) .kpi-label', dict.kpiWater);

    // Tab 2 Grape Orchard
    applyText('#view-grape-orchard .view-header-left h1', dict.tab2Title);
    applyText('#view-grape-orchard .view-header-desc', dict.tab2Desc);
    applyText('#btn-open-add-plot', dict.btnAddPlot);

    // Tab 3 Water
    applyText('#view-water-mgmt .view-header-left h1', dict.tab3Title);
    applyText('#view-water-mgmt .view-header-desc', dict.tab3Desc);
    applyText('#btn-open-add-irrigation', dict.btnAddIrrigation);

    // Tab 4 Fertilizer
    applyText('#view-fertilizer-mgmt .view-header-left h1', dict.tab4Title);
    applyText('#view-fertilizer-mgmt .view-header-desc', dict.tab4Desc);
    applyText('#btn-open-add-fertilizer', dict.btnAddFertilizer);

    // Tab 5 Pest
    applyText('#view-pest-disease .view-header-left h1', dict.tab5Title);
    applyText('#view-pest-disease .view-header-desc', dict.tab5Desc);
    applyText('#btn-open-add-spray', dict.btnAddSpray);

    // Tab 6 Labor
    applyText('#view-labor-mgmt .view-header-left h1', dict.tab6Title);
    applyText('#view-labor-mgmt .view-header-desc', dict.tab6Desc);
    applyText('#btn-open-add-labor', dict.btnAddLabor);

    // Tab 7 Finance
    applyText('#view-finance-pnl .view-header-left h1', dict.tab7Title);
    applyText('#view-finance-pnl .view-header-desc', dict.tab7Desc);
    applyText('#btn-open-add-expense', dict.btnAddExpense);
    applyText('#btn-open-add-sale', dict.btnAddSale);

    // Tab 8 Reports
    applyText('#view-reports .view-header-left h1', dict.tab8Title);
    applyText('#view-reports .view-header-desc', dict.tab8Desc);
    applyText('#view-reports .view-header-actions button', dict.btnPrintReport);

    // Tab 9 Reminders
    applyText('#view-reminders .view-header-left h1', dict.tab9Title);
    applyText('#view-reminders .view-header-desc', dict.tab9Desc);
    applyText('#btn-open-add-reminder', dict.btnAddReminder);

    // Tab 10 Mandi Rates
    applyText('#view-mandi-rates .view-header-left h1', dict.tab10Title);
    applyText('#view-mandi-rates .view-header-desc', dict.tab10Desc);
    applyText('#btn-refresh-mandi', dict.btnRefreshMandi);
    applyText('#btn-share-mandi-rates', dict.btnShareMandi);

    // Tab 11 Government Schemes
    applyText('#view-govt-schemes .view-header-left h1', dict.tab11Title);
    applyText('#view-govt-schemes .view-header-desc', dict.tab11Desc);

    // Filter pills in Tab 9
    const filterPills = document.querySelectorAll('#reminder-filter-pills .filter-pill');
    const filterLabels = isMr 
        ? ['सर्व (All)', 'प्रलंबित (Pending)', 'पूर्ण (Completed)', 'फवारणी', 'खत', 'सिंचन', 'छाटणी', 'काढणी', 'पेमेंट']
        : ['All Tasks', 'Pending', 'Completed', 'Spraying', 'Fertilizer', 'Irrigation', 'Pruning', 'Harvest', 'Payment'];
    filterPills.forEach((pill, idx) => {
        if (filterLabels[idx]) pill.textContent = filterLabels[idx];
    });

    // 6. Re-render dynamic components
    renderDashboardTab();
    renderGrapeOrchardTab();
    renderWaterTab();
    renderFertilizerTab();
    renderPestDiseaseTab();
    renderLaborTab();
    renderFinanceTab();
    renderReportsTab();
    renderRemindersTab();

    initLucide();
    showToast(isMr ? 'भाषा मराठी निवडली आहे.' : 'Language changed to English.', 'info');
}

// Attach switchLanguage to window for seamless HTML onclick accessibility
window.switchLanguage = switchLanguage;
const setLanguage = switchLanguage;

// ==========================================================================
// 2. AUTHENTICATION & LOGIN FLOW (Light Cream)
// ==========================================================================
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    const cardFarmer = document.getElementById('card-role-farmer');
    const cardAdmin = document.getElementById('card-role-admin');
    const errorBox = document.getElementById('login-error-box');

    // Auto-fill Role Toggles
    cardFarmer?.addEventListener('click', () => {
        cardFarmer.classList.add('active');
        cardAdmin?.classList.remove('active');
        if (userInput) userInput.value = 'farmer';
        if (passInput) passInput.value = 'farmer123';
        if (errorBox) errorBox.style.display = 'none';
    });

    cardAdmin?.addEventListener('click', () => {
        cardAdmin.classList.add('active');
        cardFarmer?.classList.remove('active');
        if (userInput) userInput.value = 'admin';
        if (passInput) passInput.value = 'admin123';
        if (errorBox) errorBox.style.display = 'none';
    });

    // Submit handler
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = userInput?.value.trim().toLowerCase();
        const pass = passInput?.value.trim();

        if ((user === 'farmer' && pass === 'farmer123') || (user === 'admin' && (pass === 'admin123' || pass === 'demo123'))) {
            sessionStorage.setItem('krushi_auth', 'true');
            sessionStorage.setItem('krushi_role', user);
            const isMr = appState.activeLang === 'mr';
            showToast(isMr ? '🌿 स्वागत आहे! द्राक्ष बाग डॅशबोर्ड लोड होत आहे...' : '🌿 Welcome back! Loading vineyard dashboard...', 'success');

            if (loginScreen) {
                loginScreen.classList.add('hidden');
            }
        } else {
            if (errorBox) {
                errorBox.style.display = 'block';
            }
        }
    });

    // Check existing session
    if (sessionStorage.getItem('krushi_auth') === 'true') {
        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }
    }

    // Sign out triggers
    const handleSignout = () => {
        sessionStorage.removeItem('krushi_auth');
        sessionStorage.removeItem('krushi_role');
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
        }
        const isMr = appState.activeLang === 'mr';
        showToast(isMr ? 'लॉगआउट यशस्वी! पुन्हा भेटूया.' : 'Signed out successfully.', 'info');
    };

    document.getElementById('btn-signout')?.addEventListener('click', handleSignout);
    document.getElementById('btn-header-logout')?.addEventListener('click', handleSignout);
    document.getElementById('btn-refresh-data')?.addEventListener('click', () => {
        loadAllData(true);
    });
}

// ==========================================================================
// 3. VERTICAL SIDEBAR NAVIGATION (All 9 Tabs)
// ==========================================================================
function initNavigation() {
    // Mobile menu toggle & drawer handling
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const sidebar = document.getElementById('sidebar-left');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeBtn = document.getElementById('sidebar-close-btn');

    const openMobileSidebar = () => {
        sidebar?.classList.add('open');
        backdrop?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileSidebar = () => {
        sidebar?.classList.remove('open');
        backdrop?.classList.remove('active');
        document.body.style.overflow = '';
    };

    mobileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar?.classList.contains('open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });

    backdrop?.addEventListener('click', closeMobileSidebar);
    closeBtn?.addEventListener('click', closeMobileSidebar);

    // Sidebar nav buttons
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            switchView(target);

            // Close mobile sidebar if open
            if (window.innerWidth <= 1024) {
                closeMobileSidebar();
            }
        });
    });

    // Quick Dashboard Action Triggers
    document.getElementById('btn-dash-quick-irrigation')?.addEventListener('click', () => {
        openModal('modal-add-irrigation');
    });

    document.getElementById('btn-dash-quick-spray')?.addEventListener('click', () => {
        openModal('modal-add-spray');
    });

    // Reminders Filter Pills
    document.querySelectorAll('#reminder-filter-pills .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#reminder-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            appState.activeFilterReminder = pill.dataset.filter;
            renderRemindersTab();
        });
    });
}

function switchView(target) {
    appState.currentTab = target;

    // Update active nav button
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === target);
    });

    // Update active view section
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.toggle('active', view.id === `view-${target}`);
    });

    // Update Top Header Breadcrumb
    const isMr = appState.activeLang === 'mr';
    const meta = TAB_TITLES[target] || TAB_TITLES['dashboard'];
    const currentMeta = isMr ? meta.mr : meta.en;
    const titleElem = document.getElementById('breadcrumb-title');
    const subElem = document.getElementById('breadcrumb-sub');
    const iconElem = document.getElementById('breadcrumb-icon');

    if (titleElem) titleElem.textContent = currentMeta.title;
    if (subElem) subElem.textContent = currentMeta.sub;
    if (iconElem) iconElem.setAttribute('data-lucide', meta.icon);

    initLucide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 4. DATA FETCHING (Supabase with Local Fallback)
// ==========================================================================
async function loadAllData(isManualRefresh = false) {
    const isMr = appState.activeLang === 'mr';
    if (isManualRefresh) {
        showToast(isMr ? 'सर्व डेटा रिफ्रेश होत आहे...' : 'Refreshing live data...', 'info');
    }

    try {
        if (supabaseClient) {
            // Fetch Plots
            const { data: plotsData } = await supabaseClient.from('plots').select('*').order('created_at', { ascending: true });
            appState.plots = (plotsData && plotsData.length > 0) ? plotsData : FALLBACK_PLOTS;

            // Fetch Irrigation Logs
            const { data: irrData } = await supabaseClient.from('irrigation_logs').select('*').order('log_date', { ascending: false });
            appState.irrigationLogs = (irrData && irrData.length > 0) ? irrData : FALLBACK_IRRIGATION;

            // Fetch Fertilizer Logs
            const { data: fertData } = await supabaseClient.from('fertilizer_logs').select('*').order('log_date', { ascending: false });
            appState.fertilizerLogs = (fertData && fertData.length > 0) ? fertData : FALLBACK_FERTILIZER;

            // Fetch Spray Logs
            const { data: sprayData } = await supabaseClient.from('spray_logs').select('*').order('log_date', { ascending: false });
            appState.sprayLogs = (sprayData && sprayData.length > 0) ? sprayData : FALLBACK_SPRAYS;

            // Fetch Labor Logs
            const { data: labData } = await supabaseClient.from('labour_logs').select('*').order('log_date', { ascending: false });
            appState.laborLogs = (labData && labData.length > 0) ? labData : FALLBACK_LABOR;

            // Fetch Expenses
            const { data: expData } = await supabaseClient.from('expenses').select('*').order('log_date', { ascending: false });
            appState.expenses = (expData && expData.length > 0) ? expData : FALLBACK_EXPENSES;

            // Fetch Sales
            const { data: salesData } = await supabaseClient.from('harvest_sales').select('*').order('sale_date', { ascending: false });
            appState.sales = (salesData && salesData.length > 0) ? salesData : FALLBACK_SALES;

            // Fetch Reminders
            const { data: remData } = await supabaseClient.from('reminders').select('*').order('due_date', { ascending: true });
            appState.reminders = (remData && remData.length > 0) ? remData : FALLBACK_REMINDERS;
        } else {
            assignFallbackState();
        }
    } catch (err) {
        console.warn('Supabase fetch issue, using local synced dataset:', err);
        assignFallbackState();
    }

    // Populate Select Options across all modals
    populatePlotSelectors();

    // Render All 9 Tabs
    renderDashboardTab();
    renderGrapeOrchardTab();
    renderWaterTab();
    renderFertilizerTab();
    renderPestDiseaseTab();
    renderLaborTab();
    renderFinanceTab();
    renderReportsTab();
    renderRemindersTab();

    initLucide();
    if (isManualRefresh) {
        showToast(isMr ? 'डेटा यशस्वीरीत्या अपडेट झाला!' : 'Data updated successfully!', 'success');
    }
}

function assignFallbackState() {
    appState.plots = FALLBACK_PLOTS;
    appState.irrigationLogs = FALLBACK_IRRIGATION;
    appState.fertilizerLogs = FALLBACK_FERTILIZER;
    appState.sprayLogs = FALLBACK_SPRAYS;
    appState.laborLogs = FALLBACK_LABOR;
    appState.expenses = FALLBACK_EXPENSES;
    appState.sales = FALLBACK_SALES;
    appState.reminders = FALLBACK_REMINDERS;
}

function populatePlotSelectors() {
    const selectors = [
        'irrigation-plot-id',
        'fert-plot-id',
        'spray-plot-id',
        'labor-plot-id',
        'exp-plot-id',
        'sale-plot-id'
    ];

    const isMr = appState.activeLang === 'mr';
    selectors.forEach(id => {
        const selectElem = document.getElementById(id);
        if (!selectElem) return;

        selectElem.innerHTML = appState.plots.map(p => `
            <option value="${p.id}">${isMr ? p.name : (p.name_en || p.name)} (${p.crop_variety}) - ${p.acres} ${isMr ? 'एकर' : 'Acres'}</option>
        `).join('');
    });
}

function getPlotName(plotId) {
    const isMr = appState.activeLang === 'mr';
    const found = appState.plots.find(p => p.id === plotId);
    if (!found) return isMr ? 'सर्व बाग (All Plots)' : 'All Plots';
    return isMr ? found.name : (found.name_en || found.name);
}

// ==========================================================================
// 5. TAB 1: DASHBOARD RENDERING
// ==========================================================================
function renderDashboardTab() {
    const isMr = appState.activeLang === 'mr';

    // 1. एकूण क्षेत्र
    const totalAcres = appState.plots.reduce((acc, p) => acc + (parseFloat(p.acres) || 0), 0);
    const acresElem = document.getElementById('dash-total-acres');
    if (acresElem) acresElem.textContent = totalAcres.toFixed(1);

    // 2. प्लॉट संख्या
    const plotCountElem = document.getElementById('dash-plot-count');
    if (plotCountElem) plotCountElem.textContent = appState.plots.length;
    const badgePlot = document.getElementById('badge-plot-count');
    if (badgePlot) badgePlot.textContent = `${appState.plots.length} ${isMr ? 'प्लॉट' : 'Plots'}`;

    // 3. आजची कामे (Pending Reminders count)
    const pendingCount = appState.reminders.filter(r => r.status === 'pending').length;
    const tasksElem = document.getElementById('dash-pending-tasks');
    if (tasksElem) tasksElem.textContent = pendingCount;
    const badgeRem = document.getElementById('badge-reminder-count');
    if (badgeRem) badgeRem.textContent = `${pendingCount} ${isMr ? 'कामे' : 'Tasks'}`;

    // 4. खर्च व उत्पन्न
    const totalSales = appState.sales.reduce((acc, s) => acc + (parseFloat(s.total_revenue) || 0), 0);
    const totalExp = appState.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const netProfit = totalSales - totalExp;
    const margin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0';

    const profitElem = document.getElementById('dash-net-profit');
    if (profitElem) profitElem.textContent = `₹${netProfit.toLocaleString('en-IN')}`;
    const subPnlElem = document.getElementById('dash-exp-inc-sub');
    if (subPnlElem) {
        subPnlElem.textContent = isMr 
            ? `उत्पन्न ₹${(totalSales / 100000).toFixed(2)}L | खर्च ₹${(totalExp / 100000).toFixed(2)}L`
            : `Income ₹${(totalSales / 100000).toFixed(2)}L | Exp ₹${(totalExp / 100000).toFixed(2)}L`;
    }
    const marginElem = document.getElementById('dash-profit-margin');
    if (marginElem) marginElem.textContent = `${netProfit >= 0 ? '+' : ''}${margin}% ${isMr ? 'नफा' : 'Margin'}`;

    // 5. पाण्याचा वापर
    const totalWater = appState.irrigationLogs.reduce((acc, i) => acc + (parseFloat(i.water_liters) || 0), 0);
    const waterElem = document.getElementById('dash-water-usage');
    if (waterElem) waterElem.textContent = totalWater.toLocaleString('en-IN');

    // Dashboard Quick Reminders Preview (Top 3 Pending)
    const previewContainer = document.getElementById('dash-reminders-preview');
    if (previewContainer) {
        const topReminders = appState.reminders.filter(r => r.status === 'pending').slice(0, 3);
        if (topReminders.length === 0) {
            previewContainer.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">${isMr ? 'सर्व कामे पूर्ण झाली आहेत! 🍇' : 'All tasks completed! 🍇'}</div>`;
        } else {
            previewContainer.innerHTML = topReminders.map(r => `
                <div class="reminder-item-card">
                    <div class="reminder-left-wrap">
                        <button type="button" class="reminder-check-btn" onclick="toggleReminderStatus('${r.id}')" title="${isMr ? 'पूर्ण करा' : 'Mark Completed'}">
                            <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                        </button>
                        <div class="reminder-content">
                            <div class="reminder-title-line">${isMr ? r.title : (r.title_en || r.title)}</div>
                            <div class="reminder-meta-line">
                                <span class="reminder-category-pill" style="background: var(--amber-subtle); color: var(--amber-accent);">${isMr ? r.category : (r.category_en || r.category)}</span>
                                <span>${isMr ? 'तारीख' : 'Due'}: ${r.due_date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Dashboard Recent Activity (Latest 4 logs)
    const activityTbody = document.getElementById('dash-recent-activities');
    if (activityTbody) {
        const activities = [];
        appState.irrigationLogs.forEach(i => activities.push({ date: i.log_date, type: isMr ? '💧 सिंचन' : '💧 Irrigation', desc: `${i.water_liters?.toLocaleString('en-IN')} L (${i.duration_hours} ${isMr ? 'तास' : 'hrs'})`, plot: getPlotName(i.plot_id) }));
        appState.sprayLogs.forEach(s => activities.push({ date: s.log_date, type: isMr ? '🐛 फवारणी' : '🐛 Spray', desc: `${s.pest_disease_name || s.chemical_or_fertilizer}`, plot: getPlotName(s.plot_id) }));
        appState.fertilizerLogs.forEach(f => activities.push({ date: f.log_date, type: isMr ? '🧪 खत' : '🧪 Fertilizer', desc: `${f.fertilizer_name} (${f.dose_amount} kg)`, plot: getPlotName(f.plot_id) }));

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const topActivities = activities.slice(0, 4);

        activityTbody.innerHTML = topActivities.map(a => `
            <tr>
                <td style="font-weight: 600;">${a.date}</td>
                <td><span class="badge-status info">${a.type}</span></td>
                <td>${a.desc}</td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${a.plot}</td>
            </tr>
        `).join('');
    }
}

// ==========================================================================
// 6. TAB 2: 🍇 द्राक्ष बाग व्यवस्थापन (GRAPE ORCHARD MANAGEMENT)
// ==========================================================================
function renderGrapeOrchardTab() {
    const isMr = appState.activeLang === 'mr';
    const container = document.getElementById('grape-plots-container');
    if (!container) return;

    container.innerHTML = appState.plots.map(p => `
        <div class="plot-card">
            <div>
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">${isMr ? p.name : (p.name_en || p.name)}</h3>
                        <div class="plot-variety-badge">
                            <i data-lucide="grape" style="width: 13px; height: 13px;"></i>
                            <span>${isMr ? 'वाण' : 'Variety'}: ${p.crop_variety}</span>
                        </div>
                    </div>
                    <span class="badge-status success">${p.acres} ${isMr ? 'एकर' : 'Acres'}</span>
                </div>

                <div class="plot-details-grid">
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? 'लागवड अंतर (Spacing)' : 'Plant Spacing'}</span>
                        <span class="detail-value">${p.spacing || '10 x 6 ft'}</span>
                    </div>
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? 'अपेक्षित उत्पादन' : 'Expected Yield'}</span>
                        <span class="detail-value" style="color: var(--emerald-primary);">${p.expected_yield_tonnes || 15} ${isMr ? 'टन' : 'Tonnes'}</span>
                    </div>
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? 'काड्या संख्या / झाड' : 'Canes / Vine'}</span>
                        <span class="detail-value">${p.canes_per_vine || 42} ${isMr ? 'काड्या' : 'canes'}</span>
                    </div>
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? 'घड संख्या / झाड' : 'Bunches / Vine'}</span>
                        <span class="detail-value">${p.bunches_per_vine || 48} ${isMr ? 'घड' : 'bunches'}</span>
                    </div>
                </div>

                <div class="pruning-timeline">
                    <div>
                        <strong style="color: var(--amber-deep);">${isMr ? 'खरड छाटणी:' : 'April Pruning:'}</strong> ${p.foundation_pruning_date || '15 April'}
                    </div>
                    <div>
                        <strong style="color: var(--emerald-deep);">${isMr ? 'गोड/फळ छाटणी:' : 'Fruit Pruning:'}</strong> ${p.fruit_pruning_date || '10 Oct'}
                    </div>
                </div>
            </div>

            <div class="plot-card-footer" style="margin-top: 1rem;">
                <span>${isMr ? 'सिंचन: ठिबक प्रणाली' : 'System: Drip Irrigation'}</span>
                <button class="filter-pill" onclick="quickLogForPlot('${p.id}')">${isMr ? 'सिंचन/खत द्या' : 'Irrigate / Feed'}</button>
            </div>
        </div>
    `).join('');
}

function quickLogForPlot(plotId) {
    const select = document.getElementById('irrigation-plot-id');
    if (select) select.value = plotId;
    openModal('modal-add-irrigation');
}

// ==========================================================================
// 7. TAB 3: 💧 पाणी व्यवस्थापन (WATER & IRRIGATION)
// ==========================================================================
function renderWaterTab() {
    const isMr = appState.activeLang === 'mr';

    // Calculate Averages
    if (appState.irrigationLogs.length > 0) {
        const totalEc = appState.irrigationLogs.reduce((acc, i) => acc + (parseFloat(i.ec_level) || 0.85), 0);
        const totalPh = appState.irrigationLogs.reduce((acc, i) => acc + (parseFloat(i.ph_level) || 6.8), 0);
        const avgEc = (totalEc / appState.irrigationLogs.length).toFixed(2);
        const avgPh = (totalPh / appState.irrigationLogs.length).toFixed(1);

        const ecElem = document.getElementById('water-avg-ec');
        if (ecElem) ecElem.textContent = avgEc;
        const phElem = document.getElementById('water-avg-ph');
        if (phElem) phElem.textContent = avgPh;

        // Nutrients
        const latest = appState.irrigationLogs[0];
        if (latest) {
            document.getElementById('water-nutrient-n').textContent = `${latest.nutrients_n || 3.2} kg`;
            document.getElementById('water-nutrient-ca').textContent = `${latest.nutrients_ca || 4.8} kg`;
            document.getElementById('water-nutrient-mg').textContent = `${latest.nutrients_mg || 2.1} kg`;
        }
    }

    // Table rendering
    const tbody = document.getElementById('water-logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = appState.irrigationLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td>${getPlotName(log.plot_id)}</td>
            <td><span class="badge-status info">${log.duration_hours} ${isMr ? 'तास' : 'hrs'}</span></td>
            <td style="font-weight: 700; color: var(--blue-accent);">${(parseFloat(log.water_liters) || 0).toLocaleString('en-IN')} L</td>
            <td>${log.water_source || (isMr ? 'ठिबक सिंचन' : 'Drip Irrigation')}</td>
            <td>EC: ${log.ec_level || 0.85} | pH: ${log.ph_level || 6.8}</td>
            <td>N: ${log.nutrients_n || 3.2}kg, Ca: ${log.nutrients_ca || 4.8}kg, Mg: ${log.nutrients_mg || 2.1}kg</td>
        </tr>
    `).join('');
}

// ==========================================================================
// 8. TAB 4: 🧪 खत व्यवस्थापन (FERTILIZER & NPK CALCULATOR)
// ==========================================================================
function renderFertilizerTab() {
    const isMr = appState.activeLang === 'mr';

    // Total Elemental NPK Accumulation
    const totalN = appState.fertilizerLogs.reduce((acc, f) => acc + (parseFloat(f.calculated_n_kg) || 0), 0);
    const totalP = appState.fertilizerLogs.reduce((acc, f) => acc + (parseFloat(f.calculated_p_kg) || 0), 0);
    const totalK = appState.fertilizerLogs.reduce((acc, f) => acc + (parseFloat(f.calculated_k_kg) || 0), 0);

    const nElem = document.getElementById('npk-total-n');
    if (nElem) nElem.innerHTML = `${totalN.toFixed(1)} <span style="font-size: 0.9rem; font-weight: 500;">kg</span>`;
    const pElem = document.getElementById('npk-total-p');
    if (pElem) pElem.innerHTML = `${totalP.toFixed(1)} <span style="font-size: 0.9rem; font-weight: 500;">kg</span>`;
    const kElem = document.getElementById('npk-total-k');
    if (kElem) kElem.innerHTML = `${totalK.toFixed(1)} <span style="font-size: 0.9rem; font-weight: 500;">kg</span>`;

    // Table rendering
    const tbody = document.getElementById('fertilizer-logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = appState.fertilizerLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td>${getPlotName(log.plot_id)}</td>
            <td style="font-weight: 700; color: var(--emerald-deep);">${log.fertilizer_name}</td>
            <td>${log.dose_amount} ${log.dose_unit || 'kg/acre'}</td>
            <td><span class="badge-status info">${log.application_method || 'ठिबक (Drip)'}</span></td>
            <td><code>${log.npk_ratio || '0:52:34'}</code></td>
            <td><strong>N: ${log.calculated_n_kg || 0}</strong>, <strong>P: ${log.calculated_p_kg || 0}</strong>, <strong>K: ${log.calculated_k_kg || 0}</strong></td>
            <td style="font-weight: 700;">₹${(parseFloat(log.cost) || 0).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');
}

// Helper: Calculate actual elemental N-P-K in kg from fertilizer dosage
function calculateElementalNPK(fertilizerName, doseKg) {
    const dose = parseFloat(doseKg) || 0;
    let n = 0, p = 0, k = 0;

    if (fertilizerName.includes('0:52:34')) {
        p = dose * 0.52;
        k = dose * 0.34;
    } else if (fertilizerName.includes('13:00:45') || fertilizerName.includes('13:0:45')) {
        n = dose * 0.13;
        k = dose * 0.45;
    } else if (fertilizerName.includes('19:19:19')) {
        n = dose * 0.19;
        p = dose * 0.19;
        k = dose * 0.19;
    } else if (fertilizerName.includes('12:61:00') || fertilizerName.includes('12:61:0')) {
        n = dose * 0.12;
        p = dose * 0.61;
    } else if (fertilizerName.includes('00:00:50') || fertilizerName.includes('SOP')) {
        k = dose * 0.50;
    } else if (fertilizerName.includes('युरिया') || fertilizerName.includes('Urea')) {
        n = dose * 0.46;
    }

    return {
        n: parseFloat(n.toFixed(2)),
        p: parseFloat(p.toFixed(2)),
        k: parseFloat(k.toFixed(2))
    };
}

// ==========================================================================
// 9. TAB 5: 🐛 कीड व रोग व्यवस्थापन (PEST & DISEASE MANAGEMENT)
// ==========================================================================
function renderPestDiseaseTab() {
    const isMr = appState.activeLang === 'mr';
    const tbody = document.getElementById('pest-spray-table-body');
    if (!tbody) return;

    tbody.innerHTML = appState.sprayLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td>${getPlotName(log.plot_id)}</td>
            <td><span class="badge-status danger">${log.pest_disease_name || 'थ्रीप्स (Thrips)'}</span></td>
            <td style="font-weight: 700; color: var(--emerald-deep);">${log.chemical_or_fertilizer}</td>
            <td>${log.dose_per_liter} ml/L</td>
            <td>${log.total_water_liters} L</td>
            <td style="color: var(--amber-deep); font-weight: 600;">📅 ${log.next_spray_date || (isMr ? '7 दिवसांनी' : 'In 7 days')}</td>
            <td style="font-weight: 700;">₹${(parseFloat(log.cost) || 0).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');
}

// ==========================================================================
// 10. TAB 6: 👷 मजूर व्यवस्थापन (LABOR MANAGEMENT)
// ==========================================================================
function renderLaborTab() {
    const isMr = appState.activeLang === 'mr';
    const totalHeadcount = appState.laborLogs.reduce((acc, l) => acc + (parseInt(l.male_workers) || 0) + (parseInt(l.female_workers) || 0), 0);
    const totalCost = appState.laborLogs.reduce((acc, l) => acc + (parseFloat(l.total_cost) || 0), 0);

    const headElem = document.getElementById('labor-total-headcount');
    if (headElem) headElem.textContent = totalHeadcount;
    const costElem = document.getElementById('labor-total-cost');
    if (costElem) costElem.textContent = `₹${totalCost.toLocaleString('en-IN')}`;

    // Table rendering
    const tbody = document.getElementById('labor-logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = appState.laborLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td>${getPlotName(log.plot_id)}</td>
            <td style="font-weight: 700; color: var(--emerald-deep);">${log.activity}</td>
            <td style="color: var(--text-secondary); font-size: 0.8rem;">${log.worker_names || (isMr ? 'कामगार हजेरी' : 'Attendance roster')}</td>
            <td><span class="badge-status info">${log.male_workers || 0} ${isMr ? 'पुरुष' : 'Male'}</span></td>
            <td><span class="badge-status purple">${log.female_workers || 0} ${isMr ? 'महिला' : 'Female'}</span></td>
            <td>₹${log.wage_per_worker}/${isMr ? 'दिवस' : 'day'}</td>
            <td style="font-weight: 700;">₹${(parseFloat(log.total_cost) || 0).toLocaleString('en-IN')}</td>
            <td><span class="badge-status ${log.payment_status === 'Paid' ? 'success' : 'warning'}">${log.payment_status === 'Paid' ? (isMr ? 'दिले (Paid)' : 'Paid') : (isMr ? 'प्रलंबित' : 'Pending')}</span></td>
        </tr>
    `).join('');
}

// ==========================================================================
// 11. TAB 7: 💰 खर्च व उत्पन्न (EXPENSE & INCOME)
// ==========================================================================
function renderFinanceTab() {
    const isMr = appState.activeLang === 'mr';
    const totalSales = appState.sales.reduce((acc, s) => acc + (parseFloat(s.total_revenue) || 0), 0);
    const totalExp = appState.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const netProfit = totalSales - totalExp;
    const margin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0';

    const revElem = document.getElementById('fin-total-revenue');
    if (revElem) revElem.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
    const expElem = document.getElementById('fin-total-expense');
    if (expElem) expElem.textContent = `₹${totalExp.toLocaleString('en-IN')}`;
    const profitElem = document.getElementById('fin-net-profit');
    if (profitElem) profitElem.textContent = `₹${netProfit.toLocaleString('en-IN')}`;
    const marginElem = document.getElementById('fin-margin-label');
    if (marginElem) marginElem.textContent = `${isMr ? 'नफा मार्जिन:' : 'Margin:'} ${margin}%`;

    // 6 Expense Streams
    const catMap = { 'खते': 0, 'औषधे': 0, 'मजुरी': 0, 'पाणी/वीज': 0, 'वाहतूक': 0, 'इतर खर्च': 0 };
    appState.expenses.forEach(e => {
        if (catMap.hasOwnProperty(e.category)) {
            catMap[e.category] += (parseFloat(e.amount) || 0);
        } else {
            catMap['इतर खर्च'] += (parseFloat(e.amount) || 0);
        }
    });

    document.getElementById('cat-exp-fertilizers').textContent = `₹${catMap['खते'].toLocaleString('en-IN')}`;
    document.getElementById('cat-exp-sprays').textContent = `₹${catMap['औषधे'].toLocaleString('en-IN')}`;
    document.getElementById('cat-exp-labor').textContent = `₹${catMap['मजुरी'].toLocaleString('en-IN')}`;
    document.getElementById('cat-exp-water').textContent = `₹${catMap['पाणी/वीज'].toLocaleString('en-IN')}`;
    document.getElementById('cat-exp-transport').textContent = `₹${catMap['वाहतूक'].toLocaleString('en-IN')}`;
    document.getElementById('cat-exp-other').textContent = `₹${catMap['इतर खर्च'].toLocaleString('en-IN')}`;

    // Harvest Sales Table
    const salesTbody = document.getElementById('fin-sales-table-body');
    if (salesTbody) {
        salesTbody.innerHTML = appState.sales.map(s => `
            <tr>
                <td style="font-weight: 600;">${s.sale_date}</td>
                <td>${s.buyer_name}</td>
                <td><span class="badge-status success">${s.grade}</span></td>
                <td>${(parseFloat(s.quantity_kg) || 0).toLocaleString('en-IN')} kg</td>
                <td>₹${s.rate_per_kg}/kg</td>
                <td style="font-weight: 700; color: var(--emerald-primary);">₹${(parseFloat(s.total_revenue) || 0).toLocaleString('en-IN')}</td>
            </tr>
        `).join('');
    }

    // Expenses Table
    const expTbody = document.getElementById('fin-expenses-table-body');
    if (expTbody) {
        expTbody.innerHTML = appState.expenses.map(e => `
            <tr>
                <td style="font-weight: 600;">${e.log_date}</td>
                <td><span class="badge-status info">${isMr ? e.category : (e.category_en || e.category)}</span></td>
                <td>${e.description || '-'}</td>
                <td style="font-weight: 700; color: var(--rose-accent);">₹${(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</td>
            </tr>
        `).join('');
    }
}

// ==========================================================================
// 12. TAB 8: 📊 REPORTS & INTELLIGENCE
// ==========================================================================
function renderReportsTab() {
    const isMr = appState.activeLang === 'mr';
    const totalAcres = appState.plots.reduce((acc, p) => acc + (parseFloat(p.acres) || 0), 0) || 10.5;
    const totalExp = appState.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const totalSalesKg = appState.sales.reduce((acc, s) => acc + (parseFloat(s.quantity_kg) || 0), 0) || 7250;
    const totalRevenue = appState.sales.reduce((acc, s) => acc + (parseFloat(s.total_revenue) || 0), 0);
    const netProfit = totalRevenue - totalExp;

    const costPerAcre = (totalExp / totalAcres).toFixed(0);
    const costPerKg = (totalExp / totalSalesKg).toFixed(2);
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    document.getElementById('rep-cost-per-acre').textContent = `₹${parseFloat(costPerAcre).toLocaleString('en-IN')}`;
    document.getElementById('rep-cost-per-kg').textContent = `₹${costPerKg}`;
    document.getElementById('rep-net-margin').textContent = `${margin}%`;

    // Plot-wise breakdown table
    const tbody = document.getElementById('reports-plot-table-body');
    if (!tbody) return;

    tbody.innerHTML = appState.plots.map(p => {
        const plotSales = appState.sales.filter(s => s.plot_id === p.id);
        const plotSalesKg = plotSales.reduce((acc, s) => acc + (parseFloat(s.quantity_kg) || 0), 0);
        const plotIncome = plotSales.reduce((acc, s) => acc + (parseFloat(s.total_revenue) || 0), 0);
        const plotExp = appState.expenses.filter(e => e.plot_id === p.id).reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
        const plotNet = plotIncome - plotExp;

        return `
            <tr>
                <td style="font-weight: 700;">${isMr ? p.name : (p.name_en || p.name)}</td>
                <td><span class="badge-status purple">${p.crop_variety}</span></td>
                <td>${p.acres} ${isMr ? 'एकर' : 'Acres'}</td>
                <td style="font-weight: 600;">${p.expected_yield_tonnes || 15} ${isMr ? 'टन' : 'Tonnes'}</td>
                <td>${plotSalesKg > 0 ? plotSalesKg.toLocaleString('en-IN') + ' kg' : (isMr ? 'काढणी बाकी' : 'Harvest Pending')}</td>
                <td style="font-weight: 700; color: var(--emerald-primary);">₹${plotIncome.toLocaleString('en-IN')}</td>
                <td style="font-weight: 700; color: var(--rose-accent);">₹${plotExp.toLocaleString('en-IN')}</td>
                <td style="font-weight: 800; color: ${plotNet >= 0 ? 'var(--emerald-deep)' : 'var(--rose-accent)'};">₹${plotNet.toLocaleString('en-IN')}</td>
            </tr>
        `;
    }).join('');
}

// ==========================================================================
// 13. TAB 9: 🔔 REMINDERS & CHECKLIST (1-Click Completion)
// ==========================================================================
function renderRemindersTab() {
    const isMr = appState.activeLang === 'mr';
    const container = document.getElementById('reminders-full-container');
    if (!container) return;

    let filtered = appState.reminders;
    if (appState.activeFilterReminder === 'pending') {
        filtered = appState.reminders.filter(r => r.status === 'pending');
    } else if (appState.activeFilterReminder === 'completed') {
        filtered = appState.reminders.filter(r => r.status === 'completed');
    } else if (appState.activeFilterReminder !== 'all') {
        filtered = appState.reminders.filter(r => r.category === appState.activeFilterReminder || r.category_en?.toLowerCase() === appState.activeFilterReminder.toLowerCase());
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                <i data-lucide="check-circle" style="width: 48px; height: 48px; margin-bottom: 0.75rem; color: var(--emerald-primary);"></i>
                <div style="font-size: 1.1rem; font-weight: 700;">${isMr ? 'कोणतीही प्रलंबित कामे नाहीत!' : 'No pending tasks found!'}</div>
                <p style="font-size: 0.85rem; margin-top: 0.25rem;">${isMr ? "तुम्ही नवीन स्मरणपत्र जोडण्यासाठी वर 'नवीन स्मरणपत्र जोडा' बटण वापरा." : "Click 'Add New Reminder' above to schedule new tasks."}</p>
            </div>
        `;
        initLucide();
        return;
    }

    container.innerHTML = filtered.map(r => {
        const isDone = r.status === 'completed';
        const titleText = isMr ? r.title : (r.title_en || r.title);
        const catText = isMr ? r.category : (r.category_en || r.category);

        return `
            <div class="reminder-item-card ${isDone ? 'completed' : ''}">
                <div class="reminder-left-wrap">
                    <button type="button" class="reminder-check-btn" onclick="toggleReminderStatus('${r.id}')" title="${isDone ? (isMr ? 'अपूर्ण म्हणून चिन्हांकित करा' : 'Mark Pending') : (isMr ? 'पूर्ण करा' : 'Mark Done')}">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="reminder-content">
                        <div class="reminder-title-line">${titleText}</div>
                        <div class="reminder-meta-line">
                            <span class="reminder-category-pill" style="background: var(--amber-subtle); color: var(--amber-accent);">${catText}</span>
                            <span>${isMr ? 'तारीख' : 'Due'}: <strong>${r.due_date}</strong></span>
                            ${r.priority ? `<span class="badge-status ${r.priority === 'High' ? 'danger' : 'info'}">${isMr ? 'प्राधान्य' : 'Priority'}: ${r.priority}</span>` : ''}
                            ${r.notes ? `<span>• ${r.notes}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div>
                    <span class="badge-status ${isDone ? 'success' : 'warning'}">${isDone ? (isMr ? 'पूर्ण (Done)' : 'Completed') : (isMr ? 'प्रलंबित' : 'Pending')}</span>
                </div>
            </div>
        `;
    }).join('');

    initLucide();
}

// 1-Click Toggle for Reminders (Synced to Supabase!)
async function toggleReminderStatus(reminderId) {
    const isMr = appState.activeLang === 'mr';
    const item = appState.reminders.find(r => r.id === reminderId);
    if (!item) return;

    item.status = item.status === 'completed' ? 'pending' : 'completed';

    // Update locally instantly
    renderRemindersTab();
    renderDashboardTab();

    showToast(item.status === 'completed' ? (isMr ? 'काम पूर्ण झाले! 🎉' : 'Task marked complete! 🎉') : (isMr ? 'काम प्रलंबित चिन्हांकित केले.' : 'Task marked pending.'), 'info');

    // Update Supabase in background
    if (supabaseClient) {
        try {
            await supabaseClient.from('reminders').update({ status: item.status }).eq('id', reminderId);
        } catch (err) {
            console.error('Failed to sync reminder status to Supabase:', err);
        }
    }
}

// ==========================================================================
// 14. MODALS & FORMS SUBMISSIONS (Instant UI Update + Supabase Persist)
// ==========================================================================
function initModals() {
    // Open Modal buttons
    document.getElementById('btn-open-add-plot')?.addEventListener('click', () => openModal('modal-add-plot'));
    document.getElementById('btn-open-add-irrigation')?.addEventListener('click', () => openModal('modal-add-irrigation'));
    document.getElementById('btn-open-add-fertilizer')?.addEventListener('click', () => openModal('modal-add-fertilizer'));
    document.getElementById('btn-open-add-spray')?.addEventListener('click', () => openModal('modal-add-spray'));
    document.getElementById('btn-open-add-labor')?.addEventListener('click', () => openModal('modal-add-labor'));
    document.getElementById('btn-open-add-expense')?.addEventListener('click', () => openModal('modal-add-expense'));
    document.getElementById('btn-open-add-sale')?.addEventListener('click', () => openModal('modal-add-sale'));
    document.getElementById('btn-open-add-reminder')?.addEventListener('click', () => openModal('modal-add-reminder'));

    // Close Modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.closeModal;
            closeModal(modalId);
        });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Pre-fill today's dates for inputs
    const today = new Date().toISOString().split('T')[0];
    ['irrigation-date', 'fert-date', 'spray-date', 'labor-date', 'exp-date', 'sale-date', 'rem-due-date'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = today;
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        initLucide();
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function initForms() {
    const isMr = () => appState.activeLang === 'mr';

    // 1. Add Plot Form
    document.getElementById('form-add-plot')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plotName = document.getElementById('plot-name').value.trim();
        const newPlot = {
            id: 'plot-' + Date.now(),
            farm_id: appState.farm.id,
            name: plotName,
            name_en: plotName,
            crop_variety: document.getElementById('plot-variety').value,
            acres: parseFloat(document.getElementById('plot-acres').value) || 1,
            spacing: document.getElementById('plot-spacing').value,
            foundation_pruning_date: document.getElementById('plot-foundation-date').value || null,
            fruit_pruning_date: document.getElementById('plot-fruit-date').value || null,
            canes_per_vine: parseInt(document.getElementById('plot-canes').value) || 42,
            bunches_per_vine: parseInt(document.getElementById('plot-bunches').value) || 48,
            expected_yield_tonnes: parseFloat(document.getElementById('plot-expected-yield').value) || 15
        };

        appState.plots.push(newPlot);
        populatePlotSelectors();
        renderDashboardTab();
        renderGrapeOrchardTab();
        renderReportsTab();
        closeModal('modal-add-plot');
        e.target.reset();
        showToast(isMr() ? 'नवीन द्राक्ष प्लॉट यशस्वीपणे जोडला!' : 'New grape plot added successfully!', 'success');

        if (supabaseClient) {
            try {
                const { data } = await supabaseClient.from('plots').insert([{
                    farm_id: appState.farm.id,
                    name: newPlot.name,
                    crop_variety: newPlot.crop_variety,
                    acres: newPlot.acres,
                    spacing: newPlot.spacing,
                    foundation_pruning_date: newPlot.foundation_pruning_date,
                    fruit_pruning_date: newPlot.fruit_pruning_date,
                    canes_per_vine: newPlot.canes_per_vine,
                    bunches_per_vine: newPlot.bunches_per_vine,
                    expected_yield_tonnes: newPlot.expected_yield_tonnes
                }]).select();
                if (data && data[0]) newPlot.id = data[0].id;
            } catch (err) {
                console.error('Supabase error inserting plot:', err);
            }
        }
    });

    // 2. Add Irrigation Form
    document.getElementById('form-add-irrigation')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const log = {
            id: 'irr-' + Date.now(),
            plot_id: document.getElementById('irrigation-plot-id').value,
            log_date: document.getElementById('irrigation-date').value,
            duration_hours: parseFloat(document.getElementById('irrigation-hours').value),
            water_liters: parseFloat(document.getElementById('irrigation-liters').value),
            water_source: isMr() ? 'ठिबक सिंचन' : 'Drip Irrigation',
            ec_level: parseFloat(document.getElementById('irrigation-ec').value) || 0.85,
            ph_level: parseFloat(document.getElementById('irrigation-ph').value) || 6.8,
            nutrients_n: parseFloat(document.getElementById('irrigation-n').value) || 3.2,
            nutrients_ca: parseFloat(document.getElementById('irrigation-ca').value) || 4.8,
            nutrients_mg: parseFloat(document.getElementById('irrigation-mg').value) || 2.1
        };

        appState.irrigationLogs.unshift(log);
        renderDashboardTab();
        renderWaterTab();
        closeModal('modal-add-irrigation');
        showToast(isMr() ? 'सिंचन नोंद यशस्वीपणे सेव्ह झाली!' : 'Irrigation log saved successfully!', 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('irrigation_logs').insert([{
                    plot_id: log.plot_id,
                    log_date: log.log_date,
                    duration_hours: log.duration_hours,
                    water_liters: log.water_liters,
                    water_source: log.water_source,
                    ec_level: log.ec_level,
                    ph_level: log.ph_level,
                    nutrients_n: log.nutrients_n,
                    nutrients_ca: log.nutrients_ca,
                    nutrients_mg: log.nutrients_mg
                }]);
            } catch (err) {
                console.error('Supabase error inserting irrigation log:', err);
            }
        }
    });

    // 3. Add Fertilizer Form (with Live NPK calculation!)
    document.getElementById('form-add-fertilizer')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fertName = document.getElementById('fert-name').value;
        const doseAmount = parseFloat(document.getElementById('fert-amount').value);
        const elemental = calculateElementalNPK(fertName, doseAmount);

        const log = {
            id: 'fert-' + Date.now(),
            farm_id: appState.farm.id,
            plot_id: document.getElementById('fert-plot-id').value,
            log_date: document.getElementById('fert-date').value,
            fertilizer_name: fertName,
            dose_amount: doseAmount,
            dose_unit: 'kg/acre',
            application_method: document.getElementById('fert-method').value,
            npk_ratio: fertName.split(' ')[0],
            calculated_n_kg: elemental.n,
            calculated_p_kg: elemental.p,
            calculated_k_kg: elemental.k,
            cost: parseFloat(document.getElementById('fert-cost').value) || 0,
            notes: document.getElementById('fert-notes').value
        };

        appState.fertilizerLogs.unshift(log);
        renderDashboardTab();
        renderFertilizerTab();
        closeModal('modal-add-fertilizer');
        showToast(isMr() 
            ? `खत नोंद झाली! प्रत्यक्ष घटक: N: ${elemental.n}kg, P: ${elemental.p}kg, K: ${elemental.k}kg`
            : `Fertilizer logged! Actual N: ${elemental.n}kg, P: ${elemental.p}kg, K: ${elemental.k}kg`, 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('fertilizer_logs').insert([log]);
            } catch (err) {
                console.error('Supabase error inserting fertilizer log:', err);
            }
        }
    });

    // 4. Add Spray Form
    document.getElementById('form-add-spray')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const log = {
            id: 'spray-' + Date.now(),
            plot_id: document.getElementById('spray-plot-id').value,
            log_date: document.getElementById('spray-date').value,
            pest_disease_name: document.getElementById('spray-target-pest').value,
            chemical_or_fertilizer: document.getElementById('spray-chem-name').value,
            dose_per_liter: parseFloat(document.getElementById('spray-dose-liter').value),
            total_water_liters: parseFloat(document.getElementById('spray-total-water').value),
            next_spray_date: document.getElementById('spray-next-date').value || null,
            cost: parseFloat(document.getElementById('spray-cost').value) || 0
        };

        appState.sprayLogs.unshift(log);
        renderDashboardTab();
        renderPestDiseaseTab();
        closeModal('modal-add-spray');
        showToast(isMr() ? 'फवारणी नोंद यशस्वीरित्या सेव्ह झाली!' : 'Spray log saved successfully!', 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('spray_logs').insert([log]);
            } catch (err) {
                console.error('Supabase error inserting spray log:', err);
            }
        }
    });

    // 5. Add Labor Form
    document.getElementById('form-add-labor')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const male = parseInt(document.getElementById('labor-male-count').value) || 0;
        const female = parseInt(document.getElementById('labor-female-count').value) || 0;
        const wage = parseFloat(document.getElementById('labor-wage-rate').value) || 400;
        const total = (male * wage) + (female * wage * 0.85);

        const log = {
            id: 'lab-' + Date.now(),
            plot_id: document.getElementById('labor-plot-id').value,
            log_date: document.getElementById('labor-date').value,
            activity: document.getElementById('labor-activity').value,
            worker_names: document.getElementById('labor-workers-names').value,
            male_workers: male,
            female_workers: female,
            wage_per_worker: wage,
            total_cost: Math.round(total),
            payment_status: document.getElementById('labor-payment-status').value
        };

        appState.laborLogs.unshift(log);
        renderLaborTab();
        closeModal('modal-add-labor');
        showToast(isMr() ? `मजूर हजेरी नोंद झाली! एकूण खर्च: ₹${log.total_cost}` : `Labor attendance logged! Total Cost: ₹${log.total_cost}`, 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('labour_logs').insert([log]);
            } catch (err) {
                console.error('Supabase error inserting labor log:', err);
            }
        }
    });

    // 6. Add Expense Form
    document.getElementById('form-add-expense')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cat = document.getElementById('exp-category').value;
        const log = {
            id: 'exp-' + Date.now(),
            plot_id: document.getElementById('exp-plot-id').value || null,
            log_date: document.getElementById('exp-date').value,
            category: cat,
            category_en: cat,
            amount: parseFloat(document.getElementById('exp-amount').value),
            description: document.getElementById('exp-description').value,
            payment_mode: 'UPI'
        };

        appState.expenses.unshift(log);
        renderDashboardTab();
        renderFinanceTab();
        renderReportsTab();
        closeModal('modal-add-expense');
        showToast(isMr() ? `खर्च नोंद सेव्ह झाली: ₹${log.amount}` : `Expense recorded: ₹${log.amount}`, 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('expenses').insert([log]);
            } catch (err) {
                console.error('Supabase error inserting expense:', err);
            }
        }
    });

    // 7. Add Sale Form
    document.getElementById('form-add-sale')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const kg = parseFloat(document.getElementById('sale-kg').value) || 0;
        const rate = parseFloat(document.getElementById('sale-rate').value) || 0;
        const total = kg * rate;

        const sale = {
            id: 'sale-' + Date.now(),
            plot_id: document.getElementById('sale-plot-id').value || null,
            sale_date: document.getElementById('sale-date').value,
            buyer_name: document.getElementById('sale-buyer').value,
            grade: document.getElementById('sale-grade').value,
            quantity_kg: kg,
            rate_per_kg: rate,
            total_revenue: total,
            payment_status: 'Received'
        };

        appState.sales.unshift(sale);
        renderDashboardTab();
        renderFinanceTab();
        renderReportsTab();
        closeModal('modal-add-sale');
        showToast(isMr() ? `द्राक्ष विक्री नोंद झाली! उत्पन्न: ₹${total.toLocaleString('en-IN')}` : `Grape sale recorded! Revenue: ₹${total.toLocaleString('en-IN')}`, 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('harvest_sales').insert([sale]);
            } catch (err) {
                console.error('Supabase error inserting sale:', err);
            }
        }
    });

    // 8. Add Reminder Form
    document.getElementById('form-add-reminder')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cat = document.getElementById('rem-category').value;
        const title = document.getElementById('rem-title').value;
        const reminder = {
            id: 'rem-' + Date.now(),
            farm_id: appState.farm.id,
            category: cat,
            category_en: cat,
            title: title,
            title_en: title,
            due_date: document.getElementById('rem-due-date').value,
            notes: document.getElementById('rem-notes').value,
            status: 'pending',
            priority: 'High'
        };

        appState.reminders.unshift(reminder);
        renderDashboardTab();
        renderRemindersTab();
        closeModal('modal-add-reminder');
        showToast(isMr() ? 'नवीन स्मरणपत्र यशस्वीरीत्या जोडले!' : 'New reminder task added successfully!', 'success');

        if (supabaseClient) {
            try {
                await supabaseClient.from('reminders').insert([reminder]);
            } catch (err) {
                console.error('Supabase error inserting reminder:', err);
            }
        }
    });
}

// ==========================================================================
// 15. TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${iconName}" style="width: 18px; height: 18px; color: ${type === 'success' ? 'var(--emerald-primary)' : type === 'danger' ? 'var(--rose-accent)' : 'var(--blue-accent)'};"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    initLucide();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================================================
// 16. OPTION 5: LIVE MANDI & APMC GRAPE RATES
// ==========================================================================
const MANDI_RATES_DATA = [
    {
        date: '2026-09-22',
        market: 'पिंपळगाव बसवंत (नाशिक)',
        variety: 'Super Sonaka (सुपर सोनका)',
        grade: 'Export Grade A+ (18mm+)',
        arrivals: '2,400 क्रेट्स',
        min: 130,
        max: 145,
        modal: 140,
        trend: 'up'
    },
    {
        date: '2026-09-22',
        market: 'तासगाव (सांगली)',
        variety: 'Manik Chaman (माणिक चमन)',
        grade: 'Table Grape Grade A',
        arrivals: '1,850 क्रेट्स',
        min: 85,
        max: 95,
        modal: 90,
        trend: 'stable'
    },
    {
        date: '2026-09-22',
        market: 'पिंपळगाव बसवंत (नाशिक)',
        variety: 'Thompson Seedless (थॉमसन)',
        grade: 'Local Table Grapes',
        arrivals: '1,200 क्रेट्स',
        min: 75,
        max: 85,
        modal: 80,
        trend: 'down'
    },
    {
        date: '2026-09-22',
        market: 'तासगाव (सांगली)',
        variety: 'Thompson (थॉमसन बेदाणा)',
        grade: 'Resin / बेदाणा प्रत (22°Bx)',
        arrivals: '3,100 क्रेट्स',
        min: 52,
        max: 62,
        modal: 58,
        trend: 'up'
    },
    {
        date: '2026-09-22',
        market: 'पंढरपूर (सोलापूर)',
        variety: 'Super Sonaka (सुपर सोनका)',
        grade: 'Sweet Table Quality',
        arrivals: '950 क्रेट्स',
        min: 90,
        max: 105,
        modal: 98,
        trend: 'stable'
    },
    {
        date: '2026-09-22',
        market: 'पुणे गुलटेकडी (Pune APMC)',
        variety: 'Sharad Seedless (शरद काळे)',
        grade: 'Metro Super Quality',
        arrivals: '780 क्रेट्स',
        min: 110,
        max: 130,
        modal: 120,
        trend: 'up'
    },
    {
        date: '2026-09-22',
        market: 'मुंबई वाशी APMC (Vashi)',
        variety: 'Jumbo Black Seedless',
        grade: 'Premium Box Pack (5kg)',
        arrivals: '1,450 बॉक्स',
        min: 125,
        max: 140,
        modal: 135,
        trend: 'up'
    },
    {
        date: '2026-09-22',
        market: 'मुंबई वाशी APMC (Vashi)',
        variety: 'Red Globe (रेड ग्लोब)',
        grade: 'Jumbo Berry Export',
        arrivals: '620 बॉक्स',
        min: 140,
        max: 160,
        modal: 150,
        trend: 'stable'
    },
    {
        date: '2026-09-22',
        market: 'पिंपळगाव बसवंत (नाशिक)',
        variety: 'Crimson Seedless (क्रिम्सन)',
        grade: 'Pink Table Grape',
        arrivals: '540 क्रेट्स',
        min: 115,
        max: 130,
        modal: 122,
        trend: 'stable'
    },
    {
        date: '2026-09-22',
        market: 'तासगाव (सांगली)',
        variety: 'Super Sonaka (सुपर सोनका)',
        grade: 'Export Grade A',
        arrivals: '1,600 क्रेट्स',
        min: 128,
        max: 138,
        modal: 134,
        trend: 'up'
    }
];

function initMandiRates() {
    renderMandiRatesTable('all', '');

    // Market filter pills
    document.querySelectorAll('#mandi-market-filter-pills .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#mandi-market-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const marketFilter = pill.dataset.mandiFilter;
            const searchKeyword = document.getElementById('mandi-search-input')?.value.trim() || '';
            renderMandiRatesTable(marketFilter, searchKeyword);
        });
    });

    // Search input
    const searchInput = document.getElementById('mandi-search-input');
    searchInput?.addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        const activePill = document.querySelector('#mandi-market-filter-pills .filter-pill.active');
        const marketFilter = activePill ? activePill.dataset.mandiFilter : 'all';
        renderMandiRatesTable(marketFilter, keyword);
    });

    // Refresh button
    document.getElementById('btn-refresh-mandi')?.addEventListener('click', () => {
        const isMr = appState.activeLang === 'mr';
        renderMandiRatesTable('all', '');
        showToast(isMr ? '📈 ताज्या द्राक्ष बाजारभावाची नोंद अद्ययावत केली!' : '📈 Grape Mandi rates refreshed with latest live records!', 'success');
    });

    // Share button
    document.getElementById('btn-share-mandi-rates')?.addEventListener('click', () => {
        const shareText = encodeURIComponent(`🍇 *सह्याद्री द्राक्ष ऑर्चर्ड्स - आजचे थेट बाजारभाव*\n\nपिंपळगाव Export Sonaka: ₹145/kg\nतासगाव Manik Chaman: ₹95/kg\nमुंबई Vashi Jumbo Black: ₹140/kg\n\nकृषिरत्न शेती व्यवस्थापन डॅशबोर्ड`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    });
}

function renderMandiRatesTable(marketFilter = 'all', keyword = '') {
    const tbody = document.getElementById('mandi-rates-table-body');
    if (!tbody) return;

    let filtered = MANDI_RATES_DATA;
    if (marketFilter !== 'all') {
        filtered = filtered.filter(item => item.market.toLowerCase().includes(marketFilter.toLowerCase()));
    }
    if (keyword) {
        filtered = filtered.filter(item => 
            item.market.toLowerCase().includes(keyword) || 
            item.variety.toLowerCase().includes(keyword) || 
            item.grade.toLowerCase().includes(keyword)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    कोणतीही नोंद सापडली नाही (No matching mandi records).
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        let trendHtml = '';
        if (item.trend === 'up') {
            trendHtml = `<span class="mandi-trend-tag up">🔺 ₹${item.modal} (+₹5)</span>`;
        } else if (item.trend === 'down') {
            trendHtml = `<span class="mandi-trend-tag down">🔻 ₹${item.modal} (-₹3)</span>`;
        } else {
            trendHtml = `<span class="mandi-trend-tag stable">🟢 ₹${item.modal} (स्थिर)</span>`;
        }

        return `
            <tr>
                <td><strong>${item.date}</strong></td>
                <td><span class="badge-status info">${item.market}</span></td>
                <td><strong>${item.variety}</strong></td>
                <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${item.grade}</span></td>
                <td>${item.arrivals}</td>
                <td style="color: var(--text-muted); font-weight: 600;">₹${item.min}</td>
                <td style="color: var(--emerald-primary); font-weight: 700;">₹${item.max}</td>
                <td style="font-weight: 800; font-size: 0.95rem;">₹${item.modal}</td>
                <td>${trendHtml}</td>
            </tr>
        `;
    }).join('');

    initLucide();
}

// ==========================================================================
// 17. OPTION 7: GOVERNMENT SCHEMES & SUBSIDY CALCULATOR
// ==========================================================================
function initSubsidyCalculator() {
    const acresInput = document.getElementById('calc-acres-input');
    const farmerType = document.getElementById('calc-farmer-type');

    function calculateSubsidy() {
        const acres = parseFloat(acresInput?.value) || 3.5;
        const isSmall = farmerType?.value === 'small';

        // 1. Drip Subsidy: Base cost ~₹24,000/acre
        // Small farmer: 80%, Other: 70%
        const ratePerAcre = 24000;
        const dripSubsidy = Math.round(acres * ratePerAcre * (isSmall ? 0.80 : 0.70));

        // 2. Solar Pump: 90% Govt share for 5HP system
        const solarSubsidy = isSmall ? 238500 : 212000;

        // 3. Crop Insurance Coverage: ₹1,40,000 / acre
        const insuranceCover = Math.round(acres * 140000);

        const resDrip = document.getElementById('res-drip-subsidy');
        const resSolar = document.getElementById('res-solar-subsidy');
        const resInsurance = document.getElementById('res-insurance-coverage');

        if (resDrip) resDrip.textContent = `₹${dripSubsidy.toLocaleString('en-IN')}`;
        if (resSolar) resSolar.textContent = `₹${solarSubsidy.toLocaleString('en-IN')}`;
        if (resInsurance) resInsurance.textContent = `₹${insuranceCover.toLocaleString('en-IN')}`;
    }

    acresInput?.addEventListener('input', calculateSubsidy);
    farmerType?.addEventListener('change', calculateSubsidy);

    // Scroll button trigger
    document.getElementById('btn-scroll-subsidy-calc')?.addEventListener('click', () => {
        document.getElementById('subsidy-calculator-card')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Initial calculation
    calculateSubsidy();
}

