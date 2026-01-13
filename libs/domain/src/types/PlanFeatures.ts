export interface PlanLimits {
  workspaces: number;
  usersPerWorkspace: number;
}

export interface PlanFlags {
  [key: string]: boolean;
}

export interface PlanDisplayFeature {
  text: string;
  icon?: string | null;
  tooltip?: string | null;
  highlight?: boolean;
}

export interface PlanDisplay {
  badge?: 'popular' | 'new' | 'best-value' | null;
  displayOrder: number;
  highlighted: boolean;
  ctaText: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  comparisonLabel?: string | null;
  displayFeatures: PlanDisplayFeature[];
}

export interface PlanFeatures {
  limits: PlanLimits;
  flags: PlanFlags;
  display: PlanDisplay;
}
