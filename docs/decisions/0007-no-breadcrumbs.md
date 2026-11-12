# 0007. No Breadcrumbs Under the Header

- **Date**: 2026-11-12
- **Status**: Accepted

## Context

The design system puts a breadcrumb trail (`Jorge Calleja › Project`) in the page intro, mirrored by a `BreadcrumbList` in the structured data. Salud Económica is a single page, so the trail only repeated the app name shown in the header and pushed the month's answer further down on phones.

## Decision

The page intro starts with the legend. The `Breadcrumbs` component, its styles and the `BreadcrumbList` node are removed. Authorship stays in the footer and in the `Person` node of the structured data.

## Alternatives

| Option | Why not |
|---|---|
| **Keep the trail only on desktop** | Still redundant with the header title |
| **Keep `BreadcrumbList` without a visible trail** | Structured data should mirror what the page shows |

## Consequences

- The verdict appears higher on small screens
- The rest of the page intro keeps the standard layout
