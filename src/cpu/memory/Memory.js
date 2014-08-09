function Memory(cpu) {
    this.cpu = cpu;
}

Memory.prototype.constructor = Memory;

module.exports = Memory;

Memory.prototype.port_read = function(port) {
    return this.cpu.status.port[port];
};

Memory.prototype.port_write = function(port, data) {
    this.cpu.status.port[port] = data;
};

Memory.prototype.op_io = function() {
    this.cpu.status.clock_count = 6;
    this.cpu.dma.edge();
    this.cpu.timing.add_clocks(6);
    this.cpu.alu.edge();
};

Memory.prototype.op_read = function(addr) {
    //debugger.op_read(addr);

    this.cpu.status.clock_count = this.speed(addr);
    this.cpu.dma.edge();
    this.cpu.timing.add_clocks(this.cpu.status.clock_count - 4);
    this.cpu.regs.mdr = this.cpu.sfc.memory.bus.read(addr);
    this.cpu.timing.add_clocks(4);
    this.cpu.alu.edge();
    return this.cpu.regs.mdr;
};

Memory.prototype.op_write = function(addr, data) {
    //debugger.op_write(addr, data);

    this.cpu.alu.edge();
    this.cpu.status.clock_count = this.speed(addr);
    this.cpu.dma.edge();
    this.cpu.timing.add_clocks(this.cpu.status.clock_count);
    this.cpu.sfc.memory.bus.write(addr, this.cpu.regs.mdr = data);
};

Memory.prototype.speed = function(addr) {
    if(addr & 0x408000) {
        if(addr & 0x800000) return this.cpu.status.rom_speed;
        return 8;
    }
    if((addr + 0x6000) & 0x4000) return 8;
    if((addr - 0x4000) & 0x7e00) return 6;
    return 12;
};

Memory.prototype.disassembler_read = function(addr) {
    return this.cpu.sfc.memory.bus.read(addr);
};
