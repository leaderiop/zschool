> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RES-03                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective — Reference                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Research Reference                                             |
> | Change History | 1.0 (2026-09-09): Relocated from `prd/research/03-payments-communications.md` (v0.3) during the qadi-style spec migration; `DEC-` citations retargeted to `ADR-ZS-` per `spec/process/id-migration-map.md` (CCR-ZS-001). |

# Web Research — Payments and Communications (09/09/2026)

Synthesis of research passes: FatouratiCMI, CardPayments, WalletChannels, WhatsAppAPI, SMSAggregators.

## 1. Fatourati (CMI) — primary rail for school fees

- 2013→2025 trajectory: **>240 M transactions, >MAD 220 Bn collected**; 32 interconnected banks/payment institutions, >70 digital and physical channels. (cmi.co.ma 18/02/2026)
- The CMI brochure explicitly lists "**schools and training institutes**" as a target creditor segment; access is via a "single contract," with CMI managing the relationship with banks and payment institutions. (CMI brochure PDF)
- Parent channels: mobile/e-banking, wallets, ATMs, bank branches, **cash at >25,000 points** (Al Filahi Cash, Barid Cash, Cash Plus, Damane Cash, Fawatir, Inwi Money, Wafacash) plus Maroc Pay. (CMI × BOTI SCHOOL, 23/05/2025)
- **Fatourati Aggregator — launched 17/02/2026**: an API for software vendors (reference/QR generation, payment tracking); the vendor "handles neither the funds nor the regulatory framework" — **the school remains the creditor and beneficiary of the funds**; contact: sales.fatourati@cmi.co.ma. **Fatourati Collect** = a plug-and-play web app for a single business. A direct API is available for enterprise-level integration. (cmi.co.ma; medias24 18/02/2026)
- Reference integration (Eduka): the school becomes a creditor via a **REST API**; the parent enters their school reference at any channel; Fatourati queries the school in real time for unpaid amounts, confirms payment, records it automatically, with **daily reconciliation and duplicate rejection**. (edukasoftware.com)
- Fatourati QR (GITEX Africa, 04/2026): bill payment by QR code. (medias24)
- Verified user schools: OSUI/LFI Louis-Massignon, Lyautey, Victor Hugo (fatourati.ma); Yassamine/Al Jabr/Al Madina/Jeanne d'Arc **not confirmed**.
- **Payzone**: an omnichannel gateway (~1.8% for local cards / 3% international); **no public evidence of multi-school payout distribution** → ruled out as a payout-distribution rail; reclassified as simple per-school card acceptance. (payzone.ma; elloha)

## 2. Card payments and acquiring

- **CMI now acts as switch/processor**; the transfer of ~55,000 merchant contracts, completed **31/01/2026**, moved them to 7 bank-affiliated payment-institution acquirers (Attijari Payment, M2T, Damane Cash, Lana Cash, Al Filahi Cash, Saham Paiements, CDM Pay); independents: NAPS, Barid Cash, VPS. (lavieeco 16/02/2026; cmi.co.ma)
- Since 01/05/2025, payment institutions and bank subsidiaries handle acquiring directly; **domestic interchange capped at 0.65%** since 10/2024. (maroc.ma)
- **NAPS**: e-Premium = 1.98% excl. VAT domestic (1.68% per Bank Al-Maghrib guidance), 3% international; MAD 29,900 excl. VAT setup fee; MAD 5,900/year subscription (waived in year 1); **Card-On-File, recurring payment, installment payment** included. e-Go: 1.98%, MAD 6,900 setup, MAD 2,900/year. (naps.ma)
- **Chari Money/Pay (baas.ma, a Bank Al-Maghrib-approved payment institution)**: recurring and one-click tokenization, **real-time split payments**, automated payouts, 3DS 2.0, tiered pricing "from 1.8%," no fixed fees; direct acquiring planned for late 2026 (subject to Bank Al-Maghrib approval); white-label offering subject to principal-agent status under Bank Al-Maghrib. (baas.ma, updated 05/2026)
- **YouCan Pay: closed in January 2024** (no Bank Al-Maghrib approval held). Stripe: Morocco not supported; PayPal: no simple local merchant collection. (challenge.ma 22/01/2024; stripe.com/global)
- Spec takeaway (`ADR-ZS-031`): the acquirer/payment-institution contract is held **by the school**; ZSchool is a technical provider (integration, tokenization on the acquirer's side, an agent that never holds funds); V2 card rails = NAPS e-Premium or Chari Pay or a bank-affiliated payment-institution acquirer.

## 3. Cash, wallets, cheques, direct debit

- A proven cash-agent model for school fees: CMI × BOTI SCHOOL (25,000+ points: Al Filahi Cash, Barid Cash, Cash Plus, Damane Cash, Fawatir, Inwi Money, Wafacash); Cash Plus: in-branch/app payment (Khadamat network); Barid Cash: PayeExpress plus the 2025 "Barid Payment" rebrand. (cmi.co.ma; cashplus.ma; baridcash.ma)
- **Cheques**: 972,232 cheques bounced/year (no funds or insufficient funds); Law 71-24 (in force 2025/2026 per press reports): decriminalizes a first bounced-cheque incident, gives a one-month remediation period renewable once, uses Bank Al-Maghrib's SCIP registry, and imposes a 5-year banking ban if not remediated. (fr.le360; lematin; bkam.ma) — School workflow: a friendly reminder, then formal protest/payment order; cheque statuses to model: submitted, deposited at the bank, cleared, bounced, remediated, in litigation.
- **Direct debit**: no publicly documented SEPA-equivalent; the practice is a signed mandate plus files exchanged with **the school's own bank**, with no API (a market inference, to be validated in a banking interview).
- Spec takeaway: the matrix of payment methods = cash (cash-drawer session) / cheque (with a full lifecycle) / bank transfer / semi-manual direct debit / **Fatourati (creditor model, V1)** / tokenized recurring card (V2); ZSchool never holds funds.

## 4. WhatsApp Business Platform

- Per-message pricing **since 01/07/2025**: templates billed on delivery by category (marketing/utility/authentication); non-template messages **within the 24-hour service window are free** — **until 01/10/2026**.
- **Change effective 01/10/2026** (announced by Meta on 01/07/2026): the end of free service and utility messages within the 24-hour window; and **Morocco moves out of "Rest of Africa" regional pricing** onto a **standalone rate card** (utility/authentication **higher**, plus authentication-international); rate cards published before 01/09/2026. (developers.facebook.com Pricing)
- Current order-of-magnitude rates to +212: marketing ≈ EUR 0.0357; utility ≈ EUR 0.0064; authentication ≈ EUR 0.0064 per message (BSP Messaggio); one Moroccan provider quotes ~MAD 0.55/message all-inclusive (EnvoiSMS). Alias SMS ≈ MAD 0.31-0.36 → **WhatsApp utility messaging is roughly 8x cheaper than an alias SMS**. (messaggio.com; envoisms/bulksms.ma)
- Access: Meta's **direct Cloud API** (free, billed by Meta) or official BSPs reachable from Morocco (360dialog flat ~USD 59/month, Twilio, Infobip, Gupshup, CM.com); Meta Business verification required; **no local carrier (IAM/Orange/inwi) is a BSP**; no self-hosting; unofficial APIs (Baileys, etc.) are banned by the terms of service → must be avoided.
- Utility templates (absence alert, payment reminder, report card): require prior Meta approval (minutes to hours); must stay transactional or risk reclassification as marketing (more expensive); reclassification can also happen based on usage patterns.
- Compliance: prior opt-in required for any promotional messaging (Law 09.08 plus 2019 CNDP/ANRT guidance); school notifications are performance of the contractual relationship, but WhatsApp opt-in and opt-out (STOP) still need to be managed; the phone-number file must be declared to the CNDP.
- Spec takeaway (`ADR-ZS-036`): WhatsApp utility messaging is the primary channel (opt-in), push notifications are the first channel (free), alias SMS is the critical fallback; budget for **inbound replies too** after 01/10/2026; the pricing switch is a dated parameter.

## 5. SMS

- Two sending regimes in Morocco: **alphanumeric alias (11 characters)** = "Premium" routing, priced at ≈ MAD 0.31-0.36 (5,000-100,000 volume tier) at bulksms.ma; **LowCost** = sender is a variable mobile number (06XX...), ≈ MAD 0.05-0.10, unsuitable for identified transactional messages. Other aggregators: bulksmsmaroc.com (MAD 290/1,000), techsoft-sms (HTTP/SMPP API), marocdata (MAD 0.44-0.54), BulkGate (EUR 0.1024, sender-ID approval 1-2 weeks). (bulksms.ma; bulkgate.com)
- Framework: Law 09.08 plus the 2019 CNDP-ANRT-carrier meeting: opt-in and opt-out required for promotional messaging; transactional messages are outside that scope but the phone-number file must still be declared. The exact binding text could not be found.
- Market contract model: self-service, **prepaid by the school** (credits with no expiry); for ZSchool: resold packs (`ADR-ZS-009`: MAD 0.30-0.50/SMS with a margin, consistent with the alias rate) or a ZSchool-owned aggregator account with pass-through billing; no formal reseller program found published.
- Spec takeaway: channel hierarchy push → WhatsApp utility → alias SMS; LowCost reserved for non-critical mass alerts; credit counters and threshold alerts per school.
