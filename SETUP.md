# Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL on a Timeweb Cloud VPS (or any VPS)
- Timeweb Cloud Object Storage bucket (S3-compatible)
- [DaData](https://dadata.ru) API key (for INN verification)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

### DATABASE_URL

Standard PostgreSQL connection string pointing to your VPS:

```
postgresql://USER:PASSWORD@VPS_IP:5432/DB_NAME
```

Make sure PostgreSQL on the VPS accepts connections from your app server.  
In `/etc/postgresql/*/main/pg_hba.conf`, allow the app IP, or use `0.0.0.0/0` behind a firewall.

### SESSION_SECRET

```bash
openssl rand -hex 32
```

### Timeweb S3 Object Storage

1. In [Timeweb Cloud console](https://timeweb.cloud) → **Object Storage** → create a bucket
2. Set bucket ACL to **public** (for uploaded images to be publicly accessible)
3. Create access keys in the bucket settings
4. Fill in:
   - `S3_ENDPOINT=https://s3.timeweb.cloud`
   - `S3_REGION=ru-1`
   - `S3_BUCKET=horeka-media` (your bucket name)
   - `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` from the generated keys

### DaData

Register at [dadata.ru](https://dadata.ru), get the API key from the dashboard.

## 3. PostgreSQL setup on VPS

```bash
# On the VPS
sudo -u postgres psql
CREATE USER horeka WITH PASSWORD 'your-password';
CREATE DATABASE horeka_db OWNER horeka;
\q
```

## 4. Run migrations

```bash
npx prisma migrate dev --name init
```

## 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/login`.

## Production deployment

```bash
npm run build
npm start
```

Use a process manager like PM2:

```bash
pm2 start npm --name horeka-next -- start
pm2 save
```
