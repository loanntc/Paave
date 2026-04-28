export interface DSItem {
  id: string;
  num: string;
  label: string;
}

export interface DSGroup {
  group: string;
  items: readonly DSItem[];
}

export const DS_NAV: readonly DSGroup[] = [
  {
    group: "Foundations",
    items: [
      { id: "ds-logo",     num: "01", label: "Logo" },
      { id: "ds-icons",    num: "02", label: "Iconography" },
      { id: "ds-grid",     num: "03", label: "Grid & spacing" },
      { id: "ds-shadow",   num: "04", label: "Shadow & glow" },
      { id: "ds-color",    num: "05", label: "Color tokens" },
    ],
  },
  {
    group: "Components",
    items: [
      { id: "ds-buttons",   num: "06", label: "Buttons" },
      { id: "ds-toggles",   num: "07", label: "Tabs & segments" },
      { id: "ds-badges",    num: "08", label: "Badges & tags" },
      { id: "ds-choice",    num: "09", label: "Checkbox · Radio · Switch" },
      { id: "ds-feedback",  num: "10", label: "Loading & progress" },
      { id: "ds-tooltip",   num: "11", label: "Tooltip" },
      { id: "ds-breadcrumb", num: "12", label: "Breadcrumb" },
    ],
  },
  {
    group: "Patterns",
    items: [
      { id: "ds-avatars",  num: "13", label: "Avatars" },
      { id: "ds-metrics",  num: "14", label: "Metric cards" },
      { id: "ds-infocards", num: "15", label: "Info cards" },
    ],
  },
];
