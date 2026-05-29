<template>

  <section class="whatsapp-panel bg--white brs--medium padding--large">

    <header
      class="panel-header display--flex justify--space-between align--center pointer"
      @click="expanded = !expanded"
    >
      <div class="display--flex align--center panel-title">
        <h2 class="title--large panel-title-text">רשימת אורחים</h2>
        <span v-if="guests.length" class="guest-count-badge">{{ guests.length }}</span>
      </div>

      <MainIcon
        :icon="expanded ? 'expand_less' : 'expand_more'"
        size="1.4em"
        class="collapse-icon"
      />
    </header>

    <div
      v-if="expanded"
      class="panel-toolbar display--flex align--center flex--wrap"
      @click.stop
    >
      <BaseButton
        text="הוספת אורח"
        size="x-small"
        @onClick="openAddModal"
      />

      <span class="toolbar-divider" aria-hidden="true" />

      <BaseButton
        text="ייבוא CSV"
        color="white"
        textColor="dark-gray"
        size="x-small"
        class="toolbar-btn-outline"
        :loading="importing"
        @onClick="triggerImport"
      />
      <button
        type="button"
        class="toolbar-btn toolbar-btn--outline"
        @click="downloadTemplate"
      >
        הורדת תבנית
      </button>

      <template v-if="guests.length">
        <span class="toolbar-divider" aria-hidden="true" />

        <BaseButton
          text="מחק נבחרים"
          color="white"
          textColor="pink"
          size="x-small"
          class="toolbar-btn-outline toolbar-btn-danger"
          :disabled="!selectedIds.length || deleting"
          :loading="deleting && deleteMode === 'selected'"
          @onClick="openDeleteConfirm('selected')"
        />
        <BaseButton
          text="מחק הכל"
          color="white"
          textColor="pink"
          size="x-small"
          class="toolbar-btn-outline toolbar-btn-danger"
          :disabled="deleting"
          :loading="deleting && deleteMode === 'all'"
          @onClick="openDeleteConfirm('all')"
        />
      </template>

      <input
        ref="csvInput"
        type="file"
        accept=".csv"
        class="display--none"
        @change="handleImport"
      />
    </div>

    <div v-show="expanded">

      <div v-if="loading && !guests.length" class="empty-state text--center padding--large">

        <p>טוען...</p>

      </div>



      <div v-else-if="!guests.length" class="empty-state text--center padding--large">

        <div class="empty-icon-wrap">
          <MainIcon icon="group_add" size="2.5em" />
        </div>

        <p class="margin--bottom-medium">אין אורחים ברשימה</p>

        <p class="margin--bottom-medium empty-hint">הוסיפו אורחים ידנית או ייבאו מקובץ CSV</p>

        <BaseButton text="הוספת אורח ראשון" @onClick="openAddModal" />

      </div>



      <WhatsAppGuestTable

        v-else

        :guests="paginatedGuests"

        :selected-ids="selectedIds"

        :loading="loading"

        :page="currentPage"

        :page-size="pageSize"

        :total-count="guests.length"

        :sort-key="sortKey"

        :sort-direction="sortDirection"

        @toggle-all="toggleAll"

        @toggle-guest="toggleGuest"

        @edit="openEditModal"

        @delete="openDeleteConfirm('single', $event)"

        @page-change="setPage"

        @sort-change="setSort"

      />

    </div>



    <WhatsAppGuestDeleteModal
      :open="deleteModalOpen"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :deleting="deleting"
      @confirm="executeDelete"
      @cancel="closeDeleteModal"
    />

    <WhatsAppGuestModal

      :open="modalOpen"

      :guest="editingGuest"

      :saving="saving"

      @save="handleSave"

      @cancel="closeModal"

    />

  </section>

</template>



<script lang="ts">

import { defineComponent } from "vue";

import BaseButton from "@/components/library/buttons/BaseButton.vue";

import MainIcon from "@/components/library/general/MainIcon.vue";

import WhatsAppGuestTable from "./WhatsAppGuestTable.vue";

import WhatsAppGuestModal from "./WhatsAppGuestModal.vue";

import WhatsAppGuestDeleteModal from "./WhatsAppGuestDeleteModal.vue";

import { IWhatsAppGuest } from "@/helpers/interfaces";

type GuestSortKey = "full_name" | "phone";
type SortDirection = "asc" | "desc";



export default defineComponent({

  name: "WhatsAppGuestPanel",



  components: {

    BaseButton,

    MainIcon,

    WhatsAppGuestTable,

    WhatsAppGuestModal,

    WhatsAppGuestDeleteModal,

  },



  emits: ["guests-updated"],



  data() {

    return {

      expanded: true,

      selectedIds: [] as number[],

      modalOpen: false,

      editingGuest: null as IWhatsAppGuest | null,

      saving: false,

      importing: false,

      deleteModalOpen: false,

      deleteMode: null as "single" | "selected" | "all" | null,

      deletingGuest: null as IWhatsAppGuest | null,

      deleting: false,

      currentPage: 1,

      pageSize: 10,

      sortKey: "full_name" as GuestSortKey,

      sortDirection: "asc" as SortDirection,

    };

  },



  watch: {

    "guests.length"() {

      this.clampCurrentPage();

    },

  },



  computed: {

    guests(): IWhatsAppGuest[] {

      return this.$store.getters["whatsapp/getGuests"];

    },



    loading(): boolean {

      return this.$store.getters["whatsapp/isLoading"];

    },



    paginatedGuests(): IWhatsAppGuest[] {

      const start = (this.currentPage - 1) * this.pageSize;

      return this.sortedGuests.slice(start, start + this.pageSize);

    },



    sortedGuests(): IWhatsAppGuest[] {

      const guests = [...this.guests];

      const direction = this.sortDirection === "asc" ? 1 : -1;



      guests.sort((a, b) => {

        const result = a[this.sortKey].localeCompare(b[this.sortKey], "he", {

          sensitivity: "base",

          numeric: true,

        });

        return direction * result;

      });



      return guests;

    },



    deleteModalTitle(): string {

      if (this.deleteMode === "single") return "מחיקת אורח";

      if (this.deleteMode === "all") return "מחיקת כל האורחים";

      return "מחיקת אורחים נבחרים";

    },



    deleteModalMessage(): string {

      if (this.deleteMode === "single" && this.deletingGuest) {

        return `האם למחוק את ${this.deletingGuest.full_name}? פעולה זו אינה ניתנת לביטול.`;

      }



      if (this.deleteMode === "all") {

        return `האם למחוק את כל ${this.guests.length} האורחים ברשימה? פעולה זו אינה ניתנת לביטול.`;

      }



      const count = this.selectedIds.length;

      return `האם למחוק ${count} אורחים נבחרים? פעולה זו אינה ניתנת לביטול.`;

    },



    pendingDeleteIds(): number[] {

      if (this.deleteMode === "single" && this.deletingGuest) {

        return [this.deletingGuest.id];

      }



      if (this.deleteMode === "all") {

        return this.guests.map((guest) => guest.id);

      }



      if (this.deleteMode === "selected") {

        return [...this.selectedIds];

      }



      return [];

    },

  },



  methods: {

    clampCurrentPage() {

      const totalPages = Math.max(1, Math.ceil(this.guests.length / this.pageSize));

      if (this.currentPage > totalPages) {

        this.currentPage = totalPages;

      }

    },



    setPage(page: number) {

      const totalPages = Math.max(1, Math.ceil(this.guests.length / this.pageSize));

      this.currentPage = Math.min(Math.max(1, page), totalPages);

    },



    setSort(key: GuestSortKey) {

      if (this.sortKey === key) {

        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";

      } else {

        this.sortKey = key;

        this.sortDirection = "asc";

      }



      this.currentPage = 1;

    },



    toggleAll() {

      const pageGuestIds = this.paginatedGuests.map((guest) => guest.id);

      const allPageSelected = pageGuestIds.every((id) => this.selectedIds.includes(id));



      if (allPageSelected) {

        this.selectedIds = this.selectedIds.filter((id) => !pageGuestIds.includes(id));

      } else {

        const merged = new Set([...this.selectedIds, ...pageGuestIds]);

        this.selectedIds = Array.from(merged);

      }

    },



    toggleGuest(guestId: number) {

      const idx = this.selectedIds.indexOf(guestId);

      if (idx >= 0) {

        this.selectedIds.splice(idx, 1);

      } else {

        this.selectedIds.push(guestId);

      }

    },



    openAddModal() {

      this.editingGuest = null;

      this.modalOpen = true;

    },



    openEditModal(guest: IWhatsAppGuest) {

      this.editingGuest = guest;

      this.modalOpen = true;

    },



    closeModal() {

      this.modalOpen = false;

      this.editingGuest = null;

    },



    async handleSave(payload: {

      id?: number;

      full_name: string;

      phone: string;

    }) {

      this.saving = true;

      let result;



      if (payload.id) {

        result = await this.$store.dispatch("whatsapp/updateGuest", payload);

      } else {

        result = await this.$store.dispatch("whatsapp/createGuest", payload);

      }



      this.saving = false;



      if (result) {

        this.closeModal();

        this.$emit("guests-updated");

      }

    },



    openDeleteConfirm(mode: "single" | "selected" | "all", guest?: IWhatsAppGuest) {

      if (mode === "selected" && !this.selectedIds.length) return;



      this.deleteMode = mode;

      this.deletingGuest = guest ?? null;

      this.deleteModalOpen = true;

    },



    closeDeleteModal() {

      if (this.deleting) return;



      this.deleteModalOpen = false;

      this.deleteMode = null;

      this.deletingGuest = null;

    },



    async executeDelete() {

      const guestIds = this.pendingDeleteIds;

      if (!guestIds.length) return;



      this.deleting = true;

      const result = await this.$store.dispatch("whatsapp/deleteGuests", guestIds);

      this.deleting = false;



      if (result) {

        this.selectedIds = this.selectedIds.filter((id) => !guestIds.includes(id));

        this.closeDeleteModal();

        this.$emit("guests-updated");

      }

    },



    triggerImport() {

      (this.$refs.csvInput as HTMLInputElement)?.click();

    },



    async handleImport(event: Event) {

      const input = event.target as HTMLInputElement;

      const file = input.files?.[0];

      if (!file) return;



      this.importing = true;

      const result = await this.$store.dispatch("whatsapp/importGuests", file);

      this.importing = false;

      input.value = "";



      if (result) {

        this.$emit("guests-updated");

      }

    },



    downloadTemplate() {

      this.$store.dispatch("whatsapp/downloadTemplate");

    },

  },

});

</script>



<style lang="scss" scoped>

.whatsapp-panel {
  margin-bottom: 24px;
  max-width: 100%;
  min-width: 0;
  overflow-x: clip;
}



.panel-header {
  margin-bottom: 0;
  gap: 12px;
}

.panel-title {
  min-width: 0;
  gap: 10px;
  flex-shrink: 0;
}

.panel-title-text {
  white-space: nowrap;
}

.panel-toolbar {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 12px 14px;
  background: #f8f9f8;
  border: 1px solid #ececec;
  border-radius: 10px;
}

.panel-toolbar :deep(.main-button) {
  flex-shrink: 0;
  box-shadow: none;
}

.panel-toolbar :deep(.toolbar-btn-outline.main-button) {
  border: 1px solid #d5d5d5;
}

.panel-toolbar :deep(.toolbar-btn-danger.main-button) {
  border-color: #f5c6cb;

  &:not(.disabled):hover {
    border-color: var(--pink);
  }
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  flex-shrink: 0;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease;

  &--outline {
    border: 1px solid #d5d5d5;
    background: #fff;
    color: var(--dark-gray);

    &:hover {
      border-color: var(--green);
      color: var(--green);
    }
  }
}



.guest-count-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 24px;

  height: 24px;

  padding: 0 8px;

  margin-right: 10px;

  border-radius: 999px;

  background: var(--green);

  color: #fff;

  font-size: 0.8em;

  font-weight: 700;

}



.collapse-icon {
  color: var(--dark-gray);
  flex-shrink: 0;

  :deep(.main-icon) {
    width: auto;
    height: auto;
  }
}

.empty-state {
  color: var(--dark-gray);
}

.empty-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  opacity: 0.4;

  :deep(.main-icon) {
    width: auto;
    height: auto;
  }
}



.empty-hint {

  font-size: 0.9em;

}

</style>

