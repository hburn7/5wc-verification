<template>
  <div id="start">
    <div>
      <h1>Account Screened</h1>
      <p>You have been pre-screened based on some information from your osu! account. If you believe 
      this is a mistake, please visit the #tickets channel and open a ticket to contact the Admin team. Thank you.</p>
      <p>Reason: {{ reason }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Context } from "@nuxt/types";
import Vue from "vue";
import { IUser } from "~/server/auth/IUser";
export default Vue.extend({
  asyncData({ req }: Context) {
    if (process.server) {
      const r: any = req;
      const user: IUser = r.session.passport.user;
      const reason = user.failureReason || 'Blame subject';
      return { reason }
    }
  }
});
</script>