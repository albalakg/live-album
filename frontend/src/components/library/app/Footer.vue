<template>
    <div class="footer bg--pink width--full">
        <div class="footer-content height--full width--page-size margin--auto display--flex justify--space-between">
            <div>
                <h3 class="footer-logo text--white">
                    SnapShare
                </h3>
                <h4>
                    האלבום שלך באירוע הקרוב
                </h4>
                <div class="social-media display--flex">
                    <router-link to="/" target="_blank">
                        <img src="/assets/icons/facebook-icon.png" alt="facebook">
                    </router-link>
                    <router-link to="/" target="_blank">
                        <img src="/assets/icons/instagram-icon.png" alt="instagram">
                    </router-link>
                </div>
            </div>
            <div class="footer-links display--flex justify--space-between">
                <div>
                    <router-link to="/terms-and-conditions">
                        <p>תנאי האתר</p>
                    </router-link>
                </div>
                <div>
                    <router-link to="/#features">
                        <p>מה מקבלים</p>
                    </router-link>
                    <router-link to="/#how-it-works">
                        <p>איך זה עובד</p>
                    </router-link>
                    <router-link to="/#how-it-looks">
                        <p>איך זה נראה</p>
                    </router-link>
                    <router-link to="/#pricing">
                        <p>המסלולים שלנו</p>
                    </router-link>
                </div>
                <div>
                    <router-link to="/contact">
                        <p>צור קשר</p>
                    </router-link>
                    <router-link to="/order">
                        <p>הזמנה</p>
                    </router-link>
                </div>
                <div>
                    <router-link to="/login">
                        <p>התחבר</p>
                    </router-link>
                    <router-link to="/signup">
                        <p>הרשמה</p>
                    </router-link>
                    <router-link to="/forgot-password">
                        <p>שכחתי סיסמה</p>
                    </router-link>
                </div>
            </div>
        </div>
        <MainCube left="20%" top="-10%" width="xxx-large" height="large" />
        <MainCube color="pink" left="10%" top="-5%" width="large" height="xx-large" />
        <MainCube color="pink" left="30%" top="-19%" width="large" height="large" />
        <MainCube color="pink" left="0%" top="29%" width="small" height="large" />
        <MainCube right="0%" top="27%" width="x-large" height="large" />
        <MainCube color="pink" left="50%" top="39%" width="xxx-large" height="medium" />
        <MainCube color="pink" left="45%" bottom="5%" width="x-large" height="xxx-large" />

        <p class="footer-bottom">
            © 2024 SnapShare
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainCube from '@/components/library/background/MainCube.vue';

export default defineComponent({
    name: 'FooterComponent',

    components: {
        MainCube,
    },

    props: {

    },

    data() {
        return {
        }
    },

    computed: {

    },

    methods: {

    }
});
</script>

<style lang="scss">
.footer {
    position: relative;
    height: 40vh;
    margin-top: 5%;
    padding-top: 5%;

    .footer-logo {
        font-size: 2.8em;
        font-weight: 700;
    }

    h4 {
        font-size: 2em;
        margin-bottom: 20px;
    }

    img {
        width: 40px;
        margin-inline-end: 20px;
    }

    .footer-links {
        width: 40%;
        position: relative;
        z-index: 1;
         
        p {
            font-size: 1.2em;
            margin-bottom: 20px;
            font-weight: 500;
        }
    }

    .footer-bottom {
        bottom: 10%;
        text-align: center;
        font-weight: 500;
        position: relative;
    }
}
</style>