// ==================== LANGUAGE TRANSLATIONS ====================

const TRANSLATIONS = {
    en: {
        // Navigation
        navtitle: 'Navigation',
        mainmenu: 'Main',
        learnmenu: 'Learn',
        testsmenu: 'Tests',
        resultsmenu: 'Results',
        
        // Views
        dashboard: 'Dashboard',
        pdinfo: 'PD Information',
        patient: 'Patient Profile',
        speech: 'Speech',
        tremor: 'Tremor',
        gait: 'Gait',
        facial: 'Facial',
        questions: 'Questions',
        spiral: 'Spiral',
        results: 'Results',
        report: 'Report',

        // Dashboard
        dashtitle: 'Clinical Assessment Dashboard',
        patientprofile: 'Patient Profile',
        tests: 'Screening Tests',
        analytics: 'Analytics',
        radarvisual: 'Radar Chart',
        statusrequired: 'Required',
        complete: 'Complete',
        starttests: 'Start Tests',
        viewreport: 'View Report',

        // PD Info
        whatispd: 'What is Parkinson\'s Disease?',
        pdexplanation: 'A progressive neurodegenerative disorder characterized by motor symptoms including tremor, bradykinesia (slowness), rigidity, and postural instability.',
        updrs: 'MDS-UPDRS Assessment',
        updrsexplanation: 'Unified Parkinson\'s Disease Rating Scale for comprehensive motor examination and symptom assessment.',
        continue: 'Continue',

        // Patient Form
        patientinfo: 'Patient Information',
        firstname: 'First Name',
        lastname: 'Last Name',
        dob: 'Date of Birth',
        age18required: 'Must be 18 or older',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        country: 'Country Code',
        phone: 'Phone',
        email: 'Email',
        medicalid: 'Medical ID',
        unlockscreening: 'Save & Unlock Screening',

        // Tests
        voiceinstruction: 'Say "AAAAA" for 6 seconds steadily',
        recordtrial: 'Record Trial',
        tremorinstructions: 'Record tremor from both hands (10 seconds each)',
        selecthand: 'Select Hand',
        lefthand: 'Left Hand',
        righthand: 'Right Hand',
        gaitinstruction: 'Walk naturally for 15 seconds while camera records',
        startgait: 'Start Gait Recording',
        facialinstruction: 'Maintain natural expression for 10 seconds while camera records',
        startfacial: 'Start Facial Recording',
        spiralinstructions: 'Draw a smooth spiral. Start from center and spiral outward',
        reference: 'Reference Spiral',
        yourspiral: 'Your Drawing',
        clear: 'Clear',

        // Metrics
        metrics: 'Metrics',
        jitter: 'Jitter',
        shimmer: 'Shimmer',
        hnr: 'HNR',
        f0: 'F0',
        frequency: 'Frequency',
        amplitude: 'Amplitude',
        power: 'Power',
        cadence: 'Cadence',
        stridelength: 'Stride Length',
        speed: 'Speed',
        blinkrate: 'Blink Rate',
        jawopening: 'Jaw Opening',
        mouthwidth: 'Mouth Width',
        tremorindex: 'Tremor Index',
        pathlen: 'Path Length',
        velocity: 'Velocity',

        // Questions
        q1: 'Do you experience slowness of movement?',
        q2: 'Do you experience stiffness or rigidity?',
        q3: 'Do you experience balance issues?',
        no: 'No',
        sometimes: 'Sometimes',
        often: 'Often',

        // Results & Report
        test: 'Test',
        status: 'Status',
        score: 'Score',
        completetest: 'Complete Test',
        generatereport: 'Generate Report',
        radarvisualization: 'Domain Analysis Radar Chart',
        downloadpdf: 'Download PDF',
        backtodash: 'Back to Dashboard',

        // Common
        cancel: 'Cancel',
        startingin: 'Starting in',
        metric: 'Metric',
        value: 'Value',
        nexttrail: 'Next Trial'
    },

    hi: {
        // Navigation
        navtitle: 'नेविगेशन',
        mainmenu: 'मुख्य',
        learnmenu: 'सीखें',
        testsmenu: 'परीक्षण',
        resultsmenu: 'परिणाम',
        
        // Views
        dashboard: 'डैशबोर्ड',
        pdinfo: 'पार्किंसंस रोग की जानकारी',
        patient: 'रोगी प्रोफाइल',
        speech: 'वाणी',
        tremor: 'कंपन',
        gait: 'चलना',
        facial: 'चेहरे की अभिव्यक्ति',
        questions: 'प्रश्न',
        spiral: 'सर्पिल',
        results: 'परिणाम',
        report: 'रिपोर्ट',

        // Dashboard
        dashtitle: 'नैदानिक मूल्यांकन डैशबोर्ड',
        patientprofile: 'रोगी प्रोफाइल',
        tests: 'स्क्रीनिंग परीक्षण',
        analytics: 'विश्लेषण',
        radarvisual: 'रडार चार्ट',
        statusrequired: 'आवश्यक',
        complete: 'पूर्ण करें',
        starttests: 'परीक्षण शुरू करें',
        viewreport: 'रिपोर्ट देखें',

        // PD Info
        whatispd: 'पार्किंसंस रोग क्या है?',
        pdexplanation: 'यह एक प्रगतिशील न्यूरोडीजेनरेटिव विकार है जो कंपन, धीमी गति, कठोरता और मुद्रा अस्थिरता से चिह्नित है।',
        updrs: 'एमडीएस-यूपीडीआरएस मूल्यांकन',
        updrsexplanation: 'व्यापक मोटर परीक्षा और लक्षण मूल्यांकन के लिए एकीकृत पार्किंसंस रोग रेटिंग स्केल।',
        continue: 'जारी रखें',

        // Patient Form
        patientinfo: 'रोगी की जानकारी',
        firstname: 'पहला नाम',
        lastname: 'आखिरी नाम',
        dob: 'जन्म तिथि',
        age18required: '18 वर्ष या उससे अधिक होना चाहिए',
        gender: 'लिंग',
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        country: 'देश कोड',
        phone: 'फोन',
        email: 'ईमेल',
        medicalid: 'चिकित्सा आईडी',
        unlockscreening: 'सहेजें और स्क्रीनिंग अनलॉक करें',

        // Tests
        voiceinstruction: '"आआआआ" को 6 सेकंड तक लगातार कहें',
        recordtrial: 'ट्रायल रिकॉर्ड करें',
        tremorinstructions: 'दोनों हाथों से कंपन रिकॉर्ड करें (प्रत्येक 10 सेकंड)',
        selecthand: 'हाथ चुनें',
        lefthand: 'बायां हाथ',
        righthand: 'दायां हाथ',
        gaitinstruction: 'कैमरा रिकॉर्ड करते समय 15 सेकंड तक प्राकृतिक रूप से चलें',
        startgait: 'गेट रिकॉर्डिंग शुरू करें',
        facialinstruction: 'कैमरा रिकॉर्ड करते समय 10 सेकंड तक प्राकृतिक अभिव्यक्ति बनाए रखें',
        startfacial: 'चेहरे की रिकॉर्डिंग शुरू करें',
        spiralinstructions: 'एक चिकनी सर्पिल खींचें। केंद्र से शुरू करें और बाहर की ओर सर्पिल करें',
        reference: 'संदर्भ सर्पिल',
        yourspiral: 'आपकी ड्राइंग',
        clear: 'साफ करें',

        // Metrics
        metrics: 'मेट्रिक्स',
        jitter: 'जिटर',
        shimmer: 'शिमर',
        hnr: 'एचएनआर',
        f0: 'F0',
        frequency: 'आवृत्ति',
        amplitude: 'आयाम',
        power: 'शक्ति',
        cadence: 'गति',
        stridelength: 'चाल की लंबाई',
        speed: 'गति',
        blinkrate: 'पलक झपकने की दर',
        jawopening: 'जबड़ा खोलना',
        mouthwidth: 'मुंह की चौड़ाई',
        tremorindex: 'कंपन सूचकांक',
        pathlen: 'पथ की लंबाई',
        velocity: 'वेग',

        // Questions
        q1: 'क्या आप गति की धीमी गति का अनुभव करते हैं?',
        q2: 'क्या आप कठोरता या अकड़न का अनुभव करते हैं?',
        q3: 'क्या आप संतुलन की समस्याओं का अनुभव करते हैं?',
        no: 'नहीं',
        sometimes: 'कभी कभी',
        often: 'अक्सर',

        // Results & Report
        test: 'परीक्षण',
        status: 'स्थिति',
        score: 'स्कोर',
        completetest: 'परीक्षण पूर्ण करें',
        generatereport: 'रिपोर्ट उत्पन्न करें',
        radarvisualization: 'डोमेन विश्लेषण रडार चार्ट',
        downloadpdf: 'पीडीएफ डाउनलोड करें',
        backtodash: 'डैशबोर्ड पर वापस जाएं',

        // Common
        cancel: 'रद्द करें',
        startingin: 'शुरुआत',
        metric: 'मेट्रिक',
        value: 'मूल्य',
        nexttrail: 'अगला ट्रायल'
    },

    ru: {
        // Navigation
        navtitle: 'Навигация',
        mainmenu: 'Главное',
        learnmenu: 'Учиться',
        testsmenu: 'Тесты',
        resultsmenu: 'Результаты',
        
        // Views
        dashboard: 'Приборная панель',
        pdinfo: 'Информация о болезни Паркинсона',
        patient: 'Профиль пациента',
        speech: 'Речь',
        tremor: 'Тремор',
        gait: 'Походка',
        facial: 'Мимика',
        questions: 'Вопросы',
        spiral: 'Спираль',
        results: 'Результаты',
        report: 'Отчет',

        // Dashboard
        dashtitle: 'Клиническая панель оценки',
        patientprofile: 'Профиль пациента',
        tests: 'Скрининговые тесты',
        analytics: 'Аналитика',
        radarvisual: 'Радиолокационная диаграмма',
        statusrequired: 'Требуется',
        complete: 'Завершить',
        starttests: 'Начать тесты',
        viewreport: 'Просмотреть отчет',

        // PD Info
        whatispd: 'Что такое болезнь Паркинсона?',
        pdexplanation: 'Прогрессирующее нейродегенеративное заболевание, характеризующееся тремором, брадикинезией, ригидностью и постуральной нестабильностью.',
        updrs: 'Оценка MDS-UPDRS',
        updrsexplanation: 'Единая шкала оценки болезни Паркинсона для полного моторного обследования.',
        continue: 'Продолжить',

        // Patient Form
        patientinfo: 'Информация о пациенте',
        firstname: 'Имя',
        lastname: 'Фамилия',
        dob: 'Дата рождения',
        age18required: 'Должно быть 18 лет или старше',
        gender: 'Пол',
        male: 'Мужской',
        female: 'Женский',
        other: 'Другое',
        country: 'Код страны',
        phone: 'Телефон',
        email: 'Электронная почта',
        medicalid: 'Медицинский ID',
        unlockscreening: 'Сохранить и разблокировать скрининг',

        // Tests
        voiceinstruction: 'Произнесите "АААА" в течение 6 секунд',
        recordtrial: 'Записать попытку',
        tremorinstructions: 'Записать тремор обеих рук (по 10 секунд каждая)',
        selecthand: 'Выберите руку',
        lefthand: 'Левая рука',
        righthand: 'Правая рука',
        gaitinstruction: 'Идите естественно в течение 15 секунд во время записи камерой',
        startgait: 'Начать запись походки',
        facialinstruction: 'Сохраняйте естественное выражение в течение 10 секунд во время записи камерой',
        startfacial: 'Начать запись мимики',
        spiralinstructions: 'Нарисуйте плавную спираль. Начните с центра и спирализируйте наружу',
        reference: 'Справочная спираль',
        yourspiral: 'Ваш рисунок',
        clear: 'Очистить',

        // Metrics
        metrics: 'Метрики',
        jitter: 'Дрожание',
        shimmer: 'Мерцание',
        hnr: 'HNR',
        f0: 'F0',
        frequency: 'Частота',
        amplitude: 'Амплитуда',
        power: 'Мощность',
        cadence: 'Темп',
        stridelength: 'Длина шага',
        speed: 'Скорость',
        blinkrate: 'Частота морганий',
        jawopening: 'Открытие челюсти',
        mouthwidth: 'Ширина рта',
        tremorindex: 'Индекс тремора',
        pathlen: 'Длина пути',
        velocity: 'Скорость',

        // Questions
        q1: 'Испытываете ли вы медлительность движений?',
        q2: 'Испытываете ли вы ригидность или скованность?',
        q3: 'Испытываете ли вы проблемы с равновесием?',
        no: 'Нет',
        sometimes: 'Иногда',
        often: 'Часто',

        // Results & Report
        test: 'Тест',
        status: 'Статус',
        score: 'Оценка',
        completetest: 'Завершить тест',
        generatereport: 'Создать отчет',
        radarvisualization: 'Диаграмма анализа домена',
        downloadpdf: 'Скачать PDF',
        backtodash: 'Вернуться на панель',

        // Common
        cancel: 'Отмена',
        startingin: 'Начало в',
        metric: 'Метрика',
        value: 'Значение',
        nexttrail: 'Следующая попытка'
    }
};

// ==================== TRANSLATION FUNCTION ====================

function translatePage() {
    const lang = localStorage.getItem('lang') || 'en';
    const translations = TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    document.documentElement.lang = lang;
}

// ==================== LANGUAGE CHANGE ====================

document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            localStorage.setItem('lang', e.target.value);
            translatePage();
        });
    }

    const savedLang = localStorage.getItem('lang') || 'en';
    if (selector) selector.value = savedLang;
    translatePage();
});