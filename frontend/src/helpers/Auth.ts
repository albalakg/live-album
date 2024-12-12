import router from '../router'
import axios from "axios";

const COOKIE_NAME = 'LiveAlbums';

class Auth {
    login(data: any) {
        try {
            this.createCookie(data);
            axios.defaults.headers.common["Authorization"] = `Bearer ${this.token()}`;
        } catch(err) {
            console.error('err', err);
        }
    }

    createCookie(data: any) {
        document.cookie = `${COOKIE_NAME}=${this.encrypt(data)};SameSite=Lax;secure;expires=${new Date(data.expired_at)}`;
    }

    logout() {
        router.push('/logout')
    }
    
    get() {
        const data =  this.decrypt();
        if(!data) {
            this.deleteCookie();
            return null;
        }

        return data;
    }

    id() {
        return this.get() ? this.get().id : null;
    }

    token() {
        return this.get() ? this.get().token : '';
    }

    firstName() {
        return this.get() ? this.get().first_name : '';
    }

    lastName() {
        return this.get() ? this.get().last_name : '';
    }

    role() {
        return this.get() ? this.get().role : '';
    }

    fullName() {
        const data = this.get();
        return data ? data.first_name + ' ' + data.last_name : '';
    }
    
    isLogged() {
        return !!this.get();
    }
    
    isGuest() {
        return !this.get();
    }

    encrypt(data: any) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    }

    decrypt() {
        const cookie = this.getCookie();
        if(!cookie) {
            return null;
        } 

        return JSON.parse(decodeURIComponent(escape(atob(cookie))));
    }

    getCookie() {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${COOKIE_NAME}=`);
        if (parts.length === 2) 
            return parts?.pop()?.split(';').shift();
        else '';
    }

    deleteCookie() {
        document.cookie = `${COOKIE_NAME}=none;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
}

export default new Auth;
