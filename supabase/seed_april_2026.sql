-- LeaseIQ | April 2026 Benchmark Seed Data
-- Run AFTER schema.sql

insert into benchmark_rates
  (make, model, trim, region, term_months, miles_per_year,
   mf_buy_rate, residual_pct, incentives, year, month, source, confidence, notes)
values
('Toyota', 'RAV4 Hybrid', 'LE', 'National', 36, 12000, 0.00294, 69.00, null, 2026, 4, 'carsdirect-bulletin', 'editorial', 'High MF (7.06% APR equiv), exceptional residual.'),
('Toyota', 'RAV4 PHEV', 'SE', 'National', 36, 12000, 0.00279, null, null, 2026, 4, 'carsdirect-bulletin', 'editorial', 'Poor lease value -- approx 6.70% APR equivalent.'),
('Honda', 'CR-V', 'LX', 'National', 36, 12000, 0.00125, 55.00, null, 2026, 4, 'carsdirect-bulletin', 'editorial', '3.00% APR equivalent -- strong lease value.'),
('BMW', 'X3', '30 xDrive', 'National', 36, 10000, 0.00180, 56.00, '$500 loyalty', 2026, 4, 'edmunds-forum', 'editorial', '$500 loyalty cash for returning BMW lessees.'),
('BMW', 'X3', '30 xDrive', 'National', 24, 12000, 0.00180, 60.00, '$500 loyalty', 2026, 4, 'edmunds-forum', 'editorial', '24-mo term carries higher residual (60%) vs 36-mo (56%).'),
('BMW', 'X5', 'xDrive40i', 'National', 36, 10000, 0.00225, 52.00, null, 2026, 4, 'edmunds-forum', 'editorial', 'No lease incentives for April 2026.'),
('BMW', 'X5', 'xDrive50e', 'National', 36, 10000, 0.00225, 49.00, '$2000 lease cash', 2026, 4, 'edmunds-forum', 'editorial', '$2,000 lease cash on PHEV model.'),
('BMW', 'M4', 'Coupe RWD', 'National', 36, 10000, 0.00225, 56.00, '$500 loyalty', 2026, 4, 'edmunds-forum', 'editorial', '$500 loyalty. MF = 5.40% APR.'),
('BMW', 'M4', 'Convertible', 'National', 36, 10000, 0.00240, 56.00, '$500 loyalty', 2026, 4, 'edmunds-forum', 'editorial', 'Slightly higher MF than coupe.'),
('BMW', 'M5', 'Sedan', 'National', 36, 10000, 0.00240, 57.00, null, 2026, 4, 'edmunds-forum', 'editorial', 'No incentives. 5.76% APR.'),
('Mercedes', 'E-Class', 'E350 4Matic', 'National', 36, 10000, 0.00124, 56.00, null, 2026, 4, 'edmunds-forum', 'editorial', 'Subsidized -- 2.98% APR. Excellent for the segment. A1 credit required.'),
('Mercedes', 'E-Class', 'E53 Wagon', 'National', 36, 10000, 0.00285, 54.00, null, 2026, 4, 'edmunds-forum', 'editorial', 'A1 credit required. 6.48% APR -- above average for Mercedes.');
