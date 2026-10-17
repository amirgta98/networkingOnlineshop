export type ShippingIconType =
  | 'truck'
  | 'zap'
  | 'package'
  | 'building2'
  | 'plane'
  | 'bike'
  | 'box'
  | 'container'
  | 'clock'
  | 'map-pin'
  | 'shield-check'
  | string;

export interface ProvinceShippingRule {
  province: string;
  cost?: number;
  estimatedDeliveryTime?: string;
  freeThreshold?: number | null;
  isFree?: boolean;
}

export interface ShippingMethodProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  freeThreshold?: number | null;
  estimatedDeliveryTime: string;
  iconName: ShippingIconType;
  iconUrl?: string | null;
  isExpress?: boolean;
  isActive?: boolean;
  minOrderAmount?: number;
  maxWeightKg?: number | null;
  allowedProvinces?: string[];
  provinceRules?: ProvinceShippingRule[];
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export function normalizeProvinceName(province?: string | null): string {
  if (!province || typeof province !== 'string') return '';
  return province
    .trim()
    .replace(/^استان\s+/i, '')
    .replace(/_/g, ' ')
    .replace(/\u200c|\u200f|\u00a0/g, ' ')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/\s*و\s*/g, ' و ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function areProvincesMatching(prov1?: string | null, prov2?: string | null): boolean {
  const p1 = normalizeProvinceName(prov1);
  const p2 = normalizeProvinceName(prov2);
  if (!p1 || !p2) return false;
  return p1 === p2;
}

export class ShippingMethod {
  public readonly id: string;
  public title: string;
  public subtitle: string;
  public description: string;
  public cost: number;
  public freeThreshold: number | null;
  public estimatedDeliveryTime: string;
  public iconName: ShippingIconType;
  public iconUrl: string | null;
  public isExpress: boolean;
  public isActive: boolean;
  public minOrderAmount: number;
  public maxWeightKg: number | null;
  public allowedProvinces: string[];
  public provinceRules: ProvinceShippingRule[];
  public displayOrder: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ShippingMethodProps) {
    this.id = props.id;
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.description = props.description;
    this.cost = Math.max(0, props.cost);
    this.freeThreshold = props.freeThreshold ?? null;
    this.estimatedDeliveryTime = props.estimatedDeliveryTime;
    this.iconName = props.iconName;
    this.iconUrl = props.iconUrl ?? null;
    this.isExpress = props.isExpress ?? false;
    this.isActive = props.isActive ?? true;
    this.minOrderAmount = props.minOrderAmount ?? 0;
    this.maxWeightKg = props.maxWeightKg ?? null;
    this.allowedProvinces = props.allowedProvinces ?? [];
    this.provinceRules = props.provinceRules ?? [];
    this.displayOrder = props.displayOrder ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public findProvinceRule(province?: string): ProvinceShippingRule | undefined {
    if (!province || !this.provinceRules || this.provinceRules.length === 0) {
      return undefined;
    }
    return this.provinceRules.find((r) => areProvincesMatching(r.province, province));
  }

  public getEffectiveCost(province?: string): number {
    const rule = this.findProvinceRule(province);
    if (rule) {
      if (rule.isFree) return 0;
      if (rule.cost !== undefined) return Math.max(0, rule.cost);
    }
    return this.cost;
  }

  public getEffectiveFreeThreshold(province?: string): number | null {
    const rule = this.findProvinceRule(province);
    if (rule) {
      if (rule.isFree || rule.cost === 0) return 0;
      if (rule.freeThreshold !== undefined) return rule.freeThreshold;
    }
    return this.freeThreshold;
  }

  public getEffectiveDeliveryTime(province?: string): string {
    const rule = this.findProvinceRule(province);
    if (rule && rule.estimatedDeliveryTime) {
      return rule.estimatedDeliveryTime;
    }
    return this.estimatedDeliveryTime;
  }

  public isFreeFor(subtotal: number, province?: string): boolean {
    const rule = this.findProvinceRule(province);
    if (rule) {
      if (rule.isFree) return true;
      if (rule.cost === 0) return true;
      if (rule.freeThreshold !== undefined) {
        if (rule.freeThreshold !== null && rule.freeThreshold >= 0) {
          return subtotal >= rule.freeThreshold;
        }
        return false;
      }
    }
    const effectiveCost = this.getEffectiveCost(province);
    if (effectiveCost === 0) return true;
    const threshold = this.getEffectiveFreeThreshold(province);
    if (threshold !== null && threshold >= 0) {
      return subtotal >= threshold;
    }
    return false;
  }

  public calculateCost(subtotal: number, province?: string): number {
    return this.isFreeFor(subtotal, province) ? 0 : this.getEffectiveCost(province);
  }

  public isAvailableFor(province?: string): boolean {
    if (!this.isActive) return false;
    if (!this.allowedProvinces || this.allowedProvinces.length === 0) return true;
    if (!province) return true;
    return this.allowedProvinces.some((p) => areProvincesMatching(p, province));
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }

  public update(props: Partial<Omit<ShippingMethodProps, 'id' | 'createdAt'>>): void {
    if (props.title !== undefined) this.title = props.title;
    if (props.subtitle !== undefined) this.subtitle = props.subtitle;
    if (props.description !== undefined) this.description = props.description;
    if (props.cost !== undefined) this.cost = Math.max(0, props.cost);
    if (props.freeThreshold !== undefined) this.freeThreshold = props.freeThreshold;
    if (props.estimatedDeliveryTime !== undefined) this.estimatedDeliveryTime = props.estimatedDeliveryTime;
    if (props.iconName !== undefined) this.iconName = props.iconName;
    if (props.iconUrl !== undefined) this.iconUrl = props.iconUrl;
    if (props.isExpress !== undefined) this.isExpress = props.isExpress;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    if (props.minOrderAmount !== undefined) this.minOrderAmount = props.minOrderAmount;
    if (props.maxWeightKg !== undefined) this.maxWeightKg = props.maxWeightKg;
    if (props.allowedProvinces !== undefined) this.allowedProvinces = props.allowedProvinces;
    if (props.provinceRules !== undefined) this.provinceRules = props.provinceRules;
    if (props.displayOrder !== undefined) this.displayOrder = props.displayOrder;
    this.updatedAt = new Date();
  }
}
