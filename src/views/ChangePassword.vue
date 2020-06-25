<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark>
              <v-toolbar-title>修改密码</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                  label="新密码"
                  name="password"
                  prepend-icon="mdi-lock"
                  type="password"
                  v-model="password"
                  :rules="[rules.required,rules.counter]"
                />
                <v-text-field
                  label="确认密码"
                  name="comfirmPassword"
                  prepend-icon="mdi-lock"
                  type="password"
                  v-model="confirmPassword"
                  :rules="[rules.required,rules.counter]"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="submit" :loading="btnLoading">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <!--消息栏 -->
      <v-snackbar v-model="snackbar" :timeout="3000">{{ snackbarMessage }}</v-snackbar>
    </v-container>
  </v-content>
</template>

<script>
export default {
  name: "ChangePassword",
  data: () => ({
    password: "",
    confirmPassword: "",
    studentId: 0,
    rules: {
      required: value => !!value || "密码不能为空",
      counter: value => value.length >= 6 || "密码不能少于6位"
    },

    snackbar: false,
    snackbarMessage: "",
    btnLoading: false
  }),
  created: function() {
    this.studentId = JSON.parse(localStorage.getItem("studentInfo")).studentId;
    // todo:时间差8小时
    console.log(new Date());
  },
  methods: {
    submit() {
      if (this.password !== this.confirmPassword) {
        this.snackbar = true;
        this.snackbarMessage = "两次密码不同";
      } else {
        this.btnLoading = true;

        this.$axios
          .put("/api/Account/ChangePassword", {
            StudentId: this.studentId,
            Password: this.password
          })
          .then(response => {
            this.btnLoading = false;
            console.log(response.data);
            this.$store.commit("logout");
            this.$router.push("/Login");
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  }
};
</script>