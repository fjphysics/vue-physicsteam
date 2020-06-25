<template>
  <div>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>{{this.$store.state.studentInfo.name}}的物理作业</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-icon v-on="on">mdi-account</v-icon>        
      </template>
      <v-list>        
        <v-list-item @click="$router.push('/ChangePassword')">
          <v-list-item-title>修改密码</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>退出登录</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>      
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container>
        <v-card v-for="item in homeworkList" :key="item.id" raised>
          <v-card-title>
            <v-btn x-large left text @click="gotoHomework(item.id,item.title)">{{ item.title }}</v-btn>
          </v-card-title>
          <v-card-subtitle>发布时间：{{ item.publishTime|formatDate}}</v-card-subtitle>
          <v-card-text>题目数量{{item.exerIds}} 截止时间：{{item.expiredTime|formatDate}} 结束时间： {{item.endTime}}</v-card-text>
          <v-btn @click="gotoHomeworkView(item.id)">已完成</v-btn>
        </v-card>
      </v-container>
    </v-content>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      homeworkList: []
    };
  },
  // vue加载完毕后调入试卷信息
  created: function() {
    /*if (localStorage.getItem("studentInfo")) {
      var studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
      this.$store.commit("updateClassId", studentInfo.classId);
      this.$store.commit("updateStudentId", studentInfo.studentId);
      this.$store.commit("updateName", studentInfo.name);
    }*/

    this.loadHomework();
  },
  filters: {
    formatDate: function(value) {
      return  value.replace("T", " ").substring(0,16) ;
    }
  },
  methods: {
    loadHomework() {
      this.$axios
        .get(
          "/api/Homework/getByClassId?classId=" +
            this.$store.state.studentInfo.classId
        )
        .then(response => {
          for (var i = 0, len = response.data.length; i < len; i++) {
            var item = response.data[i];
            response.data[i].exerIds = item.exerIds.split(",").length;
            if (item.expiredTime === null) {
              response.data[i].expiredTime = "无";
            } 
            if (item.endTime === null) response.data[i].endTime = "进行中";
            else response.data[i].endTime = "已结束";
          }
          this.homeworkList = response.data;
        });
    },
    gotoHomework: function(id, title) {
      this.$router.push({
        name: "Homework",
        params: {
          studentId: this.$store.state.studentInfo.studentId,
          homeworkId: id,
          title: title
        }
      });
    },
    gotoHomeworkView: function(id) {
      this.$router.push({
        name: "HomeworkView",
        params: {
          studentId: this.$store.state.studentInfo.studentId,
          homeworkId: id
        }
      });
    },
    logout() {
      this.$store.commit("logout");
      this.$router.push("/Login");
    }
  }
};
</script>
