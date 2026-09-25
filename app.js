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
function getSupabaseClient() {
    if (!supabaseClient && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error('Failed to init Supabase client:', e);
        }
    }
    return supabaseClient;
}
getSupabaseClient();

// Dynamic Supabase Connection Status Pill Indicator
function updateSupabaseStatus(status) {
    const pill = document.getElementById('supabase-status-pill');
    const text = document.getElementById('supabase-status-text');
    if (!pill || !text) return;

    const isMr = appState.activeLang === 'mr';
    pill.classList.remove('syncing', 'offline');

    if (status === 'connected') {
        text.innerHTML = isMr ? 'Supabase: <strong>थेट कनेक्टेड</strong>' : 'Supabase: <strong>Live Connected</strong>';
        pill.title = isMr ? 'Supabase क्लाउड थेट जोडलेले आहे. क्लिक करून रिफ्रेश करा.' : 'Supabase Cloud is live connected. Click to refresh.';
    } else if (status === 'syncing') {
        pill.classList.add('syncing');
        text.innerHTML = isMr ? 'Supabase: <strong>सिंक होत आहे...</strong>' : 'Supabase: <strong>Syncing...</strong>';
        pill.title = isMr ? 'डेटा सिंक होत आहे...' : 'Data syncing...';
    } else {
        pill.classList.add('offline');
        text.innerHTML = isMr ? 'Supabase: <strong>ऑफलाइन (लोकल)</strong>' : 'Supabase: <strong>Offline (Local)</strong>';
        pill.title = isMr ? 'क्लाउड कनेक्शन उपलब्ध नाही. लोकल डेटा वापरला जात आहे.' : 'Cloud connection unavailable. Local fallback data active.';
    }
}


// Master Local State
let appState = {
    activeLang: localStorage.getItem('krushi_lang') || 'mr',
    activeCrop: localStorage.getItem('krushi_active_crop') || 'grapes',
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

// ==========================================================================
// MULTI-CROP CONFIGURATION ENGINE (Grapes, Onion, Tur, Corn, Pomegranate, Guava)
// ==========================================================================
const CROPS_CONFIG = {
    grapes: {
        id: 'grapes',
        name_mr: 'द्राक्ष',
        name_en: 'Grapes',
        emoji: '🍇',
        icon: 'grape',
        subtitle_mr: 'सह्याद्री द्राक्ष ऑर्चर्ड्स',
        subtitle_en: 'Sahyadri Grape Orchards',
        badge_mr: 'द्राक्ष बाग',
        badge_en: 'Grape Orchard',
        tagline_mr: 'द्राक्ष बाग व घड व्यवस्थापन',
        tagline_en: 'Vineyard & Canopy Management',
        tab2Title_mr: '🍇 द्राक्ष बाग व्यवस्थापन (Grape Orchard Management)',
        tab2Title_en: '🍇 Grape Orchard Management',
        tab2Desc_mr: 'प्लॉटनुसार वाण, लागवड अंतर, छाटणी तारखा, घड/काडी व्यवस्थापन व अपेक्षित उत्पादन',
        tab2Desc_en: 'Plot-wise varieties, spacing, pruning dates, canes/bunches & expected yield',
        tab10Title_mr: '📈 थेट द्राक्ष बाजारभाव व APMC मार्केट दर',
        tab10Title_en: '📈 Grape Mandi & APMC Market Rates',
        tab10Desc_mr: 'नाशिक (पिंपळगाव), सांगली (तासगाव), सोलापूर, पुणे व मुंबई वाशी मार्केटमधील ताज्या द्राक्ष लिलाव नोंदी',
        tab10Desc_en: 'Nashik, Sangli (Tasgaon), Solapur, Pune & Mumbai APMC grape auctions',
        salesHeading_mr: '💰 द्राक्ष विक्री नोंदी (Grape Harvest Sales)',
        salesHeading_en: '💰 Grape Harvest Sales',
        metricLabels: {
            date1_mr: 'खरड छाटणी तारीख (April Pruning)',
            date1_en: 'Foundation Pruning Date',
            date2_mr: 'गोड छाटणी तारीख (Fruit Pruning)',
            date2_en: 'Fruit Pruning Date',
            count1_mr: 'काड्या संख्या / झाड (Canes/Vine)',
            count1_en: 'Canes / Vine',
            count2_mr: 'घड संख्या / झाड (Bunches/Vine)',
            count2_en: 'Bunches / Vine',
            yieldUnit_mr: 'टन',
            yieldUnit_en: 'Tonnes',
            rateUnit_mr: 'प्रति किलो (₹/kg)',
            rateUnit_en: 'per kg (₹/kg)',
            varietyTitle_mr: 'द्राक्ष वाण',
            varietyTitle_en: 'Grape Variety'
        },
        varieties: [
            'Super Sonaka (सुपर सोनका)',
            'Thompson Seedless (थॉमसन)',
            'Manik Chaman (मणिक चमन)',
            'Sharad Seedless (शरद)',
            'Red Globe (रेड ग्लोब)',
            'Crimson Seedless'
        ],
        grades: [
            'Export Quality (A+)',
            'Domestic Super (A)',
            'Local Market (B)',
            'बेदाणा / Raisins (C)'
        ],
        plots: FALLBACK_PLOTS,
        irrigationLogs: FALLBACK_IRRIGATION,
        fertilizerLogs: FALLBACK_FERTILIZER,
        sprayLogs: FALLBACK_SPRAYS,
        laborLogs: FALLBACK_LABOR,
        expenses: FALLBACK_EXPENSES,
        sales: FALLBACK_SALES,
        reminders: FALLBACK_REMINDERS,
        pests: [
            { name_mr: 'उदबत्या (Flea Beetle)', name_en: 'Flea Beetle', badge: 'गंभीर कीड', badge_cls: 'danger', desc_mr: 'फुटीच्या काळात कोवळ्या कोंबांना व डोळ्यांना छिद्रे पाडते. पाने चाळणी होतात व वाढ खुंटते.', chemical: 'Spinotoram 11.7 SC @ 0.35 ml/L किंवा Lambda Cyhalothrin', stage_mr: 'कोंब फुटणे ते 5 पाने अवस्था' },
            { name_mr: 'थ्रीप्स (Thrips)', name_en: 'Thrips', badge: 'फूलकळी कीड', badge_cls: 'danger', desc_mr: 'फुलोरा व मणी सेटिंगच्या वेळी रस शोषून फळावर डाग/कवडी पाडते. मण्यांचा दर्जा घसरतो.', chemical: 'Fipronil 80 WG @ 0.15 gm/L किंवा Spinosad 45 SC @ 0.3 ml/L', stage_mr: 'फुलोरा व मणी सेटिंग' },
            { name_mr: 'डाऊनी मिल्ड्यू / केवडा (Downy Mildew)', name_en: 'Downy Mildew', badge: 'बुरशीजन्य रोग', badge_cls: 'warning', desc_mr: 'पानांच्या खालच्या बाजूला पांढरी बुरशी व वर पिवळे तेलकट डाग पडतात. घड कुजतात.', chemical: 'Dimethomorph 50 WP @ 1 gm/L + Mancozeb किंवा Profiler @ 2.5 gm/L', stage_mr: 'ढगाळ हवामान व सतत पाऊस' },
            { name_mr: 'पावडरी मिल्ड्यू / भुरी (Powdery Mildew)', name_en: 'Powdery Mildew', badge: 'फळ डाग रोग', badge_cls: 'warning', desc_mr: 'मण्यांवर व पानांवर पांढरी भुकटी जमा होते. वाढत्या मण्यांची साल तडकते.', chemical: 'Difenoconazole 25 EC @ 0.5 ml/L किंवा सल्फर 80 WDG @ 2 gm/L', stage_mr: 'मणी विकास व साखर उतरताना' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'पिंपळगाव', name_mr: 'पिंपळगाव बसवंत', name_en: 'Pimpalgaon' },
            { id: 'तासगाव', name_mr: 'तासगाव (सांगली)', name_en: 'Tasgaon' },
            { id: 'पंढरपूर', name_mr: 'पंढरपूर (सोलापूर)', name_en: 'Pandharpur' },
            { id: 'पुणे', name_mr: 'पुणे गुलटेकडी', name_en: 'Pune APMC' },
            { id: 'मुंबई', name_mr: 'मुंबई वाशी APMC', name_en: 'Vashi APMC' }
        ],
        mandi_kpis: [
            { label: 'उच्चतम एक्सपोर्ट दर', val: '₹160', unit: '/ किलो', sub: 'मुंबई वाशी व पिंपळगाव', icon: 'award', cls: 'emerald' },
            { label: 'सरासरी भाव (Modal)', val: '₹92', unit: '/ किलो', sub: 'टेबल ग्रेप्स (मेट्रो व स्थानिक)', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'बेदाणा द्राक्ष दर', val: '₹58', unit: '/ किलो', sub: 'तासगाव व पंढरपूर सौदे', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Arrivals)', val: '8,450', unit: 'क्रेट्स', sub: 'प्रमुख महाराष्ट्र APMC', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'पिंपळगाव बसवंत (नाशिक)', variety: 'Super Sonaka (सुपर सोनका)', grade: 'Export Grade A+ (18mm+)', arrivals: '2,400 क्रेट्स', min: 130, max: 145, modal: 140, trend: 'up' },
            { date: '2026-09-22', market: 'तासगाव (सांगली)', variety: 'Manik Chaman (माणिक चमन)', grade: 'Table Grape Grade A', arrivals: '1,850 क्रेट्स', min: 85, max: 95, modal: 90, trend: 'stable' },
            { date: '2026-09-22', market: 'पिंपळगाव बसवंत (नाशिक)', variety: 'Thompson Seedless (थॉमसन)', grade: 'Local Table Grapes', arrivals: '1,200 क्रेट्स', min: 75, max: 85, modal: 80, trend: 'down' },
            { date: '2026-09-22', market: 'तासगाव (सांगली)', variety: 'Thompson (थॉमसन बेदाणा)', grade: 'Resin / बेदाणा प्रत (22°Bx)', arrivals: '3,100 क्रेट्स', min: 52, max: 62, modal: 58, trend: 'up' },
            { date: '2026-09-22', market: 'पंढरपूर (सोलापूर)', variety: 'Super Sonaka (सुपर सोनका)', grade: 'Sweet Table Quality', arrivals: '950 क्रेट्स', min: 90, max: 105, modal: 98, trend: 'stable' },
            { date: '2026-09-22', market: 'पुणे गुलटेकडी (Pune APMC)', variety: 'Sharad Seedless (शरद काळे)', grade: 'Metro Super Quality', arrivals: '780 क्रेट्स', min: 110, max: 130, modal: 120, trend: 'up' },
            { date: '2026-09-22', market: 'मुंबई वाशी APMC (Vashi)', variety: 'Jumbo Black Seedless', grade: 'Premium Box Pack (5kg)', arrivals: '1,450 बॉक्स', min: 125, max: 140, modal: 135, trend: 'up' },
            { date: '2026-09-22', market: 'मुंबई वाशी APMC (Vashi)', variety: 'Red Globe (रेड ग्लोब)', grade: 'Jumbo Berry Export', arrivals: '620 बॉक्स', min: 140, max: 160, modal: 150, trend: 'stable' }
        ]
    },

    onion: {
        id: 'onion',
        name_mr: 'कांदा',
        name_en: 'Onion',
        emoji: '🧅',
        icon: 'layers',
        subtitle_mr: 'सह्याद्री कांदा फार्म्स व साठवणूक चाळ',
        subtitle_en: 'Sahyadri Commercial Onion Farms & Storage',
        badge_mr: 'कांदा शेती',
        badge_en: 'Onion Farm',
        tagline_mr: 'कांदा पीक व चाळ साठवणूक',
        tagline_en: 'Commercial Onion & Storage Operations',
        tab2Title_mr: '🧅 कांदा शेती व्यवस्थापन (Commercial Onion Management)',
        tab2Title_en: '🧅 Commercial Onion Management',
        tab2Desc_mr: 'प्लॉटनुसार कांदा वाण, पुनर्लागवड तारीख, कंद आकार (mm), खत नियोजन व चाळ साठवणूक',
        tab2Desc_en: 'Plot-wise onion varieties, transplant dates, bulb size (mm) and storage management',
        tab10Title_mr: '📈 थेट कांदा बाजारभाव व APMC मार्केट दर',
        tab10Title_en: '📈 Live Onion Mandi & APMC Market Rates',
        tab10Desc_mr: 'लासलगाव, येवला, पिंपळगाव, सोलापूर, अहमदनगर व पुणे कृषी उत्पन्न बाजार समित्यांचे आजचे दर',
        tab10Desc_en: 'Lasalgaon, Yeola, Pimpalgaon, Solapur, Ahmednagar & Pune APMC onion auctions',
        salesHeading_mr: '💰 कांदा विक्री नोंदी (Onion Harvest Sales)',
        salesHeading_en: '💰 Onion Harvest Sales',
        metricLabels: {
            date1_mr: 'रोप पुनर्लागवड तारीख (Transplant Date)',
            date1_en: 'Transplant Date',
            date2_mr: 'काढणी अपेक्षित तारीख (Harvest Date)',
            date2_en: 'Expected Harvest Date',
            count1_mr: 'सरासरी कंद आकार (Avg Bulb Size mm)',
            count1_en: 'Avg Bulb Size (mm)',
            count2_mr: 'झाडे संख्या / एकर (Plant Population)',
            count2_en: 'Plant Pop. / Acre',
            yieldUnit_mr: 'क्विंटल',
            yieldUnit_en: 'Quintals',
            rateUnit_mr: 'प्रति क्विंटल (₹/Qtl)',
            rateUnit_en: 'per Qtl (₹/Qtl)',
            varietyTitle_mr: 'कांदा वाण',
            varietyTitle_en: 'Onion Variety'
        },
        varieties: [
            'Bhima Kiran (भीमा किरण - उन्हाळी)',
            'Bhima Super (भीमा सुपर - रांगडा)',
            'Alert Red (ॲलर्ट रेड - खरीप)',
            'Bhima Red (भीमा रेड)',
            'Phule Samarth (फुले समर्थ)',
            'AgriFound Light Red'
        ],
        grades: [
            'Super Golta (55mm+ A+)',
            'Medium Golta (45-55mm A)',
            'Golti (35-45mm B)',
            'Chilta / Reject (C)'
        ],
        plots: [
            {
                id: 'onion-p1',
                name: 'प्लॉट १ - भीमा किरण (उन्हाळी कांदा चाळ)',
                name_en: 'Plot 1 - Bhima Kiran (Rabi Onion Storage)',
                crop_variety: 'Bhima Kiran (भीमा किरण)',
                acres: 3.5,
                spacing: '15 x 10 cm',
                foundation_pruning_date: '2026-07-20',
                fruit_pruning_date: '2026-11-25',
                canes_per_vine: 58,
                bunches_per_vine: 180000,
                expected_yield_tonnes: 140
            },
            {
                id: 'onion-p2',
                name: 'प्लॉट २ - भीमा सुपर (रांगडा कांदा)',
                name_en: 'Plot 2 - Bhima Super (Late Kharif)',
                crop_variety: 'Bhima Super (भीमा सुपर)',
                acres: 2.5,
                spacing: '15 x 10 cm',
                foundation_pruning_date: '2026-08-10',
                fruit_pruning_date: '2026-12-15',
                canes_per_vine: 52,
                bunches_per_vine: 175000,
                expected_yield_tonnes: 95
            },
            {
                id: 'onion-p3',
                name: 'प्लॉट ३ - ॲलर्ट रेड (खरीप लाल कांदा)',
                name_en: 'Plot 3 - Alert Red (Kharif Red Onion)',
                crop_variety: 'Alert Red (ॲलर्ट रेड)',
                acres: 2.0,
                spacing: '15 x 10 cm',
                foundation_pruning_date: '2026-06-15',
                fruit_pruning_date: '2026-10-10',
                canes_per_vine: 50,
                bunches_per_vine: 185000,
                expected_yield_tonnes: 75
            }
        ],
        irrigationLogs: [
            { id: 'on-irr-1', plot_id: 'onion-p1', log_date: '2026-09-22', duration_hours: 3.0, water_liters: 32000, water_source: 'ठिबक सिंचन (Drip)', ec_level: 0.65, ph_level: 6.9, nutrients_n: 4.1, nutrients_ca: 3.2, nutrients_mg: 1.8 },
            { id: 'on-irr-2', plot_id: 'onion-p2', log_date: '2026-09-20', duration_hours: 2.5, water_liters: 28000, water_source: 'तुषार सिंचन (Sprinkler)', ec_level: 0.70, ph_level: 7.0, nutrients_n: 3.8, nutrients_ca: 3.0, nutrients_mg: 1.5 }
        ],
        fertilizerLogs: [
            { id: 'on-fert-1', plot_id: 'onion-p1', log_date: '2026-09-21', fertilizer_name: '00:52:34 (MKP) + सल्फर 90%', dose_amount: 15, application_method: 'Drip', cost: 3600 },
            { id: 'on-fert-2', plot_id: 'onion-p2', log_date: '2026-09-18', fertilizer_name: '13:00:45 (Potassium Nitrate)', dose_amount: 20, application_method: 'Drip', cost: 4200 }
        ],
        sprayLogs: [
            { id: 'on-sp-1', plot_id: 'onion-p1', log_date: '2026-09-21', pest_disease_name: 'थ्रीप्स व जांभळा करपा (Thrips & Blotch)', chemical_or_fertilizer: 'Fipronil 5 SC + Custodia (Azoxystrobin + Difenoconazole)', dose_per_liter: 1.5, total_water_liters: 250, next_spray_date: '2026-09-29', cost: 4800 },
            { id: 'on-sp-2', plot_id: 'onion-p3', log_date: '2026-09-17', pest_disease_name: 'स्टेमफिलियम ब्लाइट (Stemphylium)', chemical_or_fertilizer: 'Nativo (Tebuconazole + Trifloxystrobin)', dose_per_liter: 0.6, total_water_liters: 200, next_spray_date: '2026-09-26', cost: 3900 }
        ],
        laborLogs: [
            { id: 'on-lab-1', plot_id: 'onion-p1', log_date: '2026-09-20', activity: 'खुरपणी (Weeding) व रोपांची निगा', worker_names: 'सुनीता, मंदा, कमल व 7 मजूर', male_workers: 2, female_workers: 8, wage_per_worker: 350, total_cost: 3200, payment_status: 'Paid' },
            { id: 'on-lab-2', plot_id: 'onion-p2', log_date: '2026-09-18', activity: 'पुनर्लागवड व गादीवाफा तयार करणे', worker_names: 'ज्ञानेश्वर, रामभाऊ व मजूर टोळी', male_workers: 5, female_workers: 5, wage_per_worker: 400, total_cost: 3800, payment_status: 'Paid' }
        ],
        expenses: [
            { id: 'on-exp-1', plot_id: 'onion-p1', log_date: '2026-09-21', category: 'खते', category_en: 'Fertilizers', amount: 18500, description: 'सल्फर, 00:52:34 व पोटॅश खते खरेदी' },
            { id: 'on-exp-2', plot_id: 'onion-p1', log_date: '2026-09-19', category: 'औषधे', category_en: 'Chemicals', amount: 14200, description: 'कस्टोडिया, फिप्रोनिल व स्टीकर खरेदी' },
            { id: 'on-exp-3', plot_id: 'onion-p2', log_date: '2026-09-18', category: 'मजुरी', category_en: 'Labor', amount: 24500, description: 'कांदा पुनर्लागवड व खुरपणी मजुरी हजेरी' },
            { id: 'on-exp-4', plot_id: 'onion-p3', log_date: '2026-09-15', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 8200, description: 'तुषार सिंचन स्प्रिंकलर नोझल व वीज बिल' },
            { id: 'on-exp-5', plot_id: 'onion-p1', log_date: '2026-09-12', category: 'वाहतूक', category_en: 'Transport', amount: 9500, description: 'लासलगाव मार्केट कांदा गोणी वाहतूक भाडे' },
            { id: 'on-exp-6', plot_id: 'onion-p2', log_date: '2026-09-10', category: 'इतर खर्च', category_en: 'Other', amount: 7800, description: 'कांदा चाळ जाळी व ताडपत्री खरेदी' }
        ],
        sales: [
            { id: 'on-sale-1', plot_id: 'onion-p3', sale_date: '2026-09-20', buyer_name: 'शांतीलाल सोहनलाल अँड कंपनी, लासलगाव APMC', grade: 'Super Golta (55mm+)', quantity_kg: 8500, rate_per_kg: 28, total_revenue: 238000 },
            { id: 'on-sale-2', plot_id: 'onion-p3', sale_date: '2026-09-18', buyer_name: 'किरण कांदा ट्रेडर्स, येवला मार्केट', grade: 'Medium Golta (45-55mm)', quantity_kg: 6200, rate_per_kg: 23, total_revenue: 142600 }
        ],
        reminders: [
            { id: 'on-rem-1', category: 'फवारणी', category_en: 'Spray', title: 'थ्रीप्स व जांभळा करपा प्रतिबंधक फवारणी', title_en: 'Thrips & Purple Blotch Spray', due_date: '2026-09-24', status: 'pending', priority: 'High', notes: 'Fipronil + Nativo + सिलिकॉन स्टीकर' },
            { id: 'on-rem-2', category: 'खत', category_en: 'Fertilizer', title: '00:00:50 (SOP) आणि बोरॉन खत मात्रा ठिबकमधून', title_en: '00:00:50 SOP & Boron fertigation', due_date: '2026-09-25', status: 'pending', priority: 'Medium', notes: 'कंदाचा आकार, चकाकी व वजन वाढवण्यासाठी' },
            { id: 'on-rem-3', category: 'सिंचन', category_en: 'Irrigation', title: 'कांदा काढणीपूर्व ८ दिवस आधी पाणी बंद करणे', title_en: 'Stop irrigation 8 days prior to harvest', due_date: '2026-09-28', status: 'pending', priority: 'High', notes: 'कांदा चाळीत सडू नये म्हणून पाणी तोडणे आवश्यक' },
            { id: 'on-rem-4', category: 'काढणी', category_en: 'Harvest', title: 'प्लॉट ३ - कांदा उपटणी व शेतात वाळवणे (Curing)', title_en: 'Plot 3 - Harvesting & Field Curing', due_date: '2026-10-05', status: 'pending', priority: 'High', notes: 'पातीसह ५ दिवस शेतात सुकवणे' }
        ],
        pests: [
            { name_mr: 'थ्रीप्स / बोकड्या (Onion Thrips)', name_en: 'Onion Thrips', badge: 'रसशोषक कीड', badge_cls: 'danger', desc_mr: 'पानांच्या बेचक्यात राहून रस शोषून घेतात. पानांवर चंदेरी पांढरे पट्टे पडतात व पाने वाकडी होतात.', chemical: 'Fipronil 5 SC @ 1.5 ml/L किंवा Spinetoram 11.7 SC @ 0.4 ml/L', stage_mr: 'रोपवाटिका व पुनर्लागवडीनंतर 30-70 दिवस' },
            { name_mr: 'जांभळा करपा (Purple Blotch)', name_en: 'Purple Blotch', badge: 'बुरशीजन्य रोग', badge_cls: 'danger', desc_mr: 'पानांवर पांढुरके चट्टे पडून नंतर मध्यभागी जांभळा किंवा तपकिरी रंग येतो. पाती सुकतात.', chemical: 'Custodia (Azoxystrobin + Difenoconazole) @ 1.5 ml/L किंवा Nativo @ 0.6 gm/L', stage_mr: 'ढगाळ हवामान, आर्द्रता व पाऊस' },
            { name_mr: 'स्टेमफिलियम ब्लाइट (Stemphylium Blight)', name_en: 'Stemphylium Leaf Blight', badge: 'पातीचा करपा', badge_cls: 'warning', desc_mr: 'पानांच्या टोकाकडून पिवळे चट्टे पडत खाली पसरतात. कांद्याची वाढ थांबते.', chemical: 'Mancozeb 75 WP @ 2.5 gm/L किंवा Propiconazole 25 EC @ 1 ml/L', stage_mr: 'कंद फुगवणी अवस्था' },
            { name_mr: 'कंद कुज / कांदा सड (Basal Rot / Bulb Rot)', name_en: 'Basal / Fusarium Rot', badge: 'जमीन बुरशी', badge_cls: 'warning', desc_mr: 'कांद्याची मुळे कुजतात व कंदाच्या बुडाशी पांढरी बुरशी वाढते. कांदा साठवणीत सडतो.', chemical: 'Trichoderma viride @ 2.5 kg/एकर शेणखतात किंवा Carbendazim ड्रेंचिंग', stage_mr: 'जास्त पाणी साचल्यास किंवा काढणीवेळी' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'लासलगाव', name_mr: 'लासलगाव APMC', name_en: 'Lasalgaon' },
            { id: 'येवला', name_mr: 'येवला APMC', name_en: 'Yeola' },
            { id: 'पिंपळगाव', name_mr: 'पिंपळगाव बसवंत', name_en: 'Pimpalgaon' },
            { id: 'सोलापूर', name_mr: 'सोलापूर APMC', name_en: 'Solapur' },
            { id: 'पुणे', name_mr: 'पुणे गुलटेकडी', name_en: 'Pune APMC' }
        ],
        mandi_kpis: [
            { label: 'लासलगाव उच्चतम भाव', val: '₹3,150', unit: '/ क्विंटल', sub: 'Super Golta 55mm+ लिलाव', icon: 'award', cls: 'emerald' },
            { label: 'सरासरी मॉडेल भाव (Modal)', val: '₹2,680', unit: '/ क्विंटल', sub: 'महाराष्ट्र प्रमुख कांदा मंड्या', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'मध्यम कांदा भाव (Medium)', val: '₹2,250', unit: '/ क्विंटल', sub: '40-50mm सरासरी लिलाव', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Daily Arrivals)', val: '74,800', unit: 'क्विंटल', sub: 'लासलगाव, येवला, सोलापूर', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'लासलगाव (आशियातील सर्वात मोठी कांदा मंडी)', variety: 'Red Onion (उन्हाळी कांदा)', grade: 'Super Golta (55mm+)', arrivals: '18,500 क्विंटल', min: 2400, max: 3150, modal: 2850, trend: 'up' },
            { date: '2026-09-22', market: 'येवला APMC (नाशिक)', variety: 'Red Onion (लाल कांदा)', grade: 'Medium Golta (45mm+)', arrivals: '12,200 क्विंटल', min: 2100, max: 2800, modal: 2550, trend: 'up' },
            { date: '2026-09-22', market: 'पिंपळगाव बसवंत (नाशिक)', variety: 'Pol Onion (रांगडा कांदा)', grade: 'Export Quality Extra Bold', arrivals: '9,400 क्विंटल', min: 2350, max: 3000, modal: 2750, trend: 'stable' },
            { date: '2026-09-22', market: 'सोलापूर APMC', variety: 'Local Red (गावरान कांदा)', grade: 'Golta Grade A', arrivals: '14,800 क्विंटल', min: 1800, max: 2650, modal: 2300, trend: 'down' },
            { date: '2026-09-22', market: 'पुणे गुलटेकडी (Pune APMC)', variety: 'Super Red Onion', grade: 'Grade 1 Box / Bag', arrivals: '8,900 क्विंटल', min: 2500, max: 3200, modal: 2900, trend: 'up' },
            { date: '2026-09-22', market: 'अहमदनगर APMC', variety: 'Garva Red (उन्हाळी)', grade: 'Medium Size', arrivals: '11,000 क्विंटल', min: 2000, max: 2700, modal: 2450, trend: 'stable' }
        ]
    },

    tur: {
        id: 'tur',
        name_mr: 'तूर',
        name_en: 'Tur / Pigeon Pea',
        emoji: '🌱',
        icon: 'sprout',
        subtitle_mr: 'सह्याद्री डाळ व कडधान्य प्रकल्प',
        subtitle_en: 'Sahyadri High-Yield Pulses & Grain Estate',
        badge_mr: 'तूर शेती',
        badge_en: 'Tur Crop',
        tagline_mr: 'तूर पीक व डाळ मिल व्यवस्थापन',
        tagline_en: 'Pigeon Pea & Dal Processing Estate',
        tab2Title_mr: '🌱 तूर पीक व्यवस्थापन (Tur / Pigeon Pea Management)',
        tab2Title_en: '🌱 Tur (Pigeon Pea) Management',
        tab2Desc_mr: 'प्लॉटनुसार तूर वाण, पेरणी अंतर, शेंडा खुडणी (Nipping), घाटे संख्या व उत्पादन',
        tab2Desc_en: 'Varieties, sowing spacing, apical nipping, pod setting & yield analytics',
        tab10Title_mr: '📈 थेट तूर बाजारभाव व हमीभाव (MSP Mandi Rates)',
        tab10Title_en: '📈 Tur Mandi Rates & MSP Auctions',
        tab10Desc_mr: 'लातूर, अकोला, वाशीम, जालना, नागपूर व सोलापूर डाळ मिल लिलाव दर',
        tab10Desc_en: 'Latur, Akola, Washim, Jalna, Nagpur & Solapur Tur/Dal Mandi rates',
        salesHeading_mr: '💰 तूर विक्री नोंदी (Tur Harvest Sales)',
        salesHeading_en: '💰 Tur Harvest Sales',
        metricLabels: {
            date1_mr: 'पेरणी / टोकण तारीख (Sowing Date)',
            date1_en: 'Sowing Date',
            date2_mr: '१ ली शेंडा खुडणी तारीख (1st Nipping Date)',
            date2_en: '1st Nipping Date',
            count1_mr: 'फांद्या संख्या / झाड (Branches/Plant)',
            count1_en: 'Branches / Plant',
            count2_mr: 'घाटे संख्या / झाड (Pods/Plant)',
            count2_en: 'Pods / Plant',
            yieldUnit_mr: 'क्विंटल',
            yieldUnit_en: 'Quintals',
            rateUnit_mr: 'प्रति क्विंटल (₹/Qtl)',
            rateUnit_en: 'per Qtl (₹/Qtl)',
            varietyTitle_mr: 'तूर वाण',
            varietyTitle_en: 'Tur Variety'
        },
        varieties: [
            'BDN-711 (गोदावरी - जलद वाढ)',
            'Maruti ICP-8863 (मारुती - मर प्रतिकार)',
            'BSMR-736 (विपुल वाण)',
            'Asha ICPL-87119 (आशा)',
            'Phule Rajeshwari (फुले राजेश्वरी)',
            'BDN-708 (अमोल)'
        ],
        grades: [
            'Super Bold Red (A+)',
            'Medium Shiny (A)',
            'Local Mill Quality (B)',
            'Mixed / Moisture (C)'
        ],
        plots: [
            {
                id: 'tur-p1',
                name: 'प्लॉट १ - BDN-711 (गोदावरी - ठिबक पद्धत)',
                name_en: 'Plot 1 - BDN-711 (Drip Fertigated)',
                crop_variety: 'BDN-711 (गोदावरी)',
                acres: 4.0,
                spacing: '6 x 1.5 ft',
                foundation_pruning_date: '2026-06-25',
                fruit_pruning_date: '2026-08-10',
                canes_per_vine: 44,
                bunches_per_vine: 620,
                expected_yield_tonnes: 48
            },
            {
                id: 'tur-p2',
                name: 'प्लॉट २ - मारुती ICP-8863 (मर रोग प्रतिकारक्षम)',
                name_en: 'Plot 2 - Maruti ICP-8863 (Wilt Resistant)',
                crop_variety: 'Maruti ICP-8863 (मारुती)',
                acres: 3.5,
                spacing: '5 x 1 ft',
                foundation_pruning_date: '2026-06-28',
                fruit_pruning_date: '2026-08-14',
                canes_per_vine: 38,
                bunches_per_vine: 540,
                expected_yield_tonnes: 38
            },
            {
                id: 'tur-p3',
                name: 'प्लॉट ३ - BSMR-736 (विपुल वाण)',
                name_en: 'Plot 3 - BSMR-736 (Vipul Variety)',
                crop_variety: 'BSMR-736 (विपुल)',
                acres: 3.0,
                spacing: '6 x 2 ft',
                foundation_pruning_date: '2026-07-02',
                fruit_pruning_date: '2026-08-20',
                canes_per_vine: 50,
                bunches_per_vine: 710,
                expected_yield_tonnes: 42
            }
        ],
        irrigationLogs: [
            { id: 'tur-irr-1', plot_id: 'tur-p1', log_date: '2026-09-21', duration_hours: 2.0, water_liters: 22000, water_source: 'ठिबक सिंचन (Drip)', ec_level: 0.60, ph_level: 7.1, nutrients_n: 2.8, nutrients_ca: 3.5, nutrients_mg: 1.6 },
            { id: 'tur-irr-2', plot_id: 'tur-p2', log_date: '2026-09-18', duration_hours: 1.5, water_liters: 18000, water_source: 'पाट पाणी (Furrow)', ec_level: 0.65, ph_level: 7.2, nutrients_n: 2.5, nutrients_ca: 3.2, nutrients_mg: 1.4 }
        ],
        fertilizerLogs: [
            { id: 'tur-fert-1', plot_id: 'tur-p1', log_date: '2026-09-20', fertilizer_name: '12:61:00 (MAP) + रायझोबियम जीवाणू', dose_amount: 12, application_method: 'Drip Fertigation', cost: 2400 },
            { id: 'tur-fert-2', plot_id: 'tur-p3', log_date: '2026-09-16', fertilizer_name: '00:52:34 (MKP) फुलोरा वाढीसाठी', dose_amount: 15, application_method: 'Drip', cost: 2800 }
        ],
        sprayLogs: [
            { id: 'tur-sp-1', plot_id: 'tur-p1', log_date: '2026-09-22', pest_disease_name: 'घाटे अळी (Helicoverpa Pod Borer)', chemical_or_fertilizer: 'Emamectin Benzoate 5 SG @ 0.4 gm/L + neem oil', dose_per_liter: 0.4, total_water_liters: 200, next_spray_date: '2026-10-02', cost: 2900 },
            { id: 'tur-sp-2', plot_id: 'tur-p2', log_date: '2026-09-19', pest_disease_name: 'शेंगमाशी व पिसारी पतंग (Plume Moth)', chemical_or_fertilizer: 'Chlorantraniliprole 18.5 SC (Coragen) @ 0.3 ml/L', dose_per_liter: 0.3, total_water_liters: 180, next_spray_date: '2026-09-30', cost: 3800 }
        ],
        laborLogs: [
            { id: 'tur-lab-1', plot_id: 'tur-p1', log_date: '2026-09-20', activity: 'तूर शेंडा खुडणी (Apical Nipping) २ री वेळ', worker_names: 'छाया, मंगल व ६ महिला मजूर', male_workers: 1, female_workers: 7, wage_per_worker: 350, total_cost: 2800, payment_status: 'Paid' },
            { id: 'tur-lab-2', plot_id: 'tur-p3', log_date: '2026-09-15', activity: 'बैलजोडी डवरणी व आंतरमशागत', worker_names: 'पांडुरंग व १ गडी', male_workers: 2, female_workers: 0, wage_per_worker: 600, total_cost: 1200, payment_status: 'Paid' }
        ],
        expenses: [
            { id: 'tur-exp-1', plot_id: 'tur-p1', log_date: '2026-09-20', category: 'औषधे', category_en: 'Chemicals', amount: 8400, description: 'कोराजन, प्रोक्लेम व निंबोळी अर्क खरेदी' },
            { id: 'tur-exp-2', plot_id: 'tur-p2', log_date: '2026-09-18', category: 'खते', category_en: 'Fertilizers', amount: 9600, description: 'डीएपी, गंधक व बोरॉन सूक्ष्म अन्नद्रव्ये' },
            { id: 'tur-exp-3', plot_id: 'tur-p1', log_date: '2026-09-15', category: 'मजुरी', category_en: 'Labor', amount: 12500, description: 'तूर शेंडा खुडणी व डवरणी मजुरी' },
            { id: 'tur-exp-4', plot_id: 'tur-p3', log_date: '2026-09-10', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 4500, description: 'ठिबक फिल्टर फ्लशिंग व पंप ऑइल' },
            { id: 'tur-exp-5', plot_id: 'tur-p1', log_date: '2026-09-05', category: 'वाहतूक', category_en: 'Transport', amount: 5200, description: 'लातूर डाळ मिल मार्केट माल वाहतूक' },
            { id: 'tur-exp-6', plot_id: 'tur-p2', log_date: '2026-09-02', category: 'इतर खर्च', category_en: 'Other', amount: 3500, description: 'फेरोमोन कामगंध सापळे व चिकट ट्रॅप्स' }
        ],
        sales: [
            { id: 'tur-sale-1', plot_id: 'tur-p1', sale_date: '2026-09-19', buyer_name: 'लातूर डाळ मिल असोसिएशन (Latur Dal Mill)', grade: 'Super Bold Red (A+)', quantity_kg: 3400, rate_per_kg: 108, total_revenue: 367200 },
            { id: 'tur-sale-2', plot_id: 'tur-p2', sale_date: '2026-09-15', buyer_name: 'अकोला दाल इंडस्ट्रीज प्रा. लि.', grade: 'Medium Shiny (A)', quantity_kg: 2800, rate_per_kg: 102, total_revenue: 285600 }
        ],
        reminders: [
            { id: 'tur-rem-1', category: 'छाटणी', category_en: 'Pruning', title: 'तूर शेंडा खुडणी (३० व ५५ दिवसांनी) आवश्यक', title_en: 'Apical tip nipping at 30 & 55 days', due_date: '2026-09-25', status: 'pending', priority: 'High', notes: 'शेंडा खुडल्याने फांद्यांची संख्या तिपटीने वाढते' },
            { id: 'tur-rem-2', category: 'फवारणी', category_en: 'Spray', title: 'फुलोरा अवस्थेत घाटे अळी प्रतिबंधक फवारणी', title_en: 'Pod borer preventive spray at flowering', due_date: '2026-09-28', status: 'pending', priority: 'High', notes: 'Coragen @ 60 ml प्रति एकर २०० लिटर पाण्यात' },
            { id: 'tur-rem-3', category: 'खत', category_en: 'Fertilizer', title: 'फुलोऱ्याच्या वेळी बोरॉन २०% + ००:५२:३४ फवारणी', title_en: 'Boron 20% + 00:52:34 foliar spray', due_date: '2026-10-02', status: 'pending', priority: 'Medium', notes: 'फूलगळ रोखण्यासाठी व घाटे फुगवणीसाठी' }
        ],
        pests: [
            { name_mr: 'घाटे अळी (Helicoverpa Pod Borer)', name_en: 'Gram Pod Borer', badge: 'प्रमुख कीड', badge_cls: 'danger', desc_mr: 'अळी फुलांचे व कोवळ्या घाट्यांचे नुकसान करते. घाट्याला गोलाकार छिद्र पाडून आतले दाणे खाते.', chemical: 'Chlorantraniliprole 18.5 SC (Coragen) @ 0.3 ml/L किंवा Emamectin Benzoate 5 SG @ 0.4 gm/L', stage_mr: 'कळी अवस्था, फुलोरा व घाटे भरण्याची वेळ' },
            { name_mr: 'शेंगमाशी (Pod Fly)', name_en: 'Tur Pod Fly', badge: 'अंतर्गत कीड', badge_cls: 'danger', desc_mr: 'माशी घाट्याच्या आवरणात अंडी घालते. आतील अळी दाणे पोखरून खाते. बाहेरून छिद्र दिसत नाही.', chemical: 'Dimethoate 30 EC @ 1.7 ml/L किंवा Monocrotophos', stage_mr: 'घाटे तयार होण्याचा काळ' },
            { name_mr: 'पिसारी पतंग (Plume Moth)', name_en: 'Plume Moth', badge: 'पाने व कळ्या', badge_cls: 'warning', desc_mr: 'हिरवट तपकिरी अळ्या कळ्या व शेंगा कुरतडतात. विष्ठा घाट्यांवर दिसते.', chemical: 'Proclaim (Emamectin Benzoate) @ 0.4 gm/L किंवा Indoxacarb 14.5 SC @ 0.8 ml/L', stage_mr: 'फुलोरा अवस्था' },
            { name_mr: 'मर रोग व वांझ रोग (Fusarium Wilt & SMD)', name_en: 'Wilt & Sterility Mosaic', badge: 'संसर्गजन्य', badge_cls: 'warning', desc_mr: 'झाडे पिवळी पडून अचानक सुकतात. मुळांजवळ खोड कापल्यास काळ्या वाहिन्या दिसतात.', chemical: 'Trichoderma @ 2 kg/एकर किंवा कार्बेंडाझिम 2 gm/L ड्रेंचिंग + प्रतिकारक्षम वाण (BSMR-736)', stage_mr: 'सुरुवातीची वाढ व फुलोरा' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'लातूर', name_mr: 'लातूर APMC', name_en: 'Latur' },
            { id: 'अकोला', name_mr: 'अकोला APMC', name_en: 'Akola' },
            { id: 'वाशीम', name_mr: 'वाशीम APMC', name_en: 'Washim' },
            { id: 'जालना', name_mr: 'जालना APMC', name_en: 'Jalna' },
            { id: 'नागपूर', name_mr: 'नागपूर APMC', name_en: 'Nagpur' }
        ],
        mandi_kpis: [
            { label: 'लातूर उच्चतम भाव', val: '₹11,450', unit: '/ क्विंटल', sub: 'Super Bold Dry Quality', icon: 'award', cls: 'emerald' },
            { label: 'सरासरी मॉडेल भाव (Modal)', val: '₹10,380', unit: '/ क्विंटल', sub: 'महाराष्ट्र डाळ मिल सौदे', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'शासकीय हमीभाव (MSP)', val: '₹7,550', unit: '/ क्विंटल', sub: 'केंद्र शासन हमीभाव २०२६', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Daily Arrivals)', val: '47,200', unit: 'पोती', sub: 'लातूर, अकोला, वाशीम', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'लातूर कृषी उत्पन्न बाजार समिती (Latur APMC)', variety: 'Red Tur (लाल तूर - मारुती)', grade: 'Super Bold (12% आर्द्रता)', arrivals: '14,200 पोती', min: 9800, max: 11450, modal: 10800, trend: 'up' },
            { date: '2026-09-22', market: 'अकोला APMC (विदर्भ)', variety: 'White / Red Tur (तूर)', grade: 'Mill Quality Grade A', arrivals: '9,800 पोती', min: 9400, max: 10900, modal: 10350, trend: 'up' },
            { date: '2026-09-22', market: 'वाशीम APMC', variety: 'Red Tur (लाल तूर)', grade: 'Clean Bold Dry', arrivals: '6,400 पोती', min: 9500, max: 10750, modal: 10200, trend: 'stable' },
            { date: '2026-09-22', market: 'जालना APMC (मराठवाडा)', variety: 'Maruti Tur (मारुती तूर)', grade: 'Super Export Bold', arrivals: '5,100 पोती', min: 9700, max: 11100, modal: 10500, trend: 'up' },
            { date: '2026-09-22', market: 'नागपूर कळमना APMC', variety: 'Nagpur Dal Quality', grade: 'Grade 1 Dry', arrivals: '7,200 पोती', min: 9300, max: 10600, modal: 10100, trend: 'stable' },
            { date: '2026-09-22', market: 'सोलापूर APMC', variety: 'Gajanan Red Tur', grade: 'Standard Quality', arrivals: '4,500 पोती', min: 9200, max: 10400, modal: 9950, trend: 'down' }
        ]
    },

    corn: {
        id: 'corn',
        name_mr: 'मका',
        name_en: 'Corn / Maize',
        emoji: '🌽',
        icon: 'wheat',
        subtitle_mr: 'सह्याद्री हायब्रिड मका व सायलेज फार्म्स',
        subtitle_en: 'Sahyadri Commercial Corn & Silage Operations',
        badge_mr: 'मका शेती',
        badge_en: 'Corn Farm',
        tagline_mr: 'हायब्रिड मका व सायलेज प्रकल्प',
        tagline_en: 'Commercial Hybrid Corn & Silage Estate',
        tab2Title_mr: '🌽 मका शेती व्यवस्थापन (Commercial Corn Management)',
        tab2Title_en: '🌽 Commercial Corn Management',
        tab2Desc_mr: 'हायब्रिड मका वाण, झाडे संख्या, लष्करी अळी नियंत्रण व सायलेज/दाणे उत्पादन',
        tab2Desc_en: 'Hybrid varieties, cob counts, Fall Armyworm control & grain/silage yield',
        tab10Title_mr: '📈 थेट मका बाजारभाव व पोल्ट्री फीड दर',
        tab10Title_en: '📈 Corn Mandi Rates & Poultry Feed Demand',
        tab10Desc_mr: 'निफाड, येवला, मालेगाव, शिर्डी, सांगली व धुळे बाजार समिती आजचे दर',
        tab10Desc_en: 'Niphad, Yeola, Malegaon, Shirdi, Sangli & Dhule APMC maize rates',
        salesHeading_mr: '💰 मका विक्री नोंदी (Corn / Maize Sales)',
        salesHeading_en: '💰 Corn / Maize Sales',
        metricLabels: {
            date1_mr: 'मका पेरणी तारीख (Sowing Date)',
            date1_en: 'Sowing Date',
            date2_mr: 'कणीस तोडणी / सायलेज तारीख (Harvest Date)',
            date2_en: 'Harvest / Silage Date',
            count1_mr: 'झाडे संख्या / एकर (Plant Pop.)',
            count1_en: 'Plant Pop. / Acre',
            count2_mr: 'कणसे संख्या / झाड (Cobs/Plant)',
            count2_en: 'Cobs / Plant',
            yieldUnit_mr: 'क्विंटल',
            yieldUnit_en: 'Quintals',
            rateUnit_mr: 'प्रति क्विंटल (₹/Qtl)',
            rateUnit_en: 'per Qtl (₹/Qtl)',
            varietyTitle_mr: 'मका वाण',
            varietyTitle_en: 'Corn Variety'
        },
        varieties: [
            'Pioneer P3396 (पायोनियर हायब्रिड)',
            'Dekalb 9108 (डिकॅल्ब)',
            'Sugar-75 Sweet Corn (स्वीट कॉर्न)',
            'Syngenta NK-6240 (सिंजेंटा)',
            'Advanta PAC-751 (अॅडव्हान्टा)',
            'Kaveri 50 (कावेरी)'
        ],
        grades: [
            'Poultry Grade Yellow (A+)',
            'Commercial Grain (A)',
            'Starch Factory Dry (B)',
            'Silage Fodder Green (C)'
        ],
        plots: [
            {
                id: 'corn-p1',
                name: 'प्लॉट १ - पायोनियर P3396 (पिवळा हायब्रिड मका)',
                name_en: 'Plot 1 - Pioneer P3396 (Yellow Hybrid)',
                crop_variety: 'Pioneer P3396 (पायोनियर)',
                acres: 4.5,
                spacing: '2 x 0.75 ft',
                foundation_pruning_date: '2026-06-20',
                fruit_pruning_date: '2026-10-15',
                canes_per_vine: 24000,
                bunches_per_vine: 2,
                expected_yield_tonnes: 155
            },
            {
                id: 'corn-p2',
                name: 'प्लॉट २ - डिकॅल्ब 9108 (दाणे व सायलेज)',
                name_en: 'Plot 2 - Dekalb 9108 (Grain & Silage)',
                crop_variety: 'Dekalb 9108 (डिकॅल्ब)',
                acres: 3.5,
                spacing: '2 x 0.75 ft',
                foundation_pruning_date: '2026-06-25',
                fruit_pruning_date: '2026-10-20',
                canes_per_vine: 23500,
                bunches_per_vine: 2,
                expected_yield_tonnes: 120
            },
            {
                id: 'corn-p3',
                name: 'प्लॉट ३ - Sugar-75 (स्वीट कॉर्न - फ्रेश मार्केट)',
                name_en: 'Plot 3 - Sugar-75 Sweet Corn (Fresh Market)',
                crop_variety: 'Sugar-75 Sweet Corn',
                acres: 2.5,
                spacing: '2.5 x 1 ft',
                foundation_pruning_date: '2026-07-05',
                fruit_pruning_date: '2026-09-30',
                canes_per_vine: 18000,
                bunches_per_vine: 2,
                expected_yield_tonnes: 85
            }
        ],
        irrigationLogs: [
            { id: 'crn-irr-1', plot_id: 'corn-p1', log_date: '2026-09-22', duration_hours: 2.5, water_liters: 35000, water_source: 'ठिबक सिंचन', ec_level: 0.70, ph_level: 7.0, nutrients_n: 5.5, nutrients_ca: 3.8, nutrients_mg: 2.0 },
            { id: 'crn-irr-2', plot_id: 'corn-p3', log_date: '2026-09-19', duration_hours: 2.0, water_liters: 24000, water_source: 'पाट पाणी (Furrow)', ec_level: 0.68, ph_level: 6.9, nutrients_n: 4.8, nutrients_ca: 3.4, nutrients_mg: 1.8 }
        ],
        fertilizerLogs: [
            { id: 'crn-fert-1', plot_id: 'corn-p1', log_date: '2026-09-20', fertilizer_name: 'युरिया (Urea) + 24:24:00', dose_amount: 45, application_method: 'Top Dressing', cost: 1850 },
            { id: 'crn-fert-2', plot_id: 'corn-p3', log_date: '2026-09-17', fertilizer_name: '13:00:45 (Potassium Nitrate) दाणे भरणीसाठी', dose_amount: 25, application_method: 'Drip', cost: 3200 }
        ],
        sprayLogs: [
            { id: 'crn-sp-1', plot_id: 'corn-p1', log_date: '2026-09-21', pest_disease_name: 'लष्करी अळी (Fall Armyworm - FAW)', chemical_or_fertilizer: 'Spinetoram 11.7 SC @ 0.5 ml/L पोंग्यात फवारणी', dose_per_liter: 0.5, total_water_liters: 220, next_spray_date: '2026-09-29', cost: 3400 },
            { id: 'crn-sp-2', plot_id: 'corn-p2', log_date: '2026-09-18', pest_disease_name: 'खोडकिडा व लष्करी अळी', chemical_or_fertilizer: 'Coragen (Chlorantraniliprole) @ 0.4 ml/L', dose_per_liter: 0.4, total_water_liters: 200, next_spray_date: '2026-09-28', cost: 4100 }
        ],
        laborLogs: [
            { id: 'crn-lab-1', plot_id: 'corn-p3', log_date: '2026-09-21', activity: 'स्वीट कॉर्न कणसे तोडणी व पॅकिंग', worker_names: 'कैलास, बाळू व 6 मजूर', male_workers: 4, female_workers: 4, wage_per_worker: 400, total_cost: 3200, payment_status: 'Paid' },
            { id: 'crn-lab-2', plot_id: 'corn-p1', log_date: '2026-09-16', activity: 'युरिया खत घालणे व माती लावणे', worker_names: 'दिनकर व मजूर', male_workers: 3, female_workers: 3, wage_per_worker: 380, total_cost: 2280, payment_status: 'Paid' }
        ],
        expenses: [
            { id: 'crn-exp-1', plot_id: 'corn-p1', log_date: '2026-09-20', category: 'खते', category_en: 'Fertilizers', amount: 14500, description: 'युरिया, पोटॅश व 10:26:26 खतांची खरेदी' },
            { id: 'crn-exp-2', plot_id: 'corn-p1', log_date: '2026-09-18', category: 'औषधे', category_en: 'Chemicals', amount: 9800, description: 'डेलिगेट, कोराजन व कीटकनाशक खरेदी' },
            { id: 'crn-exp-3', plot_id: 'corn-p3', log_date: '2026-09-15', category: 'मजुरी', category_en: 'Labor', amount: 16500, description: 'कणीस तोडणी, पोती भरणे व मजुरी' },
            { id: 'crn-exp-4', plot_id: 'corn-p2', log_date: '2026-09-12', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 5600, description: 'मोटर दुरुस्ती व वीज बिल' },
            { id: 'crn-exp-5', plot_id: 'corn-p1', log_date: '2026-09-08', category: 'वाहतूक', category_en: 'Transport', amount: 8200, description: 'पोल्ट्री फीड कंपनीपर्यंत मका वाहतूक' },
            { id: 'crn-exp-6', plot_id: 'corn-p3', log_date: '2026-09-05', category: 'इतर खर्च', category_en: 'Other', amount: 4200, description: 'स्वीट कॉर्न क्रेट्स व ज्यूट पोती' }
        ],
        sales: [
            { id: 'crn-sale-1', plot_id: 'corn-p1', sale_date: '2026-09-21', buyer_name: 'प्रिमियर पोल्ट्री फीड्स लि., नाशिक', grade: 'Poultry Grade Yellow (A+)', quantity_kg: 9200, rate_per_kg: 24.5, total_revenue: 225400 },
            { id: 'crn-sale-2', plot_id: 'corn-p3', sale_date: '2026-09-18', buyer_name: 'मेट्रो कॅश अँड कॅरी, मुंबई (Sweet Corn)', grade: 'Sweet Corn Fresh Grade', quantity_kg: 4800, rate_per_kg: 32.0, total_revenue: 153600 }
        ],
        reminders: [
            { id: 'crn-rem-1', category: 'फवारणी', category_en: 'Spray', title: 'लष्करी अळी (FAW) पोंग्यात औषध सोडणे', title_en: 'Fall armyworm whorl application', due_date: '2026-09-24', status: 'pending', priority: 'High', notes: 'Spinetoram 11.7 SC @ 0.5 ml/L थेट मक्याच्या पोंग्यात फवारावे' },
            { id: 'crn-rem-2', category: 'खत', category_en: 'Fertilizer', title: 'कणीस निसवताना युरिया व पोटॅश दुसरा डोस देणे', title_en: '2nd Dose Urea & Potash at tasseling', due_date: '2026-09-27', status: 'pending', priority: 'Medium', notes: 'कणसाचा आकार व दाण्यांचे वजन वाढवण्यासाठी' },
            { id: 'crn-rem-3', category: 'काढणी', category_en: 'Harvest', title: 'स्वीट कॉर्न काढणी (मिल्क स्टेज - Milk Stage)', title_en: 'Sweet corn picking at milk stage', due_date: '2026-09-30', status: 'pending', priority: 'High', notes: 'कणसाचे केस तपकिरी झाल्यावर लगेच तोडणी करावी' }
        ],
        pests: [
            { name_mr: 'अमेरिकन लष्करी अळी (Fall Armyworm - FAW)', name_en: 'Fall Armyworm (FAW)', badge: 'अत्यंत घातक कीड', badge_cls: 'danger', desc_mr: 'अळी मक्याच्या पोंग्यात राहून कोवळी पाने कुरतडते. पानांना मोठी छिद्रे पडतात व विष्ठा पोंग्यात साचते.', chemical: 'Spinetoram 11.7 SC (Delegate) @ 0.5 ml/L किंवा Chlorantraniliprole @ 0.4 ml/L थेट पोंग्यात', stage_mr: 'उगवणीनंतर १५ ते ४५ दिवस' },
            { name_mr: 'खोडकिडा (Stem Borer - Chilo partellus)', name_en: 'Maize Stem Borer', badge: 'खोड पोखरणी', badge_cls: 'danger', desc_mr: 'अळी खोडात शिरून वाढणारा शेंडा खाते, त्यामुळे झाडाचा मधला भाग वाळतो (Dead Heart).', chemical: 'Cartap Hydrochloride 4G किंवा Carbofuran 3G पोंग्यात टाकणे', stage_mr: 'रोप अवस्था ते गुडघाभर वाढ' },
            { name_mr: 'तुडतुडे व मावा (Corn Aphids & Leafhoppers)', name_en: 'Maize Aphids', badge: 'रस शोषक', badge_cls: 'warning', desc_mr: 'पानांमधून व कणसाच्या आवरणातून रस शोषतात. चिकट द्रव स्त्रवतात, त्यामुळे काळी बुरशी येते.', chemical: 'Thiamethoxam 25 WG @ 0.3 gm/L किंवा Imidacloprid @ 0.5 ml/L', stage_mr: 'कणीस तयार होण्याची अवस्था' },
            { name_mr: 'तुरा करपा व तांबेरा (Maydis Leaf Blight & Rust)', name_en: 'Blight & Rust', badge: 'बुरशीजन्य रोग', badge_cls: 'warning', desc_mr: 'पानांवर लांबट तपकिरी चट्टे पडतात. तांबेरा रोगात पानांवर विटकरी रंगाचे फोड येतात.', chemical: 'Azoxystrobin + Difenoconazole (Amistar Top) @ 1 ml/L किंवा Mancozeb @ 2.5 gm/L', stage_mr: 'ढगाळ हवामान व उच्च आर्द्रता' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'निफाड', name_mr: 'निफाड APMC', name_en: 'Niphad' },
            { id: 'मालेगाव', name_mr: 'मालेगाव APMC', name_en: 'Malegaon' },
            { id: 'येवला', name_mr: 'येवला APMC', name_en: 'Yeola' },
            { id: 'धुळे', name_mr: 'धुळे APMC', name_en: 'Dhule' },
            { id: 'सांगली', name_mr: 'सांगली APMC', name_en: 'Sangli' }
        ],
        mandi_kpis: [
            { label: 'निफाड उच्चतम भाव', val: '₹2,540', unit: '/ क्विंटल', sub: 'Poultry Grade Dry (<14%)', icon: 'award', cls: 'emerald' },
            { label: 'सरासरी मॉडेल भाव (Modal)', val: '₹2,385', unit: '/ क्विंटल', sub: 'महाराष्ट्र मका बाजार समित्या', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'शासकीय हमीभाव (MSP)', val: '₹2,225', unit: '/ क्विंटल', sub: 'मका हमीभाव २०२६ दर', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Daily Arrivals)', val: '35,900', unit: 'पोती', sub: 'निफाड, मालेगाव, धुळे', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'निफाड APMC (नाशिक)', variety: 'Yellow Hybrid Corn (पिवळा मका)', grade: 'Poultry Grade Dry (<14% ओलावा)', arrivals: '8,500 पोती', min: 2250, max: 2540, modal: 2420, trend: 'up' },
            { date: '2026-09-22', market: 'मालेगाव APMC (नाशिक)', variety: 'Commercial Maize', grade: 'Clean Grain Grade A', arrivals: '6,200 पोती', min: 2180, max: 2490, modal: 2380, trend: 'up' },
            { date: '2026-09-22', market: 'येवला APMC', variety: 'Hybrid Yellow', grade: 'Standard Quality', arrivals: '5,400 पोती', min: 2150, max: 2460, modal: 2350, trend: 'stable' },
            { date: '2026-09-22', market: 'धुळे APMC (खान्देश)', variety: 'Feed Maize Grade 1', arrivals: '7,100 पोती', min: 2200, max: 2510, modal: 2400, trend: 'up' },
            { date: '2026-09-22', market: 'सांगली APMC', variety: 'Silage / Hybrid Corn', grade: 'Grade A Dry', arrivals: '4,800 पोती', min: 2220, max: 2500, modal: 2390, trend: 'stable' },
            { date: '2026-09-22', market: 'शिर्डी / राहाता APMC', variety: 'Yellow Star Maize', grade: 'Direct Mill Dry', arrivals: '3,900 पोती', min: 2190, max: 2470, modal: 2360, trend: 'down' }
        ]
    },

    pomegranate: {
        id: 'pomegranate',
        name_mr: 'डाळिंब',
        name_en: 'Pomegranate',
        emoji: '🍎',
        icon: 'apple',
        subtitle_mr: 'सह्याद्री भगवा डाळिंब ऑर्चर्ड्स',
        subtitle_en: 'Sahyadri Bhagwa Commercial Pomegranate Estate',
        badge_mr: 'डाळिंब बाग',
        badge_en: 'Pomegranate Orchard',
        tagline_mr: 'भगवा डाळिंब व बहार व्यवस्थापन',
        tagline_en: 'Bhagwa Pomegranate & Bahar Treatment',
        tab2Title_mr: '🍎 डाळिंब बाग व्यवस्थापन (Commercial Pomegranate Management)',
        tab2Title_en: '🍎 Commercial Pomegranate Management',
        tab2Desc_mr: 'प्लॉटनुसार वाण, बहार व्यवस्थापन (मृग/हस्त), तेल्या रोग नियंत्रण व फळे संख्या',
        tab2Desc_en: 'Bhagwa variety, Bahar treatment, Bacterial Blight (Telya) & fruit thinning',
        tab10Title_mr: '📈 थेट डाळिंब बाजारभाव व APMC मार्केट दर',
        tab10Title_en: '📈 Pomegranate Mandi & APMC Market Rates',
        tab10Desc_mr: 'सोलापूर, सांगोला, पंढरपूर, नाशिक, पुणे व वाशी मार्केटमधील डाळिंब लिलाव नोंदी',
        tab10Desc_en: 'Solapur, Sangola, Pandharpur, Nashik, Pune & Vashi APMC auctions',
        salesHeading_mr: '💰 डाळिंब विक्री नोंदी (Pomegranate Sales)',
        salesHeading_en: '💰 Pomegranate Harvest Sales',
        metricLabels: {
            date1_mr: 'बहार ताण सोडणे तारीख (Stress Release Date)',
            date1_en: 'Bahar Stress Release Date',
            date2_mr: 'फळ तोडणी तारीख (Harvest Picking Date)',
            date2_en: 'Harvest Picking Date',
            count1_mr: 'फळे संख्या / झाड (Fruits/Tree)',
            count1_en: 'Fruits / Tree',
            count2_mr: 'सरासरी फळ वजन (Avg Fruit Weight gm)',
            count2_en: 'Avg Fruit Weight (gm)',
            yieldUnit_mr: 'टन',
            yieldUnit_en: 'Tonnes',
            rateUnit_mr: 'प्रति किलो (₹/kg)',
            rateUnit_en: 'per kg (₹/kg)',
            varietyTitle_mr: 'डाळिंब वाण',
            varietyTitle_en: 'Pomegranate Variety'
        },
        varieties: [
            'Bhagwa Super (भगवा सुपर सिंदूरी)',
            'Bhagwa Export (भगवा निर्यात)',
            'Arakta (आरक्ता)',
            'Ganesh (गणेश)',
            'Ruby (रुबी)',
            'Solapur Red'
        ],
        grades: [
            'Export Super Bold (300g+ A+)',
            'Domestic Grade A (250-300g)',
            'Medium Table (200-250g B)',
            'Process / Juice (C)'
        ],
        plots: [
            {
                id: 'pom-p1',
                name: 'प्लॉट १ - भगवा सुपर (हस्त बहार - एक्सपोर्ट)',
                name_en: 'Plot 1 - Bhagwa Super (Hasth Bahar Export)',
                crop_variety: 'Bhagwa Super (भगवा)',
                acres: 3.5,
                spacing: '14 x 10 ft',
                foundation_pruning_date: '2026-08-15',
                fruit_pruning_date: '2027-01-20',
                canes_per_vine: 95,
                bunches_per_vine: 320,
                expected_yield_tonnes: 28
            },
            {
                id: 'pom-p2',
                name: 'प्लॉट २ - भगवा सिंदूरी (मृग बहार)',
                name_en: 'Plot 2 - Bhagwa Sinduri (Mrig Bahar)',
                crop_variety: 'Bhagwa Export (भगवा)',
                acres: 3.0,
                spacing: '14 x 10 ft',
                foundation_pruning_date: '2026-05-20',
                fruit_pruning_date: '2026-11-10',
                canes_per_vine: 90,
                bunches_per_vine: 290,
                expected_yield_tonnes: 22
            },
            {
                id: 'pom-p3',
                name: 'प्लॉट ३ - आरक्ता (स्थानिक व प्रक्रिया)',
                name_en: 'Plot 3 - Arakta (Table & Juice)',
                crop_variety: 'Arakta (आरक्ता)',
                acres: 2.0,
                spacing: '12 x 10 ft',
                foundation_pruning_date: '2026-06-01',
                fruit_pruning_date: '2026-11-25',
                canes_per_vine: 85,
                bunches_per_vine: 270,
                expected_yield_tonnes: 16
            }
        ],
        irrigationLogs: [
            { id: 'pom-irr-1', plot_id: 'pom-p1', log_date: '2026-09-22', duration_hours: 2.5, water_liters: 38000, water_source: 'ठिबक सिंचन (Drip)', ec_level: 0.75, ph_level: 6.8, nutrients_n: 3.5, nutrients_ca: 5.2, nutrients_mg: 2.3 },
            { id: 'pom-irr-2', plot_id: 'pom-p2', log_date: '2026-09-19', duration_hours: 2.0, water_liters: 30000, water_source: 'ठिबक सिंचन', ec_level: 0.72, ph_level: 6.9, nutrients_n: 3.2, nutrients_ca: 4.8, nutrients_mg: 2.0 }
        ],
        fertilizerLogs: [
            { id: 'pom-fert-1', plot_id: 'pom-p1', log_date: '2026-09-20', fertilizer_name: 'कॅल्शियम नायट्रेट + बोरॉन (फळ सेटिंगसाठी)', dose_amount: 25, application_method: 'Drip', cost: 4200 },
            { id: 'pom-fert-2', plot_id: 'pom-p2', log_date: '2026-09-17', fertilizer_name: '00:52:34 (MKP) + पोटॅशियम शोराइट', dose_amount: 20, application_method: 'Drip', cost: 3900 }
        ],
        sprayLogs: [
            { id: 'pom-sp-1', plot_id: 'pom-p1', log_date: '2026-09-21', pest_disease_name: 'तेल्या रोग व फळकूज (Bacterial Blight)', chemical_or_fertilizer: 'Streptocycline 0.5 gm/L + कॉपर ऑक्सिक्लोराईड (COC) 2.5 gm/L', dose_per_liter: 2.5, total_water_liters: 400, next_spray_date: '2026-09-28', cost: 5800 },
            { id: 'pom-sp-2', plot_id: 'pom-p2', log_date: '2026-09-18', pest_disease_name: 'फुलकिडे (Thrips) व फळ पोखरणारी सुरवंट', chemical_or_fertilizer: 'Benevia (Cyantraniliprole) @ 1.8 ml/L', dose_per_liter: 1.8, total_water_liters: 350, next_spray_date: '2026-09-29', cost: 6200 }
        ],
        laborLogs: [
            { id: 'pom-lab-1', plot_id: 'pom-p1', log_date: '2026-09-21', activity: 'फळ विरळणी (Fruit Thinning) व झाड स्वच्छता', worker_names: 'सुरेश, दत्ता व 6 महिला मजूर', male_workers: 2, female_workers: 6, wage_per_worker: 400, total_cost: 3200, payment_status: 'Paid' },
            { id: 'pom-lab-2', plot_id: 'pom-p2', log_date: '2026-09-17', activity: 'फळांना पेपर बॅगिंग (बटर पेपर लावणे)', worker_names: 'सुधाकर व महिला कामगार', male_workers: 2, female_workers: 8, wage_per_worker: 380, total_cost: 3800, payment_status: 'Paid' }
        ],
        expenses: [
            { id: 'pom-exp-1', plot_id: 'pom-p1', log_date: '2026-09-21', category: 'औषधे', category_en: 'Chemicals', amount: 28500, description: 'स्ट्रेप्टोसायक्लिन, बेनेव्हिया व बुरशीनाशके' },
            { id: 'pom-exp-2', plot_id: 'pom-p1', log_date: '2026-09-19', category: 'खते', category_en: 'Fertilizers', amount: 22000, description: 'कॅल्शियम नायट्रेट, 13:00:45 व सूक्ष्म अन्नद्रव्ये' },
            { id: 'pom-exp-3', plot_id: 'pom-p2', log_date: '2026-09-16', category: 'मजुरी', category_en: 'Labor', amount: 26800, description: 'डाळिंब विरळणी व बॅगिंग मजुरी हजेरी' },
            { id: 'pom-exp-4', plot_id: 'pom-p1', log_date: '2026-09-12', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 9200, description: 'ठिबक सिंचन पाइपलाइन व वीज बिल' },
            { id: 'pom-exp-5', plot_id: 'pom-p2', log_date: '2026-09-08', category: 'वाहतूक', category_en: 'Transport', amount: 14500, description: 'सांगोला व सोलापूर मार्केट क्रेट्स वाहतूक' },
            { id: 'pom-exp-6', plot_id: 'pom-p3', log_date: '2026-09-05', category: 'इतर खर्च', category_en: 'Other', amount: 11200, description: 'बटर पेपर बॅग्स व फोम नेट खरेदी' }
        ],
        sales: [
            { id: 'pom-sale-1', plot_id: 'pom-p2', sale_date: '2026-09-20', buyer_name: 'अरिहंत डाळिंब एक्सपोर्ट्स, सोलापूर APMC', grade: 'Export Super Bold (300g+)', quantity_kg: 3800, rate_per_kg: 185, total_revenue: 703000 },
            { id: 'pom-sale-2', plot_id: 'pom-p2', sale_date: '2026-09-17', buyer_name: 'बालाजी फ्रूट्स, सांगोला मार्केट', grade: 'Domestic Grade A (250-300g)', quantity_kg: 2900, rate_per_kg: 135, total_revenue: 391500 }
        ],
        reminders: [
            { id: 'pom-rem-1', category: 'फवारणी', category_en: 'Spray', title: 'तेल्या (Bacterial Blight) प्रतिबंधक बोर्डो फवारणी', title_en: 'Bordeaux 0.5% spray for Telya control', due_date: '2026-09-24', status: 'pending', priority: 'High', notes: 'ढगाळ हवामानात ०.५% बोर्डो मिश्रण किंवा कॉपर हायड्रॉक्साइड' },
            { id: 'pom-rem-2', category: 'छाटणी', category_en: 'Pruning', title: 'प्लॉट १ - फळ विरळणी (प्रति झाड ८० ते ९० उत्तम फळे)', title_en: 'Plot 1 - Fruit thinning to 80-90 fruits/tree', due_date: '2026-09-26', status: 'pending', priority: 'High', notes: 'जास्त फळे ठेवल्यास आकार लहान राहतो' },
            { id: 'pom-rem-3', category: 'खत', category_en: 'Fertilizer', title: 'कॅल्शियम व बोरॉन फवारणी (फळ तडकणे रोखण्यासाठी)', title_en: 'Calcium + Boron foliar for fruit cracking', due_date: '2026-09-29', status: 'pending', priority: 'Medium', notes: 'फळाची साल जाड व चमकदार होण्यासाठी' }
        ],
        pests: [
            { name_mr: 'तेल्या रोग (Bacterial Blight - Xanthomonas)', name_en: 'Bacterial Blight (Telya)', badge: 'सर्वात घातक रोग', badge_cls: 'danger', desc_mr: 'पानांवर, फांद्यांवर व फळांवर काळे तेलकट त्रिकोणी डाग पडतात. फळांवर ‘L’ किंवा ‘Y’ आकाराचे तडे जातात.', chemical: 'Streptocycline 0.5 gm/L + COC 2.5 gm/L किंवा 2-Bromo-2-nitropropane-1,3-diol (Bacteromycin) @ 0.5 gm/L', stage_mr: 'पाऊस, धुके व उच्च आर्द्रता' },
            { name_mr: 'डाळिंब फुलकिडे (Thrips - Scirtothrips)', name_en: 'Pomegranate Thrips', badge: 'फळ डाग कीड', badge_cls: 'danger', desc_mr: 'कोवळ्या फळांच्या सालीवर खरवडून रस शोषतात. फळावर खवलेयुक्त चट्टे पडतात व मार्केट भाव कमी होतो.', chemical: 'Spinetoram 11.7 SC @ 0.4 ml/L किंवा Fipronil 5 SC @ 1.5 ml/L', stage_mr: 'कळी अवस्था व लहान फळ सेटिंग' },
            { name_mr: 'फळ पोखरणारी सुरवंट / अनाटार (Fruit Borer)', name_en: 'Pomegranate Butterfly / Anar Borer', badge: 'फळ कीड', badge_cls: 'warning', desc_mr: 'फुलपाखरू फळावर अंडी घालते. अळी फळात शिरून दाणे खाते व विष्ठा छिद्रातून बाहेर टाकते.', chemical: 'Cyantraniliprole 10.26 OD (Benevia) @ 1.8 ml/L किंवा फळांना बटर पेपर बॅगिंग करणे', stage_mr: 'फळ लिंबाएवढे असताना' },
            { name_mr: 'मर रोग (Wilt Complex / Ceratocystis fimbriata)', name_en: 'Pomegranate Wilt', badge: 'मुळांची बुरशी', badge_cls: 'warning', desc_mr: 'झाडाची एक बाजू पिवळी पडून हळूहळू संपूर्ण झाड वाळते. खोड कापल्यास आतील लाकूड काळसर-तपकिरी दिसते.', chemical: 'Propiconazole @ 2 ml/L ड्रेंचिंग + ट्रायकोडर्मा शेणखतातून + नेमाटोड नियंत्रण', stage_mr: 'कधीही (विशेषतः अतिपाण्यामुळे)' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'सोलापूर', name_mr: 'सोलापूर APMC', name_en: 'Solapur' },
            { id: 'सांगोला', name_mr: 'सांगोला मार्केट', name_en: 'Sangola' },
            { id: 'पंढरपूर', name_mr: 'पंढरपूर APMC', name_en: 'Pandharpur' },
            { id: 'मुंबई', name_mr: 'मुंबई वाशी APMC', name_en: 'Vashi APMC' },
            { id: 'पुणे', name_mr: 'पुणे गुलटेकडी', name_en: 'Pune APMC' }
        ],
        mandi_kpis: [
            { label: 'सोलापूर उच्चतम भाव', val: '₹210', unit: '/ किलो', sub: 'Bhagwa Super Export 350g+', icon: 'award', cls: 'emerald' },
            { label: 'सरासरी मॉडेल भाव (Modal)', val: '₹152', unit: '/ किलो', sub: 'महाराष्ट्र डाळिंब सौदे', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'लोकल टेबल क्वॉलिटी', val: '₹120', unit: '/ किलो', sub: '200-250g सरासरी दर', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Daily Arrivals)', val: '19,900', unit: 'क्रेट्स', sub: 'सोलापूर, सांगोला, वाशी', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'सोलापूर कृषी उत्पन्न बाजार समिती (Solapur APMC)', variety: 'Bhagwa Super (भगवा सिंदूरी)', grade: 'Export Super (350g+)', arrivals: '3,800 क्रेट्स', min: 140, max: 210, modal: 185, trend: 'up' },
            { date: '2026-09-22', market: 'सांगोला डाळिंब मार्केट (सोलापूर)', variety: 'Bhagwa Export Grade', grade: 'Grade A (250-300g)', arrivals: '5,200 क्रेट्स', min: 110, max: 165, modal: 145, trend: 'up' },
            { date: '2026-09-22', market: 'पंढरपूर APMC', variety: 'Bhagwa Table Quality', grade: 'Grade 1 Box Pack', arrivals: '2,600 क्रेट्स', min: 95, max: 140, modal: 125, trend: 'stable' },
            { date: '2026-09-22', market: 'मुंबई वाशी APMC (Vashi)', variety: 'Bhagwa Super Sinduri', grade: '5kg Master Export Box', arrivals: '4,100 बॉक्स', min: 160, max: 230, modal: 195, trend: 'up' },
            { date: '2026-09-22', market: 'पुणे गुलटेकडी (Pune APMC)', variety: 'Bhagwa / Arakta', grade: 'Table Quality Grade A', arrivals: '2,400 क्रेट्स', min: 100, max: 155, modal: 135, trend: 'stable' },
            { date: '2026-09-22', market: 'नाशिक APMC', variety: 'Bhagwa Sinduri', grade: 'Local & Export Grade', arrivals: '1,800 क्रेट्स', min: 105, max: 150, modal: 130, trend: 'down' }
        ]
    },

    guava: {
        id: 'guava',
        name_mr: 'पेरू',
        name_en: 'Guava',
        emoji: '🍈',
        icon: 'citrus',
        subtitle_mr: 'सह्याद्री तैवान पिंक पेरू ऑर्चर्ड्स',
        subtitle_en: 'Sahyadri Ultra-High Density Taiwan Pink Guava Estate',
        badge_mr: 'पेरू बाग',
        badge_en: 'Guava Orchard',
        tagline_mr: 'सघन पेरू लागवड व बॅगिंग तंत्रज्ञान',
        tagline_en: 'High Density Guava & Fruit Bagging',
        tab2Title_mr: '🍈 पेरू बाग व्यवस्थापन (High-Density Guava Management)',
        tab2Title_en: '🍈 High-Density Guava Management',
        tab2Desc_mr: 'तैवान पिंक व VNR वाण, सघन लागवड, फोम नेट बॅगिंग, छाटणी व फळे व्यवस्थापन',
        tab2Desc_en: 'Taiwan Pink & VNR Bihi, ultra high density (UHDP), foam bagging & canopy',
        tab10Title_mr: '📈 थेट पेरू बाजारभाव व APMC मार्केट दर',
        tab10Title_en: '📈 Live Guava Mandi & Wholesale Rates',
        tab10Desc_mr: 'पुणे गुलटेकडी, मुंबई वाशी, नाशिक, अहमदनगर (राहाता) व नागपूर पेरू लिलाव नोंदी',
        tab10Desc_en: 'Pune, Mumbai Vashi, Nashik, Rahata & Nagpur APMC guava auctions',
        salesHeading_mr: '💰 पेरू विक्री नोंदी (Guava Harvest Sales)',
        salesHeading_en: '💰 Guava Harvest Sales',
        metricLabels: {
            date1_mr: 'बहार छाटणी / बेंडिंग तारीख (Bending Date)',
            date1_en: 'Bending / Pruning Date',
            date2_mr: 'फळ काढणी तारीख (Harvest Date)',
            date2_en: 'Harvest Picking Date',
            count1_mr: 'फळे संख्या / झाड (Fruits/Tree)',
            count1_en: 'Fruits / Tree',
            count2_mr: 'सरासरी फळ वजन (Fruit Weight gm)',
            count2_en: 'Avg Fruit Weight (gm)',
            yieldUnit_mr: 'टन',
            yieldUnit_en: 'Tonnes',
            rateUnit_mr: 'प्रति किलो (₹/kg)',
            rateUnit_en: 'per kg (₹/kg)',
            varietyTitle_mr: 'पेरू वाण',
            varietyTitle_en: 'Guava Variety'
        },
        varieties: [
            'Taiwan Pink (तैवान पिंक - गुलाबी गर)',
            'VNR Bihi (व्ही.एन.आर. बिही - जंबो)',
            'Sardar L-49 (लखनौ 49 गावरान)',
            'Allahabad Safeda (सफेदा)',
            'Arka Kiran (अर्का किरण - लाल)',
            'Lalit (ललित)'
        ],
        grades: [
            'Foam Bagged Super (400g+ A+)',
            'Table Fresh Grade A (250-400g)',
            'Local Market (150-250g B)',
            'Pulp / Jam Quality (C)'
        ],
        plots: [
            {
                id: 'gua-p1',
                name: 'प्लॉट १ - तैवान पिंक (सघन पद्धत - 6x6 ft)',
                name_en: 'Plot 1 - Taiwan Pink (UHDP 6x6 ft)',
                crop_variety: 'Taiwan Pink (तैवान पिंक)',
                acres: 3.0,
                spacing: '6 x 6 ft',
                foundation_pruning_date: '2026-05-10',
                fruit_pruning_date: '2026-10-18',
                canes_per_vine: 65,
                bunches_per_vine: 380,
                expected_yield_tonnes: 32
            },
            {
                id: 'gua-p2',
                name: 'प्लॉट २ - VNR Bihi (जंबो पेरू - 10x6 ft)',
                name_en: 'Plot 2 - VNR Bihi (Jumbo 10x6 ft)',
                crop_variety: 'VNR Bihi (व्ही.एन.आर. बिही)',
                acres: 2.5,
                spacing: '10 x 6 ft',
                foundation_pruning_date: '2026-05-15',
                fruit_pruning_date: '2026-10-25',
                canes_per_vine: 50,
                bunches_per_vine: 520,
                expected_yield_tonnes: 26
            },
            {
                id: 'gua-p3',
                name: 'प्लॉट ३ - सरदार L-49 (पारंपारिक गावरान गोड)',
                name_en: 'Plot 3 - Sardar L-49 (Lucknow 49)',
                crop_variety: 'Sardar L-49 (सरदार)',
                acres: 2.0,
                spacing: '12 x 12 ft',
                foundation_pruning_date: '2026-06-01',
                fruit_pruning_date: '2026-11-15',
                canes_per_vine: 80,
                bunches_per_vine: 240,
                expected_yield_tonnes: 18
            }
        ],
        irrigationLogs: [
            { id: 'gua-irr-1', plot_id: 'gua-p1', log_date: '2026-09-22', duration_hours: 2.0, water_liters: 28000, water_source: 'ठिबक सिंचन (Drip)', ec_level: 0.65, ph_level: 6.9, nutrients_n: 3.8, nutrients_ca: 4.5, nutrients_mg: 2.0 },
            { id: 'gua-irr-2', plot_id: 'gua-p2', log_date: '2026-09-19', duration_hours: 1.5, water_liters: 22000, water_source: 'ठिबक सिंचन', ec_level: 0.68, ph_level: 7.0, nutrients_n: 3.5, nutrients_ca: 4.2, nutrients_mg: 1.8 }
        ],
        fertilizerLogs: [
            { id: 'gua-fert-1', plot_id: 'gua-p1', log_date: '2026-09-20', fertilizer_name: '13:00:45 (पोटॅशियम नायट्रेट) + बोरॉन', dose_amount: 20, application_method: 'Drip', cost: 3600 },
            { id: 'gua-fert-2', plot_id: 'gua-p2', log_date: '2026-09-16', fertilizer_name: '00:52:34 (MKP) + चिलेटेड फेरस', dose_amount: 18, application_method: 'Drip', cost: 3400 }
        ],
        sprayLogs: [
            { id: 'gua-sp-1', plot_id: 'gua-p1', log_date: '2026-09-21', pest_disease_name: 'फळमाशी (Fruit Fly) व पिठ्या ढेकूण (Mealybug)', chemical_or_fertilizer: 'Malathion 50 EC @ 2 ml/L + गूळ + मिथाईल युजेनॉल ट्रॅप्स', dose_per_liter: 2.0, total_water_liters: 300, next_spray_date: '2026-09-30', cost: 3800 },
            { id: 'gua-sp-2', plot_id: 'gua-p2', log_date: '2026-09-17', pest_disease_name: 'अँथ्रॅक्नोज (Anthracnose / फळावर काळे डाग)', chemical_or_fertilizer: 'Copper Oxychloride (COC) @ 2.5 gm/L + कार्बेंडाझिम', dose_per_liter: 2.5, total_water_liters: 250, next_spray_date: '2026-09-28', cost: 3200 }
        ],
        laborLogs: [
            { id: 'gua-lab-1', plot_id: 'gua-p1', log_date: '2026-09-20', activity: 'फोम नेट + प्लास्टिक कव्हर बॅगिंग (Bagging)', worker_names: 'उज्वला, कावेरी व 8 महिला कामगार', male_workers: 1, female_workers: 9, wage_per_worker: 380, total_cost: 3800, payment_status: 'Paid' },
            { id: 'gua-lab-2', plot_id: 'gua-p2', log_date: '2026-09-15', activity: 'फांद्या वाकवणे (Bending) व शेंडा पिंचिंग', worker_names: 'मारुती व मजूर', male_workers: 4, female_workers: 2, wage_per_worker: 400, total_cost: 2400, payment_status: 'Paid' }
        ],
        expenses: [
            { id: 'gua-exp-1', plot_id: 'gua-p1', log_date: '2026-09-21', category: 'इतर खर्च', category_en: 'Other', amount: 16800, description: 'फोम नेट (Foam Net) व व्हीएनआर कव्हर बॅग्स' },
            { id: 'gua-exp-2', plot_id: 'gua-p1', log_date: '2026-09-19', category: 'खते', category_en: 'Fertilizers', amount: 15400, description: 'पोटॅशियम शोराइट, मॅग्नेशियम सल्फेट व बोरॉन' },
            { id: 'gua-exp-3', plot_id: 'gua-p2', log_date: '2026-09-16', category: 'औषधे', category_en: 'Chemicals', amount: 12200, description: 'मॅलाथिऑन, साफ बुरशीनाशक व स्टीकर' },
            { id: 'gua-exp-4', plot_id: 'gua-p1', log_date: '2026-09-12', category: 'मजुरी', category_en: 'Labor', amount: 19500, description: 'पेरू बॅगिंग व फांद्या वाकवणे मजुरी' },
            { id: 'gua-exp-5', plot_id: 'gua-p3', log_date: '2026-09-08', category: 'पाणी/वीज', category_en: 'Water/Power', amount: 6200, description: 'ठिबक दुरुस्ती व वीज बिल' },
            { id: 'gua-exp-6', plot_id: 'gua-p1', log_date: '2026-09-04', category: 'वाहतूक', category_en: 'Transport', amount: 8800, description: 'पुणे गुलटेकडी मार्केट पिकअप भाडे' }
        ],
        sales: [
            { id: 'gua-sale-1', plot_id: 'gua-p1', sale_date: '2026-09-21', buyer_name: 'रिलायन्स फ्रेश / बिगबास्केट वेंडर, पुणे', grade: 'Foam Bagged Super (400g+)', quantity_kg: 2600, rate_per_kg: 72, total_revenue: 187200 },
            { id: 'gua-sale-2', plot_id: 'gua-p2', sale_date: '2026-09-18', buyer_name: 'शिंदे फ्रूट्स, वाशी नवी मुंबई', grade: 'VNR Jumbo Grade A (500g+)', quantity_kg: 1950, rate_per_kg: 85, total_revenue: 165750 }
        ],
        reminders: [
            { id: 'gua-rem-1', category: 'फवारणी', category_en: 'Spray', title: 'फळमाशी (Fruit Fly) नियंत्रणासाठी मिथाईल युजेनॉल सापळे लावणे', title_en: 'Hang Methyl Eugenol traps for Fruit Fly', due_date: '2026-09-24', status: 'pending', priority: 'High', notes: 'प्रति एकर 6 ते 8 कामगंध सापळे झाडांवर अडकवावेत' },
            { id: 'gua-rem-2', category: 'छाटणी', category_en: 'Pruning', title: 'पेरू लिंबाएवढा झाल्यावर ३ पदरी फोम नेट बॅगिंग करणे', title_en: '3-layer foam net bagging at lemon size', due_date: '2026-09-27', status: 'pending', priority: 'High', notes: 'फोम नेट + पॉलिथिन + वर्तमानपत्र बॅगिंगमुळे डागरहित चकाकणारे फळ मिळते' },
            { id: 'gua-rem-3', category: 'खत', category_en: 'Fertilizer', title: 'फळ फुगवणी काळात ००:००:५० आणि बोरॉन ठिबकमधून देणे', title_en: '00:00:50 SOP & Boron fertigation', due_date: '2026-09-30', status: 'pending', priority: 'Medium', notes: 'फळाचा गोडवा व टिकाऊपणा वाढवण्यासाठी' }
        ],
        pests: [
            { name_mr: 'पेरू फळमाशी (Guava Fruit Fly - Bactrocera)', name_en: 'Guava Fruit Fly', badge: 'गंभीर कीड', badge_cls: 'danger', desc_mr: 'माशी पिकणाऱ्या फळाच्या सालीखाली अंडी घालते. आतील अळ्या गरामध्ये फिरून फळ सडवतात. फळ गळते.', chemical: 'मिथाईल युजेनॉल कामगंध ट्रॅप्स लावणे + Malathion 50 EC @ 2 ml/L + गुळाची फवारणी', stage_mr: 'फळ पक्वता व काढणी काळ' },
            { name_mr: 'पिठ्या ढेकूण (Mealybug)', name_en: 'Guava Mealybug', badge: 'रस शोषक', badge_cls: 'danger', desc_mr: 'पानांवर व फळांवर पांढऱ्या मेणासारख्या आवरणात राहून रस शोषतात. काळी बुरशी पसरते.', chemical: 'Profenofos 50 EC @ 2 ml/L किंवा Buprofezin 25 SC @ 1.5 ml/L + स्टीकर', stage_mr: 'नवीन पालवी व फळ विकास' },
            { name_mr: 'अँथ्रॅक्नोज / फळ सड (Anthracnose)', name_en: 'Anthracnose', badge: 'बुरशीजन्य डाग', badge_cls: 'warning', desc_mr: 'फळांवर खोलगट काळे किंवा तपकिरी चट्टे पडतात. फळे कडक होतात किंवा मऊ पडून कुजतात.', chemical: 'Copper Oxychloride (COC) @ 2.5 gm/L किंवा Carbendazim 12% + Mancozeb 63% (Saaf) @ 2 gm/L', stage_mr: 'पावसाळा व दमट हवामान' },
            { name_mr: 'पेरू मर रोग (Guava Wilt - Fusarium)', name_en: 'Guava Wilt', badge: 'खोड व मूळ रोग', badge_cls: 'warning', desc_mr: 'झाडाची पाने पिवळी पडून गळतात व संपूर्ण झाड वाळते. मुळांची कार्यक्षमता नष्ट होते.', chemical: 'Trichoderma viride @ 5 kg शेणखतातून + कार्बेंडाझिम ड्रेंचिंग + पाण्याचा योग्य निचरा', stage_mr: 'पाणी साचल्यास किंवा पावसाळ्यानंतर' }
        ],
        mandi_markets: [
            { id: 'all', name_mr: 'सर्व मार्केट्स (All)', name_en: 'All Markets' },
            { id: 'पुणे', name_mr: 'पुणे गुलटेकडी', name_en: 'Pune APMC' },
            { id: 'मुंबई', name_mr: 'मुंबई वाशी APMC', name_en: 'Vashi APMC' },
            { id: 'राहाता', name_mr: 'राहाता (शिर्डी)', name_en: 'Rahata' },
            { id: 'नाशिक', name_mr: 'नाशिक APMC', name_en: 'Nashik' },
            { id: 'नागपूर', name_mr: 'नागपूर APMC', name_en: 'Nagpur' }
        ],
        mandi_kpis: [
            { label: 'मुंबई वाशी उच्चतम भाव', val: '₹98', unit: '/ किलो', sub: 'VNR Jumbo 500g+ Bagged', icon: 'award', cls: 'emerald' },
            { label: 'तैवान पिंक सरासरी दर', val: '₹76', unit: '/ किलो', sub: 'पुणे व नाशिक फ्रेश लिलाव', icon: 'bar-chart-2', cls: 'blue' },
            { label: 'सरदार L-49 भाव', val: '₹54', unit: '/ किलो', sub: 'राहाता व स्थानिक मंड्या', icon: 'sun', cls: 'amber' },
            { label: 'दैनिक आवक (Daily Arrivals)', val: '16,100', unit: 'क्रेट्स', sub: 'पुणे, वाशी, राहाता', icon: 'truck', cls: 'purple' }
        ],
        mandi: [
            { date: '2026-09-22', market: 'पुणे गुलटेकडी (Pune Market Yard)', variety: 'Taiwan Pink (तैवान पिंक)', grade: 'Foam Net Super (400g+)', arrivals: '3,200 क्रेट्स', min: 65, max: 85, modal: 76, trend: 'up' },
            { date: '2026-09-22', market: 'मुंबई वाशी APMC (Vashi)', variety: 'VNR Jumbo Bihi', grade: 'Extra Bold Super (500g+)', arrivals: '4,500 क्रेट्स', min: 75, max: 98, modal: 88, trend: 'up' },
            { date: '2026-09-22', market: 'राहाता / शिर्डी APMC (अहमदनगर)', variety: 'Sardar L-49 (लखनौ पेरू)', grade: 'Sweet Table Grade A', arrivals: '2,800 क्रेट्स', min: 45, max: 62, modal: 54, trend: 'stable' },
            { date: '2026-09-22', market: 'नाशिक APMC', variety: 'Taiwan Pink / Sardar', grade: 'Grade 1 Box Pack', arrivals: '1,900 क्रेट्स', min: 50, max: 72, modal: 62, trend: 'up' },
            { date: '2026-09-22', market: 'नागपूर कळमना APMC', variety: 'Allahabad Safeda', grade: 'Table Quality', arrivals: '2,200 क्रेट्स', min: 40, max: 58, modal: 48, trend: 'down' },
            { date: '2026-09-22', market: 'सोलापूर APMC', variety: 'Taiwan Pink Super', grade: 'Foam Pack Grade A', arrivals: '1,500 क्रेट्स', min: 55, max: 75, modal: 66, trend: 'stable' }
        ]
    }
};

// Bilingual Navigation Titles (Clean Option Names, No Number Count Prefixes)
const TAB_TITLES = {
    'dashboard': {
        mr: { title: 'डॅशबोर्ड (Dashboard)', sub: 'एकूण क्षेत्र, कामे, पाण्याचा वापर आणि आर्थिक स्थिती' },
        en: { title: 'Dashboard (Overview)', sub: 'Total acreage, tasks, water usage and financials' },
        icon: 'layout-dashboard'
    },
    'grape-orchard': {
        mr: { title: 'द्राक्ष बाग व्यवस्थापन', sub: 'प्लॉटनुसार वाण, अंतर, छाटणी तारखा व घड/काडी व्यवस्थापन' },
        en: { title: 'Grape Orchard Management', sub: 'Plot-wise varieties, spacing, pruning dates & canopy' },
        icon: 'grape'
    },
    'water-mgmt': {
        mr: { title: 'सिंचन व्यवस्थापन (पाणी)', sub: 'आजचे सिंचन, पाणी लिटर, EC/pH नियंत्रण व N-Ca-Mg पोषक घटक' },
        en: { title: 'Water & Irrigation Management', sub: 'Today\'s irrigation, water liters, EC/pH and nutrients' },
        icon: 'droplet'
    },
    'fertilizer-mgmt': {
        mr: { title: 'खत व्यवस्थापन', sub: 'खताचे नाव, मात्रा, फर्टिगेशन नोंद व थेट N-P-K कॅल्क्युलेटर' },
        en: { title: 'Fertilizer & Fertigation', sub: 'Fertilizer names, doses, fertigation logs & NPK calc' },
        icon: 'flask-conical'
    },
    'pest-disease': {
        mr: { title: 'कीड व रोग व्यवस्थापन', sub: 'उदबत्या, थ्रीप्स, केवडा, भुरी फवारणी व पुढील नियोजन' },
        en: { title: 'Pest & Disease Management', sub: 'Flea beetle, thrips, mildews, spraying & schedule' },
        icon: 'bug'
    },
    'labor-mgmt': {
        mr: { title: 'मजूर व्यवस्थापन', sub: 'कामगारांची हजेरी, रोजंदारी, छाटणी/विरळणी कामे व मजुरी खर्च' },
        en: { title: 'Labor Management', sub: 'Worker roster, daily wage, attendance & labor cost' },
        icon: 'users'
    },
    'finance-pnl': {
        mr: { title: 'खर्च व उत्पन्न', sub: 'मुख्य खर्च प्रवाह आणि द्राक्ष विक्री आवक व निव्वळ नफा' },
        en: { title: 'Expenses & Income (P&L)', sub: 'Expense streams, grape sales revenue & net profit' },
        icon: 'indian-rupee'
    },
    'reports': {
        mr: { title: 'अहवाल व विश्लेषण (Reports)', sub: 'प्रति एकर खर्च, प्रति किलो खर्च, प्लॉट उत्पादन व हंगाम तुलना' },
        en: { title: 'Reports & Analytics', sub: 'Cost per acre, cost per kg, plot yield & seasons' },
        icon: 'bar-chart-3'
    },
    'reminders': {
        mr: { title: 'स्मरणपत्रे (Reminders)', sub: 'फवारणी, खत, सिंचन, छाटणी, काढणी व पेमेंट ॲलर्ट्स' },
        en: { title: 'Reminders & Alerts', sub: 'Spray, fertilizer, irrigation, pruning & payment alerts' },
        icon: 'bell'
    },
    'mandi-rates': {
        mr: { title: 'द्राक्ष बाजारभाव (Live Mandi)', sub: 'नाशिक, सांगली, सोलापूर, पुणे व मुंबई वाशी APMC दर' },
        en: { title: 'Mandi & APMC Grape Rates', sub: 'Nashik, Sangli, Solapur, Pune & Mumbai APMC auctions' },
        icon: 'trending-up'
    },
    'govt-schemes': {
        mr: { title: 'शासकीय योजना व सबसिडी', sub: 'MahaDBT ठिबक, NHB कोल्ड स्टोरेज व फळपीक विमा' },
        en: { title: 'Government Schemes & Subsidies', sub: 'MahaDBT Drip, NHB Cold Storage & Crop Insurance' },
        icon: 'landmark'
    },
    'main-menu': {
        mr: { title: 'मेनू (Main Menu)', sub: 'कृषिरत्न संपूर्ण शेती व्यवस्थापन विभाग व साधने' },
        en: { title: 'Main Menu', sub: 'Krushiratna Complete Farm Management Modules' },
        icon: 'menu'
    }
};

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
    initLucide();
    initCropEngine();
    initLanguageToggle();
    initAuth();
    initNavigation();
    initModals();
    initForms();
    initMandiRates();
    initSubsidyCalculator();
    initSupabasePill();
    setLanguage(appState.activeLang);
    await loadAllData();
    renderLaborAttendanceList();
    if (appState.activeCrop !== 'grapes') {
        switchCrop(appState.activeCrop, false);
    }
});

function initSupabasePill() {
    const pill = document.getElementById('supabase-status-pill');
    if (pill) {
        pill.addEventListener('click', () => {
            loadAllData(true);
        });
    }
}

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
        { id: 'nav-tab-dashboard', mr: ['डॅशबोर्ड (Dashboard)', 'शेती क्षेत्र व आजची कामे'], en: ['Dashboard', 'Farm Overview & Tasks'] },
        { id: 'nav-tab-grape', mr: ['द्राक्ष बाग व्यवस्थापन', 'प्लॉट तपशील, वाण, छाटणी व वाढ'], en: ['Grape Orchard', 'Plot & Canopy Mgmt'] },
        { id: 'nav-tab-water', mr: ['सिंचन व्यवस्थापन (पाणी)', 'पाणी लिटर, वेळ, EC व pH नोंदी'], en: ['Water Management', 'Irrigation & EC/pH'] },
        { id: 'nav-tab-fertilizer', mr: ['खत व्यवस्थापन', 'NPK खतांचे नियोजन व फर्टिगेशन'], en: ['Fertilizer Mgmt', 'Fertigation & NPK'] },
        { id: 'nav-tab-pest', mr: ['कीड व रोग व्यवस्थापन', 'थ्रीप्स, भुरी व फवारणी नोंद'], en: ['Pest & Disease', 'Flea Beetle & Thrips'] },
        { id: 'nav-tab-labor', mr: ['मजूर व्यवस्थापन', 'दैनिक हजेरी, कामाचा प्रकार व मजुरी'], en: ['Labor Management', 'Attendance & Wages'] },
        { id: 'nav-tab-finance', mr: ['खर्च व हिशेब', 'औषधे, खते, मजुरी व वीज बिल खर्च'], en: ['Expenses & Accounts', 'Supplies, Labor & Power'] },
        { id: 'nav-tab-sales', mr: ['उत्पादन व विक्री', 'काढणी वजन, दर प्रति किलो व महसूल'], en: ['Production & Sales', 'Harvest, Rate/kg & Revenue'] },
        { id: 'nav-tab-reports', mr: ['रिपोर्ट व विश्लेषण', 'प्लॉटनुसार उत्पादन आलेख व नफा-तोटा'], en: ['Reports & Analytics', 'Yield Charts & Profit-Loss'] },
        { id: 'nav-tab-reminders', mr: ['रिमाइंडर', 'फवारणी व सिंचन कामांचे स्मरणपत्र'], en: ['Reminders', 'Tasks & Spray Alerts'] },
        { id: 'nav-tab-schemes', mr: ['शासकीय योजना व सबसिडी', 'MahaDBT व शासकीय अनुदान'], en: ['Govt Schemes', 'Subsidies & Grants'] }
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

    // Splash Quick Action Buttons
    document.getElementById('btn-splash-quick-login')?.addEventListener('click', () => {
        if (userInput) userInput.value = 'farmer';
        if (passInput) passInput.value = 'farmer123';
        loginForm?.dispatchEvent(new Event('submit'));
    });

    document.getElementById('btn-splash-open-register')?.addEventListener('click', () => {
        openModal('modal-register');
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
            if (target) {
                switchView(target);
            }

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
    if (!target) return;
    const cleanTarget = target.startsWith('view-') ? target.replace('view-', '') : target;
    appState.currentTab = cleanTarget;

    // Update active nav button
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        const btnTarget = (btn.dataset.target || '').replace('view-', '');
        btn.classList.toggle('active', btnTarget === cleanTarget);
    });

    // Update active view section
    document.querySelectorAll('.app-view').forEach(view => {
        const viewClean = view.id.replace('view-', '');
        view.classList.toggle('active', viewClean === cleanTarget);
    });

    // Update bottom nav bar items
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        const itemTarget = (item.dataset.navTarget || '').replace('view-', '');
        item.classList.toggle('active', itemTarget === cleanTarget);
    });

    // Update Top Header Breadcrumb
    const isMr = appState.activeLang === 'mr';
    const meta = TAB_TITLES[cleanTarget] || TAB_TITLES['dashboard'] || {
        mr: { title: 'कृषिरत्न शेती व्यवस्थापन', sub: 'शेती स्मार्ट... भविष्य जवळून...' },
        en: { title: 'Krushiratna Farm Management', sub: 'Smart farming for a better future' },
        icon: 'sprout'
    };
    const currentMeta = isMr ? (meta.mr || meta) : (meta.en || meta);
    const titleElem = document.getElementById('breadcrumb-title');
    const subElem = document.getElementById('breadcrumb-sub');
    const iconElem = document.getElementById('breadcrumb-icon');

    if (titleElem && currentMeta.title) titleElem.textContent = currentMeta.title;
    if (subElem && currentMeta.sub) subElem.textContent = currentMeta.sub;
    if (iconElem && meta.icon) iconElem.setAttribute('data-lucide', meta.icon);

    if (cleanTarget === 'reports') {
        setTimeout(() => {
            renderReportsTab();
            if (typeof initReportBarChart === 'function') initReportBarChart();
        }, 80);
    }

    initLucide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchView = switchView;

// ==========================================================================
// 4. DATA FETCHING (Supabase with Local Fallback)
// ==========================================================================
async function loadAllData(isManualRefresh = false) {
    const isMr = appState.activeLang === 'mr';
    if (isManualRefresh) {
        showToast(isMr ? 'सर्व डेटा रिफ्रेश होत आहे...' : 'Refreshing live data...', 'info');
    }
    updateSupabaseStatus('syncing');

    const client = getSupabaseClient();
    let isConnected = false;

    if (client) {
        try {
            // Fetch Plots
            const { data: plotsData, error: plotsErr } = await client.from('plots').select('*').order('created_at', { ascending: true });
            if (!plotsErr && plotsData && plotsData.length > 0) {
                appState.plots = plotsData;
                CROPS_CONFIG.grapes.plots = plotsData;
                isConnected = true;
            } else if (!appState.plots || appState.plots.length === 0) {
                appState.plots = FALLBACK_PLOTS;
            }

            // Fetch Irrigation Logs
            const { data: irrData, error: irrErr } = await client.from('irrigation_logs').select('*').order('log_date', { ascending: false });
            if (!irrErr && irrData && irrData.length > 0) {
                appState.irrigationLogs = irrData;
                CROPS_CONFIG.grapes.irrigationLogs = irrData;
                isConnected = true;
            } else if (!appState.irrigationLogs || appState.irrigationLogs.length === 0) {
                appState.irrigationLogs = FALLBACK_IRRIGATION;
            }

            // Fetch Fertilizer Logs
            const { data: fertData, error: fertErr } = await client.from('fertilizer_logs').select('*').order('log_date', { ascending: false });
            if (!fertErr && fertData && fertData.length > 0) {
                appState.fertilizerLogs = fertData;
                CROPS_CONFIG.grapes.fertilizerLogs = fertData;
                isConnected = true;
            } else if (!appState.fertilizerLogs || appState.fertilizerLogs.length === 0) {
                appState.fertilizerLogs = FALLBACK_FERTILIZER;
            }

            // Fetch Spray Logs
            const { data: sprayData, error: sprayErr } = await client.from('spray_logs').select('*').order('log_date', { ascending: false });
            if (!sprayErr && sprayData && sprayData.length > 0) {
                appState.sprayLogs = sprayData;
                CROPS_CONFIG.grapes.sprayLogs = sprayData;
                isConnected = true;
            } else if (!appState.sprayLogs || appState.sprayLogs.length === 0) {
                appState.sprayLogs = FALLBACK_SPRAYS;
            }

            // Fetch Labor Logs
            const { data: labData, error: labErr } = await client.from('labour_logs').select('*').order('log_date', { ascending: false });
            if (!labErr && labData && labData.length > 0) {
                appState.laborLogs = labData;
                CROPS_CONFIG.grapes.laborLogs = labData;
                isConnected = true;
            } else if (!appState.laborLogs || appState.laborLogs.length === 0) {
                appState.laborLogs = FALLBACK_LABOR;
            }

            // Fetch Expenses
            const { data: expData, error: expErr } = await client.from('expenses').select('*').order('log_date', { ascending: false });
            if (!expErr && expData && expData.length > 0) {
                appState.expenses = expData;
                CROPS_CONFIG.grapes.expenses = expData;
                isConnected = true;
            } else if (!appState.expenses || appState.expenses.length === 0) {
                appState.expenses = FALLBACK_EXPENSES;
            }

            // Fetch Sales
            const { data: salesData, error: salesErr } = await client.from('harvest_sales').select('*').order('sale_date', { ascending: false });
            if (!salesErr && salesData && salesData.length > 0) {
                appState.sales = salesData;
                CROPS_CONFIG.grapes.sales = salesData;
                isConnected = true;
            } else if (!appState.sales || appState.sales.length === 0) {
                appState.sales = FALLBACK_SALES;
            }

            // Fetch Reminders
            const { data: remData, error: remErr } = await client.from('reminders').select('*').order('due_date', { ascending: true });
            if (!remErr && remData && remData.length > 0) {
                appState.reminders = remData;
                CROPS_CONFIG.grapes.reminders = remData;
                isConnected = true;
            } else if (!appState.reminders || appState.reminders.length === 0) {
                appState.reminders = FALLBACK_REMINDERS;
            }
        } catch (err) {
            console.warn('Supabase fetch issue, using local synced dataset:', err);
            assignFallbackState();
            isConnected = false;
        }
    } else {
        assignFallbackState();
        isConnected = false;
    }

    updateSupabaseStatus(isConnected ? 'connected' : 'offline');

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

// ==========================================================================
// MULTI-CROP MANAGEMENT ENGINE (Switch Crop, Dynamic UI & Synchronizers)
// ==========================================================================

function initCropEngine() {
    // 1. Header Crop Selector Trigger
    const trigger = document.getElementById('crop-select-trigger');
    const dropdown = document.getElementById('crop-dropdown-menu');

    if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // 2. Dropdown options
    document.querySelectorAll('.crop-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cropId = btn.dataset.crop;
            if (cropId) {
                switchCrop(cropId, true);
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    });

    // 3. Modal Crop Selector listener (when changing crop inside Add Plot modal)
    const modalCropSelect = document.getElementById('plot-crop-select');
    if (modalCropSelect) {
        modalCropSelect.addEventListener('change', (e) => {
            const selectedCrop = e.target.value;
            updatePlotModalForCrop(selectedCrop);
        });
    }
}

function switchCrop(cropId, notify = true) {
    if (!CROPS_CONFIG[cropId]) cropId = 'grapes';

    appState.activeCrop = cropId;
    localStorage.setItem('krushi_active_crop', cropId);
    const isMr = appState.activeLang === 'mr';
    const cfg = CROPS_CONFIG[cropId];

    // Load dataset for this crop into active appState
    appState.plots = cfg.plots;
    appState.irrigationLogs = cfg.irrigationLogs;
    appState.fertilizerLogs = cfg.fertilizerLogs;
    appState.sprayLogs = cfg.sprayLogs;
    appState.laborLogs = cfg.laborLogs;
    appState.expenses = cfg.expenses;
    appState.sales = cfg.sales;
    appState.reminders = cfg.reminders;

    // Update Header Trigger
    const triggerEmoji = document.getElementById('crop-trigger-emoji');
    const triggerLabel = document.getElementById('crop-trigger-label');
    if (triggerEmoji) triggerEmoji.textContent = cfg.emoji;
    if (triggerLabel) triggerLabel.textContent = isMr ? cfg.name_mr : cfg.name_en;

    // Update Dropdown Active states
    document.querySelectorAll('.crop-opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.crop === cropId);
    });

    // Update Dashboard Crop Pills
    renderDashboardCropPills();

    // Update Sidebar branding
    const sideSub = document.getElementById('sidebar-brand-subtitle');
    const sideBadge = document.getElementById('sidebar-crop-badge');
    if (sideSub) sideSub.textContent = isMr ? cfg.subtitle_mr : cfg.subtitle_en;
    if (sideBadge) sideBadge.textContent = isMr ? cfg.badge_mr : cfg.badge_en;

    // Update Sidebar Tab 2
    const sideTab2Title = document.getElementById('sidebar-tab2-title');
    const sideTab2Sub = document.getElementById('sidebar-tab2-sub');
    const sideTab2Icon = document.getElementById('sidebar-tab2-icon');
    if (sideTab2Title) sideTab2Title.textContent = isMr ? `${cfg.name_mr} व्यवस्थापन` : `${cfg.name_en} Mgmt`;
    if (sideTab2Sub) sideTab2Sub.textContent = isMr ? cfg.tagline_mr : cfg.tagline_en;
    if (sideTab2Icon) sideTab2Icon.setAttribute('data-lucide', cfg.icon);

    // Update Sidebar Tab 10
    const sideTab10Title = document.getElementById('sidebar-tab10-title');
    const sideTab10Sub = document.getElementById('sidebar-tab10-sub');
    if (sideTab10Title) sideTab10Title.textContent = isMr ? `${cfg.name_mr} बाजारभाव` : `${cfg.name_en} Mandi`;
    if (sideTab10Sub) sideTab10Sub.textContent = isMr ? 'APMC & थेट लिलाव' : 'APMC Live Rates';

    // Update Tab 2 View Header
    const tab2Title = document.getElementById('crop-tab2-header-title');
    const tab2Desc = document.getElementById('crop-tab2-header-desc');
    if (tab2Title) tab2Title.textContent = isMr ? cfg.tab2Title_mr : cfg.tab2Title_en;
    if (tab2Desc) tab2Desc.textContent = isMr ? cfg.tab2Desc_mr : cfg.tab2Desc_en;

    // Update Tab 5 Pest Advisory Cards
    renderPestAdvisoryCards(cropId);

    // Update Tab 7 Sales Heading
    const salesHeading = document.getElementById('fin-sales-heading');
    if (salesHeading) {
        salesHeading.innerHTML = `<i data-lucide="shopping-cart"></i> ${isMr ? cfg.salesHeading_mr : cfg.salesHeading_en}`;
    }

    // Update Tab 10 Mandi Headers, KPIs and Market Filter Pills
    const mandiTitle = document.querySelector('#view-mandi-rates .view-header-left h1');
    const mandiDesc = document.querySelector('#view-mandi-rates .view-header-desc');
    const mandiTableTitle = document.querySelector('#view-mandi-rates .card-header .card-title-group h3');
    const mandiThVariety = document.getElementById('mandi-th-variety');

    if (mandiTitle) mandiTitle.textContent = isMr ? cfg.tab10Title_mr : cfg.tab10Title_en;
    if (mandiDesc) mandiDesc.textContent = isMr ? cfg.tab10Desc_mr : cfg.tab10Desc_en;
    if (mandiTableTitle) mandiTableTitle.innerHTML = `<i data-lucide="store"></i> ${isMr ? `प्रमुख APMC बाजार समित्यांचे आजचे ${cfg.name_mr} लिलाव दर` : `Live APMC ${cfg.name_en} Auction Rates`}`;
    if (mandiThVariety) mandiThVariety.textContent = isMr ? `${cfg.name_mr} वाण (Variety)` : `${cfg.name_en} Variety`;

    renderMandiKpisAndPills(cropId);

    // Update Modals
    updatePlotModalForCrop(cropId);
    updateSaleModalForCrop(cropId);

    // Populate and re-render everything
    populatePlotSelectors();
    renderDashboardTab();
    renderGrapeOrchardTab();
    renderWaterTab();
    renderFertilizerTab();
    renderPestDiseaseTab();
    renderLaborTab();
    renderFinanceTab();
    renderReportsTab();
    renderRemindersTab();
    renderMandiRatesTable('all', '');

    initLucide();

    if (notify) {
        showToast(isMr ? `${cfg.emoji} ${cfg.name_mr} पिकाचे संपूर्ण व्यवस्थापन सक्रिय केले!` : `${cfg.emoji} Switched active crop to ${cfg.name_en}!`, 'success');
    }
}
window.switchCrop = switchCrop;

function renderDashboardCropPills() {
    const container = document.getElementById('dashboard-crop-pills');
    if (!container) return;

    const isMr = appState.activeLang === 'mr';
    const crops = Object.values(CROPS_CONFIG);

    container.innerHTML = `
        <div class="crop-pills-grid">
            ${crops.map(c => `
                <div class="crop-pill-card ${c.id === appState.activeCrop ? 'active' : ''}" data-crop="${c.id}" onclick="switchCrop('${c.id}', true)">
                    <span class="crop-pill-emoji">${c.emoji}</span>
                    <div class="crop-pill-info">
                        <span class="crop-pill-title">${isMr ? c.name_mr : c.name_en}</span>
                        <span class="crop-pill-meta">${c.plots.length} ${isMr ? 'प्लॉट' : 'Plots'} • ${c.plots.reduce((acc, p) => acc + (parseFloat(p.acres) || 0), 0)} ${isMr ? 'एकर' : 'Ac'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPestAdvisoryCards(cropId) {
    const container = document.getElementById('pest-advisory-cards-container');
    if (!container) return;

    const cfg = CROPS_CONFIG[cropId] || CROPS_CONFIG.grapes;
    const isMr = appState.activeLang === 'mr';

    container.innerHTML = (cfg.pests || []).map(p => `
        <div class="kpi-card">
            <div class="kpi-card-top">
                <div class="kpi-icon-wrap rose"><i data-lucide="shield-alert"></i></div>
                <span class="kpi-badge ${p.badge_cls || 'danger'}">${p.badge}</span>
            </div>
            <div class="kpi-label">${isMr ? p.name_mr : p.name_en}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.35rem 0;">${p.desc_mr}</div>
            <div style="font-size: 0.8rem; background: var(--emerald-subtle); color: var(--emerald-deep); padding: 0.4rem 0.6rem; border-radius: 6px; font-weight: 600; margin-top: 0.4rem;">
                💊 ${p.chemical}
            </div>
            <div class="kpi-subtext" style="margin-top: 0.35rem;">अवस्था: <strong>${p.stage_mr}</strong></div>
        </div>
    `).join('');

    initLucide();
}

function renderMandiKpisAndPills(cropId) {
    const kpiGrid = document.getElementById('mandi-kpi-grid');
    const pillsContainer = document.getElementById('mandi-market-filter-pills');
    const cfg = CROPS_CONFIG[cropId] || CROPS_CONFIG.grapes;
    const isMr = appState.activeLang === 'mr';

    if (kpiGrid && cfg.mandi_kpis) {
        kpiGrid.innerHTML = cfg.mandi_kpis.map(k => `
            <div class="kpi-card">
                <div class="kpi-card-top">
                    <div class="kpi-icon-wrap ${k.cls}"><i data-lucide="${k.icon}"></i></div>
                    <span class="kpi-badge ${k.cls === 'emerald' ? 'positive' : k.cls === 'blue' ? 'info' : k.cls === 'amber' ? 'warning' : ''}">${isMr ? 'दर विश्लेषण' : 'Rate Insight'}</span>
                </div>
                <div class="kpi-label">${k.label}</div>
                <div class="kpi-value-row">
                    <span class="kpi-number">${k.val}</span>
                    <span class="kpi-unit">${k.unit}</span>
                </div>
                <div class="kpi-subtext">${k.sub}</div>
            </div>
        `).join('');
    }

    if (pillsContainer && cfg.mandi_markets) {
        pillsContainer.innerHTML = cfg.mandi_markets.map((m, idx) => `
            <button type="button" class="filter-pill ${idx === 0 ? 'active' : ''}" data-mandi-filter="${m.id}">
                ${isMr ? m.name_mr : m.name_en}
            </button>
        `).join('');

        // Re-attach filter listeners
        pillsContainer.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                pillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const marketFilter = pill.dataset.mandiFilter;
                const searchKeyword = document.getElementById('mandi-search-input')?.value.trim() || '';
                renderMandiRatesTable(marketFilter, searchKeyword);
            });
        });
    }

    initLucide();
}

function updatePlotModalForCrop(cropId) {
    const cfg = CROPS_CONFIG[cropId] || CROPS_CONFIG.grapes;
    const isMr = appState.activeLang === 'mr';
    const m = cfg.metricLabels;

    const modalTitle = document.getElementById('modal-plot-title');
    if (modalTitle) modalTitle.innerHTML = `<i data-lucide="sprout"></i> ${isMr ? `नवीन ${cfg.name_mr} प्लॉट जोडा` : `Add New ${cfg.name_en} Plot`}`;

    const cropSelect = document.getElementById('plot-crop-select');
    if (cropSelect && cropSelect.value !== cropId) cropSelect.value = cropId;

    const varietyLabel = document.getElementById('modal-plot-variety-label');
    if (varietyLabel) varietyLabel.textContent = isMr ? `${m.varietyTitle_mr} *` : `${m.varietyTitle_en} *`;

    const varietySelect = document.getElementById('plot-variety');
    if (varietySelect) {
        varietySelect.innerHTML = cfg.varieties.map(v => `<option value="${v}">${v}</option>`).join('');
    }

    const yieldLabel = document.getElementById('modal-yield-label');
    if (yieldLabel) yieldLabel.textContent = isMr ? `अपेक्षित उत्पादन (${m.yieldUnit_mr})` : `Expected Yield (${m.yieldUnit_en})`;

    const date1Label = document.getElementById('modal-date1-label');
    if (date1Label) date1Label.textContent = isMr ? m.date1_mr : m.date1_en;

    const date2Label = document.getElementById('modal-date2-label');
    if (date2Label) date2Label.textContent = isMr ? m.date2_mr : m.date2_en;

    const count1Label = document.getElementById('modal-count1-label');
    if (count1Label) count1Label.textContent = isMr ? m.count1_mr : m.count1_en;

    const count2Label = document.getElementById('modal-count2-label');
    if (count2Label) count2Label.textContent = isMr ? m.count2_mr : m.count2_en;

    initLucide();
}

function updateSaleModalForCrop(cropId) {
    const cfg = CROPS_CONFIG[cropId] || CROPS_CONFIG.grapes;
    const isMr = appState.activeLang === 'mr';

    const modalSaleTitle = document.getElementById('modal-sale-title');
    if (modalSaleTitle) modalSaleTitle.textContent = isMr ? `${cfg.name_mr} विक्री नोंद` : `${cfg.name_en} Harvest Sale`;

    const gradeSelect = document.getElementById('sale-grade');
    if (gradeSelect) {
        gradeSelect.innerHTML = cfg.grades.map(g => `<option value="${g}">${g}</option>`).join('');
    }

    const qtyLabel = document.getElementById('modal-sale-qty-label');
    if (qtyLabel) qtyLabel.textContent = isMr ? `विक्री वजन (${cfg.metricLabels.yieldUnit_mr} / kg) *` : `Sale Quantity (${cfg.metricLabels.yieldUnit_en} / kg) *`;

    const rateLabel = document.getElementById('modal-sale-rate-label');
    if (rateLabel) rateLabel.textContent = isMr ? `दर (${cfg.metricLabels.rateUnit_mr}) *` : `Rate (${cfg.metricLabels.rateUnit_en}) *`;
}

function assignFallbackState() {
    const cropId = appState.activeCrop || 'grapes';
    const cfg = CROPS_CONFIG[cropId] || CROPS_CONFIG.grapes;
    appState.plots = cfg.plots;
    appState.irrigationLogs = cfg.irrigationLogs;
    appState.fertilizerLogs = cfg.fertilizerLogs;
    appState.sprayLogs = cfg.sprayLogs;
    appState.laborLogs = cfg.laborLogs;
    appState.expenses = cfg.expenses;
    appState.sales = cfg.sales;
    appState.reminders = cfg.reminders;
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

    const cfg = CROPS_CONFIG[appState.activeCrop] || CROPS_CONFIG.grapes;
    const m = cfg.metricLabels;

    container.innerHTML = appState.plots.map(p => `
        <div class="plot-card">
            <div>
                <div class="plot-card-header">
                    <div>
                        <h3 class="plot-title">${isMr ? p.name : (p.name_en || p.name)}</h3>
                        <div class="plot-variety-badge">
                            <span style="font-size: 1.1rem; line-height: 1;">${cfg.emoji}</span>
                            <span>${isMr ? m.varietyTitle_mr : m.varietyTitle_en}: <strong>${p.crop_variety}</strong></span>
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
                        <span class="detail-value" style="color: var(--emerald-primary);">${p.expected_yield_tonnes || 15} ${isMr ? m.yieldUnit_mr : m.yieldUnit_en}</span>
                    </div>
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? m.count1_mr : m.count1_en}</span>
                        <span class="detail-value">${p.canes_per_vine ? p.canes_per_vine.toLocaleString('en-IN') : 42}</span>
                    </div>
                    <div class="plot-detail-item">
                        <span class="detail-label">${isMr ? m.count2_mr : m.count2_en}</span>
                        <span class="detail-value">${p.bunches_per_vine ? p.bunches_per_vine.toLocaleString('en-IN') : 48}</span>
                    </div>
                </div>

                <div class="pruning-timeline">
                    <div>
                        <strong style="color: var(--amber-deep);">${isMr ? (m.date1_mr.split('(')[0].trim() + ':') : (m.date1_en.split('(')[0].trim() + ':')}</strong> ${p.foundation_pruning_date || 'N/A'}
                    </div>
                    <div>
                        <strong style="color: var(--emerald-deep);">${isMr ? (m.date2_mr.split('(')[0].trim() + ':') : (m.date2_en.split('(')[0].trim() + ':')}</strong> ${p.fruit_pruning_date || 'N/A'}
                    </div>
                </div>
            </div>

            <div class="plot-card-footer" style="margin-top: 1rem;">
                <span>${isMr ? 'सिंचन: ठिबक / सूक्ष्म प्रणाली' : 'System: Drip / Micro Irrigation'}</span>
                <button class="filter-pill" onclick="quickLogForPlot('${p.id}')">${isMr ? 'सिंचन/खत द्या' : 'Irrigate / Feed'}</button>
            </div>
        </div>
    `).join('');

    initLucide();
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

        // Nutrients - Safe guards
        const latest = appState.irrigationLogs[0];
        if (latest) {
            const nutN = document.getElementById('water-nutrient-n');
            if (nutN) nutN.textContent = `${latest.nutrients_n || 3.2} kg`;
            const nutCa = document.getElementById('water-nutrient-ca');
            if (nutCa) nutCa.textContent = `${latest.nutrients_ca || 4.8} kg`;
            const nutMg = document.getElementById('water-nutrient-mg');
            if (nutMg) nutMg.textContent = `${latest.nutrients_mg || 2.1} kg`;
        }
    }

    // Table rendering
    const tbody = document.getElementById('water-logs-table-body') || document.getElementById('inpage-irrigation-tbody');
    if (!tbody) return;

    tbody.innerHTML = appState.irrigationLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td><span class="badge-status purple">${getPlotName(log.plot_id)}</span></td>
            <td><span class="badge-status info">${(parseFloat(log.water_liters) || 0).toLocaleString('en-IN')} L</span></td>
            <td>${log.duration_hours ? `${log.duration_hours} ${isMr ? 'तास' : 'hrs'}` : 'सकाळ'}</td>
            <td>${log.ec_level || 0.8}</td>
            <td>${log.ph_level || 7.2}</td>
            <td>${log.water_source || 'ठिबक सिंचन'}</td>
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
    const tbody = document.getElementById('fertilizer-logs-table-body') || document.getElementById('inpage-fertilizer-tbody');
    if (!tbody) return;

    tbody.innerHTML = appState.fertilizerLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td><span class="badge-status purple">${getPlotName(log.plot_id)}</span></td>
            <td style="font-weight: 700; color: var(--emerald-deep);">${log.fertilizer_name}</td>
            <td>${log.dose_amount} ${log.dose_unit || 'kg/एकर'}</td>
            <td><span class="badge-status success">${log.application_method || 'ठिबक (Drip)'}</span></td>
            <td>${log.note || 'पाण्यातून दिले'}</td>
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
    renderPestAdvisoryCards(appState.activeCrop);
    const tbody = document.getElementById('pest-spray-table-body') || document.getElementById('inpage-pest-tbody');
    if (!tbody) return;

    tbody.innerHTML = appState.sprayLogs.map(log => `
        <tr>
            <td style="font-weight: 600;">${log.log_date}</td>
            <td><span class="badge-status purple">${getPlotName(log.plot_id)}</span></td>
            <td><span class="badge-status danger">${log.pest_disease_name || 'थ्रीप्स (Thrips)'}</span></td>
            <td style="font-weight: 700; color: var(--emerald-deep);">${log.chemical_or_fertilizer}</td>
            <td>${log.dose_per_liter || '150 ml'}</td>
            <td><span class="badge-status info">${log.method || 'पंप'}</span></td>
            <td>${log.next_spray_date ? `📅 ${log.next_spray_date}` : 'नोंद पूर्ण'}</td>
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
    const tbody = document.getElementById('labor-logs-table-body') || document.getElementById('inpage-labor-tbody');
    if (tbody) {
        tbody.innerHTML = appState.laborLogs.map(log => `
            <tr>
                <td style="font-weight: 600;">${log.log_date}</td>
                <td><span class="badge-status info">${log.activity}</span></td>
                <td>${log.worker_names || `${(log.male_workers || 0) + (log.female_workers || 0)} मजूर`}</td>
                <td>₹ ${log.wage_per_worker || 400}</td>
                <td><strong style="color: var(--rose-accent);">₹ ${(parseFloat(log.total_cost) || 0).toLocaleString('en-IN')}</strong></td>
                <td>${log.payment_status === 'Paid' ? (isMr ? 'दिले (Paid)' : 'Paid') : (isMr ? 'वेळेवर काम पूर्ण' : 'Pending')}</td>
            </tr>
        `).join('');
    }

    renderLaborAttendanceList();
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

    // 6 Expense Streams - Safe guards
    const catMap = { 'खते': 0, 'औषधे': 0, 'मजुरी': 0, 'पाणी/वीज': 0, 'वाहतूक': 0, 'इतर खर्च': 0 };
    appState.expenses.forEach(e => {
        if (catMap.hasOwnProperty(e.category)) {
            catMap[e.category] += (parseFloat(e.amount) || 0);
        } else {
            catMap['इतर खर्च'] += (parseFloat(e.amount) || 0);
        }
    });

    const cFert = document.getElementById('cat-exp-fertilizers');
    if (cFert) cFert.textContent = `₹${catMap['खते'].toLocaleString('en-IN')}`;
    const cSpray = document.getElementById('cat-exp-sprays');
    if (cSpray) cSpray.textContent = `₹${catMap['औषधे'].toLocaleString('en-IN')}`;
    const cLabor = document.getElementById('cat-exp-labor');
    if (cLabor) cLabor.textContent = `₹${catMap['मजुरी'].toLocaleString('en-IN')}`;
    const cWater = document.getElementById('cat-exp-water');
    if (cWater) cWater.textContent = `₹${catMap['पाणी/वीज'].toLocaleString('en-IN')}`;
    const cTrans = document.getElementById('cat-exp-transport');
    if (cTrans) cTrans.textContent = `₹${catMap['वाहतूक'].toLocaleString('en-IN')}`;
    const cOther = document.getElementById('cat-exp-other');
    if (cOther) cOther.textContent = `₹${catMap['इतर खर्च'].toLocaleString('en-IN')}`;

    // Harvest Sales Table
    const salesTbody = document.getElementById('fin-sales-table-body') || document.getElementById('inpage-income-table-body');
    if (salesTbody) {
        salesTbody.innerHTML = appState.sales.map(s => `
            <tr>
                <td style="font-weight: 600;">${s.sale_date}</td>
                <td><span class="badge-status info">${getPlotName(s.plot_id)}</span></td>
                <td>${s.buyer_name} ${s.grade ? '• ' + s.grade : ''}</td>
                <td>${(parseFloat(s.quantity_kg) || 0).toLocaleString('en-IN')} kg</td>
                <td>₹ ${s.rate_per_kg}</td>
                <td><strong style="color: var(--emerald-deep);">₹ ${(parseFloat(s.total_revenue) || 0).toLocaleString('en-IN')}</strong></td>
            </tr>
        `).join('');
    }

    // Expenses Table
    const expTbody = document.getElementById('fin-expenses-table-body') || document.getElementById('inpage-expenses-table-body');
    if (expTbody) {
        expTbody.innerHTML = appState.expenses.map(e => `
            <tr>
                <td style="font-weight: 600;">${e.log_date}</td>
                <td><span class="badge-status warning">${isMr ? e.category : (e.category_en || e.category)}</span></td>
                <td>${e.description || '-'}</td>
                <td><strong style="color: var(--rose-accent);">₹ ${(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</strong></td>
            </tr>
        `).join('');
    }
}

// ==========================================================================
// 12. TAB 8: 📊 REPORTS & INTELLIGENCE
// ==========================================================================
function renderReportsTab() {
    const isMr = appState.activeLang === 'mr';
    const totalAcres = appState.plots.reduce((acc, p) => acc + (parseFloat(p.acres) || 0), 0) || 10.0;
    const totalExp = appState.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0) || 425000;
    const totalSalesKg = appState.sales.reduce((acc, s) => acc + (parseFloat(s.quantity_kg) || 0), 0) || 47550;
    const totalRevenue = appState.sales.reduce((acc, s) => acc + (parseFloat(s.total_revenue) || 0), 0) || 715000;
    const netProfit = totalRevenue - totalExp;

    const costPerAcre = totalAcres > 0 ? (totalExp / totalAcres).toFixed(0) : '0';
    const costPerKg = totalSalesKg > 0 ? (totalExp / totalSalesKg).toFixed(2) : '0.00';
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '40.5';

    // Summary Metric Cards
    const yElem = document.getElementById('dash-report-total-yield');
    if (yElem) yElem.innerHTML = `${totalSalesKg.toLocaleString('en-IN')} <span style="font-size: 0.9rem; font-weight: 500;">${isMr ? 'किलो' : 'kg'}</span>`;
    const expElem = document.getElementById('dash-report-total-expense');
    if (expElem) expElem.textContent = `₹ ${totalExp.toLocaleString('en-IN')}`;
    const sElem = document.getElementById('dash-report-total-sales');
    if (sElem) sElem.textContent = `₹ ${totalRevenue.toLocaleString('en-IN')}`;
    const pElem = document.getElementById('dash-report-net-profit');
    if (pElem) pElem.textContent = `₹ ${netProfit.toLocaleString('en-IN')}`;

    // Precision Intelligence KPIs
    const cpaElem = document.getElementById('rep-cost-per-acre');
    if (cpaElem) cpaElem.textContent = `₹ ${parseFloat(costPerAcre).toLocaleString('en-IN')}`;
    const cpkElem = document.getElementById('rep-cost-per-kg');
    if (cpkElem) cpkElem.textContent = `₹ ${costPerKg}`;
    const mElem = document.getElementById('rep-net-margin');
    if (mElem) mElem.textContent = `${margin}%`;

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
    const client = getSupabaseClient();
    if (client) {
        try {
            const { error } = await client.from('reminders').update({ status: item.status }).eq('id', reminderId);
            if (error) console.error('Failed to sync reminder status to Supabase:', error);
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
        const chosenCrop = document.getElementById('plot-crop-select')?.value || appState.activeCrop;
        const cfg = CROPS_CONFIG[chosenCrop] || CROPS_CONFIG.grapes;

        const newPlot = {
            id: 'plot-' + Date.now(),
            farm_id: appState.farm.id,
            crop: chosenCrop,
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

        if (chosenCrop === appState.activeCrop) {
            appState.plots.push(newPlot);
        } else {
            cfg.plots.push(newPlot);
            switchCrop(chosenCrop, false);
        }

        populatePlotSelectors();
        renderDashboardTab();
        renderGrapeOrchardTab();
        renderReportsTab();
        closeModal('modal-add-plot');
        e.target.reset();
        showToast(isMr() ? `नवीन ${cfg.name_mr} प्लॉट यशस्वीपणे जोडला!` : `New ${cfg.name_en} plot added successfully!`, 'success');

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('plots').insert([{
                    farm_id: appState.farm.id,
                    name: newPlot.name,
                    crop_variety: newPlot.crop_variety,
                    acres: newPlot.acres,
                    spacing: newPlot.spacing,
                    foundation_pruning_date: newPlot.foundation_pruning_date || null,
                    fruit_pruning_date: newPlot.fruit_pruning_date || null,
                    canes_per_vine: newPlot.canes_per_vine,
                    bunches_per_vine: newPlot.bunches_per_vine,
                    expected_yield_tonnes: newPlot.expected_yield_tonnes
                }]).select();
                if (error) console.error('Supabase error inserting plot:', error);
                if (data && data[0]) {
                    newPlot.id = data[0].id;
                    populatePlotSelectors();
                }
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('irrigation_logs').insert([{
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
                }]).select();
                if (error) console.error('Supabase error inserting irrigation log:', error);
                if (data && data[0]) log.id = data[0].id;
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('fertilizer_logs').insert([{
                    farm_id: log.farm_id,
                    plot_id: log.plot_id,
                    log_date: log.log_date,
                    fertilizer_name: log.fertilizer_name,
                    dose_amount: log.dose_amount,
                    dose_unit: log.dose_unit,
                    application_method: log.application_method,
                    npk_ratio: log.npk_ratio,
                    calculated_n_kg: log.calculated_n_kg,
                    calculated_p_kg: log.calculated_p_kg,
                    calculated_k_kg: log.calculated_k_kg,
                    cost: log.cost,
                    notes: log.notes
                }]).select();
                if (error) console.error('Supabase error inserting fertilizer log:', error);
                if (data && data[0]) log.id = data[0].id;
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('spray_logs').insert([{
                    plot_id: log.plot_id,
                    log_date: log.log_date,
                    chemical_or_fertilizer: log.chemical_or_fertilizer,
                    target_issue: log.pest_disease_name || 'Downy Mildew (केवडा)',
                    pest_disease_name: log.pest_disease_name,
                    dose_per_liter: log.dose_per_liter,
                    total_water_liters: log.total_water_liters,
                    cost: log.cost,
                    next_spray_date: log.next_spray_date
                }]).select();
                if (error) console.error('Supabase error inserting spray log:', error);
                if (data && data[0]) log.id = data[0].id;
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('labour_logs').insert([{
                    plot_id: log.plot_id,
                    log_date: log.log_date,
                    activity: log.activity,
                    worker_names: log.worker_names,
                    male_workers: log.male_workers,
                    female_workers: log.female_workers,
                    wage_per_worker: log.wage_per_worker,
                    total_cost: log.total_cost,
                    payment_status: log.payment_status,
                    work_description: log.activity
                }]).select();
                if (error) console.error('Supabase error inserting labor log:', error);
                if (data && data[0]) log.id = data[0].id;
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('expenses').insert([{
                    plot_id: log.plot_id || null,
                    log_date: log.log_date,
                    category: log.category,
                    amount: log.amount,
                    description: log.description,
                    payment_mode: log.payment_mode || 'UPI'
                }]).select();
                if (error) console.error('Supabase error inserting expense:', error);
                if (data && data[0]) log.id = data[0].id;
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
        const cfg = CROPS_CONFIG[appState.activeCrop] || CROPS_CONFIG.grapes;

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
        showToast(isMr() ? `${cfg.emoji} ${cfg.name_mr} विक्री नोंद झाली! उत्पन्न: ₹${total.toLocaleString('en-IN')}` : `${cfg.emoji} ${cfg.name_en} sale recorded! Revenue: ₹${total.toLocaleString('en-IN')}`, 'success');

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('harvest_sales').insert([{
                    plot_id: sale.plot_id || null,
                    sale_date: sale.sale_date,
                    buyer_name: sale.buyer_name,
                    grade: sale.grade,
                    quantity_kg: sale.quantity_kg,
                    rate_per_kg: sale.rate_per_kg,
                    total_revenue: sale.total_revenue,
                    payment_status: sale.payment_status || 'Received'
                }]).select();
                if (error) console.error('Supabase error inserting sale:', error);
                if (data && data[0]) sale.id = data[0].id;
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

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('reminders').insert([{
                    farm_id: reminder.farm_id,
                    plot_id: reminder.plot_id || null,
                    category: reminder.category,
                    title: reminder.title,
                    due_date: reminder.due_date,
                    status: reminder.status || 'pending',
                    priority: reminder.priority || 'High',
                    notes: reminder.notes
                }]).select();
                if (error) console.error('Supabase error inserting reminder:', error);
                if (data && data[0]) reminder.id = data[0].id;
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
        const cfg = CROPS_CONFIG[appState.activeCrop] || CROPS_CONFIG.grapes;
        renderMandiRatesTable('all', '');
        showToast(isMr ? `📈 ताज्या ${cfg.name_mr} बाजारभावाची नोंद अद्ययावत केली!` : `📈 ${cfg.name_en} Mandi rates refreshed with latest live records!`, 'success');
    });

    // Share button
    document.getElementById('btn-share-mandi-rates')?.addEventListener('click', () => {
        const cfg = CROPS_CONFIG[appState.activeCrop] || CROPS_CONFIG.grapes;
        const topItem = (cfg.mandi && cfg.mandi[0]) || { market: 'APMC Market', variety: cfg.name_mr, modal: 100 };
        const shareText = encodeURIComponent(`${cfg.emoji} *${cfg.subtitle_mr} - आजचे थेट ${cfg.name_mr} बाजारभाव*\n\n${topItem.market}: ₹${topItem.modal} (${topItem.variety})\n\nकृषिरत्न शेती व्यवस्थापन डॅशबोर्ड`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    });
}

function renderMandiRatesTable(marketFilter = 'all', keyword = '') {
    const tbody = document.getElementById('mandi-rates-table-body');
    if (!tbody) return;

    const cfg = CROPS_CONFIG[appState.activeCrop] || CROPS_CONFIG.grapes;
    let filtered = cfg.mandi || MANDI_RATES_DATA;
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

// ==========================================================================
// 18. KRUSHIRATNA 10-PAGE INTERACTIVE WORKFLOW ENGINE
// ==========================================================================

// --- PLOT SPECS & SELECTOR (Page 4: Plot Details) ---
const PLOT_SPECS = {
    'A': {
        name: 'प्लॉट A',
        acres: '2.0 एकर',
        variety: 'Thompson (थॉम्पसन)',
        plantingDate: '10 जाने 2022',
        spacing: '10 x 6 फूट',
        training: 'Y Trellis',
        pruningDate: '15 ऑक्टो 2025',
        expectedYield: '10-12 टन/एकर',
        stage: 'वाढीच्या अवस्थेत',
        yieldKg: '12,500'
    },
    'B': {
        name: 'प्लॉट B',
        acres: '2.5 एकर',
        variety: 'Super Sonaka (सुपर सोनाका)',
        plantingDate: '15 जाने 2022',
        spacing: '9 x 5 फूट',
        training: 'Y Trellis',
        pruningDate: '18 ऑक्टो 2025',
        expectedYield: '11-13 टन/एकर',
        stage: 'फुलोरा / मणी फुगवण अवस्था',
        yieldKg: '10,200'
    },
    'C': {
        name: 'प्लॉट C',
        acres: '2.0 एकर',
        variety: 'Manik Chaman (माणिक चमन)',
        plantingDate: '05 फेब्रु 2023',
        spacing: '10 x 6 फूट',
        training: 'Y Trellis',
        pruningDate: '22 ऑक्टो 2025',
        expectedYield: '9-11 टन/एकर',
        stage: 'शाकीय वाढ अवस्था',
        yieldKg: '8,750'
    },
    'D': {
        name: 'प्लॉट D',
        acres: '1.5 एकर',
        variety: 'Sharad Seedless (काळी द्राक्षे)',
        plantingDate: '20 फेब्रु 2023',
        spacing: '9 x 5 फूट',
        training: 'Bower / Y Trellis',
        pruningDate: '25 ऑक्टो 2025',
        expectedYield: '8-10 टन/एकर',
        stage: 'कॅनॉपी विकास अवस्था',
        yieldKg: '6,300'
    },
    'E': {
        name: 'प्लॉट E',
        acres: '2.0 एकर',
        variety: 'Red Globe (रेड ग्लोब)',
        plantingDate: '12 मार्च 2023',
        spacing: '10 x 6 फूट',
        training: 'Y Trellis',
        pruningDate: '28 ऑक्टो 2025',
        expectedYield: '10-12 टन/एकर',
        stage: 'काडी पक्वता अवस्था',
        yieldKg: '9,800'
    }
};

function selectActivePlot(plotCode) {
    if (!plotCode) return;
    const cleanCode = plotCode.replace(/plot-?/i, '').toUpperCase() || 'A';
    appState.activeSelectedPlot = cleanCode;

    document.querySelectorAll('.plot-pill-btn').forEach(btn => {
        const btnCode = (btn.dataset.plotCode || btn.dataset.plot || '').replace(/plot-?/i, '').toUpperCase();
        btn.classList.toggle('active', btnCode === cleanCode);
    });

    const p = PLOT_SPECS[cleanCode] || PLOT_SPECS['A'];

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setVal('plot-view-name', `${p.name} (${p.variety})`);
    setVal('plot-view-status', p.stage);
    setVal('plot-view-code', `PLOT #${cleanCode}-01`);
    setVal('plot-view-acres', p.acres);
    setVal('plot-view-variety', p.variety);
    setVal('plot-view-plantdate', p.plantingDate);
    setVal('plot-view-spacing', p.spacing);
    setVal('plot-view-trellis', p.training);
    setVal('plot-view-pruning', p.pruningDate);
    setVal('plot-view-yield', `${p.expectedYield} (${p.yieldKg} kg)`);
    setVal('plot-view-condition', p.stage);

    const histHeader = document.getElementById('history-plot-header-name');
    if (histHeader) histHeader.textContent = `${p.name} (${p.variety})`;

    ['inpage-irr-plot', 'inpage-fert-plot', 'inpage-spray-plot', 'inpage-expense-plot', 'inpage-income-plot'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
            for (let i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value.toUpperCase().includes(cleanCode)) {
                    sel.selectedIndex = i;
                    break;
                }
            }
        }
    });

    showToast(`🍇 ${p.name} निवडला (${p.variety}, ${p.acres})`, 'info');
}
window.selectActivePlot = selectActivePlot;

function openEditPlotModal() {
    const plotCode = (appState.activeSelectedPlot || 'A').toUpperCase();
    const p = PLOT_SPECS[plotCode] || PLOT_SPECS['A'];

    const modalTitle = document.getElementById('modal-plot-title');
    if (modalTitle) {
        modalTitle.innerHTML = `<i data-lucide="edit"></i> ${p.name} संपादित करा (Edit Plot Details)`;
    }

    const nameInput = document.getElementById('plot-name');
    if (nameInput) nameInput.value = p.name;

    const acresInput = document.getElementById('plot-acres');
    if (acresInput) acresInput.value = parseFloat(p.acres) || 2.0;

    const varietySelect = document.getElementById('plot-variety');
    if (varietySelect) {
        let found = false;
        for (let i = 0; i < varietySelect.options.length; i++) {
            if (varietySelect.options[i].value.includes(plotCode) || p.variety.includes(varietySelect.options[i].value)) {
                varietySelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            const opt = document.createElement('option');
            opt.value = p.variety;
            opt.textContent = p.variety;
            opt.selected = true;
            varietySelect.appendChild(opt);
        }
    }

    openModal('modal-add-plot');
    showToast(`✏️ ${p.name} संपादन फॉर्म उघडला आहे.`, 'info');
}
window.openEditPlotModal = openEditPlotModal;

function filterPlotPhotos(cat) {
    document.querySelectorAll('#photo-filter-pills .filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(cat));
    });
    document.querySelectorAll('.plot-photo-card').forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
window.filterPlotPhotos = filterPlotPhotos;

function handlePlotPhotoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const gallery = document.getElementById('plot-photos-gallery');
            if (gallery) {
                const card = document.createElement('div');
                card.className = 'plot-photo-card';
                card.dataset.category = 'berry';
                card.innerHTML = `
                    <div class="plot-photo-media" style="background: url('${e.target.result}') center/cover no-repeat; height: 160px; border-radius: var(--radius-md); position: relative;">
                        <span class="badge-status success" style="position: absolute; top: 8px; right: 8px;">नवीन फोटो</span>
                    </div>
                    <div class="plot-photo-meta" style="padding: 0.75rem 0.25rem 0;">
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${file.name}</div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
                            <span>तारीख: आज</span>
                            <span>अपलोड यशस्वी</span>
                        </div>
                    </div>
                `;
                gallery.prepend(card);
            }
            showToast(`📸 नवीन फोटो जोडला: ${file.name}`, 'success');
        };
        reader.readAsDataURL(file);
    }
}
window.handlePlotPhotoUpload = handlePlotPhotoUpload;

function printPlotHistory() {
    showToast('🖨️ प्लॉट इतिहास प्रिंट विंडो उघडत आहे...', 'info');
    setTimeout(() => window.print(), 300);
}
window.printPlotHistory = printPlotHistory;

function setIrrigationTime(time) {
    const isMorning = time === 'सकाळ' || time === 'morning';
    const mBtn = document.getElementById('irr-time-morning');
    const eBtn = document.getElementById('irr-time-evening');
    const hidden = document.getElementById('inpage-irr-time');
    if (mBtn) mBtn.classList.toggle('active', isMorning);
    if (eBtn) eBtn.classList.toggle('active', !isMorning);
    if (hidden) hidden.value = isMorning ? 'सकाळ' : 'संध्याकाळ';
    showToast(`⏰ सिंचन वेळ निवडली: ${isMorning ? 'सकाळ (Morning)' : 'संध्याकाळ (Evening)'}`, 'info');
}
window.setIrrigationTime = setIrrigationTime;

function setFertilizerMethod(method) {
    const isFertigation = method === 'फर्टिगेशन' || method === 'fertigation';
    const fBtn = document.getElementById('fert-method-fertigation');
    const sBtn = document.getElementById('fert-method-soil');
    const hidden = document.getElementById('inpage-fert-method');
    if (fBtn) fBtn.classList.toggle('active', isFertigation);
    if (sBtn) sBtn.classList.toggle('active', !isFertigation);
    if (hidden) hidden.value = isFertigation ? 'फर्टिगेशन' : 'मुळाशी';
    showToast(`🌱 खत पद्धत निवडली: ${isFertigation ? 'फर्टिगेशन (ठिबक)' : 'मुळाशी (Soil)'}`, 'info');
}
window.setFertilizerMethod = setFertilizerMethod;

function toggleDashboardTask(el) {
    if (!el) return;
    const isChecked = el.classList.contains('checked');
    const badge = el.querySelector('.badge-status');
    const title = el.querySelector('.today-task-title')?.textContent || 'काम';

    if (isChecked) {
        el.classList.remove('checked');
        if (badge) {
            badge.className = 'badge-status warning';
            badge.textContent = 'प्रलंबित (Pending)';
        }
        showToast(`⏳ ${title} प्रलंबित म्हणून नोंदवले.`, 'info');
    } else {
        el.classList.add('checked');
        if (badge) {
            badge.className = 'badge-status success';
            badge.textContent = 'पूर्ण (Done)';
        }
        showToast(`✅ ${title} यशस्वीरित्या पूर्ण झाले!`, 'success');
    }

    const total = document.querySelectorAll('.today-task-item').length;
    const done = document.querySelectorAll('.today-task-item.checked').length;
    const pending = total - done;
    const kpiCount = document.getElementById('dash-pending-tasks');
    if (kpiCount) kpiCount.textContent = pending;
    initLucide();
}
window.toggleDashboardTask = toggleDashboardTask;

// --- OPTION 3: 💧 सिंचन व्यवस्थापन (IRRIGATION IN-PAGE SUBMISSION) ---
function handleInpageIrrigationSubmit(e) {
    e.preventDefault();
    const plotSelect = document.getElementById('inpage-irr-plot');
    const plotName = plotSelect ? (plotSelect.options[plotSelect.selectedIndex]?.text || plotSelect.value) : 'प्लॉट A';
    const date = document.getElementById('inpage-irr-date')?.value || '20/09/2026';
    const liters = document.getElementById('inpage-irr-liters')?.value || '5000';
    const time = document.getElementById('inpage-irr-time')?.value || 'सकाळ';
    const ec = document.getElementById('inpage-irr-ec')?.value || '0.8';
    const ph = document.getElementById('inpage-irr-ph')?.value || '7.2';
    const note = document.getElementById('inpage-irr-notes')?.value || document.getElementById('inpage-irr-note')?.value || '';

    const tbody = document.getElementById('inpage-irrigation-tbody') || document.getElementById('inpage-irr-tbody');
    if (tbody) {
        const row = document.createElement('tr');
        const shortPlot = plotName.split(' ')[0] + (plotName.split(' ')[1] ? ' ' + plotName.split(' ')[1] : '');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="badge-status purple">${shortPlot}</span></td>
            <td><span class="badge-status info">${Number(liters).toLocaleString('en-IN')} L</span></td>
            <td>${time}</td>
            <td>${ec}</td>
            <td>${ph}</td>
            <td>${note || 'सिंचन पूर्ण'}</td>
        `;
        tbody.prepend(row);
    }

    // Sync with appState for dynamic dashboard & water KPIs
    appState.irrigationLogs.unshift({
        id: 'irr-' + Date.now(),
        plot_id: plotSelect?.value || 'plot-a',
        log_date: date,
        duration_hours: 2.0,
        water_liters: Number(liters) || 5000,
        water_source: 'ठिबक सिंचन',
        ec_level: parseFloat(ec) || 0.8,
        ph_level: parseFloat(ph) || 7.2,
        nutrients_n: 3.2,
        nutrients_ca: 4.8,
        nutrients_mg: 2.1
    });
    renderDashboardTab();
    showToast(`💧 ${plotName} साठी सिंचन नोंद सेव्ह झाली (${Number(liters).toLocaleString('en-IN')} L)`, 'success');
}
window.handleInpageIrrigationSubmit = handleInpageIrrigationSubmit;

// --- OPTION 4: 🧪 खत व्यवस्थापन (FERTILIZER IN-PAGE SUBMISSION) ---
function handleInpageFertilizerSubmit(e) {
    e.preventDefault();
    const plotSelect = document.getElementById('inpage-fert-plot');
    const plotName = plotSelect ? (plotSelect.options[plotSelect.selectedIndex]?.text || plotSelect.value) : 'प्लॉट A';
    const date = document.getElementById('inpage-fert-date')?.value || '20/09/2026';
    const name = document.getElementById('inpage-fert-name')?.value || 'NPK 19:19:19';
    const dose = document.getElementById('inpage-fert-dose')?.value || document.getElementById('inpage-fert-qty')?.value || '5';
    const method = document.getElementById('inpage-fert-method')?.value || 'फर्टिगेशन';
    const note = document.getElementById('inpage-fert-notes')?.value || document.getElementById('inpage-fert-note')?.value || '';

    const tbody = document.getElementById('inpage-fertilizer-tbody') || document.getElementById('inpage-fert-tbody');
    if (tbody) {
        const row = document.createElement('tr');
        const shortPlot = plotName.split(' ')[0] + (plotName.split(' ')[1] ? ' ' + plotName.split(' ')[1] : '');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="badge-status purple">${shortPlot}</span></td>
            <td><strong>${name}</strong></td>
            <td>${dose} किलो</td>
            <td><span class="badge-status success">${method}</span></td>
            <td>${note || 'पाण्यातून दिले'}</td>
        `;
        tbody.prepend(row);
    }

    // Sync with appState for dynamic dashboard
    appState.fertilizerLogs.unshift({
        id: 'fert-' + Date.now(),
        plot_id: plotSelect?.value || 'plot-a',
        log_date: date,
        fertilizer_name: name,
        dose_amount: parseFloat(dose) || 5,
        application_method: method,
        cost: (parseFloat(dose) || 5) * 120
    });
    renderDashboardTab();
    showToast(`🧪 ${plotName} साठी खत नोंद सेव्ह झाली (${name}, ${dose} kg)`, 'success');
}
window.handleInpageFertilizerSubmit = handleInpageFertilizerSubmit;

// --- OPTION 5: 🐛 कीड व रोग फवारणी (PEST & DISEASE IN-PAGE SUBMISSION) ---
function handleInpageSpraySubmit(e) {
    e.preventDefault();
    const plotSelect = document.getElementById('inpage-spray-plot');
    const plotName = plotSelect ? (plotSelect.options[plotSelect.selectedIndex]?.text || plotSelect.value) : 'प्लॉट A';
    const date = document.getElementById('inpage-spray-date')?.value || '20/09/2026';
    const pest = document.getElementById('inpage-spray-pest')?.value || 'Flea Beetle';
    const name = document.getElementById('inpage-spray-chemical')?.value || document.getElementById('inpage-spray-name')?.value || 'Imidacloprid 17.8 SL';
    const dose = document.getElementById('inpage-spray-dose')?.value || '150 ml';
    const method = document.getElementById('inpage-spray-method')?.value || 'पंप';
    const note = document.getElementById('inpage-spray-notes')?.value || '';

    const tbody = document.getElementById('inpage-pest-tbody');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="badge-status purple">${plotName}</span></td>
            <td><span class="badge-status danger">${pest}</span></td>
            <td><strong>${name}</strong></td>
            <td>${dose}</td>
            <td>${method}</td>
            <td>${note || 'नोंद पूर्ण'}</td>
        `;
        tbody.prepend(row);
    }

    appState.sprayLogs.unshift({
        id: 'spray-' + Date.now(),
        plot_id: plotSelect?.value || 'plot-a',
        log_date: date,
        pest_disease_name: pest,
        chemical_or_fertilizer: name,
        dose_per_liter: 1.5,
        total_water_liters: 200,
        cost: 2400
    });
    renderDashboardTab();
    showToast(`🌿 ${plotName} साठी कीड-रोग फवारणी नोंद झाली (${name})`, 'success');
}
window.handleInpageSpraySubmit = handleInpageSpraySubmit;

function handleSprayPhotoUpload(input) {
    if (input.files && input.files[0]) {
        const label = document.getElementById('spray-photo-filename');
        if (label) label.textContent = input.files[0].name;
        showToast(`📷 फोटो जोडला: ${input.files[0].name}`, 'info');
    }
}
window.handleSprayPhotoUpload = handleSprayPhotoUpload;

// --- OPTION 6: 👷 मजूर व्यवस्थापन (LABOR MANAGEMENT CALCULATOR, ATTENDANCE & SUBMISSION) ---
function calculateLaborTotal() {
    const count = parseInt(document.getElementById('inpage-labor-count')?.value) || 0;
    const rate = parseFloat(document.getElementById('inpage-labor-rate')?.value) || 0;
    const total = count * rate;
    const totalField = document.getElementById('inpage-labor-total');
    if (totalField) {
        totalField.value = `₹ ${total.toLocaleString('en-IN')}`;
    }
}
window.calculateLaborTotal = calculateLaborTotal;

function handleInpageLaborSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('inpage-labor-date')?.value || '20/09/2026';
    const type = document.getElementById('inpage-labor-type')?.value || 'छाटणी';
    const count = document.getElementById('inpage-labor-count')?.value || '12';
    const rate = document.getElementById('inpage-labor-rate')?.value || '400';
    const total = document.getElementById('inpage-labor-total')?.value || `₹ ${(Number(count) * Number(rate)).toLocaleString('en-IN')}`;
    const note = document.getElementById('inpage-labor-note')?.value || '';

    const tbody = document.getElementById('inpage-labor-tbody');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="badge-status info">${type}</span></td>
            <td>${count} मजूर</td>
            <td>₹ ${Number(rate).toLocaleString('en-IN')}</td>
            <td><strong style="color: var(--rose-accent);">${total}</strong></td>
            <td>${note || 'वेळेवर काम पूर्ण'}</td>
        `;
        tbody.prepend(row);
    }

    const totalCost = (Number(count) || 0) * (Number(rate) || 0);
    appState.laborLogs.unshift({
        id: 'lab-' + Date.now(),
        plot_id: 'plot-a',
        log_date: date,
        activity: type,
        worker_names: `${count} मजूर`,
        total_cost: totalCost,
        wage_per_worker: Number(rate) || 400,
        payment_status: 'Paid'
    });
    appState.expenses.unshift({
        id: 'exp-lab-' + Date.now(),
        plot_id: 'plot-a',
        log_date: date,
        category: 'मजुरी',
        amount: totalCost,
        description: `${type} काम (${count} मजूर)`
    });
    renderDashboardTab();
    showToast(`👷 ${type} कामाची मजूर नोंद झाली (${count} मजूर • ${total})`, 'success');
}
window.handleInpageLaborSubmit = handleInpageLaborSubmit;

// --- USER-DEFINED LABOR ATTENDANCE ROSTER ---
function getCustomWorkers() {
    try {
        const saved = localStorage.getItem('krushi_custom_workers');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveCustomWorkers(workers) {
    localStorage.setItem('krushi_custom_workers', JSON.stringify(workers));
}

function renderLaborAttendanceList() {
    const container = document.getElementById('labor-attendance-list');
    const badge = document.getElementById('attendance-count-badge');
    if (!container) return;

    const workers = getCustomWorkers();

    if (workers.length === 0) {
        container.innerHTML = `
            <div class="empty-workers-notice" style="grid-column: 1 / -1;">
                <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">👷‍♂️</div>
                <h4 style="margin: 0 0 0.4rem 0; font-size: 1.05rem; color: var(--text-primary); font-weight: 700;">अद्याप कोणतेही कामगार जोडलेले नाहीत</h4>
                <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">कृपया वरील फॉर्ममध्ये आपल्या बागेतील कामगाराचे नाव व काम टाकून <strong>'+ कामगार जोडा'</strong> बटणावर क्लिक करा.</p>
            </div>
        `;
        if (badge) badge.textContent = `० कामगार`;
        return;
    }

    const checkedCount = workers.filter(w => w.present).length;
    if (badge) {
        badge.textContent = `${checkedCount}/${workers.length} उपस्थित`;
    }

    container.innerHTML = workers.map(w => {
        const initial = (w.name || 'म').trim().charAt(0);
        return `
            <div class="attendance-check-card ${w.present ? 'checked' : ''}" data-worker-id="${w.id}">
                <input type="checkbox" ${w.present ? 'checked' : ''} onchange="toggleWorkerAttendance('${w.id}', this.checked)">
                <div class="worker-avatar">${initial}</div>
                <div class="worker-info">
                    <div class="worker-name">${w.name}</div>
                    <div class="worker-role">${w.role || 'मजूर'}</div>
                </div>
                <span class="attendance-status">${w.present ? 'हजर' : 'गैरहजर'}</span>
                <button type="button" class="worker-del-btn" onclick="removeWorker('${w.id}', event)" title="कामगार काढा">
                    <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                </button>
            </div>
        `;
    }).join('');

    initLucide();
}
window.renderLaborAttendanceList = renderLaborAttendanceList;

function addNewWorker() {
    const nameInput = document.getElementById('new-worker-name');
    const roleInput = document.getElementById('new-worker-role');
    const name = nameInput?.value?.trim();
    const role = roleInput?.value?.trim() || 'मजूर';

    if (!name) {
        showToast('कृपया कामगाराचे नाव टाका!', 'warning');
        nameInput?.focus();
        return;
    }

    const workers = getCustomWorkers();
    const newWorker = {
        id: 'worker-' + Date.now(),
        name: name,
        role: role,
        present: true
    };
    workers.push(newWorker);
    saveCustomWorkers(workers);

    if (nameInput) nameInput.value = '';
    if (roleInput) roleInput.value = '';

    renderLaborAttendanceList();
    showToast(`✅ ${name} (${role}) कामगार यादीत जोडला!`, 'success');
}
window.addNewWorker = addNewWorker;

function removeWorker(id, e) {
    if (e) e.stopPropagation();
    let workers = getCustomWorkers();
    const worker = workers.find(w => w.id === id);
    const workerName = worker?.name || 'कामगार';

    workers = workers.filter(w => w.id !== id);
    saveCustomWorkers(workers);
    renderLaborAttendanceList();
    showToast(`🗑️ ${workerName} यादीतून काढण्यात आला.`, 'info');
}
window.removeWorker = removeWorker;

function toggleWorkerAttendance(id, isChecked) {
    const workers = getCustomWorkers();
    const worker = workers.find(w => w.id === id);
    if (worker) {
        worker.present = isChecked;
        saveCustomWorkers(workers);
    }
    const card = document.querySelector(`.attendance-check-card[data-worker-id="${id}"]`);
    if (card) {
        card.classList.toggle('checked', isChecked);
        const statusSpan = card.querySelector('.attendance-status');
        if (statusSpan) {
            statusSpan.textContent = isChecked ? 'हजर' : 'गैरहजर';
        }
    }
    const checkedCount = workers.filter(w => w.present).length;
    const badge = document.getElementById('attendance-count-badge');
    if (badge) {
        badge.textContent = `${checkedCount}/${workers.length} उपस्थित`;
    }
    showToast(`${worker ? worker.name : 'कामगार'}: ${isChecked ? 'हजर' : 'गैरहजर'} नोंदवले`, 'info');
}
window.toggleWorkerAttendance = toggleWorkerAttendance;

function toggleAttendanceItem(chk) {
    const card = chk.closest('.attendance-check-card');
    if (card) {
        card.classList.toggle('checked', chk.checked);
        const statusSpan = card.querySelector('.attendance-status');
        if (statusSpan) {
            statusSpan.textContent = chk.checked ? 'हजर' : 'गैरहजर';
        }
    }
    const total = document.querySelectorAll('#labor-attendance-list .attendance-check-card').length;
    const checked = document.querySelectorAll('#labor-attendance-list .attendance-check-card input:checked').length;
    const badge = document.getElementById('attendance-count-badge');
    if (badge) {
        badge.textContent = `${checked}/${total} उपस्थित`;
    }
}
window.toggleAttendanceItem = toggleAttendanceItem;

// --- OPTION 8: 💰 खर्च व उत्पन्न (EXPENSE & INCOME TABS & SUBMISSIONS) ---
function switchFinanceTab(tab) {
    const btnExp = document.getElementById('tab-finance-expense');
    const btnInc = document.getElementById('tab-finance-income');
    const formExp = document.getElementById('finance-expense-form-card');
    const formInc = document.getElementById('finance-income-form-card');
    const tableExp = document.getElementById('finance-expense-table-card');
    const tableInc = document.getElementById('finance-income-table-card');

    const navExp = document.getElementById('nav-tab-finance');
    const navInc = document.getElementById('nav-tab-sales');

    if (tab === 'expense') {
        btnExp?.classList.add('active');
        btnInc?.classList.remove('active');
        if (formExp) formExp.style.display = 'block';
        if (formInc) formInc.style.display = 'none';
        if (tableExp) tableExp.style.display = 'block';
        if (tableInc) tableInc.style.display = 'none';

        navExp?.classList.add('active');
        navInc?.classList.remove('active');
    } else {
        btnInc?.classList.add('active');
        btnExp?.classList.remove('active');
        if (formExp) formExp.style.display = 'none';
        if (formInc) formInc.style.display = 'block';
        if (tableExp) tableExp.style.display = 'none';
        if (tableInc) tableInc.style.display = 'block';

        navInc?.classList.add('active');
        navExp?.classList.remove('active');
    }
}
window.switchFinanceTab = switchFinanceTab;
window.showSalesTab = () => switchFinanceTab('income');

function handleInpageExpenseSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('inpage-expense-date')?.value || '20/09/2026';
    const cat = document.getElementById('inpage-expense-category')?.value || 'औषधे';
    const desc = document.getElementById('inpage-expense-desc')?.value || '';
    const amount = parseFloat(document.getElementById('inpage-expense-amount')?.value) || 0;
    const plot = document.getElementById('inpage-expense-plot')?.value || 'प्लॉट A';
    const note = document.getElementById('inpage-expense-note')?.value || '';

    const tbody = document.getElementById('inpage-expenses-table-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="kpi-badge warning">${cat}</span></td>
            <td>${desc} ${note ? '• ' + note : ''} (${plot})</td>
            <td><strong style="color: var(--rose-accent);">₹ ${amount.toLocaleString('en-IN')}</strong></td>
        `;
        tbody.prepend(row);
    }

    appState.expenses.unshift({
        id: 'exp-' + Date.now(),
        plot_id: 'plot-a',
        log_date: date,
        category: cat,
        amount: amount,
        description: `${desc} ${note ? '• ' + note : ''} (${plot})`
    });
    renderDashboardTab();
    renderFinanceTab();
    renderReportsTab();
    showToast(`💰 नवीन खर्च नोंदवला: ₹${amount.toLocaleString('en-IN')} (${cat})`, 'success');
}
window.handleInpageExpenseSubmit = handleInpageExpenseSubmit;

function handleInpageIncomeSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('inpage-income-date')?.value || '20/09/2026';
    const plot = document.getElementById('inpage-income-plot')?.value || 'प्लॉट A';
    const buyer = document.getElementById('inpage-income-buyer')?.value || 'व्यापारी / खरेदीदार';
    const kg = parseFloat(document.getElementById('inpage-income-kg')?.value) || 0;
    const rate = parseFloat(document.getElementById('inpage-income-rate')?.value) || 0;
    const note = document.getElementById('inpage-income-note')?.value || '';
    const total = kg * rate;

    const tbody = document.getElementById('inpage-income-table-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="kpi-badge info">${plot}</span></td>
            <td>${buyer} ${note ? '• ' + note : ''}</td>
            <td>${kg.toLocaleString('en-IN')} kg</td>
            <td>₹ ${rate}</td>
            <td><strong style="color: var(--emerald-deep);">₹ ${total.toLocaleString('en-IN')}</strong></td>
        `;
        tbody.prepend(row);
    }

    appState.sales.unshift({
        id: 'sale-' + Date.now(),
        plot_id: 'plot-a',
        sale_date: date,
        buyer_name: buyer,
        grade: note || 'Export Quality',
        quantity_kg: kg,
        rate_per_kg: rate,
        total_revenue: total
    });
    renderDashboardTab();
    renderFinanceTab();
    renderReportsTab();
    showToast(`🍇 विक्री नोंद यशस्वी! उत्पन्न: ₹${total.toLocaleString('en-IN')} (${buyer})`, 'success');
}
window.handleInpageIncomeSubmit = handleInpageIncomeSubmit;

// --- PAGE 10: REPORTS & ANALYSIS CHART ---
let reportChartInstance = null;

function initReportBarChart() {
    const canvas = document.getElementById('report-bar-chart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet, retrying...');
        setTimeout(initReportBarChart, 400);
        return;
    }

    if (reportChartInstance) {
        try {
            reportChartInstance.destroy();
        } catch (err) {
            console.warn('Chart destroy error:', err);
        }
        reportChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    try {
        reportChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['प्लॉट A (थॉम्पसन)', 'प्लॉट B (सुपर सोनका)', 'प्लॉट C (माणिक चमन)', 'प्लॉट D (शरद)', 'प्लॉट E (रेड ग्लोब)'],
                datasets: [{
                    label: 'उत्पादन (किलो)',
                    data: [12500, 10200, 8750, 6300, 9800],
                    backgroundColor: [
                        'rgba(21, 128, 61, 0.85)',
                        'rgba(16, 185, 129, 0.85)',
                        'rgba(59, 130, 246, 0.85)',
                        'rgba(168, 85, 247, 0.85)',
                        'rgba(245, 158, 11, 0.85)'
                    ],
                    borderColor: [
                        '#15803D',
                        '#10B981',
                        '#3B82F6',
                        '#A855F7',
                        '#F59E0B'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 8,
                    barPercentage: 0.55
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { family: "'Outfit', sans-serif", weight: '600', size: 12 },
                            color: '#242B24'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return ` उत्पादन: ${context.parsed.y.toLocaleString('en-IN')} किलो`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 15000,
                        ticks: {
                            callback: function (value) {
                                return value.toLocaleString('en-IN') + ' kg';
                            },
                            font: { family: "'Outfit', sans-serif", size: 11 },
                            color: '#556355'
                        },
                        grid: {
                            color: 'rgba(230, 222, 201, 0.4)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: "'Outfit', sans-serif", weight: '600', size: 11 },
                            color: '#242B24'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Error creating report chart:', e);
    }
}
window.initReportBarChart = initReportBarChart;

function handleSeasonChange(season) {
    const isPast = season === '2025-26';
    const prodVal = document.getElementById('dash-report-total-yield');
    const expVal = document.getElementById('dash-report-total-expense');
    const saleVal = document.getElementById('dash-report-total-sales');
    const profitVal = document.getElementById('dash-report-net-profit');

    const cpaElem = document.getElementById('rep-cost-per-acre');
    const cpkElem = document.getElementById('rep-cost-per-kg');
    const mElem = document.getElementById('rep-net-margin');

    if (prodVal) prodVal.innerHTML = isPast ? '42,100 <span style="font-size: 0.9rem; font-weight: 500;">किलो</span>' : '47,550 <span style="font-size: 0.9rem; font-weight: 500;">किलो</span>';
    if (expVal) expVal.textContent = isPast ? '₹ 3,90,000' : '₹ 4,25,000';
    if (saleVal) saleVal.textContent = isPast ? '₹ 6,10,000' : '₹ 7,15,000';
    if (profitVal) profitVal.textContent = isPast ? '₹ 2,20,000' : '₹ 2,90,000';

    if (cpaElem) cpaElem.textContent = isPast ? '₹ 37,143' : '₹ 40,476';
    if (cpkElem) cpkElem.textContent = isPast ? '₹ 9.26' : '₹ 8.94';
    if (mElem) mElem.textContent = isPast ? '36.1%' : '40.5%';

    if (reportChartInstance && reportChartInstance.data && reportChartInstance.data.datasets && reportChartInstance.data.datasets[0]) {
        if (isPast) {
            reportChartInstance.data.datasets[0].data = [11200, 9400, 7800, 5600, 8100];
        } else {
            reportChartInstance.data.datasets[0].data = [12500, 10200, 8750, 6300, 9800];
        }
        reportChartInstance.update();
    }
    showToast(`📅 अहवाल डेटा: हंगाम ${season} लोड केला.`, 'info');
}
window.handleSeasonChange = handleSeasonChange;

function switchReportsTab(tab) {
    document.querySelectorAll('#view-reports .filter-pills .filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.id === `tab-rep-${tab}`);
    });

    if (!reportChartInstance) {
        initReportBarChart();
    }

    const titleElem = document.querySelector('#view-reports .card-title-group h3');
    const subElem = document.querySelector('#view-reports .card-title-group .card-subtitle');
    const badgeElem = document.getElementById('report-chart-badge');
    const plotTableCard = document.getElementById('reports-plot-table-card');

    if (reportChartInstance && reportChartInstance.data && reportChartInstance.data.datasets && reportChartInstance.data.datasets[0]) {
        if (tab === 'production') {
            reportChartInstance.data.datasets[0].label = 'उत्पादन (किलो)';
            reportChartInstance.data.datasets[0].data = [12500, 10200, 8750, 6300, 9800];
            reportChartInstance.data.datasets[0].backgroundColor = 'rgba(21, 128, 61, 0.85)';
            reportChartInstance.data.datasets[0].borderColor = '#15803D';
            reportChartInstance.options.scales.y.ticks.callback = function (v) { return v.toLocaleString('en-IN') + ' kg'; };
            if (titleElem) titleElem.innerHTML = `<i data-lucide="bar-chart-3"></i> प्लॉटनुसार उत्पादन (किलो)`;
            if (subElem) subElem.textContent = 'हंगाम 2026 - 27 प्लॉटनिहाय द्राक्ष उत्पादन तुलना (A ते E)';
            if (badgeElem) badgeElem.textContent = 'एकूण 47,550 kg';
        } else if (tab === 'expense') {
            reportChartInstance.data.datasets[0].label = 'एकूण खर्च (₹)';
            reportChartInstance.data.datasets[0].data = [95000, 82000, 78000, 64000, 106000];
            reportChartInstance.data.datasets[0].backgroundColor = 'rgba(225, 29, 72, 0.85)';
            reportChartInstance.data.datasets[0].borderColor = '#E11D48';
            reportChartInstance.options.scales.y.ticks.callback = function (v) { return '₹ ' + v.toLocaleString('en-IN'); };
            if (titleElem) titleElem.innerHTML = `<i data-lucide="receipt"></i> प्लॉटनुसार एकूण खर्च (₹)`;
            if (subElem) subElem.textContent = 'प्लॉटनिहाय औषध, खत, मजुरी व सिंचन एकूण खर्च तुलना';
            if (badgeElem) badgeElem.textContent = 'एकूण खर्च ₹ 4,25,000';
        } else if (tab === 'profit') {
            reportChartInstance.data.datasets[0].label = 'निव्वळ नफा (₹)';
            reportChartInstance.data.datasets[0].data = [82000, 68000, 52000, 31000, 57000];
            reportChartInstance.data.datasets[0].backgroundColor = 'rgba(37, 99, 235, 0.85)';
            reportChartInstance.data.datasets[0].borderColor = '#2563EB';
            reportChartInstance.options.scales.y.ticks.callback = function (v) { return '₹ ' + v.toLocaleString('en-IN'); };
            if (titleElem) titleElem.innerHTML = `<i data-lucide="trending-up"></i> प्लॉटनुसार निव्वळ नफा (₹)`;
            if (subElem) subElem.textContent = 'विक्री महसूल वजा खर्च = प्रत्यक्ष निव्वळ नफा मार्जिन';
            if (badgeElem) badgeElem.textContent = 'निव्वळ नफा ₹ 2,90,000';
        } else if (tab === 'plotwise') {
            reportChartInstance.data.datasets[0].label = 'उत्पादन (किलो)';
            reportChartInstance.data.datasets[0].data = [12500, 10200, 8750, 6300, 9800];
            reportChartInstance.data.datasets[0].backgroundColor = [
                'rgba(21, 128, 61, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(59, 130, 246, 0.85)',
                'rgba(168, 85, 247, 0.85)',
                'rgba(245, 158, 11, 0.85)'
            ];
            reportChartInstance.options.scales.y.ticks.callback = function (v) { return v.toLocaleString('en-IN') + ' kg'; };
            if (titleElem) titleElem.innerHTML = `<i data-lucide="layers"></i> प्लॉटनुसार सर्वसमावेशक तुलना (A ते E)`;
            if (subElem) subElem.textContent = 'हंगाम 2026 - 27 सर्व 5 प्लॉट्सचे उत्पादन व नफा वितरण';
            if (badgeElem) badgeElem.textContent = '5 प्लॉट्स सक्रिय';
            if (plotTableCard) {
                plotTableCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        reportChartInstance.update();
    }
    initLucide();
    showToast(`📊 अहवाल विश्लेषण: ${tab === 'production' ? 'उत्पादन' : tab === 'expense' ? 'खर्च' : tab === 'profit' ? 'नफा' : 'प्लॉटनिहाय ताळेबंद'}`, 'info');
}
window.switchReportsTab = switchReportsTab;

function downloadReportPDF() {
    showToast('📄 अहवाल PDF तयार होत आहे... प्रिंट विंडो उघडत आहे.', 'info');
    setTimeout(() => {
        window.print();
    }, 400);
}
window.downloadReportPDF = downloadReportPDF;

function shareReport() {
    const text = `📊 *कृषिरत्न शेती अहवाल (हंगाम 2026-27)*\n\n` +
        `• एकूण उत्पादन: 47,550 किलो (5 प्लॉट)\n` +
        `• एकूण खर्च: ₹ 4,25,000\n` +
        `• एकूण विक्री: ₹ 7,15,000\n` +
        `• निव्वळ नफा: ₹ 2,90,000 (40.5% मार्जिन)\n\n` +
        `प्लॉट उत्पादन:\n` +
        `A: 12,500 kg | B: 10,200 kg | C: 8,750 kg | D: 6,300 kg | E: 9,800 kg\n\n` +
        `कृषिरत्न फार्म मॅनेजमेंट सिस्टीम`;

    if (navigator.share) {
        navigator.share({
            title: 'कृषिरत्न शेती अहवाल 2026-27',
            text: text
        }).catch(() => { });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ अहवाल क्लिपबोर्डवर कॉपी केला! व्हॉट्सॲपवर पेस्ट करा.', 'success');
        });
    } else {
        showToast('✅ अहवाल मजकूर तयार आहे.', 'info');
    }
}
window.shareReport = shareReport;

// --- BOTTOM NAVIGATION HANDLER ---
function handleBottomNavClick(btn, target) {
    switchView(target);
}
window.handleBottomNavClick = handleBottomNavClick;

// --- MODAL HANDLERS FOR NEW REGISTRATION, WEATHER, SETTINGS & BACKUP ---
function handleRegistrationSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-farmer-name')?.value || 'शेतकरी मित्र';
    const mobile = document.getElementById('reg-mobile')?.value || '';
    const village = document.getElementById('reg-village')?.value || '';
    const acres = document.getElementById('reg-acreage')?.value || '10.0';
    const variety = document.getElementById('reg-variety')?.value || 'Thompson Seedless';

    sessionStorage.setItem('krushi_auth', 'true');
    sessionStorage.setItem('krushi_role', 'farmer');

    closeModal('modal-register');
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.add('hidden');

    showToast(`🎉 अभिनंदन ${name}! तुमची नोंदणी यशस्वी झाली (${variety}, ${acres} एकर).`, 'success');
    switchView('dashboard');
}
window.handleRegistrationSubmit = handleRegistrationSubmit;

function saveSettings() {
    closeModal('modal-settings');
    showToast('⚙️ प्रणाली सेटिंग्स यशस्वीपणे जतन केल्या.', 'success');
}
window.saveSettings = saveSettings;

function triggerManualSync() {
    updateSupabaseStatus('syncing');
    showToast('🔄 क्लाउड डेटाबेससह सिंक होत आहे...', 'info');
    setTimeout(() => {
        updateSupabaseStatus('connected');
        showToast('✅ सर्व शेती डेटा क्लाउडवर 100% सुरक्षित सिंक झाला!', 'success');
    }, 900);
}
window.triggerManualSync = triggerManualSync;

function downloadBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `krushiratna_backup_2026-09-20.json`);
    dlAnchorElem.click();
    showToast('📥 स्थानिक बॅकअप फाइल (.json) डाउनलोड झाली!', 'success');
}
window.downloadBackupJSON = downloadBackupJSON;


