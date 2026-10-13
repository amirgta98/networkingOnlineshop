export interface CategoryProps {
  id: string;
  shortName: string;
  longName: string;
  slug: string;
  description?: string;
  icon?: string;
  badge?: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  constructor(private props: CategoryProps) {}

  get id(): string {
    return this.props.id;
  }

  get shortName(): string {
    return this.props.shortName;
  }

  get longName(): string {
    return this.props.longName;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get icon(): string | undefined {
    return this.props.icon;
  }

  get badge(): string | undefined {
    return this.props.badge;
  }

  get parentId(): string | null | undefined {
    return this.props.parentId;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get productCount(): number {
    return this.props.productCount ?? 0;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public setProductCount(count: number): void {
    this.props.productCount = count;
  }

  public update(patch: Partial<Omit<CategoryProps, 'id' | 'createdAt'>>): void {
    if (patch.shortName !== undefined) this.props.shortName = patch.shortName;
    if (patch.longName !== undefined) this.props.longName = patch.longName;
    if (patch.slug !== undefined) this.props.slug = patch.slug;
    if (patch.description !== undefined) this.props.description = patch.description;
    if (patch.icon !== undefined) this.props.icon = patch.icon;
    if (patch.badge !== undefined) this.props.badge = patch.badge;
    if (patch.parentId !== undefined) this.props.parentId = patch.parentId;
    if (patch.sortOrder !== undefined) this.props.sortOrder = patch.sortOrder;
    if (patch.isActive !== undefined) this.props.isActive = patch.isActive;
    if (patch.productCount !== undefined) this.props.productCount = patch.productCount;
    this.props.updatedAt = new Date();
  }

  public toJSON(): CategoryProps {
    return {
      ...this.props,
      productCount: this.productCount,
    };
  }
}
