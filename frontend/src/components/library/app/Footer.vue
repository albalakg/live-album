<template>
    <div class="footer bg--pink width--full">
        <div class="footer-content height--full width--page-size margin--auto display--flex justify--space-between flex--wrap-mobile text--center-mobile">
            <div class="footer-header">
                <h3 class="footer-logo text--white">
                    SnapShare
                </h3>
                <h4>
                    האלבום שלך באירוע הקרוב
                </h4>
                <div class="social-media display--flex justify--center-mobile">
                    <a href="https://www.facebook.com/share/1By1U5frDi/?mibextid=wwXIfr" target="_blank">
                        <img src="/assets/icons/facebook-icon.png" alt="facebook">
                    </a>
                    <a href="https://www.instagram.com/snapshare_live?igsh=MXpudTBjMWhxeWw%3D&utm_source=qr" target="_blank">
                        <img src="/assets/icons/instagram-icon.png" alt="instagram">
                    </a>
                </div>
            </div>
            <div class="footer-links display--flex justify--space-between">
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
                    <router-link to="/terms-and-conditions">
                        <p>תנאי האתר</p>
                    </router-link>
                </div>
                <div v-if="!isLoggedIn">
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
                <div v-if="isLoggedIn || hasActiveEvent">
                    <router-link v-if="isLoggedIn" to="/profile">
                        <p>פרופיל</p>
                    </router-link>
                    <router-link v-if="hasActiveEvent" to="/event">
                        <p>אירוע</p>
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
        isLoggedIn(): boolean {
            return this.$store.getters["user/isLoggedIn"];
        },
        
        hasActiveEvent(): boolean {
            return this.$store.getters['event/hasActiveEvent'];
        }
    },

    methods: {

    }
});
</script>

<style lang="scss" scoped>
.footer {
    position: relative;
    height: fit-content;
    min-height: 40vh;
    margin-top: 5%;
    padding-top: 5%;

    .footer-content {
        z-index: 1;
        position: relative;
    }

    @media only screen and (max-width: 600px) { 
        padding-bottom: 75px;
        margin-top: 15%;
        bottom: 20px;
    }

    .footer-logo {
        font-size: 2.8em;
        font-weight: 700;
        z-index: 10;
        position: relative;
    }

    h4 {
        font-size: 2em;
        margin-bottom: 20px;
    }

    img {
        width: 40px;
        margin: 0 10px;
    }

    .footer-header {
        margin: auto;
    }

    .footer-links {
        width: 40%;
        position: relative;
        z-index: 1;
        
        @media only screen and (max-width: 600px) { 
            width: 100%;
            margin-top: 15px;
        }
         
        p {
            font-size: 1.2em;
            margin-bottom: 20px;
            font-weight: 500;
            
            @media only screen and (max-width: 600px) { 
                font-size: .9em;
            }
        }
    }

    .footer-bottom {
        margin-top: 5%;
        text-align: center;
        font-weight: 500;
        position: relative;
    }
}
</style>