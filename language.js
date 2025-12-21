/* NeuroSynapse-PD v2.6 - Language & Navigation Module (FIXED) */

'use strict';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ============= STATE =============
const appState = {
    currentLang: localStorage.getItem('nspd-lang') || 'en',
    voiceEnabled: localStorage.getItem('nspd-voice') !== 'false',
    lastView: sessionStorage.getItem('nspd-last-view') || 'dashboard'
};

// ============= COMPLETE i18n DICTIONARY =============
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
        
        dashtitle: 'Clinical Assessment Dashboard',
        dashsubtitle: 'MDS-UPDRS Part III digital screening summary',
        dashpatienttitle: 'Patient Profile',
        dashpatientdesc: 'Complete demographic and contact details.',
        dashscreeningtitle: 'Screening Tests',
        dashscreeningdesc: 'Speech, tremor, gait and facial expression.',
        dashreporttitle: 'Radar Summary',
        dashreportdesc: 'Downloadable radar chart with domain scores.',
        dashstatusrequired: 'Required',
        dashstatuslocked: 'Locked',
        completeprofile: 'Complete Profile',
        testslocked: 'Tests Locked',
        generatereport: 'Generate Report',
        completealltests: 'Complete All Tests',
        
        infotitle: 'Parkinson\'s Disease Information',
        infosubtitle: 'Clinical background and MDS-UPDRS Part III protocol',
        infopdtitle: 'What is Parkinson\'s Disease?',
        infopdtext: 'Progressive neurodegenerative disorder with tremor, bradykinesia, rigidity and postural instability.',
        infoupdrstitle: 'MDS-UPDRS Part III Assessment',
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
        agewarning: '⚠️ Patient must be 18 years or older',
        
        voicetitle: 'Speech Assessment (UPDRS 3.1)',
        voicesubtitle: 'Record 3 trials of sustained phonation (AAAAA)',
        voiceinstructions1: 'Say',
        voiceinstructions2: 'clearly for approximately 8 seconds. Silence in environment helps capture quality voice samples.',
        voicemetrics: 'Jitter & Metrics Alignment',
        trial: 'Trial',
        recordtrial: 'Record Trial',
        playback: 'Playback',
        prerecording: 'Pre-Recording',
        recordingtime: 'Recording Time',
        jitter: 'Jitter (%)',
        shimmer: 'Shimmer (dB)',
        hnr: 'HNR (dB)',
        duration: 'Duration (s)',
        f0: 'F0 (Hz)',
        
        tremortitle: 'Tremor Assessment (UPDRS 3.15-18)',
        tremorsubtitle: 'DeviceMotion capture for resting tremor detection',
        selecthand: 'Select Hand',
        lefthand: 'Left Hand',
        righthand: 'Right Hand',
        recordingstatus: 'Recording Status',
        startrecording: 'Start Recording',
        tremormetrics: 'Tremor Metrics & Analysis',
        frequency: 'Frequency',
        amplitude: 'Amplitude',
        power: 'Power',
        
        gaittitle: 'Gait Assessment (UPDRS 3.10-11)',
        gaitsubtitle: 'Pose tracking and cadence analysis',
        gaitinstructions: 'Position camera to capture full body. Walk naturally for 15 seconds.',
        gaitmetrics: 'Gait Metrics & Kinematic Analysis',
        cadence: 'Cadence',
        stridelength: 'Stride Length',
        gaitspeed: 'Gait Speed',
        
        facialtitle: 'Facial Expression (UPDRS 3.2)',
        facialsubtitle: 'Face mesh analysis and expression assessment',
        facialinstructions: 'Position face clearly in frame. Maintain natural expression for 10 seconds.',
        facialmetrics: 'Facial Expression Metrics',
        blinkrate: 'Blink Rate',
        jawopening: 'Jaw Opening',
        mouthwidth: 'Mouth Width',
        
        questionstitle: 'Question-Based Assessment',
        questionssubtitle: 'Clinical context supporting items',
        q1: '1) Do you experience slowness of movement (bradykinesia)?',
        q2: '2) Do you have stiffness/rigidity in arms or legs?',
        q3: '3) Do you have balance issues or near falls?',
        optno: 'No',
        optsometimes: 'Sometimes',
        optoften: 'Often',
        questionnote: 'Note: This is a supportive questionnaire and not a diagnosis.',
        
        spiraltitle: 'Spiral Tremor Test',
        spiralsubtitle: 'Draw a smooth spiral using your finger',
        spiralinstruction: 'Use one hand. Try to draw in a single continuous stroke. Keep the device stable.',
        spiralmetrics: 'Spiral Analysis Metrics',
        tremorindex: 'Tremor Index',
        pathlength: 'Path Length',
        velocity: 'Velocity',
        clear: 'Clear',
        savespiral: 'Save Spiral',
        
        resultstitle: 'Screening Results Summary',
        resultssubtitle: 'Compiled metrics from all assessments',
        overallimpression: 'Overall Impression',
        domain: 'Domain',
        status: 'Status',
        score: 'Score (0-4)',
        comment: 'Clinical Comment',
        
        reporttitle: 'Clinical Summary Report',
        reportsubtitle: 'Comprehensive screening documentation',
        downloadpdf: 'Download PDF',
        exportjson: 'Export JSON',
        
        savecontinue: 'Save & Continue',
        backtodash: 'Back to Dashboard',
        metric: 'Metric',
        value: 'Value',
        unit: 'Unit',
        severity: 'Severity',
        
        fillCorrect: 'Please fill the information correctly.',
        saved: 'Patient information saved. Screening tests unlocked.',
        voiceOn: 'Voice Ready',
        voiceOff: 'Voice Off',
        proceedInfo: 'Parkinson\'s disease information.',
        proceedPatient: 'Proceed to patient contact information.',
        starting: 'Starting in',
        readNow: 'Read now',
        voiceSaved: 'Voice screening saved',
        startGait: 'Gait recording started',
        startFacial: 'Facial recording started',
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
        
        dashtitle: 'क्लिनिकल आकलन डैशबोर्ड',
        dashsubtitle: 'एमडीएस-यूपीडीआरएस भाग III डिजिटल स्क्रीनिंग',
        dashpatienttitle: 'रोगी प्रोफ़ाइल',
        dashpatientdesc: 'जनसांख्यिकीय और संपर्क विवरण पूरा करें।',
        dashscreeningtitle: 'स्क्रीनिंग परीक्षण',
        dashscreeningdesc: 'वाणी, कंपन, चाल और चेहरे का विश्लेषण।',
        dashreporttitle: 'रडार सारांश',
        dashreportdesc: 'डोमेन स्कोर के साथ रडार चार्ट।',
        dashstatusrequired: 'आवश्यक',
        dashstatuslocked: 'लॉक्ड',
        completeprofile: 'प्रोफ़ाइल पूरा करें',
        testslocked: 'परीक्षण लॉक्ड',
        generatereport: 'रिपोर्ट जेनरेट करें',
        completealltests: 'सभी परीक्षण पूरा करें',
        
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
        agewarning: '⚠️ रोगी 18 वर्ष या उससे अधिक होना चाहिए',
        
        voicetitle: 'वाणी आकलन (यूपीडीआरएस 3.1)',
        voicesubtitle: '3 ट्रायल रिकॉर्ड करें (आआआआआ)',
        voiceinstructions1: 'कहें',
        voiceinstructions2: 'स्पष्ट रूप से लगभग 8 सेकंड के लिए। शांत वातावरण गुणवत्ता की आवाज़ प्राप्त करने में मदद करता है।',
        voicemetrics: 'जिटर और मेट्रिक्स संरेखण',
        trial: 'ट्रायल',
        recordtrial: 'ट्रायल रिकॉर्ड करें',
        playback: 'प्लेबैक',
        prerecording: 'प्री-रिकॉर्डिंग',
        recordingtime: 'रिकॉर्डिंग समय',
        jitter: 'जिटर (%)',
        shimmer: 'शिमर (डीबी)',
        hnr: 'एचएनआर (डीबी)',
        duration: 'अवधि (एस)',
        f0: 'F0 (Hz)',
        
        tremortitle: 'कंपन आकलन (यूपीडीआरएस 3.15-18)',
        tremorsubtitle: 'डिवाइस गति कैप्चर',
        selecthand: 'हाथ चुनें',
        lefthand: 'बाएं हाथ',
        righthand: 'दाएं हाथ',
        recordingstatus: 'रिकॉर्डिंग स्थिति',
        startrecording: 'रिकॉर्डिंग शुरू करें',
        tremormetrics: 'कंपन मेट्रिक्स और विश्लेषण',
        frequency: 'आवृत्ति',
        amplitude: 'आयाम',
        power: 'शक्ति',
        
        gaittitle: 'चाल आकलन (यूपीडीआरएस 3.10-11)',
        gaitsubtitle: 'मुद्रा ट्रैकिंग और केडेंस विश्लेषण',
        gaitinstructions: 'पूर्ण शरीर को कैप्चर करने के लिए कैमरा रखें। 15 सेकंड के लिए स्वाभाविक रूप से चलें।',
        gaitmetrics: 'चाल मेट्रिक्स और गतिज विश्लेषण',
        cadence: 'केडेंस',
        stridelength: 'स्ट्राइड लंबाई',
        gaitspeed: 'चाल की गति',
        
        facialtitle: 'चेहरे का भाव (यूपीडीआरएस 3.2)',
        facialsubtitle: 'चेहरे की जाली विश्लेषण',
        facialinstructions: 'चेहरे को स्पष्ट रूप से फ्रेम में रखें। 10 सेकंड के लिए प्राकृतिक अभिव्यक्ति बनाए रखें।',
        facialmetrics: 'चेहरे की अभिव्यक्ति मेट्रिक्स',
        blinkrate: 'पलक दर',
        jawopening: 'जबड़े को खोलना',
        mouthwidth: 'मुंह की चौड़ाई',
        
        questionstitle: 'प्रश्न-आधारित आकलन',
        questionssubtitle: 'क्लिनिकल संदर्भ समर्थक आइटम',
        q1: '1) क्या आपको गति में धीमापन महसूस होता है?',
        q2: '2) क्या आपके हाथों या पैरों में कठोरता होती है?',
        q3: '3) क्या आपको संतुलन की समस्या होती है?',
        optno: 'नहीं',
        optsometimes: 'कभी-कभी',
        optoften: 'अक्सर',
        questionnote: 'नोट: यह एक सहायक प्रश्नावली है, निदान नहीं।',
        
        spiraltitle: 'स्पाइरल कंपन परीक्षण',
        spiralsubtitle: 'अपनी उंगली से एक चिकना सर्पिल बनाएं',
        spiralinstruction: 'एक हाथ का उपयोग करें। एक ही स्ट्रोक में बनाएं। डिवाइस स्थिर रखें।',
        spiralmetrics: 'स्पाइरल विश्लेषण मेट्रिक्स',
        tremorindex: 'कंपन सूचकांक',
        pathlength: 'पथ लंबाई',
        velocity: 'वेग',
        clear: 'साफ करें',
        savespiral: 'स्पाइरल सेव करें',
        
        resultstitle: 'स्क्रीनिंग परिणाम सारांश',
        resultssubtitle: 'सभी आकलनों से संकलित मेट्रिक्स',
        overallimpression: 'समग्र प्रभाव',
        domain: 'डोमेन',
        status: 'स्थिति',
        score: 'स्कोर (0-4)',
        comment: 'क्लिनिकल टिप्पणी',
        
        reporttitle: 'क्लिनिकल सारांश रिपोर्ट',
        reportsubtitle: 'व्यापक स्क्रीनिंग दस्तावेज़ीकरण',
        downloadpdf: 'पीडीएफ डाउनलोड करें',
        exportjson: 'JSON निर्यात करें',
        
        savecontinue: 'सेव करें और जारी रखें',
        backtodash: 'डैशबोर्ड पर वापस जाएं',
        metric: 'मेट्रिक',
        value: 'मूल्य',
        unit: 'इकाई',
        severity: 'गंभीरता',
        
        fillCorrect: 'कृपया सही जानकारी भरें।',
        saved: 'रोगी की जानकारी सेव हो गई। स्क्रीनिंग अनलॉक हो गई।',
        voiceOn: 'आवाज़ तैयार',
        voiceOff: 'आवाज़ बंद',
        proceedInfo: 'पार्किंसंस रोग जानकारी।',
        proceedPatient: 'कृपया रोगी संपर्क जानकारी भरें।',
        starting: 'शुरू हो रहा है',
        readNow: 'अब पढ़ें',
        voiceSaved: 'वाणी स्क्रीनिंग सेव हो गई',
        startGait: 'चाल रिकॉर्डिंग शुरू हुई',
        startFacial: 'चेहरे की रिकॉर्डिंग शुरू हुई',
    },

    ru: {
        navdashboard: 'Клиническая панель',
        navinfo: 'Информация о БП',
        navpatient: 'Профиль пациента',
        navvoice: 'Речь 3.1',
        navtremor: 'Тремор 3.15-18',
        navgait: 'Походка 3.10-11',
        navfacial: 'Мимика 3.2',
        navquestions: 'Опрос',
        navspiral: 'Спиральный тремор',
        navresults: 'Результаты',
        navreport: 'Скачать отчёт',
        
        dashtitle: 'Панель клинической оценки',
        dashsubtitle: 'Цифровой скрининг MDS-UPDRS Part III',
        dashpatienttitle: 'Профиль пациента',
        dashpatientdesc: 'Заполните демографические и контактные данные.',
        dashscreeningtitle: 'Скрининг-тесты',
        dashscreeningdesc: 'Речь, тремор, походка и мимика.',
        dashreporttitle: 'Радар-сводка',
        dashreportdesc: 'Радар-диаграмма с баллами по доменам.',
        dashstatusrequired: 'Требуется',
        dashstatuslocked: 'Закрыто',
        completeprofile: 'Заполнить профиль',
        testslocked: 'Тесты закрыты',
        generatereport: 'Создать отчёт',
        completealltests: 'Пройти все тесты',
        
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
        agewarning: '⚠️ Пациент должен быть не моложе 18 лет',
        
        voicetitle: 'Оценка речи (UPDRS 3.1)',
        voicesubtitle: 'Запишите 3 пробы (ААААА)',
        voiceinstructions1: 'Говорите',
        voiceinstructions2: 'четко в течение примерно 8 секунд. Тишина в окружении помогает получить качественные образцы голоса.',
        voicemetrics: 'Выравнивание Jitter и метрик',
        trial: 'Проба',
        recordtrial: 'Запишите пробу',
        playback: 'Воспроизведение',
        prerecording: 'Предварительная запись',
        recordingtime: 'Время записи',
        jitter: 'Jitter (%)',
        shimmer: 'Shimmer (dB)',
        hnr: 'HNR (dB)',
        duration: 'Продолжительность (с)',
        f0: 'F0 (Hz)',
        
        tremortitle: 'Оценка тремора (UPDRS 3.15-18)',
        tremorsubtitle: 'Захват движения устройства',
        selecthand: 'Выберите руку',
        lefthand: 'Левая рука',
        righthand: 'Правая рука',
        recordingstatus: 'Статус записи',
        startrecording: 'Начать запись',
        tremormetrics: 'Метрики тремора и анализ',
        frequency: 'Частота',
        amplitude: 'Амплитуда',
        power: 'Мощность',
        
        gaittitle: 'Оценка походки (UPDRS 3.10-11)',
        gaitsubtitle: 'Отслеживание осанки и анализ кадентрии',
        gaitinstructions: 'Расположите камеру для захвата всего тела. Ходите естественно в течение 15 секунд.',
        gaitmetrics: 'Метрики походки и кинематический анализ',
        cadence: 'Кадентрия',
        stridelength: 'Длина шага',
        gaitspeed: 'Скорость ходьбы',
        
        facialtitle: 'Выражение лица (UPDRS 3.2)',
        facialsubtitle: 'Анализ сетки лица',
        facialinstructions: 'Расположите лицо четко в кадре. Поддерживайте естественное выражение в течение 10 секунд.',
        facialmetrics: 'Метрики выражения лица',
        blinkrate: 'Частота морганий',
        jawopening: 'Открытие челюсти',
        mouthwidth: 'Ширина рта',
        
        questionstitle: 'Оценка на основе вопросов',
        questionssubtitle: 'Вспомогательные элементы клинического контекста',
        q1: '1) Испытываете ли вы замедленность движений?',
        q2: '2) Есть ли у вас скованность/ригидность?',
        q3: '3) Есть ли проблемы с равновесием?',
        optno: 'Нет',
        optsometimes: 'Иногда',
        optoften: 'Часто',
        questionnote: 'Примечание: Это вспомогательная анкета, не диагноз.',
        
        spiraltitle: 'Тест спирального тремора',
        spiralsubtitle: 'Нарисуйте гладкую спираль пальцем',
        spiralinstruction: 'Используйте одну руку. Рисуйте одним непрерывным движением. Держите устройство неподвижно.',
        spiralmetrics: 'Метрики анализа спирали',
        tremorindex: 'Индекс тремора',
        pathlength: 'Длина пути',
        velocity: 'Скорость',
        clear: 'Очистить',
        savespiral: 'Сохранить спираль',
        
        resultstitle: 'Сводка результатов скрининга',
        resultssubtitle: 'Скомпилированные метрики всех оценок',
        overallimpression: 'Общее впечатление',
        domain: 'Доменов',
        status: 'Статус',
        score: 'Оценка (0-4)',
        comment: 'Клинический комментарий',
        
        reporttitle: 'Клинический итоговый отчет',
        reportsubtitle: 'Комплексная документация по скринингу',
        downloadpdf: 'Скачать PDF',
        exportjson: 'Экспортировать JSON',
        
        savecontinue: 'Сохранить и продолжить',
        backtodash: 'Вернуться на панель',
        metric: 'Метрика',
        value: 'Значение',
        unit: 'Единица',
        severity: 'Серьезность',
        
        fillCorrect: 'Пожалуйста, заполните данные корректно.',
        saved: 'Данные пациента сохранены. Скрининг-тесты открыты.',
        voiceOn: 'Голос готов',
        voiceOff: 'Голос выключен',
        proceedInfo: 'Информация о болезни Паркинсона.',
        proceedPatient: 'Перейдите к контактным данным пациента.',
        starting: 'Начинаю в',
        readNow: 'Читайте сейчас',
        voiceSaved: 'Речевое исследование сохранено',
        startGait: 'Запись походки начата',
        startFacial: 'Запись выражения лица начата',
    }
};

// ============= TRANSLATE PAGE =============
function translatePage(lang) {
    appState.currentLang = lang || 'en';
    const dict = translations[appState.currentLang] || translations.en;

    // Update all elements with data-i18n attribute
    $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update language dropdown value
    const topLang = $('topLanguageSelect');
    if (topLang) topLang.value = appState.currentLang;

    // Update language label
    const langLabel = $('currentLanguageLabel');
    if (langLabel) {
        const labels = { en: 'English', hi: 'हिन्दी', ru: 'Русский' };
        langLabel.textContent = labels[appState.currentLang] || 'English';
    }

    // Update document language
    document.documentElement.lang = appState.currentLang;

    // Save language preference
    localStorage.setItem('nspd-lang', appState.currentLang);

    // Expose for other scripts
    window.NSI18N = translations;
    window.NSLang = appState.currentLang;
}

// ============= VOICE SYNTHESIS =============
function speak(key) {
    if (!appState.voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const dict = translations[appState.currentLang] || translations.en;
    const text = dict[key] || key;

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langTags = {
        en: 'en-US',
        hi: 'hi-IN',
        ru: 'ru-RU'
    };
    
    utterance.lang = langTags[appState.currentLang] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
}

// ============= SPLASH SCREEN =============
function showSplash() {
    const splash = $('splashScreen');
    const progress = $('splashProgress');

    if (!splash) return;

    const splashShown = sessionStorage.getItem('nspd-splash-shown');
    if (splashShown) {
        splash.style.display = 'none';
        return;
    }

    // Start progress
    setTimeout(() => {
        if (progress) {
            progress.style.transition = 'width 6s linear';
            progress.style.width = '100%';
        }
    }, 100);

    // Hide after 6 seconds
    setTimeout(() => {
        splash.classList.add('hidden');
        sessionStorage.setItem('nspd-splash-shown', '1');
    }, 6000);
}

// ============= NAVIGATION =============
function showView(viewName) {
    if (!viewName) return;

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
    if (activeNav && !activeNav.classList.contains('disabled')) {
        activeNav.classList.add('active');
    }

    // Close sidebar on mobile
    const sidebar = $('sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }

    // Save last view
    sessionStorage.setItem('nspd-last-view', viewName);
}

// ============= EVENT BINDING =============
function initLanguage() {
    // Initial translation
    translatePage(appState.currentLang);

    // Bind language selector
    const langSelect = $('topLanguageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            translatePage(lang);
            speak('labellanguage');
        });
    }

    // Bind voice toggle
    const voiceToggle = $('voiceToggle');
    if (voiceToggle) {
        appState.voiceEnabled = localStorage.getItem('nspd-voice') !== 'false';
        voiceToggle.classList.toggle('active', appState.voiceEnabled);

        voiceToggle.addEventListener('click', () => {
            appState.voiceEnabled = !appState.voiceEnabled;
            voiceToggle.classList.toggle('active', appState.voiceEnabled);
            localStorage.setItem('nspd-voice', appState.voiceEnabled);
            speak(appState.voiceEnabled ? 'voiceOn' : 'voiceOff');
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
            if (item.classList.contains('disabled')) return;
            const viewName = item.getAttribute('data-view');
            if (viewName) showView(viewName);
        });
    });

    // Bind dashboard buttons
    $$('button[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewName = btn.getAttribute('data-view');
            if (viewName && !btn.disabled) showView(viewName);
        });
    });

    // Show splash if first time
    showSplash();

    // Show initial view
    showView(appState.lastView);

    // Expose globally
    window.NSI18N = translations;
    window.NSLang = appState.currentLang;
    window.appState = appState;
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