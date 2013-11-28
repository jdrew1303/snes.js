var Status = require('./Status'),
    Reg16 = require('./regs/Reg16'),
    Reg24 = require('./regs/Reg24');

var Registers = function() {
    this.pc = new Reg24(); //program counter (24-bit)

    this.a = new Reg16(); //accumulator (16-bit)
    this.x = new Reg16(); //index 1 (16-bit)
    this.y = new Reg16(); //index 2 (16-bit)
    this.z = new Reg16(); //index 3 (16-bit)
    this.s = new Reg16(); //stack pointer (16-bit)
    this.d = new Reg16(); //direct page (16-bit)

    this.p = new Status(); //processor status (8-bit)

    this.db = 0; //uint8, data bank, holds default bank for mem transfers (8-bit)
    this.pb = 0; //program bank

    this.e = false; //emulation mode, if true emulated 6502 (true = 6502 emulation mode, false = native mode)

    this.irg = false; //IRQ pin (true = trigger, false = low)
    this.wai = false; //raised during wai, cleared after interrupt triggered (true = waiting for interrupt, false = not)

    this.mdr = 0; //uint8, memory data register (8-bit)
    this.vector = 0; //uint16, interrupt vector address (16-bit)
};

module.exports = Registers;
