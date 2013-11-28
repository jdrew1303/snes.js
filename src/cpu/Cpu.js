// 65816 Processor Emulator
var Registers = require('./Registers'),
    Opcodes = require('./opcodes');

var Cpu = function() {
    this.regs = new Registers();

    this.aa = 0; //24-bit reg
    this.rd = 0; //24-bit reg
    this.sp = 0; //8-bit uint
    this.dp = 0; //8-bit uint

    //the map table that holds which function to run to emulate an opcode
    this.optable = null;
};

Cpu.prototype.constructor = Cpu;

Cpu.prototype.updateTable = function() {
    if(this.regs.e) {
        this.optable = Opcodes.tables.OPTABLE_EM;
    } else if(this.regs.p.m) {
        if(this.regs.p.x) {
            this.optable = Opcodes.tables.OPTABLE_MX;
        } else {
            this.optable = Opcodes.tables.OPTABLE_Mx;
        }
    } else {
        if(this.regs.p.x) {
            this.optable = Opcodes.tables.OPTABLE_mX;
        } else {
            this.optable = Opcodes.tables.OPTABLE_mx;
        }
    }
};
