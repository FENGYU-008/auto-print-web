<template>
  <div>
    <el-menu :default-active="activeIndex" class="nav" mode="horizontal" router>
      <el-menu-item class="hidden-xs-only">
        <img src="../assets/shark.jpg" class="nav-icon" alt="logo">
      </el-menu-item>
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="history">历史记录</el-menu-item>
      <el-menu-item index="state">打印机状态</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      activeIndex: 'home',
    };
  },
  mounted() {
    //解决页面刷新，导航栏高亮消失的问题
    let path = this.$route.path;
    this.activeIndex = path.substring(1, path.length);
  }
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  box-shadow: 0 2px 2px -2px rgba(0, 0, 0, .2);
}

.nav-icon {
  width: 40px;
  border-radius: 40px;
}
</style>