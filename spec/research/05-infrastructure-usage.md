> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RES-05                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective — Reference                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Research Reference                                             |
> | Change History | 1.0 (2026-09-09): Relocated from `prd/research/05-infrastructure-usage.md` (v0.3) during the qadi-style spec migration; `DEC-` citations retargeted to `ADR-ZS-` per `spec/process/id-migration-map.md` (CCR-ZS-001). |

# Web Research — Infrastructure, Hosting, Digital Usage (09/09/2026)

Synthesis of research passes: OracleCloudMorocco, DigitalUsage.

## 1. Cloud in Morocco (H-18, `ADR-ZS-007`)

- **OCI "Morocco West (Casablanca)" = af-casablanca-1** (region key LEJ): release note 20/02/2026, available from **7 April 2026**, hosted at **N+ONE Datacenters** (Nouaceur, Casablanca); the first public hyperscaler in North Africa. **A single availability domain.** A second Oracle region in **Settat** is planned with no published timeline. (docs.oracle.com release notes; datacenterdynamics 10/04/2026; techafricanews)
- N+ONE: 6 buildings (Nouaceur + Settat), 4.5 MW of IT capacity across 4,000 m². (nplusone.africa via DCD)
- **Atlas Cloud Services** (a UM6P subsidiary, Benguérir): a datacenter certified **Tier III + Tier IV by the Uptime Institute**, ISO 27001 + PCI DSS, hosts SAP RISE in Morocco — a credible candidate for a sovereign backup site. (atlascloudservices.com; um6p.ma; uptimeinstitute.com)
- **OVHcloud Local Zone Rabat** (a Maroc Datacenter/Orange partnership, live since summer 2024, ISO 27001/27017/27018): Compute, Block Storage, a local IP; Object Storage and managed Kubernetes were announced as "coming" in 2024 but not reconfirmed since. (corporate.ovhcloud.com)
- **AWS**: no Morocco region — a Wavelength Zone in Casablanca (with Orange, generally available 30/01/2025), 5G edge only. **Azure/GCP**: no Morocco region. (aws.amazon.com; official region pages)
- OCI Casablanca pricing: no dedicated rate card published; standard OCI order-of-magnitude figures (compute ~USD 0.01-0.02/hour; Object Storage ~USD 0.0255/GB/month; OKE free outside of node costs) — indicative only.
- Spec/NFR takeaway: data residency in Morocco is achievable from V1 on af-casablanca-1; **disaster recovery is mandatory** (a single availability zone): replicate/back up to Settat (once the second Oracle region opens), Atlas Cloud Benguérir, or OVH Rabat; verify the catalogue service by service (managed databases, OKE, Object Storage) at launch time; intra-Morocco latency is low, a European fallback (~35-60 ms RTT) should be avoided for student data.

*Note: `spec/decisions/091-eu-hosting-deviation-from-morocco-baseline.md` records a subsequent, escalated deviation from this Morocco-first hosting baseline — see that ADR for the current status.*

## 2. Digital usage (H-11)

- **ANRT, 2024-2025 ICT survey** (Jan-Feb 2025, 5,760 households plus individuals, published 07/2025): **91.2% of individuals aged 5+** use the internet (31.5 M); household internet access **89.2%** (93.6% urban / **78.4% rural**); smartphone ownership: **91.7%** of mobile-equipped individuals; household smartphone ownership 91.7% (94.4%/88.3% urban/rural). The baseline's "8% feature-phone households / 14% rural" figure **does not appear** in this edition. (anrt.ma PDF; tic-maroc)
- **WhatsApp: 98.6%** of social-media users (97.3% for voice calls); 92.4% use social media daily. (ANRT p.36-38)
- **DataReportal Digital 2026 Morocco** (data as of Oct. 2025): 35.5 M internet users (92.2%); 22.8 M social-media identities; 57.1 M mobile connections; median mobile speed **60.31 Mbps** (+47.5%/year); YouTube 21.6 M; Facebook 22.8 M; TikTok 16.7 M; Instagram 15.1 M. (datareportal.com)
- **Mobile OS share** (StatCounter, August 2026): **Android 67.96% / iOS 32.02%** — a share of **web traffic**, not of the device fleet. (gs.statcounter.com)
- Household e-mail: **no primary 2025-2026 data found** → e-mail remains a secondary, non-critical channel. 67% of children in equipped households use the internet (education is the top use case, 95.5%). (ANRT)
- Spec takeaway: mobile-first with **Android** as the priority, iOS well cared for (32% of traffic); WhatsApp is the dominant channel, SMS is the fallback (given the rural digital divide: 78.4% rural household internet access); low-bandwidth mode and outage tolerance (NFR-OFF domain); the phone number is the primary contact identifier (`ADR-ZS-022`, confirmed).
