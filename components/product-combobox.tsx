"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
};

type ProductComboboxProps = {
  id?: string;
  value?: string;
  onChange: (id: string) => void;
  products: ProductOption[];
  loading?: boolean;
};

export function ProductCombobox({ id, value, onChange, products, loading = false }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const selected = useMemo(() => products.find((product) => product.id === value), [products, value]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => product.name.toLowerCase().includes(q));
  }, [products, debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected?.name ?? "เลือกสินค้า"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="ค้นหาสินค้า..."
            aria-label="ค้นหาสินค้า"
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm">ไม่พบสินค้า</div>
            ) : (
              <CommandGroup>
                {filtered.map((product) => {
                  const isSelected = product.id === value;
                  return (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => {
                        onChange(product.id);
                        setOpen(false);
                      }}
                      className={cn(isSelected && "bg-secondary")}
                    >
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      {product.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
