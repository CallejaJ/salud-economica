import type { Category } from "@/lib/finance";
import type { Key } from "@/lib/i18n";

/** String keys for each category name and hint. */
export const CATEGORY_NAME: Record<Category | "income", Key> = {
  home: "catHome",
  food: "catFood",
  transport: "catTransport",
  bills: "catBills",
  leisure: "catLeisure",
  sports: "catSports",
  school: "catSchool",
  activities: "catActivities",
  gifts: "catGifts",
  other: "catOther",
  income: "catIncome",
};

export const CATEGORY_HINT: Record<Category, Key> = {
  home: "hintHome",
  food: "hintFood",
  transport: "hintTransport",
  bills: "hintBills",
  leisure: "hintLeisure",
  sports: "hintSports",
  school: "hintSchool",
  activities: "hintActivities",
  gifts: "hintGifts",
  other: "hintOther",
};
