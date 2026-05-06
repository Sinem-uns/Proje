# HEALTH AI – Co-Creation & Innovation Platform

Mühendisler ve sağlık profesyonelleri arasında güven temelli, GDPR uyumlu partner discovery platformu.

## 📄 Dökümanlar

| Döküman | Konum |
|---------|-------|
| Software Requirements Specification (SRS) | `docs/SRS.md` / `SENG-384_SRS.docx` |
| Software Design Document (SDD) | `docs/SDD.md` / `SENG-384_SDD.docx` |
| User Guide | `docs/UserGuide.docx` |

## 🚀 Docker ile Çalıştırma (Önerilen)

```bash
docker-compose down -v        # varsa eski container + volume'ları temizle
docker-compose up --build -d  # yeniden build et ve başlat
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000  

> İlk başlatmada otomatik migration + seed çalışır.

## 📧 Mail Konfigürasyonu

`backend/.env` dosyasında SMTP ayarlarını yapın. Üç seçenek mevcuttur:

**Seçenek A – Gmail (App Password):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password   # Google → Security → 2FA → App Passwords
```

**Seçenek B – Resend (ücretsiz, 100/gün):**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_api_key
```

**Development bypass (mail göndermeden test):**
```env
EMAIL_VERIFICATION_BYPASS=true
```
> ⚠️ Production'da asla `true` yapmayın.

## 🔑 Test Kullanıcıları (hepsi: `password123`)

| Email | Rol |
|-------|-----|
| `julia.admin@harvard.edu` | **ADMIN** |
| `alice.smith@mit.edu` | Engineer |
| `carlos.gomez@stanford.edu` | Engineer |
| `marie.dubois@parisdescartes.edu` | Healthcare Professional |
| `ahmed.khan@kcl.edu` | Healthcare Professional |

## Stack

- Frontend: React 18 + TypeScript + TailwindCSS + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL 16
- ORM: Prisma 5
- Auth: JWT + bcrypt
- Mail: Nodemailer (SMTP / Ethereal fallback)

## Yapı

```
384/
├── backend/
│   ├── src/modules/
│   │   ├── auth/           # Kayıt, giriş, email doğrulama
│   │   ├── posts/          # Post CRUD + durum yönetimi
│   │   ├── meetings/       # Toplantı istekleri (incoming/sent/respond)
│   │   ├── notifications/  # Bildirimler
│   │   ├── users/          # Profil görüntüleme + düzenleme + GDPR
│   │   ├── admin/          # Kullanıcı/post yönetimi + istatistikler
│   │   └── logs/           # Aktivite logları (admin)
│   └── prisma/schema.prisma
├── frontend/src/pages/
│   ├── DashboardPage.tsx   # Post + incoming/sent meeting yönetimi
│   ├── ProfilePage.tsx     # Profil düzenleme + GDPR
│   ├── AdminPanelPage.tsx  # Admin paneli (sadece ADMIN rolü görür)
│   └── ...
├── docs/
│   ├── SRS.md
│   ├── SDD.md
│   └── UserGuide.docx
└── docker-compose.yml
```

## API Özeti

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | /auth/register | — | Kayıt (.edu zorunlu) |
| POST | /auth/login | — | Giriş |
| POST | /auth/verify | — | Email doğrulama |
| POST | /auth/resend-verification | — | Doğrulama emaili yeniden gönder |
| GET | /posts | — | Post listesi/filtrele |
| POST | /posts | ✓ | Post oluştur |
| PUT | /posts/:id | ✓ | Post düzenle |
| PATCH | /posts/:id/status | ✓ | Durum güncelle |
| DELETE | /posts/:id | ✓ | Post sil |
| POST | /meetings/posts/:id | ✓ | Toplantı iste (NDA zorunlu) |
| GET | /meetings/incoming | ✓ | Gelen istekler |
| GET | /meetings/sent | ✓ | Gönderilen istekler |
| PATCH | /meetings/:id/respond | ✓ | Kabul/red/yeni zaman |
| GET | /profile | ✓ | Profil görüntüle |
| PUT | /profile | ✓ | Profil düzenle |
| GET | /profile/export | ✓ | GDPR veri export (JSON) |
| DELETE | /profile | ✓ | Hesap sil (GDPR) |
| GET | /notifications | ✓ | Bildirimler |
| PATCH | /notifications/:id/read | ✓ | Bildirim okundu işaretle |
| GET | /admin/users | ADMIN | Kullanıcı listesi |
| PATCH | /admin/users/:id/suspend | ADMIN | Kullanıcı askıya al |
| PATCH | /admin/users/:id/activate | ADMIN | Kullanıcı aktifleştir |
| GET | /admin/posts | ADMIN | Tüm postlar |
| DELETE | /admin/posts/:id | ADMIN | Post sil |
| GET | /admin/platform-stats | ADMIN | Platform istatistikleri |
| GET | /logs | ADMIN | Aktivite logları (filtreli) |
| GET | /logs/export | ADMIN | CSV export |
