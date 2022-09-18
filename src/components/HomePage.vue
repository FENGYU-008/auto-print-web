<template>
  <div>
    <el-container>
      <el-main class="main">
        <el-empty description="这里空空如也，点击底部 + 上传文件吧" v-show="!this.items.length"></el-empty>
        <div v-for="(item,index) in items" :key="item.id">
          <el-card class="box-card" shadow="hover">
            <div slot="header" class="box-header">
              <img src="../assets/icons8-doc-file-format-64.png" class="hidden-xs-only file-icon" alt="file-icon"
                   v-if="item.extension === '.doc' || item.extension === '.docx'">
              <img src="../assets/icons8-pdf-64.png" class="hidden-xs-only file-icon" alt="file-icon"
                   v-if="item.extension === '.pdf'">
              <img src="../assets/icons8-image-gallery-64.png" class="hidden-xs-only file-icon" alt="file-icon"
                   v-if="item.extension === '.jpg' ||item.extension === '.jpeg'|| item.extension === '.png'"
                   width="52px">
              <div style="width: 40px;overflow: hidden;display: inline-block;">
                <span style="color: #606266;">#{{ index + 1 }}</span>
              </div>
              <div class="file-info">
                <el-tooltip effect="dark" :content="item.originFilename" placement="top-start">
                  <div class="filename">
                    {{ item.originFilename }}
                  </div>
                </el-tooltip>
                <div class="print-args">{{ transOptions(index) }}</div>
                <div style="font-size: 14px;color: #f56c6c;">
                  ￥{{ item.price }}
                </div>
              </div>
              <el-button style="float: right; padding: 3px 0" type="text" @click="items.splice(index,1)">
                <i class="el-icon-close"></i>
              </el-button>
            </div>
            <div>
              <span class="status">
                <span :class="{'print-succeed':item.status===-5,'printing':item.status===8208}">
                  {{ transStatus(item.status) }}
                </span>
                <i class="el-icon-loading" style="margin-left: 5px;" v-show="item.status === 8208"></i>
              </span>
              <div style="display: inline-block;float: right;">
                <el-button type="text" style="margin-right:20px;" @click="previewFile(item.newFilename)">
                  <i class="el-icon-printer"></i>
                </el-button>
                <el-button type="text" @click="item.settingDialogVisible = true">
                  <i class="el-icon-setting"></i>
                </el-button>
              </div>
            </div>
          </el-card>

          <el-dialog title="参数设置" :visible.sync="item.settingDialogVisible" :width="dialogWidth">
            <h3 style="margin-bottom: 10px;">{{ item.originFilename }}</h3>
            <el-form :label-position="labelPosition" label-width="150px">
              <el-form-item label="纸型" class="settings-form-item">
                <el-radio-group v-model="item.options.paperSize" size="medium">
                  <el-radio-button label="A4">A4</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="颜色" class="settings-form-item">
                <el-radio-group v-model="item.options.monochrome" size="medium">
                  <el-radio-button :label=true>黑白</el-radio-button>
                  <el-radio-button :label=false>彩色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="单双" class="settings-form-item">
                <el-radio-group v-model="item.options.side" size="medium">
                  <el-radio-button label="simplex">单面</el-radio-button>
                  <el-radio-button label="duplex">双面</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="份数" class="settings-form-item">
                <el-input-number v-model="item.options.copies" :min="1" :max="100"></el-input-number>
              </el-form-item>
              <el-form-item :label="'范围(共' + item.pages + '页)'" class="settings-form-item" :error="formErrorMessage">
                <el-input v-model="item.options.pages" style="width: 180px;"></el-input>
              </el-form-item>
            </el-form>
          </el-dialog>

        </div>
      </el-main>
      <el-footer class="footer">
        <div class="footer-left">
          合计
          <span style="color:#f56c6c;">￥{{ totalAmount }}</span>
        </div>
        <div class="footer-right">
          <el-button type="primary" round @click="startPrint" :disabled="printButtonDisabled">开始打印</el-button>
        </div>
      </el-footer>
      <div class="footer-center">
        <el-button type="primary" circle @click="uploadFiles"><i class="el-icon-plus"></i></el-button>
      </div>
    </el-container>

    <el-dialog title="上传文件" :visible.sync="uploadDialogVisible" :width="dialogWidth">
      <div>
        <el-upload
            ref="upload"
            action="http://localhost:5000/uploader"
            :auto-upload="false"
            multiple
            :on-success="handleSuccess"
            :on-error="handleError"
            accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png">
          <el-button slot="trigger" size="small" type="primary" round>选取文件</el-button>
          <el-button size="small" style="margin-left: 10px;" type="warning" @click="clearFileList" round>
            清空列表
          </el-button>
        </el-upload>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitUpload" plain round>上&nbsp;传</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      dialogWidth: '',
      uploadDialogVisible: false,
      defaultPrinter: '',
      labelPosition: 'left',
      formErrorMessage: '',
      printButtonDisabled: false,
      timer: null,
      items: [],
      totalAmount: 0,
    }
  },
  created() {
    window.onresize = () => {
      this.setDialogWidth();
    }
  },
  mounted() {
    this.setDialogWidth();
    this.getDefaultPrinter();
  },
  methods: {
    setDialogWidth() {
      let clientWidth = document.body.clientWidth;
      if (clientWidth <= 768) {
        this.dialogWidth = '80%';
      } else {
        this.dialogWidth = '40%';
      }
    },
    uploadFiles() {
      this.uploadDialogVisible = true;
    },
    getDefaultPrinter() {
      this.$axios.get('http://localhost:5000/get_default_printer', {timeout: 2000}).then((resp) => {
        this.defaultPrinter = resp.data;
      }).catch((err) => {
        console.log(err);
      });
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleSuccess(resp) {
      this.items.push({
        id: resp.id,
        originFilename: resp.originFilename,
        newFilename: resp.newFilename,
        size: resp.size,
        pages: resp.pages,
        status: -1,
        options: {
          paperSize: 'A4',
          monochrome: true,
          side: 'simplex',
          copies: 1,
          pages: '1-' + resp.pages,
        },
        extension: resp.extension,
        price: 0,
        settingDialogVisible: false,
        jobID: null,
      });
    },
    handleError(err, file) {
      console.log(err);
      this.$notify({
        title: '错误',
        message: file.name + '上传失败',
        type: 'error',
      });
    },
    clearFileList() {
      this.$refs.upload.clearFiles();
    },
    transOptions(index) {
      let options = this.items[index].options;
      let totalPages = this.items[index].pages;
      let ret = '';
      ret += options.paperSize + '/';
      ret += options.monochrome === true ? '黑白/' : '彩色/';
      ret += options.side === 'simplex' ? '单面/' : '双面/';
      ret += totalPages + '页/' + options.copies + '份/' + '范围:' + options.pages + '页';
      return ret;
    },
    transStatus(status) {
      switch (status) {
        case -1:
          return '上传成功';
        case -2:
          return '正在添加到打印队列';
        case -3:
          return '成功添加到打印队列';
        case 8208:
          return '正在打印';
        case -5:
          return '打印成功';
        case 0:
          return '等待打印';
        case 1:
          return '已暂停';
        default :
          return String(status);
      }
    },
    decimal(num, position) {
      let p = 1;
      for (let i = 1; i <= position; i++)
        p = p * 10;
      return Math.round(num * p) / p;
    },
    previewFile(newFilename) {
      window.open('http://localhost:5000/static/files/' + newFilename);
    },
    rangeValidate(range, totalPages) {
      let realPages = 0;
      let patten = /\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*/;
      let result = patten.exec(range);
      if (result === null)
        return false;
      if (result[0] !== result['input'])
        return false;
      let splitResult = result[0].split(',');
      for (const string of splitResult) {
        let x = string.split('-')[0];
        let y = string.split('-')[1];
        if (y !== undefined && x > y || x > totalPages || y > totalPages) {
          return false;
        }
        if (y === undefined) {
          realPages += 1;
        } else {
          realPages += (parseInt(y) - parseInt(x) + 1)
        }
      }
      return realPages;
    },
    clearInterval() {
      window.clearInterval(this.timer);
      this.timer = null;
    },
    async startPrint() {
      // this.printButtonDisabled = true;

      for (const key in this.items) {
        if (this.items[key].status === -1) {
          this.items[key].status = -2;
          await this.$axios({
            method: 'post',
            url: 'http://localhost:5000/print',
            data: {
              filename: this.items[key].newFilename,
              options: this.items[key].options,
            },
          }).then((resp) => {
            this.items[key].status = -3;
            this.items[key].jobID = resp.data.jobID;
            console.log(resp);
          }).catch((err) => {
            console.log(err);
          });
        }
      }

      let lock = false;

      this.timer = window.setInterval(() => {
        window.setTimeout(() => {

          if (!lock) {
            lock = true;

            // for (const key in this.items) {
            //   if (this.items[key].status !== -5) {
            //     this.$axios.get('http://localhost:5000/get_job?jobID=' + this.items[key].jobID)
            //         .then((resp) => {
            //           this.items[key].status = resp.data.status;
            //         });
            //   }
            // }

            this.$axios.get('http://localhost:5000/enum_jobs').then((resp) => {
              let data = resp.data.data;
              for (const key in this.items) {
                let target = this.items[key].jobID;
                let left = 0, right = data.length - 1;
                while (left <= right) {
                  let mid = Math.floor((right - left) / 2) + left;
                  if (data[mid].jobId === target) {
                    this.items[key].status = data[mid].status;
                    break;
                  } else if (data[mid].jobId > target) {
                    right = mid - 1;
                  } else {
                    left = mid + 1;
                  }
                }
                if (left > right) {
                  this.items[key].status = -5;
                }
              }
            }).catch((err) => {
              console.log(err)
            })

            lock = false;
          }

        }, 0);
      }, 1000);


    }
  },
  watch: {
    items: {
      handler(newItems) {
        let total = 0;
        let intervalFlag = false;
        for (const key in newItems) {
          const range = newItems[key].options.pages;
          const realPages = this.rangeValidate(range, newItems[key].pages);
          if (realPages === false) {
            // console.log('范围输入不合法', range);
            this.formErrorMessage = '范围输入不合法';
            this.items[key].price = NaN;
            this.totalAmount = NaN;
            return;
          }
          if (newItems[key].status !== -5) {
            intervalFlag = true;
          }
          this.formErrorMessage = '';
          if (newItems[key].options.monochrome === true && newItems[key].options.side === 'simplex') { // 黑白单面
            this.items[key].price = this.decimal((0.2 * realPages * newItems[key].options.copies), 2);
          } else if (newItems[key].options.monochrome === true && newItems[key].options.side === 'duplex') { // 黑白双面
            this.items[key].price = this.decimal((0.35 * Math.round(realPages / 2) * newItems[key].options.copies), 2);
          } else if (newItems[key].options.monochrome === false && newItems[key].options.side === 'simplex') { // 彩色单面
            this.items[key].price = this.decimal((0.4 * realPages * newItems[key].options.copies), 2);
          } else if (newItems[key].options.monochrome === false && newItems[key].options.side === 'duplex') { // 彩色双面
            this.items[key].price = this.decimal((0.7 * Math.round(realPages / 2) * newItems[key].options.copies), 2);
          }
          total += this.items[key].price;
        }
        this.totalAmount = this.decimal(total, 2);
        if (!intervalFlag) {
          this.clearInterval();
        }
      },
      deep: true
    }
  },
  destroyed() {
    this.clearInterval();
  }
}
</script>

<style scoped>
.main {
  margin-bottom: 50px;
  padding: 20px;
}

.footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  height: 60px;
  box-shadow: 0 -2px 2px -2px rgba(0, 0, 0, 0.2);
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}

.footer-center {
  position: fixed;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}

.box-card {
  margin-bottom: 20px;
  box-shadow: rgba(0, 0, 0, 0.1) 0 1px 2px 0;
  border-radius: 8px;
}

.file-icon {
  vertical-align: middle;
  margin-right: 10px;
}

.file-info {
  display: inline-block;
  vertical-align: middle;
}

.filename, .print-args {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 520px;
}

@media screen and (max-width: 768px) {
  .filename, .print-args {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 250px;
  }
}

.filename {
  color: #303133;
}

.print-args, .status {
  color: #606266;
  font-size: 14px;
}

.print-succeed {
  color: #67C23A;
}

.printing {
  color: #409EFF;
}
</style>