<template>
  <div v-if="MODE === 'development'" style="margin-top: 40px;">
    <div v-for="item of routes" :key="item.path">
      <router-link :to="item.path">{{ item.path }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const routes = router.options.routes.filter(n => !!n.name);

const { MODE } = import.meta.env;

</script>

<style lang='scss' scoped>

</style>
