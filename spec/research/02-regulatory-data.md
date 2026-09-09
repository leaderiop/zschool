> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RES-02                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective — Reference                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Research Reference                                             |
> | Change History | 1.0 (2026-09-09): Relocated from `prd/research/02-regulatory-data.md` (v0.3) during the qadi-style spec migration. No old-scheme ID citations found in this file. |

# Web Research — Regulatory and Data Protection (09/09/2026)

Synthesis of research passes: Law5921, CNDP, DGSSI, ElecSignature, FamilyCode, DocumentsUnpaidFees, SchoolTaxation, PartTimeTeachers, DigitalSubsidies. See also `00-baseline-corrections.md` for baseline divergences.

## 1. Law 59.21 (private school education)

- Published in **Official Gazette No. 7485 of 23/02/2026** (general edition); 113 articles, 10 chapters; **repeals Laws 04.00, 05.00 and 06.00**; 35 implementing decrees expected. (sgg.gov.ma BO_7485; medias24 04/03/2026)
- Adoption: second reading 27/01/2026 (45/20) after the House of Representatives vote of 08/12/2025 (90/38, 228 amendments). (lareleve.ma/180627; lematin.ma)
- **Art. 49**: mandatory publication of the full fee list (registration, insurance, tuition, catering/boarding/transport), permanently posted at the school. (medias24 28/09/2025)
- **Prohibitions**: mid-year fee increases; forced sale of textbooks/supplies through the school or a designated bookseller; refusal to re-enroll a student in good standing; closing mid-year. (medias24; maroc-hebdo; telquel 21/07/2026)
- **Mandatory annual written contract** between school and parents, a copy given to parents, kept in the student file and available to the AREF (regional education authority); template set by regulation.
- **Sanctions (art. 64-65 per Le Matin)**: up to MAD 10,000 (unauthorized programs, closing mid-year, refusing re-enrollment, withholding exam access, **refusing to issue a leaving certificate/attestations** while the contract is being honored); MAD 20,000 (refusing an inspection, misleading advertising); MAD 100,000 on repeat offence; procedure: warning, 15-day/6-month remediation periods, referral to the public prosecutor.
- Pedagogical, administrative and **health** oversight by the AREF (specialized commissions); "mediation commissions" not confirmed under that exact name.
- The "80% permanent teaching staff" (art. 13 of Law 06.00) and the "8 hours/week" cap for external teachers came from the repealed Law 06.00; **whether Law 59.21 carries them over is unconfirmed** — under watch.

## 2. Law 09.08 / CNDP (data protection authority)

- Preliminary declaration **F211** (standard) or **F214** (simplified, where covered by a deliberation); receipt within 24 hours; possible reclassification into an authorization within 8 days; free of charge; filed online (CNDP-FORMS). (cndp.ma; cndp-forms.ma; entrer.ma 12/08/2026)
- **Preliminary authorization F112/F113** (art. 12): sensitive data (health, etc.), processing involving a **national ID number**, file interconnection, biometrics. For ZSchool: adult national ID numbers and health records fall under the authorization track.
- **Transfer abroad F118**: only to countries on the adequacy list, or with express consent, or in legally defined cases, or with CNDP authorization (contractual clauses); 2-month extendable deadline; contingent on the declaration/authorization of the underlying processing. (cndp.ma, updated 12/09/2025)
- **Adequacy list in force**: Deliberation No. 236-2015 of 18/12/2015 — 32 states (EU/EEA excluding Croatia, plus the UK, Switzerland, Canada); no update found. France/Spain: a simple declaration suffices, no F118 needed. (deliberation PDF, cndp.ma)
- Obligations: information notices (art. 5), security (art. 23), rights of access/rectification/objection (art. 7-9); the school is the data controller, ZSchool is the processor (ZSchool's own filings do not exempt the school from its own).
- Revision of Law 09.08 (GDPR alignment): calls for reform are documented, but **no bill has been confirmed as tabled in Parliament** to date.

## 3. Law 05.20 / DGSSI / qualified cloud

- Law 05.20 covers: government bodies/local authorities/public institutions, critical infrastructure, designated private operators (telecoms, ISPs, cybersecurity, digital services). **Private schools and SaaS vendors are out of scope** in 2026; a contractual exception applies if the client is a public entity or critical infrastructure operator. (dgssi.gov.ma; rmgsolutions.ma)
- Decree 2-24-921 (22/10/2024, Official Gazette 7380) plus Order 3-17-25 (01/08/2025, Official Gazette 7432): mandatory cloud qualification for sensitive entities; level 1 (standard) and level 2 (administration exclusively from Morocco, keys under client control); annual audit; reversibility agreement; ~24-month transition period (until roughly October 2026). No public list of qualified providers found (DGSSI site timeouts).
- Spec takeaway: DGSSI qualification is a commercial argument and a potential contractual requirement; the actual legal constraint remains Law 09.08 (hosting in Morocco or an authorization).

## 4. Electronic signature and seal (Law 43.20)

- Three levels (art. 4-5): simple, advanced, **qualified** (presumption of reliability, equivalent to a handwritten signature); the simple/advanced levels are admissible in court but without that presumption. Implementing Decree **2-22-687 (Official Gazette No. 7160 of 12/01/2023)**. (Law 43.20 PDF; hal.science)
- **Approval is per service** (signature ≠ seal ≠ timestamp). Approved providers: **Barid eSign** (qualified trust service provider, January 2025; **qualified timestamping, April 2026**, first in Morocco), **DamaneSign** (March 2025), **AfricTRUST** (with the Damane Cash network for qualified certificates, June 2026). No public pricing. (lopinion; lematin; medias24 17/03/2025 and 25/06/2026)
- Spec takeaway: V1 = advanced seal + hash/timestamp + QR code (admissible, without presumption of validity); V2 = a qualified seal in the school's name via an approved provider's API; the parents' contract is signed at the advanced level with proof of identification, timestamp and archiving (document, hash, timestamps, log).

## 5. Family Code (Moudawana)

- The "December 2024 reform" is a **report from the Family Code Reform Commission submitted to the King (139 proposals), not voted or enacted as of 12/08/2026**; the 2004 Family Code (Law 70-03) remains in force. (medias24 12/08/2026; lesmre.com)
- Art. **236**: the father is legal guardian (*wali*) by operation of law; the mother handles urgent matters if the father is unavailable. Art. **171**: custody (*hadana*) order — mother, then father, then maternal grandmother. Art. **209**: majority at 18 full Gregorian years. Art. 182: visitation rights of the non-custodial parent (article numbering 180-186 to confirm against the Official Gazette).
- Ministerial position of **30/05/2023**: the custodial mother may obtain the child's school administrative documents; disputes go to the public prosecutor. (madar21.com)
- The "national-ID measure for custodial mothers, November 2025" is **unconfirmed**.
- Spec takeaway: keep "legal guardian" and "custodian" as distinct, independent qualities; the "custody regime" parameter is designed to evolve without a schema overhaul.

## 6. School documents and unpaid fees

- Documented 2020 court orders: **Benguerir** (8/06 or 8/07), **Salé (11/07/2020)**, **Tangier (07/09/2020, MAD 500/day penalty, art. 31 of the Constitution plus the child's best interest)**, **Khemisset (August 2020, MAD 5,000 in arrears)**: the leaving certificate must be issued despite unpaid fees; financial disputes are for the courts to decide, not for schools to enforce by withholding documents. (medias24; lebrief; fr.le360)
- **Law 59.21**: refusal to issue certificates/attestations is penalized up to MAD 10,000. The September 2020 ministerial position is confirmed in substance; a note dated 28/05/2021 (on issuance via Massar) could not be found online.
- Spec takeaway: decouple the document workflow from collections; flag arrears on the record; hand over an account statement on departure; keep written traceability of requests/issuances.

## 7. Taxation (General Tax Code)

- **Art. 91-V-4°**: catering, transport, and school leisure activities provided by a private school to its own students are exempt **with no right to deduct**; refined by DGI response No. 340 of 18/04/2004: tuition itself is **out of the scope of VAT**. If provided by a **third party**: transport at 14% (→ 13% in 2025, **10% from 01/2026**, Circular Note 735/2024 Finance Act), catering at 10%. (fiscamaroc; tax-news.ma; finances.gov.ma)
- Invoice requirements (art. 145): identity, **tax ID (IF), common enterprise ID (ICE)** (issuer and, where applicable, VAT-registered client), address, **continuous sequential numbering**, payment method, VAT where applicable. Business registration/business tax number: common practice, not a tax requirement. (cybadvisory; lavieeco)
- Accounting records retention: **10 years** (art. 211; art. 22 of Law 9-88); the 2026 Finance Act clarifies electronic archiving (scope to be confirmed). School supplies are exempt under the "reduced-rate" scheme (art. 91-E-4°, 2024 Finance Act, 36 products). (fiscamaroc; moroccoworldnews 08/2024)
- Spec takeaway: price by **type of service** (out of VAT scope / exempt under the reduced-rate scheme / taxable third-party re-billing); tamper-proof numbering; 10-year archiving; ICE/IF on invoices.

## 8. Part-time teachers and the AREF

- Share of part-time teachers: "**about 50%**" of the private-sector teaching workforce (sector source, Médias24, 11/01/2023); no recent official statistic.
- **Ministerial circular of 11/11/2024**: public-school teachers authorized to work in private schools — application window 01/04 to 15/05, endorsement from the public-school principal, forwarded to the provincial office before 20/05, preliminary AREF authorization then final approval by end of September; global cap of **8 hours/week** (aggregated across all schools); **monthly list** submitted to the AREF (timetables, hours worked). (medias24 13/11/2024 + note 22524 PDF; lebrief)
- Law 06.00 (80% permanent staff) repealed by Law 59.21 — carry-over unconfirmed; Order 1538-03 (AREF filing requirements) not found.
- Spec takeaway: SchoolMembership with status permanent/part-time/external-public-sector; track the 8-hour quota; a schedule of AREF authorizations; monthly reporting prepared by the platform.

## 9. Digitalization subsidies

- **MOWAKABA** (Maroc PME / Maroc Digital 2030): **80% for SMEs, 90% for micro-enterprises** of digitalization costs (projects MAD 15,000-150,000); eligible expenses = **services** (business software, deployment, training) through listed providers; procedure requires a common enterprise ID (ICE), a quote, and an online application; approval takes 4-6 weeks; payment after delivery; **eligibility of private schools unconfirmed** (one source restricts it to the industrial/related sector). (marocpme.gov.ma; dotma.ma; mohammedteto.com)
- DigiTPME (ADD+GIZ): support for 300 micro/small/medium enterprises (Fès-Meknès, Oriental, Marrakech-Safi region) — an integrator network, not a direct subsidy. (mmsp.gov.ma)
- Spec takeaway: pitch a "turnkey MOWAKABA case" targeted at onboarding/configuration/training (eligible services); decouple immediate start from subsidy disbursement; verify eligibility before making a firm commercial claim.
