<template>
    <h2 class="title--large">עריכת פרטי משתמש</h2>
    <form @submit.prevent="submit()" class="profile-form">
        <MainInput readonly v-model="email" size="medium" title="כתובת מייל" subtitle="לא ניתן להחליף כתובת מייל" />
        <br>
        <MainInput v-model="form.first_name" size="medium" title="שם פרטי" :error="errors.first_name" />
        <br>
        <MainInput v-model="form.last_name" size="medium" title="שם משפחה" :error="errors.last_name" />
        <br>
        <br>
        <MainButton :loading="loading" class="form-button" text="עדכן משתמש" />
    </form>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import { defineComponent } from 'vue';
import { IUpdateUserRequest } from '@/helpers/interfaces';

export default defineComponent({
    name: 'EditProfile',

    props: {
        user: {
            type: Object,
            required: true
        }
    },

    components: {
        MainInput,
        MainButton,
    },

    data() {
        return {
            email: '' as string,
            form: {
                first_name: '' as string,
                last_name: '' as string,
            } as IUpdateUserRequest,
            errors: {
                first_name: '',
                last_name: ''
            },
            loading: false as boolean
        };
    },

    created() {
        this.setUser();
    },

    methods: {
        setUser() {
            this.form.first_name = this.user.first_name;
            this.form.last_name = this.user.last_name;
            this.email = this.user.email;
        },

        validateForm() {
            this.errors = {
                first_name: '',
                last_name: ''
            };

            // First Name validation
            if (!this.form.first_name) {
                this.errors.first_name = 'שם פרטי הינו שדה חובה';
            } else if (!/^.{0,100}$/.test(this.form.last_name)) {
                this.errors.first_name = 'השם פרטי הוא עד 100 תווים';
            }

            // Last Name validation
            if (!this.form.last_name) {
                this.errors.last_name = 'שם משפחה הינו שדה חובה';
            } else if (!/^.{0,100}$/.test(this.form.last_name)) {
                this.errors.last_name = 'השם משפחה הוא עד 100 תווים';
            }

            return this.errors;
        },

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
            await this.$store.dispatch("user/updateProfile", this.form);
            this.loading = false;
        }
    }
});
</script>

<style lang="scss" scoped>
.profile-form {
    position: relative;
    z-index: 1;
    min-height: fit-content;
    height: calc(100% - 80px);
    margin-top: 20px;
}
</style>
