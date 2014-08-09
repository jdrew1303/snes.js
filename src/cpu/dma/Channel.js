function Channel() {
  //$420b
  this.dma_enabled = false; //bool

  //$420c
  this.hdma_enabled = false; //bool

  //$43x0
  this.direction = false; //bool
  this.indirect = false; //bool
  this.unused = false; //bool
  this.reverse_transfer = false; //bool
  this.fixed_transfer = false; //bool
  this.transfer_mode = 0; //uint3

  //$43x1
  this.dest_addr = 0; //uint8

  //$43x2-$43x3
  this.source_addr = 0; //uint16

  //$43x4
  this.source_bank = 0; //uint8

  //$43x5-$43x6
  //these address the same memory space (like C++ union), so store the value once
  //and use 2 getters/setters to handle the values
  //this.transfer_size = 0; //uint16
  //this.indirect_addr = 0; //uint16
  this._indirect_addr = 0;

  //$43x7
  this.indirect_bank = 0; //uint8

  //$43x8-$43x9
  this.hdma_addr = 0; //uint16

  //$43xa
  this.line_counter = 0; //uint8

  //$43xb/$43xf
  this.unknown = 0; //uint8

  //internal state
  this.hdma_completed = false; //bool
  this.hdma_do_transfer = false; //bool
}

Channel.prototype.constructor = Channel;

module.exports = Channel;

Object.defineProperty(Channel.prototype, 'transfer_size', {
    get: function() {
        return this._indirect_addr;
    },
    set: function(val) {
        this._indirect_addr = val;
    }
});

Object.defineProperty(Channel.prototype, 'indirect_addr', {
    get: function() {
        return this._indirect_addr;
    },
    set: function(val) {
        this._indirect_addr = val;
    }
});
