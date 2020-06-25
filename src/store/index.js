import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({

    state: {
        // 存储token
        token: null,
        studentInfo: {
            studentId: 0,
            classId: 0,
            name: ""
        }
    },

    mutations: {
        setStudentInfo(state, value) {
            state.studentInfo = value;
        },
        
        saveToken(state, token) {
            window.localStorage.setItem('token', token);
            state.token = token;
        },
        logout(state) {
            localStorage.removeItem('token');
            localStorage.removeItem('studentInfo');
            localStorage.removeItem('localStroageData');
            state.token = null;
            state.studentInfo={
                studentId: 0,
                classId: 0,
                name: ""
            };
        }
    }
});

export default store;