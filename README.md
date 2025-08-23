# 🛍️ E-Ticaret Projesi

Modern bir e-ticaret sistemi. Backend'de .NET 9 Web API, frontend'de Next.js kullanılarak geliştirilmiştir.

# Proje Görüntüleri 
<br><br>
<img width="1910" height="755" alt="Adsız" src="https://github.com/user-attachments/assets/ed08613d-e4e8-4fe7-a622-c07009581d9b" />

<br><br>
<img width="1152" height="734" alt="Adsız2" src="https://github.com/user-attachments/assets/d46fe998-c5cd-4022-bb9a-a52303a944e3" />
<br><br>
<img width="1881" height="843" alt="Adsız3" src="https://github.com/user-attachments/assets/346c03c9-6b82-4d56-81c3-8c34bcfafbda" />
<br><br>
<img width="1886" height="721" alt="Adsız4" src="https://github.com/user-attachments/assets/4374ad47-a0ba-41de-8774-f1b516787b3a" />

<br><br>

## 🎬 Video Rehber



https://github.com/user-attachments/assets/69695bab-46d3-4320-b799-5847dd312657




<br><br>
<br><br>
## 🚀 Özellikler

- ✅ Kullanıcı kayıt/giriş sistemi (JWT Authentication)
- ✅ Ürün listeleme, ekleme, düzenleme, silme (CRUD)
- ✅ Admin paneli
- ✅ Dosya yükleme sistemi (resim)
- ✅ Kategori bazlı filtreleme
- ✅ Redis caching desteği
- ✅ Responsive tasarım
- ✅ PostgreSQL veritabanı
- ✅ Clean Architecture
- ✅ CQRS Pattern
- ✅ Global Exception Handling
- ✅ Logging (Serilog)




## 📋 Gereksinimler

Projeyi çalıştırmak için aşağıdaki yazılımların yüklü olması gerekir:

### Backend
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL 12+](https://www.postgresql.org/download/)
- [Redis](https://redis.io/download) (Opsiyonel - yoksa InMemory cache kullanılır)

### Frontend
- [Node.js 18+](https://nodejs.org/)
- [npm veya yarn](https://www.npmjs.com/)

## 🔧 Kurulum

### 1. Repository'yi Clone Edin
```bash
git clone <repository-url>
cd Task2
```

### 2. Backend Kurulumu

#### 2.1. Backend Dependencies
```bash
cd backend
dotnet restore
```

#### 2.2. PostgreSQL Veritabanı Hazırlığı
PostgreSQL'i çalıştırın ve yeni bir veritabanı oluşturun:
```sql
-- PostgreSQL'de çalıştırın
CREATE DATABASE ETicaretDB;
```

#### 2.3. Environment Variables (.env)
Backend klasöründe `.env` dosyası oluşturun:
```bash
cd backend
```

`.env` dosyası içeriği:
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=eTicaretDB
DB_USERNAME=" "
DB_PASSWORD= " "
DB_PORT= " "

# JWT Configuration
JWT_SECRET_KEY=YourSuperSecretKeyForJWTTokenGeneration123456789
JWT_ISSUER=ETicaret.API
JWT_AUDIENCE=ETicaret.Client
JWT_EXPIRE_MINUTES=480

# Redis Configuration (Opsiyonel)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_BASE_URL=http://localhost:5074
```

**⚠️ ÖNEMLİ:** `YOUR_POSTGRES_PASSWORD` yerine kendi PostgreSQL şifrenizi yazın.

#### 2.4. Database Migration
```bash
cd ETicaret.API
dotnet ef database update
```

#### 2.5. Backend'i Çalıştır
```bash
dotnet run
```

Backend başarılı şekilde çalışırsa:
- API: http://localhost:5074/api
- Swagger UI: http://localhost:5074/swagger

**Demo Veriler:** Uygulama ilk çalıştığında otomatik olarak örnek ürünler ve admin kullanıcısı oluşturulur:
- Admin Email: `admin@shopmax.com`
- Admin Şifre: `Admin123!`

### 3. Frontend Kurulumu

Yeni bir terminal açın:

#### 3.1. Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3.2. Environment Variables (.env.local)
Frontend klasöründe `.env.local` dosyası oluşturun:
```bash
cd frontend
```

`.env.local` dosyası içeriği:
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5074/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3.3. Frontend'i Çalıştır
```bash
npm run dev
```

Frontend başarılı şekilde çalışırsa:
- Frontend: http://localhost:3000

## 🎯 Kullanım

1. **Ana Sayfa**: http://localhost:3000 - Ürünleri görüntüleyin
2. **Kayıt/Giriş**: http://localhost:3000/auth/login - Hesap oluşturun veya giriş yapın
3. **Admin Paneli**: http://localhost:3000/admin - Admin olarak giriş yapın (admin@shopmax.com / Admin123!)
4. **API Dokümantasyonu**: http://localhost:5074/swagger - API endpoint'lerini inceleyin

## 📁 Proje Yapısı

```
Task2/
├── backend/
│   ├── ETicaret.API/              # Web API Layer
│   │   ├── Controllers/           # API Controllers
│   │   ├── Middleware/           # Custom Middlewares
│   │   ├── wwwroot/images/       # Uploaded Images
│   │   └── Program.cs            # Application Entry Point
│   ├── ETicaret.Application/      # Application Layer
│   │   ├── Features/             # CQRS Commands & Queries
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   ├── Interfaces/           # Repository & Service Interfaces
│   │   └── Behaviors/            # MediatR Behaviors
│   ├── ETicaret.Domain/           # Domain Layer
│   │   ├── Entities/             # Domain Entities
│   │   └── Enums/                # Domain Enums
│   ├── ETicaret.Infrastructure/   # Infrastructure Layer
│   │   ├── Data/                 # Database Context
│   │   ├── Repositories/         # Repository Implementations
│   │   ├── Services/             # Service Implementations
│   │   └── Migrations/           # EF Migrations
│   └── .env                      # Backend Environment Variables
├── frontend/
│   └── src/
│       ├── app/                  # Next.js App Router
│       ├── components/           # React Components
│       ├── lib/                  # Utilities & Configuration
│       ├── services/             # API Services
│       ├── store/                # Redux Store & Slices
│       └── types/                # TypeScript Types
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |

### Products
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products` | Ürünleri listele (filtreleme desteği) |
| GET | `/api/products/all` | Tüm ürünleri listele |
| GET | `/api/products/{id}` | Ürün detayı |
| POST | `/api/products` | Yeni ürün ekle (Admin gerekli) |
| PUT | `/api/products/{id}` | Ürün güncelle (Admin gerekli) |
| DELETE | `/api/products/{id}` | Ürün sil (Admin gerekli) |

### API Request/Response Örnekleri

#### POST /api/auth/login
```json
{
  "email": "admin@shopmax.com",
  "password": "Admin123!"
}
```

#### POST /api/products (Multipart Form)
```
Content-Type: multipart/form-data

Name: "Örnek Ürün"
Description: "Ürün açıklaması"
Price: 99.99
Stock: 10
Category: "Elektronik"
imageFile: [dosya]
```

## 🐛 Sorun Giderme

### Backend Sorunları

#### PostgreSQL Bağlantı Hatası
```
Npgsql.PostgresException: password authentication failed
```
**Çözüm:** `.env` dosyasındaki PostgreSQL bilgileri doğru olduğundan emin olun.

#### JWT Token Hatası
```
System.ArgumentException: IDX10720: Unable to create KeyedHashAlgorithm
```
**Çözüm:** `.env` dosyasında `JWT_SECRET_KEY` değerinin en az 32 karakter olduğundan emin olun.

### Frontend Sorunları

#### API Bağlantı Hatası
```
Failed to fetch
```
**Çözüm:** 
1. Backend'in çalıştığından emin olun
2. `.env.local` dosyasındaki `NEXT_PUBLIC_API_URL` değerini kontrol edin
3. CORS ayarlarını kontrol edin

#### Environment Variable Hatası
```
API_BASE_URL: undefined
```
**Çözüm:** 
1. `.env.local` dosyasını kaydedin
2. Next.js dev server'ı yeniden başlatın (`Ctrl+C` sonra `npm run dev`)

### Redis Sorunları


## 📝 Notlar

- **Dosya Yükleme**: Maksimum 10MB, desteklenen formatlar: .jpg, .jpeg, .png, .webp
- **Database**: PostgreSQL kullanılmaktadır, ilk çalıştırmada migration otomatik yapılır
- **Cache**: Redis yoksa InMemory cache kullanılır
- **Admin Yetkisi**: Sadece admin kullanıcısı ürün silebilir, oluşturabilir ve modifiye edebilir.
- **CORS**: Development için tüm origin'lere izin verilmiştir





