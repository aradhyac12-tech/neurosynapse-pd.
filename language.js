/* NeuroSynapse-PD v2.5 - Language & Navigation Module */

'use strict';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ============= STATE =============
const state = {
    currentLang: 'en',
    voiceEnabled: true,
    lastView: 'dashboard'
};

// ============= i18n DICTIONARY =============
const translations = {
    en: {
        navdashboard: 'Clinical Dashboard',
        navinfo: 'PD Information',
        navpatient: 'Patient Profile',
        navvoice: 'Speech 3.1',
        navtremor: 'Tremor 3.15-18',
        navgait: 'Gait 3.10-11',
        navfacial: 'Facial 3.2',
        navquestions: 'Question Assessment',
        navspiral: 'Spiral Tremor',
        navresults: 'Screening Results',
        navreport: 'Download Summary',
        labellanguage: 'Language',
        labelvoiceassistant: 'Voice Prompt',
        dashtitle: 'Clinical Assessment Dashboard',
        dashsubtitle: 'MDS-UPDRS Part III digital screening summary',
        dashpatienttitle: 'Patient Profile',
        dashpatientdesc: 'Complete demographic and contact details.',
        dashscreeningtitle: 'Screening Tests',
        dashscreeningdesc: 'Speech, tremor, gait and facial expression.',
        dashreporttitle: 'Radar Summary',
        dashreportdesc: 'Downloadable radar chart with domain scores.',
        infotitle: 'Parkinson\'s Disease Information',
        infosubtitle: 'Clinical background and MDS-UPDRS Part III protocol',
        infopdtitle: 'What is Parkinson\'s?',
        infopdtext: 'Progressive neurodegenerative disorder with tremor, bradykinesia, rigidity and postural instability.',
        infoupdrstitle: 'MDS-UPDRS Part III',
        infoupdrstext: 'Motor examination with 18 items scored 0–4 (0 = normal, 4 = severe).',
        infobiomarkertitle: 'Digital Biomarkers',
        infobiomarkertext: 'Speech, tremor, gait and facial metrics captured as objective digital signatures.',
        infonote: 'Clinical Note: This is a research prototype; interpret with clinician oversight.',
        infonext: 'Proceed to Patient Contact Information',
        patienttitle: 'Patient Demographic & Contact Information',
        patientsubtitle: 'Required for documentation before screening',
        labelfirstname: 'First Name',
        labellastname: 'Last Name',
        labeldob: 'Date of Birth',
        labelgender: 'Gender',
        genderselect: 'Select Gender',
        gendermale: 'Male',
        genderfemale: 'Female',
        genderother: 'Other',
        genderna: 'Prefer not to say',
        labelcountry: 'Country Code',
        labelphone: 'Phone Number',
        hintphone: 'Enter digits only, without country code',
        labelemail: 'Email Address',
        labelmedicalid: 'Medical Record Number',
        patientnote: 'Clinical Documentation: All required fields must be valid before screening tests unlock.',
        patientsave: 'Save & Unlock Screening',
        q1: '1) Do you experience slowness of movement (bradykinesia)?',
        q2: '2) Do you have stiffness/rigidity in arms or legs?',
        q3: '3) Do you have balance issues or near falls?',
        optno: 'No',
        optsometimes: 'Sometimes',
        optoften: 'Often',
        questionnote: 'Note: This is a supportive questionnaire and not a diagnosis.',
        fillCorrect: 'Please fill the information correctly.',
        saved: 'Patient information saved. Screening tests unlocked.',
        voiceOn: 'Voice Ready',
        voiceOff: 'Voice Off',
        proceedInfo: 'Parkinson\'s disease information.',
        proceedPatient: 'Proceed to patient contact information.',
        starting: 'Starting',
        readNow: 'Read now',
        voiceSaved: 'Voice screening saved',
    },

    hi: {
        navdashboard: 'क्लिनिकल डैशबोर्ड',
        navinfo: 'पीडी जानकारी',
        navpatient: 'रोगी प्रोफ़ाइल',
        navvoice: 'वाणी 3.1',
        navtremor: 'कंपन 3.15-18',
        navgait: 'चाल 3.10-11',
        navfacial: 'चेहरा 3.2',
        navquestions: 'प्रश्न आकलन',
        navspiral: 'स्पाइरल कंपन',
        navresults: 'परिणाम',
        navreport: 'रिपोर्ट डाउनलोड',
        labellanguage: 'भाषा',
        labelvoiceassistant: 'आवाज़ निर्देश',
        dashtitle: 'क्लिनिकल आकलन डैशबोर्ड',
        dashsubtitle: 'एमडीएस-यूपीडीआरएस भाग III डिजिटल स्क्रीनिंग',
        dashpatienttitle: 'रोगी प्रोफ़ाइल',
        dashpatientdesc: 'जनसांख्यिकीय और संपर्क विवरण पूरा करें।',
        dashscreeningtitle: 'स्क्रीनिंग परीक्षण',
        dashscreeningdesc: 'वाणी, कंपन, चाल और चेहरे का विश्लेषण।',
        dashreporttitle: 'रडार सारांश',
        dashreportdesc: 'डोमेन स्कोर के साथ रडार चार्ट।',
        infotitle: 'पार्किंसंस रोग जानकारी',
        infosubtitle: 'क्लिनिकल पृष्ठभूमि और एमडीएस-यूपीडीआरएस प्रोटोकॉल',
        infopdtitle: 'पार्किंसंस क्या है?',
        infopdtext: 'प्रगतिशील तंत्रिका-अपघटन रोग जिसमें कंपन, धीमापन, कठोरता और संतुलन समस्या होती है।',
        infoupdrstitle: 'एमडीएस-यूपीडीआरएस भाग III',
        infoupdrstext: 'मोटर परीक्षा: 18 आइटम, स्कोर 0–4।',
        infobiomarkertitle: 'डिजिटल बायोमार्कर',
        infobiomarkertext: 'वाणी, कंपन, चाल और चेहरे के मेट्रिक्स।',
        infonote: 'क्लिनिकल नोट: यह एक रिसर्च प्रोटोटाइप है; परिणाम डॉक्टर की समीक्षा के साथ देखें।',
        infonext: 'रोगी संपर्क जानकारी पर जाएँ',
        patienttitle: 'रोगी जनसांख्यिकीय और संपर्क जानकारी',
        patientsubtitle: 'स्क्रीनिंग से पहले आवश्यक',
        labelfirstname: 'पहला नाम',
        labellastname: 'अंतिम नाम',
        labeldob: 'जन्म तिथि',
        labelgender: 'लिंग',
        genderselect: 'लिंग चुनें',
        gendermale: 'पुरुष',
        genderfemale: 'महिला',
        genderother: 'अन्य',
        genderna: 'कहना नहीं चाहते',
        labelcountry: 'देश कोड',
        labelphone: 'फोन नंबर',
        hintphone: 'केवल अंक लिखें, देश कोड के बिना',
        labelemail: 'ईमेल',
        labelmedicalid: 'मेडिकल आईडी',
        patientnote: 'स्क्रीनिंग से पहले सभी आवश्यक फ़ील्ड भरें।',
        patientsave: 'सेव करें और स्क्रीनिंग अनलॉक करें',
        q1: '1) क्या आपको गति में धीमापन महसूस होता है?',
        q2: '2) क्या आपके हाथों या पैरों में कठोरता होती है?',
        q3: '3) क्या आपको संतुलन की समस्या होती है?',
        optno: 'नहीं',
        optsometimes: 'कभी-कभी',
        optoften: 'अक्सर',
        questionnote: 'नोट: यह एक सहायक प्रश्नावली है, निदान नहीं।',
        fillCorrect: 'कृपया सही जानकारी भरें।',
        saved: 'जानकारी सेव हो गई। स्क्रीनिंग अनलॉक हो गई।',
        voiceOn: 'आवाज़ तैयार',
        voiceOff: 'आवाज़ बंद',
        proceedInfo: 'पार्किंसंस रोग जानकारी।',
        proceedPatient: 'कृपया रोगी संपर्क जानकारी भरें।',
        starting: 'शुरू हो रहा है',
        readNow: 'अब पढ़ें',
        voiceSaved: 'वाणी स्क्रीनिंग सेव हो गई',
    },

    ru: {
        navdashboard: 'Клиническая панель',
        navinfo: 'Инфо о БП',
        navpatient: 'Профиль пациента',
        navvoice: 'Речь 3.1',
        navtremor: 'Тремор 3.15-18',
        navgait: 'Походка 3.10-11',
        navfacial: 'Мимика 3.2',
        navquestions: 'Опрос',
        navspiral: 'Спиральный тремор',
        navresults: 'Результаты',
        navreport: 'Скачать отчёт',
        labellanguage: 'Язык',
        labelvoiceassistant: 'Голосовые подсказки',
        dashtitle: 'Панель клинической оценки',
        dashsubtitle: 'Цифровой скрининг MDS-UPDRS Part III',
        dashpatienttitle: 'Профиль пациента',
        dashpatientdesc: 'Заполните демографические и контактные данные.',
        dashscreeningtitle: 'Скрининг-тесты',
        dashscreeningdesc: 'Речь, тремор, походка и мимика.',
        dashreporttitle: 'Радар-сводка',
        dashreportdesc: 'Радар-диаграмма с баллами по доменам.',
        infotitle: 'Информация о болезни Паркинсона',
        infosubtitle: 'Клиническая справка и протокол MDS-UPDRS Part III',
        infopdtitle: 'Что такое болезнь Паркинсона?',
        infopdtext: 'Прогрессирующее нейродегенеративное заболевание с тремором, брадикинезией, ригидностью и нарушением устойчивости.',
        infoupdrstitle: 'MDS-UPDRS Part III',
        infoupdrstext: 'Моторный осмотр: 18 пунктов, шкала 0–4.',
        infobiomarkertitle: 'Цифровые биомаркеры',
        infobiomarkertext: 'Метрики речи, тремора, походки и мимики.',
        infonote: 'Клиническая заметка: Это исследовательский прототип; интерпретация только вместе с врачом.',
        infonext: 'Перейти к контактным данным пациента',
        patienttitle: 'Демографические и контактные данные',
        patientsubtitle: 'Обязательно перед скринингом',
        labelfirstname: 'Имя',
        labellastname: 'Фамилия',
        labeldob: 'Дата рождения',
        labelgender: 'Пол',
        genderselect: 'Выберите пол',
        gendermale: 'Мужской',
        genderfemale: 'Женский',
        genderother: 'Другое',
        genderna: 'Предпочитаю не указывать',
        labelcountry: 'Код страны',
        labelphone: 'Телефон',
        hintphone: 'Только цифры, без кода страны',
        labelemail: 'Email',
        labelmedicalid: 'Медицинский ID',
        patientnote: 'Документация: Все обязательные поля должны быть заполнены.',
        patientsave: 'Сохранить и открыть скрининг',
        q1: '1) Испытываете ли вы замедленность движений?',
        q2: '2) Есть ли у вас скованность/ригидность?',
        q3: '3) Есть ли проблемы с равновесием?',
        optno: 'Нет',
        optsometimes: 'Иногда',
        optoften: 'Часто',
        questionnote: 'Примечание: Это вспомогательная анкета, не диагноз.',
        fillCorrect: 'Пожалуйста, заполните данные корректно.',
        saved: 'Данные сохранены. Скрининг-тесты открыты.',
        voiceOn: 'Голос готов',
        voiceOff: 'Голос выключен',
        proceedInfo: 'Информация о болезни Паркинсона.',
        proceedPatient: 'Перейдите к контактным данным пациента.',
        starting: 'Начиная',
        readNow: 'Читайте сейчас',
        voiceSaved: 'Речевое исследование сохранено',
    }
};

// ============= TRANSLATE =============
function translatePage(lang) {
    state.currentLang = lang || 'en';
    const dict = translations[state.currentLang] || translations.en;

    $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update all language selector dropdowns
    const topLang = $('topLanguageSelect');
    const sideLang = $('languageSelect');
    const dashLang = $('dashboardLanguageSelect');
    const langLabel = $('currentLanguageLabel');

    if (topLang) topLang.value = state.currentLang;
    if (sideLang) sideLang.value = state.currentLang;
    if (dashLang) dashLang.value = state.currentLang;
    if (langLabel) {
        const labels = { en: 'English', hi: 'हिन्दी', ru: 'Русский' };
        langLabel.textContent = labels[state.currentLang] || 'English';
    }

    // Update document language
    document.documentElement.lang = state.currentLang;

    // Expose for assessment.js
    window.NSI18N = translations;
    window.NSLang = state.currentLang;

    localStorage.setItem('nspd-lang', state.currentLang);
}

// ============= VOICE =============
function speak(key) {
    if (!state.voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const dict = translations[state.currentLang] || translations.en;
    const text = dict[key] || key;

    if (!text) return;

    // Cancel previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Language tags
    const langTags = {
        en: 'en-US',
        hi: 'hi-IN',
        ru: 'ru-RU'
    };
    
    utterance.lang = langTags[state.currentLang] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

// ============= SPLASH SCREEN =============
function runSplash() {
    const splash = $('splashScreen');
    const progress = $('splashProgress');

    if (!splash) return;

    // Start progress bar after brief delay
    setTimeout(() => {
        if (progress) {
            progress.style.transition = 'width 6s linear';
            progress.style.width = '100%';
        }
    }, 100);

    // Hide splash after 6 seconds
    setTimeout(() => {
        splash.classList.add('hidden');
        sessionStorage.setItem('nspd-splash-shown', '1');
    }, 6000);
}

// ============= NAVIGATION =============
function showView(viewName) {
    // Hide all views
    $$('.view').forEach(v => v.classList.remove('active'));

    // Show selected view
    const view = $(`${viewName}View`);
    if (view) {
        view.classList.add('active');
    }

    // Update nav active state
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Close sidebar on mobile
    const sidebar = $('sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }

    // Save last view
    sessionStorage.setItem('nspd-last-view', viewName);

    // Speak view name
    const key = `nav${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
    speak(key);
}

// ============= INIT =============
function initLanguage() {
    // Restore language from storage
    const saved = localStorage.getItem('nspd-lang') || 'en';
    translatePage(saved);

    // Bind language selectors
    const selectors = ['topLanguageSelect', 'languageSelect', 'dashboardLanguageSelect'];
    selectors.forEach(id => {
        const el = $(id);
        if (el) {
            el.addEventListener('change', (e) => {
                const lang = e.target.value;
                translatePage(lang);
                // Sync all selectors
                selectors.forEach(otherId => {
                    const other = $(otherId);
                    if (other) other.value = lang;
                });
            });
        }
    });

    // Bind voice toggle
    const voiceToggle = $('voiceToggle');
    if (voiceToggle) {
        state.voiceEnabled = localStorage.getItem('nspd-voice') !== 'false';
        voiceToggle.classList.toggle('active', state.voiceEnabled);

        voiceToggle.addEventListener('click', () => {
            state.voiceEnabled = !state.voiceEnabled;
            voiceToggle.classList.toggle('active', state.voiceEnabled);
            localStorage.setItem('nspd-voice', state.voiceEnabled);
            speak(state.voiceEnabled ? 'voiceOn' : 'voiceOff');
        });
    }

    // Bind menu toggle
    const menuToggle = $('menuToggle');
    const sidebar = $('sidebar');
    const sidebarBack = $('sidebarBack');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    if (sidebarBack && sidebar) {
        sidebarBack.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Bind nav items
    $$('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            const viewName = item.getAttribute('data-view');
            if (viewName && !item.classList.contains('disabled')) {
                showView(viewName);
            }
        });
    });

    // Bind dashboard buttons
    $$('button[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewName = btn.getAttribute('data-view');
            if (viewName && !btn.disabled && !btn.closest('.nav-item')?.classList.contains('disabled')) {
                showView(viewName);
            }
        });
    });

    // Show splash if first time
    const splashShown = sessionStorage.getItem('nspd-splash-shown');
    if (!splashShown) {
        runSplash();
    } else {
        const splash = $('splashScreen');
        if (splash) {
            splash.style.display = 'none';
        }
    }

    // Show initial view
    const initialView = sessionStorage.getItem('nspd-last-view') || 'dashboard';
    showView(initialView);

    // Expose globals for assessment.js
    window.NSI18N = translations;
    window.NSLang = state.currentLang;
    window.setLanguage = translatePage;
    window.speak = speak;
    window.showView = showView;
}

// ============= START =============
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}