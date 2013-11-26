var StatusFlag = require('./StatusFlag');

var Registers = function() {
    this.pc = 0; //program counter

    this.r = new Array(6); //general registers

    this.a = 0; //accumulator
    this.x = 0; //index 1
    this.y = 0; //index 2
    this.z = 0; //index 3
    this.s = 0; //stack pointer
    this.d = 0; //direct page

    this.p = new StatusFlag(); //processor status

    this.db = 0; //data bank, holds default bank for mem transfers
    this.pb = 0; //program bank

    this.e = false; //emulation mode, if true emulated 6502

    this.irg = false; //IRQ pin (false = low, true = trigger)
    this.wai = false; //raised during wai, cleared after interrupt triggered

    this.mdr = 0; //memory data register
    this.vector = 0; //interrupt vector address
};

module.exports = Registers;
