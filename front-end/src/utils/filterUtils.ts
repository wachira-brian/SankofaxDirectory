import { Provider, Offer } from '../api/providerApi';

export const filterItems = <T extends Provider | Offer>(
  items: T[],
  filters: {
    category: string | null;
    subcategory: string | null;
    searchTerm: string;
  }
): T[] => {
  return items.filter((item) => {
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesSubcategory = !filters.subcategory || item.subcategory === filters.subcategory;
    const matchesSearch = !filters.searchTerm
      || item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      || ('address' in item && item.address.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      || ('description' in item && item.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    return matchesCategory && matchesSubcategory && matchesSearch;
  });
};