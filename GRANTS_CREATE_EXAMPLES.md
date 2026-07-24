# Two example grants/funding for Admin "Create Grant"

Use these values in **Marketplace → Grants → Create Grant** so every input is filled. They match the hardcoded grants in the public **Training, Events & Opportunities** (Funding) section. Required fields are marked with *.

---

## Grant 1: Smallholder Innovation Grant (matches frontend "Funding" badge)

| Field | Value |
|-------|--------|
| **Title *** | Smallholder Innovation Grant |
| **Badge *** | Funding |
| **Description *** | Direct financial support for farmers implementing solar-powered irrigation or sustainable tech solutions. Grants support adoption of climate-smart practices, drip irrigation, and renewable energy on smallholder farms. |
| **Amount (display text)** | Up to $10,000 |
| **Min Amount** | 1000 |
| **Max Amount** | 10000 |
| **Currency** | USD |
| **Funding Type** | Grant |
| **Deadline** | 2025-12-01 |
| **Deadline Text** | Deadline: Dec 1, 2025 |
| **Rolling Deadline** | Off |
| **Organization** | Ministry of Agriculture & Partners |
| **Sector** | Agriculture |
| **Target Audience** | Smallholder farmers |
| **Application URL** | https://example.com/apply/smallholder-innovation |
| **Eligibility Criteria** | Registered smallholder farmer or farmer group; proof of land use; commitment to implement solar irrigation or approved sustainable tech within 12 months. |
| **Requirements** | Completed application form; project proposal (max 3 pages); budget breakdown; two references. |
| **Contact Email** | grants@agriculture.go.ke |
| **Contact Phone** | +254 20 123 4500 |
| **Tags** | funding, smallholder, irrigation, solar, innovation |
| **Featured** | On |
| **Active** | On |
| **Image** | Upload any image (e.g. farmer with solar pump or green field) |
| **Image alt text** | Smallholder farmer with solar-powered irrigation – Smallholder Innovation Grant |

---

## Grant 2: Women in Agribusiness Fund (matches frontend "Grant" badge)

| Field | Value |
|-------|--------|
| **Title *** | Women in Agribusiness Fund |
| **Badge *** | Grant |
| **Description *** | Equity-free funding for women-led agribusinesses focusing on value addition and regional exports. Supports processing, packaging, and market access for women entrepreneurs in the agricultural value chain. |
| **Amount (display text)** | Flexible Grants |
| **Min Amount** | 5000 |
| **Max Amount** | 50000 |
| **Currency** | USD |
| **Funding Type** | Grant |
| **Deadline** | (leave empty when rolling) |
| **Deadline Text** | Open Rolling Basis |
| **Rolling Deadline** | On |
| **Organization** | Women in Agribusiness Initiative |
| **Sector** | Agriculture, Value addition |
| **Target Audience** | Women-led agribusinesses |
| **Application URL** | https://example.com/apply/women-agribusiness |
| **Eligibility Criteria** | Business must be at least 51% women-owned; operating in agribusiness (production, processing, or trade); registered and operational for at least 6 months. |
| **Requirements** | Application form; business registration; one-page business summary; financial statement or projections; ID of lead woman entrepreneur. |
| **Contact Email** | women.agri@fund.org |
| **Contact Phone** | +254 722 500 000 |
| **Tags** | grant, women, agribusiness, value addition, exports |
| **Featured** | On |
| **Active** | On |
| **Image** | Upload any image (e.g. women in agribusiness or packaging) |
| **Image alt text** | Women in agribusiness – equity-free funding for value addition and exports |

---

## Quick copy-paste (text only)

**Grant 1 – Smallholder Innovation Grant:**

- Title: `Smallholder Innovation Grant`
- Badge: `Funding`
- Description: `Direct financial support for farmers implementing solar-powered irrigation or sustainable tech solutions. Grants support adoption of climate-smart practices, drip irrigation, and renewable energy on smallholder farms.`
- Amount: `Up to $10,000` | Min: `1000` | Max: `10000` | Currency: `USD`
- Funding Type: `Grant`
- Deadline: `2025-12-01` | Deadline Text: `Deadline: Dec 1, 2025` | Rolling: No
- Organization: `Ministry of Agriculture & Partners` | Sector: `Agriculture` | Target: `Smallholder farmers`
- Application URL: `https://example.com/apply/smallholder-innovation`
- Eligibility: `Registered smallholder farmer or farmer group; proof of land use; commitment to implement solar irrigation or approved sustainable tech within 12 months.`
- Requirements: `Completed application form; project proposal (max 3 pages); budget breakdown; two references.`
- Contact: `grants@agriculture.go.ke` | `+254 20 123 4500`
- Tags: `funding`, `smallholder`, `irrigation`, `solar`, `innovation`
- Featured: Yes | Active: Yes
- Image alt: `Smallholder farmer with solar-powered irrigation – Smallholder Innovation Grant`

**Grant 2 – Women in Agribusiness Fund:**

- Title: `Women in Agribusiness Fund`
- Badge: `Grant`
- Description: `Equity-free funding for women-led agribusinesses focusing on value addition and regional exports. Supports processing, packaging, and market access for women entrepreneurs in the agricultural value chain.`
- Amount: `Flexible Grants` | Min: `5000` | Max: `50000` | Currency: `USD`
- Funding Type: `Grant`
- Deadline: (leave empty) | Deadline Text: `Open Rolling Basis` | Rolling: Yes
- Organization: `Women in Agribusiness Initiative` | Sector: `Agriculture, Value addition` | Target: `Women-led agribusinesses`
- Application URL: `https://example.com/apply/women-agribusiness`
- Eligibility: `Business must be at least 51% women-owned; operating in agribusiness (production, processing, or trade); registered and operational for at least 6 months.`
- Requirements: `Application form; business registration; one-page business summary; financial statement or projections; ID of lead woman entrepreneur.`
- Contact: `women.agri@fund.org` | `+254 722 500 000`
- Tags: `grant`, `women`, `agribusiness`, `value addition`, `exports`
- Featured: Yes | Active: Yes
- Image alt: `Women in agribusiness – equity-free funding for value addition and exports`

---

**Notes**

- You must upload an **image file** in the form for each grant; the table cannot supply that.
- **Grant 1** matches the frontend “Smallholder Innovation Grant” with badge “Funding” and “Up to $10,000” / “Deadline: Dec 1, 2023” (use 2025 in admin).
- **Grant 2** matches the frontend “Women in Agribusiness Fund” with badge “Grant” and “Flexible Grants” / “Open Rolling Basis”; turn **Rolling Deadline** On and leave **Deadline** empty.
- **Tags**: add each tag in the Tags field and click “Add”.
- After creating both, they will appear on the public **Training, Events & Opportunities** funding section when the API is connected and grants are active.
