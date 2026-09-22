# krushiratna 🍇🌱

> **कृषिरत्न (Krushiratna) — द्राक्ष बागायतदारांसाठी सर्वसमावेशक व्यवस्थापन व शेती डॅशबोर्ड SaaS प्रणाली**  
> *A comprehensive, luxury Light Cream themed Grape Orchard & Vineyard Management SaaS platform with bilingual (Marathi & English) support and Supabase cloud backend integration.*

---

## 🌟 वैशिष्ट्ये (Key Features)

### 🌿 मुख्य 11 व्यवस्थापन विभाग (11 Dedicated Tabs)
1. **डॅशबोर्ड (Dashboard)**: एकूण क्षेत्र (10.5 एकर), बाग/प्लॉट संख्या, आजची कामे, खर्च व उत्पन्न (P&L), आणि पाण्याचा वापर थेट ट्रॅकिंग.
2. **🍇 द्राक्ष बाग व्यवस्थापन (Grape Orchard Management)**: प्लॉटनुसार वाण (Super Sonaka, Manik Chaman, Thompson), लागवड अंतर (10×6 ft), छाटणी तारखा (खरड व फळ छाटणी), घड/काडी व्यवस्थापन, आणि अपेक्षित उत्पादन.
3. **💧 पाणी व्यवस्थापन (Water & Irrigation)**: दैनिक सिंचन नोंदी, लिटर गणना, EC व pH सुरक्षित मर्यादा मॉनिटरिंग, आणि पाण्यातून मिळणारे अन्नद्रव्ये (N, Ca, Mg).
4. **🧪 खत व्यवस्थापन (Fertilizer & Fertigation)**: खतांची मात्रा, फर्टिगेशन रेकॉर्ड, आणि थेट N-P-K मूलद्रव्य कॅल्क्युलेटर.
5. **🐛 कीड व रोग व्यवस्थापन (Pest & Disease Control)**: Flea beetle (उदबत्या), Thrips (थ्रीप्स), Downy (केवडा), Powdery (भुरी) निरीक्षण, फवारणी नोंदी, औषध मात्रा, आणि पुढील फवारणी वेळापत्रक.
6. **👷 मजूर व्यवस्थापन (Labor Management)**: कामगार हजेरी, रोजंदारी दर (₹400/दिवस), काम वाटप (छाटणी, विरळणी, डिपिंग), आणि एकूण मजुरी खर्च गणना.
7. **💰 खर्च व उत्पन्न (Financials & P&L)**: खते, औषधे, मजुरी, वीज, वाहतूक इ. 6 खर्च विभाग आणि द्राक्ष विक्री नोंदी व निव्वळ नफा.
8. **📊 अहवाल व विश्लेषण (Reports & Analytics)**: प्रति एकर खर्च, प्रति किलो उत्पादन खर्च, प्लॉट उत्पादन तुलना, आणि हंगाम तुलना (खरड vs फळ छाटणी).
9. **🔔 स्मरणपत्रे (Reminders & Alerts)**: फवारणी, खत, सिंचन, छाटणी व पेमेंट ॲलर्ट्ससह 1-क्लिक पूर्ण/प्रलंबित टॉगल.
10. **📈 थेट द्राक्ष बाजारभाव (Live Mandi & APMC Rates)**: नाशिक (पिंपळगाव), सांगली (तासगाव), सोलापूर, पुणे व मुंबई वाशी APMC मार्केटमधील थेट द्राक्ष लिलाव भाव, आवक, कल व व्हॉट्सॲप शेअरिंग.
11. **🏛️ शासकीय योजना व सबसिडी (Government Schemes & Subsidies)**: MahaDBT ठिबक सिंचन (80% अनुदान), NHB पॅकहऊस/कोल्ड स्टोरेज (₹25 लाख पर्यंत), फळपीक विमा, आणि कुसुम सौर कृषी पंप माहिती व थेट सबसिडी कॅल्क्युलेटर.

---

## 🎨 डिझाइन व तंत्रज्ञान (Design & Tech Stack)
* **UI/UX**: Luxury Light Cream Theme (`#FAF8F5`, `#F4EFE6`, `#FFFFFF`) with rich emerald green accents and Outfit typography.
* **Layout**: Fixed Left Vertical Sidebar Navigation on Desktop + Touch-Smooth Off-Canvas Slide Drawer on Mobile.
* **Bilingual Engine**: Instant real-time language toggle (`🇮🇳 मराठी` / `🇬🇧 English`) with localStorage persistence.
* **Database**: Supabase PostgreSQL Cloud Backend (`plots`, `irrigation_logs`, `fertilizer_logs`, `spray_logs`, `labour_logs`, `reminders`) with graceful offline fallback.
* **Mobile Responsive**: Ergonomic 2-column KPI grid, bottom-sheet mobile modals, swipeable tables, and touch-target controls.

---

## 🚀 प्रकल्प कसा चालवावा (How to Run Locally)

```bash
# 1. Clone repository
git clone https://github.com/B00mer10/krushiratna.git
cd krushiratna

# 2. Start local server
python -m http.server 8000
```
Open your browser at: **[http://localhost:8000](http://localhost:8000)**

### 🔑 लॉगिन क्रेडेंशियल्स (Login Credentials)
* **👨‍🌾 शेतकरी (Farmer Portal)**:  
  * Username: `farmer`  
  * Password: `farmer123`
* **🛡️ ॲडमिन (Admin Console)**:  
  * Username: `admin`  
  * Password: `admin123`

---

## 📄 परवाना (License)
MIT License. Created for Maharashtra Grape Growers and Modern Vineyard Management.
