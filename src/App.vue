<template>
  <v-app>
  <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: "App",
  created() {
    //在页面加载时读取sessionStorage里的状态信息
    if (localStorage.getItem("token")) {
      this.$store.commit("saveToken", localStorage.getItem("token"));
    }

    if (localStorage.getItem("studentInfo")) {
      this.$store.commit(
        "setStudentInfo",
        JSON.parse(localStorage.getItem("studentInfo"))
      );
    }

    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload", () => {
      if (localStorage.getItem("token")) {
        this.$store.commit("saveToken", localStorage.getItem("token"));
      }

      if (localStorage.getItem("studentInfo")) {
        this.$store.commit(
          "setStudentInfo",
          JSON.parse(localStorage.getItem("studentInfo"))
        );
      }
    });
  }
};
</script>