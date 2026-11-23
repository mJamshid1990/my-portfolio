# Dasturchi Portfolio, Blog va Admin Boshqaruv Tizimi — Arxitektura Rejasi

Zamonaviy AI vositalari va veb-texnologiyalar yordamida saytlar yaratuvchi dasturchi uchun **O'zbek va Ingliz tillarida (UZ / EN)** ishlovchi, **tizimli ochiq editorial dizayn**ga ega tezkor portfolio, Markdown blog va alohida Admin boshqaruv panelidan iborat to'liq veb-tizim rejasi.

---

### Tasdiqlangan Qarorlar va Muhim Eslatmalar

> [!IMPORTANT]
> **Tasdiqlangan talablar (1-bosqich javoblari asosida):**
> - **Vizual uslub:** Tizimli ochiq va toza editorial dizayn (yuqori kontrastli oq/och kulrang fon, aniq tipografik ierarxiya, ortiqcha bezaklarsiz).
> - **Tillar:** O'zbek va Ingliz tillarida to'liq ikki tilli (UZ / EN) interfeys, loyihalar va blog maqolalari.
> - **Arxitektura yo'nalishi:** Python FastAPI va PostgreSQL standartlariga 100% mos REST API hamda ma'lumotlar bazasi sxemasi.
> - **Admin panel imkoniyatlari:** Loyihalarni boshqarish (CRUD), jonli ko'rishga ega Markdown blog muharriri va bog'lanish xabarlarini boshqarish.

> [!NOTE]
> **Ishga tushirish muhiti (AI Studio Live Preview vs. VS Code FastAPI):**
> AI Studio Build muhitida jonli ko'rish (Live Preview) serveri Node.js (Express) va Cloud SQL PostgreSQL bazasi orqali 3000-portda ishlaydi. Shu sababli, tasdiqlashdan so'ng **jonli ishlaydigan to'liq ilova** aynan shu muhitda **React + PostgreSQL (REST API)** ko'rinishida ishga tushiriladi, biroq barcha endpointlar, JSON shartnomalari va PostgreSQL jadvallari **Python FastAPI** bilan 1:1 mos qilib loyihalanadi. Kodlash bosqichida VS Code va PowerShell orqali Python FastAPI backendini alohida papkalarda yig'ish bo'yicha bosqichma-bosqich izohlar ham taqdim etiladi.

---

## 1. Umumiy Tushuncha va Maqsad

- **Tizim vazifasi:** Dasturchining shaxsiy brendini namoyish etuvchi, AI va zamonaviy veb-texnologiyalar asosida yaratilgan loyihalarini taqdim qiluvchi, texnik blog yuritishga mo'ljallangan va mijozlardan kelgan murojaatlarni qabul qiluvchi yagona platforma.
- **Maqsadli auditoriya:** Potensial mijozlar, HR mutaxassislari, texnik jamoalar (portfolio va bog'lanish uchun) hamda dasturchining o'zi (Admin panel orqali kontentni boshqarish uchun).
- **Asosiy qiymat:** Mehmonlar uchun tezkor, tushunarli va ishonchli taassurot; muallif uchun esa kodga tegmasdan loyiha va Markdown maqolalarni ikki tilda boshqarish qulayligi.

---

## 2. Foydalanuvchi Tajribasi (UX) va Vizual Dizayn Tizimi

### Asosiy Foydalanuvchi Oqimlari

1. **Ommaviy Portfolio Oqimi (Mehmon):**
   - **Bosh sahifa (Hero + Metrikalar):** Chap tomonda dasturchining qisqa pozitsiyasi ("AI-yordamida tezkor veb-yechimlar"), asosiy chaqiruv tugmasi ("Loyihalarni ko'rish"), o'ng tomonda tizimli vizual portret/ish maydoni; pastda to'liq kenglikdagi asosiy ko'rsatkichlar qatori.
   - **Loyihalar vitrinasi (Bento Grid + Filtrlash):** Kategoriya bo'yicha filtrlash (`Barchasi`, `Web ilovalar`, `AI integratsiya`, `UI/UX`), kartochka bosilganda to'liq tafsilot modali/sahifasi (muammo, yechim, texnologiyalar, jonli havola va GitHub).
   - **Markdown Blog:** Maqolalar ro'yxati, kategoriya va qidiruv filtri, maqola ichida qulay o'qish rejimi (kod bloklari, sarlavhalar, o'qish vaqti) va `UZ / EN` tilini bir zumda almashtirish.
   - **Bog'lanish bo'limi:** To'g'ridan-to'g'ri kontakt ma'lumotlari (email, Telegram, GitHub, LinkedIn) va validatsiyali murojaat formasi (yuborilganda bazaga saqlanadi va tasdiq xabari chiqadi).

2. **Admin Boshqaruv Paneli Oqimi (Dasturchi):**
   - **Kirish va himoya:** Google/Firebase autentifikatsiyasi orqali faqat ruxsat etilgan admin foydalanuvchiga kirish huquqi beriladi.
   - **Yon menyuli boshqaruv maydoni:** 3 ta asosiy bo'lim — **Loyihalar**, **Blog Maqolalari**, **Kelgan Xabarlar**.
   - **Loyiha boshqaruvi:** Yangi loyiha qo'shish, tahrirlash, ko'rinish holatini (`Nashr etilgan` / `Qoralama`) o'zgartirish va o'chirish.
   - **Markdown Blog Muharriri:** Chap tomonda Markdown matn kiritish (UZ va EN maydonlari, slug, kategoriya), o'ng tomonda **jonli Markdown ko'rinishi (Live Preview)**.
   - **Xabarlar qutisi:** Mijozlardan kelgan murojaatlarni o'qish, `O'qilgan` / `Yangi` deb belgilash va o'chirish.

### Vizual Identitet va Mavzu

- **Estetik yo'nalish:** Tizimli ochiq editorial dizayn (Minimalist Editorial & Developer Monograph). Hech qanday neon effektlar, soxta tizim statuslari yoki kapsula-pill teglar ishlatilmaydi — barcha meta-ma'lumotlar (`React · FastAPI · 2026`) toza matn va `·` ajratuvchilar bilan beriladi.
- **Rang palitrasi (60-30-10 qoidasi):**
  - **60% Asosiy fon (`--background`):** Sof och kulrang/oq (`#FAFAFA` / `#FFFFFF`).
  - **30% Strukturaviy yuzalar (`--surface` / `--border`):** Oq kartochkalar (`#FFFFFF`), nozik 1px chegaralar (`#E4E4E7`), o'qilishi yuqori to'q matn (`#09090B`) va ikkilamchi matn (`#52525B`).
  - **10% Aksent rang (`--accent`):** Elektriklashgan kobalt ko'k (`#2563EB`) — faqat asosiy tugmalar, faol menyular va fokus holatlari uchun.
- **Tipografiya (2+1 shrift qoidasi):**
  - **Sarlavhalar:** `Plus Jakarta Sans` (aniq, geometrik, `tracking-tight`, `text-wrap: balance`).
  - **Editorial urg'ular / Maqola sarlavhalari:** `Fraunces` (gazeta/monografiya ohangi uchun).
  - **Asosiy matn:** `DM Sans` (15px–16px, 1.6 qator oralig'i).
  - **Kod va raqamlar:** `JetBrains Mono` (`tabular-nums` jadvallar va sanalar uchun).
- **Yuqori navigatsiya (3-zonali qat'iy tuzilma):** Chapda brend nomi, markazda 4 ta havola (`Loyihalar`, `Blog`, `Haqida`, `Bog'lanish`), o'ngda yagona asosiy harakat (`UZ / EN` almashtirgich va Admin havolasi footer yoki boshqaruv nuqtasida).
- **Responsivlik va Tezkorlik:** Mobil (390px) va Desktop (1440px) ekranlarga to'liq moslashuv, 100–200ms mikro-animatsiyalar (`transform` va `opacity` orqali), ma'lumot yuklanishida skelet holatlari.

---

## 3. Asosiy Mahsulot Qarorlari va Muqobillar

- **Qaror 1: Ikki tillilikni (UZ / EN) ma'lumotlar bazasi darajasida saqlash**
  - *Tanlangan yondashuv:* Loyiha va maqolalarning sarlavha, qisqa tavsif va asosiy matni bazada ham O'zbek, ham Ingliz tillari uchun alohida ustunlarda saqlanadi (`title_uz`, `title_en`, `content_uz`, `content_en`). UI matnlari esa markazlashtirilgan lug'at orqali boshqariladi.
  - *Nima uchun:* Tashrif buyuruvchi tilni almashtirganda nafaqat tugmalar, balki loyihalar va blog maqolalari ham darhol tanlangan tilda chiqadi.
  - *Muqobil variant:* Avtomatik tarjima API ishlatish — lekin texnik atamalar va muallif ohangi buzilishi mumkinligi sababli rad etildi.

- **Qaror 2: FastAPI bilan 100% mos REST API shartnomasi**
  - *Tanlangan yondashuv:* Barcha backend marshrutlari (`/api/v1/projects`, `/api/v1/posts`, `/api/v1/messages`, `/api/v1/admin/...`) qat'iy JSON sxema va HTTP status kodlari (`200`, `201`, `401`, `404`, `422`) asosida quriladi.
  - *Nima uchun:* AI Studio muhitida ilova Express + PostgreSQL bilan jonli ishlaydi, shu bilan birga foydalanuvchi o'z VS Code muhitida FastAPI (Pydantic + SQLAlchemy) backendini xuddi shu API shartnomasiga ulab ishlata oladi.

- **Qaror 3: Admin paneli uchun ajratilgan autentifikatsiya va himoya**
  - *Tanlangan yondashuv:* Ommaviy `GET` so'rovlari ochiq (faqat nashr etilgan yozuvlar), barcha `POST / PUT / PATCH / DELETE` va admin `GET` so'rovlari esa Bearer token tekshiruvi bilan himoyalanadi.
  - *Nima uchun:* Mehmonlar qoralama maqolalarni yoki begonalarning bog'lanish xabarlarini ko'ra olmasligi shart.

---

## 4. Texnik Arxitektura va Ma'lumotlar Strategiyasi

### Tizim Arxitekturasi Diagrammasi

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Responsive UI)                      │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐  │
│  │    Ommaviy Qism (Public)      │  │     Admin Boshqaruv Paneli     │  │
│  │  • Til tanlovi (UZ / EN)      │  │  • Autentifikatsiya darvozasi  │  │
│  │  • Hero & Haqimda bo'limi     │  │  • Loyihalar CRUD jadvali      │  │
│  │  • Loyihalar vitrinasi + Modal│  │  • Markdown Blog muharriri     │  │
│  │  • Markdown Blog o'quvchisi   │  │    (Jonli ko'rish / Preview)   │  │
│  │  • Bog'lanish formasi         │  │  • Xabarlar qutisi (Inbox)     │  │
│  └──────────────┬────────────────┘  └───────────────┬────────────────┘  │
└─────────────────┼───────────────────────────────────┼───────────────────┘
                  │ JSON / REST API                   │ Bearer Token + JSON
                  ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             REST API QATLAMI (FastAPI / Express Parity)                 │
│  • Ommaviy: GET /api/projects, GET /api/posts, POST /api/messages       │
│  • Admin:   CRUD /api/admin/projects, /api/admin/posts, /api/messages   │
│  • Validatsiya, xatolik boshqaruvi va Auth Middleware                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ SQL Pool (Drizzle / SQLAlchemy)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL MA'LUMOTLAR BAZASI                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │    users     │  │   projects   │  │  blog_posts  │  │  messages   │  │
│  │ id, uid,     │  │ id, slug,    │  │ id, slug,    │  │ id, name,   │  │
│  │ email, role  │  │ title_uz/en, │  │ title_uz/en, │  │ email,      │  │
│  │              │  │ summary,     │  │ body_md_uz/en│  │ subject,    │  │
│  │              │  │ tech_stack,  │  │ category,    │  │ message,    │  │
│  │              │  │ published    │  │ read_minutes │  │ is_read     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Ma'lumotlar Modeli (PostgreSQL Jadvallari)

- **`users`**: Admin foydalanuvchi hisobini (`id`, `uid`, `email`, `role`, `created_at`) bog'lash uchun.
- **`projects`**: Portfolio loyihalari (`id`, `slug`, `title_uz`, `title_en`, `summary_uz`, `summary_en`, `details_uz`, `details_en`, `category`, `tech_stack`, `image_url`, `live_url`, `repo_url`, `featured`, `published`, `created_at`).
- **`blog_posts`**: Ikki tilli Markdown maqolalar (`id`, `slug`, `title_uz`, `title_en`, `excerpt_uz`, `excerpt_en`, `content_uz`, `content_en`, `category`, `read_time_min`, `cover_url`, `published`, `published_at`).
- **`messages`**: Bog'lanish formasi orqali kelgan murojaatlar (`id`, `sender_name`, `sender_email`, `subject`, `body`, `is_read`, `created_at`).

### Interaktiv Komponent va Holatlar Xaritasi

- **Til almashtirgich (`UZ / EN`):** Global kontekst holatini yangilaydi; barcha UI yorliqlari, joriy loyihalar va blog maqolalari sahifani qayta yuklamasdan tanlangan tilda ko'rinadi.
- **Loyihalar filtri va tafsilot modali:** Kategoriya tugmasi bosilganda ro'yxat mijoz tomonida tezkor filtrlanadi; loyiha kartochkasi bosilganda `ESC` va `✕` tugmalari bilan yopiluvchi to'liq tafsilot oynasi ochiladi.
- **Markdown Blog ko'rinishi:** Maqola tanlanganda Markdown matni xavfsiz HTML ga aylantirilib, kod bloklari va tipografik ritm bilan ko'rsatiladi; bo'sh yoki topilmagan holatlar uchun aniq xabar chiqadi.
- **Bog'lanish formasi:** Maydonlar (ism, email, mavzu, xabar) yuborishdan oldin tekshiriladi; yuborish vaqtida tugma yuklanish holatiga o'tadi, muvaffaqiyatli saqlanganda esa forma tozalanib tasdiq bildiradi.
- **Admin CRUD va Jonli Muharrir:** Admin panelda loyiha yoki maqola yaratish/tahrirlash formasi to'ldirilganda API ga so'rov ketadi, ro'yxat va ommaviy vitrina holati darhol yangilanadi; xabarlarda `O'qilgan deb belgilash` tugmasi bazadagi holatni yangilab, o'qilmagan xabarlar sonini kamaytiradi.
