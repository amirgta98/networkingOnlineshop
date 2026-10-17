export interface ShippingScheduleConfigProps {
  sameDayCutoffHour?: number; // e.g. 14 (2 PM)
  leadTimeDays?: number;       // e.g. 0
  workingDays?: number[];      // 0 = Saturday, 1 = Sunday, ..., 6 = Friday (default: [0, 1, 2, 3, 4, 5])
  daysInAdvance?: number;      // e.g. 7 business days
  holidayDates?: string[];     // ISO date strings YYYY-MM-DD
}

export class ShippingScheduleConfig {
  public sameDayCutoffHour: number;
  public leadTimeDays: number;
  public workingDays: number[];
  public daysInAdvance: number;
  public holidayDates: string[];

  constructor(props?: ShippingScheduleConfigProps) {
    this.sameDayCutoffHour = props?.sameDayCutoffHour ?? 14;
    this.leadTimeDays = props?.leadTimeDays ?? 0;
    this.workingDays = props?.workingDays ?? [0, 1, 2, 3, 4, 5]; // Sat to Thu
    this.daysInAdvance = props?.daysInAdvance ?? 7;
    this.holidayDates = props?.holidayDates ?? [];
  }

  public isWorkingDay(dayOfWeek: number): boolean {
    return this.workingDays.includes(dayOfWeek);
  }

  public isHoliday(dateStr: string, jalaliDateStr?: string): boolean {
    if (!this.holidayDates || this.holidayDates.length === 0) return false;
    return this.holidayDates.some((h) => {
      const cleanH = h.trim();
      if (cleanH === dateStr) return true;
      if (jalaliDateStr && (cleanH === jalaliDateStr || jalaliDateStr.includes(cleanH))) return true;
      return false;
    });
  }

  public update(props: Partial<ShippingScheduleConfigProps>): void {
    if (props.sameDayCutoffHour !== undefined) this.sameDayCutoffHour = props.sameDayCutoffHour;
    if (props.leadTimeDays !== undefined) this.leadTimeDays = props.leadTimeDays;
    if (props.workingDays !== undefined) this.workingDays = props.workingDays;
    if (props.daysInAdvance !== undefined) this.daysInAdvance = props.daysInAdvance;
    if (props.holidayDates !== undefined) this.holidayDates = props.holidayDates;
  }
}
