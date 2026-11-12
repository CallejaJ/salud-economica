# 0007. Visually Hidden Breadcrumbs

- **Date**: 2026-11-12
- **Status**: Accepted

## Context

The design system puts a visible breadcrumb trail (`Jorge Calleja › Project`) in the page intro, mirrored by a `BreadcrumbList` in the structured data. Salud Económica is a single page, so the visible trail only repeated the app name shown in the header and pushed the month's answer further down on phones.

## Decision

The breadcrumb trail stays in the markup and in the `BreadcrumbList` structured data, but it is visually hidden with the standard clip pattern on `.breadcrumbs`. Screen readers and search engines still read it; sighted users do not see it. The page intro visually starts with the legend.

## Alternatives

| Option | Why not |
|---|---|
| **Remove the trail and `BreadcrumbList`** | Loses the authorship link for search engines and assistive technology |
| **`display: none`** | Hides the trail from screen readers too |
| **Keep the trail only on desktop** | Still redundant with the header title |

## Consequences

- The verdict appears higher on small screens
- `BreadcrumbList` keeps mirroring the trail present in the HTML
