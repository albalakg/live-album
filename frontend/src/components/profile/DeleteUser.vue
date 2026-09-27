<template>
    <div>
        <span>
            <strong>שימו לב:</strong> מחיקת המשתמש תמחק את כל פרטי המשתמש
            והאירוע כולל קבצי האלבום, לא יהיה ניתן לשחזור.
            <br>
            <small>לחצו על הכפתור לשחרר את החסימה</small>
        </span>
        <br>
        <br>
        <div class="display--flex justify--space-between align--center">
            <div class="width--third">
                <MainCheckbox :value="canDelete" @onClick="toggleCheck()" title="לחצו בשביל לאפשר מחיקה" />
            </div>
            <div class="width--third width--full-mobile">
                <BaseButton :disabled="!canDelete" :loading="loading" textColor="white" color="pink" text="מחיקת משתמש" @onClick="submit()" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseButton from '@/components/library/buttons/BaseButton.vue';
import MainCheckbox from '@/components/library/inputs/MainCheckbox.vue';

export default defineComponent({
    name: 'DeleteUser',

    data() {
        return {
            loading: false as boolean,
            canDelete: false as boolean,
        };
    },

    components: {
        BaseButton,
        MainCheckbox,
    },

    methods: {
        async submit() {
            this.loading = true;
            await this.$store.dispatch("user/delete");
            this.$router.push('/logout');
            this.loading = false;
        },

        toggleCheck() {
            this.canDelete = !this.canDelete;
        },
    }
});
</script>

<style lang="scss" scoped>
.subscription-status {
    font-weight: bold;
}

.width--third {
    min-width: fit-content;
}
</style>