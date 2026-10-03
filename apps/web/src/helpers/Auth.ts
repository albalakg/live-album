import router from '../router'
import axios from "axios";

const COOKIE_NAME = 'LiveAlbums';
const STORAGE_KEY = 'LiveAlbumsAuth';

class Auth {
    login(data: any) {
        try {
            this.createSession(data);
            const token = data?.token ?? this.readToken();
            if (token) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
        } catch(err) {
            console.error('err', err);
        }
    }

    createSession(data: any) {
        this.createStorage(data);
        this.createCookie(data);
    }

    clearSession() {
        this.deleteCookie();
        this.deleteStorage();
        delete axios.defaults.headers.common["Authorization"];
    }

    createStorage(data: any) {
        try {
            localStorage.setItem(STORAGE_KEY, this.encrypt(data));
        } catch(err) {
            console.warn('Failed to persist auth session', err);
        }
    }

    createCookie(data: any) {
        const secure =
            window.location.protocol === "https:" ? ";secure" : "";
        let expires = new Date(data.expired_at);
        if (Number.isNaN(expires.getTime())) {
            expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        const value = encodeURIComponent(this.encrypt(data));
        document.cookie = `${COOKIE_NAME}=${value};path=/;SameSite=Lax${secure};expires=${expires.toUTCString()}`;
    }

    logout() {
        router.push('/logout')
    }
    
    get() {
        const data = this.decrypt();
        if(!data || this.isExpired(data)) {
            this.deleteCookie();
            this.deleteStorage();
            return null;
        }

        return data;
    }

    id() {
        const data = this.get();
        return data ? data.id : null;
    }

    token() {
        return this.readToken();
    }

    readToken() {
        const data = this.get();
        return data?.token ?? '';
    }

    firstName() {
        const data = this.get();
        return data ? data.first_name : '';
    }

    lastName() {
        const data = this.get();
        return data ? data.last_name : '';
    }

    role() {
        const data = this.get();
        return data ? data.role : '';
    }

    fullName() {
        const data = this.get();
        return data ? data.first_name + ' ' + data.last_name : '';
    }
    
    isLogged() {
        return !!this.readToken();
    }
    
    isGuest() {
        return !this.isLogged();
    }

    encrypt(data: any) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    }

    decrypt() {
        const storageData = this.decryptStorage();
        if (storageData) {
            return storageData;
        }

        const cookie = this.getCookie();
        if(!cookie) {
            return null;
        } 

        return this.decode(cookie);
    }

    decryptStorage() {
        try {
            const storedSession = localStorage.getItem(STORAGE_KEY);
            return storedSession ? this.decode(storedSession) : null;
        } catch(err) {
            console.warn('Failed to read auth session', err);
            return null;
        }
    }

    decode(value: string) {
        try {
            return JSON.parse(decodeURIComponent(escape(atob(value))));
        } catch(err) {
            console.warn('Failed to decode auth session', err);
            return null;
        }
    }

    isExpired(data: any) {
        if (!data?.expired_at) {
            return false;
        }

        const expires = new Date(data.expired_at);
        return !Number.isNaN(expires.getTime()) && expires.getTime() <= Date.now();
    }

    getCookie() {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${COOKIE_NAME}=`);
        if (parts.length !== 2) {
            return null;
        }
        const raw = parts.pop()?.split(";").shift();
        if (!raw) {
            return null;
        }
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }

    deleteCookie() {
        const secure =
            window.location.protocol === "https:" ? ";secure" : "";
        document.cookie = `${COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
    }

    deleteStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch(err) {
            console.warn('Failed to clear auth session', err);
        }
    }
}

export default new Auth;
