> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RES-01                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective — Reference                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Research Reference                                             |
> | Change History | 1.0 (2026-09-09): Relocated from `prd/research/01-market-competition.md` (v0.3) during the qadi-style spec migration. No old-scheme ID citations found in this file. |

# Web Research — Market and Competition (09/09/2026)

Synthesis of research passes: PrivateMarket, NexsoftCompetition, SaaSCompetition, OtherCompetitors, IntlCompetition, ParentApps, IntlBenchmark, FrenchMission. Raw fact + source; spec use: positioning, packaging, UX requirements.

## 1. Market (H-01)

- 2025-2026 intake: 8,271,256 students total (Ministry, 20/09/2025); ~1.2 M expected in the private sector (~15%); 2024-2025 actual: **1.3 M** (Le Desk/Ministry). The exact pairing "1.27 M / 15.3%" was not found as such. (medias24.com/2025/09/04; h24info; ledesk.ma)
- **7,564 private schools** (2023-2024), of which **70% on the Casablanca-Kénitra corridor** (Le360, official statement). No more recent figure found. (fr.le360.ma)
- Growth: 620,000 (2010-11) → >1 M (2019-20) → 1.3 M (2024-25); private schools 3,861 (2010-11) → 6,922 (2019-20); sector revenue ~MAD 20 Bn in **2019-2020** (Competition Council); "136,000 jobs" not found. (fr.le360.ma; conseil-concurrence.ma opinion A.1.21)
- Multi-site groups: Holged ~17,000 students, 20-22 campuses, 9 brands, MAD 500 M raised; La Résidence Casablanca (AEFE partner, runs 17 OCP-affiliated schools); OSUI: 10 schools, >11,000 students. (ledesk.ma; holged.com; efmaroc.org; edukasoftware.com)

## 2. Moroccan competitors

**Nexsoft / Madariss Plus + eMadariss (Rabat, historical leader)**
- 900+ schools claimed (self-reported); Madariss Plus is modular desktop software (492 claimed functions) running on a **local database at the school** (desktop/LAN, not SaaS); eMadariss is web/cloud, delivered per school subdomain; eMadariss Mobile: **white-labeled per-school apps**, 4 languages, offline mode, in-app online payment; 1,000+ downloads, last updated 20/02/2026; Play Store listing states "data not encrypted"; Facebook promo "from MAD 6,800/year"; no cross-school parent account (siloed per school). (nexsoft.ma; play.google.com)
- Spec takeaway: attack the architecture (real-time SaaS vs. local), a single cross-school parent account, one app (not white-labeled per school), security/CNDP compliance, robust Massar import/export.

**Skoolly**: MAD 4/5/6 per student/month (Starter, 100-student cap; Pro, unlimited, with HR + admissions + payments; Elite, +AI + multi-school), -10% annual, 30-day trial; 200 students on Pro = MAD 1,000/month. The "Skoolly" Play Store app belongs to an **Indian** developer (BinShahin, Razorpay) — the Moroccan brand and the app-store listing are mismatched; no visible Massar integration. (skoolly.ma/tarifs; play.google.com id=tech.skoolly.app)

**Minassa**: Starter MAD 249 (0-100 students) → Excellence+ MAD 1,050 (601-800), group pricing on request; +50 students = +MAD 99/month; i.e. **MAD 1.3-2.5 per student/month**; all-inclusive, 48-hour deployment, positioned as "complementary" to Massar; no public app-store listing; multi-school only via the Groups tier. (minassa.ma)

**SchoolMA (Marrakech, very small vendor)**: Demo, free (≤10 students); Discovery MAD 300/month (≤50 students, 1 GB); Enterprise MAD 800/month (unlimited, 50 GB, HR payroll, GPS transport, unlimited WhatsApp); AES-256/TLS 1.3; "Massar export and sync" on all tiers, "advanced" on Enterprise. (schoolma.net/tarifs)

**Tayssir School (MJTech)**: BASIC free forever (unlimited students, 2 admins) + PREMIUM on request; ~50 schools, 45,000+ users claimed; 4 apps (parents, teachers, drivers with geolocation, principals); parent app ~1,000+ downloads (last updated 12/07/2026); **cross-school** parent account claimed; claims "native, bidirectional sync with MASSAR" (unverifiable publicly — no documented Massar API) plus CNDP/ISO 27001 compliance claims. (tayssir.school; play.google.com)

**DataSchool (DATA 24, Casablanca)**: parent app 10,000+ downloads, last updated 28/08/2026 (v2.0.6, "fix payment issues"), ~20 releases since 2023; unpaid-fee follow-up since v1.4.0 (01/2025); 5 spaces (leadership, student, parent, teacher, admin), finance (cheques, discounts, exemptions, cash flow), canteen, GPS transport + cameras, HR; Apple App Store Morocco rating 4.0/5 on **3 reviews**; the often-cited "4.2/5 on Play" could not be confirmed. Pricing not published. (dataschool.ma; play.google.com; apps.apple.com)

**SchoolApp (Casablanca)**: 19 modules, bilingual report cards, unpaid-fee tracking with reminders and payment schedules, WhatsApp support; targets both single schools **and** groups ("consolidated view"); 1-month trial, pricing not published; Massar handling presented as complete. (schoolapp.ma)

**E-Schools**: 11 modules, "bidirectional Massar sync," HR & payroll, automatic reminders, SMS + push, video calls, 24/7 WhatsApp support; claim of "#1 in Morocco" unsubstantiated. (e-schools.ma)

**SmartSchool**: SaaS ERP, 12 modules with "AI analysis," transport, library, HR; demo showing "91.4% collection rate"; no visible client evidence. (smartschool.ma)

**ALIFADA (Logiciels AZ)**: students, attendance, receivables/payments/receipts, parent portal, hosting "in Morocco"; no visible native app; pricing on request. (logicielsaz.ma)

**E-Madrassati (CREAWEB)**: MAD 1,950 excl. VAT/year (promo "instead of 4,950"); page dated 12/2023, little sign of activity in 2025-2026. (creaweb.ma)

**Common market patterns**: single-school focus (except SchoolApp/ALIFADA, which target groups, and Tayssir on the parent side); "Massar sync" always means file exchange, never a documented API; no online payment integrated with Moroccan payment rails (CMI/Fatourati absent from product messaging); opaque pricing (only 2 of 6 vendors publish prices); real adoption is low (apps around 1,000 downloads; the DataSchool parent portal has only 3 reviews); no product-integrated WhatsApp messaging; CNDP compliance poorly documented (except claims from Tayssir/SchoolMA).

## 3. International competition / ERP

**Pronote (Index Éducation)**: ~**80 Moroccan schools** on the public list, all hosted — AEFE/OSUI schools (Descartes, Lyautey, Louis-Massignon, Agadir, Regnault, Victor Hugo, EFI) **but also Moroccan private-school groups** (Elbilia, Yassamine, Skolar, Jacques Chirac); covers student life/grades/attendance/communication, **not billing** (at Lycée Descartes, billing and re-enrollment run through a separate portal); 2023 pricing: EUR 572-1,055 excl. VAT/year depending on teacher count, plus hosting EUR 330-993, i.e. ~EUR 2,000 excl. VAT/year unlimited and hosted; app included free; paid export API (EUR 140 excl. VAT/year). (index-education.com; lycee-descartes.ac.ma)

**EcoleDirecte (Aplim)**: 5.5 M users (1.7 M students) in France; **usage in Morocco unverified** — no Moroccan school found. (aplim.fr; ledauphine.com 05/2026)

**Galactis.Education**: all-in-one SaaS targeting Morocco (Moroccan accounting, free "Click2Sync" Massar bridge, **hosted in the USA**); public pricing: Essentials EUR 5/student/year; Collaboration EUR 1; e-learning EUR 2-15; Campus EUR 2; HR EUR 20/employee/year; "Express" edition MAD 5,000/year. (galactis.education)

**Odoo**: no official education pack — integrator-built assemblies (Oasis Techno Cloud, DevUp, etc.); clients include Groupe Scolaire Jacques Chirac, Albatros Education; pricing on request; targets groups wanting Moroccan accounting plus student management. (odoo.com)

## 4. Parent apps — UX (H-11, G-17)

- Ministry Massar apps: **Moutamadris 3.1/5 (~7,060 reviews), 1 M+ downloads, last updated 25/03/2022**; Waliye (parents) and Moudaris (teachers) 100k+ each, last updated 25/03/2022; dominant complaints: login failures, blank screens, unavailability. (play.google.com)
- Features parents expect (promoted by DataSchool/Sanad/Scoliom/BotoSchool): **real-time absence alerts, grades and assessment schedules, financial status and payments, unpaid-fee reminders, push notifications, multi-child support ("child pickup"), complaints/messaging**; Sanad markets the **official WhatsApp Business API** as a differentiator. (dataschool.ma; sanad.school; scoliom.com; botoschool.ma)
- Spec takeaway: connection reliability (complaint #1), robust push notifications, native multi-child profile, payment/unpaid-fee tracking, WhatsApp utility messaging; avoid the Skoolly-India naming collision; do not over-weight ratings from low-volume apps.

## 5. International SIS benchmark (calibration)

- **PowerSchool**: separates the permanent student record (visible after transfer) from enrollments; native transfer with exit codes, blocks on future attendance records, an optional **Transfer unpaid fees** setting (carrying unpaid balances forward); Family Management (siblings, multiple students per parent account). National identifiers (SSID/USI) independent of enrollments in the US/Australia. (ps.powerschool-docs.com)
- **Classter**: multi-campus SIS+LMS, ~USD 24/student/year plus setup; Fedena (multi-campus) / openSIS (district-wide, inter-school transfers). (classter.com; opensis.com)
- **Standard SIS core**: admissions/enrollment, demographic record, timetable, attendance/discipline, grades/report cards/transcripts, curriculum, billing, parent+student portal plus mobile, health, transport, library, reporting, API/SSO. (clast.io)
- Spec takeaway: a global student identity separate from enrollments (confirmed by industry standards); transfer with an optional unpaid-fee carry-forward; local differentiation: Massar interoperability, /20 grading scale, education cycles, Ramadan/Eid, Moroccan payment rails.

## 6. French mission and multi-system schools

- EFM (French schools in Morocco) network 2025-2026: **44 accredited schools, ~49,000 students, 14 cities**; OSUI: 10 schools, >11,000 students (92% Moroccan); tools actually in use: **Pronote** (state-run schools: Lyautey, Descartes, Anatole France, Saint-Exupéry) plus **Eduka Suite** (OSUI: admissions, re-enrollment, billing, network accounting). (efmaroc.org; edukasoftware.com)
- "Partner" schools (Léon l'Africain, Maupassant, Sophie Germain, AIU, etc.): **a French track and a Moroccan track within the same school** — the multi-system case is real. (efmaroc.org)
- Specifics: trimesters, a skills booklet from pre-school through final year, French naming conventions, entrance exams based on report cards, DNB (lower-secondary diploma)/baccalaureate, OIB/BFI (international options), BIOF, IB. (efmaroc.org; education.gouv.fr)
- Spec takeaway: native multi-system configuration (national plus French tracks in the same school), cumulative transcripts (for university guidance/Parcoursup), a configurable grading engine; priority target = enhanced-bilingual schools and non-accredited French-curriculum schools (less locked into Pronote/Eduka).
