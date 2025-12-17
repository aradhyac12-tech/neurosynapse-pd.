// assessment.js
(function () {
  "use strict";

  const APP = {
    currentLang: "en",
    voiceEnabled: true,
    tremorEnabled: false,
    voices: [],
    patientSaved: false,
    completed: { voice: false, tremor: false, gait: false, facial: false, tapping: false, spiral: false },
    results: { voice: null, tremor: null, gait: null, facial: null },
    devices: { gaitFacingMode: "user", faceFacingMode: "user" }
  };

  function $(id) { return document.getElementById(id); }

  /* --- Mobile viewport height fix (screen ratio recognition) --- */
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  window.addEventListener("resize", setVH);
  window.addEventListener("orientationchange", setVH);

  /* ---------- i18n dictionary ---------- */
  const I18N_TEXT = {
    en: {
      nav_dashboard: "Clinical Dashboard",
      nav_info: "PD Information",
      nav_patient: "Patient Profile",
      nav_voice: "Speech Analysis",
      nav_tremor: "Tremor Assessment",
      nav_tapping: "Finger Tapping",
      nav_gait: "Gait Analysis",
      nav_spiral: "Spiral Drawing",
      nav_facial: "Facial Expression",
      nav_results: "Assessment Results",
      nav_report: "Clinical Report",

      dash_title: "Clinical Assessment Dashboard",
      dash_subtitle: "UPDRS Part III screening summary",
      dash_patient_title: "Patient Profile",
      dash_patient_desc: "Complete demographic and contact details.",
      dash_screening_title: "Motor Assessments",
      dash_screening_desc: "Six UPDRS‑III‑mapped digital tasks.",
      dash_report_title: "Clinical Report",
      dash_report_desc: "PDF summary with digital biomarkers.",
      dash_status_required: "Required",
      dash_status_locked: "Locked",
      dash_start: "Begin Assessment Journey",

      info_title: "Parkinson's Disease Information",
      info_subtitle: "Clinical background and MDS‑UPDRS Part III protocol",
      info_pd_title: "What is Parkinson's?",
      info_pd_text:
        "Progressive neurodegenerative disorder with dopaminergic neuron loss in the substantia nigra, producing tremor, bradykinesia, rigidity and postural instability.",
      info_updrs_title: "MDS‑UPDRS Part III",
      info_updrs_text:
        "Motor examination with 18 items scored 0–4 (0 normal, 4 severe). This prototype uses digital tasks to approximate these domains.",
      info_biomarker_title: "Digital Biomarkers",
      info_biomarker_text:
        "Speech, tremor, tapping, gait, spiral and facial metrics are captured as objective digital signatures of Parkinsonian motor change.",
      info_note:
        "💡 <strong>Clinical Note:</strong> This is a research prototype; findings must be interpreted by a neurologist or movement‑disorder specialist.",
      info_next: "Proceed to Patient Contact Information",

      patient_title: "Patient Demographic & Contact Information",
      patient_subtitle: "Required for documentation before screening",
      label_firstname: "First Name *",
      label_lastname: "Last Name *",
      label_dob: "Date of Birth *",
      label_gender: "Gender *",
      gender_select: "Select Gender",
      gender_male: "Male",
      gender_female: "Female",
      gender_other: "Other",
      gender_na: "Prefer not to say",
      label_country: "Country Code *",
      label_phone: "Phone Number *",
      hint_phone: "Enter digits only, without country code",
      label_email: "Email Address *",
      label_medicalid: "Medical Record Number",
      patient_note:
        "📋 <strong>Clinical Documentation:</strong> All required fields must be valid before screening tests unlock.",
      patient_save: "Save & Unlock Screening",

      label_language: "Language",
      label_voice_assistant: "Voice Prompt",
      label_tremor_ui: "Anti‑Tremor UI",

      fillCorrect: "Please fill the information correctly.",
      saved: "Patient information saved. Screening tests unlocked.",
      proceedVoice: "Proceeding to speech analysis.",
      voiceOff: "Voice: Off",
      voiceOn: "Voice: Ready",
      tremorOn: "Anti‑Tremor: On",
      tremorOff: "Anti‑Tremor: Off"
    },

    es: {
      nav_dashboard: "Panel clínico",
      nav_info: "Información de EP",
      nav_patient: "Perfil del paciente",
      nav_voice: "Análisis del habla",
      nav_tremor: "Evaluación del temblor",
      nav_tapping: "Golpeteo de dedos",
      nav_gait: "Análisis de la marcha",
      nav_spiral: "Dibujo en espiral",
      nav_facial: "Expresión facial",
      nav_results: "Resultados",
      nav_report: "Informe clínico",

      dash_title: "Panel de evaluación clínica",
      dash_subtitle: "Resumen de cribado UPDRS Parte III",
      dash_patient_title: "Perfil del paciente",
      dash_patient_desc: "Complete los datos demográficos y de contacto.",
      dash_screening_title: "Evaluaciones motoras",
      dash_screening_desc: "Seis tareas digitales mapeadas a UPDRS‑III.",
      dash_report_title: "Informe clínico",
      dash_report_desc: "Resumen PDF con biomarcadores digitales.",
      dash_status_required: "Requerido",
      dash_status_locked: "Bloqueado",
      dash_start: "Iniciar evaluación",

      info_title: "Información sobre la enfermedad de Parkinson",
      info_subtitle: "Antecedentes clínicos y protocolo MDS‑UPDRS Parte III",
      info_pd_title: "¿Qué es Parkinson?",
      info_pd_text:
        "Trastorno neurodegenerativo progresivo con pérdida de neuronas dopaminérgicas en la sustancia negra, causando temblor, bradicinesia, rigidez e inestabilidad postural.",
      info_updrs_title: "MDS‑UPDRS Parte III",
      info_updrs_text:
        "Examen motor con 18 ítems puntuados de 0–4 (0 normal, 4 grave). Este prototipo usa tareas digitales para aproximar estos dominios.",
      info_biomarker_title: "Biomarcadores digitales",
      info_biomarker_text:
        "Métricas de habla, temblor, tapping, marcha, espiral y cara como firmas objetivas del cambio motor parkinsoniano.",
      info_note:
        "💡 <strong>Nota clínica:</strong> Este es un prototipo de investigación; los hallazgos deben ser interpretados por un neurólogo o especialista.",
      info_next: "Continuar a información de contacto del paciente",

      patient_title: "Información demográfica y de contacto del paciente",
      patient_subtitle: "Requerido antes del cribado",
      label_firstname: "Nombre *",
      label_lastname: "Apellido *",
      label_dob: "Fecha de nacimiento *",
      label_gender: "Género *",
      gender_select: "Seleccionar género",
      gender_male: "Masculino",
      gender_female: "Femenino",
      gender_other: "Otro",
      gender_na: "Prefiero no decirlo",
      label_country: "Código de país *",
      label_phone: "Número de teléfono *",
      hint_phone: "Solo dígitos, sin código de país",
      label_email: "Correo electrónico *",
      label_medicalid: "Nº de historia clínica",
      patient_note:
        "📋 <strong>Documentación clínica:</strong> Todos los campos obligatorios deben ser válidos antes de desbloquear pruebas.",
      patient_save: "Guardar y desbloquear",

      label_language: "Idioma",
      label_voice_assistant: "Voz",
      label_tremor_ui: "UI anti‑temblor",

      fillCorrect: "Por favor, complete la información correctamente.",
      saved: "Información del paciente guardada. Pruebas desbloqueadas.",
      proceedVoice: "Continuando al análisis del habla.",
      voiceOff: "Voz: Apagado",
      voiceOn: "Voz: Lista",
      tremorOn: "Anti‑temblor: Activado",
      tremorOff: "Anti‑temblor: Desactivado"
    },

    fr: {
      nav_dashboard: "Tableau clinique",
      nav_info: "Infos MP",
      nav_patient: "Profil patient",
      nav_voice: "Analyse de la parole",
      nav_tremor: "Évaluation du tremblement",
      nav_tapping: "Tapping des doigts",
      nav_gait: "Analyse de la marche",
      nav_spiral: "Dessin en spirale",
      nav_facial: "Expression faciale",
      nav_results: "Résultats",
      nav_report: "Rapport clinique",

      dash_title: "Tableau d’évaluation clinique",
      dash_subtitle: "Résumé de dépistage UPDRS Partie III",
      dash_patient_title: "Profil patient",
      dash_patient_desc: "Complétez les informations démographiques et de contact.",
      dash_screening_title: "Évaluations motrices",
      dash_screening_desc: "Six tâches numériques mappées à l’UPDRS‑III.",
      dash_report_title: "Rapport clinique",
      dash_report_desc: "Résumé PDF avec biomarqueurs numériques.",
      dash_status_required: "Requis",
      dash_status_locked: "Verrouillé",
      dash_start: "Commencer",

      info_title: "Informations sur la maladie de Parkinson",
      info_subtitle: "Contexte clinique et protocole MDS‑UPDRS Partie III",
      info_pd_title: "Qu’est‑ce que Parkinson ?",
      info_pd_text:
        "Trouble neurodégénératif progressif avec perte de neurones dopaminérgiques dans la substance noire, entraînant tremblement, bradykinésie, rigidité et instabilité posturale.",
      info_updrs_title: "MDS‑UPDRS Partie III",
      info_updrs_text:
        "Examen moteur avec 18 items notés 0–4 (0 normal, 4 sévère). Ce prototype utilise des tâches numériques pour approximer ces domaines.",
      info_biomarker_title: "Biomarqueurs numériques",
      info_biomarker_text:
        "Voix, tremblement, tapping, marche, spirale et visage comme signatures objectives des changements moteurs.",
      info_note:
        "💡 <strong>Note clinique :</strong> Prototype de recherche ; interprétation par un neurologue/spécialiste requise.",
      info_next: "Passer aux informations de contact du patient",

      patient_title: "Informations démographiques et de contact",
      patient_subtitle: "Requis avant le dépistage",
      label_firstname: "Prénom *",
      label_lastname: "Nom *",
      label_dob: "Date de naissance *",
      label_gender: "Genre *",
      gender_select: "Sélectionner",
      gender_male: "Homme",
      gender_female: "Femme",
      gender_other: "Autre",
      gender_na: "Préfère ne pas dire",
      label_country: "Indicatif pays *",
      label_phone: "Téléphone *",
      hint_phone: "Chiffres uniquement, sans indicatif",
      label_email: "E‑mail *",
      label_medicalid: "N° dossier médical",
      patient_note:
        "📋 <strong>Documentation clinique :</strong> Les champs requis doivent être valides avant déverrouillage.",
      patient_save: "Enregistrer & Déverrouiller",

      label_language: "Langue",
      label_voice_assistant: "Voix",
      label_tremor_ui: "UI anti‑tremblement",

      fillCorrect: "Veuillez remplir correctement les informations.",
      saved: "Informations patient enregistrées. Tests déverrouillés.",
      proceedVoice: "Passage à l’analyse de la parole.",
      voiceOff: "Voix : Off",
      voiceOn: "Voix : Prête",
      tremorOn: "Anti‑tremblement : Activé",
      tremorOff: "Anti‑tremblement : Désactivé"
    },

    de: {
      nav_dashboard: "Klinisches Dashboard",
      nav_info: "PD‑Info",
      nav_patient: "Patientenprofil",
      nav_voice: "Sprachanalyse",
      nav_tremor: "Tremor‑Test",
      nav_tapping: "Finger‑Tapping",
      nav_gait: "Gang‑Analyse",
      nav_spiral: "Spiralzeichnen",
      nav_facial: "Mimik",
      nav_results: "Ergebnisse",
      nav_report: "Klinischer Bericht",

      dash_title: "Klinisches Assessment‑Dashboard",
      dash_subtitle: "UPDRS Teil III Screening‑Übersicht",
      dash_patient_title: "Patientenprofil",
      dash_patient_desc: "Demografie‑ und Kontaktdaten ausfüllen.",
      dash_screening_title: "Motorische Tests",
      dash_screening_desc: "Sechs digitale Aufgaben (UPDRS‑III).",
      dash_report_title: "Klinischer Bericht",
      dash_report_desc: "PDF‑Zusammenfassung mit digitalen Biomarkern.",
      dash_status_required: "Erforderlich",
      dash_status_locked: "Gesperrt",
      dash_start: "Starten",

      info_title: "Informationen zu Parkinson",
      info_subtitle: "Klinischer Hintergrund und MDS‑UPDRS Teil III Protokoll",
      info_pd_title: "Was ist Parkinson?",
      info_pd_text:
        "Progressive neurodegenerative Erkrankung mit Verlust dopaminerger Neuronen in der Substantia nigra; Symptome: Tremor, Bradykinese, Rigor, posturale Instabilität.",
      info_updrs_title: "MDS‑UPDRS Teil III",
      info_updrs_text:
        "Motorische Untersuchung mit 18 Items (0–4). Dieser Prototyp nutzt digitale Aufgaben zur Annäherung der Domänen.",
      info_biomarker_title: "Digitale Biomarker",
      info_biomarker_text:
        "Sprache, Tremor, Tapping, Gang, Spirale und Mimik als objektive Signaturen motorischer Veränderungen.",
      info_note:
        "💡 <strong>Klinischer Hinweis:</strong> Forschungsprototyp; Ergebnisse müssen klinisch interpretiert werden.",
      info_next: "Weiter zu Patientenkontakt",

      patient_title: "Demografie & Kontaktdaten",
      patient_subtitle: "Vor dem Screening erforderlich",
      label_firstname: "Vorname *",
      label_lastname: "Nachname *",
      label_dob: "Geburtsdatum *",
      label_gender: "Geschlecht *",
      gender_select: "Auswählen",
      gender_male: "Männlich",
      gender_female: "Weiblich",
      gender_other: "Andere",
      gender_na: "Keine Angabe",
      label_country: "Ländervorwahl *",
      label_phone: "Telefon *",
      hint_phone: "Nur Ziffern, ohne Vorwahl",
      label_email: "E‑Mail *",
      label_medicalid: "Krankenakten‑Nr.",
      patient_note:
        "📋 <strong>Klinische Dokumentation:</strong> Pflichtfelder müssen gültig sein, bevor Tests freigeschaltet werden.",
      patient_save: "Speichern & Freischalten",

      label_language: "Sprache",
      label_voice_assistant: "Sprachhinweis",
      label_tremor_ui: "Anti‑Tremor‑UI",

      fillCorrect: "Bitte füllen Sie die Informationen korrekt aus.",
      saved: "Patientendaten gespeichert. Tests freigeschaltet.",
      proceedVoice: "Weiter zur Sprachanalyse.",
      voiceOff: "Stimme: Aus",
      voiceOn: "Stimme: Bereit",
      tremorOn: "Anti‑Tremor: An",
      tremorOff: "Anti‑Tremor: Aus"
    },

    hi: {
      nav_dashboard: "क्लिनिकल डैशबोर्ड",
      nav_info: "PD जानकारी",
      nav_patient: "मरीज़ प्रोफ़ाइल",
      nav_voice: "स्पीच विश्लेषण",
      nav_tremor: "कंपन मूल्यांकन",
      nav_tapping: "फ़िंगर टैपिंग",
      nav_gait: "गैट विश्लेषण",
      nav_spiral: "स्पाइरल ड्रॉइंग",
      nav_facial: "चेहरे के भाव",
      nav_results: "परिणाम",
      nav_report: "क्लिनिकल रिपोर्ट",

      dash_title: "क्लिनिकल असेसमेंट डैशबोर्ड",
      dash_subtitle: "UPDRS भाग III स्क्रीनिंग सारांश",
      dash_patient_title: "मरीज़ प्रोफ़ाइल",
      dash_patient_desc: "डेमोग्राफिक और संपर्क विवरण भरें।",
      dash_screening_title: "मोटर असेसमेंट",
      dash_screening_desc: "UPDRS‑III से मैप किए गए 6 डिजिटल टास्क।",
      dash_report_title: "क्लिनिकल रिपोर्ट",
      dash_report_desc: "डिजिटल बायोमार्कर के साथ PDF सारांश।",
      dash_status_required: "आवश्यक",
      dash_status_locked: "लॉक्ड",
      dash_start: "आकलन शुरू करें",

      info_title: "पार्किन्सन रोग जानकारी",
      info_subtitle: "क्लिनिकल पृष्ठभूमि और MDS‑UPDRS भाग III प्रोटोकॉल",
      info_pd_title: "पार्किन्सन क्या है?",
      info_pd_text:
        "यह एक प्रगतिशील न्यूरोडीजेनेरेटिव विकार है जिसमें substantia nigra में डोपामिनर्जिक न्यूरॉन्स की हानि होती है, जिससे कंपन, ब्रैडीकाइनीज़िया, कठोरता और पोस्टुरल अस्थिरता होती है।",
      info_updrs_title: "MDS‑UPDRS भाग III",
      info_updrs_text:
        "मोटर परीक्षा (18 आइटम) जो 0–4 स्कोर होती है (0 सामान्य, 4 गंभीर)। यह प्रोटोटाइप डिजिटल टास्क से इन डोमेन को अनुमानित करता है।",
      info_biomarker_title: "डिजिटल बायोमार्कर",
      info_biomarker_text:
        "स्पीच, कंपन, टैपिंग, गैट, स्पाइरल और फेसियल मेट्रिक्स को ऑब्जेक्टिव संकेत के रूप में रिकॉर्ड किया जाता है।",
      info_note:
        "💡 <strong>क्लिनिकल नोट:</strong> यह रिसर्च प्रोटोटाइप है; निष्कर्षों की व्याख्या विशेषज्ञ द्वारा की जानी चाहिए।",
      info_next: "मरीज़ संपर्क जानकारी पर जाएँ",

      patient_title: "मरीज़ डेमोग्राफिक और संपर्क जानकारी",
      patient_subtitle: "स्क्रीनिंग से पहले दस्तावेज़ीकरण के लिए आवश्यक",
      label_firstname: "पहला नाम *",
      label_lastname: "अंतिम नाम *",
      label_dob: "जन्म तिथि *",
      label_gender: "लिंग *",
      gender_select: "लिंग चुनें",
      gender_male: "पुरुष",
      gender_female: "महिला",
      gender_other: "अन्य",
      gender_na: "न बताना चाहें",
      label_country: "कंट्री कोड *",
      label_phone: "फोन नंबर *",
      hint_phone: "केवल अंक, कंट्री कोड के बिना",
      label_email: "ईमेल *",
      label_medicalid: "मेडिकल रिकॉर्ड नंबर",
      patient_note:
        "📋 <strong>क्लिनिकल डॉक्युमेंटेशन:</strong> स्क्रीनिंग अनलॉक होने से पहले सभी आवश्यक फ़ील्ड सही होना ज़रूरी है।",
      patient_save: "सेव करें और स्क्रीनिंग अनलॉक करें",

      label_language: "भाषा",
      label_voice_assistant: "वॉइस प्रॉम्प्ट",
      label_tremor_ui: "एंटी‑ट्रेमर UI",

      fillCorrect: "कृपया जानकारी सही तरीके से भरें।",
      saved: "मरीज़ की जानकारी सेव हो गई है। स्क्रीनिंग अनलॉक हो गई।",
      proceedVoice: "स्पीच विश्लेषण पर जा रहे हैं।",
      voiceOff: "वॉइस: बंद",
      voiceOn: "वॉइस: तैयार",
      tremorOn: "एंटी‑ट्रेमर: चालू",
      tremorOff: "एंटी‑ट्रेमर: बंद"
    },

    zh: {
      nav_dashboard: "临床仪表盘",
      nav_info: "帕金森信息",
      nav_patient: "患者档案",
      nav_voice: "语音分析",
      nav_tremor: "震颤评估",
      nav_tapping: "手指敲击",
      nav_gait: "步态分析",
      nav_spiral: "螺旋绘图",
      nav_facial: "面部表情",
      nav_results: "结果",
      nav_report: "临床报告",

      dash_title: "临床评估仪表盘",
      dash_subtitle: "UPDRS 第III部分筛查摘要",
      dash_patient_title: "患者档案",
      dash_patient_desc: "填写人口学与联系方式。",
      dash_screening_title: "运动评估",
      dash_screening_desc: "六项映射到UPDRS‑III的数字任务。",
      dash_report_title: "临床报告",
      dash_report_desc: "含数字生物标志物的PDF摘要。",
      dash_status_required: "必填",
      dash_status_locked: "锁定",
      dash_start: "开始评估",

      info_title: "帕金森病信息",
      info_subtitle: "临床背景与MDS‑UPDRS 第III部分流程",
      info_pd_title: "什么是帕金森？",
      info_pd_text:
        "一种进展性神经退行性疾病，黑质多巴胺能神经元减少，表现为震颤、运动迟缓、肌强直和姿势不稳。",
      info_updrs_title: "MDS‑UPDRS 第III部分",
      info_updrs_text:
        "运动检查共18项，评分0–4（0正常，4严重）。本原型用数字任务近似这些领域。",
      info_biomarker_title: "数字生物标志物",
      info_biomarker_text:
        "采集语音、震颤、敲击、步态、螺旋和面部指标，作为客观运动变化特征。",
      info_note:
        "💡 <strong>临床提示：</strong>研究原型；结果需由神经科/运动障碍专家解读。",
      info_next: "进入患者联系信息",

      patient_title: "患者人口学与联系信息",
      patient_subtitle: "筛查前用于文档记录（必填）",
      label_firstname: "名 *",
      label_lastname: "姓 *",
      label_dob: "出生日期 *",
      label_gender: "性别 *",
      gender_select: "选择性别",
      gender_male: "男",
      gender_female: "女",
      gender_other: "其他",
      gender_na: "不愿透露",
      label_country: "国家区号 *",
      label_phone: "电话号码 *",
      hint_phone: "仅输入数字，不含国家区号",
      label_email: "邮箱 *",
      label_medicalid: "病历号",
      patient_note:
        "📋 <strong>临床文档：</strong>所有必填字段有效后才会解锁筛查测试。",
      patient_save: "保存并解锁筛查",

      label_language: "语言",
      label_voice_assistant: "语音提示",
      label_tremor_ui: "防抖UI",

      fillCorrect: "请正确填写信息。",
      saved: "患者信息已保存，筛查已解锁。",
      proceedVoice: "正在进入语音分析。",
      voiceOff: "语音：关闭",
      voiceOn: "语音：就绪",
      tremorOn: "防抖：开启",
      tremorOff: "防抖：关闭"
    }
  };

  const LANG_CFG = {
    en: { label: "English", tts: "en-US" },
    es: { label: "Español", tts: "es-ES" },
    fr: { label: "Français", tts: "fr-FR" },
    de: { label: "Deutsch", tts: "de-DE" },
    hi: { label: "हिन्दी", tts: "hi-IN" },
    zh: { label: "中文", tts: "zh-CN" }
  };

  function setText(el, txt) { if (el) el.textContent = txt; }

  function toast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    el.style.position = "fixed";
    el.style.right = "1rem";
    el.style.bottom = "1rem";
    el.style.zIndex = "9999";
    el.style.padding = "0.8rem 1rem";
    el.style.borderRadius = "12px";
    el.style.background = "rgba(0,0,0,0.75)";
    el.style.color = "#fff";
    el.style.fontFamily = "Inter, system-ui, sans-serif";
    el.style.maxWidth = "min(360px, calc(100vw - 2rem))";
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 250ms ease"; }, 1400);
    setTimeout(() => { el.remove(); }, 1800);
  }

  function setNavItemLockedByView(viewName, locked) {
    const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (!navItem) return;
    if (locked) navItem.setAttribute("disabled", "");
    else navItem.removeAttribute("disabled");
  }

  function isLocked(viewName) {
    const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    return navItem ? navItem.hasAttribute("disabled") : false;
  }

  function setActiveNav(viewName) {
    document.querySelectorAll(".nav-item").forEach(it => it.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (navItem) navItem.classList.add("active");
  }

  function closeSidebarOnMobile() {
    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.remove("open");
  }

  function showView(viewName) {
    if (isLocked(viewName)) {
      toast((I18N_TEXT[APP.currentLang] || I18N_TEXT.en).fillCorrect);
      speakKey("fillCorrect");
      return;
    }

    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    const viewEl = $(`${viewName}View`);
    if (viewEl) viewEl.classList.add("active");
    setActiveNav(viewName);
    closeSidebarOnMobile();

    if (viewName === "results") renderResults();
    if (viewName === "report") renderReport();
  }

  /* ---------- Translation ---------- */
  function translatePage() {
    const dict = I18N_TEXT[APP.currentLang] || I18N_TEXT.en;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    const cfg = LANG_CFG[APP.currentLang] || LANG_CFG.en;
    setText($("currentLanguageLabel"), cfg.label);

    const voiceTxt = APP.voiceEnabled ? dict.voiceOn : dict.voiceOff;
    const tremTxt = APP.tremorEnabled ? dict.tremorOn : dict.tremorOff;
    setText($("voiceDangleText"), voiceTxt);
    setText($("tremorDangleText"), tremTxt);

    ["languageSelect", "topLanguageSelect", "dashboardLanguageSelect"].forEach(id => {
      const s = $(id);
      if (s && s.value !== APP.currentLang) s.value = APP.currentLang;
    });
  }

  function setLanguage(lang) {
    if (!I18N_TEXT[lang]) lang = "en";
    APP.currentLang = lang;
    translatePage();
    speakText((LANG_CFG[lang] || LANG_CFG.en).label);
  }

  /* ---------- Voice TTS ---------- */
  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    APP.voices = window.speechSynthesis.getVoices() || [];
  }

  function chooseVoiceForLang(langCode) {
    const tts = (LANG_CFG[langCode] && LANG_CFG[langCode].tts) ? LANG_CFG[langCode].tts : "en-US";
    const voices = APP.voices || [];
    let v = voices.find(x => (x.lang || "").toLowerCase() === tts.toLowerCase());
    if (!v) {
      const prefix = tts.split("-")[0].toLowerCase();
      v = voices.find(x => (x.lang || "").toLowerCase().startsWith(prefix));
    }
    return v || null;
  }

  function speakText(text) {
    if (!APP.voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(String(text || "").trim());
    utter.lang = (LANG_CFG[APP.currentLang]?.tts || "en-US");
    const v = chooseVoiceForLang(APP.currentLang);
    if (v) utter.voice = v;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function speakKey(key) {
    const dict = I18N_TEXT[APP.currentLang] || I18N_TEXT.en;
    const msg = dict[key] || (I18N_TEXT.en[key] || "");
    if (msg) speakText(msg.replace(/<[^>]*>/g, ""));
  }

  /* ---------- Splash ---------- */
  function initSplash() {
    const splash = $("splashScreen");
    const bar = $("splashProgress");
    if (!splash || !bar) return;

    let p = 0;
    const timer = setInterval(() => {
      p += 3;
      bar.style.width = Math.min(p, 100) + "%";
      if (p >= 100) {
        clearInterval(timer);
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
        setTimeout(() => splash.remove(), 450);
        showView("info");
        speakText("Welcome to NeuroSynapse‑PD.");
      }
    }, 40);
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const menuToggle = $("menuToggle");
    const sidebarBack = $("sidebarBack");
    const sidebar = $("sidebar");

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    }
    if (sidebarBack && sidebar) {
      sidebarBack.addEventListener("click", () => sidebar.classList.remove("open"));
    }

    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        if (view) showView(view);
      });
    });

    document.querySelectorAll(".nav-item[data-view]").forEach(item => {
      item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        if (view) showView(view);
      });
    });
  }

  /* ---------- Toggles ---------- */
  async function requestMotionPermissionIfNeeded() {
    try {
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== "granted") toast("Motion permission denied.");
      }
    } catch (e) {}
  }

  function initToggles() {
    const voiceToggle = $("voiceToggle");
    const tremorToggle = $("tremorToggle");

    if (voiceToggle) {
      voiceToggle.addEventListener("click", () => {
        APP.voiceEnabled = !APP.voiceEnabled;
        voiceToggle.classList.toggle("active", APP.voiceEnabled);
        voiceToggle.setAttribute("aria-checked", APP.voiceEnabled ? "true" : "false");
        translatePage();
        speakKey(APP.voiceEnabled ? "voiceOn" : "voiceOff");
      });
    }

    if (tremorToggle) {
      tremorToggle.addEventListener("click", async () => {
        APP.tremorEnabled = !APP.tremorEnabled;
        tremorToggle.classList.toggle("active", APP.tremorEnabled);
        tremorToggle.setAttribute("aria-checked", APP.tremorEnabled ? "true" : "false");
        translatePage();
        if (APP.tremorEnabled) await requestMotionPermissionIfNeeded();
      });
    }
  }

  /* ---------- Patient form ---------- */
  function initPatientForm() {
    const form = $("patientForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstName = ($("firstName")?.value || "").trim();
      const lastName = ($("lastName")?.value || "").trim();
      const dob = $("dateOfBirth")?.value || "";
      const gender = $("gender")?.value || "";
      const country = $("countryCode")?.value || "";
      const phone = ($("phoneNumber")?.value || "").trim();
      const email = ($("email")?.value || "").trim();
      const medicalId = ($("medicalId")?.value || "").trim();

      ["firstNameError","lastNameError","dobError","genderError","countryError","phoneError","emailError"].forEach(id => setText($(id), ""));

      let ok = true;
      if (!firstName) { setText($("firstNameError"), "Required"); ok = false; }
      if (!lastName) { setText($("lastNameError"), "Required"); ok = false; }
      if (!dob) { setText($("dobError"), "Required"); ok = false; }
      if (!gender) { setText($("genderError"), "Required"); ok = false; }
      if (!country) { setText($("countryError"), "Required"); ok = false; }

      const phoneOk = /^[0-9]{6,15}$/.test(phone);
      if (!phoneOk) { setText($("phoneError"), "Digits only (6–15)"); ok = false; }

      const emailOk = /^[^s@]+@[^s@]+.[^s@]{2,}$/.test(email);
      if (!emailOk) { setText($("emailError"), "Invalid email"); ok = false; }

      if (!ok) {
        toast((I18N_TEXT[APP.currentLang] || I18N_TEXT.en).fillCorrect);
        speakKey("fillCorrect");
        return;
      }

      const patient = { firstName, lastName, dob, gender, country, phone, email, medicalId, savedAt: new Date().toISOString() };
      localStorage.setItem("ns_pd_patient", JSON.stringify(patient));
      APP.patientSaved = true;

      setText($("patientStatus"), "Completed");
      $("patientStatus")?.classList.remove("status-pending");
      $("patientStatus")?.classList.add("status-ok");

      ["voice","tremor","tapping","gait","spiral","facial"].forEach(v => setNavItemLockedByView(v, false));

      toast((I18N_TEXT[APP.currentLang] || I18N_TEXT.en).saved);
      speakKey("saved");

      setTimeout(() => {
        speakKey("proceedVoice");
        showView("voice");
      }, 550);
    });
  }

  /* ---------- Progress / Results ---------- */
  function updateProgress() {
    const doneCount = ["voice","tremor","gait","facial","tapping","spiral"].filter(k => !!APP.completed[k]).length;
    setText($("screeningStatus"), `${doneCount}/6`);

    const implDone = ["voice","tremor","gait","facial"].filter(k => !!APP.completed[k]).length;
    const canUnlockResults = implDone >= 2;

    setNavItemLockedByView("results", !canUnlockResults);
    setNavItemLockedByView("report", !canUnlockResults);

    if (canUnlockResults) {
      $("reportStatus")?.classList.remove("status-pending");
      $("reportStatus")?.classList.add("status-ok");
      setText($("reportStatus"), "Unlocked");
    }
  }

  function renderResults() {
    const body = $("resultsTableBody");
    if (!body) return;
    body.innerHTML = "";

    const rows = [
      { key: "voice", domain: "Speech (UPDRS 3.1)", score: APP.results.voice?.score, interp: APP.results.voice?.interp },
      { key: "tremor", domain: "Tremor (UPDRS 3.15–18)", score: APP.results.tremor?.score, interp: APP.results.tremor?.interp },
      { key: "gait", domain: "Gait (UPDRS 3.10–11)", score: APP.results.gait?.score, interp: APP.results.gait?.interp },
      { key: "facial", domain: "Facial (UPDRS 3.2)", score: APP.results.facial?.score, interp: APP.results.facial?.interp }
    ];

    rows.forEach(r => {
      const tr = document.createElement("tr");
      const status = APP.completed[r.key] ? "Completed" : "Pending";
      tr.innerHTML = `
        <td>${r.domain}</td>
        <td>${status}</td>
        <td>${APP.completed[r.key] ? (r.score ?? "--") : "--"}</td>
        <td>${APP.completed[r.key] ? (r.interp ?? "—") : "Complete assessment to view."}</td>
      `;
      body.appendChild(tr);
    });

    const overall = $("overallRisk");
    const impression = $("clinicalImpression");
    const completedCount = rows.filter(r => APP.completed[r.key]).length;

    if (overall && impression) {
      if (completedCount < 2) {
        overall.className = "risk-indicator risk-low";
        overall.innerHTML = '<i class="fas fa-info-circle"></i><span>Incomplete - More tests needed</span>';
        impression.innerHTML = "<p>Complete more assessments to generate clinical impression.</p>";
      } else {
        const scores = rows.filter(r => APP.completed[r.key] && typeof r.score === "number").map(r => r.score);
        const avg = scores.length ? (scores.reduce((a,b) => a + b, 0) / scores.length) : 0;

        if (avg < 1.25) {
          overall.className = "risk-indicator risk-low";
          overall.innerHTML = '<i class="fas fa-check-circle"></i><span>Low Risk - Mild/Normal findings</span>';
          impression.innerHTML = "<p>Digital measures are within mild or normal ranges. Clinical correlation recommended.</p>";
        } else if (avg < 2.5) {
          overall.className = "risk-indicator risk-medium";
          overall.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Moderate Risk - Notable motor changes</span>';
          impression.innerHTML = "<p>Multiple domains show moderate deviation. Consider clinician review and repeat testing.</p>";
        } else {
          overall.className = "risk-indicator risk-high";
          overall.innerHTML = '<i class="fas fa-times-circle"></i><span>High Risk - Significant motor impairment</span>';
          impression.innerHTML = "<p>Signals suggest higher impairment. Neurologist evaluation is advised.</p>";
        }
      }
    }

    const canReport = completedCount >= 2;
    if ($("goToReportBtn")) $("goToReportBtn").disabled = !canReport;
    if ($("generateReport")) $("generateReport").disabled = !canReport;
  }

  function renderReport() {
    const patientBox = $("reportPatientInfo");
    const summaryBox = $("reportSummary");
    if (!patientBox || !summaryBox) return;

    let patient = null;
    try { patient = JSON.parse(localStorage.getItem("ns_pd_patient") || "null"); } catch (e) {}

    if (!patient) {
      patientBox.innerHTML = "<p>No patient information available.</p>";
    } else {
      patientBox.innerHTML = `
        <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
        <p><strong>DOB:</strong> ${patient.dob}</p>
        <p><strong>Gender:</strong> ${patient.gender}</p>
        <p><strong>Phone:</strong> ${patient.country}${patient.phone}</p>
        <p><strong>Email:</strong> ${patient.email}</p>
        <p><strong>MRN:</strong> ${patient.medicalId || "—"}</p>
      `;
    }

    const items = [];
    if (APP.results.voice) items.push(`Voice score: ${APP.results.voice.score} (${APP.results.voice.interp})`);
    if (APP.results.tremor) items.push(`Tremor score: ${APP.results.tremor.score} (${APP.results.tremor.interp})`);
    if (APP.results.gait) items.push(`Gait score: ${APP.results.gait.score} (${APP.results.gait.interp})`);
    if (APP.results.facial) items.push(`Facial score: ${APP.results.facial.score} (${APP.results.facial.interp})`);

    summaryBox.innerHTML = items.length
      ? `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`
      : "<p>Complete assessments and generate report to view summary.</p>";
  }

  /* ---------- Voice test (MediaRecorder) ---------- */
  let voiceStream = null;
  let voiceRecorder = null;
  let voiceTimerInt = null;
  let voiceChunks = [];

  function initVoiceTest() {
    const startBtn = $("startVoiceTest");
    const retryBtn = $("retryVoiceTest");
    const saveBtn = $("saveVoiceResults");

    if (!startBtn || !retryBtn || !saveBtn) return;

    startBtn.addEventListener("click", async () => {
      try {
        startBtn.disabled = true;
        retryBtn.disabled = true;
        saveBtn.disabled = true;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceStream = stream;
        voiceChunks = [];

        voiceRecorder = new MediaRecorder(stream);
        voiceRecorder.ondataavailable = (e) => { if (e.data && e.data.size) voiceChunks.push(e.data); };

        voiceRecorder.start();

        let t = 8;
        setText($("voiceTimer"), "00:08");
        voiceTimerInt = setInterval(() => {
          t -= 1;
          setText($("voiceTimer"), `00:${String(Math.max(t, 0)).padStart(2, "0")}`);
          if (t <= 0) {
            clearInterval(voiceTimerInt);
            voiceRecorder.stop();
          }
        }, 1000);

        voiceRecorder.onstop = () => {
          try { voiceStream.getTracks().forEach(tr => tr.stop()); } catch (e) {}

          // Stable placeholder metrics
          const jitter = +(Math.random() * 0.8 + 0.3).toFixed(2);
          const shimmer = +(Math.random() * 1.5 + 0.5).toFixed(2);
          const hnr = +(Math.random() * 8 + 12).toFixed(1);
          const pitch = Math.floor(Math.random() * 60 + 140);

          setText($("jitterValue"), jitter.toFixed(2));
          setText($("shimmerValue"), shimmer.toFixed(2));
          setText($("hnrValue"), hnr.toFixed(1));
          setText($("pitchValue"), String(pitch));

          const score =
            (jitter < 0.8 && shimmer < 1.5) ? 0 :
            (jitter < 1.2) ? 1 :
            (jitter < 1.8) ? 2 : 3;

          const interp = (score <= 1) ? "Near-normal phonation stability." : "Increased perturbation; clinician review advised.";
          APP.results.voice = { jitter, shimmer, hnr, pitch, score, interp };

          retryBtn.disabled = false;
          saveBtn.disabled = false;
        };
      } catch (e) {
        startBtn.disabled = false;
        toast("Microphone permission denied.");
      }
    });

    retryBtn.addEventListener("click", () => {
      setText($("jitterValue"), "--");
      setText($("shimmerValue"), "--");
      setText($("hnrValue"), "--");
      setText($("pitchValue"), "--");
      setText($("voiceTimer"), "00:08");
      $("startVoiceTest").disabled = false;
      $("saveVoiceResults").disabled = true;
    });

    saveBtn.addEventListener("click", () => {
      APP.completed.voice = true;
      toast("Voice results saved.");
      updateProgress();
      renderResults();
      showView("tremor");
    });
  }

  /* ---------- Tremor test (DeviceMotion) ---------- */
  let tremorActive = false;
  let tremorSamples = [];
  let tremorTimerInt = null;
  let tremorHand = "right";

  function initTremorTest() {
    const rightBtn = $("rightHandBtn");
    const leftBtn = $("leftHandBtn");
    const startBtn = $("startTremorTest");
    const saveBtn = $("saveTremorResults");

    if (rightBtn) rightBtn.addEventListener("click", () => {
      tremorHand = "right";
      rightBtn.classList.add("active");
      leftBtn?.classList.remove("active");
    });

    if (leftBtn) leftBtn.addEventListener("click", () => {
      tremorHand = "left";
      leftBtn.classList.add("active");
      rightBtn?.classList.remove("active");
    });

    if (!startBtn || !saveBtn) return;

    startBtn.addEventListener("click", async () => {
      await requestMotionPermissionIfNeeded();

      tremorSamples = [];
      tremorActive = true;
      saveBtn.disabled = true;
      startBtn.disabled = true;

      const handler = (e) => {
        if (!tremorActive) return;
        const a = e.accelerationIncludingGravity || e.acceleration;
        if (!a) return;
        const ax = a.x || 0, ay = a.y || 0, az = a.z || 0;
        const mag = Math.sqrt(ax*ax + ay*ay + az*az);
        tremorSamples.push({ t: performance.now(), mag });
      };

      window.addEventListener("devicemotion", handler, { passive: true });

      let t = 20;
      setText($("tremorTimer"), "00:20");
      tremorTimerInt = setInterval(() => {
        t -= 1;
        setText($("tremorTimer"), `00:${String(Math.max(t, 0)).padStart(2, "0")}`);
        if (t <= 0) {
          clearInterval(tremorTimerInt);
          tremorActive = false;
          window.removeEventListener("devicemotion", handler);

          const mags = tremorSamples.map(s => s.mag);
          const mean = mags.reduce((a,b)=>a+b,0) / Math.max(mags.length, 1);
          const signal = mags.map(v => v - mean);

          let crossings = 0;
          for (let i = 1; i < signal.length; i++) {
            if ((signal[i-1] <= 0 && signal[i] > 0) || (signal[i-1] >= 0 && signal[i] < 0)) crossings++;
          }

          const durationSec = tremorSamples.length ? (tremorSamples[tremorSamples.length-1].t - tremorSamples[0].t)/1000 : 0;
          const freq = durationSec > 0 ? (crossings / 2) / durationSec : 0;

          const variance = signal.reduce((a,b)=>a + (b*b), 0) / Math.max(signal.length, 1);
          const std = Math.sqrt(variance);
          const ampMm = Math.min(12, Math.max(0, std * 2.2));
          const consistency = tremorSamples.length > 30 ? Math.min(100, (tremorSamples.length / 1200) * 100) : 20;

          setText($("frequencyValue"), freq ? freq.toFixed(2) : "--");
          setText($("amplitudeValue"), ampMm ? ampMm.toFixed(1) : "--");
          setText($("consistencyValue"), consistency.toFixed(0));

          let score = 0;
          if (ampMm > 1.5) score = 1;
          if (ampMm > 3.5) score = 2;
          if (ampMm > 7.0) score = 3;
          if (ampMm > 10.0) score = 4;

          setText($("severityScore"), String(score));

          APP.results.tremor = {
            hand: tremorHand,
            frequencyHz: +freq.toFixed(2),
            amplitudeMm: +ampMm.toFixed(1),
            consistency: +consistency.toFixed(0),
            score,
            interp: score <= 1 ? "Low tremor amplitude." : "Elevated tremor amplitude detected."
          };

          saveBtn.disabled = false;
          startBtn.disabled = false;
        }
      }, 1000);
    });

    saveBtn.addEventListener("click", () => {
      APP.completed.tremor = true;
      toast("Tremor results saved.");
      updateProgress();
      renderResults();
      showView("gait");
    });
  }

  /* ---------- MediaPipe helpers ---------- */
  function fitCanvasToVideo(video, canvas) {
    if (!video || !canvas) return;
    const rect = video.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  }

  window.addEventListener("resize", () => {
    fitCanvasToVideo($("gaitVideo"), $("gaitCanvas"));
    fitCanvasToVideo($("faceVideo"), $("faceCanvas"));
  });

  /* ---------- Gait (MediaPipe Pose) ---------- */
  let gaitCamera = null;
  let gaitPose = null;
  let gaitRunning = false;
  let gaitTimerInt = null;
  let gaitFrames = [];

  function initGaitTest() {
    const videoEl = $("gaitVideo");
    const canvasEl = $("gaitCanvas");
    const ctx = canvasEl ? canvasEl.getContext("2d") : null;

    const startBtn = $("startGaitTest");
    const flipBtn = $("flipGaitCamera");
    const fsBtn = $("gaitFullscreen");
    const saveBtn = $("saveGaitResults");

    if (!videoEl || !canvasEl || !ctx || !startBtn || !flipBtn || !fsBtn || !saveBtn) return;

    const onResults = (results) => {
      if (!gaitRunning) return;

      fitCanvasToVideo(videoEl, canvasEl);
      ctx.save();
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

      if (results.poseLandmarks) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: "#00e5ff", lineWidth: 2 });
        window.drawLandmarks(ctx, results.poseLandmarks, { color: "#ffea00", lineWidth: 1 });

        const L = results.poseLandmarks[27];
        const R = results.poseLandmarks[28];
        if (L && R) {
          const dx = (L.x - R.x);
          const dy = (L.y - R.y);
          const dist = Math.sqrt(dx*dx + dy*dy);
          gaitFrames.push({ t: performance.now(), dist });
        }
      }
      ctx.restore();
    };

    function ensurePose() {
      if (gaitPose) return;
      gaitPose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${window.Pose.VERSION}/${file}`
      });
      gaitPose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        selfieMode: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      gaitPose.onResults(onResults);
    }

    async function startCamera() {
      ensurePose();

      if (gaitCamera) {
        gaitCamera.stop();
        gaitCamera = null;
      }

      gaitCamera = new window.Camera(videoEl, {
        onFrame: async () => { await gaitPose.send({ image: videoEl }); },
        width: 1280,
        height: 720
      });

      await gaitCamera.start();
      fitCanvasToVideo(videoEl, canvasEl);
    }

    async function runGait() {
      try {
        startBtn.disabled = true;
        saveBtn.disabled = true;
        gaitFrames = [];
        gaitRunning = true;

        await startCamera();

        let t = 15;
        setText($("gaitTimer"), "00:15");
        gaitTimerInt = setInterval(() => {
          t -= 1;
          setText($("gaitTimer"), `00:${String(Math.max(t, 0)).padStart(2, "0")}`);
          if (t <= 0) {
            clearInterval(gaitTimerInt);
            gaitRunning = false;
            try { gaitCamera && gaitCamera.stop(); } catch (e) {}

            const d = gaitFrames.map(x => x.dist);
            const mean = d.reduce((a,b)=>a+b,0) / Math.max(d.length, 1);
            const varr = d.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / Math.max(d.length, 1);
            const std = Math.sqrt(varr);

            let peaks = 0;
            for (let i = 1; i < d.length - 1; i++) {
              if (d[i] > d[i-1] && d[i] > d[i+1] && d[i] > mean + std * 0.2) peaks++;
            }

            const durationSec = gaitFrames.length ? (gaitFrames[gaitFrames.length-1].t - gaitFrames[0].t) / 1000 : 0;
            const cadence = durationSec > 0 ? (peaks / durationSec) * 60 : 0;
            const stepLenCm = Math.min(90, Math.max(10, mean * 110));

            const balance = Math.max(0, Math.min(100, 85 - std * 180));
            const posture = Math.max(0, Math.min(100, 80 - std * 150));

            setText($("stepLength"), stepLenCm.toFixed(1));
            setText($("stepCadence"), cadence.toFixed(0));
            setText($("balanceScore"), balance.toFixed(0));
            setText($("postureScore"), posture.toFixed(0));

            const score = (balance > 70 && posture > 65) ? 0 : (balance > 55 ? 1 : (balance > 40 ? 2 : 3));
            APP.results.gait = {
              stepLengthCm: +stepLenCm.toFixed(1),
              cadence: +cadence.toFixed(0),
              balance: +balance.toFixed(0),
              posture: +posture.toFixed(0),
              score,
              interp: score <= 1 ? "Gait appears near-normal." : "Gait deviation detected; consider clinician review."
            };

            saveBtn.disabled = false;
            startBtn.disabled = false;
          }
        }, 1000);
      } catch (e) {
        gaitRunning = false;
        startBtn.disabled = false;
        toast("Camera permission denied.");
      }
    }

    startBtn.addEventListener("click", runGait);

    flipBtn.addEventListener("click", () => {
      APP.devices.gaitFacingMode = (APP.devices.gaitFacingMode === "user") ? "environment" : "user";
      if (gaitPose) gaitPose.setOptions({ selfieMode: APP.devices.gaitFacingMode === "user" });
      toast("Camera flipped (software).");
    });

    fsBtn.addEventListener("click", () => {
      const box = $("gaitViz");
      if (box && box.requestFullscreen) box.requestFullscreen();
    });

    saveBtn.addEventListener("click", () => {
      APP.completed.gait = true;
      toast("Gait results saved.");
      updateProgress();
      renderResults();
      showView("facial");
    });
  }

  /* ---------- Face (MediaPipe FaceMesh) ---------- */
  let faceCamera = null;
  let faceMesh = null;
  let faceRunning = false;
  let faceTimerInt = null;
  let faceFrames = [];
  let blinkCount = 0;
  let lastEyeOpen = null;

  function initFaceTest() {
    const videoEl = $("faceVideo");
    const canvasEl = $("faceCanvas");
    const ctx = canvasEl ? canvasEl.getContext("2d") : null;

    const startBtn = $("startFaceTest");
    const flipBtn = $("flipFaceCamera");
    const fsBtn = $("faceFullscreen");
    const saveBtn = $("saveFaceResults");

    if (!videoEl || !canvasEl || !ctx || !startBtn || !flipBtn || !fsBtn || !saveBtn) return;

    const onResults = (results) => {
      if (!faceRunning) return;

      fitCanvasToVideo(videoEl, canvasEl);
      ctx.save();
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const lm = results.multiFaceLandmarks[0];
        window.drawConnectors(ctx, lm, window.FACEMESH_TESSELATION, { color: "#00e5ff", lineWidth: 1 });

        const leftMouth = lm[61];
        const rightMouth = lm[291];
        const mouthDy = (leftMouth && rightMouth) ? Math.abs(leftMouth.y - rightMouth.y) : 0;

        const le = (lm[159] && lm[145]) ? Math.abs(lm[159].y - lm[145].y) : null;
        const re = (lm[386] && lm[374]) ? Math.abs(lm[386].y - lm[374].y) : null;
        const eyeOpen = (le !== null && re !== null) ? (le + re) / 2 : null;

        if (eyeOpen !== null) {
          if (lastEyeOpen === null) lastEyeOpen = eyeOpen;
          const closed = eyeOpen < 0.012;
          if (closed && lastEyeOpen >= 0.012) blinkCount++;
          lastEyeOpen = eyeOpen;
        }

        faceFrames.push({ t: performance.now(), mouthDy });
      }

      ctx.restore();
    };

    function ensureFaceMesh() {
      if (faceMesh) return;
      faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${window.FaceMesh.VERSION}/${file}`
      });
      faceMesh.setOptions({
        selfieMode: true,
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      faceMesh.onResults(onResults);
    }

    async function startCamera() {
      ensureFaceMesh();

      if (faceCamera) {
        faceCamera.stop();
        faceCamera = null;
      }

      faceCamera = new window.Camera(videoEl, {
        onFrame: async () => { await faceMesh.send({ image: videoEl }); },
        width: 1280,
        height: 720
      });

      await faceCamera.start();
      fitCanvasToVideo(videoEl, canvasEl);
    }

    async function runFace() {
      try {
        startBtn.disabled = true;
        saveBtn.disabled = true;
        faceFrames = [];
        blinkCount = 0;
        lastEyeOpen = null;
        faceRunning = true;

        await startCamera();

        let t = 10;
        setText($("faceTimer"), "00:10");
        faceTimerInt = setInterval(() => {
          t -= 1;
          setText($("faceTimer"), `00:${String(Math.max(t, 0)).padStart(2, "0")}`);
          if (t <= 0) {
            clearInterval(faceTimerInt);
            faceRunning = false;
            try { faceCamera && faceCamera.stop(); } catch (e) {}

            const mouthDy = faceFrames.map(x => x.mouthDy);
            const mean = mouthDy.reduce((a,b)=>a+b,0) / Math.max(mouthDy.length, 1);

            const sym = Math.max(0, Math.min(100, 100 - mean * 600));
            const durationSec = faceFrames.length ? (faceFrames[faceFrames.length-1].t - faceFrames[0].t) / 1000 : 10;
            const blinkRate = durationSec > 0 ? (blinkCount / durationSec) * 60 : blinkCount * 6;

            const expression = Math.max(0, Math.min(100, 70 - mean * 500));
            const movement = Math.max(0, Math.min(100, 75 - mean * 450));

            setText($("symmetryScore"), sym.toFixed(0));
            setText($("blinkRate"), blinkRate.toFixed(0));
            setText($("expressionScore"), expression.toFixed(0));
            setText($("movementScore"), movement.toFixed(0));

            const score = (expression > 60 && movement > 60) ? 0 : (expression > 45 ? 1 : (expression > 30 ? 2 : 3));
            APP.results.facial = {
              symmetry: +sym.toFixed(0),
              blinkRate: +blinkRate.toFixed(0),
              expression: +expression.toFixed(0),
              movement: +movement.toFixed(0),
              score,
              interp: score <= 1 ? "Facial mobility appears near-normal." : "Reduced facial movement; consider hypomimia review."
            };

            saveBtn.disabled = false;
            startBtn.disabled = false;
          }
        }, 1000);
      } catch (e) {
        faceRunning = false;
        startBtn.disabled = false;
        toast("Camera permission denied.");
      }
    }

    startBtn.addEventListener("click", runFace);

    flipBtn.addEventListener("click", () => {
      APP.devices.faceFacingMode = (APP.devices.faceFacingMode === "user") ? "environment" : "user";
      if (faceMesh) faceMesh.setOptions({ selfieMode: APP.devices.faceFacingMode === "user" });
      toast("Camera flipped (software).");
    });

    fsBtn.addEventListener("click", () => {
      const box = $("faceViz");
      if (box && box.requestFullscreen) box.requestFullscreen();
    });

    saveBtn.addEventListener("click", () => {
      APP.completed.facial = true;
      toast("Facial results saved.");
      updateProgress();
      renderResults();
      showView("results");
    });
  }

  /* ---------- Language init & syncing ---------- */
  function initLanguage() {
    loadVoices();
    if ("speechSynthesis" in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => loadVoices();
    }

    const top = $("topLanguageSelect");
    const side = $("languageSelect");
    const dash = $("dashboardLanguageSelect");

    [top, side, dash].forEach(sel => {
      if (!sel) return;
      sel.addEventListener("change", () => setLanguage(sel.value));
    });

    translatePage();
  }

  /* ---------- Report generation (placeholder hook) ---------- */
  function initReport() {
    const btn = $("generateReport");
    if (!btn) return;
    btn.addEventListener("click", () => {
      renderReport();
      toast("PDF generation not included in this file yet.");
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    setVH();

    initLanguage();
    initSplash();
    initNav();
    initToggles();
    initPatientForm();
    initVoiceTest();
    initTremorTest();
    initGaitTest();
    initFaceTest();
    initReport();

    // Lock everything until patient saved
    ["voice","tremor","tapping","gait","spiral","facial","results","report"].forEach(v => setNavItemLockedByView(v, true));

    // Restore patient
    try {
      const patient = JSON.parse(localStorage.getItem("ns_pd_patient") || "null");
      if (patient && patient.firstName) {
        APP.patientSaved = true;
        setText($("patientStatus"), "Completed");
        $("patientStatus")?.classList.remove("status-pending");
        $("patientStatus")?.classList.add("status-ok");
        ["voice","tremor","tapping","gait","spiral","facial"].forEach(v => setNavItemLockedByView(v, false));
        updateProgress();
      }
    } catch (e) {}

    // Ensure default flow
    showView("info");
  });

})();