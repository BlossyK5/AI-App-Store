import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { professionalCategories, functionalCategories } from "@shared/schema";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  query: string;
  professionalCategory: string;
  functionalCategory: string;
  pricing: string;
  onQueryChange: (query: string) => void;
  onProfessionalCategoryChange: (category: string) => void;
  onFunctionalCategoryChange: (category: string) => void;
  onPricingChange: (pricing: string) => void;
}

export function SearchBar({
  query,
  professionalCategory,
  functionalCategory,
  pricing,
  onQueryChange,
  onProfessionalCategoryChange,
  onFunctionalCategoryChange,
  onPricingChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4">
      <div className="relative flex-1 search-bar">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search AI tools..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 filter-options">
        <Select value={professionalCategory} onValueChange={onProfessionalCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Professional Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Professionals</SelectItem>
            {professionalCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={functionalCategory} onValueChange={onFunctionalCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Functionality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Functions</SelectItem>
            {functionalCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pricing} onValueChange={onPricingChange}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}