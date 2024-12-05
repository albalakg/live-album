<template>
    <div class="change-password bg--white brs--medium padding--x-large">
        <div class="display--flex justify--space-between align--center">
            <div class="width--half">
                <h3 class="title--medium">
                    החלפת סיסמה
                </h3>
            </div>
            <div class="width--half text--left">
                <MainIcon clickable icon="visibility" @onClick="toggleVisibility()" />
            </div>
        </div>
        <form @submit.prevent="submit()">
            <br>
            <MainInput v-model="form.current_password" size="medium" :type="inputType" title="סיסמה ישנה" />
            <br>
            <MainInput v-model="form.new_password" hasError size="medium" :type="inputType" title="סיסמה חדשה" />
            <br>
            <MainButton class="form-button" text="איפוס סיסמה" />
        </form>
    </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import MainIcon from '@/components/library/general/MainIcon.vue';
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'ChangePassword',

    components: {
        MainInput,
        MainIcon,
        MainButton,
    },

    data() {
        return {
            form: {
                current_password: '' as string,
                new_password: '' as string,
            },
            loading: false as boolean,
            isTextVisible: false as boolean,
        };
    },

    computed: {
        inputType(): string {
            return this.isTextVisible ? 'text' : 'password';
        }
    },

    methods: {
        async submit() {
            this.loading = true;
            await this.$store.dispatch("user/updatePassword", this.form);
            this.loading = false;
        },

        toggleVisibility() {
            this.isTextVisible = !this.isTextVisible;
        }
    }
});
</script>

<style lang="scss" scoped>
.change-password {
    position: relative;
    z-index: 1;
    min-height: fit-content;
    height: calc(100% - 80px);
    margin-top: 20px;

}
</style>