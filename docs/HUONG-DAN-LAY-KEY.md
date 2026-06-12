# Hướng dẫn lấy API keys & cấu hình môi trường

Tài liệu này hướng dẫn lấy từng key cho **Australia Visa Points Calculator**, gán vào `.env.local` (hoặc `.env`), và kiểm tra từng tính năng.

## Chuẩn bị nhanh

```bash
npm install
npm run setup:env    # tạo .env.local + .env, sinh webhook secret local
```

Mở `.env.local` và điền key theo các mục bên dưới. **Không commit** `.env` / `.env.local` lên Git.

**Template đầy đủ (phân theo tính năng + LOCAL / Vercel):** [`.env.example`](../.env.example)

| Nhóm trong `.env.example` | Đặt ở đâu | Tính năng |
|---------------------------|-----------|-----------|
| App | LOCAL + Vercel | Share link, invite, SEO |
| Supabase | LOCAL + Vercel | `/app`, auth, CRM |
| Supabase migrations | **LOCAL only** | `npm run db:migrate` |
| Resend | LOCAL + Vercel | Email report, invite, marketing |
| Crypto billing | LOCAL + Vercel | USDC on Base |
| OpenAI | LOCAL + Vercel | AI explain |
| R2 | LOCAL + Vercel | Logo agency |
| Analytics | LOCAL + Vercel (tùy chọn) | GA4, AdSense |
| Launch / QA scripts | **LOCAL only** | `beta:test-email`, `beta:smoke` |

| Biến | Bắt buộc? | Dùng cho |
|------|------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Có (production) | Link share, email, billing |
| Supabase (3 biến) | Có cho `/app` | Đăng nhập, clients, assessments |
| Resend | Có cho email | Báo cáo assessment, marketing |
| Crypto billing (RPC, treasury, WalletConnect) | Có cho billing | Gói Professional USDC |
| OpenAI | Có cho AI explain | Giải thích breakdown (không tính điểm) |
| GA4 / AdSense | Tùy chọn | Analytics & quảng cáo site public |
| Cloudflare R2 (5 biến) | Có cho upload logo | File agency (logo, tài liệu) |

---

## 1. `NEXT_PUBLIC_SITE_URL`

**Local:**

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production (Vercel):** URL thật, ví dụ `https://your-domain.com.au` (không dấu `/` cuối).

Dùng cho: link share `/share/[token]`, email, Stripe `success_url` / `cancel_url`.

---

## 2. Supabase (Auth + Database)

### Bước lấy key

1. Vào [https://supabase.com](https://supabase.com) → đăng ký / đăng nhập.
2. **New project** → chọn region gần Úc (ví dụ `ap-southeast-2` Sydney) nếu có.
3. Đợi project khởi tạo (~2 phút).
4. Vào **Project Settings** (icon bánh răng) → **API**.
5. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (chỉ server, **không** đưa lên client)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bật đăng nhập email

1. **Authentication** → **Providers** → **Email** → bật.
2. (Tùy chọn) Tắt “Confirm email” khi dev để test nhanh; bật lại khi production.

### Chạy migrations (bắt buộc)

**SQL Editor** → **New query** → dán lần lượt và **Run** từng file:

1. `supabase/migrations/20260101000000_initial_schema.sql`
2. `supabase/migrations/20260201000000_stripe_billing.sql`
3. `supabase/migrations/20260301000000_email.sql`
4. `supabase/migrations/20260401000000_email_marketing.sql`
5. `supabase/migrations/20260501000000_ai.sql`

### File storage — Cloudflare R2 (khuyến nghị)

Logo agency và file upload được đẩy lên **Cloudflare R2** (API tương thích S3), không dùng Supabase Storage.

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **Create bucket** (ví dụ `australia-visa-files`).
2. **Manage R2 API Tokens** → Create token → quyền **Object Read & Write** trên bucket đó.
3. Copy **Account ID**, **Access Key ID**, **Secret Access Key**.

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=australia-visa-files
R2_KEY_PREFIX=org-logos
NEXT_PUBLIC_R2_PUBLIC_URL=https://files.yourdomain.com
```

4. **Public access** (để logo hiện trên `/share` và `next/image`):
   - **Custom domain** (khuyến nghị): R2 → bucket → **Settings** → **Public access** / **Connect domain** → trỏ DNS → dùng URL đó cho `NEXT_PUBLIC_R2_PUBLIC_URL`.
   - Hoặc bật **r2.dev** subdomain tạm thời khi dev.

5. Trên **Vercel**, thêm cùng các biến (trừ secret có thể chỉ server: `R2_*` không cần `NEXT_PUBLIC_` trừ URL public).

**Kiểm tra:** Agency plan → `/app/settings` → upload logo → preview + mở link share có logo.

> Migration cũ vẫn tạo bucket Supabase `org-logos` (tùy chọn legacy). App mới chỉ upload qua R2 khi đã cấu hình env.

### Kiểm tra

- `/login` → Sign up agency → vào được `/app`.
- Tạo client + assessment.

**Chi phí:** Free tier ~500MB DB, 50k MAU auth; Pro khi scale — xem [Supabase pricing](https://supabase.com/pricing).

---

## 3. Resend (Email)

### Bước lấy key

1. [https://resend.com](https://resend.com) → tạo tài khoản.
2. **API Keys** → **Create API Key** → quyền **Sending access** (hoặc Full access khi dev).
3. Copy → `RESEND_API_KEY`

```env
RESEND_API_KEY=re_xxxxxxxx
```

### Gửi thử (dev)

Dùng domain test của Resend (không cần verify domain ngay):

```env
EMAIL_FROM_PLATFORM="Visa Calculator <onboarding@resend.dev>"
EMAIL_FROM_DEFAULT_AGENCY="via Visa Calculator <onboarding@resend.dev>"
```

Chỉ gửi được tới **email tài khoản Resend** khi dùng `onboarding@resend.dev`.

### Production

1. **Domains** → Add domain → thêm DNS (SPF, DKIM) theo hướng dẫn.
2. Đổi From sang domain của bạn, ví dụ `noreply@yourdomain.com.au`.

### Webhook (tùy chọn — mở/click email)

1. **Webhooks** → endpoint: `https://your-domain.com/api/email/webhooks/resend`
2. Hoặc local: `stripe listen` tương tự — dùng header `x-resend-webhook-secret` trùng `RESEND_WEBHOOK_SECRET` trong `.env.local` (đã sinh bởi `npm run setup:env`).

### Kiểm tra

- Client có email → **Email report** trên assessment.
- `/app/marketing` → campaign (cần consent client).

**Chi phí:** Free ~3.000 email/tháng; sau đó ~$20/50k email — [Resend pricing](https://resend.com/pricing).

---

## 4. Crypto billing (USDC trên Base — gói Professional)

Thanh toán **trả trước**: mỗi lần chuyển USDC = 30 ngày Professional (PDF, branding). Không auto-renew.

### Biến môi trường

```env
NEXT_PUBLIC_BASE_CHAIN_ID=8453
BASE_CHAIN_ID=8453
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

BILLING_TREASURY_WALLET=0xYourTreasuryMultisig
NEXT_PUBLIC_BILLING_TREASURY_WALLET=0xYourTreasuryMultisig

BILLING_USDC_AMOUNT=32
NEXT_PUBLIC_BILLING_USDC_AMOUNT=32
BILLING_PERIOD_DAYS=30

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
CRON_SECRET=random_secret_for_cron
```

### Bước thiết lập

1. **Treasury wallet** — ví nhận USDC (khuyến nghị [Safe multisig](https://safe.global/) trên Base).
2. **RPC** — [Alchemy](https://www.alchemy.com/) hoặc QuickNode cho `BASE_RPC_URL` (server verify giao dịch).
3. **WalletConnect** — [cloud.walletconnect.com](https://cloud.walletconnect.com) → tạo project → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
4. **Cron** — Vercel gọi `GET /api/cron/expire-billing` hàng ngày (Bearer `CRON_SECRET`) để hạ plan hết hạn.

### Test local (Base Sepolia)

Xem chi tiết: [docs/BILLING-CRYPTO-TESTNET.md](./BILLING-CRYPTO-TESTNET.md)

- Chain `84532`, faucet USDC Circle, trả 1 USDC thử.
- `/app/billing` → Connect wallet → Pay → plan `agency`.

### Kiểm tra production

- `/app/billing` → thanh toán USDC mainnet.
- Bảng `crypto_payments` có `tx_hash`; `organizations.billing_expires_at` được gia hạn.

---

## 5. OpenAI (AI explain)

### Bước lấy key

1. [https://platform.openai.com](https://platform.openai.com) → đăng ký.
2. **API keys** → **Create new secret key** → `OPENAI_API_KEY`
3. Nạp credit (Billing) — gpt-4o-mini rẻ, đủ cho explain.

```env
OPENAI_API_KEY=sk-...
AI_MODEL_DEFAULT=gpt-4o-mini
```

### Kiểm tra

- Đăng nhập agency → assessment → **Generate explanation**.
- Trial: 10 lần/tháng; Agency paid: 500 lần/tháng (trong code).

**Lưu ý:** AI **không** tính điểm visa — chỉ diễn giải kết quả từ `calculatePoints()`.

**Chi phí:** gpt-4o-mini ~$0.15–0.60 / 1M tokens — [OpenAI pricing](https://openai.com/api/pricing/).

---

## 6. Google Analytics 4 (tùy chọn)

1. [https://analytics.google.com](https://analytics.google.com) → tạo property.
2. **Admin** → **Data streams** → Web → URL site.
3. Copy **Measurement ID** (`G-XXXXXXXX`) → `NEXT_PUBLIC_GA_MEASUREMENT_ID`

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Chi phí:** Miễn phí.

---

## 7. Google AdSense (tùy chọn)

1. [https://www.google.com/adsense](https://www.google.com/adsense) → đăng ký site (cần nội dung + domain live).
2. Sau khi duyệt, lấy **Publisher ID** (`ca-pub-...`) → `NEXT_PUBLIC_ADSENSE_CLIENT_ID`

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxx
```

Chỉ hiện trên trang public (`/`, `/calculator`, blog) — không hiện trong `/app`.

**Chi phí:** Miễn phí (thu nhập từ ads).

---

## 8. Vercel (Deploy) — gán env production

1. Import repo GitHub vào [Vercel](https://vercel.com).
2. **Settings** → **Environment Variables** → dán **toàn bộ** biến từ `.env.local` (dùng key **live** Stripe/OpenAI khi production).
3. `NEXT_PUBLIC_SITE_URL` = domain production.
4. Supabase **Authentication** → **URL configuration** → thêm:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

---

## Checklist đầy đủ

```text
[ ] NEXT_PUBLIC_SITE_URL
[ ] Supabase URL + anon + service_role
[ ] 5 file SQL migrations đã chạy
[ ] Email auth Supabase bật
[ ] RESEND_API_KEY (+ domain production nếu cần)
[ ] STRIPE_* (test hoặc live) + webhook + price ID
[ ] OPENAI_API_KEY
[ ] (Tuỳ chọn) GA4, AdSense
[ ] npm run dev → /calculator OK
[ ] /login → /app → client → assessment → share
[ ] /app/billing (Stripe test)
[ ] Email report + AI explain
```

---

## Phụ lục: OCR nào rẻ nhất?

Câu hỏi này thường dùng cho sản phẩm **quét tài liệu / hộ chiếu / invoice** (không nằm trong Visa Calculator hiện tại). So sánh ngắn để chọn — **giá thay đổi**, luôn xem trang pricing chính thức trước khi chốt.

### Rẻ nhất theo kiểu triển khai

| Hạng | Giải pháp | Chi phí | Đổi lại |
|------|------------|---------|---------|
| 1 | **Tesseract** / **PaddleOCR** (tự host) | Chỉ tiền server/CPU | Phải vận hành, chất lượng phụ thuộc scan, không “API một dòng” |
| 2 | **OCR.space** | Free tier giới hạn request/ngày | Đơn giản, không phù hợp volume lớn / compliance cao |
| 3 | **Google Cloud Vision** (TEXT_DETECTION) | ~ vài USD / 1.000 ảnh (tier đầu thường có free credit) | Ổn định, nhiều ngôn ngữ, ecosystem Google |
| 4 | **AWS Textract** | Trả theo trang (~ vài cent/trang tùy region) | Mạnh với form/bảng, invoice |
| 5 | **Azure Document Intelligence** | Tương tự Textract, free tier giới hạn | Tốt cho document có layout |

### Gợi ý chọn nhanh

- **MVP / ít tiền nhất:** PaddleOCR hoặc Tesseract trên VPS nhỏ — **$0 license**, chi phí ~ $5–20/tháng server nếu traffic thấp.
- **Không muốn ops, volume vừa:** Google Vision hoặc Textract — so sánh 100 ảnh thử trên cùng dataset rồi chọn accuracy/$ .
- **Chỉ cần text thô từ ảnh rõ:** Model vision đa năng (GPT-4o-mini, Gemini Flash) **đắt hơn** OCR chuyên dụng nếu gọi theo token — **không** nên dùng LLM làm OCR chính cho production scale.

### Công thức ước tính chi phí OCR

```text
Chi phí/tháng ≈ (số_trang_ocr/tháng) × (giá_mỗi_trang) + phí_lưu_trữ
```

Ví dụ: 10.000 trang × $0.0015/trang ≈ **$15 USD/tháng** (số minh họa — kiểm tra bảng giá nhà cung cấp).

### Liên quan project Visa Calculator

App này **không dùng OCR** — điểm visa tính bằng form + `calculatePoints()`. Nếu sau này bạn làm **AI OCR SaaS** (passport/visa scan), nên tách repo và chọn OCR theo bảng trên; Visa Calculator giữ engine rules thuần TypeScript.

---

## Hỗ trợ / lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Supabase is not configured | Thiếu URL/key hoặc Vercel env rỗng | Điền `NEXT_PUBLIC_SUPABASE_URL` + publishable/anon + `SUPABASE_SERVICE_ROLE_KEY`; project mới chỉ có publishable → copy sang `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Production: `npm run push:vercel-env && npx vercel deploy --prod` |
| RESEND_API_KEY is not configured | Thiếu Resend | Thêm key hoặc dùng onboarding@resend.dev |
| Stripe is not configured | Thiếu Stripe keys | Thêm secret, publishable, price ID |
| AI is not configured | Thiếu OpenAI | Thêm OPENAI_API_KEY + billing OpenAI |
| Webhook plan không đổi | Sai webhook secret hoặc URL | `stripe listen` local hoặc kiểm tra endpoint production |
| RLS policy | Chưa chạy migration | Chạy đủ 5 file SQL |

Tài liệu env mẫu: [`.env.example`](../.env.example) · Script: `npm run setup:env`
