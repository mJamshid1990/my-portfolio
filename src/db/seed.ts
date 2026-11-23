import * as dotenv from 'dotenv';
import { createPool, db } from './index.ts';
import { blogPosts, projects } from './schema.ts';

dotenv.config();

const initialProjects = [
  {
    slug: 'ai-project-generator',
    titleUz: 'AI Yordamida Veb-Loyiha Generator Platformasi',
    titleEn: 'AI-Assisted Web Project Architecture Generator',
    summaryUz:
      'Mijoz talabidan tayyor React va FastAPI arxitekturasigacha avtomatlashtirilgan tizim.',
    summaryEn:
      'Automated system transforming client briefs into production-ready React and FastAPI architectures.',
    detailsUz:
      'Ushbu platforma dasturchilar uchun loyiha strukturasini, PostgreSQL sxemalarini va REST API endpointlarini bir necha soniyada loyihalashtirishga yordam beradi.\n\nAsosiy imkoniyatlar: modulli kod generatsiyasi, tilga mos interfeys va toza ma’lumotlar modeli.',
    detailsEn:
      'This platform helps developers design project structures, PostgreSQL schemas, and REST API endpoints in seconds.\n\nCore capabilities include modular code generation, bilingual UI templates, and strict relational data modeling.',
    category: 'AI Systems',
    techStack: 'React · TypeScript · FastAPI · PostgreSQL',
    imageUrl: '/src/assets/images/project_api_architecture_1795451002577.jpg',
    liveUrl: 'https://example.com/ai-generator',
    repoUrl: 'https://github.com/jamshid-dev/ai-project-generator',
    featured: true,
    published: true,
  },
  {
    slug: 'fastapi-postgres-starter',
    titleUz: 'FastAPI va PostgreSQL Tezkor Backend Shabloni',
    titleEn: 'FastAPI & PostgreSQL Production Backend Starter',
    summaryUz:
      'JWT autentifikatsiya, migratsiya va ochiq Swagger hujjatlariga ega REST API.',
    summaryEn:
      'REST API boilerplate with JWT authentication, database migrations, and OpenAPI documentation.',
    detailsUz:
      'Kichik va o‘rta biznes ilovalari uchun yozilgan tayyor backend yechimi. So‘rovlar validatsiyasi, xavfsiz parol xeshlash va rolga asoslangan kirish nazoratini o‘z ichiga oladi.',
    detailsEn:
      'A ready-to-deploy backend architecture for modern web applications featuring request validation, secure hashing, and role-based access control.',
    category: 'Backend & API',
    techStack: 'Python · FastAPI · PostgreSQL · Docker',
    imageUrl: '/src/assets/images/project_api_architecture_1795451002577.jpg',
    liveUrl: 'https://example.com/fastapi-starter',
    repoUrl: 'https://github.com/jamshid-dev/fastapi-postgres-starter',
    featured: false,
    published: true,
  },
  {
    slug: 'editorial-markdown-cms',
    titleUz: 'Ikki Tilli Editorial Portfolio va Markdown CMS',
    titleEn: 'Bilingual Editorial Portfolio & Markdown CMS',
    summaryUz:
      'O‘zbek va Ingliz tillarida ishlaydigan, jonli Markdown muharririga ega shaxsiy nashriyot tizimi.',
    summaryEn:
      'Bilingual publishing workspace with a split-pane live Markdown editor and clean reader experience.',
    detailsUz:
      'Dasturchi va texnik yozuvchilar uchun yaratilgan minimalist tizim. Har bir maqola ikki tilda saqlanadi, o‘qish vaqti avtomatik hisoblanadi va ma’lumotlar PostgreSQL bazasida saqlanadi.',
    detailsEn:
      'A minimalist publishing system built for engineers and technical writers. Every article supports dual languages, automatic read-time calculation, and relational persistence.',
    category: 'Web App',
    techStack: 'React · Tailwind CSS · Express · PostgreSQL',
    imageUrl: '/src/assets/images/project_editorial_cms_1795451003516.jpg',
    liveUrl: 'https://example.com/editorial-cms',
    repoUrl: 'https://github.com/jamshid-dev/editorial-markdown-cms',
    featured: false,
    published: true,
  },
];

const initialPosts = [
  {
    slug: 'ai-vositalari-bilan-tezkor-dasturlash',
    titleUz: 'AI vositalari yordamida sifatli veb-saytlar qurish tajribam',
    titleEn: 'Building Clean Web Systems Faster with AI Engineering Tools',
    excerptUz:
      'G‘oyadan tayyor PostgreSQL va React tizimigacha bo‘lgan amaliy ish jarayonim haqida.',
    excerptEn:
      'A practical breakdown of my workflow from initial product brief to React and PostgreSQL deployment.',
    contentUz:
      '# AI bilan tezkor va toza arxitektura\n\nZamonaviy AI vositalari dasturchining o‘rnini bosmaydi, balki uning **fikrlash tezligini** bir necha barobar oshiradi.\n\n## Asosiy tamoyillarim\n\n- Har bir loyihani avval ma’lumotlar bazasi sxemasidan boshlash\n- Komponentlarni kichik va qayta ishlatiladigan qilib ajratish\n- Xavfsizlik va ma’lumot validatsiyasini hech qachon keyinga qoldirmaslik\n\n> Yaxshi kod — bu nafaqat ishlaydigan, balki boshqa dasturchi ham oson tushunadigan koddir.\n\n```python\n@app.get("/api/projects")\nasync def list_projects():\n    return {"status": "ready", "db": "PostgreSQL"}\n```',
    contentEn:
      '# Clean Architecture Accelerated by AI\n\nModern AI tools do not replace software engineers—they multiply **execution clarity** when paired with solid fundamentals.\n\n## My Core Principles\n\n- Start every project with a normalized relational database schema\n- Keep UI components modular, readable, and responsive\n- Validate every input on both client and server boundaries\n\n> Good code is not just code that runs—it is code that remains clear six months later.\n\n```python\n@app.get("/api/projects")\nasync def list_projects():\n    return {"status": "ready", "db": "PostgreSQL"}\n```',
    category: 'AI Engineering',
    coverUrl: '/src/assets/images/blog_ai_workflow_1795451003929.jpg',
    readTimeMin: 2,
    published: true,
  },
  {
    slug: 'fastapi-va-postgresql-arxitekturasi',
    titleUz: 'Nega backend uchun Python FastAPI va PostgreSQL tanladim?',
    titleEn: 'Why I Choose Python FastAPI & PostgreSQL for Web Backends',
    excerptUz:
      'Tezkor REST API yozish, Pydantic validatsiyasi va relyatsion bazaning afzalliklari.',
    excerptEn:
      'Exploring type-safe REST APIs, Pydantic validation, and relational data integrity.',
    contentUz:
      '# FastAPI va PostgreSQL uyg‘unligi\n\nYangi loyihalarimda ko‘pincha **FastAPI** va **PostgreSQL** juftligidan foydalanaman.\n\n## Afzalliklari\n\n- Avtomatik OpenAPI (Swagger) hujjatlari\n- Yuqori tezlik va asinxron so‘rovlarni qo‘llab-quvvatlash\n- PostgreSQL orqali aniq jadvallar va bog‘lanishlar\n\nShuningdek, frontend qismida **React** va **TypeScript** bilan ishlash API shartnomalarini aniq saqlashga yordam beradi.',
    contentEn:
      '# The FastAPI & PostgreSQL Synergy\n\nFor modern web backends, pairing **FastAPI** with **PostgreSQL** provides an ideal balance of developer speed and reliability.\n\n## Key Advantages\n\n- Automatic interactive OpenAPI documentation\n- Async request handling and strict type validation\n- Reliable relational integrity with PostgreSQL\n\nCombined with **React** and **TypeScript** on the frontend, API contracts stay predictable end-to-end.',
    category: 'Backend',
    coverUrl: '/src/assets/images/project_api_architecture_1795451002577.jpg',
    readTimeMin: 2,
    published: true,
  },
  {
    slug: 'zamonaviy-ui-dizayn-qoidalari',
    titleUz: 'Foydalanuvchi uchun qulay va tezkor UI dizayn sirlari',
    titleEn: 'Principles of Fast, Clean & Responsive UI Design',
    excerptUz:
      'Ortiqcha bezaklarsiz, o‘qishga qulay tipografiya va mobil moslashuvchanlik haqida.',
    excerptEn:
      'Focused typography, balanced spacing, and effortless mobile responsiveness without visual clutter.',
    contentUz:
      '# Soddalik — sifat belgisi\n\nFoydalanuvchi saytga kirganda 3 soniya ichida **kimligingizni** va **nima qila olishingizni** tushunishi kerak.\n\n## Muhim nuqtalar\n\n- Aniq shrift ierarxiyasi va yetarli bo‘sh joy (whitespace)\n- Mobil qurilmalarda qulay tugmalar va silliq navigatsiya\n- Rasmlar va matnlar orasidagi kontrastni saqlash',
    contentEn:
      '# Clarity Over Visual Noise\n\nWhen a visitor lands on your portfolio, they should understand **who you are** and **what you build** within three seconds.\n\n## Essential Practices\n\n- Clear typographic hierarchy and generous whitespace\n- Comfortable touch targets and clean mobile navigation\n- High contrast and fast asset loading',
    category: 'UI/UX',
    coverUrl: '/src/assets/images/project_editorial_cms_1795451003516.jpg',
    readTimeMin: 1,
    published: true,
  },
];

async function runSeed() {
  for (const project of initialProjects) {
    await db
      .insert(projects)
      .values(project)
      .onConflictDoNothing({ target: projects.slug });
  }

  for (const post of initialPosts) {
    await db
      .insert(blogPosts)
      .values(post)
      .onConflictDoNothing({ target: blogPosts.slug });
  }

  console.log('Seed completed: initial projects and blog posts are ready.');
  await createPool().end();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
