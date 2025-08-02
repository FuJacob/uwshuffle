import type { ProfInfo } from "../types";
const UWFLOW_GRAPHQL_URL = "https://uwflow.com/graphql";
export const fetchProfInfoFromUwFlow = async (
  profName: string
): Promise<ProfInfo | null> => {
  const query = `
    query Prof($name: String) {
      prof(where: { name: { _eq: $name } }) {
        id
        name
        rating {
          clear
          comment_count
          engaging
          filled_count
          liked
        }
      }
    }
  `;
  const response = await fetch(UWFLOW_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { name: profName },
    }),
  });
  if (!response.ok) throw new Error("Network error fetching prof");
  const result = await response.json();
  // result.data.prof is an array—return first or null
  return result?.data?.prof?.[0] ?? null;
};
