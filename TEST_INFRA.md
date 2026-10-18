# E2E Test Infra: EzboAgents World-Class AI SaaS Platform

## Test Philosophy
- Opaque-box, requirement-driven verification derived directly from `ORIGINAL_REQUEST.md` (section `## 2026-10-18T10:03:21Z`).
- Zero regression against existing test suites (`tests/run_all_tests.mjs` all 6 tiers must pass 100%).
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory & Test Coverage
| # | Feature | Source (Requirement) | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross) | Tier 4 (Scenario) |
|---|---------|---------------------|:----------------:|:-----------------:|:--------------:|:-----------------:|
| 1 | Poppins Typography & Fonts | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Color Harmony & Styling | R1 | 5 | 5 | ✓ | ✓ |
| 3 | 2-Plan Architecture (Starter & Pro) | R2 | 5 | 5 | ✓ | ✓ |
| 4 | "BYOK" Removal from UI | R2 | 5 | 5 | ✓ | ✓ |
| 5 | 2-Column PricingCardsGrid | R2 | 5 | 5 | ✓ | ✓ |
| 6 | Cloud Managed Public Removal & Compatibility | R2 | 5 | 5 | ✓ | ✓ |
| 7 | Universal AI CEO Access | R3 | 5 | 5 | ✓ | ✓ |
| 8 | Intelligent Plan Guard (Bilingual Decline + Link) | R3 | 5 | 5 | ✓ | ✓ |
| 9 | Complete Removal of Agents Store | R4 | 5 | 5 | ✓ | ✓ |
| 10 | 100+ Enterprise Tool Connectors Config | R5 | 5 | 5 | ✓ | ✓ |
| 11 | Dedicated Tools & Integrations Hub Tab | R5 | 5 | 5 | ✓ | ✓ |
| 12 | Readymade Execution vs Studio Gating | R6 | 5 | 5 | ✓ | ✓ |
| 13 | Workflow Studio Modal (Canvas & Bézier Cables) | R6 | 5 | 5 | ✓ | ✓ |
| 14 | External Channels Dynamic Master Switch | R7 | 5 | 5 | ✓ | ✓ |
| 15 | Admin Panel Model Toggles & 2 Plans | R8 | 5 | 5 | ✓ | ✓ |
| 16 | robots.css SHA256 Invariance | R9 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Runner: Node.js native test runner via `tests/run_all_tests.mjs` and dedicated SaaS platform suite `tests/test_saas_platform_e2e.test.mjs`.
- Pass/Fail semantics: Exit code 0, 100% assertions pass, 0 errors, 0 warnings.
- Layout:
  - `tests/run_all_tests.mjs`: master runner across all tiers
  - `tests/test_saas_platform_e2e.test.mjs`: new comprehensive test suite validating all 16 features from user request

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Free/Starter User Browses Homepage, Checks Pricing, Tries to Customize Workflow in CEO | F1, F3, F4, F5, F7, F8, F12, F14 | High |
| 2 | Pro User Logs In, Opens Tools Hub, Configures Tool, and Opens Visual Studio Canvas | F1, F3, F7, F10, F11, F12, F13, F15 | High |
| 3 | Administrator Toggles Channels CEO Off and Manages AI Models in Admin Panel | F14, F15 | Medium |
| 4 | User Runs Readymade Helper Workflow with Connected Tool Credentials | F7, F10, F12 | Medium |
| 5 | Legacy Subscriber with `byok` tier accesses platform and is grandfathered into Pro Plan | F3, F6, F7 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (≥80 assertions)
- Tier 2: ≥5 per feature boundary & error states (≥80 assertions)
- Tier 3: Pairwise combinations of plans, tools, CEO, studio, channels
- Tier 4: ≥5 realistic end-to-end application scenarios
- Tier 5: Adversarial verification of robots.css checksum and BYOK scrub
- Tier 6: Multi-model and multi-key failover compatibility verification
