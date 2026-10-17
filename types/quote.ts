export type QuoteRateRow = {
  id: string;
  label: string;
  blurb: string;
  hourlyRate: number;
};

export type QuoteAddOnRow = {
  id: string;
  label: string;
  blurb: string;
  flatPrice: number;
};

export type QuoteConfig = {
  minHourlyRate: number;
  categories: QuoteRateRow[];
  addOns: QuoteAddOnRow[];
  updatedAt?: Date | null;
};
