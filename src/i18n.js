import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "CivicResolve",
      "home": "Home",
      "report": "Report Issue",
      "track": "Track Issue",
      "login": "Login",
      "signup": "Sign Up",
      "dashboard": "Dashboard",
      "logout": "Logout",
      
      "hero_title": "Improve Your Community, Together.",
      "hero_subtitle": "Report civic issues like potholes, garbage, or broken streetlights directly to your local authorities.",
      
      "portal_admin_title": "Administrative Overview",
      "portal_admin_desc": "Monitor real-time statistics, manage tickets, and resolve community issues efficiently.",
      "portal_admin_btn": "Go to Admin Dashboard",
      
      "portal_dept_title": "Department Operations",
      "portal_dept_desc": "Manage your department's assignments, oversee field workers, and verify issue resolutions.",
      "portal_dept_btn": "Go to Dept Dashboard",

      "portal_worker_title": "Field Workforce Portal",
      "portal_worker_desc": "View your assigned tasks, upload proof of work, and update job status on the go.",
      "portal_worker_btn": "View My Tasks",

      // Stats
      "stat_total": "Total Reports Filed",
      "stat_resolved": "Issues Resolved",
      "stat_pending": "Pending Action",
      "stat_citizens": "Registered Citizens", // <--- NEW

      "map_title": "Live Community Map",
      "map_desc": "See what's happening around you. Green pins are resolved, Blue/Red are in progress.",

      "analytics_title_sys": "System Analytics",
      "analytics_title_com": "Community Impact Analytics",
      "analytics_desc_sys": "Detailed breakdown of active and resolved cases.",
      "analytics_desc_com": "Real-time data on what is being reported and how fast we are fixing it.",
      "chart_cat": "Issues by Category",
      "chart_res": "Resolution Rate",

      "hiw_title": "How It Works",
      "hiw_1_t": "1. Report It",
      "hiw_1_d": "Pin the location on the map and describe the issue. Upload a photo for proof.",
      "hiw_2_t": "2. We Assign It",
      "hiw_2_d": "Your report is automatically routed to the relevant department officer.",
      "hiw_3_t": "3. Track It",
      "hiw_3_d": "Follow the status in real-time and rate the resolution once it is fixed."
    }
  },
  hi: {
    translation: {
      "app_name": "जन समाधान",
      "home": "मुख्य पृष्ठ",
      "report": "शिकायत दर्ज करें",
      "track": "स्थिति देखें",
      "login": "लॉग इन",
      "signup": "साइन अप",
      "dashboard": "डैशबोर्ड",
      "logout": "लॉग आउट",

      "hero_title": "मिलकर अपने समुदाय को बेहतर बनाएं।",
      "hero_subtitle": "अपने स्थानीय अधिकारियों को सीधे गड्ढे, कचरा, या टूटी हुई स्ट्रीटलाइट जैसी नागरिक समस्याओं की रिपोर्ट करें।",

      "portal_admin_title": "प्रशासनिक अवलोकन",
      "portal_admin_desc": "वास्तविक समय के आंकड़ों की निगरानी करें, टिकट प्रबंधित करें और सामुदायिक मुद्दों को कुशलतापूर्वक हल करें।",
      "portal_admin_btn": "एडमिन डैशबोर्ड पर जाएं",

      "portal_dept_title": "विभाग संचालन",
      "portal_dept_desc": "अपने विभाग के कार्यों का प्रबंधन करें, फील्ड वर्करों की निगरानी करें और समस्या समाधान का सत्यापन करें।",
      "portal_dept_btn": "विभाग डैशबोर्ड पर जाएं",

      "portal_worker_title": "फील्ड वर्कफोर्स पोर्टल",
      "portal_worker_desc": "अपने सौंपे गए कार्यों को देखें, काम का सबूत अपलोड करें और नौकरी की स्थिति अपडेट करें।",
      "portal_worker_btn": "मेरे कार्य देखें",

      "stat_total": "कुल रिपोर्ट",
      "stat_resolved": "हल किया गया",
      "stat_pending": "लंबित कार्रवाई",
      "stat_citizens": "पंजीकृत नागरिक", // <--- NEW

      "map_title": "लाइव सामुदायिक मानचित्र",
      "map_desc": "देखें कि आपके आस-पास क्या हो रहा है। हरे पिन हल किए गए हैं, नीले/लाल प्रगति पर हैं।",

      "analytics_title_sys": "सिस्टम एनालिटिक्स",
      "analytics_title_com": "सामुदायिक प्रभाव विश्लेषण",
      "analytics_desc_sys": "सक्रिय और हल किए गए मामलों का विस्तृत विवरण।",
      "analytics_desc_com": "वास्तविक समय का डेटा कि क्या रिपोर्ट किया जा रहा है और हम इसे कितनी तेजी से ठीक कर रहे हैं।",
      "chart_cat": "श्रेणी के अनुसार मुद्दे",
      "chart_res": "समाधान दर",

      "hiw_title": "यह कैसे काम करता है",
      "hiw_1_t": "1. रिपोर्ट करें",
      "hiw_1_d": "मानचित्र पर स्थान पिन करें और समस्या का वर्णन करें। सबूत के लिए एक फोटो अपलोड करें।",
      "hiw_2_t": "2. हम कार्य सौंपते हैं",
      "hiw_2_d": "आपकी रिपोर्ट स्वचालित रूप से संबंधित विभाग अधिकारी को भेज दी जाती है।",
      "hiw_3_t": "3. ट्रैक करें",
      "hiw_3_d": "वास्तविक समय में स्थिति को ट्रैक करें और एक बार ठीक होने पर समाधान को रेट करें।"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", 
  interpolation: { escapeValue: false }
});

export default i18n;