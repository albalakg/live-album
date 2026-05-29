<template>
  <div class="guest-table-wrapper">
    <div class="table-scroll">
      <table class="guest-table width--full">
        <thead>
          <tr>
            <th class="col-checkbox">
              <MainCheckbox
                :value="allSelected"
                :disabled="!guests.length || loading"
                @onClick="$emit('toggle-all')"
              />
            </th>
            <th class="col-sortable">
              <button
                type="button"
                class="sort-header"
                :class="{ active: sortKey === 'full_name' }"
                @click="$emit('sort-change', 'full_name')"
              >
                <span>שם מלא</span>
                <MainIcon
                  :icon="sortIcon('full_name')"
                  size="1.1em"
                  class="sort-icon"
                />
              </button>
            </th>
            <th class="col-sortable">
              <button
                type="button"
                class="sort-header"
                :class="{ active: sortKey === 'phone' }"
                @click="$emit('sort-change', 'phone')"
              >
                <span>טלפון</span>
                <MainIcon
                  :icon="sortIcon('phone')"
                  size="1.1em"
                  class="sort-icon"
                />
              </button>
            </th>
            <th class="col-actions">פעולות</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in guests" :key="guest.id">
            <td class="col-checkbox">
              <MainCheckbox
                :value="selectedIds.includes(guest.id)"
                @onClick="$emit('toggle-guest', guest.id)"
              />
            </td>
            <td>{{ guest.full_name }}</td>
            <td class="phone-cell" dir="ltr">{{ guest.phone }}</td>
            <td class="col-actions">
              <div class="actions display--flex align--center">
                <MainIcon
                  clickable
                  icon="edit"
                  size="1.2em"
                  @onClick="$emit('edit', guest)"
                />
                <MainIcon
                  clickable
                  icon="delete"
                  size="1.2em"
                  @onClick="$emit('delete', guest)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      v-if="totalCount > pageSize"
      class="table-pagination display--flex align--center justify--space-between flex--wrap"
    >
      <p class="pagination-summary">
        מציג {{ rangeStart }}–{{ rangeEnd }} מתוך {{ totalCount }}
      </p>

      <div class="pagination-controls display--flex align--center">
        <button
          type="button"
          class="pagination-btn"
          :disabled="page <= 1"
          aria-label="עמוד קודם"
          @click="$emit('page-change', page - 1)"
        >
          <MainIcon icon="chevron_right" size="1.2em" />
        </button>

        <span class="pagination-page">{{ page }} / {{ totalPages }}</span>

        <button
          type="button"
          class="pagination-btn"
          :disabled="page >= totalPages"
          aria-label="עמוד הבא"
          @click="$emit('page-change', page + 1)"
        >
          <MainIcon icon="chevron_left" size="1.2em" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import { IWhatsAppGuest } from "@/helpers/interfaces";

type GuestSortKey = "full_name" | "phone";
type SortDirection = "asc" | "desc";

export default defineComponent({
  name: "WhatsAppGuestTable",

  components: {
    MainCheckbox,
    MainIcon,
  },

  props: {
    guests: {
      type: Array as PropType<IWhatsAppGuest[]>,
      default: () => [],
    },
    selectedIds: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    page: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    sortKey: {
      type: String as PropType<GuestSortKey>,
      default: "full_name",
    },
    sortDirection: {
      type: String as PropType<SortDirection>,
      default: "asc",
    },
  },

  emits: ["toggle-all", "toggle-guest", "edit", "delete", "page-change", "sort-change"],

  computed: {
    totalPages(): number {
      return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    },

    rangeStart(): number {
      if (!this.totalCount) return 0;
      return (this.page - 1) * this.pageSize + 1;
    },

    rangeEnd(): number {
      return Math.min(this.page * this.pageSize, this.totalCount);
    },

    allSelected(): boolean {
      return (
        this.guests.length > 0 &&
        this.guests.every((g) => this.selectedIds.includes(g.id))
      );
    },
  },

  methods: {
    sortIcon(key: GuestSortKey): string {
      if (this.sortKey !== key) {
        return "unfold_more";
      }

      return this.sortDirection === "asc" ? "arrow_upward" : "arrow_downward";
    },
  },
});
</script>

<style lang="scss" scoped>
.guest-table-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.table-scroll {
  overflow-x: auto;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.guest-table {
  border-collapse: collapse;
  min-width: 480px;

  th,
  td {
    padding: 12px 10px;
    text-align: right;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 600;
    background: #fafafa;
  }

  .col-sortable {
    padding: 0;
  }

  .sort-header {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 12px 10px;
    border: 0;
    background: transparent;
    font: inherit;
    font-weight: 600;
    color: inherit;
    text-align: right;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover,
    &.active {
      color: var(--green);
    }

    .sort-icon {
      opacity: 0.45;
      flex-shrink: 0;

      :deep(.main-icon) {
        width: auto;
        height: auto;
      }
    }

    &.active .sort-icon,
    &:hover .sort-icon {
      opacity: 1;
    }
  }

  .col-checkbox {
    width: 48px;
    text-align: center;
  }

  .col-actions {
    width: 90px;
  }

  .phone-cell {
    font-family: monospace;
  }

  .actions {
    gap: 8px;
  }
}

.table-pagination {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  gap: 12px;
}

.pagination-summary {
  margin: 0;
  color: var(--dark-gray);
  font-size: 0.9em;
}

.pagination-controls {
  gap: 8px;
}

.pagination-page {
  min-width: 56px;
  text-align: center;
  font-size: 0.9em;
  font-weight: 600;
  color: var(--dark-gray);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d5d5d5;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--green);
    color: var(--green);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  :deep(.main-icon) {
    width: auto;
    height: auto;
  }
}
</style>
