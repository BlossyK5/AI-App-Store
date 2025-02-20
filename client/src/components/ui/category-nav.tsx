import { categories } from "@shared/schema";
import { Button } from "./button";

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 w-full max-w-4xl mx-auto">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        onClick={() => onSelectCategory("all")}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onSelectCategory(category)}
          className="whitespace-nowrap"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}