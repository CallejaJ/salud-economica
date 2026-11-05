import { CategoryIcon } from "./icons";

/** Colored square with the category icon; the color comes from the --cat-* tokens. */
export default function CategoryBadge({ category, size = "md" }: { category: string; size?: "sm" | "md" }) {
  return (
    <span className={`cat-badge cat-${category} cat-badge-${size}`} aria-hidden="true">
      <CategoryIcon category={category} size={size === "sm" ? 16 : 20} />
    </span>
  );
}
