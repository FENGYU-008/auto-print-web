<template>
  <div>
    <el-container>
      <el-header>
        <div class="printer-tag">
          <el-button size="small" type="primary" plain @click="getPrinterQueue()">刷新</el-button>
          <el-tag :type="printerTagType">{{ defaultPrinter }}</el-tag>
        </div>
      </el-header>
      <el-main style="display: flex;justify-content: center">
        <el-card class="job-list">
          {{ jobJson }}
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "PrinterState",
  data() {
    return {
      defaultPrinter: '',
      printerTagType: '',
      jobJson: '',
    }
  },
  methods: {
    getDefaultPrinter() {
      this.$axios.get('http://localhost:5000/get_default_printer', {timeout: 2000}).then((resp) => {
        this.defaultPrinter = resp.data;
      }).catch((err) => {
        console.log(err);
        this.defaultPrinter = 'NULL';
        this.printerTagType = 'danger'
      });
    },
    getPrinterQueue() {
      this.$axios.get('http://localhost:5000/enum_jobs', {timeout: 2000}).then((resp) => {
        console.log(resp);
        this.jobJson = JSON.stringify(resp.data.data)
      }).catch((err) => {
        console.log(err);
      })
    },
  },
  mounted() {
    this.getDefaultPrinter()
    this.getPrinterQueue()
  }
}
</script>

<style scoped>
.printer-tag {
  display: flex;
  justify-content: space-between;
}

.job-list {
  width: 70%;
}
</style>