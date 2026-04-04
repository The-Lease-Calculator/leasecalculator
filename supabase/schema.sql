-- ============================================================
-- LeaseIQ -- Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists benchmark_rates (
  id              uuid primary key default gen_random_uuid(),
  make            text not null,
  model           text not null,
  trim            text,
  region          text not null default 'National',
  term_months     int  not null,
  miles_per_year  int  not null,
  mf_buy_rate     numeric(8,5) not null,
  residual_pct    numeric(5,2) not null,
  incentives      text,
  year            int  not null,
  month           int  not null check (month between 1 and 12),
  source          text not null check (source in ('edmunds-forum','carsdirect-bulletin','autoblog','crowdsourced')),
  confidence      text not null default 'editorial' check (confidence in ('editorial','crowdsourced')),
  notes           text,
  needs_review    boolean not null default false,
  created_at      timestamptz default now()
);

create index if not exists idx_benchmark_make_model
  on benchmark_rates (lower(make), lower(model), term_months, year desc, month desc);

create table if not exists lease_submissions (
  id              uuid primary key default gen_random_uuid(),
  make            text,
  model           text,
  trim            text,
  zip_code        text,
  msrp            numeric(10,2),
  selling_price   numeric(10,2),
  money_factor    numeric(8,5),
  residual_pct    numeric(5,2),
  term_months     int,
  miles_per_year  int,
  monthly_payment numeric(8,2),
  due_at_signing  numeric(10,2),
  acquisition_fee numeric(8,2),
  doc_fee         numeric(8,2),
  disposition_fee numeric(8,2),
  submitted_at    timestamptz default now(),
  report_token    text unique default encode(gen_random_bytes(16), 'hex'),
  expires_at      timestamptz default (now() + interval '90 days')
);

create index if not exists idx_submissions_token on lease_submissions (report_token);

create table if not exists analysis_results (
  id                  uuid primary key default gen_random_uuid(),
  submission_id       uuid references lease_submissions(id) on delete cascade,
  score               int not null check (score between 0 and 100),
  verdict             text not null check (verdict in ('great','fair','negotiate','walkaway')),
  benchmark_found     boolean not null default false,
  partial_score       boolean not null default false,
  score_components    jsonb,
  red_flags           jsonb,
  recommendations     jsonb,
  computed_at         timestamptz default now()
);

create index if not exists idx_results_submission on analysis_results (submission_id);

create table if not exists crowdsourced_staging (
  id              uuid primary key default gen_random_uuid(),
  make            text not null,
  model           text not null,
  trim            text,
  zip_code        text,
  money_factor    numeric(8,5),
  residual_pct    numeric(5,2),
  term_months     int,
  miles_per_year  int,
  monthly_payment numeric(8,2),
  msrp            numeric(10,2),
  selling_price   numeric(10,2),
  acquisition_fee numeric(8,2),
  doc_fee         numeric(8,2),
  year            int not null,
  month           int not null,
  submitted_at    timestamptz default now(),
  status          text not null default 'pending' check (status in ('pending','flagged','approved','rejected')),
  cluster_id      uuid,
  notes           text
);

create index if not exists idx_staging_make_model_month
  on crowdsourced_staging (lower(make), lower(model), year, month, status);

alter table benchmark_rates      enable row level security;
alter table lease_submissions    enable row level security;
alter table analysis_results     enable row level security;
alter table crowdsourced_staging enable row level security;

create policy "benchmarks_public_read" on benchmark_rates for select using (true);
create policy "submissions_by_token" on lease_submissions for select using (expires_at > now());
