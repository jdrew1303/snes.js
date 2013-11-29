//uint32 to represent a 24-bit register
var Reg24 = function() {
    this._d = 0;
};

Reg24.prototype.constructor = Reg24;

module.exports = Reg24;

Object.defineProperty(Reg24.prototype, 'l', {
    get: function() {
        return this._d & 0x000000ff;
    },
    set: function(val) {
        this._d = (val & 0x000000ff) + (this._d & 0xffffff00);
    }
});

Object.defineProperty(Reg24.prototype, 'h', {
    get: function() {
        return this._d & 0x0000ff00;
    },
    set: function(val) {
        this._d = (val & 0x0000ff00) + (this._d & 0xffff00ff);
    }
});

Object.defineProperty(Reg24.prototype, 'b', {
    get: function() {
        return this._d & 0x00ff0000;
    },
    set: function(val) {
        this._d = (val & 0x00ff0000) + (this._d & 0xff00ffff);
    }
});

Object.defineProperty(Reg24.prototype, 'bh', {
    get: function() {
        return this._d & 0xff000000;
    },
    set: function(val) {
        this._d = (val & 0xff000000) + (this._d & 0x00ffffff);
    }
});

Object.defineProperty(Reg24.prototype, 'w', {
    get: function() {
        return this._d & 0x0000ffff;
    },
    set: function(val) {
        this._d = (val & 0x0000ffff) + (this._d & 0xffff0000);
    }
});

Object.defineProperty(Reg24.prototype, 'wh', {
    get: function() {
        return this._d & 0xffff0000;
    },
    set: function(val) {
        this._d = (val & 0xffff0000) + (this._d & 0x0000ffff);
    }
});

Object.defineProperty(Reg24.prototype, 'd', {
    get: function() {
        return this._d;
    },
    set: function(val) {
        this._d = val & 0xffffffff;
    }
});
