export interface OverviewKeyNumberItem {
  label: string;
  value: string | number;
  hint?: string;
}

export interface OverviewQuickActionItem {
  title: string;
  hint: string;
  to: string;
  icon: string;
  disabled?: boolean;
  hidden?: boolean;
}
