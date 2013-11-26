// 65816 Processor Emulator
var Registers = require('./Registers');

var Cpu = function() {
    this.regs = new Registers();
    this.aa = 0;
    this.rd = 0;
    this.sp = 0;
    this.dp = 0;

    this.opdata = null;
};

