import { getCarSuggestions, type CarSuggestion } from "@/lib/Carapi";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export default function SearchBar({ value, onChange, onSubmit }: Props) {
  const [suggestions, setSuggestions] = useState<CarSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debouncedValue = useDebounce(value, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    if (!debouncedValue.trim()) {
      setSuggestions([]);
      return;
    }

    getCarSuggestions(debouncedValue)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          setOpen(results.length > 0);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (text: string) => {
    onChange(text);
    setOpen(false);
    setHighlighted(-1);
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") onSubmit(value);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0) {
        selectSuggestion(suggestions[highlighted].text);
      } else {
        setOpen(false);
        onSubmit(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <Input
        type="text"
        placeholder="Search cars, e.g. Swift, Creta..."
        className="pl-10 pr-8"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlighted(-1);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => {
            onChange("");
            setSuggestions([]);
            setOpen(false);
            onSubmit("");
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
          {suggestions.map((s, i) => (
            <li key={`${s.type}-${s.text}-${i}`}>
              <button
                type="button"
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 ${
                  i === highlighted ? "bg-gray-100" : ""
                }`}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => selectSuggestion(s.text)}
              >
                <span>{s.text}</span>
                <span className="text-xs text-gray-400">{s.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}