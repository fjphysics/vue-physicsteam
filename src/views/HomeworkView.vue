<template>
    <div>
    <v-toolbar>
      <v-btn icon @click="gotoHome">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{this.$store.state.studentInfo.name}}的物理作业</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary">fsdf</v-btn>
    </v-toolbar>

    <!-- Sizes your content based upon application components -->
    
      <!-- Provides the application the proper gutter -->
      <v-content><v-container fluid>
        <v-card>
          <v-card-title>作业情况</v-card-title>
          <v-card-subtitle>发布时间：</v-card-subtitle>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">题号</th>
                    <th class="text-left">题型</th>
                    <th class="text-left">难度</th>
                    <th class="text-left">作答</th>
                    <th class="text-left">对错</th>
                    <th class="text-left">得分</th>
                    <th class="text-left">全班正确率</th>
                    <th class="text-left">详情</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in result" :key="item.homeworkNo">
                    <td>{{ item.homeworkNo }}</td>
                    <td>{{ typeNames[item.typeId-1].name }}</td>
                    <td>--</td>
                    <td>{{ item.answer }}</td>
                    <td>
                      <v-icon :color="iconColor(item.isCorrect)">{{ getCorrectIcon(item.isCorrect) }}</v-icon>
                    </td>
                    <td>{{ item.score }}</td>
                    <td>--</td>
                    <td>
                      <v-icon>mdi-heart</v-icon>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
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
      result: [],
      //iconColor: "yellow",
      typeNames: [
        { id: 1, name: "单选" },
        { id: 2, name: "填空" },
        { id: 3, name: "实验" },
        { id: 4, name: "辨析" },
        { id: 5, name: "计算" },
        { id: 6, name: "多选" },
        { id: 7, name: "作图" },
        { id: 8, name: "简答" }
      ]
    };
  },
  // vue加载完毕后调入试卷信息
  created: function() {
    this.loadHomeworkResult();
  },
  methods: {
    loadHomeworkResult() {
      this.$axios
        .get("/api/HomeworkExerResults/GetByhIdsId", {
          params: {
            homeworkId: this.$route.params.homeworkId,
            studentId: this.$store.state.studentInfo.studentId
          }
        })
        .then(response => {
          this.result = response.data;
          console.log(this.result);
        });
    },
    iconColor(value) {
      if (value == 0) return "red";
      else if (value == 1) return "green";
      else if (value == 2) return "yellow";
      else return ""
    },
    getCorrectIcon(value) {
      if(value<4)
            return  "mdi-circle"
            else
            return "mdi-heart"
    },
    gotoHome(){
      this.$router.push("/");
    }
  }
};
</script>
