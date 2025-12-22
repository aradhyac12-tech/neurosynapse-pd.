// NeuroCompass-PD v3.0 - Multilingual Support (English, Hindi, Russian)

window.LANGUAGES = {
    en: {
        // Navigation
        navdashboard: '🏠 Dashboard',
        navinfo: '📖 Info',
        navvoice: '🎤 Speech',
        navtremor: '📱 Tremor',
        navgait: '🚶 Gait',
        navfacial: '😊 Facial',
        navquestions: '❓ Questions',
        navspiral: '✏️ Spiral',
        navresults: '📊 Results',
        navreport: '📄 Report',
    },
    
    hi: {
        // Navigation
        navdashboard: '🏠 डैशबोर्ड',
        navinfo: '📖 जानकारी',
        navvoice: '🎤 भाषण',
        navtremor: '📱 कंपन',
        navgait: '🚶 चाल',
        navfacial: '😊 चेहरा',
        navquestions: '❓ प्रश्न',
        navspiral: '✏️ सर्पिल',
        navresults: '📊 परिणाम',
        navreport: '📄 रिपोर्ट',
    },
    
    ru: {
        // Navigation
        navdashboard: '🏠 Панель',
        navinfo: '📖 Информация',
        navvoice: '🎤 Речь',
        navtremor: '📱 Тремор',
        navgait: '🚶 Ходьба',
        navfacial: '😊 Лицо',
        navquestions: '❓ Вопросы',
        navspiral: '✏️ Спираль',
        navresults: '📊 Результаты',
        navreport: '📄 Отчет',
    }
};

// Initialize translations
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Translations are applied by assessment.js
    });
}
