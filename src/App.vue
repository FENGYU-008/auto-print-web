<template>
  <div id="app">
    <el-container>
      <el-header style="padding:0;">
        <NavBar/>
      </el-header>
    </el-container>
    <el-main style="padding:0;">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </el-main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";

export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  background: #f6f6f6;
}
</style>
