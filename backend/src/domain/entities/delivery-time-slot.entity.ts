export interface DeliveryTimeSlotProps {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "13:00"
  description: string;
  maxCapacity?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export class DeliveryTimeSlot {
  public readonly id: string;
  public title: string;
  public startTime: string;
  public endTime: string;
  public description: string;
  public maxCapacity: number;
  public isActive: boolean;
  public displayOrder: number;

  constructor(props: DeliveryTimeSlotProps) {
    this.id = props.id;
    this.title = props.title;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.description = props.description;
    this.maxCapacity = props.maxCapacity ?? 50;
    this.isActive = props.isActive ?? true;
    this.displayOrder = props.displayOrder ?? 0;
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  public update(props: Partial<Omit<DeliveryTimeSlotProps, 'id'>>): void {
    if (props.title !== undefined) this.title = props.title;
    if (props.startTime !== undefined) this.startTime = props.startTime;
    if (props.endTime !== undefined) this.endTime = props.endTime;
    if (props.description !== undefined) this.description = props.description;
    if (props.maxCapacity !== undefined) this.maxCapacity = props.maxCapacity;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    if (props.displayOrder !== undefined) this.displayOrder = props.displayOrder;
  }
}
