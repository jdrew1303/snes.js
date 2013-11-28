var Status = function(data) {
    this.n = 0; //Negative, 1 = Negative
    this.v = 0; //Overflow, 1 = Overflow
    this.m = 0; //Accumulator Size, 0 = 16-bit, 1 = 8-bit
    this.x = 0; //Index Register Size, 0 = 16-bit, 1 = 8-bit
    this.d = 0; //Decimal Mode, 1 = Decimal, 0 = Binary
    this.i = 0; //IRQ Disable, 1 = Disabled
    this.z = 0; //Zero, 1 = Result Zero
    this.c = 0; //Carry, 1 = carry

    this._value = 0;

    this.set(data);
};

module.exports = Status;

Status.prototype.MASKS = {
    C: 0x01, //  1, Carry
    Z: 0x02, //  2, Zero
    I: 0x04, //  4, IRQ disable
    D: 0x08, //  8, Decimal
    X: 0x10, // 16, Index Register Size (0 = 16-bit, 1 = 8-bit)
    M: 0x20, // 32, Accumulator Size (0 = 16-bit, 1 = 8-bit)
    V: 0x40, // 64, Overflow
    N: 0x80, //128, Negative
    E: 0x00, //  0, 6502 Emulation Mode
    B: 0x10  // 16, Break (emulation mode only)
};

Status.prototype.set = function(data) {
    data = data || 0;

    n = data & this.MASKS.N;
    v = data & this.MASKS.V;
    m = data & this.MASKS.M;
    x = data & this.MASKS.X;
    d = data & this.MASKS.D;
    i = data & this.MASKS.I;
    z = data & this.MASKS.Z;
    c = data & this.MASKS.C;

    this._value = data;
};

Object.defineProperty(Status.prototype, 'value', {
    get: function() {
        return this._value;
    },
    set: function(val) {
        this.set(val);
    }
});