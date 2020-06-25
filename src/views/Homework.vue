<template>
  <div>
    <v-toolbar>
      <v-btn icon @click="goHome">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $route.params.title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        v-show="localStorageData.isAllDone"
        @click="submit"
        :loading="submitloading"
        :disabled="submitloading"
      >提交</v-btn>
    </v-toolbar>
    <v-content>
      <v-container>
        <v-row>
          <v-col>
            <v-card>
              <v-window v-model="localStorageData.onboarding" id="exeresWindow">
                <v-window-item v-for="(exer,exerIndex) in exerList" :key="exer.exerId" eager>
                  <v-card>
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        tile
                        v-on:click="prev"
                        :disabled="localStorageData.onboarding===0"
                      >上一题</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        tile
                        v-on:click="next"
                        :disabled="!localStorageData.isExerDone"
                      >下一题</v-btn>
                    </v-card-actions>
                    <!-- 题目标题 -->
                    <v-card-title>
                      {{typeNames[exer.typeId-1].name}}
                      {{localStorageData.onboarding+1}}/{{exerCount}},分数：{{exer.score}}，难度：{{exer.degree}}
                    </v-card-title>
                    <div v-html="exer.exer"></div>
                    <!-- 单选题 -->
                    <v-radio-group
                      v-if="exer.typeId==1"
                      v-model="localStorageData.answers[exerIndex]"
                    >
                      <v-radio
                        v-for="(option,optionIndex) in exer.options"
                        :key="optionIndex"
                        :value="optionIndex"
                      >
                        <template v-slot:label>
                          <div v-html="option"></div>
                        </template>
                      </v-radio>
                    </v-radio-group>
                    <!-- 多选题 -->
                    <template v-else-if="exer.typeId==6">
                      <div v-for="(option,optionIndex) in exer.options" :key="optionIndex">
                        <v-checkbox
                          v-model="localStorageData.answers[exerIndex]"
                          :value="optionIndex"
                          :name="exer.exerId"
                          hide-details
                        >
                          <template v-slot:label>
                            <div v-html="option"></div>
                          </template>
                        </v-checkbox>
                      </div>
                    </template>
                    <!-- 填空题 -->
                    <v-text-field
                      v-else-if="exer.typeId==2"
                      label="我的答案"
                      outlined
                      v-model="localStorageData.answers[exerIndex]"
                    ></v-text-field>
                    <!-- 计算题、辨析题，简答题 -->
                    <div v-else>
                      <v-textarea
                        label="我的答案"
                        auto-grow
                        outlined
                        v-model="localStorageData.answers[exerIndex]"
                      ></v-textarea>
                      <!--v-file-input accept="image/*" label="File input"></v-file-input-->
                    </div>
                  </v-card>
                </v-window-item>
              </v-window>
              <p>我的选项是:{{localStorageData.answers}},,对的题目：{{localStorageData.doneList}},isExerDone:{{localStorageData.isExerDone}},时间：{{localStorageData.times}}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <!--显示做题结果对话框 -->
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">结果</v-card-title>
        <v-card-text>{{dialogMessage}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="goHome">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
var timer;
export default {
  name: "Homework",
  data: () => ({
    localStorageData: {
      onboarding: 0,
      answers: [],
      times: [],
      startTime: "",
      doneList: [], // 储存题目是否已做的布尔值数组
      isExerDone: false,
      isAllDone: false
    },
    exerList: [],
    exerCount: 0,
    endTime: "",
    typeNames: [
      { id: 1, name: "单选题" },
      { id: 2, name: "填空题" },
      { id: 3, name: "实验题" },
      { id: 4, name: "辨析题" },
      { id: 5, name: "计算题" },
      { id: 6, name: "多选题" },
      { id: 7, name: "作图题" },
      { id: 8, name: "简答题" }
    ],
    loading: false,
    submitloading: false,
    dialog: false,
    dialogMessage: ""
  }),
  created: function() {
    this.fetchData();
  },
  computer: {
    answers() {
      return this.localStorageData.answers;
    }
  },
  watch: {
    "localStorageData.answers": {
      handler() {
        //console.log(newValue);
        // 判断此题是否完成
        if (
          this.isEmpty(
            this.localStorageData.answers[this.localStorageData.onboarding]
          )
        ) {
          this.localStorageData.isExerDone = false;
          this.localStorageData.doneList[
            this.localStorageData.onboarding
          ] = false;
        } else {
          this.localStorageData.isExerDone = true;
          // 最后一题"下一题"按钮不可用
          if (this.localStorageData.onboarding === this.exerCount - 1)
            this.localStorageData.isExerDone = false;
          this.localStorageData.doneList[
            this.localStorageData.onboarding
          ] = true;
        }

        // 判断是否完成全部习题，若是则显示提交按钮
        var rightCount = 0;
        for (var i = 0; i < this.localStorageData.doneList.length; i++) {
          if (this.localStorageData.doneList[i] === true) rightCount += 1;
        }
        this.localStorageData.isAllDone = rightCount === this.exerCount;

        localStorage.setItem(
          "localStorageData",
          JSON.stringify(this.localStorageData)
        );
      }
    }
    /*"localStorageData.onboarding": {
      handler() {
        window.localStorage.setItem(
          "localStorageData",
          JSON.stringify(this.localStorageData)
        );
      }
    }*/
  },
  methods: {
    fetchData() {
      this.loading = true;
      // replace getPost with your data fetching util / API wrapper
      this.loadExeres(this.$route.params.homeworkId, () => {
        this.loading = false;
      });
    },
    loadExeres: function(id) {
      this.$axios
        .get("/api/Homework/GetExeresByHomeworkId?homeworkId=" + id)
        .then(response => {
          this.localStorageData.startTime = new Date();

          // 先清空answers组
          this.localStorageData.answers.length = 0;

          this.exerCount = response.data.length;
          for (var i = 0; i < this.exerCount; i++) {
            var Exer = response.data[i];
            // 若是多选题，则在answers数组中添加一个空数组，否则添加空字符串
            if (Exer.typeId == 6) this.localStorageData.answers.push([]);
            else this.localStorageData.answers.push("");

            this.localStorageData.doneList.push(false);
            this.localStorageData.times.push(0);

            // 处理选择题的文本
            var main = Exer.exer;
            // 若是单选题或复选题，则提取选项
            if (Exer.typeId == 1 || Exer.typeId == 6) {
              var start = main.indexOf("<p>（A）"); //获得字符串的开始位置
              // 获取题干
              response.data[i].exer = main.substr(0, start);
              // 将选项分组
              var stemExcluded = main.substr(start);
              var options = stemExcluded.match(/<p>.+?<\/p>/g);
              for (var j = 0; j < options.length; j++) {
                options[j] = options[j].replace("<p>", "");
                options[j] = options[j].replace("</p>", "");
              }
              response.data[i].options = options;
            }
          }
          this.exerList = response.data;

          if (window.localStorage.getItem("localStorageData")) {
            this.localStorageData = JSON.parse(
              localStorage.getItem("localStorageData")
            );
          } else {
            // 将数据保存到localStorge中，用于防止用户刷新或提交失败
            window.localStorage.setItem(
              "localStorageData",
              JSON.stringify(this.localStorageData)
            );
          }

          timer = setInterval(() => {
            this.localStorageData.times[this.localStorageData.onboarding] += 1;
          }, 1000);

          // 设置Mathjax公式
          this.$nextTick(function() {
            //这里要注意，使用$nextTick等组件数据渲染完之后再调用MathJax渲染方法，要不然会获取不到数据
            /*if (this.commonsVariable.isMathjaxConfig) {
              //判断是否初始配置，若无则配置。
              this.commonsVariable.initMathjaxConfig();
            }*/
            this.commonsVariable.MathQueue("exeresWindow"); //传入组件id，让组件被MathJax渲染
            //window.MathQueue("exeresWindow");
          });
        });
    },
    submit: function() {
      this.submitloading = true; //在提交按钮上显示加载

      // 试题编号数组
      var exerIds = this.exerList.map(x => {
        return x.exerId;
      });
      // 试题类型数组
      var typeIds = this.exerList.map(x => {
        return x.typeId;
      });

      // 将answers数组中代表多选题的数组进行转换，例如将[2,1,0]转换为012
      // 还要将数字变为字母，例如012变为ABC
      let l = this.localStorageData.answers.length;
      for (let i = 0; i < l; i++) {
        // 处理单选题答案，将0变为A、1变为B……
        if (typeIds[i] == 1) {
          this.localStorageData.answers[i] = String.fromCharCode(
            this.localStorageData.answers[i] + 65
          );
        }
        // 处理多选题答案
        else if (typeIds[i] == 6) {
          // 将选项数字排序
          this.localStorageData.answers[i] = this.localStorageData.answers[
            i
          ].sort(function(a, b) {
            return a - b;
          });
          // 将选项数字变为字母
          for (let j = 0; j < this.localStorageData.answers[i].length; j++) {
            this.localStorageData.answers[i][j] = String.fromCharCode(
              this.localStorageData.answers[i][j] + 65
            );
          }
          // 最后将字母合并，即将[3,0,1]变为ABD
          this.localStorageData.answers[i] = this.localStorageData.answers[
            i
          ].join("");
        }
      }
      this.$axios
        .post("/api/HomeworkExerResults/Post", {
          classId: this.$store.state.studentInfo.classId,
          homeworkId: this.$route.params.homeworkId,
          studentId: this.$store.state.studentInfo.studentId,
          exerIds: exerIds,
          answers: this.localStorageData.answers,
          startTime: this.dateFormat(this.localStorageData.startTime),
          endTime: this.dateFormat(new Date()),
          times: this.localStorageData.times
        })
        .then(res => {
          /*this.snackbar = true;
          this.snackbarMessage = res.data;*/
          this.submitloading = false;
          this.dialog = true;
          this.dialogMessage =
            "在" +
            res.data.total +
            "道客观题中，你做对了" +
            res.data.right +
            "道，得分率" +
            res.data.scorePercent +
            "，用时" +
            res.data.time +
            "秒";
          localStorage.removeItem("localStorageData");
        });
    },
    //时间格式化函数，此处仅针对yyyy-MM-dd hh:mm:ss 的格式进行格式化
    dateFormat(time) {
      var date = new Date(time);
      var year = date.getFullYear();
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      // 拼接
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
      );
    },

    goHome: function() {
      this.$router.push("/");
    },
    next: function() {
      this.localStorageData.onboarding++;
      if (this.localStorageData.onboarding === this.exerCount - 1) {
        this.localStorageData.isExerDone = false;
        return;
      }
      if (
        this.isEmpty(
          this.localStorageData.answers[this.localStorageData.onboarding]
        )
      ) {
        this.localStorageData.isExerDone = false;
      } else this.localStorageData.isExerDone = true;
    },
    prev: function() {
      this.localStorageData.onboarding--;
      if (
        this.isEmpty(
          this.localStorageData.answers[this.localStorageData.onboarding]
        )
      )
        this.localStorageData.isExerDone = false;
      else this.localStorageData.isExerDone = true;
    },
    isEmpty: function(v) {
      switch (typeof v) {
        case "undefined":
          return true;
        case "string":
          if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
            return true;
          break;
        case "boolean":
          if (!v) return true;
          break;
        case "number":
          if (/*0 === v || */ isNaN(v)) return true;
          break;
        case "object":
          if (null === v || v.length === 0) return true;
          for (var i in v) {
            return false;
          }
          return true;
      }
      return false;
    }
  },
  beforeDestroy() {
    clearInterval(timer);
  }
};
</script>
