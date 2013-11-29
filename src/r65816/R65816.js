// 65816 Processor Emulator
var Registers = require('./Registers'),
    OpcodeTable = require('./ops/OpcodeTable'),
    Reg24 = require('./regs/Reg24'),
    opcodes = require('./ops/opcodes'),
    memory = require('./memory/memory');

var R65816 = function() {
    this.regs = new Registers();

    this.aa = new Reg24(); //24-bit reg
    this.rd = new Reg24(); //24-bit reg
    this.sp = 0; //uint8
    this.dp = 0; //uint8

    //the map table that holds which function to run to emulate an opcode
    this.optable = null;

    this.opcodeTables = new OpcodeTable(this);

    /* Virtuals to be overriden by CPU implementation

    virtual void op_io() = 0;
    virtual uint8_t op_read(uint32_t addr) = 0;
    virtual void op_write(uint32_t addr, uint8_t data) = 0;
    virtual void last_cycle() = 0;
    virtual bool interrupt_pending() = 0;
    virtual void op_irq();

    virtual uint8 disassembler_read(uint32 addr) { return 0u; }

    */
};

R65816.prototype.constructor = R65816;

module.exports = R65816;

R65816.prototype.updateTable = function() {
    if(this.regs.e) {
        this.optable = this.opcodeTables.optable_EM;
    } else if(this.regs.p.m) {
        if(this.regs.p.x) {
            this.optable = this.opcodeTables.optable_MX;
        } else {
            this.optable = this.opcodeTables.optable_Mx;
        }
    } else {
        if(this.regs.p.x) {
            this.optable = this.opcodeTables.optable_mX;
        } else {
            this.optable = this.opcodeTables.optable_mx;
        }
    }
};

//virtual functions to be overriden by a CPU implementation
R65816.prototype.op_io              = function()            { /* Virtual, should be overriden */ };
R65816.prototype.op_read            = function(addr)        { /* Virtual, should be overriden */ };
R65816.prototype.op_write           = function(addr, data)  { /* Virtual, should be overriden */ };
R65816.prototype.last_cycle         = function()            { /* Virtual, should be overriden */ };
R65816.prototype.interrupt_pending  = function()            { /* Virtual, should be overriden */ };
//R65816.prototype.op_irq             = function()            { /* Virtual, should be overriden */ };

///////////////////////
// The following use the above virtual functions
///////////////////////

//immediate, 2-cycle opcodes with I/O cycle will become bus read
//when an IRQ is to be triggered immediately after opcode completion.
//this affects the following opcodes:
//  clc, cld, cli, clv, sec, sed, sei,
//  tax, tay, txa, txy, tya, tyx,
//  tcd, tcs, tdc, tsc, tsx, txs,
//  inc, inx, iny, dec, dex, dey,
//  asl, lsr, rol, ror, nop, xce.
R65816.prototype.op_io_irq = function() {
    if(this.interrupt_pending()) {
        //modify I/O cycle to bus read cycle, do not increment PC
        this.op_read(regs.pc.d);
    } else {
        this.op_io();
    }
}

R65816.prototype.op_io_cond2 = function() {
    if(this.regs.d.l != 0x00) {
        this.op_io();
    }
}

R65816.prototype.op_io_cond4 = function(x, y) {
    if(!this.regs.p.x || (x & 0xff00) != (y & 0xff00)) {
        this.op_io();
    }
}

R65816.prototype.op_io_cond6 = function(addr) {
    if(this.regs.e && (this.regs.pc.w & 0xff00) != (addr & 0xff00)) {
        this.op_io();
    }
}

R65816.prototype.op_irq = function() {
    this.op_read(this.regs.pc.d);
    this.op_io();
    if(!this.regs.e) memory.writestack(this.regs.pc.b);
    memory.writestack(this.regs.pc.h);
    memory.writestack(this.regs.pc.l);
    memory.writestack(this.regs.e ? (this.regs.p.value & ~0x10) : this.regs.p.value);
    this.rd.l = this.op_read(this.regs.vector + 0);
    this.regs.pc.b = 0x00;
    this.regs.p.i  = 1;
    this.regs.p.d  = 0;
    this.rd.h = this.op_read(this.regs.vector + 1);
    this.regs.pc.w = this.rd.w;
}