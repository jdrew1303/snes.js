// 65816 Processor Emulator
var Registers = require('./Registers'),
    opcodes = require('./ops/opcodes'),
    Reg24 = require('./regs/Reg24');

var Cpu = function() {
    this.regs = new Registers();

    this.aa = new Reg24(); //24-bit reg
    this.rd = new Reg24(); //24-bit reg
    this.sp = 0; //uint8
    this.dp = 0; //uint8

    //the map table that holds which function to run to emulate an opcode
    this.optable = null;
};

Cpu.prototype.constructor = Cpu;

module.exports = Cpu;

Cpu.prototype.updateTable = function() {
    if(this.regs.e) {
        this.optable = opcodes.tables.OPTABLE_EM;
    } else if(this.regs.p.m) {
        if(this.regs.p.x) {
            this.optable = opcodes.tables.OPTABLE_MX;
        } else {
            this.optable = opcodes.tables.OPTABLE_Mx;
        }
    } else {
        if(this.regs.p.x) {
            this.optable = opcodes.tables.OPTABLE_mX;
        } else {
            this.optable = opcodes.tables.OPTABLE_mx;
        }
    }
};
