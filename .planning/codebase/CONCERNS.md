# Concerns

## High Priority Risks (Identified in DIAGNOSTICO_COMPLETO.md)
1. **Tenant Isolation**: Historically, several endpoints lacked strict `tenantId` filtering, risking data leakage. Most have been fixed, but vigilance is required for new features.
2. **Data Consistency**: Issues with date comparisons ("hoje" as timestamp vs date) have caused dashboard and agenda display bugs.
3. **Workflow Integrity**: The approval process previously failed to attribute resources (drivers/vehicles) correctly due to frontend data mismatches.
4. **Security**: Previously identified `@Public()` decorators on critical controllers (SuperAdmin) required immediate remediation.

## Technical Debt
- **Shared Logic Gaps**: Some inconsistencies between backend schemas and frontend types (e.g., `corPrincipal` vs `cores.primaria`).
- **File Uploads**: Currently uses local disk storage, which may limit scalability compared to cloud storage (S3).
- **Offline PWA Capability**: Currently limited to specific pages; needs extension to fully support field workers.

## Project Vision
- **Visual Excellence**: The current goal is to move from "functional but basic" to a "Premium/Editorial" design (Curated Transit system).
- **Documentation**: Large files like `MOVEFY.md` and `DIAGNOSTICO_COMPLETO.md` contain critical context but may need distillation into structured planning documents.
