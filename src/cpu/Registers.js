var StatusFlag = require('./StatusFlag');

var Registers = function() {
    this.pc = 0; //program counter (24-bit)

    this.a = 0; //accumulator (16-bit)
    this.x = 0; //index 1 (16-bit)
    this.y = 0; //index 2 (16-bit)
    this.z = 0; //index 3 (16-bit)
    this.s = 0; //stack pointer (16-bit)
    this.d = 0; //direct page (16-bit)

    this.p = new StatusFlag(); //processor status (8-bit)

    this.db = 0; //data bank, holds default bank for mem transfers (8-bit)
    this.pb = 0; //program bank

    this.e = false; //emulation mode, if true emulated 6502 (true = 6502 emulation mode, false = native mode)

    this.irg = false; //IRQ pin (true = trigger, false = low)
    this.wai = false; //raised during wai, cleared after interrupt triggered (true = waiting for interrupt, false = not)

    this.mdr = 0; //memory data register (8-bit)
    this.vector = 0; //interrupt vector address (16-bit)
};

module.exports = Registers;
