import { getApi } from "@/lib/api";
import type { FundingFilters } from "@/features/funding-intelligence/types/funding";
import { schemes as fallbackSchemes } from "@/shared/constants/demo-data";

export async function matchSchemes(filters: FundingFilters, uid: string = "priya-demo"): Promise<any[]> {
  let matched: any[] = [];
  try {
    const response = await getApi<any[]>(`/schemes/match?uid=${uid}`);
    if (Array.isArray(response)) {
      matched = response;
    } else {
      matched = fallbackSchemes;
    }
  } catch (error) {
    console.warn("FastAPI backend unavailable for scheme matching, using demo schemes fallback:", error);
    matched = fallbackSchemes;
  }

  const query = filters.query ? filters.query.toLowerCase().trim() : "";

  return matched.filter((scheme: any) => {
    const name = scheme.name || "";
    const desc = scheme.description || scheme.explanation || "";
    const sector = scheme.sector || "";
    const type = scheme.type || "";
    const closingSoon = scheme.closingSoon || false;
    const womenOnly = scheme.womenOnly || false;

    const matchesQuery = !query || `${name} ${desc} ${sector}`.toLowerCase().includes(query);
    const matchesType = !filters.type || type === filters.type;
    const matchesStatus = !filters.status || (filters.status === "Closing Soon" ? closingSoon : !closingSoon);
    const matchesWomen = !filters.womenOnly || womenOnly;
    const matchesSector = !filters.sector || sector === filters.sector || sector === "All Sectors";
    
    return matchesQuery && matchesType && matchesStatus && matchesWomen && matchesSector;
  });
}
