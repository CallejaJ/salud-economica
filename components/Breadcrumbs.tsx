import { BREADCRUMBS } from "@/lib/seo";

/** Visible breadcrumb trail, mirrored by the BreadcrumbList structured data. */
export default function Breadcrumbs() {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {BREADCRUMBS.map((b, i) => {
          const last = i === BREADCRUMBS.length - 1;
          return (
            <li key={b.url}>
              {last ? (
                <span aria-current="page">{b.name}</span>
              ) : (
                <a href={b.url} rel="author">
                  {b.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
