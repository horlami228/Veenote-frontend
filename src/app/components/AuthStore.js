import { makeAutoObservable } from "mobx";

class AuthStore {
  username = "";

  constructor() {
    makeAutoObservable(this);
  }

  setUsername(newUsername) {
    this.username = newUsername;
  }

  clearUsername() {
    this.username = "";
  }
}

export const authStore = new AuthStore();
