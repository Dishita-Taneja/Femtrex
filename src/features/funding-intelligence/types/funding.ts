export type FundingFilters = {
  query: string;
  type?: string;
  status?: "Open" | "Closing Soon";
  womenOnly: boolean;
  sector?: string;
};
