import React from "react";
// import "./../styles/FilterModal.css";

type Props = {
  filters: {
    maxReadyTime: string;
    minProtein: string;
    maxProtein: string;
    minCarbs: string;
    maxCarbs: string;
    minCalories: string;
    maxCalories: string;
  };
  setFilters: (f: any) => void;
  onClose: () => void;
  onApply: () => void;
};

const FilterModal: React.FC<Props> = ({
  filters,
  setFilters,
  onClose,
  onApply,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>filter recipes</h3>

        <input
          type="number"
          placeholder="max ready time (min)"
          value={filters.maxReadyTime}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, maxReadyTime: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="min calories"
          value={filters.minCalories}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, minCalories: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="max calories"
          value={filters.maxCalories}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, maxCalories: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="min carbs"
          value={filters.minCarbs}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, minCarbs: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="max carbs"
          value={filters.maxCarbs}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, maxCarbs: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="min protein"
          value={filters.minProtein}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, minProtein: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="max protein"
          value={filters.maxProtein}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, maxProtein: e.target.value }))
          }
        />
        <div className="modal-buttons">
          <button onClick={onApply}>apply filters</button>
          <button className="close-button" onClick={onClose}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default FilterModal;
