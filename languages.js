// NeuroCompass-PD v4.4 - COMPLETE LANGUAGE SUPPORT
// ALL KEYS SYNCED WITH assessment.js speak() CALLS
// Issue #4 FIXED: 100% key-value matching

window.LANGUAGES = {
    en: {
        // Navigation
        navdashboard: 'Dashboard',
        navinfo: 'PD Information',
        navpatient: 'Patient Profile',
        navvoice: 'Speech Assessment',
        navtremor: 'Tremor Assessment',
        navgait: 'Gait Assessment',
        navfacial: 'Facial Expression',
        navquestions: 'Questions',
        navspiral: 'Spiral Drawing',
        navresults: 'Results',
        navreport: 'Report',
        
        // Dashboard
        dashtitle: 'Clinical Assessment Dashboard',
        dashsubtitle: 'MDS-UPDRS Part III digital screening summary',
        dashpatienttitle: 'Patient Profile',
        dashpatientdesc: 'Complete demographic and contact details',
        dashscreeningtitle: 'Screening Tests',
        dashscreeningdesc: 'Speech, tremor, gait and facial expression',
        dashreporttitle: 'Radar Summary',
        dashreportdesc: 'Downloadable radar chart with domain scores',
        dashstatusrequired: 'Required',
        dashstatuslocked: 'Locked',
        dashstart: 'Begin Assessment Journey',
        
        // Info
        infotitle: 'Parkinson Disease Information',
        infosubtitle: 'Clinical background and MDS-UPDRS Part III protocol',
        infopdtitle: 'What is Parkinson Disease',
        infopdtext: 'Progressive neurodegenerative disorder with tremor, bradykinesia, rigidity and postural instability',
        infoupdrstitle: 'MDS-UPDRS Part III',
        infoupdrstext: 'Motor examination with 18 items scored 0-4. 0 is normal, 4 is severe',
        infobiomarkertitle: 'Digital Biomarkers',
        infobiomarkertext: 'Speech, tremor, gait and facial metrics captured as objective digital signatures',
        infonote: 'This is a research prototype. Interpret with clinician oversight',
        
        // Patient form
        patienttitle: 'Patient Demographic and Contact Information',
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
        patientnote: 'All required fields must be valid before screening tests unlock',
        patientsave: 'Save and Unlock Screening',
        ageError: 'Patient must be 18 or older',
        
        // Voice test
        voicetitle: 'Speech Assessment',
        voicesubtitle: 'Record 3 trials of sustained vowel AAAAA. 6 seconds each',
        
        // Tremor test
        tremortitle: 'Tremor Assessment',
        tremorsubtitle: 'Hold device steady with one hand for 10 seconds',
        
        // Gait test
        gaittitle: 'Gait Assessment',
        gaitsubtitle: 'Walk naturally while device captures motion',
        
        // Facial test
        facialtitle: 'Facial Expression Assessment',
        facialsubtitle: 'Maintain neutral expression while camera analyzes facial movement',
        
        // Questions
        questiontitle: 'Question-Based Assessment',
        questionsubtitle: 'Answer a short set of clinical questions to support screening context',
        q1: '1. Do you experience slowness of movement (bradykinesia)',
        q2: '2. Do you have stiffness/rigidity in arms or legs',
        q3: '3. Do you have balance issues or near falls',
        optno: 'No',
        optsometimes: 'Sometimes',
        optoften: 'Often',
        questionnote: 'This is a supportive questionnaire and not a diagnosis',
        questionsave: 'Save Question Assessment',
        
        // Spiral
        spiraltitle: 'Spiral Tremor Test',
        spiralsubtitle: 'Draw a spiral smoothly using your finger/stylus',
        spiralhint: 'Use one hand. Try to draw in a single continuous stroke. Keep the phone stable',
        spiralstart: 'Start Drawing',
        spiralclear: 'Clear',
        spiralsave: 'Save Spiral',
        spiralnote: 'Spiral drawing is a common motor task used to observe tremor and control',
        
        // Metrics
        jitter: 'Jitter %',
        shimmer: 'Shimmer dB',
        hnr: 'HNR dB',
        f0: 'Pitch Hz',
        frequency: 'Frequency Hz',
        amplitude: 'Amplitude m/s²',
        power: 'Power dB',
        cadence: 'Cadence steps/min',
        strideLength: 'Stride Length m',
        speed: 'Speed m/s',
        blinkRate: 'Blink Rate /min',
        jawOpening: 'Jaw Opening cm',
        mouthWidth: 'Mouth Width cm',
        tremorIndex: 'Tremor Index',
        pathLength: 'Path Length px',
        velocity: 'Velocity px/step',
        updrsScore: 'UPDRS Score',
        
        // Messages
        fillCorrect: 'Please fill the information correctly',
        saved: 'Patient information saved. Screening tests unlocked',
        voiceOn: 'Voice On',
        voiceOff: 'Voice Off',
        trialcomplete: 'Trial complete',
        startingin: 'Starting in',
        proceedInfo: 'Parkinson disease information',
        proceedPatient: 'Proceed to patient contact information',
        results: 'Results',
        report: 'Report',
        welcome: 'Welcome to NeuroCompass PD',
        mdsUPDRS: 'MDS-UPDRS Clinical Assessment Suite',
        pdf_downloaded: 'PDF report downloaded successfully'
    },
    
    hi: {
        // Navigation
        navdashboard: 'डैशबोर्ड',
        navinfo: 'पीडी जानकारी',
        navpatient: 'रोगी प्रोफाइल',
        navvoice: 'वाणी मूल्यांकन',
        navtremor: 'कंपन मूल्यांकन',
        navgait: 'गति मूल्यांकन',
        navfacial: 'चेहरे की अभिव्यक्ति',
        navquestions: 'प्रश्न',
        navspiral: 'सर्पिल चित्र',
        navresults: 'परिणाम',
        navreport: 'रिपोर्ट',
        
        // Dashboard
        dashtitle: 'नैदानिक मूल्यांकन डैशबोर्ड',
        dashsubtitle: 'एमडीएस-यूपीडीआरएस भाग III डिजिटल स्क्रीनिंग सारांश',
        dashpatienttitle: 'रोगी प्रोफाइल',
        dashpatientdesc: 'जनसांख्यिकीय और संपर्क विवरण पूर्ण करें',
        dashscreeningtitle: 'स्क्रीनिंग परीक्षण',
        dashscreeningdesc: 'वाणी, कंपन, गति और चेहरे की अभिव्यक्ति',
        dashreporttitle: 'राडार सारांश',
        dashreportdesc: 'डोमेन स्कोर के साथ डाउनलोड योग्य राडार चार्ट',
        dashstatusrequired: 'आवश्यक',
        dashstatuslocked: 'बंद',
        dashstart: 'मूल्यांकन यात्रा शुरू करें',
        
        // Info
        infotitle: 'पार्किंसन रोग की जानकारी',
        infosubtitle: 'नैदानिक पृष्ठभूमि और एमडीएस-यूपीडीआरएस भाग III प्रोटोकॉल',
        infopdtitle: 'पार्किंसन क्या है',
        infopdtext: 'कंपन, ब्रैडीकिनेसिया, कठोरता और मुद्रा अस्थिरता की विशेषता वाली प्रगतिशील न्यूरोडीजेनेरेटिव विकार',
        infoupdrstitle: 'एमडीएस-यूपीडीआरएस भाग III',
        infoupdrstext: '18 आइटम के साथ मोटर परीक्षा 0-4 स्कोर किए गए. 0 सामान्य है, 4 गंभीर है',
        infobiomarkertitle: 'डिजिटल बायोमार्कर',
        infobiomarkertext: 'वाणी, कंपन, गति और चेहरे की मेट्रिक्स को उद्देश्यपूर्ण डिजिटल हस्ताक्षर के रूप में कैप्चर किया गया',
        infonote: 'यह एक अनुसंधान प्रोटोटाइप है। नैदानिक निरीक्षण के साथ व्याख्या करें',
        
        // Patient form
        patienttitle: 'रोगी जनसांख्यिकी और संपर्क जानकारी',
        patientsubtitle: 'स्क्रीनिंग से पहले प्रलेखन के लिए आवश्यक',
        labelfirstname: 'पहला नाम',
        labellastname: 'अंतिम नाम',
        labeldob: 'जन्म की तारीख',
        labelgender: 'लिंग',
        genderselect: 'लिंग चुनें',
        gendermale: 'पुरुष',
        genderfemale: 'महिला',
        genderother: 'अन्य',
        genderna: 'नहीं कहना पसंद करते',
        labelcountry: 'देश कोड',
        labelphone: 'फोन नंबर',
        hintphone: 'केवल अंक दर्ज करें, देश कोड के बिना',
        labelemail: 'ईमेल पता',
        labelmedicalid: 'चिकित्सा रिकॉर्ड संख्या',
        patientnote: 'स्क्रीनिंग परीक्षण अनलॉक करने से पहले सभी आवश्यक फील्ड मान्य होने चाहिए',
        patientsave: 'सहेजें और स्क्रीनिंग अनलॉक करें',
        ageError: 'रोगी 18 वर्ष या उससे अधिक का होना चाहिए',
        
        // Voice test
        voicetitle: 'वाणी मूल्यांकन',
        voicesubtitle: 'स्वर AAAAA के 3 परीक्षण रिकॉर्ड करें. प्रत्येक 6 सेकंड',
        
        // Tremor test
        tremortitle: 'कंपन मूल्यांकन',
        tremorsubtitle: 'डिवाइस को एक हाथ से 10 सेकंड के लिए स्थिर रखें',
        
        // Gait test
        gaittitle: 'गति मूल्यांकन',
        gaitsubtitle: 'स्वाभाविक रूप से चलते समय डिवाइस गति को कैप्चर करता है',
        
        // Facial test
        facialtitle: 'चेहरे की अभिव्यक्ति मूल्यांकन',
        facialsubtitle: 'कैमरा चेहरे की गति का विश्लेषण करते समय तटस्थ अभिव्यक्ति बनाए रखें',
        
        // Questions
        questiontitle: 'प्रश्न-आधारित मूल्यांकन',
        questionsubtitle: 'स्क्रीनिंग संदर्भ का समर्थन करने के लिए नैदानिक प्रश्नों का एक छोटा सेट का उत्तर दें',
        q1: '1. क्या आप आंदोलन की धीमापन (ब्रैडीकिनेसिया) का अनुभव करते हैं',
        q2: '2. क्या आपके पास बाहों या पैरों में कठोरता है',
        q3: '3. क्या आपको संतुलन समस्याएं या गिरने का खतरा है',
        optno: 'नहीं',
        optsometimes: 'कभी-कभी',
        optoften: 'अक्सर',
        questionnote: 'यह एक सहायक प्रश्नावली है और कोई निदान नहीं है',
        questionsave: 'प्रश्न मूल्यांकन सहेजें',
        
        // Spiral
        spiraltitle: 'सर्पिल कंपन परीक्षण',
        spiralsubtitle: 'अपनी उंगली/स्टाइलस का उपयोग करके एक सर्पिल को सुचारु रूप से ड्रॉ करें',
        spiralhint: 'एक हाथ का उपयोग करें. एक एकल निरंतर स्ट्रोक में ड्रॉ करने का प्रयास करें. फोन को स्थिर रखें',
        spiralstart: 'ड्राइंग शुरू करें',
        spiralclear: 'स्पष्ट करें',
        spiralsave: 'सर्पिल सहेजें',
        spiralnote: 'सर्पिल चित्र एक सामान्य मोटर कार्य है जिसका उपयोग कंपन और नियंत्रण देखने के लिए किया जाता है',
        
        // Metrics
        jitter: 'जिटर %',
        shimmer: 'शिमर डीबी',
        hnr: 'एचएनआर डीबी',
        f0: 'पिच हर्ट्ज',
        frequency: 'आवृत्ति हर्ट्ज',
        amplitude: 'आयाम m/s²',
        power: 'शक्ति डीबी',
        cadence: 'लय कदम/मिनट',
        strideLength: 'स्ट्राइड लंबाई m',
        speed: 'गति m/s',
        blinkRate: 'पलक दर /मिनट',
        jawOpening: 'जबड़े की खुलावट सेमी',
        mouthWidth: 'मुँह की चौड़ाई सेमी',
        tremorIndex: 'कंपन सूचकांक',
        pathLength: 'पथ की लंबाई px',
        velocity: 'वेग px/कदम',
        updrsScore: 'यूपीडीआरएस स्कोर',
        
        // Messages
        fillCorrect: 'कृपया जानकारी सही ढंग से भरें',
        saved: 'रोगी की जानकारी सहेजी गई। स्क्रीनिंग परीक्षण अनलॉक किए गए',
        voiceOn: 'आवाज चालू',
        voiceOff: 'आवाज बंद',
        trialcomplete: 'परीक्षण पूर्ण',
        startingin: 'में शुरू हो रहा है',
        proceedInfo: 'पार्किंसन रोग की जानकारी',
        proceedPatient: 'रोगी संपर्क जानकारी के लिए आगे बढ़ें',
        results: 'परिणाम',
        report: 'रिपोर्ट',
        welcome: 'NeuroCompass PD में आपका स्वागत है',
        mdsUPDRS: 'एमडीएस-यूपीडीआरएस नैदानिक मूल्यांकन सूट',
        pdf_downloaded: 'पीडीएफ रिपोर्ट सफलतापूर्वक डाउनलोड की गई'
    },
    
    ru: {
        // Navigation
        navdashboard: 'Панель управления',
        navinfo: 'Информация о БП',
        navpatient: 'Профиль пациента',
        navvoice: 'Оценка речи',
        navtremor: 'Оценка тремора',
        navgait: 'Оценка походки',
        navfacial: 'Мимические выражения',
        navquestions: 'Вопросы',
        navspiral: 'Рисование спирали',
        navresults: 'Результаты',
        navreport: 'Отчет',
        
        // Dashboard
        dashtitle: 'Клиническая панель оценки',
        dashsubtitle: 'Цифровой скрининг MDS-UPDRS Часть III',
        dashpatienttitle: 'Профиль пациента',
        dashpatientdesc: 'Завершить демографические и контактные данные',
        dashscreeningtitle: 'Тесты скрининга',
        dashscreeningdesc: 'Речь, тремор, походка и мимика',
        dashreporttitle: 'Сводка радара',
        dashreportdesc: 'Загружаемая диаграмма радара с баллами по доменам',
        dashstatusrequired: 'Требуется',
        dashstatuslocked: 'Заблокировано',
        dashstart: 'Начать оценку',
        
        // Info
        infotitle: 'Информация о болезни Паркинсона',
        infosubtitle: 'Клиническая справка и протокол MDS-UPDRS Часть III',
        infopdtitle: 'Что такое болезнь Паркинсона',
        infopdtext: 'Прогрессирующее нейродегенеративное заболевание, характеризующееся тремором, брадикинезией, ригидностью и постуральной нестабильностью',
        infoupdrstitle: 'MDS-UPDRS Часть III',
        infoupdrstext: 'Моторное обследование с 18 пунктами, оцениваемыми 0-4. 0 нормально, 4 тяжелая',
        infobiomarkertitle: 'Цифровые биомаркеры',
        infobiomarkertext: 'Показатели речи, тремора, походки и лица, захваченные как объективные цифровые подписи',
        infonote: 'Это исследовательский прототип. Интерпретируйте под клиническим контролем',
        
        // Patient form
        patienttitle: 'Демографические и контактные данные пациента',
        patientsubtitle: 'Требуется для документирования перед скринингом',
        labelfirstname: 'Имя',
        labellastname: 'Фамилия',
        labeldob: 'Дата рождения',
        labelgender: 'Пол',
        genderselect: 'Выберите пол',
        gendermale: 'Мужской',
        genderfemale: 'Женский',
        genderother: 'Другое',
        genderna: 'Предпочитаю не говорить',
        labelcountry: 'Код страны',
        labelphone: 'Номер телефона',
        hintphone: 'Введите только цифры без кода страны',
        labelemail: 'Адрес электронной почты',
        labelmedicalid: 'Номер медицинской записи',
        patientnote: 'Все обязательные поля должны быть действительны перед разблокировкой тестов скрининга',
        patientsave: 'Сохранить и разблокировать скрининг',
        ageError: 'Пациент должен быть 18 лет или старше',
        
        // Voice test
        voicetitle: 'Оценка речи',
        voicesubtitle: 'Запишите 3 попытки гласного AAAAA. 6 секунд каждый',
        
        // Tremor test
        tremortitle: 'Оценка тремора',
        tremorsubtitle: 'Удерживайте устройство неподвижно одной рукой в течение 10 секунд',
        
        // Gait test
        gaittitle: 'Оценка походки',
        gaitsubtitle: 'Устройство фиксирует движение во время естественной ходьбы',
        
        // Facial test
        facialtitle: 'Оценка выражения лица',
        facialsubtitle: 'Сохраняйте нейтральное выражение лица во время анализа камерой движений лица',
        
        // Questions
        questiontitle: 'Оценка на основе вопросов',
        questionsubtitle: 'Ответьте на короткий набор клинических вопросов для поддержки контекста скрининга',
        q1: '1. Испытываете ли вы замедленность движений (брадикинезию)',
        q2: '2. У вас есть скованность/ригидность в руках или ногах',
        q3: '3. У вас есть проблемы с равновесием или риск падений',
        optno: 'Нет',
        optsometimes: 'Иногда',
        optoften: 'Часто',
        questionnote: 'Это вспомогательный опросник, а не диагноз',
        questionsave: 'Сохранить оценку вопросов',
        
        // Spiral
        spiraltitle: 'Тест спирали тремора',
        spiralsubtitle: 'Нарисуйте спираль плавно, используя палец/стилус',
        spiralhint: 'Используйте одну руку. Старайтесь рисовать одним непрерывным штрихом. Держите телефон неподвижно',
        spiralstart: 'Начать рисование',
        spiralclear: 'Очистить',
        spiralsave: 'Сохранить спираль',
        spiralnote: 'Рисование спирали - это обычное моторное задание для наблюдения тремора и контроля',
        
        // Metrics
        jitter: 'Джиттер %',
        shimmer: 'Шиммер дБ',
        hnr: 'ХНР дБ',
        f0: 'Высота Гц',
        frequency: 'Частота Гц',
        amplitude: 'Амплитуда m/s²',
        power: 'Мощность дБ',
        cadence: 'Темп шаги/мин',
        strideLength: 'Длина шага m',
        speed: 'Скорость m/s',
        blinkRate: 'Частота моргания /мин',
        jawOpening: 'Раскрытие челюсти см',
        mouthWidth: 'Ширина рта см',
        tremorIndex: 'Индекс тремора',
        pathLength: 'Длина пути px',
        velocity: 'Скорость px/шаг',
        updrsScore: 'Оценка UPDRS',
        
        // Messages
        fillCorrect: 'Пожалуйста, заполните информацию правильно',
        saved: 'Информация о пациенте сохранена. Тесты скрининга разблокированы',
        voiceOn: 'Голос включен',
        voiceOff: 'Голос отключен',
        trialcomplete: 'Попытка завершена',
        startingin: 'Начинается в',
        proceedInfo: 'Информация о болезни Паркинсона',
        proceedPatient: 'Перейти к контактной информации пациента',
        results: 'Результаты',
        report: 'Отчет',
        welcome: 'Добро пожаловать в NeuroCompass PD',
        mdsUPDRS: 'Клиническая шкала оценки БП MDS-UPDRS',
        pdf_downloaded: 'PDF отчет успешно загружен'
    }
};