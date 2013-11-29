//uint16 to represent a 16-bit register
var Reg16 = function(val) {
    this._w = 0;
};

Reg16.prototype.constructor = Reg16;

module.exports = Reg16;

Object.defineProperty(Reg16.prototype, 'l', {
    get: function() {
        return this._w & 0x00ff;
    },
    set: function(val) {
        this._w = (this._w & 0xff00) + (val & 0x00ff);
    }
});

Object.defineProperty(Reg16.prototype, 'h', {
    get: function() {
        return this._w & 0xff00;
    },
    set: function(val) {
        this._w = (val & 0xff00) + (this._w & 0x00ff);
    }
});

Object.defineProperty(Reg16.prototype, 'w', {
    get: function() {
        return this._w;
    },
    set: function(val) {
        this._w = val & 0xffff;
    }
});
