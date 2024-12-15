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
            errors: {
                current_password: '',
                new_password: ''
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
            const errors = this.validateForm();
            if (Object.values(errors).some(error => error !== '')) {
                Object.values(errors).forEach(error => {
                    if (error) {
                        this.$notify({
                            text: error,
                            type: "error",
                            duration: 5000
                        });
                    }
                })
                return;
            }

            this.loading = true;
            const res = await this.$store.dispatch("user/updatePassword", this.form);
            if (res) {
                this.form.current_password = '';
                this.form.new_password = '';
            }
            this.loading = false;
        },

        toggleVisibility() {
            this.isTextVisible = !this.isTextVisible;
        },

        validateForm() {
            this.errors = {
                current_password: '',
                new_password: ''
            };

            // Current Password validation
            if (!this.form.current_password) {
                this.errors.current_password = 'סיסמה נוכחית הינה שדה חובה';
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*^?]{8,40}$/.test(this.form.current_password)) {
                this.errors.current_password = 'הסיסמה הנוכחית חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר';
            }

            // New Password validation
            if (!this.form.new_password) {
                this.errors.new_password = 'סיסמה חדשה הינו שדה חובה';
            } else if (this.form.new_password === this.form.current_password) {
                this.errors.new_password = 'הסיסמאות לא יכולות להיות זהות';
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*^?]{8,40}$/.test(this.form.new_password)) {
                this.errors.current_password = 'הסיסמה החדשה חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר';
            }

            return this.errors;
        },
    }
});
</script>

<style lang="scss" scoped>
.change-password {
    position: relative;
    z-index: 1;
    min-height: fit-content;
    margin-top: 20px;
    height: calc(55% - 80px);
}
</style>