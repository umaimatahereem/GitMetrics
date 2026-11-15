import { useEffect, useState } from "react";
import { Code2, Search, X } from "lucide-react";

function SearchBar({
  initialValue = "",
  onSubmit,
  loading = false,
  placeholder = "Enter a GitHub username...",
  buttonLabel = "Analyze",
  compact = false,
  autoFocus = false
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(value);
  };

  return (
    <form
      className={`search-box ${compact ? "compact" : ""}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <Code2 size={20} className="search-icon" />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        aria-label="GitHub username"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus={autoFocus}
      />

      {value && (
        <button
          type="button"
          className="clear-btn"
          onClick={() => setValue("")}
          aria-label="Clear"
        >
          <X size={16} />
        </button>
      )}

      <button type="submit" className="primary-btn" disabled={loading}>
        <Search size={17} />
        <span>{loading ? "Analyzing..." : buttonLabel}</span>
      </button>
    </form>
  );
}

export default SearchBar;
