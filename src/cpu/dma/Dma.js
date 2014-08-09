var Channel = require('./Channel');

function Dma(cpu) {
    this.cpu = cpu;

    this.channel = [
        new Channel(), new Channel(),
        new Channel(), new Channel(),
        new Channel(), new Channel(),
        new Channel(), new Channel()
    ];

    this.pipe = {
        valid: true, //bool
        addr: 0, //unsigned
        data: 0, //uint8
    };
};

Dma.prototype.constructor = Dma;

module.exports = Dma;

Dma.prototype.add_clocks = function(clocks) {
    this.cpu.status.dma_clocks += clocks;
    this.cpu.timing.add_clocks(clocks);
};

//=============
//memory access
//=============

Dma.prototype.transfer_valid = function(bbus, abus) {
    //transfers from WRAM to WRAM are invalid; chip only has one address bus
    if(bbus == 0x80 && ((abus & 0xfe0000) == 0x7e0000 || (abus & 0x40e000) == 0x0000)) return false;
    return true;
};

Dma.prototype.addr_valid = function(abus) {
    //A-bus access to B-bus or S-CPU registers are invalid
    if((abus & 0x40ff00) == 0x2100) return false;  //$[00-3f|80-bf]:[2100-21ff]
    if((abus & 0x40fe00) == 0x4000) return false;  //$[00-3f|80-bf]:[4000-41ff]
    if((abus & 0x40ffe0) == 0x4200) return false;  //$[00-3f|80-bf]:[4200-421f]
    if((abus & 0x40ff80) == 0x4300) return false;  //$[00-3f|80-bf]:[4300-437f]
    return true;
};

Dma.prototype.read = function(abus) {
    if(this.addr_valid(abus) == false) return 0x00;
    return this.cpu.sfc.memory.bus.read(abus);
};

//simulate two-stage pipeline for DMA transfers; example:
//cycle 0: read N+0
//cycle 1: write N+0 & read N+1 (parallel; one on A-bus, one on B-bus)
//cycle 2: write N+1 & read N+2 (parallel)
//cycle 3: write N+2
Dma.prototype.write = function(valid, addr, data) {
    if(this.pipe.valid) this.cpu.sfc.memory.bus.write(this.pipe.addr, this.pipe.data);
    this.pipe.valid = valid;
    this.pipe.addr = addr;
    this.pipe.data = data;
};

Dma.prototype.transfer = function(direction, bbus, abus) {
    if(direction == 0) {
        this.add_clocks(4);
        this.cpu.regs.mdr = this.read(abus);
        this.add_clocks(4);
        this.write(this.transfer_valid(bbus, abus), 0x2100 | bbus, this.cpu.regs.mdr);
    } else {
        this.add_clocks(4);
        this.cpu.regs.mdr = this.transfer_valid(bbus, abus) ? this.cpu.sfc.memory.bus.read(0x2100 | bbus) : 0x00;
        this.add_clocks(4);
        this.write(this.addr_valid(abus), abus, this.cpu.regs.mdr);
    }
};

//===================
//address calculation
//===================

Dma.prototype.bbus = function(i, index) {
    switch(this.channel[i].transfer_mode) {
        default:
        case 0: return (this.channel[i].dest_addr);                       //0
        case 1: return (this.channel[i].dest_addr + (index & 1));         //0,1
        case 2: return (this.channel[i].dest_addr);                       //0,0
        case 3: return (this.channel[i].dest_addr + ((index >> 1) & 1));  //0,0,1,1
        case 4: return (this.channel[i].dest_addr + (index & 3));         //0,1,2,3
        case 5: return (this.channel[i].dest_addr + (index & 1));         //0,1,0,1
        case 6: return (this.channel[i].dest_addr);                       //0,0     [2]
        case 7: return (this.channel[i].dest_addr + ((index >> 1) & 1));  //0,0,1,1 [3]
    }
};

Dma.prototype.addr = function(i) {
    var r = (this.channel[i].source_bank << 16) | (this.channel[i].source_addr);

    if(this.channel[i].fixed_transfer == false) {
        if(this.channel[i].reverse_transfer == false) {
            this.channel[i].source_addr++;
        } else {
            this.channel[i].source_addr--;
        }
    }

    return r;
};

Dma.prototype.hdma_addr = function(i) {
    return (this.channel[i].source_bank << 16) | (this.channel[i].hdma_addr++);
};

Dma.prototype.hdma_iaddr = function(i) {
    return (this.channel[i].indirect_bank << 16) | (this.channel[i].indirect_addr++);
};

//==============
//channel status
//==============

Dma.prototype.enabled_channels = function() {
    var r = 0;
    for(var i = 0; i < 8; i++) {
        if(this.channel[i].dma_enabled) r++;
    }
    return r;
};

Dma.prototype.hdma_active = function(unsigned i) {
    return (this.channel[i].hdma_enabled && !this.channel[i].hdma_completed);
};

Dma.prototype.hdma_active_after = function(unsigned i) {
    for(var n = i + 1; n < 8; n++) {
        if(this.hdma_active(n) == true) return true;
    }
    return false;
};

Dma.prototype.hdma_enabled_channels = function() {
    var r = 0;
    for(var i = 0; i < 8; i++) {
        if(this.channel[i].hdma_enabled) r++;
    }
    return r;
};

Dma.prototype.hdma_active_channels = function() {
    var r = 0;
    for(var i = 0; i < 8; i++) {
        if(this.hdma_active(i) == true) r++;
    }
    return r;
};

//==============
//core functions
//==============

Dma.prototype.run = function() {
    this.add_clocks(8);
    this.write(false);
    this.edge();

    for(var i = 0; i < 8; i++) {
        if(this.channel[i].dma_enabled == false) continue;

        var index = 0;
        do {
            this.transfer(this.channel[i].direction, this.bbus(i, index++), this.addr(i));
            this.edge();
        } while(this.channel[i].dma_enabled && --this.channel[i].transfer_size);

        this.add_clocks(8);
        this.write(false);
        this.edge();

        this.channel[i].dma_enabled = false;
    }

    this.cpu.status.irq_lock = true;
};

Dma.prototype.hdma_update = function(unsigned i) {
    this.add_clocks(4);
    this.cpu.regs.mdr = dma_read((this.channel[i].source_bank << 16) | this.channel[i].hdma_addr);
    this.add_clocks(4);
    this.write(false);

    if((this.channel[i].line_counter & 0x7f) == 0) {
        this.channel[i].line_counter = this.cpu.regs.mdr;
        this.channel[i].hdma_addr++;

        this.channel[i].hdma_completed = (this.channel[i].line_counter == 0);
        this.channel[i].hdma_do_transfer = !this.channel[i].hdma_completed;

        if(this.channel[i].indirect) {
            this.add_clocks(4);
            this.cpu.regs.mdr = this.read(this.hdma_addr(i));
            this.channel[i].indirect_addr = this.cpu.regs.mdr << 8;
            this.add_clocks(4);
            this.write(false);

            if(!this.channel[i].hdma_completed || this.hdma_active_after(i)) {
                this.add_clocks(4);
                this.cpu.regs.mdr = this.read(this.hdma_addr(i));
                this.channel[i].indirect_addr >>= 8;
                this.channel[i].indirect_addr |= this.cpu.regs.mdr << 8;
                this.add_clocks(4);
                this.write(false);
            }
        }
    }
};

var transfer_length = [1, 2, 2, 4, 4, 4, 2, 4];
Dma.prototype.hdma_run = function() {
    this.add_clocks(8);
    this.write(false);

    for(var i = 0; i < 8; i++) {
        if(this.hdma_active(i) == false) continue;
        this.channel[i].dma_enabled = false;  //HDMA run during DMA will stop DMA mid-transfer

        if(this.channel[i].hdma_do_transfer) {
            var length = transfer_length[this.channel[i].transfer_mode];
            for(var index = 0; index < length; index++) {
                var addr = this.channel[i].indirect == false ? this.hdma_addr(i) : this.hdma_iaddr(i);
                this.transfer(this.channel[i].direction, this.bbus(i, index), addr);
            }
        }
    }

    for(var i = 0; i < 8; i++) {
        if(this.hdma_active(i) == false) continue;

        this.channel[i].line_counter--;
        this.channel[i].hdma_do_transfer = this.channel[i].line_counter & 0x80;
        this.hdma_update(i);
    }

    this.cpu.status.irq_lock = true;
};

Dma.prototype.hdma_init_reset = function() {
    for(var i = 0; i < 8; i++) {
        this.channel[i].hdma_completed = false;
        this.channel[i].hdma_do_transfer = false;
    }
};

Dma.prototype.hdma_init = function() {
    this.add_clocks(8);
    this.write(false);

    for(var i = 0; i < 8; i++) {
        if(!this.channel[i].hdma_enabled) continue;
        this.channel[i].dma_enabled = false;  //HDMA init during DMA will stop DMA mid-transfer

        this.channel[i].hdma_addr = this.channel[i].source_addr;
        this.channel[i].line_counter = 0;
        this.hdma_update(i);
    }

    this.cpu.status.irq_lock = true;
};

//==============
//initialization
//==============

Dma.prototype.power = function() {
    for(var i = 0; i < 8; i++) {
        this.channel[i].direction = true;
        this.channel[i].indirect = true;
        this.channel[i].unused = true;
        this.channel[i].reverse_transfer = true;
        this.channel[i].fixed_transfer = true;
        this.channel[i].transfer_mode = 7;

        this.channel[i].dest_addr = 0xff;

        this.channel[i].source_addr = 0xffff;
        this.channel[i].source_bank = 0xff;

        this.channel[i].transfer_size = 0xffff;
        this.channel[i].indirect_bank = 0xff;

        this.channel[i].hdma_addr = 0xffff;
        this.channel[i].line_counter = 0xff;
        this.channel[i].unknown = 0xff;
    }
};

Dma.prototype.reset = function() {
    for(var i = 0; i < 8; i++) {
        this.channel[i].dma_enabled = false;
        this.channel[i].hdma_enabled = false;

        this.channel[i].hdma_completed = false;
        this.channel[i].hdma_do_transfer = false;
    }

    this.pipe.valid = false;
    this.pipe.addr = 0;
    this.pipe.data = 0;
};
