# NestJS + TypeScript Clean Architecture Foundation

یک پروژه پایه و Production-ready بر اساس اصول **معماری پیاز / تمیز (Clean Architecture / Hexagonal Architecture)** با فریمورک **NestJS** و **TypeScript**.

---

## 🎯 اهداف و فلسفه معماری

هدف این معماری، **جداسازی کامل دغدغه‌ها (Separation of Concerns)** و **استقلال لایه‌ها (Layer Independence)** است:

1. **قانون وابستگی (The Dependency Rule):** وابستگی‌ها همیشه رو به داخل (از لایه‌های خارجی به لایه‌های داخلی) است:
   $$\text{Presentation} \rightarrow \text{Application} \rightarrow \text{Domain}$$
   $$\text{Infrastructure} \rightarrow \text{Domain / Application}$$
2. **استقلال لایه Domain:** لایه دامنه به هیچ فریمورک خارجی (مانند NestJS، TypeORM، Prisma، Express یا کتابخانه‌های دیتابیس) وابسته نیست و کاملاً با Pure TypeScript پیاده‌سازی شده است.
3. **استقلال لایه Application:** منطق Use Caseها کدهای خالص تایپ‌اسکریپت هستند و نیاز به دکوراتورهای NestJS ندارند. این امر نوشتن Unit Testها را بدون نیاز به بالا آوردن Nest Test Module فوق‌العاده سریع و ساده می‌کند.
4. **وارونگی وابستگی (Dependency Inversion Principle):** رابط مخزن داده (`IUserRepository`) در لایه دامنه تعریف می‌شود و پیاده‌سازی عینی آن (`InMemoryUserRepository` یا بعداً `TypeOrmUserRepository`) در لایه زیرساخت (Infrastructure) قرار می‌گیرد.
5. **جداسازی خطاهای Domain از HTTP:** خطاهای تجاری (Domain Exceptions) بدون آگاهی از کدهای وضعیت HTTP پرتاب می‌شوند. یک Global Exception Filter در لایه Presentation این خطاها را به استاتوس کدهای استاندارد HTTP (مثل `409 Conflict`، `404 Not Found`، `400 Bad Request`) تبدیل می‌کند.

---

## 📂 ساختار پوشه‌ها و لایه‌ها

```
backend/
├── src/
│   ├── domain/                         # لایه اول: قلب بیزینس (Enterprise Business Rules)
│   │   ├── entities/                   # Entityهای بیزینس (User Entity)
│   │   ├── value-objects/              # Value Objectهای بیزینس (Email VO)
│   │   ├── repositories/               # اینترفیس‌های مخازن داده (IUserRepository)
│   │   └── exceptions/                 # خطاهای دامنه (DomainException, UserAlreadyExistsException, ...)
│   │
│   ├── application/                    # لایه دوم: منطق برنامه و سناریوها (Application Business Rules)
│   │   ├── use-cases/                  # سناریوهای کاربردی (CreateUserUseCase, GetUserByIdUseCase)
│   │   └── dto/                        # دیتا ترانسفر آبجکت‌های داخلی و مپرها (Command, UserOutputDto)
│   │
│   ├── infrastructure/                 # لایه سوم: جزییات خارجی و ارتباط با دنیای بیرون
│   │   ├── database/                   # پیاده‌سازی‌های دیتابیس (In-Memory، TypeORM، Prisma، ...)
│   │   │   ├── in-memory/              # مخزن حافظه‌ای پیش‌فرض جهت تست و اجرای آنی
│   │   │   └── README.md               # راهنمای افزودن ORM (TypeORM / Prisma)
│   │   └── config/                     # تنظیمات محیطی و ConfigModule
│   │
│   ├── presentation/                   # لایه چهارم: رابط کاربری / HTTP API
│   │   ├── controllers/                # کنترلرهای HTTP با سواگر (UserController)
│   │   ├── dto/                        # ریکوئست و ریسپانس DTOها با class-validator و Swagger
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── filters/                    # مپ خطاهای دامنه به کدهای HTTP (DomainExceptionFilter)
│   │
│   ├── shared/                         # کدهای مشترک بین لایه‌ها
│   │   └── constants/                  # توکن‌های تزریق وابستگی (USER_REPOSITORY_TOKEN)
│   │
│   ├── users.module.ts                 # ماژول Feature که لایه‌ها را با NestJS DI به هم متصل می‌کند
│   ├── app.module.ts                   # ماژول ریشه برنامه
│   └── main.ts                         # نقطه شروع برنامه (اعتبارسنجی سراسری، فیلترها، Swagger)
│
├── test/
│   ├── unit/                           # تست‌های واحد سریع Use Caseها بدون فریمورک
│   └── app.e2e-spec.ts                 # تست‌های سراسری End-to-End
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔄 جریان کار و ارتباط لایه‌ها (Flow of Control & Dependency Injection)

### ۱. تعریف قرارداد در Domain:
```typescript
// src/domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### ۲. پیاده‌سازی در Infrastructure:
```typescript
// src/infrastructure/database/in-memory/in-memory-user.repository.ts
export class InMemoryUserRepository implements IUserRepository {
  // پیاده‌سازی کامل عملیات ذخیره و بازیابی...
}
```

### ۳. مصرف در Application Use Case:
```typescript
// src/application/use-cases/user/create-user.use-case.ts
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<UserOutputDto> {
    // 1. بررسی یکتایی ایمیل در بیزینس
    // 2. ساخت Domain Entity
    // 3. ذخیره در Repository
    // 4. بازگرداندن خروجی استاندارد
  }
}
```

### ۴. تزریق وابستگی در NestJS بدون آلوده‌کردن Application:
```typescript
// src/users.module.ts
@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: InMemoryUserRepository, // بعداً به‌سادگی با TypeOrmUserRepository یا Prisma جایگزین می‌شود
    },
    {
      provide: CreateUserUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateUserUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserByIdUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
})
export class UsersModule {}
```

---

## 🚀 نحوه نصب و اجرا

### ۱. نصب وابستگی‌ها:
```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی:
فایل `.env.example` را به `.env` کپی کنید:
```bash
PORT=3001
NODE_ENV=development
API_PREFIX=api/v1
```

### ۳. اجرای برنامه در حالت توسعه:
```bash
npm run start:dev
```

### ۴. بیلد گرفتن برای پروداکشن:
```bash
npm run build
npm run start:prod
```

### ۵. مستندات تعاملی Swagger:
پس از اجرا، به آدرس زیر در مرورگر مراجعه کنید:
```
http://localhost:3001/api/docs
```

---

## 🧪 اجرای تست‌ها

- **تست‌های واحد (Unit Tests):**
  ```bash
  npm run test
  ```
  تست‌های لایه `application/use-cases` به صورت Pure با Vitest در کمتر از ۲۰۰ میلی‌ثانیه بدون نیاز به بالا آوردن وب سرور یا دیتابیس اجرا می‌شوند.

- **تست‌های کامل (End-to-End Tests):**
  ```bash
  npm run test:e2e
  ```
  تست‌های کنترلر، اعتبارسنجی ورودی‌ها، استاتوس کدهای HTTP و فیلترهای استثنا را پوشش می‌دهند.

---

## 🔌 نحوه افزودن فیچرهای جدید و اتصال دیتابیس واقعی (ORM)

1. **اضافه کردن فیچر جدید:**
   - موجودیت و قوانین را در `domain/<feature>` ایجاد کنید.
   - سناریوهای کاربردی را در `application/use-cases/<feature>` بسازید.
   - آداپتورهای ذخیره‌سازی را در `infrastructure` اضافه کنید.
   - کنترلر، DTOهای اعتبارسنجی و سواگر را در `presentation` بسازید.
   - با یک NestJS Module قطعات را به یکدیگر سیم‌کشی (Wire) کنید.

2. **اتصال دیتابیس (TypeORM / Prisma):**
   - راهنمای گام‌به‌گام در مسیر [src/infrastructure/database/README.md](src/infrastructure/database/README.md) قرار داده شده است.
   - بدون نیاز به تغییر حتی یک خط از لایه‌های Domain یا Application یا Presentation، تنها کافیست یک کلاس جدید آداپتور مخزن بسازید و توکن `USER_REPOSITORY_TOKEN` را به آن متصل کنید.
