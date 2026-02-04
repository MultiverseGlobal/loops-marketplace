# Seller Application Form Structure

**Purpose**: Vetting mechanism to onboard high-quality "Founding Plugs" before public launch.

## Form Fields
| Field | Type | Purpose |
|-------|------|---------|
| **Full Name** | Text | Identity verification |
| **WhatsApp Number** | Phone | Primary communication channel |
| **Campus Email** | Email | Verifying student status (must match .edu.ng or similar) |
| **Offering Type** | Choice | Segmenting into Product vs. Service supply |
| **Description** | Text Area | Assessing quality of potential listings |
| **Item Count** | Dropdown | Estimating initial supply volume |
| **Current Channels** | Text | Understanding current behavior (IG, WhatsApp Status) |
| **Motivation** | Text Area | Gauging commitment and "founder mentality" |

## Review Process
1.  **Submission**: User submits form on `/founding-plugs`.
2.  **Status**: Defaults to `pending`.
3.  **Review**: Admin checks for:
    *   Valid campus email.
    *   Coherent description of items.
    *   WhatsApp number validity.
4.  **Action**:
    *   **Approve**: Mark status `approved`. Send WhatsApp welcome message with onboarding link.
    *   **Reject**: Mark status `rejected`. (Optional: Send polite decline).

## Success Metrics
*   **Conversion Rate**: Visitors to Application Submit.
*   **Approval Rate**: \% of applications that meet quality standards.
*   **Onboarding Rate**: \% of approved plugs who create at least 1 listing within 48h.
