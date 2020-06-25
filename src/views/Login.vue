<template>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>用户登录</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <!-- 学年下拉菜单-->
                  <v-select
                    :items="termList"
                    item-text="termName"
                    item-value="termId"
                    v-model="currentTermId"
                    :loading="loadingTerm"
                  ></v-select>
                  <!-- 班级下拉菜单-->
                  <v-select
                    :items="classList"
                    item-text="className"
                    item-value="classId"
                    v-model="studentInfo.classId"
                  ></v-select>
                  <!-- 学生下拉菜单-->
                  <v-select
                    :items="studentList"
                    item-text="NoName"
                    item-value="StudentId"
                    v-model="studentInfo.studentId"
                  ></v-select>
                  <v-text-field
                    id="password"
                    label="密码"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password"
                    v-model="password"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="login">登录</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <!--消息栏 -->
        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ snackbarMessage }}
          <v-btn color="blue" text @click="snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-container>
    </v-content>
</template>

<script>
export default {
  name: "Login",
  data: () => ({
    termList: [],
    currentTermId: 0,
    loadingTerm: false,
    classList: [],
    studentList: [],
    password: "",
    studentInfo: { studentId: 0, name: "", classId: 0 },
    token: "",
    snackbar: false,
    snackbarMessage: ""
  }),
  created: function() {
    this.loadTerm();
  },
  methods: {
    loadTerm() {
      this.loadingTerm = true;
      this.$axios.get("/api/Homework/getTermHasHomework").then(res => {
        this.termList = res.data;
        // 在学年下拉框中选择第1项
        if (this.termList[0].termId) {
          this.currentTermId = this.termList[0].termId;
        }
        this.loadingTerm = false;
      });
    },
    loadClasses() {
      this.$axios
        .get("/api/Homework/GetClassesByTermId?termId=" + this.currentTermId)
        .then(res => {
          this.classList = res.data;
        });
    },
    loadStudents() {
      this.$axios
        .get(
          "/api/ClassAndStudents/GetStudentsByClassId?classId=" +
            this.studentInfo.classId
        )
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].NoName = res.data[i].No + "．" + res.data[i].Name;
          }
          this.studentList = res.data;
        });
    },
    // 参考网址：https://www.cnblogs.com/web-record/p/9876916.html
    login() {
      let currentStudentId = this.studentInfo.studentId;

      var arr = this.studentList.filter(function(item) {
        return item.StudentId == currentStudentId;
      });
      //arr+1;
      //return this.studentList[0];
      this.studentInfo.name = arr[0].Name;

      // 在store和localstorge中存储学生信息
      this.$store.commit("setStudentInfo", this.studentInfo);
      localStorage.setItem("studentInfo", JSON.stringify(this.studentInfo));
      
      if (this.password === "" || currentStudentId < 1) {
        alert("账号或密码不能为空");
      } else {
        this.$axios
          .post("/api/Account/Login", {
            StudentId: currentStudentId,
            Password: this.password
          })
          .then(res => {
            if (res.data.Success) {
              //console.log(res.data);
              // 将用户token保存到vuex中
              this.$store.commit("saveToken", res.data.Token);
              // 重定向
              let redirect = decodeURIComponent(
                this.$route.query.redirect || "/"
              );
              this.$router.push({
                path: redirect
              });
            } else {
              this.snackbar = true;
              this.snackbarMessage = res.data.Message;
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  },
  computed: {
    classId() {
      return this.studentInfo.classId;
    }
  },
  watch: {
    currentTermId: function() {
      this.loadClasses(this.currentTermId);
    },
    classId: function(newValue) {
      this.loadStudents(newValue);
    }
  }
};
</script>